import { supabase } from './supabase';
import { logger } from './logger';

export type AnomalyType = 'spike' | 'drop' | 'stall' | 'latency';
export type AnomalySeverity = 'warning' | 'critical';

export interface Anomaly {
  queueName: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  currentValue: number;
  baselineValue: number;
  deviation: number; // how many standard deviations from baseline
  detectedAt: string;
}

interface MetricBaseline {
  mean: number;
  stdDev: number;
  sampleSize: number;
}

interface EventRow {
  queue_name: string;
  status: string;
  duration_ms: number | null;
  timestamp: string;
}

function calculateBaseline(values: number[]): MetricBaseline | null {
  if (values.length < 3) return null;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev, sampleSize: values.length };
}

function isAnomaly(current: number, baseline: MetricBaseline, threshold = 2): boolean {
  if (baseline.stdDev === 0) return current !== baseline.mean;
  return Math.abs(current - baseline.mean) > threshold * baseline.stdDev;
}

export async function detectAnomalies(
  projectId: string
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get current hour's events
    const { data: currentEvents } = await supabase
      .from('job_events')
      .select('queue_name, status, duration_ms, timestamp')
      .eq('project_id', projectId)
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false });

    if (!currentEvents || currentEvents.length === 0) return [];

    const currentRows = currentEvents as EventRow[];

    // Get historical baselines (last 7 days, same hour)
    const { data: historicalEvents } = await supabase
      .from('job_events')
      .select('queue_name, status, duration_ms, timestamp')
      .eq('project_id', projectId)
      .gte('timestamp', sevenDaysAgo)
      .lt('timestamp', oneHourAgo);

    if (!historicalEvents || historicalEvents.length === 0) return [];

    const historicalRows = historicalEvents as EventRow[];

    // Group by queue
    const queues = new Set(currentRows.map((e) => e.queue_name));

    for (const queueName of queues) {
      const currentQueue = currentRows.filter((e) => e.queue_name === queueName);
      const historicalQueue = historicalRows.filter((e) => e.queue_name === queueName);

      // Metric 1: Failure rate
      const currentFailed = currentQueue.filter((e) => e.status === 'failed').length;
      const currentCompleted = currentQueue.filter((e) => e.status === 'completed').length;
      const currentFailureRate = currentFailed / (currentFailed + currentCompleted || 1);

      const historicalFailureRates: number[] = [];
      const histByDay = new Map<string, EventRow[]>();
      for (const e of historicalQueue) {
        const day = e.timestamp.slice(0, 10);
        if (!histByDay.has(day)) histByDay.set(day, []);
        histByDay.get(day)!.push(e);
      }
      for (const [, dayEvents] of histByDay) {
        const f = dayEvents.filter((e) => e.status === 'failed').length;
        const c = dayEvents.filter((e) => e.status === 'completed').length;
        historicalFailureRates.push(f / (f + c || 1));
      }

      const failureBaseline = calculateBaseline(historicalFailureRates);
      if (failureBaseline && isAnomaly(currentFailureRate, failureBaseline, 2)) {
        anomalies.push({
          queueName,
          type: 'spike',
          severity: currentFailureRate > 0.5 ? 'critical' : 'warning',
          message: `Failure rate spike: ${(currentFailureRate * 100).toFixed(1)}% (baseline: ${(failureBaseline.mean * 100).toFixed(1)}%)`,
          currentValue: currentFailureRate,
          baselineValue: failureBaseline.mean,
          deviation: Math.abs(currentFailureRate - failureBaseline.mean) / (failureBaseline.stdDev || 1),
          detectedAt: now.toISOString(),
        });
      }

      // Metric 2: Throughput drop
      const currentThroughput = currentQueue.length;
      const historicalThroughputs: number[] = [];
      for (const [, dayEvents] of histByDay) {
        historicalThroughputs.push(dayEvents.length);
      }

      const throughputBaseline = calculateBaseline(historicalThroughputs);
      if (throughputBaseline && currentThroughput < throughputBaseline.mean * 0.3 && throughputBaseline.mean > 10) {
        anomalies.push({
          queueName,
          type: 'drop',
          severity: currentThroughput === 0 ? 'critical' : 'warning',
          message: `Throughput drop: ${currentThroughput} events (baseline: ${Math.round(throughputBaseline.mean)})`,
          currentValue: currentThroughput,
          baselineValue: throughputBaseline.mean,
          deviation: (throughputBaseline.mean - currentThroughput) / (throughputBaseline.stdDev || 1),
          detectedAt: now.toISOString(),
        });
      }

      // Metric 3: Latency spike
      const currentDurations = currentQueue
        .filter((e) => e.duration_ms != null)
        .map((e) => e.duration_ms!);
      const currentAvgDuration = currentDurations.length > 0
        ? currentDurations.reduce((a, b) => a + b, 0) / currentDurations.length
        : null;

      const historicalDurations: number[] = [];
      for (const e of historicalQueue) {
        if (e.duration_ms != null) historicalDurations.push(e.duration_ms);
      }

      const durationBaseline = calculateBaseline(historicalDurations);
      if (durationBaseline && currentAvgDuration !== null && isAnomaly(currentAvgDuration, durationBaseline, 2.5)) {
        anomalies.push({
          queueName,
          type: 'latency',
          severity: currentAvgDuration > durationBaseline.mean * 3 ? 'critical' : 'warning',
          message: `Latency spike: ${currentAvgDuration.toFixed(0)}ms (baseline: ${durationBaseline.mean.toFixed(0)}ms)`,
          currentValue: currentAvgDuration,
          baselineValue: durationBaseline.mean,
          deviation: Math.abs(currentAvgDuration - durationBaseline.mean) / (durationBaseline.stdDev || 1),
          detectedAt: now.toISOString(),
        });
      }
    }

    return anomalies.sort((a, b) => b.deviation - a.deviation);
  } catch (err) {
    logger.error({ err, projectId }, 'Failed to detect anomalies');
    return [];
  }
}
