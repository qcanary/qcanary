/**
 * @qcanary/agent
 *
 * Lightweight BullMQ job queue monitoring agent for Qcanary.
 * Listens to QueueEvents and forwards job metadata to the Qcanary API.
 *
 * Usage:
 *   import { QueueMonitor } from '@qcanary/agent';
 *   const monitor = new QueueMonitor({ apiKey: 'qc_...' });
 *   monitor.listen(myQueue);
 *
 * Full implementation will be completed in Session 4.
 */

export type {
  QueueMonitorOptions,
  JobEvent,
  IngestPayload,
  ApiResponse,
} from './types';
