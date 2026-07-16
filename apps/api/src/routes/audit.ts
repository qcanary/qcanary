import express from 'express';
import type { Request, Response } from 'express';
import { queryAuditLogs } from '../lib/auditLog';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as DashboardAuthedRequest;
    const teamId = authReq.teamId;
    if (!teamId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'Team context required');
      return;
    }

    const { logs, total } = await queryAuditLogs(teamId, {
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
      action: typeof req.query.action === 'string' ? req.query.action : undefined,
      resourceType: typeof req.query.resource_type === 'string' ? req.query.resource_type : undefined,
      startDate: typeof req.query.start === 'string' ? req.query.start : undefined,
      endDate: typeof req.query.end === 'string' ? req.query.end : undefined,
    });

    res.json({
      success: true,
      data: { logs, total },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to query audit logs');
    errorResponse(res, 500, 'AUDIT_QUERY_FAILED', 'Failed to load audit logs');
  }
});

export { router as auditRouter };
