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

const BATCH_SIZE = 10_000;

function normalizePlan(plan: string | null): PlanName {
  if (plan === 'starter' || plan === 'pro') {
    return plan;
  }
  return 'free';
}

/**
 * Prune old job events in batches of BATCH_SIZE per team to avoid
 * long-running table locks for teams with millions of events.
 */
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

    // Batch delete in chunks to avoid table locks
    // Select IDs first, then delete by ID (Supabase delete with limit may not work reliably)
    let teamDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: batchIds, error: selectError } = await supabase
        .from('job_events')
        .select('id')
        .in('project_id', projectIds)
        .lt('timestamp', cutoff)
        .order('id', { ascending: true })
        .limit(BATCH_SIZE);

      if (selectError) {
        logger.error({ err: selectError, teamId: team.id, plan }, 'Failed to select batch for retention pruning');
        throw selectError;
      }

      const ids = ((batchIds ?? []) as Array<{ id: number }>).map((r) => r.id);
      if (ids.length === 0) {
        hasMore = false;
        break;
      }

      const { count, error: deleteError } = await supabase
        .from('job_events')
        .delete({ count: 'exact' })
        .in('id', ids);

      if (deleteError) {
        logger.error({ err: deleteError, teamId: team.id, plan }, 'Failed to prune old job events');
        throw deleteError;
      }

      const batchDeleted = count ?? 0;
      teamDeleted += batchDeleted;

      if (ids.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    deletedRows += teamDeleted;
    teamsPruned += 1;
    logger.info({ teamId: team.id, plan, cutoff, deletedRows: teamDeleted }, 'Retention pruning completed for team');
  }

  const result = {
    teamsChecked: teamRows.length,
    teamsPruned,
    deletedRows,
  };

  logger.info(result, 'Retention pruning completed');
  return result;
}
