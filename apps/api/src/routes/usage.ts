import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';
import { getPlanLimits, type PlanName } from '../middleware/planLimits';
import { logger } from '../lib/logger';

const router = express.Router();

function errorResponse(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function normalizePlan(plan: string | null): PlanName {
  if (plan === 'starter' || plan === 'pro') {
    return plan;
  }
  return 'free';
}

router.get('/', async (req: Request, res: Response) => {
  const teamId = typeof (req as DashboardAuthedRequest).teamId === 'string'
    ? (req as DashboardAuthedRequest).teamId
    : '';

  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return;
  }

  try {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('plan')
      .eq('id', teamId)
      .maybeSingle();

    if (teamError || !team) {
      errorResponse(res, 500, 'TEAM_FETCH_FAILED', 'Failed to fetch team plan');
      return;
    }

    const plan = normalizePlan((team as { plan: string | null }).plan);
    const limits = getPlanLimits(plan);

    const { data: projects, count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId);

    if (projectsError) {
      errorResponse(res, 500, 'PROJECT_USAGE_FETCH_FAILED', 'Failed to fetch project usage');
      return;
    }

    const projectIds = ((projects ?? []) as Array<{ id: string }>).map((project) => project.id);
    let eventsUsedToday = 0;

    if (projectIds.length > 0) {
      const now = new Date();
      const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const { count: eventsCount, error: eventsError } = await supabase
        .from('job_events')
        .select('id', { head: true, count: 'exact' })
        .in('project_id', projectIds)
        .gte('timestamp', startOfDay.toISOString());

      if (eventsError) {
        errorResponse(res, 500, 'EVENT_USAGE_FETCH_FAILED', 'Failed to fetch event usage');
        return;
      }

      eventsUsedToday = eventsCount ?? 0;
    }

    res.status(200).json({
      success: true,
      data: {
        plan,
        usage: {
          projectsUsed: projectsCount ?? projectIds.length,
          projectsLimit: limits.maxProjects,
          eventsUsedToday,
          eventsLimit: limits.maxEventsPerDay,
        },
      },
    });
  } catch (error) {
    logger.error({ err: error, teamId }, 'Usage fetch failed');
    errorResponse(res, 500, 'USAGE_FETCH_FAILED', 'Failed to fetch usage');
  }
});

export { router as usageRouter };
