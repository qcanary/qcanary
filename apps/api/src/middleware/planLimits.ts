import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from './dashboardAuth';
import { errorResponse } from '../lib/responseUtils';

export type PlanName = 'free' | 'solo' | 'team' | 'business';

export interface PlanLimits {
  maxProjects: number | null;
  maxQueuesPerProject: number | null;
  maxEventsPerDay: number | null;
  historyDays: number;
  /** null = unlimited */
  maxAlertRules: number | null;
  allowWebhook: boolean;
  /** Documented for future seat enforcement; not gated in API yet */
  maxMembers: number | null;
}

/** Allow ingest up to this multiplier past the daily limit before hard-rejecting. */
export const EVENT_LIMIT_GRACE_RATIO = 1.2;

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxQueuesPerProject: 1,
    maxEventsPerDay: 5_000,
    historyDays: 1,
    maxAlertRules: 1,
    allowWebhook: false,
    maxMembers: 1,
  },
  solo: {
    maxProjects: 1,
    maxQueuesPerProject: 5,
    maxEventsPerDay: 25_000,
    historyDays: 14,
    maxAlertRules: 2,
    allowWebhook: false,
    maxMembers: 1,
  },
  team: {
    maxProjects: 3,
    maxQueuesPerProject: 10,
    maxEventsPerDay: 100_000,
    historyDays: 30,
    maxAlertRules: null,
    allowWebhook: true,
    maxMembers: 5,
  },
  business: {
    maxProjects: null,
    maxQueuesPerProject: null,
    maxEventsPerDay: null,
    historyDays: 90,
    maxAlertRules: null,
    allowWebhook: true,
    maxMembers: 20,
  },
};

interface TeamPlanRow {
  id: string;
  plan: string;
}

/**
 * Normalize DB / webhook plan strings to the canonical 4 paid+free names.
 * Legacy `starter` → `team`, `pro` → `business`.
 */
export function normalizePlan(plan: string | null | undefined): PlanName {
  if (plan === 'solo' || plan === 'team' || plan === 'business' || plan === 'free') {
    return plan;
  }
  if (plan === 'starter') {
    return 'team';
  }
  if (plan === 'pro') {
    return 'business';
  }
  return 'free';
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

export function getEventHardCap(limit: number): number {
  return Math.floor(limit * EVENT_LIMIT_GRACE_RATIO);
}

export type EventLimitStatus = 'ok' | 'grace' | 'hard_capped';

export function classifyEventUsage(
  used: number,
  limit: number | null
): EventLimitStatus {
  if (limit === null) {
    return 'ok';
  }
  if (used > getEventHardCap(limit)) {
    return 'hard_capped';
  }
  if (used > limit) {
    return 'grace';
  }
  return 'ok';
}

async function getTeamPlan(teamId: string): Promise<TeamPlanRow | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, plan')
    .eq('id', teamId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as TeamPlanRow;
}

export async function enforceProjectLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const teamId = typeof (req as DashboardAuthedRequest).teamId === 'string' ? (req as DashboardAuthedRequest).teamId : '';

  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return;
  }

  const team = await getTeamPlan(teamId);
  if (!team) {
    errorResponse(res, 404, 'TEAM_NOT_FOUND', 'Team not found');
    return;
  }

  const limits = getPlanLimits(team.plan);
  if (limits.maxProjects === null) {
    next();
    return;
  }

  const { count, error } = await supabase
    .from('projects')
    .select('id', { head: true, count: 'exact' })
    .eq('team_id', teamId);

  if (error) {
    errorResponse(res, 500, 'PLAN_LIMIT_CHECK_FAILED', 'Failed to validate project limit');
    return;
  }

  if ((count ?? 0) >= limits.maxProjects) {
    errorResponse(
      res,
      403,
      'PLAN_LIMIT_EXCEEDED',
      `Project limit reached for plan ${normalizePlan(team.plan)}. Upgrade to create more projects.`
    );
    return;
  }

  next();
}

interface TeamAndPlanResult {
  teamId: string;
  plan: PlanName;
  limits: PlanLimits;
}

async function getTeamAndPlanByProject(projectId: string): Promise<TeamAndPlanResult | null> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('team_id')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project) {
    return null;
  }

  const teamId = (project as { team_id: string }).team_id;
  const team = await getTeamPlan(teamId);
  if (!team) {
    return null;
  }

  const plan = normalizePlan(team.plan);
  return {
    teamId,
    plan,
    limits: getPlanLimits(plan),
  };
}

export interface EventLimitCheckResult {
  allowed: boolean;
  status: EventLimitStatus;
  code?: string;
  message?: string;
  eventsUsedToday?: number;
  eventsLimit?: number | null;
  plan?: PlanName;
}

/**
 * Daily event limit with a 20% grace band.
 * - at/under limit → allowed (ok)
 * - over limit, under hard cap (limit × 1.2) → allowed (grace)
 * - over hard cap → rejected (hard_capped)
 */
export async function enforceDailyEventLimitForProject(
  projectId: string,
  incomingEvents: number
): Promise<EventLimitCheckResult> {
  const teamPlan = await getTeamAndPlanByProject(projectId);

  if (!teamPlan) {
    return {
      allowed: false,
      status: 'hard_capped',
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found for plan limit evaluation',
    };
  }

  if (teamPlan.limits.maxEventsPerDay === null) {
    return {
      allowed: true,
      status: 'ok',
      eventsLimit: null,
      plan: teamPlan.plan,
    };
  }

  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  const { count, error } = await supabase
    .from('job_events')
    .select('id', { head: true, count: 'exact' })
    .eq('project_id', projectId)
    .gte('timestamp', startOfDay.toISOString());

  if (error) {
    return {
      allowed: false,
      status: 'hard_capped',
      code: 'PLAN_LIMIT_CHECK_FAILED',
      message: 'Failed to validate daily event limit',
    };
  }

  const eventsUsedToday = count ?? 0;
  const projectedTotal = eventsUsedToday + incomingEvents;
  const limit = teamPlan.limits.maxEventsPerDay;
  const hardCap = getEventHardCap(limit);
  const status = classifyEventUsage(projectedTotal, limit);

  if (projectedTotal > hardCap) {
    return {
      allowed: false,
      status: 'hard_capped',
      code: 'PLAN_LIMIT_EXCEEDED',
      message: `Daily event limit exceeded for plan ${teamPlan.plan} (grace of 20% over ${limit.toLocaleString()}/day has been used). Upgrade or wait until the daily reset.`,
      eventsUsedToday,
      eventsLimit: limit,
      plan: teamPlan.plan,
    };
  }

  return {
    allowed: true,
    status,
    eventsUsedToday,
    eventsLimit: limit,
    plan: teamPlan.plan,
  };
}

/**
 * Reject ingest batches that would introduce new queue names beyond the plan cap.
 */
export async function enforceQueueLimitForProject(
  projectId: string,
  incomingQueueNames: string[]
): Promise<{ allowed: boolean; code?: string; message?: string }> {
  const teamPlan = await getTeamAndPlanByProject(projectId);
  if (!teamPlan) {
    return {
      allowed: false,
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found for plan limit evaluation',
    };
  }

  if (teamPlan.limits.maxQueuesPerProject === null) {
    return { allowed: true };
  }

  const uniqueIncoming = [...new Set(incomingQueueNames.filter((n) => typeof n === 'string' && n.length > 0))];
  if (uniqueIncoming.length === 0) {
    return { allowed: true };
  }

  // Prefer hourly metrics (compact) for distinct queue names; fall back to recent events.
  const { data: metricRows, error: metricsError } = await supabase
    .from('queue_metrics_hourly')
    .select('queue_name')
    .eq('project_id', projectId);

  let existing = new Set<string>();
  if (!metricsError && metricRows) {
    existing = new Set(
      (metricRows as Array<{ queue_name: string }>).map((r) => r.queue_name)
    );
  } else {
    const { data: eventRows, error: eventsError } = await supabase
      .from('job_events')
      .select('queue_name')
      .eq('project_id', projectId)
      .limit(5_000);

    if (eventsError) {
      return {
        allowed: false,
        code: 'PLAN_LIMIT_CHECK_FAILED',
        message: 'Failed to validate queue limit',
      };
    }

    existing = new Set(
      ((eventRows ?? []) as Array<{ queue_name: string }>).map((r) => r.queue_name)
    );
  }
  const maxQueues = teamPlan.limits.maxQueuesPerProject;
  const newQueues = uniqueIncoming.filter((name) => !existing.has(name));

  if (existing.size + newQueues.length > maxQueues) {
    return {
      allowed: false,
      code: 'QUEUE_LIMIT_EXCEEDED',
      message: `Queue limit reached for plan ${teamPlan.plan} (${maxQueues} queue${maxQueues === 1 ? '' : 's'}). Upgrade to monitor more queues.`,
    };
  }

  return { allowed: true };
}

export async function getTeamPlanLimitsByTeamId(teamId: string): Promise<{
  plan: PlanName;
  limits: PlanLimits;
} | null> {
  const team = await getTeamPlan(teamId);
  if (!team) {
    return null;
  }
  const plan = normalizePlan(team.plan);
  return { plan, limits: getPlanLimits(plan) };
}

export async function getTeamPlanLimitsByProjectId(projectId: string): Promise<{
  plan: PlanName;
  limits: PlanLimits;
} | null> {
  return getTeamAndPlanByProject(projectId);
}
