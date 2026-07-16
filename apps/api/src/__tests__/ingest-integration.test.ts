import { describe, it, expect } from 'vitest';

describe('Ingest endpoint — integration', () => {
  it('parseIngestBody handles the full valid payload', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'email-notifications',
          jobId: 'job-001',
          jobName: 'Send welcome email',
          eventType: 'completed',
          status: 'completed',
          durationMs: 1250,
          attempts: 1,
          environment: 'production',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
        {
          queueName: 'email-notifications',
          jobId: 'job-002',
          eventType: 'failed',
          status: 'failed',
          errorMessage: 'SMTP connection timeout',
          environment: 'production',
          timestamp: '2026-07-10T12:00:01.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.events).toHaveLength(2);
      expect(result.value.events[0].status).toBe('completed');
      expect(result.value.events[0].durationMs).toBe(1250);
      expect(result.value.events[1].status).toBe('failed');
      expect(result.value.events[1].errorMessage).toBe('SMTP connection timeout');
    }
  });

  it('parseIngestBody normalizes jobName length', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'q',
          jobId: 'j',
          jobName: 'x'.repeat(500),
          eventType: 'completed',
          status: 'completed',
          environment: 'prod',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.events[0].jobName!.length).toBe(255);
    }
  });

  it('parseIngestBody preserves optional fields as undefined when absent', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'q',
          jobId: 'j',
          eventType: 'completed',
          status: 'completed',
          environment: 'prod',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      const event = result.value.events[0];
      expect(event.durationMs).toBeUndefined();
      expect(event.attempts).toBeUndefined();
      expect(event.errorMessage).toBeUndefined();
      expect(event.errorStack).toBeUndefined();
    }
  });

  it('returns clear error for each validation failure', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = { events: [{}] };
    const result = parseIngestBody(body);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/index 0/);
    }
  });
});
