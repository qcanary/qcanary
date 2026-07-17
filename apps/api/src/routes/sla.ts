import express from 'express';
import type { Request, Response } from 'express';
import { calculateSlaMetrics } from '../lib/sla';
import { errorResponse } from '../lib/responseUtils';
import { ensureProjectOwnership } from '../lib/projectOwnership';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const VALID_PERIODS = ['24h', '7d', '30d'] as const;
type SlaPeriod = typeof VALID_PERIODS[number];

const router = express.Router();

router.get('/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.params.projectId === 'string' ? req.params.projectId : '';

    // Verify project belongs to user's team
    const teamId = (req as DashboardAuthedRequest).teamId || '';
    const ownership = await ensureProjectOwnership(projectId, teamId);
    if (!ownership.ok) {
      errorResponse(res, ownership.statusCode, ownership.code, ownership.message);
      return;
    }
    if (!projectId) {
      errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project ID');
      return;
    }

    const rawPeriod = String(req.query.period ?? '');
    const period: SlaPeriod = VALID_PERIODS.includes(rawPeriod as SlaPeriod)
      ? (rawPeriod as SlaPeriod)
      : '24h';

    const metrics = await calculateSlaMetrics(projectId, period);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to calculate SLA metrics');
    errorResponse(res, 500, 'SLA_CALC_FAILED', 'Failed to calculate SLA metrics');
  }
});

export { router as slaRouter };