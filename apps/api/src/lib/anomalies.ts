/**
 * Rule-Based Anomaly Detection Engine
 *
 * Detects queue problems BEFORE they become incidents using statistical
 * rules based on historical baselines. No ML required.
 *
 * ## How it works
 *
 * 1. Baselines are calculated hourly from the last 7 days of data,
 *    grouped by the same hour of day + day of week.
 * 2. 6 detection rules compare current metrics against baselines.
 * 3. Anomalies are auto-generated alerts (type: 'anomaly') that use
 *    the same delivery channels as user-configured alert rules.
 * 4. A minimum sample size of 3 days is required before generating anomalies.
 *
 * ## Integration
 *
 * - Called from the alert worker after user rules are evaluated.
 * - Anomaly results are logged to alert_history with type 'anomaly'.
 * - Dashboard polls getAnomalyStatus() for badge rendering.
 */

import { supabase } from './supabase';
import { logger } from './logger';
import type {
  AnomalyBaselineInsert,
  AnomalyBaselineRow,
  AnomalyDetectionResult,
  AnomalyMetricName,
  AnomalyRule,
  AnomalySeverity,
  AnomalySettings,
  JobEventRow,
  QueueAnomalyStatus,
  SensitivityLevel,
} from '../types/database';
import { getSensitivityMultiplier } from '../types/database';

// ── Minimum sample size for valid baselines ────────────────
const MIN_SAMPLE_SIZE = 3;
const BASELINE_LOOKBACK_DAYS = 7;

// ============================================================
// ANOMALY RULES (6 detection rules)
// ============================================================

/**
 * Rule 1: Throughput Drop
 * IF: current_hour_throughput < baseline_throughput * 0.5
 * AND: baseline_throughput > 0
 * THEN: "Throughput dropped 50% below normal. Queue may be stalled."
 * SEVERITY: warning
 */
/**
 * Create a threshold multiplier from the baseline multiplier and a sensitivity factor.
 * Higher sensitivity = lower multiplier = more sensitive to deviations.
 * Lower sensitivity = higher multiplier = less sensitive to deviations.
 */
function scaleThreshold(baseMultiplier: number, sensitivity: number): number {
  // sensitivity is a multiplier that scales how aggressive the threshold is
  // sensitivity 1.0 = normal, 1.5 = relaxed (higher threshold), 0.8 = aggressive (lower threshold)
  // We want: aggressive (sensitivity=1.2) -> lower thresholds (more sensitive)
  //          relaxed (sensitivity=2.0) -> higher thresholds (less sensitive)
  // So we scale the base multiplier inversely with sensitivity
  return baseMultiplier / sensitivity;
}

const throughputDropRule: AnomalyRule = {
  name: 'Throughput Drop',
  description: 'Throughput dropped 50% below normal. Queue may be stalled.',
  metric: 'throughput',
  severity: 'warning',
  min_jobs_threshold: 0,
  check(current, baseline, sensitivity) {
    if (baseline.mean <= 0) return { anomalous: false, baseline_value: baseline.mean };
    // With sensitivity=1.5 (normal): threshold = mean * 0.5 →
    // Aggressive (sens=1.2): threshold = mean * 0.42 (fires earlier)
    // Relaxed (sens=2.0): threshold = mean * 0.25 (fires later)
    const effectiveMultiplier = scaleThreshold(0.5, sensitivity);
    const threshold = baseline.mean * effectiveMultiplier;
    return {
      anomalous: current < threshold,
      baseline_value: baseline.mean,
    };
  },
};

/**
 * Rule 2: Failure Rate Spike
 * IF: current_hour_failure_rate > baseline_failure_rate * 3
 * AND: baseline_failure_rate > 0
 * AND: current_hour_total_jobs > 10
 * THEN: "Failure rate is 3x higher than normal. Check for broken workers or bad data."
 * SEVERITY: critical
 */
const failureRateSpikeRule: AnomalyRule = {
  name: 'Failure Rate Spike',
  description: 'Failure rate is 3x higher than normal. Check for broken workers or bad data.',
  metric: 'failure_rate',
  severity: 'critical',
  min_jobs_threshold: 10,
  check(current, baseline, sensitivity) {
    if (baseline.mean <= 0) return { anomalous: false, baseline_value: baseline.mean };
    const effectiveMultiplier = scaleThreshold(3, sensitivity);
    const threshold = baseline.mean * effectiveMultiplier;
    return {
      anomalous: current > threshold,
      baseline_value: baseline.mean,
    };
  },
};

/**
 * Rule 3: Queue Depth Spike
 * IF: current_queue_depth > baseline_max_depth * 2
 * AND: current_queue_depth > 100
 * THEN: "Queue depth is 2x higher than normal. Workers may not be keeping up."
 * SEVERITY: warning
 */
const queueDepthSpikeRule: AnomalyRule = {
  name: 'Queue Depth Spike',
  description: 'Queue depth is 2x higher than normal. Workers may not be keeping up.',
  metric: 'queue_depth',
  severity: 'warning',
  min_jobs_threshold: 100,
  check(current, baseline, sensitivity) {
    const effectiveMultiplier = scaleThreshold(2, sensitivity);
    const threshold = Math.max(baseline.max * effectiveMultiplier, 100);
    return {
      anomalous: current > threshold,
      baseline_value: baseline.max,
    };
  },
};

/**
 * Rule 4: Duration Spike
 * IF: current_hour_avg_duration > baseline_avg_duration * 2
 * AND: current_hour_total_jobs > 10
 * THEN: "Job duration is 2x slower than normal. Check for external API slowdowns."
 * SEVERITY: warning
 */
const durationSpikeRule: AnomalyRule = {
  name: 'Duration Spike',
  description: 'Job duration is 2x slower than normal. Check for external API slowdowns or resource issues.',
  metric: 'avg_duration',
  severity: 'warning',
  min_jobs_threshold: 10,
  check(current, baseline, sensitivity) {
    if (baseline.mean <= 0) return { anomalous: false, baseline_value: baseline.mean };
    const effectiveMultiplier = scaleThreshold(2, sensitivity);
    const threshold = baseline.mean * effectiveMultiplier;
    return {
      anomalous: current > threshold,
      baseline_value: baseline.mean,
    };
  },
};

/**
 * Rule 5: Zero Activity (Dead Queue)
 * IF: no_events_in_last_30_minutes
 * AND: baseline shows activity in same time window (last 7 days)
 * THEN: "No activity detected in the last 30 minutes. Queue may be down."
 * SEVERITY: critical
 */
const zeroActivityRule: AnomalyRule = {
  name: 'Zero Activity',
  description: 'No activity detected in the last 30 minutes. Queue may be down or workers stopped.',
  metric: 'throughput',
  severity: 'critical',
  min_jobs_threshold: 0,
  check(current, baseline, _sensitivity) {
    // current = events in last 30 min, baseline.mean = expected events
    if (baseline.mean <= 0) return { anomalous: false, baseline_value: baseline.mean };
    return {
      anomalous: current === 0 && baseline.mean > 0,
      baseline_value: baseline.mean,
    };
  },
};

/**
 * Rule 6: Retry Storm
 * IF: current_hour_retry_rate > 0.3 (30% of jobs need retries)
 * AND: current_hour_total_jobs > 20
 * THEN: "30% of jobs are failing and being retried. Check for systemic failures."
 * SEVERITY: critical
 */
const retryStormRule: AnomalyRule = {
  name: 'Retry Storm',
  description: '30% of jobs are failing and being retried. Check for systemic failures.',
  metric: 'retry_rate',
  severity: 'critical',
  min_jobs_threshold: 20,
  check(current, baseline, sensitivity) {
    if (baseline.mean <= 0) return { anomalous: false, baseline_value: baseline.mean };
    const effectiveMultiplier = scaleThreshold(0.3, sensitivity);
    // For retry storm, we check if current exceeds the threshold
    // Scaling: aggressive makes fire earlier by lowering the threshold
    const threshold = 0.3 / sensitivity;
    return {
      anomalous: current > threshold,
      baseline_value: baseline.mean,
    };
  },
};

/** All registered anomaly rules */
export const ALL_ANOMALY_RULES: AnomalyRule[] = [
  throughputDropRule,
  failureRateSpikeRule,
  queueDepthSpikeRule,
  durationSpikeRule,
  zeroActivityRule,
  retryStormRule,
];

// ============================================================
// STATISTICAL HELPERS
// ============================================================

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

// ============================================================
// BASELINE CALCULATION
// ============================================================

interface BaselineInput {
  project_id: string;
  queue_name: string;
}

/**
 * Calculate statistical baselines for all active queues.
 *
 * For each queue, computes baselines for throughput, failure_rate,
 * queue_depth, avg_duration, and retry_rate — grouped by hour and
 * day_of_week over the last 7 days.
 *
 * Called hourly by the cron job.
 */
export async function calculateBaselinesForAllQueues(): Promise<void> {
  logger.info('[Anomaly] Starting baseline calculation for all active queues...');

  // Get all unique (project_id, queue_name) pairs from recent events
  const cutoffIso = new Date(Date.now() - BASELINE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: activeQueues, error: qError } = await supabase
    .from('job_events')
    .select('project_id, queue_name')
    .gte('timestamp', cutoffIso);

  if (qError) {
    logger.error({ err: qError }, '[Anomaly] Failed to fetch active queues for baselines');
    return;
  }

  const seen = new Set<string>();
  const unique: BaselineInput[] = [];
  for (const row of (activeQueues ?? []) as BaselineInput[]) {
    const key = `${row.project_id}:${row.queue_name}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(row);
    }
  }

  logger.info({ queueCount: unique.length }, '[Anomaly] Calculating baselines');

  for (const { project_id, queue_name } of unique) {
    try {
      await calculateBaselinesForQueue(project_id, queue_name);
    } catch (err) {
      logger.error({ err, projectId: project_id, queueName: queue_name }, '[Anomaly] Failed to calculate baseline for queue');
    }
  }

  logger.info({ queueCount: unique.length }, '[Anomaly] Baseline calculation complete');
}

/**
 * Calculate baselines for a single queue across all hours.
 * Groups data by hour ONLY (not day_of_week) so we get 7 samples per metric
 * from the last 7 days of the same hour.
 */
async function calculateBaselinesForQueue(projectId: string, queueName: string): Promise<void> {
  const cutoffIso = new Date(Date.now() - BASELINE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all events in the last 7 days for this queue
  const { data, error } = await supabase
    .from('job_events')
    .select('status, duration_ms, attempts, timestamp')
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .gte('timestamp', cutoffIso);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  const events = (data ?? []) as Pick<JobEventRow, 'status' | 'duration_ms' | 'attempts' | 'timestamp'>[];

  if (events.length === 0) return;

  // Group events by hour (only hour — not day_of_week).
  // This gives us all data for the same hour over the last 7 days,
  // providing up to 7 samples per metric for statistical baselines.
  const grouped = new Map<number, Array<{
    status: string;
    duration_ms: number | null;
    attempts: number | null;
    timestamp: string;
  }>>();
  
  for (const event of events) {
    const date = new Date(event.timestamp);
    const hour = date.getUTCHours();
    const bucket = grouped.get(hour) ?? [];
    bucket.push(event);
    grouped.set(hour, bucket);
  }

  const baselines: AnomalyBaselineInsert[] = [];

  for (const [hour, bucket] of grouped.entries()) {
    // Compute per-DAY metrics for this hour bucket.
    // We have data from up to 7 different days for this same hour.
    // We compute one aggregate metric per day, then compute statistics across days.
    
    // Further group by day to get per-day samples
    const byDay = new Map<string, typeof bucket>();
    for (const event of bucket) {
      const dayStr = event.timestamp.slice(0, 10); // YYYY-MM-DD
      const dayBucket = byDay.get(dayStr) ?? [];
      dayBucket.push(event);
      byDay.set(dayStr, dayBucket);
    }

    // Compute per-day metric values
    const throughputs: number[] = [];
    const failureRates: number[] = [];
    const avgDurations: number[] = [];
    const retryRates: number[] = [];
    const depths: number[] = [];

    for (const dayEvents of byDay.values()) {
      let total = 0;
      let failed = 0;
      let completed = 0;
      let stalled = 0;
      let inFlight = 0;
      const durations: number[] = [];
      let retryCount = 0;

      for (const event of dayEvents) {
        total++;
        if (event.status === 'completed') completed++;
        else if (event.status === 'failed') failed++;
        else if (event.status === 'stalled') stalled++;
        else if (['active', 'waiting', 'delayed'].includes(event.status)) inFlight++;

        if (typeof event.duration_ms === 'number' && isFinite(event.duration_ms)) {
          durations.push(event.duration_ms);
        }
        if (typeof event.attempts === 'number' && event.attempts > 1) {
          retryCount++;
        }
      }

      if (total === 0) continue;

      throughputs.push(total);
      failureRates.push(failed / total);
      depths.push(inFlight + stalled);
      retryRates.push(retryCount / total);

      if (durations.length > 0) {
        avgDurations.push(mean(durations));
      }
    }

    // Compute statistics across days for each metric
    const metricData: Array<{ name: AnomalyMetricName; values: number[] }> = [
      { name: 'throughput', values: throughputs },
      { name: 'failure_rate', values: failureRates },
      { name: 'queue_depth', values: depths },
      { name: 'avg_duration', values: avgDurations },
      { name: 'retry_rate', values: retryRates },
    ];

    for (const { name: metricName, values } of metricData) {
      if (values.length < 2) continue; // Need at least 2 days of data

      const sorted = [...values].sort((a, b) => a - b);

      baselines.push({
        project_id: projectId,
        queue_name: queueName,
        hour,
        metric_name: metricName,
        mean_value: Number(mean(values).toFixed(4)),
        median_value: Number(percentile(sorted, 0.5).toFixed(4)),
        max_value: Number(max(values).toFixed(4)),
        min_value: Number(min(values).toFixed(4)),
        sample_size: values.length,
      });
    }
  }

  // Batch upsert baselines
  if (baselines.length > 0) {
    // Delete existing baselines for this queue
    const { error: delError } = await supabase
      .from('anomaly_baselines')
      .delete()
      .eq('project_id', projectId)
      .eq('queue_name', queueName);

    if (delError) {
      logger.error({ err: delError, projectId, queueName }, '[Anomaly] Failed to delete old baselines');
      return;
    }

    // Insert new baselines in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < baselines.length; i += BATCH_SIZE) {
      const batch = baselines.slice(i, i + BATCH_SIZE);
      const { error: insError } = await supabase
        .from('anomaly_baselines')
        .insert(batch as never[]);

      if (insError) {
        logger.error({ err: insError, projectId, queueName }, '[Anomaly] Failed to insert baselines');
      }
    }
  }
}

// ============================================================
// ANOMALY DETECTION
// ============================================================

interface CurrentMetrics {
  /** Throughput count in the current window */
  throughput: number;
  /** Failure rate (0-1) in the current window */
  failure_rate: number;
  /** Approximate queue depth */
  queue_depth: number;
  /** Average job duration in ms */
  avg_duration: number;
  /** Retry rate (0-1) */
  retry_rate: number;
  /** Total jobs in current window (for min_jobs_threshold checks) */
  total_jobs: number;
}

/**
 * Detect anomalies for a specific queue by running all 6 rules
 * against the current metrics and stored baselines.
 */
export async function detectAnomalies(
  projectId: string,
  queueName: string,
  settings: AnomalySettings = { enabled: true, sensitivity: 'normal', min_sample_days: 3 }
): Promise<QueueAnomalyStatus> {
  if (!settings.enabled) {
    return { status: 'healthy', anomalies: [], building_baseline: false };
  }

  const now = new Date();
  const currentHour = now.getUTCHours();

  // Fetch baseline for current hour (grouped across last 7 days)
  const { data: baselineRows, error: baselineError } = await supabase
    .from('anomaly_baselines')
    .select('*')
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .eq('hour', currentHour);

  if (baselineError) {
    logger.error({ err: baselineError, projectId, queueName }, '[Anomaly] Failed to fetch baselines');
    return { status: 'building_baseline', anomalies: [], building_baseline: true };
  }

  const baselines = (baselineRows ?? []) as AnomalyBaselineRow[];

  // Check if we have enough data
  const validBaselines = baselines.filter((b) => b.sample_size >= MIN_SAMPLE_SIZE);
  if (validBaselines.length < 3) {
    return { status: 'building_baseline', anomalies: [], building_baseline: true };
  }

  // Compute current metrics
  const currentMetrics = await computeCurrentMetrics(projectId, queueName);

  // Build baseline lookup
  const baselineMap = new Map<string, AnomalyBaselineRow>();
  for (const b of baselines) {
    baselineMap.set(b.metric_name, b);
  }

  const sensitivityMultiplier = getSensitivityMultiplier(settings.sensitivity);
  const anomalies: AnomalyDetectionResult[] = [];

  for (const rule of ALL_ANOMALY_RULES) {
    const baseline = baselineMap.get(rule.metric);
    if (!baseline) continue;

    // Skip zero-activity check if there's no baseline for this hour
    if (rule.name === 'Zero Activity' && baseline.sample_size < 1) continue;

    // Skip if min_jobs_threshold not met
    if (currentMetrics.total_jobs < rule.min_jobs_threshold) continue;

    const currentValue = getCurrentMetricValue(rule.metric, currentMetrics, projectId, queueName);

    const { anomalous, baseline_value } = rule.check(currentValue, {
      mean: baseline.mean_value,
      median: baseline.median_value,
      max: baseline.max_value,
      min: baseline.min_value,
      sample_size: baseline.sample_size,
    }, sensitivityMultiplier);

    if (anomalous) {
      const deviation = baseline_value > 0
        ? Number((currentValue / baseline_value).toFixed(1))
        : 0;

      anomalies.push({
        rule_name: rule.name,
        rule_description: rule.description,
        severity: rule.severity,
        metric_name: rule.metric,
        current_value: Number(currentValue.toFixed(4)),
        baseline_value: Number(baseline_value.toFixed(4)),
        threshold_multiplier: deviation,
        queue_name: queueName,
      });
    }
  }

  // Determine overall status
  const status = determineAnomalyStatus(anomalies);
  return { status, anomalies, building_baseline: false };
}

/**
 * Compute current metrics for a queue in the last 30 minutes (for anomaly detection).
 */
async function computeCurrentMetrics(
  projectId: string,
  queueName: string
): Promise<CurrentMetrics> {
  const windowMs = 30 * 60 * 1000; // 30 min window
  const cutoffIso = new Date(Date.now() - windowMs).toISOString();

  const { data, error } = await supabase
    .from('job_events')
    .select('status, duration_ms, attempts, timestamp')
    .eq('project_id', projectId)
    .eq('queue_name', queueName)
    .gte('timestamp', cutoffIso);

  if (error) {
    throw new Error(`Failed to fetch current metrics: ${error.message}`);
  }

  const events = (data ?? []) as Pick<JobEventRow, 'status' | 'duration_ms' | 'attempts' | 'timestamp'>[];

  let total = 0;
  let failed = 0;
  let completed = 0;
  let active = 0;
  let stalled = 0;
  const durations: number[] = [];
  let retryCount = 0;

  for (const event of events) {
    total++;
    if (event.status === 'completed') completed++;
    else if (event.status === 'failed') failed++;
    else if (event.status === 'stalled') stalled++;
    else if (['active', 'waiting', 'delayed'].includes(event.status)) active++;

    if (typeof event.duration_ms === 'number' && isFinite(event.duration_ms)) {
      durations.push(event.duration_ms);
    }
    if (typeof event.attempts === 'number' && event.attempts > 1) {
      retryCount++;
    }
  }

  // Scale throughput to hourly rate
  const timeSpanHours = 0.5; // 30 minutes
  const hourlyThroughput = timeSpanHours > 0 ? total / timeSpanHours : 0;

  return {
    throughput: hourlyThroughput,
    failure_rate: total > 0 ? failed / total : 0,
    queue_depth: active + stalled,
    avg_duration: durations.length > 0 ? mean(durations) : 0,
    retry_rate: total > 0 ? retryCount / total : 0,
    total_jobs: total,
  };
}

function getCurrentMetricValue(
  metric: AnomalyMetricName,
  current: CurrentMetrics,
  _projectId: string,
  _queueName: string
): number {
  switch (metric) {
    case 'throughput': return current.throughput;
    case 'failure_rate': return current.failure_rate;
    case 'queue_depth': return current.queue_depth;
    case 'avg_duration': return current.avg_duration;
    case 'retry_rate': return current.retry_rate;
    default: return 0;
  }
}

function determineAnomalyStatus(anomalies: AnomalyDetectionResult[]): QueueAnomalyStatus['status'] {
  if (anomalies.length === 0) return 'healthy';
  const hasCritical = anomalies.some((a) => a.severity === 'critical');
  if (hasCritical) return 'critical';
  return 'warning';
}

/**
 * Get the current anomaly status for a queue (for dashboard badge rendering).
 * Lightweight version that doesn't recalculate baselines.
 */
export async function getAnomalyStatus(
  projectId: string,
  queueName: string
): Promise<QueueAnomalyStatus> {
  return detectAnomalies(projectId, queueName);
}

/**
 * Log anomaly results to alert_history (called from alert worker).
 * Anomalies are stored with rule_id=00000000-0000-0000-0000-000000000000 (sentinel)
 * to distinguish them from user-configured alert rules.
 */
export const ANOMALY_SENTINEL_RULE_ID = '00000000-0000-0000-0000-000000000000';

export interface AnomalyAlertPayload {
  project_id: string;
  anomaly: AnomalyDetectionResult;
  settings: AnomalySettings;
}

/**
 * Create alert_history entries for all detected anomalies.
 * Returns the list of anomaly payloads that should trigger delivery.
 */
export async function logAnomalyAlerts(
  projectId: string,
  queueName: string,
  anomalies: AnomalyDetectionResult[],
  settings: AnomalySettings
): Promise<AnomalyAlertPayload[]> {
  if (anomalies.length === 0) return [];

  const payloads: AnomalyAlertPayload[] = [];

  for (const anomaly of anomalies) {
    const details = {
      rule_name: `[Anomaly] ${anomaly.rule_name}`,
      condition_type: 'anomaly',
      threshold_value: anomaly.baseline_value,
      actual_value: anomaly.current_value,
      queue_name: anomaly.queue_name,
      window_minutes: 30,
      channel: 'anomaly',
      destination: '',
      delivery_success: false,
      anomaly_severity: anomaly.severity,
      anomaly_metric: anomaly.metric_name,
      anomaly_deviation: anomaly.threshold_multiplier,
      anomaly_description: anomaly.rule_description,
    };

    const { error: historyError } = await supabase
      .from('alert_history')
      .insert({
        rule_id: ANOMALY_SENTINEL_RULE_ID,
        project_id: projectId,
        details: details as unknown as Record<string, unknown>,
      } as never);

    if (historyError) {
      logger.error({ err: historyError, projectId, queueName }, '[Anomaly] Failed to log anomaly alert');
    } else {
      payloads.push({ project_id: projectId, anomaly, settings });
    }
  }

  return payloads;
}
