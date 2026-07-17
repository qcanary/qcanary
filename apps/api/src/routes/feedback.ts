import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { insertRow } from '../lib/typedSupabase';
import { getResend, getResendFromAddress } from '../lib/resend';
import { errorResponse } from '../lib/responseUtils';
import { escapeHtml } from '../lib/alertDelivery';
import { logger } from '../lib/logger';

const router = express.Router();

interface FeedbackApplication {
  name: string;
  email: string;
  company: string;
  queueCount: number;
  useCase: string;
  currentSolution: string;
  reason?: string;
  agreesToFeedback: boolean;
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

// Rate limiting: simple in-memory tracker (3 per IP per hour)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

router.use(express.json({ limit: '256kb' }));

router.post('/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    // Rate limit check
    const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    if (isRateLimited(clientIp)) {
      errorResponse(res, 429, 'RATE_LIMITED', 'Too many submissions. Please try again later.');
      return;
    }

    const body = req.body as Record<string, unknown>;

    // Validate required fields
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 200);
    const company = sanitizeString(body.company, 200);
    const queueCount = typeof body.queueCount === 'number' ? Math.floor(body.queueCount) : Number(body.queueCount);
    const useCase = sanitizeString(body.useCase, 2000);
    const currentSolution = sanitizeString(body.currentSolution, 200);
    const reason = sanitizeString(body.reason, 2000);
    const agreesToFeedback = body.agreesToFeedback === true;

    // Validation
    const errors: string[] = [];
    if (!name) errors.push('Name is required');
    if (!isValidEmail(email)) errors.push('A valid email address is required');
    if (!company) errors.push('Company/project name is required');
    if (isNaN(queueCount) || queueCount < 1 || queueCount > 100000) {
      errors.push('Queue count must be a number between 1 and 100,000');
    }
    if (!useCase) errors.push('Please describe what you use BullMQ for');
    if (!currentSolution) errors.push('Please select your current monitoring solution');
    if (!agreesToFeedback) errors.push('You must agree to provide feedback');

    if (errors.length > 0) {
      errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '));
      return;
    }

    // Store in database
    const { error: dbError } = await insertRow('feedback_applications', {
      name,
      email,
      company,
      queue_count: queueCount,
      use_case: useCase,
      current_solution: currentSolution,
      reason: reason || null,
      agrees_to_feedback: agreesToFeedback,
      status: 'pending',
    });

    if (dbError) {
      logger.error({ err: dbError, email }, 'Failed to store feedback application');
      errorResponse(res, 500, 'STORE_FAILED', 'Failed to submit application. Please try again.');
      return;
    }

    // Send notification email to founder
    try {
      const resend = getResend();
      if (resend) {
        const fromAddress = getResendFromAddress();
        await resend.emails.send({
          from: fromAddress,
          to: fromAddress, // Send to self (founder's email)
          subject: `[Feedback] New application from ${name} at ${company}`,
          html: [
            '<h1>New Feedback Application</h1>',
            `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
            `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
            `<p><strong>Company:</strong> ${escapeHtml(company)}</p>`,
            `<p><strong>Queue Count:</strong> ${queueCount}</p>`,
            `<p><strong>Use Case:</strong> ${useCase}</p>`,
            `<p><strong>Current Solution:</strong> ${escapeHtml(currentSolution)}</p>`,
            reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : '',
            `<p><strong>Agreed to Feedback:</strong> ${agreesToFeedback ? 'Yes' : 'No'}</p>`,
            '<hr/>',
            '<p>Log into Supabase to view all applications: <a href="https://supabase.com">https://supabase.com</a></p>',
          ].join(''),
        });
      }
    } catch (emailErr) {
      // Don't fail the request if email fails â€” data is stored
      logger.warn({ err: emailErr }, 'Failed to send feedback application notification email');
    }

    res.status(200).json({
      success: true,
      message: 'Application received. We\'ll review it within 24 hours.',
    });
  } catch (err) {
    logger.error({ err }, 'Unexpected error processing feedback application');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again.');
  }
});

export { router as feedbackRouter };