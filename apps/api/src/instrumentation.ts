import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,
    integrations: [
      Sentry.expressIntegration(),
      nodeProfilingIntegration(),
    ],
  });
}

/**
 * Required export for Node.js instrumentation hook compatibility.
 * Sentry uses this hook to instrument modules before they are loaded.
 */
export function register() {
  // No-op — Sentry.init() is called at module scope above.
}
