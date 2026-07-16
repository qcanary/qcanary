import { z } from 'zod';

export const IngestEventSchema = z.object({
  queueName: z.string().min(1).max(100),
  jobId: z.string().min(1).max(100),
  jobName: z.string().max(255).optional(),
  eventType: z.string().min(1).max(50),
  status: z.string().min(1).max(50),
  durationMs: z.number().optional(),
  attempts: z.number().optional(),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
  delayMs: z.number().optional(),
  environment: z.string().min(1),
  timestamp: z.string().datetime(),
  payload: z.unknown().optional(),
});

export const IngestBodySchema = z.object({
  events: z.array(IngestEventSchema).min(1).max(500),
});

export type IngestEvent = z.infer<typeof IngestEventSchema>;
export type IngestBody = z.infer<typeof IngestBodySchema>;
