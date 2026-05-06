import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

type PlanName = 'free' | 'starter' | 'pro';

interface PlanLimits {
  maxProjects: number | null;
  maxQueuesPerProject: number | null;
  maxEventsPerDay: number | null;
  historyDays: number;
}

const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxQueuesPerProject: 3,
    maxEventsPerDay: 10_000,
    historyDays: 3,
  },
  starter: {
    maxProjects: 3,
    maxQueuesPerProject: 10,
    maxEventsPerDay: 100_000,
    historyDays: 30,
  },
  pro: {
    maxProjects: null,
    maxQueuesPerProject: null,
    maxEventsPerDay: null,
    historyDays: 90,
  },
};

interface TeamPlanRow {
  id: string;
  plan: string;
}

function getPlanLimits(plan: string | null): PlanLimits {
  if (plan === 'starter' || plan === 'pro') {
    return PLAN_LIMITS[plan];
  }
  return PLAN_LIMITS.free;
}

function errorResponse(res: Response, code: string, message: string, status = 403): void {
  res.status(status).json({
    success: false,
    error: { code, message },
  });
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
  const teamIdHeader = req.header('x-team-id');
  const teamId = typeof teamIdHeader === 'string' ? teamIdHeader.trim() : '';

  if (!teamId) {
    errorResponse(res, 'UNAUTHORIZED', 'Missing x-team-id header', 401);
    return;
  }

  const team = await getTeamPlan(teamId);
  if (!team) {
    errorResponse(res, 'TEAM_NOT_FOUND', 'Team not found', 404);
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
    errorResponse(res, 'PLAN_LIMIT_CHECK_FAILED', 'Failed to validate project limit', 500);
    return;
  }

  if ((count ?? 0) >= limits.maxProjects) {
    errorResponse(
      res,
      'PLAN_LIMIT_EXCEEDED',
      `Project limit reached for plan ${team.plan}. Upgrade to create more projects.`
    );
    return;
  }

  next();
}

interface TeamAndPlanResult {
  teamId: string;
  plan: string;
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

  return {
    teamId,
    plan: team.plan,
    limits: getPlanLimits(team.plan),
  };
}

export async function enforceDailyEventLimitForProject(
  projectId: string,
  incomingEvents: number
): Promise<{ allowed: boolean; code?: string; message?: string }> {
  const teamPlan = await getTeamAndPlanByProject(projectId);

  if (!teamPlan) {
    return {
      allowed: false,
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found for plan limit evaluation',
    };
  }

  if (teamPlan.limits.maxEventsPerDay === null) {
    return { allowed: true };
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
      code: 'PLAN_LIMIT_CHECK_FAILED',
      message: 'Failed to validate daily event limit',
    };
  }

  const projectedTotal = (count ?? 0) + incomingEvents;
  if (projectedTotal > teamPlan.limits.maxEventsPerDay) {
    return {
      allowed: false,
      code: 'PLAN_LIMIT_EXCEEDED',
      message: `Daily event limit exceeded for plan ${teamPlan.plan}.`,
    };
  }

  return { allowed: true };
}

