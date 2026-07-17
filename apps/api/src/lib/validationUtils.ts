/**
 * Shared validation utilities for API routes.
 */

/** Validate email format */
export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Sanitize and truncate a string input */
export function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/** Get the application URL from environment or fallback */
export function getAppUrl(): string {
  return (process.env.APP_URL || 'https://qcanary.dev').replace(/\/+$/, '');
}
