interface OpsGenieAlertOptions {
  apiKey: string;
  message: string;
  description: string;
  alias?: string;
  priority?: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  tags?: string[];
  details?: Record<string, string>;
}

export async function sendOpsGenieAlert(options: OpsGenieAlertOptions): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('https://api.opsgenie.com/v2/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `GenieKey ${options.apiKey}`,
      },
      body: JSON.stringify({
        message: options.message,
        description: options.description,
        alias: options.alias ?? `qcanary-${Date.now()}`,
        priority: options.priority ?? 'P2',
        tags: options.tags ?? ['qcanary', 'queue-alert'],
        details: options.details ?? {},
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `OpsGenie returned ${response.status}: ${body.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpsGenie delivery failed';
    return { ok: false, error: message };
  }
}

export async function closeOpsGenieAlert(
  apiKey: string,
  alias: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(`https://api.opsgenie.com/v2/alerts/${encodeURIComponent(alias)}/close`, {
      method: 'POST',
      headers: {
        Authorization: `GenieKey ${apiKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const body = await response.text();
      return { ok: false, error: `OpsGenie close returned ${response.status}: ${body.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpsGenie close failed';
    return { ok: false, error: message };
  }
}