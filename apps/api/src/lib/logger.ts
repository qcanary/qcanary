/**
 * Pino logger configuration
 *
 * Provides a structured JSON logger with levels, timestamps, and
 * redaction of sensitive fields.
 *
 * Use `req.log` inside route handlers (injected by pino-http middleware).
 * Use the standalone `logger` export in workers and non-request contexts.
 */

import pino from 'pino';
import pinoHttp from 'pino-http';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Standalone logger for use outside request contexts (workers, lib files).
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino/file',
        options: { destination: 1 }, // stdout
      },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.apiKey', 'body.key'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

/**
 * Express middleware that attaches `req.log` to every incoming request.
 * Logs each request on completion with method, url, status code, and duration.
 */
export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      // Don't log health check spam
      const url = (req as { url?: string }).url ?? '';
      return url === '/health' || url === '/v1/health';
    },
  },
  customReceivedMessage: (req) => {
    return `--> ${(req as { method?: string }).method ?? '?'} ${(req as { url?: string }).url ?? '?'}`;
  },
  customSuccessMessage: (req, res) => {
    return `<-- ${(req as { method?: string }).method ?? '?'} ${(req as { url?: string }).url ?? '?'} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `<-- ${(req as { method?: string }).method ?? '?'} ${(req as { url?: string }).url ?? '?'} ${res.statusCode} ${err?.message ?? ''}`;
  },
});
