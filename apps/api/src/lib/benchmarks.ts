/**
 * Queue Health Benchmark Engine
 *
 * Aggregates anonymized queue metrics across all QCanary customers and calculates
 * percentile distributions per queue CATEGORY (not per customer). This creates a
 * data moat — the more customers we have, the better the benchmarks become.
 */

import { supabase } from './supabase';
import { logger } from './logger';

// ── Categories ──────────────────────────────────────────────

export type QueueCategory =
  | 'email'
  | 'payment'
  | 'webhook'
  | 'media-processing'
  | 'data-pipeline'
  | 'notification'
  | 'analytics'
  | 'general';

export const ALL_CATEGORIES: QueueCategory[] = [
  'email',
  'payment',
  'webhook',
  'media-processing',
  'data-pipeline',
  'notification',
  'analytics',
  'general',
];

/**
 * Map a queue name to its benchmark category based on keywords.
 * This is deliberately coarse — it groups queues by their typical purpose
 * so we can compare "email queues" to "email queues" across customers.
 * No individual queue or customer data is ever exposed.
 */
export function categorizeQueue(queueName: string): QueueCategory {
  const name = queueName.toLowerCase();

  if (/\b(email|mail|send|smtp|ses|postmark|sendgrid|resend)\b/.test(name)) return 'email';
  if (/\b(payment|billing|invoice|stripe|charge|refund|checkout|receipt)\b/.test(name)) return 'payment';
  if (/\b(webhook|hook|callback|event.?bus)\b/.test(name)) return 'webhook';
  if (/\b(image|video|media|thumbnail|upload|resize|encode|process.?media)\b/.test(name)) return 'media-processing';
  if (/\b(data|etl|import|export|sync|migration|transform|pipeline|batch)\b/.test(name)) return 'data-pipeline';
  if (/\b(notification|push|alert|notify|sms|fcm|apns)\b/.test(name)) return 'notification';
  if (/\b(report|analytics|aggregate|metric|stats|analytics)\b/.test(name)) return 'analytics';
  return 'general';
}

// ── Percentile Math ────────────────────────────────────────

export interface PercentileResult {
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  p95: number | null;
  mean: number | null;
  stddev: number | null;
  sample_size: number;
}

/**
 * Calculate percentiles, mean, and stddev for a sorted array of numbers.
 * Returns null for all values if the array is empty.
 */
export function calculatePercentiles(values: number[]): PercentileResult {
  const sorted = values.filter((v) => v !== null && v !== undefined && isFinite(v)).sort((a, b) => a - b);

  if (sorted.length === 0) {
    return {
      p10: null, p25: null, p50: null, p75: null, p90: null, p95: null,
      mean: null, stddev: null, sample_size: 0,
    };
  }

  const percentile = (p: number): number => {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  };

  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / sorted.length;
  const stddev = Math.sqrt(variance);

  return {
    p10: percentile(0.10),
    p25: percentile(0.25),
    p50: percentile(0.50),
    p75: percentile(0.75),
    p90: percentile(0.90),
    p95: percentile(0.95),
    mean,
    stddev,
    sample_size: sorted.length,
  };
}

// ── Per-Queue Metrics ──────────────────────────────────────

export interface QueueMetrics {
  queueName: string;
  projectId: string;
  failureRate: number;
  stallRate: number;
  avgDurationMs: number | null;
  durationStddevMs: number | null;
  throughput: number;        // jobs per hour
  retryRate: number | null;  // % of jobs with attempts > 1
}

/**
 * Calculate metrics for a single queue from raw job_events in the last N days.
 */
async function computeQueueMetrics(
  projectId: string,
  queueName: string,
  days: number
): Promise<QueueMetrics | null> {
  const cutoffIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('job_events')
    .select('status, duration_ms, attempts, timestamp')
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .gte('timestamp', cutoffIso)
    .limit(10000);

  if (error) {
    logger.warn({ err: error, projectId, queueName }, 'Failed to fetch events for benchmark');
    return null;
  }

  const events = (data ?? []) as Array<{
    status: string;
    duration_ms: number | null;
    attempts: number | null;
    timestamp: string;
  }>;

  if (events.length === 0) return null;

  let total = 0;
  let completed = 0;
  let failed = 0;
  let stalled = 0;
  const durations: number[] = [];
  let retryJobs = 0;

  let earliestTs = Infinity;
  let latestTs = -Infinity;

  for (const event of events) {
    total++;
    if (event.status === 'completed') completed++;
    else if (event.status === 'failed') failed++;
    else if (event.status === 'stalled') stalled++;

    if (typeof event.duration_ms === 'number' && isFinite(event.duration_ms)) {
      durations.push(event.duration_ms);
    }

    if (typeof event.attempts === 'number' && event.attempts > 1) {
      retryJobs++;
    }

    const ts = new Date(event.timestamp).getTime();
    if (isFinite(ts)) {
      if (ts < earliestTs) earliestTs = ts;
      if (ts > latestTs) latestTs = ts;
    }
  }

  // Time span in hours
  const timeSpanHours = latestTs > earliestTs ? (latestTs - earliestTs) / (1000 * 60 * 60) : 1;

  const failureRate = total > 0 ? failed / total : 0;
  const stallRate = total > 0 ? stalled / total : 0;
  const throughput = timeSpanHours > 0 ? total / timeSpanHours : 0;
  const retryRate = total > 0 ? retryJobs / total : null;

  const avgDurationMs = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : null;

  const durationStddevMs = durations.length > 1
    ? Math.sqrt(durations.reduce((sum, d) => sum + (d - avgDurationMs!) ** 2, 0) / durations.length)
    : null;

  return {
    queueName,
    projectId,
    failureRate,
    stallRate,
    avgDurationMs,
    durationStddevMs,
    throughput,
    retryRate,
  };
}

// ── Metric Names ───────────────────────────────────────────

export const BENCHMARK_METRICS = [
  'failure_rate',
  'stall_rate',
  'avg_duration_ms',
  'duration_stddev_ms',
  'throughput',
  'retry_rate',
] as const;

export type BenchmarkMetric = typeof BENCHMARK_METRICS[number];

// ── Full Benchmark Calculation ─────────────────────────────

const MIN_SAMPLE_SIZE = 5;

/**
 * Main entry point: run the daily benchmark calculation.
 * For each category, collects all queues in that category, computes their
 * metrics, calculates percentiles, and stores the results.
 */
export async function calculateBenchmarks(): Promise<void> {
  logger.info('Starting benchmark calculation...');

  // 1. Get all unique (project_id, queue_name) pairs from job_events
  // We query the hourly metrics table to find active queues (last 7 days)
  const cutoffIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: activeQueues, error: qError } = await supabase
    .from('queue_metrics_hourly')
    .select('project_id, queue_name')
    .gte('hour', cutoffIso);

  if (qError) {
    logger.error({ err: qError }, 'Failed to fetch active queues for benchmarks');
    return;
  }

  const queueEntries = (activeQueues ?? []) as Array<{ project_id: string; queue_name: string }>;
  // Deduplicate by (project_id, queue_name)
  const seen = new Set<string>();
  const uniqueQueues: Array<{ projectId: string; queueName: string }> = [];
  for (const q of queueEntries) {
    const key = `${q.project_id}:${q.queue_name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueQueues.push({ projectId: q.project_id, queueName: q.queue_name });
    }
  }

  logger.info({ totalQueues: uniqueQueues.length }, 'Found queues for benchmark calculation');

  // 2. Group queues by category and compute their metrics
  const categoryMap = new Map<QueueCategory, QueueMetrics[]>();

  for (const { projectId, queueName } of uniqueQueues) {
    const category = categorizeQueue(queueName);
    const metrics = await computeQueueMetrics(projectId, queueName, 7);
    if (metrics) {
      const list = categoryMap.get(category) ?? [];
      list.push(metrics);
      categoryMap.set(category, list);
    }
  }

  // 3. For each category, calculate per-metric percentiles
  const now = new Date().toISOString();
  let totalBenchmarks = 0;

  for (const [category, metricsList] of categoryMap.entries()) {
    if (metricsList.length < MIN_SAMPLE_SIZE) {
      logger.info(
        { category, sampleSize: metricsList.length, minRequired: MIN_SAMPLE_SIZE },
        'Skipping benchmark — insufficient sample size'
      );
      continue;
    }

    const extract = (fn: (m: QueueMetrics) => number | null): number[] =>
      metricsList.map(fn).filter((v): v is number => v !== null && v !== undefined);

    const benchmarks: Array<{
      category: string;
      metric_name: string;
      p10: number | null;
      p25: number | null;
      p50: number | null;
      p75: number | null;
      p90: number | null;
      p95: number | null;
      mean: number | null;
      stddev: number | null;
      sample_size: number;
      calculated_at: string;
    }> = [];

    for (const metricName of BENCHMARK_METRICS) {
      let values: number[];
      switch (metricName) {
        case 'failure_rate':
          values = extract((m) => m.failureRate);
          break;
        case 'stall_rate':
          values = extract((m) => m.stallRate);
          break;
        case 'avg_duration_ms':
          values = extract((m) => m.avgDurationMs);
          break;
        case 'duration_stddev_ms':
          values = extract((m) => m.durationStddevMs);
          break;
        case 'throughput':
          values = extract((m) => m.throughput);
          break;
        case 'retry_rate':
          values = extract((m) => m.retryRate);
          break;
        default:
          continue;
      }

      const result = calculatePercentiles(values);
      if (result.sample_size < MIN_SAMPLE_SIZE) continue;

      benchmarks.push({
        category,
        metric_name: metricName,
        p10: result.p10,
        p25: result.p25,
        p50: result.p50,
        p75: result.p75,
        p90: result.p90,
        p95: result.p95,
        mean: result.mean,
        stddev: result.stddev,
        sample_size: result.sample_size,
        calculated_at: now,
      });
    }

    // 4. Store benchmarks (batch insert)
    if (benchmarks.length > 0) {
      const { error: insertError } = await supabase.from('queue_benchmarks').insert(benchmarks as never);

      if (insertError) {
        logger.error({ err: insertError, category }, 'Failed to store benchmarks');
      } else {
        totalBenchmarks += benchmarks.length;
        logger.info({ category, metricsCount: benchmarks.length, sampleSize: metricsList.length }, 'Benchmarks stored');
      }
    }
  }

  logger.info({ totalBenchmarks }, 'Benchmark calculation complete');
}

// ── Assessment Rules ───────────────────────────────────────

export type Assessment = 'excellent' | 'good' | 'average' | 'warning' | 'critical';

/**
 * Assess a metric value based on its percentile rank.
 * For most metrics, lower percentile = better (failure rate, stall rate, duration).
 * For throughput, higher percentile = better.
 */
export function assessMetric(
  percentile: number,
  metricName: BenchmarkMetric | string
): Assessment {
  const higherIsBetter = metricName === 'throughput';

  if (higherIsBetter) {
    if (percentile >= 90) return 'excellent';
    if (percentile >= 75) return 'good';
    if (percentile >= 25) return 'average';
    if (percentile >= 10) return 'warning';
    return 'critical';
  }

  // Lower is better
  if (percentile <= 10) return 'excellent';
  if (percentile <= 25) return 'good';
  if (percentile <= 75) return 'average';
  if (percentile <= 90) return 'warning';
  return 'critical';
}

/**
 * Generate a human-readable message for a metric comparison.
 */
export function benchmarkMessage(
  metricName: BenchmarkMetric | string,
  percentile: number,
  assessment: Assessment,
  sampleSize: number
): string {
  const better = `Better than ${Math.max(1, 100 - percentile)}% of ${sampleSize} similar queues`;

  if (assessment === 'excellent') {
    return `Excellent — ${better}`;
  }
  if (assessment === 'good') {
    return `Good — ${better}`;
  }
  if (assessment === 'average') {
    return 'Average — typical for this type of queue';
  }
  if (assessment === 'warning') {
    return 'Below average — worth investigating';
  }
  return 'Needs attention — among the lowest performing queues';
}

// ── Benchmark Retrieval ────────────────────────────────────

export interface BenchmarkComparison {
  queue: {
    name: string;
    category: QueueCategory;
    metrics: Record<string, number | null>;
  };
  benchmark: {
    category: QueueCategory;
    sampleSize: number;
    calculatedAt: string | null;
    metrics: Record<string, {
      p10: number | null;
      p25: number | null;
      p50: number | null;
      p75: number | null;
      p90: number | null;
      p95: number | null;
      mean: number | null;
      stddev: number | null;
    }>;
  };
  comparison: Record<string, {
    value: number | null;
    percentile: number;
    assessment: Assessment;
    message: string;
  }>;
}

/**
 * Get the benchmark comparison for a specific queue.
 * Fetches the queue's metrics and the latest stored benchmark for its category.
 */
export async function getBenchmarkForQueue(
  projectId: string,
  queueName: string
): Promise<BenchmarkComparison | { error: string }> {
  const category = categorizeQueue(queueName);

  // 1. Get queue metrics
  const metrics = await computeQueueMetrics(projectId, queueName, 7);
  if (!metrics) {
    return { error: 'Not enough data to calculate benchmarks for this queue' };
  }

  // 2. Get latest benchmarks for this category
  const { data: benchmarkRows, error: bError } = await supabase
    .from('queue_benchmarks')
    .select('*')
    .eq('category', category)
    .order('calculated_at', { ascending: false })
    .limit(BENCHMARK_METRICS.length);

  if (bError) {
    logger.error({ err: bError, category }, 'Failed to fetch benchmarks');
    return { error: 'Failed to load benchmarks' };
  }

  const benchmarkData = (benchmarkRows ?? []) as Array<{
    metric_name: string;
    p10: number | null;
    p25: number | null;
    p50: number | null;
    p75: number | null;
    p90: number | null;
    p95: number | null;
    mean: number | null;
    stddev: number | null;
    sample_size: number;
    calculated_at: string;
  }>;

  if (benchmarkData.length === 0) {
    return { error: `Not enough data yet for ${category} queues. Benchmarks will be available after more data is collected.` };
  }

  const sampleSize = benchmarkData[0].sample_size;
  const calculatedAt = benchmarkData[0].calculated_at;

  // Build benchmark lookup by metric_name
  const benchmarkMap = new Map<string, typeof benchmarkData[0]>();
  for (const row of benchmarkData) {
    benchmarkMap.set(row.metric_name, row);
  }

  // 3. Build comparison for each metric
  const comparison: BenchmarkComparison['comparison'] = {};
  const benchmarkMetrics: BenchmarkComparison['benchmark']['metrics'] = {};
  const queueMetricsMap: Record<string, number | null> = {};

  for (const metricName of BENCHMARK_METRICS) {
    let value: number | null;
    switch (metricName) {
      case 'failure_rate': value = metrics.failureRate; break;
      case 'stall_rate': value = metrics.stallRate; break;
      case 'avg_duration_ms': value = metrics.avgDurationMs; break;
      case 'duration_stddev_ms': value = metrics.durationStddevMs; break;
      case 'throughput': value = metrics.throughput; break;
      case 'retry_rate': value = metrics.retryRate; break;
      default: value = null;
    }

    queueMetricsMap[metricName] = value;
    const bench = benchmarkMap.get(metricName);

    if (bench && value !== null && bench.p10 !== null && bench.p50 !== null) {
      const higherIsBetter = metricName === 'throughput';

      // Estimate percentile: where does this value fall in the distribution?
      let percentile: number;
      if (higherIsBetter) {
        // For throughput, we need to know what % of queues have lower throughput
        // If value >= p95, percentile ~ 95+. Use an approximation
        if (value >= bench.p95!) percentile = 95;
        else if (value >= bench.p90!) percentile = 83;
        else if (value >= bench.p75!) percentile = 67;
        else if (value >= bench.p50!) percentile = 50;
        else if (value >= bench.p25!) percentile = 25;
        else if (value >= bench.p10!) percentile = 10;
        else percentile = 5;
      } else {
        // For lower-is-better, value at p10 means top 10% (excellent)
        if (value <= bench.p10!) percentile = 10;
        else if (value <= bench.p25!) percentile = 25;
        else if (value <= bench.p50!) percentile = 50;
        else if (value <= bench.p75!) percentile = 75;
        else if (value <= bench.p90!) percentile = 90;
        else percentile = 95;
      }

      const assessment = assessMetric(percentile, metricName);
      comparison[metricName] = {
        value,
        percentile,
        assessment,
        message: benchmarkMessage(metricName, percentile, assessment, sampleSize),
      };
    }

    // Build benchmark metrics structure
    if (bench) {
      benchmarkMetrics[metricName] = {
        p10: bench.p10,
        p25: bench.p25,
        p50: bench.p50,
        p75: bench.p75,
        p90: bench.p90,
        p95: bench.p95,
        mean: bench.mean,
        stddev: bench.stddev,
      };
    }
  }

  return {
    queue: {
      name: queueName,
      category,
      metrics: queueMetricsMap,
    },
    benchmark: {
      category,
      sampleSize,
      calculatedAt,
      metrics: benchmarkMetrics,
    },
    comparison,
  };
}
