/**
 * @qcanary/agent — TypeScript interfaces
 *
 * All shared types for the Qcanary monitoring agent.
 */

/** Configuration options for QueueMonitor */
export interface QueueMonitorOptions {
  /** Your Qcanary API key (required) */
  apiKey: string;

  /** Qcanary API base URL (defaults to https://api.qcanary.dev) */
  apiBaseUrl?: string;

  /** Include job payload data in events (default: false) */
  includePayload?: boolean;

  /** Buffer flush interval in milliseconds (default: 5000) */
  flushIntervalMs?: number;

  /** Max events to buffer before forcing a flush (default: 100) */
  maxBufferSize?: number;

  /** Max retry attempts for failed HTTP sends (default: 3) */
  maxRetries?: number;

  /** Environment tag sent with every event (default: 'production') */
  environment?: string;
}

/** A single job event captured by the agent */
export interface JobEvent {
  queueName: string;
  jobId: string;
  jobName?: string;
  eventType: string;
  status: string;
  durationMs?: number;
  attempts?: number;
  errorMessage?: string;
  errorStack?: string;
  environment?: string;
  timestamp: string;
}

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
