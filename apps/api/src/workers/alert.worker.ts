import dotenv from 'dotenv';
dotenv.config();

import { Worker, type Job } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { supabase } from '../lib/supabase';
import {
  buildAlertMessage,
  deliverEmail,
  deliverSlack,
  deliverWebhook,
  deliverPagerDuty,
  deliverPagerDutyResolve,
  deliverOpsGenie,
  escapeHtml,
} from '../lib/alertDelivery';
import type { AlertChannel, AlertDetails, AlertRuleRow, ConditionType, JobEventRow, AnomalySettings, SensitivityLevel } from '../types/database';
import { insertRows, updateRows } from '../lib/typedSupabase';
import { logger } from '../lib/logger';
import { detectAnomalies, logAnomalyAlerts, ANOMALY_SENTINEL_RULE_ID } from '../lib/anomalies';
import type { AnomalyDetectionResult, QueueAnomalyStatus } from '../types/database';

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
  } else if (channel === 'webhook') {
    const result = await deliverWebhook(rule.destination, {
      rule_name: rule.name,
      condition_type: rule.condition_type,
      threshold_value: threshold,
      actual_value: actualValue,
      queue_name: rule.queue_name,
      window_minutes: rule.window_minutes,
      triggered_at: new Date().toISOString(),
    });
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
  } else if (channel === 'pagerduty') {
    const result = await deliverPagerDuty(rule.destination, subject, messageText);
    delivery_success = result.ok;
    if (!result.ok) {
      delivery_error = result.error;
    }
  } else if (channel === 'opsgenie') {
    const result = await deliverOpsGenie(rule.destination, subject, messageText);
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

  const { error: historyError } = await insertRows('alert_history', [{
    rule_id: rule.id,
    project_id: projectId,
    details: details as unknown as Record<string, unknown>,
  }]);

  if (historyError) {
    logger.error({ err: historyError }, 'Failed to insert alert_history');
  }

  const { error: updateError } = await updateRows('alert_rules', {
    last_triggered_at: new Date().toISOString(),
  })
    .eq('id', rule.id);

  if (updateError) {
    logger.error({ err: updateError }, 'Failed to update last_triggered_at');
  }
}

async function deliverResolvedNotification(rule: RuleRow): Promise<void> {
  const channel = rule.channel as AlertChannel;
  const queueLabel = rule.queue_name && rule.queue_name.trim().length > 0 ? rule.queue_name : 'all queues';
  const messageText = `Alert Resolved: ${rule.name} on ${queueLabel}`;
  const subject = `[Qcanary] Alert resolved: ${rule.name}`;

  let result: { ok: true } | { ok: false; error: string };
  if (channel === 'slack') {
    result = await deliverSlack(rule.destination, messageText);
  } else if (channel === 'webhook') {
    result = await deliverWebhook(rule.destination, {
      type: 'alert.resolved',
      rule_id: rule.id,
      rule_name: rule.name,
      queue_name: rule.queue_name,
      resolved_at: new Date().toISOString(),
    });
  } else if (channel === 'email') {
    result = await deliverEmail(rule.destination, subject, `<p>${escapeHtml(messageText)}</p>`);
  } else if (channel === 'pagerduty') {
    result = await deliverPagerDutyResolve(rule.destination, subject);
  } else if (channel === 'opsgenie') {
    // OpsGenie close is handled by alias, not resolved notification
    result = { ok: true };
  } else {
    result = { ok: false, error: `Unsupported channel: ${rule.channel}` };
  }

  if (!result.ok) {
    logger.error({ ruleId: rule.id, channel: rule.channel, error: result.error }, 'Failed to deliver alert resolved notification');
  }
}

async function resolveActiveAlert(projectId: string, rule: RuleRow): Promise<void> {
  const { data: activeAlerts, error: activeAlertError } = await supabase
    .from('alert_history')
    .select('id')
    .eq('rule_id', rule.id)
    .eq('project_id', projectId)
    .is('resolved_at', null)
    .limit(1);

  if (activeAlertError) {
    logger.error({ err: activeAlertError, ruleId: rule.id }, 'Failed to check active alert for resolution');
    return;
  }

  if (!activeAlerts || activeAlerts.length === 0) {
    return;
  }

  const resolvedAt = new Date().toISOString();
  const { error: resolveError } = await updateRows('alert_history', {
    resolved_at: resolvedAt,
  })
    .eq('rule_id', rule.id)
    .eq('project_id', projectId)
    .is('resolved_at', null);

  if (resolveError) {
    logger.error({ err: resolveError, ruleId: rule.id }, 'Failed to resolve active alert');
    return;
  }

  logger.info({ ruleId: rule.id, projectId, resolvedAt }, 'Alert auto-resolved');
  await deliverResolvedNotification(rule);
}

/**
 * Default anomaly settings used for teams that haven't configured custom settings.
 */
function getDefaultAnomalySettings(): AnomalySettings {
  return {
    enabled: true,
    sensitivity: 'normal' as SensitivityLevel,
    min_sample_days: 3,
  };
}

async function getAnomalySettings(projectId: string): Promise<AnomalySettings> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('team_id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return getDefaultAnomalySettings();
  }

  const { data: settings } = await supabase
    .from('anomaly_settings' as never)
    .select('enabled, sensitivity, min_sample_days')
    .eq('team_id', (project as { team_id: string }).team_id)
    .single();

  if (!settings) {
    return getDefaultAnomalySettings();
  }

  const s = settings as { enabled: boolean; sensitivity: string; min_sample_days: number };
  return {
    enabled: s.enabled,
    sensitivity: s.sensitivity as SensitivityLevel,
    min_sample_days: s.min_sample_days,
  };
}

async function processEvaluateAlertsJob(job: Job<EvaluateAlertsJobData>): Promise<void> {
  const { projectId, queueNames } = job.data;

  if (!projectId || !Array.isArray(queueNames)) {
    return;
  }

  // â”€â”€ Step 1: Evaluate user-configured alert rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    try {
      if (!ruleAppliesToIngest(rule, queueNames)) {
        continue;
      }

      const threshold = numericThreshold(rule.threshold_value);

      const events = await fetchEventsInWindow(projectId, rule.queue_name, rule.window_minutes);
      const { shouldFire, actualValue } = evaluateCondition(rule.condition_type, threshold, events);

      if (!shouldFire) {
        await resolveActiveAlert(projectId, rule);
        continue;
      }

      if (isInCooldown(rule, now)) {
        continue;
      }

      await logAndDeliver(projectId, rule, actualValue, threshold);
    } catch (ruleError) {
      logger.error({ err: ruleError, ruleId: rule.id, projectId }, 'Failed to evaluate alert rule');
    }
  }

  // â”€â”€ Step 2: Run anomaly detection for each queue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Anomalies are auto-generated alerts (not user-configured)
  // They use the same delivery channels but are logged separately
  const anomalySettings = await getAnomalySettings(projectId);
  if (anomalySettings.enabled) {
    for (const queueName of queueNames) {
      try {
        const { status, anomalies } = await detectAnomalies(projectId, queueName, anomalySettings);

        if (anomalies.length > 0) {
          const payloads = await logAnomalyAlerts(projectId, queueName, anomalies, anomalySettings);
          logger.info(
            { projectId, queueName, anomalyCount: payloads.length, status },
            '[Anomaly] Detected anomalies during alert evaluation'
          );
          
          // Check if any anomaly-alert rules exist for this project to deliver
          // via user-configured channels. Otherwise, anomalies are only logged
          // to alert_history (visible in the dashboard).
          for (const payload of payloads) {
            try {
              await deliverAnomalyViaRules(rules, projectId, queueName, payload.anomaly);
            } catch (deliveryErr) {
              logger.error({ err: deliveryErr, projectId, queueName }, '[Anomaly] Failed to deliver anomaly alert via rules');
            }
          }
        }
      } catch (anomalyErr) {
        logger.error({ err: anomalyErr, projectId, queueName }, '[Anomaly] Failed to run anomaly detection');
      }
    }
  }
}

/**
 * Deliver anomaly alerts via matching user-configured alert rules.
 * Finds rules that match the queue and channel, then sends the anomaly
 * message through that channel (Slack, email, webhook).
 */
async function deliverAnomalyViaRules(
  rules: RuleRow[],
  projectId: string,
  queueName: string,
  anomaly: AnomalyDetectionResult
): Promise<void> {
  // Find rules that apply to this queue (or all queues) and are active
  const matchingRules = rules.filter((r) => {
    if (!r.is_active) return false;
    // Match if rule applies to all queues or specifically this queue
    if (!r.queue_name || r.queue_name.trim().length === 0) return true;
    return r.queue_name === queueName;
  });

  if (matchingRules.length === 0) return;

  const messageText = [
    `*[Anomaly] ${anomaly.rule_name}*`,
    `Queue: *${anomaly.queue_name}*`,
    `Severity: *${anomaly.severity.toUpperCase()}*`,
    `Current: *${anomaly.current_value}* (baseline: ${anomaly.baseline_value})`,
    `Deviation: *${anomaly.threshold_multiplier}x* normal`,
    `Description: ${anomaly.rule_description}`,
  ].join('\n');

  const subject = `[Qcanary Anomaly] ${anomaly.rule_name} on ${anomaly.queue_name}`;

  const htmlBody = [
    '<div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto;">',
    `<h2 style="color: ${anomaly.severity === 'critical' ? '#EF4444' : '#F59E0B'};">${anomaly.rule_name}</h2>`,
    `<p>Queue: <strong>${escapeHtml(anomaly.queue_name)}</strong></p>`,
    `<p>Severity: <strong>${anomaly.severity.toUpperCase()}</strong></p>`,
    `<p>Current value: <strong>${anomaly.current_value}</strong> (baseline: ${anomaly.baseline_value})</p>`,
    `<p>Deviation: <strong>${anomaly.threshold_multiplier}x normal</strong></p>`,
    `<p>${escapeHtml(anomaly.rule_description)}</p>`,
    '</div>',
  ].join('\n');

  for (const rule of matchingRules) {
    const channel = rule.channel as AlertChannel;
    try {
      if (channel === 'slack') {
        await deliverSlack(rule.destination, messageText);
      } else if (channel === 'email') {
        await deliverEmail(rule.destination, subject, htmlBody);
      } else if (channel === 'webhook') {
        await deliverWebhook(rule.destination, {
          type: 'anomaly',
          rule_name: anomaly.rule_name,
          queue_name: anomaly.queue_name,
          severity: anomaly.severity,
          current_value: anomaly.current_value,
          baseline_value: anomaly.baseline_value,
          deviation: anomaly.threshold_multiplier,
          description: anomaly.rule_description,
          triggered_at: new Date().toISOString(),
        });
      } else if (channel === 'pagerduty') {
        const severity = anomaly.severity === 'critical' ? 'critical' : 'warning';
        await deliverPagerDuty(rule.destination, subject, messageText, severity);
      } else if (channel === 'opsgenie') {
        const priority = anomaly.severity === 'critical' ? 'P1' : 'P2';
        await deliverOpsGenie(rule.destination, subject, messageText, priority);
      }
    } catch (deliveryErr) {
      logger.error({ err: deliveryErr, ruleId: rule.id, channel }, '[Anomaly] Failed to deliver anomaly via rule');
    }
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
    // Remove jobs that exceed max attempts to prevent infinite retry loops
    removeOnFail: { age: 24 * 3600 },
  }
);

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Alert worker job failed');
});

worker.on('completed', () => {
  // optional: verbose logging off for production
});

worker.on('error', (err) => {
  logger.error({ err }, 'Alert worker error â€” restarting connection');
});

function shutdown(): void {
  const forceExit = setTimeout(() => {
    logger.error('Alert worker shutdown timed out â€” forcing exit');
    process.exit(1);
  }, 10_000);

  void worker.close().then(() => {
    clearTimeout(forceExit);
    process.exit(0);
  }).catch((err) => {
    clearTimeout(forceExit);
    logger.error({ err }, 'Error closing worker during shutdown');
    process.exit(1);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

logger.info('Alert worker listening on queue "qcanary-alerts"');
