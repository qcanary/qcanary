import { supabase } from './supabase';
import { logger } from './logger';

interface EventRow {
  queue_name: string;
  job_id: string;
  job_name: string | null;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  timestamp: string;
}

export interface Incident {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string;
  affectedQueues: string[];
  totalEvents: number;
  failedEvents: number;
  rootCause: string | null;
  events: Array<{
    queueName: string;
    jobId: string;
    jobName: string | null;
    status: string;
    errorMessage: string | null;
    durationMs: number | null;
    timestamp: string;
  }>;
}

const INCIDENT_BUCKET_MS = 5 * 60 * 1000; // 5 minutes
const INCIDENT_THRESHOLD = 3;

/**
 * Detect active incidents for a project by analyzing recent failures.
 * Groups failed/stalled events into 5-minute buckets and identifies
 * buckets with 3+ failures as potential incidents.
 */
export async function detectActiveIncidents(projectId: string): Promise<Incident[]> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Single query: fetch all failed/stalled events in the last hour
    const { data: events, error } = await supabase
      .from('job_events')
      .select('queue_name, job_id, job_name, status, error_message, duration_ms, timestamp')
      .eq('project_id', projectId)
      .in('status', ['failed', 'stalled'])
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: true });

    if (error) {
      logger.error({ err: error, projectId }, 'Failed to query job events for incidents');
      return [];
    }

    const failedEvents = (events ?? []) as EventRow[];
    if (failedEvents.length === 0) return [];

    // Group into 5-minute buckets
    const buckets = new Map<string, EventRow[]>();
    for (const event of failedEvents) {
      const time = new Date(event.timestamp);
      const bucketKey = `${Math.floor(time.getTime() / INCIDENT_BUCKET_MS) * INCIDENT_BUCKET_MS}`;
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
      buckets.get(bucketKey)!.push(event);
    }

    // Find buckets with 3+ failures (incident threshold)
    const incidents: Incident[] = [];
    let incidentId = 0;

    for (const [, bucketEvents] of buckets) {
      if (bucketEvents.length < INCIDENT_THRESHOLD) continue;

      const affectedQueues = [...new Set(bucketEvents.map((e) => e.queue_name))];
      const startTime = bucketEvents[0].timestamp;
      const endTime = bucketEvents[bucketEvents.length - 1].timestamp;

      // Fetch context events (all events in this time window, not just failed)
      const { data: contextEvents } = await supabase
        .from('job_events')
        .select('queue_name, job_id, job_name, status, error_message, duration_ms, timestamp')
        .eq('project_id', projectId)
        .gte('timestamp', startTime)
        .lte('timestamp', endTime)
        .order('timestamp', { ascending: true });

      const contextRows = (contextEvents ?? []) as EventRow[];

      // Find root cause — most common error message
      const errorMessages = bucketEvents
        .filter((e) => e.error_message)
        .map((e) => e.error_message!);
      const errorCounts = new Map<string, number>();
      for (const msg of errorMessages) {
        errorCounts.set(msg, (errorCounts.get(msg) ?? 0) + 1);
      }
      const rootCause = errorCounts.size > 0
        ? [...errorCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : null;

      incidents.push({
        id: `inc-${projectId}-${incidentId++}`,
        projectId,
        startTime,
        endTime,
        affectedQueues,
        totalEvents: contextRows.length,
        failedEvents: bucketEvents.length,
        rootCause,
        events: contextRows.map((e) => ({
          queueName: e.queue_name,
          jobId: e.job_id,
          jobName: e.job_name,
          status: e.status,
          errorMessage: e.error_message,
          durationMs: e.duration_ms,
          timestamp: e.timestamp,
        })),
      });
    }

    return incidents;
  } catch (err) {
    logger.error({ err, projectId }, 'Failed to detect incidents');
    return [];
  }
}
