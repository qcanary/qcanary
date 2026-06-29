import './instrumentation';

import dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/node';

// ── Global unhandled error handlers ─────────────────────────
process.on('unhandledRejection', (reason) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(reason, { level: 'error' });
  }
  logger.error({ err: reason }, 'Unhandled rejection detected');
});

process.on('uncaughtException', (err) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, { level: 'fatal' });
  }
  logger.error({ err }, 'Uncaught exception — exiting');
  // Exit uncleanly — process is in unknown state
  setImmediate(() => process.exit(1));
});

import express from 'express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cron from 'node-cron';
import { ingestRouter } from './routes/ingest';
import { projectsRouter } from './routes/projects';
import { queuesRouter } from './routes/queues';
import { alertsRouter } from './routes/alerts';
import { billingPublicRouter, billingRouter } from './routes/billing';
import { usageRouter } from './routes/usage';
import { notificationsRouter } from './routes/notifications';
import { clerkMiddleware } from '@clerk/express';
import { requireDashboardAuth } from './middleware/dashboardAuth';
import { supabase } from './lib/supabase';
import { redis } from './lib/redis';
import { httpLogger, logger } from './lib/logger';
import { pruneOldJobEvents } from './lib/retention';

const app = express();
const PORT = process.env.PORT || 4000;

cron.schedule('0 0 * * *', () => {
  void pruneOldJobEvents()
    .then((result) => {
      logger.info(result, 'Daily retention cron completed');
    })
    .catch((err) => {
      logger.error({ err }, 'Daily retention cron failed');
    });
}, {
  timezone: 'UTC',
});

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
}));
app.use(httpLogger);
app.use('/v1/billing', billingPublicRouter);
app.use(express.json({ limit: '1mb' }));
app.use(clerkMiddleware());

// ── Shared health check logic ──────────────────────────────
async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    const { error } = await supabase.from('teams').select('id').limit(1);
    dbStatus = error ? 'disconnected' : 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'disconnected';
  }

  const healthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      service: 'qcanary-api',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
  });
}

app.get('/health', healthCheckHandler);
app.get('/v1/health', healthCheckHandler);

// ── Routes ─────────────────────────────────────────────────
app.use('/v1/ingest', ingestRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/projects', requireDashboardAuth, projectsRouter);
app.use('/v1/projects', requireDashboardAuth, queuesRouter);
app.use('/v1/projects', requireDashboardAuth, alertsRouter);
app.use('/v1/billing', requireDashboardAuth, billingRouter);
app.use('/v1/usage', requireDashboardAuth, usageRouter);

// ── Sentry debug route (for testing) ──────────────────────
app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!');
});

// ── Sentry Error Handler ───────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  });
});

// ── Graceful Shutdown ──────────────────────────────────────
let server: ReturnType<typeof app.listen>;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    try {
      if (process.env.SENTRY_DSN) {
        await Sentry.close(2000);
      }
    } catch (sentryErr) {
      logger.error({ err: sentryErr }, 'Sentry close error during shutdown');
    }
    try {
      redis.disconnect();
    } catch (redisErr) {
      logger.error({ err: redisErr }, 'Redis disconnect error during shutdown');
    }
    logger.info('HTTP server closed — goodbye');
    process.exit(0);
  });

  // Force exit after 10-second timeout if server.close() hangs
  const forceExit = setTimeout(() => {
    logger.error('Shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);

  forceExit.unref();
}

process.on('SIGTERM', () => { void gracefulShutdown('SIGTERM'); });
process.on('SIGINT', () => { void gracefulShutdown('SIGINT'); });

// ── Start ──────────────────────────────────────────────────
server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Qcanary API started');
});

export default app;
