/**
 * POST /v1/ingest — Job event ingestion endpoint
 */

import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { alertQueue } from '../lib/redis';
import type { Database, JobEventInsert } from '../types/database';
import type { AuthenticatedRequest } from '../middleware/auth';
import { validateApiKey } from '../middleware/auth';
import { ingestRateLimit } from '../middleware/rateLimit';
import { enforceDailyEventLimitForProject, enforceQueueLimitForProject } from '../middleware/planLimits';
import { insertRows, callRpc } from '../lib/typedSupabase';
import { logger } from '../lib/logger';

const MAX_BATCH_SIZE = 500;

interface IngestEventPayload {
  queueName: string;
  jobId: string;
  jobName?: string;
  eventType: string;
  status: string;
  durationMs?: number;
  attempts?: number;
  errorMessage?: string;
  errorStack?: string;
  delayMs?: number;
  environment: string;
  timestamp: string;
  payload?: unknown;
}

interface IngestRequestBody {
  events: IngestEventPayload[];
}

type UpsertQueueMetricsArgs =
  Database['public']['Functions']['upsert_queue_metrics_hourly']['Args'];

const router = express.Router();

router.post(
  '/',
  validateApiKey,
  ingestRateLimit,
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = authReq.projectId;

    if (!projectId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authenticated project context',
        },
      });
      return;
    }

    const parseResult = parseIngestBody(req.body);

    if (!parseResult.ok) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error,
        },
      });
      return;
    }

    const events = parseResult.value.events;

    if (events.length > MAX_BATCH_SIZE) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BATCH_SIZE_EXCEEDED',
          message: `Batch size limit exceeded: max ${MAX_BATCH_SIZE} events per request`,
        },
      });
      return;
    }

    const queueNames = events.map((e) => e.queueName);
    const queueLimit = await enforceQueueLimitForProject(projectId, queueNames);
    if (!queueLimit.allowed) {
      res.status(403).json({
        success: false,
        error: {
          code: queueLimit.code ?? 'QUEUE_LIMIT_EXCEEDED',
          message: queueLimit.message ?? 'Queue limit exceeded',
        },
      });
      return;
    }

    const planLimit = await enforceDailyEventLimitForProject(projectId, events.length);
    if (!planLimit.allowed) {
      res.status(403).json({
        success: false,
        error: {
          code: planLimit.code ?? 'PLAN_LIMIT_EXCEEDED',
          message: planLimit.message ?? 'Plan limit exceeded',
        },
      });
      return;
    }

    if (planLimit.status === 'grace') {
      logger.warn(
        {
          projectId,
          plan: planLimit.plan,
          eventsUsedToday: planLimit.eventsUsedToday,
          eventsLimit: planLimit.eventsLimit,
        },
        'Project ingesting within daily event grace period (20% overage)'
      );
    }

    // Respond immediately, then process asynchronously
    res.status(200).json({
      success: true,
      data: {
        accepted: events.length,
        eventLimitStatus: planLimit.status,
      },
    });

    try {
      await processEvents(projectId, events);
    } catch (err) {
      logger.error({ err }, 'Event processing failed');
    }
  }
);

export function parseIngestBody(body: unknown): { ok: true; value: IngestRequestBody } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Partial<IngestRequestBody>;

  if (!Array.isArray(candidate.events)) {
    return { ok: false, error: 'Missing or invalid "events" array' };
  }

  if (candidate.events.length === 0) {
    return { ok: false, error: 'Events array must not be empty' };
  }

  const normalizedEvents: IngestEventPayload[] = [];

  for (let i = 0; i < candidate.events.length; i++) {
    const evt = candidate.events[i] as Partial<IngestEventPayload> | null | undefined;

    if (!evt || typeof evt !== 'object') {
      return { ok: false, error: `Event at index ${i} must be an object` };
    }

    if (typeof evt.queueName !== 'string' || evt.queueName.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "queueName"` };
    }
    if (evt.queueName.length > 100) {
      return { ok: false, error: `Event at index ${i}: "queueName" exceeds max length of 100 chars` };
    }

    if (typeof evt.jobId !== 'string') {
      return { ok: false, error: `Event at index ${i} has invalid "jobId"` };
    }
    if (evt.jobId.length > 100) {
      return { ok: false, error: `Event at index ${i}: "jobId" exceeds max length of 100 chars` };
    }

    if (typeof evt.eventType !== 'string' || evt.eventType.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "eventType"` };
    }
    if (evt.eventType.length > 50) {
      return { ok: false, error: `Event at index ${i}: "eventType" exceeds max length of 50 chars` };
    }

    if (typeof evt.status !== 'string' || evt.status.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "status"` };
    }
    if (evt.status.length > 50) {
      return { ok: false, error: `Event at index ${i}: "status" exceeds max length of 50 chars` };
    }

    if (typeof evt.environment !== 'string' || evt.environment.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "environment"` };
    }

    if (typeof evt.timestamp !== 'string' || Number.isNaN(Date.parse(evt.timestamp))) {
      return { ok: false, error: `Event at index ${i} has invalid "timestamp"` };
    }

    if (evt.durationMs !== undefined && typeof evt.durationMs !== 'number') {
      return { ok: false, error: `Event at index ${i} has invalid "durationMs"` };
    }

    if (evt.attempts !== undefined && typeof evt.attempts !== 'number') {
      return { ok: false, error: `Event at index ${i} has invalid "attempts"` };
    }

    const jobName = typeof evt.jobName === 'string' && evt.jobName.length > 255
      ? evt.jobName.slice(0, 255)
      : evt.jobName;

    normalizedEvents.push({
      queueName: evt.queueName,
      jobId: evt.jobId,
      jobName,
      eventType: evt.eventType,
      status: evt.status,
      durationMs: evt.durationMs,
      attempts: evt.attempts,
      errorMessage: evt.errorMessage,
      errorStack: evt.errorStack,
      delayMs: evt.delayMs,
      environment: evt.environment,
      timestamp: evt.timestamp,
      payload: evt.payload,
    });
  }

  return { ok: true, value: { events: normalizedEvents } };
}

async function processEvents(projectId: string, events: IngestEventPayload[]): Promise<void> {
  try {
    const jobInserts: JobEventInsert[] = events.map((event) => ({
      project_id: projectId,
      queue_name: event.queueName,
      job_id: event.jobId,
      job_name: event.jobName ?? null,
      event_type: event.eventType,
      status: event.status,
      duration_ms: event.durationMs ?? null,
      attempts: event.attempts ?? null,
      error_message: event.errorMessage ?? null,
      error_stack: event.errorStack ?? null,
      environment: event.environment,
      timestamp: new Date(event.timestamp).toISOString(),
    }));

    if (jobInserts.length > 0) {
      const { error: insertError } = await insertRows('job_events', jobInserts);

      if (insertError) {
        logger.error({ err: insertError }, 'Failed to insert job_events batch');
      }
    }

    await updateQueueMetrics(projectId, events);
    await enqueueAlertEvaluation(projectId, events);
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error processing ingest events');
  }
}

/**
 * Aggregated metrics update — batches events by (queueName, hourBucket)
 * to make a single RPC call per unique bucket instead of one per event.
 */
async function updateQueueMetrics(projectId: string, events: IngestEventPayload[]): Promise<void> {
  if (events.length === 0) {
    return;
  }

  // Aggregate: key = queueName|hourBucket -> accumulated counts
  type BucketKey = string;
  type AggregatedMetrics = {
    completed: number;
    failed: number;
    stalled: number;
    total: number;
    durationMsSum: number;
    durationMsCount: number;
  };

  const bucketMap = new Map<BucketKey, AggregatedMetrics>();

  for (const event of events) {
    const hourBucket = getHourBucket(event.timestamp);
    const key = `${event.queueName}|${hourBucket}`;

    let agg = bucketMap.get(key);
    if (!agg) {
      agg = { completed: 0, failed: 0, stalled: 0, total: 0, durationMsSum: 0, durationMsCount: 0 };
      bucketMap.set(key, agg);
    }

    agg.total += 1;
    if (event.status === 'completed') agg.completed += 1;
    else if (event.status === 'failed') agg.failed += 1;
    else if (event.status === 'stalled') agg.stalled += 1;

    if (typeof event.durationMs === 'number') {
      agg.durationMsSum += event.durationMs;
      agg.durationMsCount += 1;
    }
  }

  const rpcCalls: Promise<unknown>[] = [];

  for (const [key, agg] of bucketMap) {
    const [queueName, hour] = key.split('|');
    const avgDurationMs = agg.durationMsCount > 0 ? agg.durationMsSum / agg.durationMsCount : null;

    const args: UpsertQueueMetricsArgs = {
      p_project_id: projectId,
      p_queue_name: queueName,
      p_hour: hour,
      p_completed: agg.completed,
      p_failed: agg.failed,
      p_stalled: agg.stalled,
      p_duration_ms: avgDurationMs,
      p_total: agg.total,
    };

    rpcCalls.push(Promise.resolve(callRpc('upsert_queue_metrics_hourly', args)));
  }

  const results = await Promise.allSettled(rpcCalls);

  for (const result of results) {
    if (result.status === 'rejected') {
      logger.error({ err: result.reason }, 'Failed to update queue metrics');
    }
  }
}

async function enqueueAlertEvaluation(projectId: string, events: IngestEventPayload[]): Promise<void> {
  if (events.length === 0) {
    return;
  }

  const queueNames = Array.from(new Set(events.map((e) => e.queueName)));

  try {
    await alertQueue.add('evaluate-alerts', {
      projectId,
      queueNames,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to enqueue alert evaluation job');
  }
}

function getHourBucket(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const bucket = new Date(Date.UTC(year, month, day, hour, 0, 0, 0));
  return bucket.toISOString();
}

export { router as ingestRouter };
