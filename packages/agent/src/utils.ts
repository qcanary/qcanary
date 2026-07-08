/**
 * @qcanary/agent — Utility helpers
 *
 * Pure utility functions used across the agent.
 * Every function here is synchronous and side-effect free unless noted.
 */

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

/** Generate an ISO-8601 timestamp string for the current moment */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Sleep for a given number of milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Calculate exponential backoff delay: base * 2^attempt (capped at 30s) */
export function backoffDelay(attempt: number, baseMs: number = 1000): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30_000);
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/** Truncate a string to maxLen, appending '…' if truncated */
export function truncate(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 1) + '\u2026';
}

/**
 * Safely convert any value to a string.
 * Returns the value's string form without throwing.
 */
export function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (value instanceof Error) return value.message;
  try {
    return String(value);
  } catch {
    return '[unserializable]';
  }
}

// ---------------------------------------------------------------------------
// Error extraction
// ---------------------------------------------------------------------------

/**
 * Extract error message and stack trace from BullMQ's failedReason string.
 *
 * BullMQ serializes the error as a single string in `failedReason`.
 * Sometimes this is just the message, sometimes it includes a stack trace.
 * We split on the first newline-at-pattern to separate message from stack.
 */
export function extractErrorInfo(failedReason: string): {
  message: string;
  stack: string | undefined;
} {
  if (!failedReason) {
    return { message: '', stack: undefined };
  }

  // BullMQ typically formats errors like:
  //   "Error: something went wrong\n    at SomeFunction (/path/to/file.js:10:5)"
  // We look for the first line that starts with whitespace + "at " to split.
  const lines = failedReason.split('\n');
  const stackStartIndex = lines.findIndex((line) =>
    /^\s+at\s/.test(line),
  );

  if (stackStartIndex === -1) {
    // No stack trace found — the entire string is the message
    return { message: failedReason.trim(), stack: undefined };
  }

  const message = lines.slice(0, stackStartIndex).join('\n').trim();
  const stack = lines.slice(stackStartIndex).join('\n');

  return {
    message: message || failedReason.trim(),
    stack: stack || undefined,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a string looks like a Qcanary API key.
 * Keys are created with the "qca_live_" prefix by the API.
 * This is a fast client-side check, not a security measure.
 */
export function isValidApiKeyFormat(key: string): boolean {
  return typeof key === 'string' && key.startsWith('qca_live_') && key.length >= 10;
}

/**
 * Noop function used as a default for optional callbacks.
 * Explicitly typed so TypeScript never infers `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}
