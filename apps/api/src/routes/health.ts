import express from 'express';
import type { Request, Response } from 'express';
import { calculateQueueHealthScores } from '../lib/healthScore';
import { errorResponse } from '../lib/responseUtils';
import { ensureProjectOwnership } from '../lib/projectOwnership';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

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
    const scores = await calculateQueueHealthScores(projectId);

    const worstGrade = scores.length > 0 ? scores[0].grade : null;
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : null;

    res.json({
      success: true,
      data: {
        scores,
        overallScore,
        worstGrade,
        queueCount: scores.length,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to calculate health scores');
    errorResponse(res, 500, 'HEALTH_CALC_FAILED', 'Failed to calculate health scores');
  }
});

export { router as healthRouter };