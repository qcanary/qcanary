import express from 'express';
import type { Request, Response } from 'express';
import { detectAnomalies } from '../lib/anomalyDetection';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';

const router = express.Router();

router.get('/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.params.projectId === 'string' ? req.params.projectId : '';
    if (!projectId) {
      errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project ID');
      return;
    }

    const anomalies = await detectAnomalies(projectId);

    res.json({
      success: true,
      data: {
        anomalies,
        count: anomalies.length,
        hasCritical: anomalies.some((a) => a.severity === 'critical'),
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to detect anomalies');
    errorResponse(res, 500, 'ANOMALY_DETECTION_FAILED', 'Failed to detect anomalies');
  }
});

export { router as anomaliesRouter };
