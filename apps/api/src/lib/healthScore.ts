import { supabase } from './supabase';
import { logger } from './logger';

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface QueueHealthScore {
  queueName: string;
  grade: HealthGrade;
  score: number; // 0-100
  failureRate: number;
  avgDurationMs: number | null;
  throughput: number; // jobs per hour
  lastEventAt: string | null;
}

export async function calculateQueueHealthScores(
  projectId: string
): Promise<QueueHealthScore[]> {
  try {
    // Get last 24 hours of events
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from('job_events')
      .select('queue_name, status, duration_ms, timestamp')
      .eq('project_id', projectId)
      .gte('timestamp', twentyFourHoursAgo)
      .order('timestamp', { ascending: false });

    if (error || !events || events.length === 0) {
      return [];
    }

    const typedEvents = events as Array<{
      queue_name: string;
      status: string;
      duration_ms: number | null;
      timestamp: string;
    }>;

    // Group by queue
    const queueMap = new Map<string, typeof typedEvents>();
    for (const event of typedEvents) {
      const queue = event.queue_name;
      if (!queueMap.has(queue)) queueMap.set(queue, []);
      queueMap.get(queue)!.push(event);
    }

    const scores: QueueHealthScore[] = [];

    for (const [queueName, queueEvents] of queueMap) {
      const total = queueEvents.length;
      const failed = queueEvents.filter((e) => e.status === 'failed').length;
      const completed = queueEvents.filter((e) => e.status === 'completed').length;
      const durations = queueEvents
        .filter((e) => e.duration_ms != null)
        .map((e) => e.duration_ms!);

      const failureRate = total > 0 ? failed / (failed + completed || 1) : 0;
      const avgDurationMs = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : null;
      const throughput = total; // events in 24h
      const lastEventAt = queueEvents[0]?.timestamp ?? null;

      // Calculate score (0-100)
      let score = 100;

      // Failure rate penalty (0-40 points)
      score -= Math.min(40, failureRate * 100);

      // Stale penalty (0-30 points)
      if (lastEventAt) {
        const hoursSinceLastEvent = (Date.now() - new Date(lastEventAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastEvent > 2) score -= Math.min(30, hoursSinceLastEvent * 2);
      }

      // Duration penalty (0-20 points) — if avg > 5s, start penalizing
      if (avgDurationMs && avgDurationMs > 5000) {
        score -= Math.min(20, (avgDurationMs - 5000) / 1000);
      }

      // Throughput bonus (0-10 points) — active queues get a small boost
      if (throughput > 100) score = Math.min(100, score + 5);
      if (throughput > 1000) score = Math.min(100, score + 5);

      score = Math.max(0, Math.min(100, Math.round(score)));

      // Convert to grade
      let grade: HealthGrade;
      if (score >= 90) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 40) grade = 'D';
      else grade = 'F';

      scores.push({
        queueName,
        grade,
        score,
        failureRate,
        avgDurationMs,
        throughput,
        lastEventAt,
      });
    }

    return scores.sort((a, b) => a.score - b.score); // worst first
  } catch (err) {
    logger.error({ err, projectId }, 'Failed to calculate queue health scores');
    return [];
  }
}
