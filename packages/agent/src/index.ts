/**
 * @qcanary/agent
 *
 * Lightweight BullMQ job queue monitoring agent for Qcanary.
 * Listens to QueueEvents and forwards job metadata to the Qcanary API.
 *
 * Usage:
 *   import { QueueMonitor } from '@qcanary/agent';
 *   const monitor = new QueueMonitor({
 *     apiKey: 'qc_...',
 *     queues: [emailQueue, reportQueue],
 *   });
 *
 * Full QueueMonitor class will be completed in Session 4.
 */

// Re-export public types
export type {
  QueueMonitorOptions,
  JobEvent,
  IngestPayload,
  ApiResponse,
  EventStatus,
} from './types';

// Re-export internals that Session 4 will wire together
export { EventListener } from './events';
export type { EventListenerOptions } from './events';
