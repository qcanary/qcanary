import { describe, it, expect } from 'vitest';
import { parseIngestBody } from '../routes/ingest';

describe('parseIngestBody — actual code validation', () => {
  const validEvent = {
    queueName: 'testQueue',
    jobId: 'job-123',
    eventType: 'completed',
    status: 'completed',
    environment: 'production',
    timestamp: '2026-07-10T12:00:00.000Z',
  };

  it('rejects non-object body', () => {
    const result = parseIngestBody('not an object');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('JSON object');
    }
  });

  it('rejects null body', () => {
    const result = parseIngestBody(null);
    expect(result.ok).toBe(false);
  });

  it('rejects missing events array', () => {
    const result = parseIngestBody({ notEvents: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('events');
    }
  });

  it('rejects empty events array', () => {
    const result = parseIngestBody({ events: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('empty');
    }
  });

  it('accepts valid single event', () => {
    const result = parseIngestBody({ events: [validEvent] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events).toHaveLength(1);
      expect(result.value.events[0].queueName).toBe('testQueue');
    }
  });

  it('rejects event with missing queueName', () => {
    const event = { ...validEvent, queueName: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('queueName');
    }
  });

  it('rejects event with empty queueName', () => {
    const event = { ...validEvent, queueName: '' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects queueName exceeding 100 chars', () => {
    const event = { ...validEvent, queueName: 'a'.repeat(101) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('100');
    }
  });

  it('rejects event with missing jobId', () => {
    const event = { ...validEvent, jobId: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects jobId exceeding 100 chars', () => {
    const event = { ...validEvent, jobId: 'a'.repeat(101) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with missing eventType', () => {
    const event = { ...validEvent, eventType: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects eventType exceeding 50 chars', () => {
    const event = { ...validEvent, eventType: 'a'.repeat(51) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with missing status', () => {
    const event = { ...validEvent, status: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with invalid timestamp', () => {
    const event = { ...validEvent, timestamp: 'not-a-date' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('accepts optional durationMs', () => {
    const event = { ...validEvent, durationMs: 150 };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events[0].durationMs).toBe(150);
    }
  });

  it('rejects non-number durationMs', () => {
    const event = { ...validEvent, durationMs: 'fast' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('accepts optional attempts', () => {
    const event = { ...validEvent, attempts: 3 };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
  });

  it('truncates jobName to 255 chars', () => {
    const event = { ...validEvent, jobName: 'a'.repeat(300) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events[0].jobName!.length).toBe(255);
    }
  });

  it('accepts multiple events', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...validEvent,
      jobId: `job-${i}`,
    }));
    const result = parseIngestBody({ events });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events).toHaveLength(5);
    }
  });

  it('rejects event with null value', () => {
    const result = parseIngestBody({ events: [null] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with non-object value', () => {
    const result = parseIngestBody({ events: ['string'] });
    expect(result.ok).toBe(false);
  });
});
