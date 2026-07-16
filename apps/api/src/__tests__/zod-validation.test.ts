import { describe, it, expect } from 'vitest';
import { IngestEventSchema, IngestBodySchema } from '../lib/validations';

describe('Zod validation schemas', () => {
  const validEvent = {
    queueName: 'test-queue',
    jobId: 'job-123',
    eventType: 'completed',
    status: 'completed',
    environment: 'production',
    timestamp: '2026-07-10T12:00:00.000Z',
  };

  it('accepts valid event', () => {
    const result = IngestEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('rejects empty queueName', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, queueName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects queueName over 100 chars', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, queueName: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid timestamp format', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, timestamp: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('accepts valid body with multiple events', () => {
    const result = IngestBodySchema.safeParse({ events: [validEvent, validEvent] });
    expect(result.success).toBe(true);
  });

  it('rejects empty events array', () => {
    const result = IngestBodySchema.safeParse({ events: [] });
    expect(result.success).toBe(false);
  });

  it('rejects over 500 events', () => {
    const events = Array.from({ length: 501 }, () => validEvent);
    const result = IngestBodySchema.safeParse({ events });
    expect(result.success).toBe(false);
  });
});
