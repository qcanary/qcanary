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

import crypto from 'node:crypto';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
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
import { feedbackRouter } from './routes/feedback';
import { testimonialsPublicRouter, testimonialsRouter } from './routes/testimonials';
import { enterprisePublicRouter, enterpriseRouter } from './routes/enterprise';
import { newsletterRouter } from './routes/newsletter';
import { anomaliesRouter } from './routes/anomalies';
import { clerkMiddleware } from '@clerk/express';
import { requireDashboardAuth } from './middleware/dashboardAuth';
import { requireBearerAuth } from './middleware/bearerAuth';
import { supabase } from './lib/supabase';
import { redis } from './lib/redis';
import { httpLogger, logger } from './lib/logger';
import { pruneOldJobEvents } from './lib/retention';
import { sendOnboardingEmails } from './lib/onboarding';
import { dashboardRateLimit } from './middleware/rateLimit';
import { calculateBenchmarks } from './lib/benchmarks';
import { calculateBaselinesForAllQueues } from './lib/anomalies';
import { detectAnomalies } from './lib/anomalyDetection';
import { healthRouter } from './routes/health';
import { auditRouter } from './routes/audit';
import { exportRouter } from './routes/export';
import { sendDailyDigest } from './lib/digest';

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

// Daily benchmark cron — runs at 03:00 UTC (low traffic time)
cron.schedule('0 3 * * *', () => {
  void calculateBenchmarks()
    .then(() => {
      logger.info('Queue health benchmark calculation completed');
    })
    .catch((err) => {
      logger.error({ err }, 'Queue health benchmark calculation failed');
    });
}, {
  timezone: 'UTC',
});

// Hourly anomaly baseline calculation — runs at :15 past the hour
// (15 min after the benchmark cron to give metrics time to settle)
cron.schedule('15 * * * *', () => {
  void calculateBaselinesForAllQueues()
    .then(() => {
      logger.info('Anomaly baseline calculation completed');
    })
    .catch((err) => {
      logger.error({ err }, 'Anomaly baseline calculation failed');
    });
}, {
  timezone: 'UTC',
});

// Anomaly detection cron — runs every 15 minutes
cron.schedule('*/15 * * * *', () => {
  void (async () => {
    try {
      const { data: projects } = await supabase.from('projects').select('id');
      if (!projects) return;

      for (const project of projects as Array<{ id: string }>) {
        const anomalies = await detectAnomalies(project.id);
        if (anomalies.length > 0) {
          logger.info({ projectId: project.id, count: anomalies.length }, 'Anomalies detected');
          // TODO: Send alerts for detected anomalies
        }
      }
    } catch (err) {
      logger.error({ err }, 'Anomaly detection cron failed');
    }
  })();
}, {
  timezone: 'UTC',
});

// Daily onboarding email cron — runs at 10:00 UTC to catch business hours
cron.schedule('0 10 * * *', () => {
  void sendOnboardingEmails()
    .then((result) => {
      logger.info(result, 'Onboarding email cron completed');
    })
    .catch((err) => {
      logger.error({ err }, 'Onboarding email cron failed');
    });
}, {
  timezone: 'UTC',
});

// Daily digest cron — runs at 08:00 UTC
cron.schedule('0 8 * * *', () => {
  void sendDailyDigest()
    .then((result) => {
      logger.info(result, 'Daily digest cron completed');
    })
    .catch((err) => {
      logger.error({ err }, 'Daily digest cron failed');
    });
}, {
  timezone: 'UTC',
});

// ── Middleware ──────────────────────────────────────────────
// Request ID tracing — generates a unique ID per request for log correlation
app.use((req: Request, _res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  next();
});

app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
};
app.use(cors(corsOptions));
app.use(httpLogger);
app.use('/v1/billing', billingPublicRouter);
app.use(express.json({ limit: '1mb' }));
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}));

// ── Cached health check ────────────────────────────────────
// Cached for 5 seconds to reduce load on Supabase/Redis from load balancer pings
let healthCache: { status: number; body: string; expiresAt: number } | null = null;
const HEALTH_CACHE_TTL_MS = 5_000;

async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  const now = Date.now();
  if (healthCache && now < healthCache.expiresAt) {
    res.status(healthCache.status).json(JSON.parse(healthCache.body));
    return;
  }

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
  const body = JSON.stringify({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      service: 'qcanary-api',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
  });

  healthCache = {
    status: healthy ? 200 : 503,
    body,
    expiresAt: now + HEALTH_CACHE_TTL_MS,
  };

  res.status(healthy ? 200 : 503).json(JSON.parse(body));
}

app.get('/health', healthCheckHandler);
app.get('/v1/health', healthCheckHandler);

// ── Routes ─────────────────────────────────────────────────
app.use('/v1/ingest', ingestRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/feedback', feedbackRouter);

// Public submission endpoints (no auth)
app.use('/v1/testimonials', testimonialsPublicRouter);
app.use('/v1/enterprise', enterprisePublicRouter);
app.use('/v1/newsletter', newsletterRouter);

// Protected management endpoints (Bearer auth via API proxy)
app.use('/v1/testimonials', requireBearerAuth, dashboardRateLimit, testimonialsRouter);
app.use('/v1/enterprise', requireBearerAuth, dashboardRateLimit, enterpriseRouter);

app.use('/v1/projects', requireDashboardAuth, dashboardRateLimit, projectsRouter);
app.use('/v1/projects', requireDashboardAuth, dashboardRateLimit, queuesRouter);
app.use('/v1/projects', requireDashboardAuth, dashboardRateLimit, alertsRouter);
app.use('/v1/billing', requireDashboardAuth, dashboardRateLimit, billingRouter);
app.use('/v1/usage', requireDashboardAuth, dashboardRateLimit, usageRouter);
app.use('/v1/anomalies', requireDashboardAuth, dashboardRateLimit, anomaliesRouter);
app.use('/v1/health-scores', requireDashboardAuth, dashboardRateLimit, healthRouter);
app.use('/v1/audit', requireDashboardAuth, dashboardRateLimit, auditRouter);
app.use('/v1/export', requireDashboardAuth, dashboardRateLimit, exportRouter);

// ── Sentry Error Handler ───────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── 404 handler ────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
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
    // Gracefully disconnect Redis if it was ever initialized
    // Dynamic import avoids crash if module never loaded due to missing env vars
    try {
      const { getRedis } = await import('./lib/redis.js');
      try {
        getRedis().disconnect();
      } catch { /* never initialized — nothing to disconnect */ }
    } catch { /* module may not have loaded */ }
    logger.info('HTTP server closed — goodbye');
    process.exit(0);
  });

  // Force exit after 10-second timeout if server.close() hangs
  // Not unref()-ed: if server.close() never fires its callback (e.g., stuck connections),
  // the timeout keeps the event loop alive and forces the exit
  const forceExit = setTimeout(() => {
    logger.error('Shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);

}

process.on('SIGTERM', () => { void gracefulShutdown('SIGTERM'); });
process.on('SIGINT', () => { void gracefulShutdown('SIGINT'); });

// ── Startup validation ────────────────────────────────────
// Validate that all required env vars are present before accepting requests.
// This prevents a partially-configured deployment from serving traffic.
const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CLERK_SECRET_KEY',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name] || process.env[name]!.trim().length === 0);
if (missingVars.length > 0) {
  logger.error({ missingVars: missingVars.join(', ') }, 'Startup failed: missing required environment variables');
  process.exit(1);
}

// ── Start ──────────────────────────────────────────────────
server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Qcanary API started');
});

// Set server timeout to 30 seconds to prevent hanging connections
server.timeout = 30_000;
server.keepAliveTimeout = 65_000; // Slightly above ALB/nginx idle timeout

export default app;
