import { getResend, getResendFromAddress } from './resend';
import type { AlertRuleRow } from '../types/database';

export function buildAlertMessage(rule: AlertRuleRow, actualValue: number, threshold: number): string {
  const scope = rule.queue_name ? `queue *${rule.queue_name}*` : 'project (all queues)';
  return [
    `*${rule.name}*`,
    `Project rule fired for ${scope}.`,
    `Condition: \`${rule.condition_type}\` — actual *${actualValue}* (threshold *${threshold}*)`,
    `Window: last ${rule.window_minutes} minute(s).`,
  ].join('\n');
}

export function buildTestMessage(rule: AlertRuleRow): string {
  return [
    '*Qcanary test alert*',
    `Rule: *${rule.name}*`,
    `Channel: \`${rule.channel}\``,
    `Condition: \`${rule.condition_type}\` (threshold ${rule.threshold_value})`,
    `This is a manual test — no alert history entry was created.`,
  ].join('\n');
}

export async function deliverSlack(
  destination: string,
  text: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(destination, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Slack webhook returned ${response.status}: ${body.slice(0, 500)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Slack delivery failed';
    return { ok: false, error: message };
  }
}

export async function deliverWebhook(
  destination: string,
  payload: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(destination, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Webhook returned ${response.status}: ${body.slice(0, 500)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook delivery failed';
    return { ok: false, error: message };
  }
}

export async function deliverEmail(
  destination: string,
  subject: string,
  html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: destination,
      subject,
      html,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email delivery failed';
    return { ok: false, error: message };
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
