import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();

// GET /layout/:projectId — Get user's dashboard layout
router.get('/layout/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as DashboardAuthedRequest;
    const userId = authReq.clerkUserId;
    const { projectId } = req.params;

    if (!userId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'User context required');
      return;
    }

    const { data, error } = await supabase
      .from('dashboard_layouts' as never)
      .select('layout')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      // Return default layout
      res.json({
        success: true,
        data: {
          layout: [
            { id: 'queue-overview', type: 'queue-overview', x: 0, y: 0, w: 2, h: 1 },
            { id: 'health-score', type: 'health-score', x: 2, y: 0, w: 1, h: 1 },
            { id: 'recent-events', type: 'recent-events', x: 0, y: 1, w: 3, h: 1 },
          ],
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { layout: (data as Record<string, unknown>).layout },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to load dashboard layout');
    errorResponse(res, 500, 'LAYOUT_LOAD_FAILED', 'Failed to load dashboard layout');
  }
});

// PUT /layout/:projectId — Save user's dashboard layout
router.put('/layout/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as DashboardAuthedRequest;
    const userId = authReq.clerkUserId;
    const { projectId } = req.params;
    const { layout } = req.body as { layout?: unknown };

    if (!userId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'User context required');
      return;
    }

    if (!Array.isArray(layout)) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Layout must be an array');
      return;
    }

    const { error } = await supabase
      .from('dashboard_layouts' as never)
      .upsert({
        user_id: userId,
        project_id: projectId,
        layout,
        updated_at: new Date().toISOString(),
      } as never, { onConflict: 'user_id,project_id' });

    if (error) {
      logger.error({ err: error }, 'Failed to save dashboard layout');
      errorResponse(res, 500, 'LAYOUT_SAVE_FAILED', 'Failed to save dashboard layout');
      return;
    }

    res.json({ success: true, message: 'Layout saved' });
  } catch (err) {
    logger.error({ err }, 'Failed to save dashboard layout');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

export { router as dashboardRouter };
