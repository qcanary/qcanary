import dotenv from 'dotenv';
dotenv.config();

import { Worker, type Job } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { supabase } from '../lib/supabase';
import {
  buildAlertMessage,
  deliverEmail,
  deliverSlack,
  escapeHtml,
} from '../lib/alertDelivery';
import type { AlertChannel, AlertDetails, AlertRuleRow, ConditionType, JobEventRow } from '../types/database';

interface EvaluateAlertsJobData {
  projectId: string;
  queueNames: string[];
  triggeredAt: string;
}

type RuleRow = AlertRuleRow;

function numericThreshold(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function windowStartIso(windowMinutes: number): string {
  const ms = Math.max(1, windowMinutes) * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

function ruleAppliesToIngest(rule: RuleRow, queueNames: string[]): boolean {
  if (!rule.queue_name || rule.queue_name.trim().length === 0) {
    return true;
  }
  return queueNames.includes(rule.queue_name);
}

function isInCooldown(rule: RuleRow, now: Date): boolean {
  if (!rule.last_triggered_at) {
    return false;
  }
  const last = new Date(rule.last_triggered_at).getTime();
  const cooldownMs = Math.max(0, rule.cooldown_minutes) * 60 * 1000;
  return now.getTime() < last + cooldownMs;
}

async function fetchEventsInWindow(
  projectId: string,
  queueName: string | null,
  windowMinutes: number
): Promise<Pick<JobEventRow, 'job_id' | 'status' | 'duration_ms' | 'timestamp'>[]> {
  const startIso = windowStartIso(windowMinutes);

  let query = supabase
    .from('job_events')
    .select('job_id, status, duration_ms, timestamp')
    .eq('project_id', projectId)
    .gte('timestamp', startIso)
    .order('timestamp', { ascending: true });

  if (queueName && queueName.trim().length > 0) {
    query = query.eq('queue_name', queueName);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load job_events: ${error.message}`);
  }

  return (data ?? []) as Pick<JobEventRow, 'job_id' | 'status' | 'duration_ms' | 'timestamp'>[];
}

function computeFailureRatePercent(events: Pick<JobEventRow, 'status'>[]): {
  rate: number;
  failed: number;
  completed: number;
} {
  let failed = 0;
  let completed = 0;

  for (const e of events) {
    if (e.status === 'failed') {
      failed += 1;
    } else if (e.status === 'completed') {
      completed += 1;
    }
  }

  const denom = failed + completed;
  const rate = denom === 0 ? 0 : (failed / denom) * 100;
  return { rate, failed, completed };
}

function computeApproxQueueDepth(
  events: Pick<JobEventRow, 'job_id' | 'status' | 'timestamp'>[]
): number {
  const byJob = new Map<string, string>();
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  for (const e of sorted) {
    byJob.set(e.job_id, e.status);
  }

  const inFlight = new Set(['waiting', 'active', 'delayed']);
  let depth = 0;
  for (const status of byJob.values()) {
    if (inFlight.has(status)) {
      depth += 1;
    }
  }
  return depth;
}

function computeMaxDurationMs(events: Pick<JobEventRow, 'duration_ms'>[]): number {
  let max = 0;
  for (const e of events) {
    if (typeof e.duration_ms === 'number' && e.duration_ms > max) {
      max = e.duration_ms;
    }
  }
  return max;
}

function evaluateCondition(
  conditionType: string,
  threshold: number,
  events: Pick<JobEventRow, 'job_id' | 'status' | 'duration_ms' | 'timestamp'>[]
): { shouldFire: boolean; actualValue: number } {
  switch (conditionType) {
    case 'failure_rate': {
      const { rate } = computeFailureRatePercent(events);
      return { shouldFire: rate >= threshold, actualValue: Number(rate.toFixed(4)) };
    }
    case 'no_activity': {
      const count = events.length;
      return { shouldFire: count < threshold, actualValue: count };
    }
    case 'queue_depth': {
      const depth = computeApproxQueueDepth(events);
      return { shouldFire: depth >= threshold, actualValue: depth };
    }
    case 'job_duration': {
      const maxMs = computeMaxDurationMs(events);
      return { shouldFire: maxMs >= threshold, actualValue: maxMs };
    }
    default:
      return { shouldFire: false, actualValue: 0 };
  }
}

async function logAndDeliver(
  projectId: string,
  rule: RuleRow,
  actualValue: number,
  threshold: number
): Promise<void> {
  const channel = rule.channel as AlertChannel;
  const messageText = buildAlertMessage(rule, actualValue, threshold);
  const subject = `[Qcanary] ${rule.name}`;

  let delivery_success = false;
  let delivery_error: string | undefined;

  if (channel === 'slack') {
    const result = await deliverSlack(rule.destination, messageText);
    delivery_success = result.ok;
    if (!result.ok) {
      delivery_error = result.error;
    }
  } else if (channel === 'email') {
    const result = await deliverEmail(rule.destination, subject, `<pre>${escapeHtml(messageText)}</pre>`);
    delivery_success = result.ok;
    if (!result.ok) {
      delivery_error = result.error;
    }
  } else {
    delivery_error = `Unsupported channel: ${rule.channel}`;
  }

  const details: AlertDetails = {
    rule_name: rule.name,
    condition_type: rule.condition_type as ConditionType,
    threshold_value: threshold,
    actual_value: actualValue,
    queue_name: rule.queue_name,
    window_minutes: rule.window_minutes,
    channel,
    destination: rule.destination,
    delivery_success,
    ...(delivery_error ? { delivery_error } : {}),
  };

  const { error: historyError } = await supabase.from('alert_history').insert({
    rule_id: rule.id,
    project_id: projectId,
    details: details as unknown as Record<string, unknown>,
  } as never);

  if (historyError) {
    // eslint-disable-next-line no-console
    console.error('Failed to insert alert_history', historyError);
  }

  const { error: updateError } = await supabase
    .from('alert_rules')
    .update({ last_triggered_at: new Date().toISOString() } as never)
    .eq('id', rule.id);

  if (updateError) {
    // eslint-disable-next-line no-console
    console.error('Failed to update last_triggered_at', updateError);
  }
}

async function processEvaluateAlertsJob(job: Job<EvaluateAlertsJobData>): Promise<void> {
  const { projectId, queueNames } = job.data;

  if (!projectId || !Array.isArray(queueNames)) {
    return;
  }

  const { data: rulesRaw, error: rulesError } = await supabase
    .from('alert_rules')
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .eq('project_id', projectId)
    .eq('is_active', true);

  if (rulesError) {
    throw new Error(`Failed to load alert_rules: ${rulesError.message}`);
  }

  const rules = (rulesRaw ?? []) as RuleRow[];
  const now = new Date();

  for (const rule of rules) {
    if (!ruleAppliesToIngest(rule, queueNames)) {
      continue;
    }

    if (isInCooldown(rule, now)) {
      continue;
    }

    const threshold = numericThreshold(rule.threshold_value);

    const events = await fetchEventsInWindow(projectId, rule.queue_name, rule.window_minutes);
    const { shouldFire, actualValue } = evaluateCondition(rule.condition_type, threshold, events);

    if (!shouldFire) {
      continue;
    }

    await logAndDeliver(projectId, rule, actualValue, threshold);
  }
}

const worker = new Worker<EvaluateAlertsJobData>(
  'qcanary-alerts',
  async (job) => {
    if (job.name === 'evaluate-alerts') {
      await processEvaluateAlertsJob(job);
    }
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error('Alert worker job failed', job?.id, err);
});

worker.on('completed', () => {
  // optional: verbose logging off for production
});

function shutdown(): void {
  void worker.close().then(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// eslint-disable-next-line no-console
console.log('Qcanary alert worker listening on queue "qcanary-alerts"');
