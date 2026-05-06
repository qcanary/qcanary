import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();

type Period = '24h' | '7d' | '30d';

interface ProjectOwnershipRecord {
  id: string;
}

interface JobEventRecord {
  id: number;
  project_id: string;
  queue_name: string;
  job_id: string;
  job_name: string | null;
  event_type: string;
  status: string;
  duration_ms: number | null;
  attempts: number | null;
  error_message: string | null;
  error_stack: string | null;
  environment: string | null;
  timestamp: string;
  created_at: string;
}

interface QueueMetricRecord {
  queue_name: string;
  hour: string;
  completed_count: number;
  failed_count: number;
  stalled_count: number;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
  total_jobs: number;
}

function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function requireTeamContext(req: DashboardAuthedRequest, res: Response): string | null {
  const teamId = typeof req.teamId === 'string' ? req.teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

function parsePeriod(value: unknown): Period | null {
  if (value === '24h' || value === '7d' || value === '30d') {
    return value;
  }

  return null;
}

function periodToStartIso(period: Period): string {
  const now = Date.now();
  const lookbackMs =
    period === '24h'
      ? 24 * 60 * 60 * 1000
      : period === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

  return new Date(now - lookbackMs).toISOString();
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

async function ensureProjectOwnership(
  projectId: string,
  teamId: string
): Promise<{ ok: true } | { ok: false; statusCode: number; code: string; message: string }> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  const project = data as ProjectOwnershipRecord | null;

  if (error) {
    return {
      ok: false,
      statusCode: 500,
      code: 'PROJECT_FETCH_FAILED',
      message: 'Failed to validate project',
    };
  }

  if (!project) {
    return {
      ok: false,
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found',
    };
  }

  return { ok: true };
}

router.get('/:id/queues', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const { data, error } = await supabase
    .from('job_events')
    .select(
      'queue_name, status, duration_ms, timestamp'
    )
    .eq('project_id', projectId)
    .order('timestamp', { ascending: false });

  const events = (data ?? []) as Pick<JobEventRecord, 'queue_name' | 'status' | 'duration_ms' | 'timestamp'>[];

  if (error) {
    errorResponse(res, 500, 'QUEUE_LIST_FAILED', 'Failed to fetch queues');
    return;
  }

  const queueMap = new Map<
    string,
    {
      totalJobs: number;
      completed: number;
      failed: number;
      active: number;
      stalled: number;
      durationTotal: number;
      durationSamples: number;
      lastEventAt: string | null;
    }
  >();

  for (const event of events) {
    const current = queueMap.get(event.queue_name) ?? {
      totalJobs: 0,
      completed: 0,
      failed: 0,
      active: 0,
      stalled: 0,
      durationTotal: 0,
      durationSamples: 0,
      lastEventAt: null,
    };

    current.totalJobs += 1;
    if (event.status === 'completed') {
      current.completed += 1;
    } else if (event.status === 'failed') {
      current.failed += 1;
    } else if (event.status === 'active') {
      current.active += 1;
    } else if (event.status === 'stalled') {
      current.stalled += 1;
    }

    if (typeof event.duration_ms === 'number') {
      current.durationTotal += event.duration_ms;
      current.durationSamples += 1;
    }

    if (!current.lastEventAt || event.timestamp > current.lastEventAt) {
      current.lastEventAt = event.timestamp;
    }

    queueMap.set(event.queue_name, current);
  }

  const queues = Array.from(queueMap.entries())
    .map(([queueName, summary]) => {
      const failureRate =
        summary.totalJobs > 0 ? Number(((summary.failed / summary.totalJobs) * 100).toFixed(2)) : 0;
      const avgDurationMs =
        summary.durationSamples > 0 ? Math.round(summary.durationTotal / summary.durationSamples) : null;

      return {
        queueName,
        totalJobs: summary.totalJobs,
        completed: summary.completed,
        failed: summary.failed,
        active: summary.active,
        stalled: summary.stalled,
        failureRate,
        avgDurationMs,
        lastEventAt: summary.lastEventAt,
      };
    })
    .sort((a, b) => {
      const aTs = a.lastEventAt ?? '';
      const bTs = b.lastEventAt ?? '';
      return bTs.localeCompare(aTs);
    });

  res.status(200).json({
    success: true,
    data: { queues },
  });
});

router.get('/:id/queues/:name/metrics', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const queueName = typeof req.params.name === 'string' ? req.params.name : '';
  if (!projectId || !queueName) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id or queue name');
    return;
  }

  const period = parsePeriod(req.query.period);
  if (!period) {
    errorResponse(res, 400, 'INVALID_PERIOD', 'period must be one of: 24h, 7d, 30d');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const startIso = periodToStartIso(period);

  const { data, error } = await supabase
    .from('queue_metrics_hourly')
    .select(
      'queue_name, hour, completed_count, failed_count, stalled_count, avg_duration_ms, p95_duration_ms, total_jobs'
    )
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .gte('hour', startIso)
    .order('hour', { ascending: true });

  const metrics = (data ?? []) as QueueMetricRecord[];

  if (error) {
    errorResponse(res, 500, 'QUEUE_METRICS_FAILED', 'Failed to fetch queue metrics');
    return;
  }

  const totals = metrics.reduce(
    (acc, point) => {
      acc.totalJobs += point.total_jobs;
      acc.completed += point.completed_count;
      acc.failed += point.failed_count;
      acc.stalled += point.stalled_count;
      return acc;
    },
    { totalJobs: 0, completed: 0, failed: 0, stalled: 0 }
  );

  const failureRate =
    totals.totalJobs > 0 ? Number(((totals.failed / totals.totalJobs) * 100).toFixed(2)) : 0;

  res.status(200).json({
    success: true,
    data: {
      queueName,
      period,
      points: metrics.map((metric) => ({
        hour: metric.hour,
        completed: metric.completed_count,
        failed: metric.failed_count,
        stalled: metric.stalled_count,
        totalJobs: metric.total_jobs,
        avgDurationMs: metric.avg_duration_ms,
        p95DurationMs: metric.p95_duration_ms,
      })),
      summary: {
        totalJobs: totals.totalJobs,
        completed: totals.completed,
        failed: totals.failed,
        stalled: totals.stalled,
        failureRate,
      },
    },
  });
});

router.get('/:id/queues/:name/jobs', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const queueName = typeof req.params.name === 'string' ? req.params.name : '';
  if (!projectId || !queueName) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id or queue name');
    return;
  }

  const status = typeof req.query.status === 'string' && req.query.status.trim().length > 0
    ? req.query.status.trim()
    : null;
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = Math.min(parsePositiveInteger(req.query.limit, 20), 100);
  const offset = (page - 1) * limit;

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  let countQuery = supabase
    .from('job_events')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('queue_name', queueName);

  if (status) {
    countQuery = countQuery.eq('status', status);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    errorResponse(res, 500, 'QUEUE_JOBS_COUNT_FAILED', 'Failed to count queue jobs');
    return;
  }

  let dataQuery = supabase
    .from('job_events')
    .select(
      'id, project_id, queue_name, job_id, job_name, event_type, status, duration_ms, attempts, error_message, error_stack, environment, timestamp, created_at'
    )
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    dataQuery = dataQuery.eq('status', status);
  }

  const { data, error } = await dataQuery;
  const jobs = (data ?? []) as JobEventRecord[];

  if (error) {
    errorResponse(res, 500, 'QUEUE_JOBS_FETCH_FAILED', 'Failed to fetch queue jobs');
    return;
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      queueName,
      jobs: jobs.map((job) => ({
        id: job.id,
        jobId: job.job_id,
        jobName: job.job_name,
        eventType: job.event_type,
        status: job.status,
        durationMs: job.duration_ms,
        attempts: job.attempts,
        errorMessage: job.error_message,
        environment: job.environment,
        timestamp: job.timestamp,
        createdAt: job.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        status,
      },
    },
  });
});

router.get('/:id/queues/:name/jobs/:jobId', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const queueName = typeof req.params.name === 'string' ? req.params.name : '';
  const jobId = typeof req.params.jobId === 'string' ? req.params.jobId : '';
  if (!projectId || !queueName || !jobId) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id, queue name, or job id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const { data, error } = await supabase
    .from('job_events')
    .select(
      'id, project_id, queue_name, job_id, job_name, event_type, status, duration_ms, attempts, error_message, error_stack, environment, timestamp, created_at'
    )
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .eq('job_id', jobId)
    .order('timestamp', { ascending: false });

  const rows = (data ?? []) as JobEventRecord[];

  if (error) {
    errorResponse(res, 500, 'JOB_FETCH_FAILED', 'Failed to fetch job details');
    return;
  }

  if (rows.length === 0) {
    errorResponse(res, 404, 'JOB_NOT_FOUND', 'Job not found');
    return;
  }

  const latest = rows[0];

  res.status(200).json({
    success: true,
    data: {
      job: {
        id: latest.id,
        jobId: latest.job_id,
        jobName: latest.job_name,
        queueName: latest.queue_name,
        eventType: latest.event_type,
        status: latest.status,
        durationMs: latest.duration_ms,
        attempts: latest.attempts,
        errorMessage: latest.error_message,
        errorStack: latest.error_stack,
        environment: latest.environment,
        timestamp: latest.timestamp,
        createdAt: latest.created_at,
      },
      history: rows.map((event) => ({
        id: event.id,
        eventType: event.event_type,
        status: event.status,
        durationMs: event.duration_ms,
        attempts: event.attempts,
        errorMessage: event.error_message,
        timestamp: event.timestamp,
      })),
    },
  });
});

export { router as queuesRouter };
