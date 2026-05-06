import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { ingestRouter } from './routes/ingest';
import { projectsRouter } from './routes/projects';
import { queuesRouter } from './routes/queues';
import { alertsRouter } from './routes/alerts';
import { billingRouter } from './routes/billing';
import { clerkMiddleware } from '@clerk/express';
import { requireDashboardAuth } from './middleware/dashboardAuth';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('short'));
app.use('/v1/billing', billingRouter);
app.use(express.json({ limit: '1mb' }));
app.use(clerkMiddleware());

// ── Health Check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'qcanary-api',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'qcanary-api',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/v1/ingest', ingestRouter);
app.use('/v1/projects', requireDashboardAuth, projectsRouter);
app.use('/v1/projects', requireDashboardAuth, queuesRouter);
app.use('/v1/projects', requireDashboardAuth, alertsRouter);

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

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🐤 Qcanary API running on port ${PORT}`);
});

export default app;
