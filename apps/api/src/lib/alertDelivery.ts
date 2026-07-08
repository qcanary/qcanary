import { getResend, getResendFromAddress } from './resend';
import type { AlertRuleRow } from '../types/database';

// ── SSRF Protection ─────────────────────────────────────────
// Blocklist of internal/reserved IP ranges to prevent SSRF attacks
// via user-configured webhook/Slack URLs.
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^localhost$/i,
];

function isPrivateHost(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

function validateDestination(url: string): { ok: true; hostname: string } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, error: 'Only http and https URLs are allowed' };
  }

  if (isPrivateHost(parsed.hostname)) {
    return { ok: false, error: 'Internal/private IP addresses are not allowed' };
  }

  return { ok: true, hostname: parsed.hostname };
}

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
  const validated = validateDestination(destination);
  if (!validated.ok) {
    return { ok: false, error: `SSRF guard: ${validated.error}` };
  }

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
  const validated = validateDestination(destination);
  if (!validated.ok) {
    return { ok: false, error: `SSRF guard: ${validated.error}` };
  }

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
