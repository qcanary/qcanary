import { logger } from './logger';

interface PagerDutyAlertOptions {
  routingKey: string;
  title: string;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  component?: string;
  group?: string;
  customDetails?: Record<string, unknown>;
}

export async function sendPagerDutyAlert(options: PagerDutyAlertOptions): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: options.routingKey,
        event_action: 'trigger',
        payload: {
          summary: options.title,
          source: options.source,
          severity: options.severity,
          component: options.component ?? 'qcanary',
          group: options.group ?? 'queue-alert',
          class: 'queue-monitoring',
          custom_details: {
            description: options.description,
            ...options.customDetails,
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `PagerDuty returned ${response.status}: ${body.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PagerDuty delivery failed';
    return { ok: false, error: message };
  }
}

export async function sendPagerDutyResolve(
  routingKey: string,
  title: string,
  source: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: routingKey,
        event_action: 'resolve',
        payload: {
          summary: title,
          source: source,
          severity: 'info',
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `PagerDuty resolve returned ${response.status}: ${body.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PagerDuty resolve failed';
    return { ok: false, error: message };
  }
}