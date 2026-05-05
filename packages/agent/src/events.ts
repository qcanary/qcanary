/**
 * @qcanary/agent — QueueEvents listener
 *
 * Creates BullMQ QueueEvents instances for each monitored queue and
 * captures all 7 event types, transforming them into normalized JobEvent
 * objects. Each captured event is forwarded to a callback (typically
 * the transport layer's buffer).
 *
 * When a job is addressable by ID, we optionally call `queue.getJob` to enrich
 * jobName, duration, attempts, and (if includePayload) job data — without
 * blocking the event loop (async continuation).
 *
 * AGENT RULES enforced here:
 *  #1 — Never crash the host app: all listener callbacks wrapped in try/catch
 *  #2 — Never read job payloads by default; only when includePayload is true
 *  #3 — Never block the event loop: getJob is async; handlers return immediately
 *  #6 — TypeScript strict: zero `any` types
 */

import { QueueEvents } from 'bullmq';
import type { Job, Queue } from 'bullmq';
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

  /**
   * When true, each JobEvent may include the job's `data` as `payload`.
   * @default false
   */
  includePayload: boolean;

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
  private readonly includePayload: boolean;
  private readonly onEvent: QueueEventCallback;
  private readonly onError: (error: Error) => void;
  private stopped = false;

  constructor(private readonly options: EventListenerOptions) {
    this.environment = options.environment;
    this.includePayload = options.includePayload;
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
          ...(queue.opts?.prefix ? { prefix: queue.opts.prefix } : {}),
        });

        this.attachListeners(queueEvents, queue);
        this.managed.push({ queueName, queueEvents });
      } catch (error) {
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
        this.safeOnError(
          new Error(
            `Failed to close QueueEvents for "${queueName}": ${String(error)}`,
          ),
        );
      }
    });

    await Promise.allSettled(closePromises);
    this.managed.length = 0;
  }

  // -------------------------------------------------------------------------
  // Connection resolution
  // -------------------------------------------------------------------------

  private resolveConnection(queue: Queue): ConnectionOptions {
    if (this.options.connection) {
      return this.options.connection;
    }

    if (queue.opts?.connection) {
      return queue.opts.connection as ConnectionOptions;
    }

    return {
      host: '127.0.0.1',
      port: 6379,
    };
  }

  // -------------------------------------------------------------------------
  // Event listeners — all 7 event types
  // -------------------------------------------------------------------------

  private attachListeners(queueEvents: QueueEvents, queue: Queue): void {
    const queueName = queue.name;

    // ----- completed -----
    queueEvents.on('completed', (args, _id) => {
      const jobId = args.jobId;
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'completed',
        status: 'completed',
        durationMs: computeDurationMs(job),
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
    });

    // ----- failed -----
    queueEvents.on('failed', (args, _id) => {
      const jobId = args.jobId;
      const { message, stack } = extractErrorInfo(args.failedReason);
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'failed',
        status: 'failed',
        errorMessage: message,
        errorStack: stack,
        attempts: job?.attemptsMade,
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
    });

    // ----- stalled -----
    queueEvents.on('stalled', (args, _id) => {
      const jobId = args.jobId;
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'stalled',
        status: 'stalled',
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
    });

    // ----- delayed -----
    queueEvents.on('delayed', (args, _id) => {
      const jobId = args.jobId;
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'delayed',
        status: 'delayed',
        delayMs: args.delay,
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
    });

    // ----- active -----
    queueEvents.on('active', (args, _id) => {
      const jobId = args.jobId;
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'active',
        status: 'active',
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
    });

    // ----- waiting -----
    queueEvents.on('waiting', (args, _id) => {
      const jobId = args.jobId;
      void this.withOptionalJob(queue, jobId, (job) => ({
        queueName,
        jobId,
        jobName: job?.name,
        eventType: 'waiting',
        status: 'waiting',
        environment: this.environment,
        timestamp: nowISO(),
        ...spreadPayload(this.includePayload, job),
      }));
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

  /**
   * Fetches the job when possible so we can enrich name, metrics, and payload.
   * On failure, emits a best-effort event with whatever we know from the event args alone.
   */
  private async withOptionalJob(
    queue: Queue,
    jobId: string,
    build: (job: Job | undefined) => JobEvent,
  ): Promise<void> {
    try {
      const job = await queue.getJob(jobId);
      this.safeEmit(build(job ?? undefined));
    } catch {
      try {
        this.safeEmit(build(undefined));
      } catch (error) {
        this.safeOnError(
          error instanceof Error
            ? error
            : new Error(String(error)),
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // Safe wrappers — agent rule #1
  // -------------------------------------------------------------------------

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

  private safeOnError(error: unknown): void {
    try {
      const err =
        error instanceof Error ? error : new Error(String(error));
      this.onError(err);
    } catch {
      // Agent rule #1 is absolute.
    }
  }
}

function computeDurationMs(job: Job | undefined): number | undefined {
  if (!job) return undefined;
  const start = job.processedOn;
  const end = job.finishedOn;
  if (typeof start === 'number' && typeof end === 'number') {
    return Math.max(0, end - start);
  }
  return undefined;
}

function spreadPayload(
  includePayload: boolean,
  job: Job | undefined,
): { payload?: unknown } {
  if (includePayload && job) {
    return { payload: job.data };
  }
  return {};
}
