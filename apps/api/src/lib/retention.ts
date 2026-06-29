import { supabase } from './supabase';
import { getPlanLimits, type PlanName } from '../middleware/planLimits';
import { logger } from './logger';

interface TeamPlanRow {
  id: string;
  plan: string | null;
}

interface RetentionPruneResult {
  teamsChecked: number;
  teamsPruned: number;
  deletedRows: number;
}

function normalizePlan(plan: string | null): PlanName {
  if (plan === 'starter' || plan === 'pro') {
    return plan;
  }
  return 'free';
}

export async function pruneOldJobEvents(): Promise<RetentionPruneResult> {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, plan');

  if (teamsError) {
    logger.error({ err: teamsError }, 'Failed to fetch teams for retention pruning');
    throw teamsError;
  }

  let teamsPruned = 0;
  let deletedRows = 0;
  const teamRows = (teams ?? []) as TeamPlanRow[];

  for (const team of teamRows) {
    const plan = normalizePlan(team.plan);
    if (plan === 'pro') {
      continue;
    }

    const limits = getPlanLimits(plan);
    const cutoff = new Date(Date.now() - limits.historyDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('team_id', team.id);

    if (projectsError) {
      logger.error({ err: projectsError, teamId: team.id }, 'Failed to fetch team projects for retention pruning');
      throw projectsError;
    }

    const projectIds = ((projects ?? []) as Array<{ id: string }>).map((project) => project.id);
    if (projectIds.length === 0) {
      continue;
    }

    const { count, error: deleteError } = await supabase
      .from('job_events')
      .delete({ count: 'exact' })
      .in('project_id', projectIds)
      .lt('timestamp', cutoff);

    if (deleteError) {
      logger.error({ err: deleteError, teamId: team.id, plan }, 'Failed to prune old job events');
      throw deleteError;
    }

    const teamDeletedRows = count ?? 0;
    deletedRows += teamDeletedRows;
    teamsPruned += 1;
    logger.info({ teamId: team.id, plan, cutoff, deletedRows: teamDeletedRows }, 'Retention pruning completed for team');
  }

  const result = {
    teamsChecked: teamRows.length,
    teamsPruned,
    deletedRows,
  };

  logger.info(result, 'Retention pruning completed');
  return result;
}
