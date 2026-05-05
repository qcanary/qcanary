/**
 * @qcanary/agent — HTTP transport
 *
 * Buffers JobEvents and POSTs them to the Qcanary ingest API.
 *
 * AGENT RULES:
 *  #4 — Buffer events; flush every flushInterval OR when buffer hits max size
 *  #5 — Retry failed HTTP silently — max N attempts with exponential backoff, then drop
 *  #6 — TypeScript strict — no `any`
 */

import type { ApiResponse, IngestPayload, JobEvent } from './types';
import { backoffDelay, noop, sleep } from './utils';

export interface EventTransportOptions {
  apiKey: string;
  /** Base URL only (no trailing path); e.g. https://api.qcanary.dev */
  apiBaseUrl: string;
  flushIntervalMs: number;
  maxBufferSize: number;
  maxRetries: number;
  onError: (error: Error) => void;
}

export class EventTransport {
  private readonly apiKey: string;
  private readonly ingestUrl: string;
  private readonly flushIntervalMs: number;
  private readonly maxBufferSize: number;
  private readonly maxRetries: number;
  private readonly onError: (error: Error) => void;

  private buffer: JobEvent[] = [];
  private timer: ReturnType<typeof setInterval> | undefined;
  /** Serializes flush operations so concurrent timer / max-buffer flushes do not overlap */
  private flushChain: Promise<void> = Promise.resolve();
  private stopped = false;

  constructor(options: EventTransportOptions) {
    this.apiKey = options.apiKey;
    this.ingestUrl = buildIngestUrl(options.apiBaseUrl);
    this.flushIntervalMs = options.flushIntervalMs;
    this.maxBufferSize = options.maxBufferSize;
    this.maxRetries = options.maxRetries;
    this.onError = options.onError;
  }

  /**
   * Start the periodic flush timer. Idempotent.
   */
  start(): void {
    if (this.stopped || this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      this.scheduleFlush();
    }, this.flushIntervalMs);
    // Avoid holding the process open solely because of the timer (Node.js)
    if (typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  /**
   * Stop the timer and flush any remaining events. Safe to call multiple times.
   */
  async stop(): Promise<void> {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    await this.flushChain;
    await this.flushInternal();
    this.stopped = true;
  }

  /** Push an event into the buffer; may trigger an immediate flush */
  enqueue(event: JobEvent): void {
    if (this.stopped) {
      return;
    }
    this.buffer.push(event);
    if (this.buffer.length >= this.maxBufferSize) {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    this.flushChain = this.flushChain.then(() => this.flushInternal());
  }

  private async flushInternal(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }
    const batch = this.buffer.splice(0, this.buffer.length);
    await this.postWithRetries(batch);
  }

  /**
   * POST batch with up to maxRetries attempts and exponential backoff between failures.
   * Never throws to callers — failures are swallowed after retries (agent rule #5).
   */
  private async postWithRetries(events: JobEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const body: IngestPayload = { events };

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(this.ingestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          return;
        }

        const apiErr = await parseApiError(response);
        this.safeOnError(
          new Error(
            `Qcanary ingest failed (${response.status}): ${apiErr ?? response.statusText}`,
          ),
        );
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(String(error));
        this.safeOnError(err);
      }

      if (attempt < this.maxRetries - 1) {
        await sleep(backoffDelay(attempt));
      }
    }
    // Exhausted retries — drop batch silently (agent rule #5)
  }

  private safeOnError(error: Error): void {
    try {
      this.onError(error);
    } catch {
      noop();
    }
  }
}

function buildIngestUrl(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/v1/ingest`;
}

async function parseApiError(response: Response): Promise<string | undefined> {
  try {
    const json: unknown = await response.json();
    if (
      typeof json === 'object' &&
      json !== null &&
      'error' in json &&
      typeof (json as ApiResponse).error === 'object' &&
      (json as ApiResponse).error !== null
    ) {
      const e = (json as ApiResponse).error;
      if (e && typeof e === 'object' && 'message' in e) {
        const msg = (e as { message?: unknown }).message;
        return typeof msg === 'string' ? msg : undefined;
      }
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}
