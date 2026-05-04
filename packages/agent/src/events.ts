/**
 * @qcanary/agent — QueueEvents listener
 *
 * Creates BullMQ QueueEvents instances for each monitored queue and
 * captures all 7 event types, transforming them into normalized JobEvent
 * objects. Each captured event is forwarded to a callback (typically
 * the transport layer's buffer).
 *
 * AGENT RULES enforced here:
 *  #1 — Never crash the host app: all listener callbacks wrapped in try/catch
 *  #3 — Never block the event loop: all async, uses QueueEvents' native stream
 *  #6 — TypeScript strict: zero `any` types
 */

import { QueueEvents } from 'bullmq';
import type { Queue } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';
import type {
  JobEvent,
  QueueEventCallback,
  ManagedQueueEvents,
} from './types';
import { nowISO, extractErrorInfo } from './utils';

// ---------------------------------------------------------------------------
// EventListener class
// ---------------------------------------------------------------------------

export interface EventListenerOptions {
  /** BullMQ Queue instances to monitor */
  queues: Queue[];

  /** Environment tag attached to every event */
  environment: string;

  /** Optional Redis connection options for QueueEvents instances */
  connection?: ConnectionOptions;

  /** Called for every captured event (transport buffer push) */
  onEvent: QueueEventCallback;

  /** Called on non-fatal errors (for optional user-provided logging) */
  onError: (error: Error) => void;
}

export class EventListener {
  private readonly managed: ManagedQueueEvents[] = [];
  private readonly environment: string;
  private readonly onEvent: QueueEventCallback;
  private readonly onError: (error: Error) => void;
  private stopped = false;

  constructor(private readonly options: EventListenerOptions) {
    this.environment = options.environment;
    this.onEvent = options.onEvent;
    this.onError = options.onError;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Start listening to all queues.
   * Creates one QueueEvents instance per queue and subscribes to all 7 events.
   */
  async start(): Promise<void> {
    for (const queue of this.options.queues) {
      try {
        const queueName = queue.name;
        const connection = this.resolveConnection(queue);

        const queueEvents = new QueueEvents(queueName, {
          connection,
          // Prefix must match the queue's prefix for events to be captured
          ...(queue.opts?.prefix ? { prefix: queue.opts.prefix } : {}),
        });

        this.attachListeners(queueEvents, queueName);
        this.managed.push({ queueName, queueEvents });
      } catch (error) {
        // Agent rule #1: never crash the host app
        this.safeOnError(error);
      }
    }
  }

  /**
   * Stop listening and close all QueueEvents connections.
   * Safe to call multiple times.
   */
  async stop(): Promise<void> {
    this.stopped = true;

    const closePromises = this.managed.map(async ({ queueEvents, queueName }) => {
      try {
        await queueEvents.close();
      } catch (error) {
        // Swallow close errors — agent rule #1
        this.safeOnError(
          new Error(`Failed to close QueueEvents for "${queueName}": ${String(error)}`),
        );
      }
    });

    await Promise.allSettled(closePromises);
    this.managed.length = 0;
  }

  // -------------------------------------------------------------------------
  // Connection resolution
  // -------------------------------------------------------------------------

  /**
   * Resolve the Redis connection for QueueEvents.
   *
   * Priority:
   *   1. Explicitly provided connection in constructor options
   *   2. Duplicated from the Queue instance's existing connection
   *
   * QueueEvents needs its own dedicated Redis connection (BullMQ requirement).
   */
  private resolveConnection(queue: Queue): ConnectionOptions {
    // If the user explicitly provided connection options, use those
    if (this.options.connection) {
      return this.options.connection;
    }

    // Attempt to extract connection opts from the Queue instance.
    // BullMQ's Queue stores them in opts.connection.
    if (queue.opts?.connection) {
      return queue.opts.connection as ConnectionOptions;
    }

    // Fallback: assume localhost Redis (common in development)
    return {
      host: '127.0.0.1',
      port: 6379,
    };
  }

  // -------------------------------------------------------------------------
  // Event listeners — all 7 event types
  // -------------------------------------------------------------------------

  private attachListeners(queueEvents: QueueEvents, queueName: string): void {
    // ----- completed -----
    queueEvents.on('completed', (args, _id) => {
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'completed',
        status: 'completed',
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- failed -----
    queueEvents.on('failed', (args, _id) => {
      const { message, stack } = extractErrorInfo(args.failedReason);
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'failed',
        status: 'failed',
        errorMessage: message,
        errorStack: stack,
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- stalled -----
    queueEvents.on('stalled', (args, _id) => {
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'stalled',
        status: 'stalled',
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- delayed -----
    queueEvents.on('delayed', (args, _id) => {
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'delayed',
        status: 'delayed',
        delayMs: args.delay,
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- active -----
    queueEvents.on('active', (args, _id) => {
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'active',
        status: 'active',
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- waiting -----
    queueEvents.on('waiting', (args, _id) => {
      this.safeEmit({
        queueName,
        jobId: args.jobId,
        eventType: 'waiting',
        status: 'waiting',
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- drained -----
    queueEvents.on('drained', (_id) => {
      this.safeEmit({
        queueName,
        jobId: '',
        eventType: 'drained',
        status: 'drained',
        environment: this.environment,
        timestamp: nowISO(),
      });
    });

    // ----- error (internal — not forwarded to ingest, just logged) -----
    queueEvents.on('error', (error) => {
      this.safeOnError(error);
    });
  }

  // -------------------------------------------------------------------------
  // Safe wrappers — agent rule #1
  // -------------------------------------------------------------------------

  /**
   * Safely emit a JobEvent to the callback.
   * If the callback throws, the error is swallowed and reported via onError.
   */
  private safeEmit(event: JobEvent): void {
    if (this.stopped) return;

    try {
      this.onEvent(event);
    } catch (error) {
      this.safeOnError(
        error instanceof Error
          ? error
          : new Error(`Event callback error: ${String(error)}`),
      );
    }
  }

  /**
   * Safely call the error handler without ever throwing.
   */
  private safeOnError(error: unknown): void {
    try {
      const err =
        error instanceof Error ? error : new Error(String(error));
      this.onError(err);
    } catch {
      // If even the error handler throws, silently swallow.
      // Agent rule #1 is absolute.
    }
  }
}
