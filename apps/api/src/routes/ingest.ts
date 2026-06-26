/**
 * POST /v1/ingest — Job event ingestion endpoint
 * Session 7 implementation
 */

import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { alertQueue } from '../lib/redis';
import type { Database, JobEventInsert } from '../types/database';
import type { AuthenticatedRequest } from '../middleware/auth';
import { validateApiKey } from '../middleware/auth';
import { ingestRateLimit } from '../middleware/rateLimit';
import { enforceDailyEventLimitForProject } from '../middleware/planLimits';

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

    res.status(200).json({
      success: true,
      data: {
        accepted: events.length,
      },
    });

    try {
      await processEvents(projectId, events);
    } catch (err) {
      console.error('[ingest] event processing failed:', err);
    }
  }
);

function parseIngestBody(body: unknown): { ok: true; value: IngestRequestBody } | { ok: false; error: string } {
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

    if (typeof evt.jobId !== 'string') {
      return { ok: false, error: `Event at index ${i} has invalid "jobId"` };
    }

    if (typeof evt.eventType !== 'string' || evt.eventType.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "eventType"` };
    }

    if (typeof evt.status !== 'string' || evt.status.length === 0) {
      return { ok: false, error: `Event at index ${i} has invalid "status"` };
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

    normalizedEvents.push({
      queueName: evt.queueName,
      jobId: evt.jobId,
      jobName: evt.jobName,
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
      const { error: insertError } = await supabase
        .from('job_events')
        .insert(jobInserts as any);

      if (insertError) {
        // eslint-disable-next-line no-console
        console.error('Failed to insert job_events batch', insertError);
      }
    }

    await updateQueueMetrics(projectId, events);
    await enqueueAlertEvaluation(projectId, events);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error while processing ingest events', error);
  }
}

async function updateQueueMetrics(projectId: string, events: IngestEventPayload[]): Promise<void> {
  if (events.length === 0) {
    return;
  }

  const metricsCalls: Promise<unknown>[] = [];

  for (const event of events) {
    const hourBucket = getHourBucket(event.timestamp);

    const args: UpsertQueueMetricsArgs = {
      p_project_id: projectId,
      p_queue_name: event.queueName,
      p_hour: hourBucket,
      p_completed: event.status === 'completed' ? 1 : 0,
      p_failed: event.status === 'failed' ? 1 : 0,
      p_stalled: event.status === 'stalled' ? 1 : 0,
      p_duration_ms: event.durationMs ?? null,
      p_total: 1,
    };

    const call = (supabase.rpc as any)('upsert_queue_metrics_hourly', args) as Promise<unknown>;
    metricsCalls.push(call);
  }

  const results = await Promise.allSettled(metricsCalls);

  for (const result of results) {
    if (result.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('Failed to update queue metrics', result.reason);
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
    // eslint-disable-next-line no-console
    console.error('Failed to enqueue alert evaluation job', error);
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

