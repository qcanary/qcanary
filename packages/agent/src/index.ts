/**
 * @qcanary/agent
 *
 * Lightweight BullMQ job queue monitoring agent for Qcanary.
 * Listens to QueueEvents and forwards job metadata to the Qcanary API.
 *
 * @example
 * ```ts
 * import { QueueMonitor } from '@qcanary/agent';
 *
 * const monitor = new QueueMonitor({
 *   apiKey: process.env.QCANARY_API_KEY!,
 *   queues: [emailQueue, reportQueue],
 * });
 *
 * await monitor.start();
 * ```
 */

import type { QueueMonitorOptions } from './types';
import { EventListener } from './events';
import { EventTransport } from './transport';
import { noop } from './utils';

const DEFAULT_API_BASE_URL = 'https://api.qcanary.dev';

export type {
  QueueMonitorOptions,
  JobEvent,
  IngestPayload,
  ApiResponse,
  EventStatus,
} from './types';

export { EventListener } from './events';
export type { EventListenerOptions } from './events';

export class QueueMonitor {
  private readonly transport: EventTransport;
  private readonly listener: EventListener;
  private running = false;

  constructor(options: QueueMonitorOptions) {
    if (typeof options.apiKey !== 'string' || !options.apiKey.trim()) {
      throw new Error('Qcanary QueueMonitor: "apiKey" is required and must be non-empty');
    }
    if (!Array.isArray(options.queues) || options.queues.length === 0) {
      throw new Error(
        'Qcanary QueueMonitor: "queues" must be a non-empty array of BullMQ Queue instances',
      );
    }

    const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_API_BASE_URL;
    const flushIntervalMs = options.flushInterval ?? 5000;
    const maxBufferSize = options.maxBufferSize ?? 100;
    const maxRetries = options.maxRetries ?? 3;
    const environment = options.environment ?? 'production';
    const includePayload = options.includePayload ?? false;
    const onError = options.onError ?? noop;

    this.transport = new EventTransport({
      apiKey: options.apiKey,
      apiBaseUrl,
      flushIntervalMs,
      maxBufferSize,
      maxRetries,
      onError,
    });

    this.listener = new EventListener({
      queues: options.queues,
      environment,
      includePayload,
      connection: options.connection,
      onEvent: (event) => {
        this.transport.enqueue(event);
      },
      onError,
    });
  }

  /**
   * Start the flush timer and begin listening to all configured queues.
   * Call once after construction; safe to call if already started (no-op).
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }
    this.transport.start();
    try {
      await this.listener.start();
    } catch (error) {
      await this.listener.stop();
      await this.transport.stop();
      throw error;
    }
    this.running = true;
  }

  /**
   * Stop queue listeners and flush any buffered events. Safe to call when not started.
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }
    this.running = false;
    try {
      await this.listener.stop();
    } finally {
      await this.transport.stop();
    }
  }
}
