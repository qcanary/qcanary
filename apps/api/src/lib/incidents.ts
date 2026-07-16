import { supabase } from './supabase';
import { logger } from './logger';

export interface IncidentEvent {
  queueName: string;
  jobId: string;
  jobName: string | null;
  status: string;
  errorMessage: string | null;
  durationMs: number | null;
  timestamp: string;
}

export interface Incident {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  affectedQueues: string[];
  totalEvents: number;
  failedEvents: number;
  rootCause: string | null;
  events: IncidentEvent[];
}

interface EventRow {
  queue_name: string;
  job_id: string;
  job_name: string | null;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  timestamp: string;
}

export async function detectActiveIncidents(
  projectId: string
): Promise<Incident[]> {
  try {
    // Find recent failure clusters — events with status 'failed' in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentEvents, error } = await supabase
      .from('job_events')
      .select('queue_name, job_id, job_name, status, error_message, duration_ms, timestamp')
      .eq('project_id', projectId)
      .gte('timestamp', oneHourAgo)
      .in('status', ['failed', 'stalled'])
      .order('timestamp', { ascending: true });

    if (error || !recentEvents || recentEvents.length === 0) {
      return [];
    }

    const events = recentEvents as EventRow[];

    // Group failures by time window (5-minute buckets)
    const buckets = new Map<string, EventRow[]>();
    for (const event of events) {
      const time = new Date(event.timestamp);
      const bucketKey = `${Math.floor(time.getTime() / (5 * 60 * 1000)) * 5 * 60 * 1000}`;
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
      buckets.get(bucketKey)!.push(event);
    }

    // Find buckets with 3+ failures (incident threshold)
    const incidents: Incident[] = [];
    let incidentId = 0;

    for (const [, bucketEvents] of buckets) {
      if (bucketEvents.length < 3) continue;

      const affectedQueues = [...new Set(bucketEvents.map((e) => e.queue_name))];
      const startTime = bucketEvents[0].timestamp;
      const endTime = bucketEvents[bucketEvents.length - 1].timestamp;

      // Get all events in this time window (including non-failed for context)
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