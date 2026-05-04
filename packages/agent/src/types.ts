/**
 * @qcanary/agent — TypeScript interfaces
 *
 * All shared types for the Qcanary monitoring agent.
 * These types define the contract between the agent, the event listener,
 * the transport layer, and the Qcanary ingest API.
 */

import type { Queue, QueueEvents } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';

// ---------------------------------------------------------------------------
// Event status — maps 1:1 with BullMQ event names we capture
// ---------------------------------------------------------------------------

/**
 * The seven BullMQ event types that Qcanary captures.
 * Each maps to a BullMQ QueueEvents listener event.
 */
export type EventStatus =
  | 'completed'
  | 'failed'
  | 'stalled'
  | 'delayed'
  | 'active'
  | 'waiting'
  | 'drained';

// ---------------------------------------------------------------------------
// Job event — the normalized shape sent to the ingest API
// ---------------------------------------------------------------------------

/** A single job event captured by the agent */
export interface JobEvent {
  /** Name of the BullMQ queue that emitted the event */
  queueName: string;

  /**
   * BullMQ job ID.
   * For 'drained' events this is an empty string since no specific job is involved.
   */
  jobId: string;

  /** Optional job name (the first arg to queue.add()) */
  jobName?: string;

  /** The raw BullMQ event name (completed, failed, stalled, etc.) */
  eventType: EventStatus;

  /** Normalized status string matching the event type */
  status: EventStatus;

  /** Job processing duration in milliseconds (completed events only) */
  durationMs?: number;

  /** Number of attempts made (failed events only) */
  attempts?: number;

  /** Error message extracted from failedReason (failed events only) */
  errorMessage?: string;

  /** Full error stack trace (failed events only) */
  errorStack?: string;

  /** Delay amount in ms (delayed events only) */
  delayMs?: number;

  /** Environment tag (e.g. 'production', 'staging') */
  environment: string;

  /** ISO-8601 timestamp when the event was captured */
  timestamp: string;

  /** Optional job payload data (only included when includePayload is true) */
  payload?: unknown;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration options for QueueMonitor */
export interface QueueMonitorOptions {
  /** Your Qcanary API key (required) */
  apiKey: string;

  /** BullMQ Queue instances to monitor (required) */
  queues: Queue[];

  /**
   * Qcanary API base URL.
   * @default 'https://api.qcanary.dev'
   */
  apiBaseUrl?: string;

  /**
   * Include job payload data in events.
   * WARNING: Payloads may contain sensitive data. Only enable this if you
   * understand the implications.
   * @default false
   */
  includePayload?: boolean;

  /**
   * Buffer flush interval in milliseconds.
   * Events are batched and sent every flushInterval ms.
   * @default 5000
   */
  flushInterval?: number;

  /**
   * Max events to buffer before forcing an immediate flush.
   * @default 100
   */
  maxBufferSize?: number;

  /**
   * Max retry attempts for failed HTTP sends.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Environment tag sent with every event.
   * @default 'production'
   */
  environment?: string;

  /**
   * Optional Redis connection options for QueueEvents instances.
   * If not provided, the agent attempts to reuse connection info from
   * the first Queue instance. If that also fails, you must provide this.
   */
  connection?: ConnectionOptions;

  /**
   * Called when the agent encounters a non-fatal error.
   * Useful for logging in development. In production, errors are
   * always swallowed silently per agent rule #1.
   */
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

/** Shape of the batch payload sent to the ingest API */
export interface IngestPayload {
  events: JobEvent[];
}

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/**
 * Callback signature for the internal event pipeline.
 * The EventListener calls this whenever a new JobEvent is captured.
 * The transport layer typically receives this callback.
 */
export type QueueEventCallback = (event: JobEvent) => void;

/**
 * Represents a managed QueueEvents instance paired with its queue name.
 * Used internally to track and clean up listeners.
 */
export interface ManagedQueueEvents {
  /** The BullMQ queue name */
  queueName: string;
  /** The QueueEvents instance listening to this queue */
  queueEvents: QueueEvents;
}
