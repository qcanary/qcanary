/**
 * @qcanary/agent — Utility helpers
 */

/** Generate an ISO-8601 timestamp string for the current moment */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Truncate a string to maxLen, appending '…' if truncated */
export function truncate(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen - 1) + '\u2026';
}

/** Sleep for a given number of milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Calculate exponential backoff delay: base * 2^attempt (capped at 30s) */
export function backoffDelay(attempt: number, baseMs: number = 1000): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30_000);
}
