import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();

router.get('/:projectId/events', async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  try {
    const format = typeof req.query.format === 'string' ? req.query.format : 'json';
    const limit = Math.min(Number(req.query.limit) || 1000, 10000);
    const offset = Number(req.query.offset) || 0;
    const startDate = typeof req.query.start === 'string' ? req.query.start : undefined;
    const endDate = typeof req.query.end === 'string' ? req.query.end : undefined;
    const queueName = typeof req.query.queue === 'string' ? req.query.queue : undefined;

    let query = supabase
      .from('job_events')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false });

    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);
    if (queueName) query = query.eq('queue_name', queueName);

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      logger.error({ err: error, projectId }, 'Failed to export events');
      errorResponse(res, 500, 'EXPORT_FAILED', 'Failed to export events');
      return;
    }

    if (format === 'csv') {
      const headers = ['id', 'queue_name', 'job_id', 'job_name', 'event_type', 'status', 'duration_ms', 'attempts', 'error_message', 'environment', 'timestamp'];
      const rows = (data ?? []).map((row: Record<string, unknown>) =>
        headers.map((h) => String(row[h] ?? '')).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="events-${projectId}.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: {
          events: data ?? [],
          total: (data ?? []).length,
          limit,
          offset,
        },
      });
    }
  } catch (err) {
    logger.error({ err, projectId }, 'Failed to export events');
    errorResponse(res, 500, 'EXPORT_FAILED', 'Failed to export events');
  }
});

export { router as exportRouter };
