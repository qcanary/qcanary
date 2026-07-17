import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { insertRow } from '../lib/typedSupabase';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';

const router = express.Router();
router.use(express.json({ limit: '16kb' }));

// Rate limiting (in-memory)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    if (isRateLimited(clientIp)) {
      errorResponse(res, 429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
      return;
    }

    const { email } = req.body as { email?: string };
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Valid email is required');
      return;
    }
    const { error } = await insertRow('newsletter_subscribers', {
      email: email.toLowerCase().trim(),
      source: 'landing_page',
    });
    if (error) {
      if (error.code === '23505') { res.json({ success: true, message: 'Already subscribed' }); return; }
      logger.error({ err: error }, 'Failed to store newsletter subscriber');
      errorResponse(res, 500, 'STORE_FAILED', 'Failed to subscribe');
      return;
    }
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    logger.error({ err }, 'Unexpected error subscribing to newsletter');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

export { router as newsletterRouter };
