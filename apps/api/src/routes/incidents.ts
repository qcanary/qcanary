import express from 'express';
import type { Request, Response } from 'express';
import { detectActiveIncidents } from '../lib/incidents';
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
    if (!projectId) {
      errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project ID');
      return;
    }

    const incidents = await detectActiveIncidents(projectId);

    res.json({
      success: true,
      data: {
        incidents,
        count: incidents.length,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to detect incidents');
    errorResponse(res, 500, 'INCIDENT_DETECTION_FAILED', 'Failed to detect incidents');
  }
});

export { router as incidentsRouter };