import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { insertRow, updateRows } from '../lib/typedSupabase';
import { getResend, getResendFromAddress } from '../lib/resend';
import { errorResponse } from '../lib/responseUtils';
import { getAppUrl } from '../lib/validationUtils';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const publicRouter = express.Router();
const protectedRouter = express.Router();

// â”€â”€ Rate limiting (in-memory, public endpoint only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 2;
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

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

const VALID_RECOMMENDATIONS = ['definitely', 'probably', 'maybe', 'no'] as const;

publicRouter.use(express.json({ limit: '256kb' }));
protectedRouter.use(express.json({ limit: '256kb' }));

// â”€â”€ POST /submit â€” Public testimonial submission â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
publicRouter.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    if (isRateLimited(clientIp)) {
      errorResponse(res, 429, 'RATE_LIMITED', 'Too many submissions. Please try again later.');
      return;
    }

    const body = req.body as Record<string, unknown>;

    const name = sanitizeString(body.name, 100);
    const title = sanitizeString(body.title, 200);
    const company = sanitizeString(body.company, 200);
    const linkedinUrl = sanitizeString(body.linkedinUrl, 500);
    const testimonial = sanitizeString(body.testimonial, 1000);
    const recommendation = sanitizeString(body.recommendation, 20);
    const canDisplay = body.canDisplay === true;
    const canUseLogo = body.canUseLogo === true;

    // Validation
    const errors: string[] = [];
    if (!name) errors.push('Name is required');
    if (!title) errors.push('Title is required');
    if (!company) errors.push('Company is required');
    if (testimonial.length < 100) errors.push('Testimonial must be at least 100 characters');
    if (testimonial.length > 1000) errors.push('Testimonial must be 1000 characters or less');
    if (!VALID_RECOMMENDATIONS.includes(recommendation as typeof VALID_RECOMMENDATIONS[number])) {
      errors.push('Recommendation is required');
    }
    if (!canDisplay) errors.push('You must agree to display this testimonial');

    if (errors.length > 0) {
      errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '));
      return;
    }

    // Store in database
    const { error: dbError } = await insertRow('testimonials', {
      name,
      title,
      company,
      linkedin_url: linkedinUrl || null,
      testimonial,
      recommendation: recommendation as 'definitely' | 'probably' | 'maybe' | 'no',
      can_display: canDisplay,
      can_use_logo: canUseLogo,
      status: 'pending',
    });

    if (dbError) {
      logger.error({ err: dbError }, 'Failed to store testimonial');
      errorResponse(res, 500, 'STORE_FAILED', 'Failed to submit testimonial. Please try again.');
      return;
    }

    // Send notification email
    try {
      const resend = getResend();
      if (resend) {
        const fromAddress = getResendFromAddress();
        await resend.emails.send({
          from: fromAddress,
          to: fromAddress,
          subject: `[Testimonial] New submission from ${name} at ${company}`,
          html: [
            '<h1>New Testimonial Submission</h1>',
            `<p><strong>Name:</strong> ${name}</p>`,
            `<p><strong>Title:</strong> ${title}</p>`,
            `<p><strong>Company:</strong> ${company}</p>`,
            linkedinUrl ? `<p><strong>LinkedIn:</strong> ${linkedinUrl}</p>` : '',
            `<p><strong>Recommendation:</strong> ${recommendation}</p>`,
            `<hr/><blockquote>${testimonial}</blockquote>`,
            '<p>Log into the admin dashboard to review: <a href="${getAppUrl()}/testimonials">${getAppUrl()}/testimonials</a></p>',
          ].join(''),
        });
      }
    } catch (emailErr) {
      logger.warn({ err: emailErr }, 'Failed to send testimonial notification email');
    }

    res.status(200).json({
      success: true,
      message: 'Thank you! We\'ll review your testimonial and reach out if we have questions.',
    });
  } catch (err) {
    logger.error({ err }, 'Unexpected error processing testimonial submission');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

// â”€â”€ GET / â€” List testimonials (protected, admin only) â”€â”€â”€â”€â”€â”€â”€â”€
protectedRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    // Build query
    let query = supabase.from('testimonials').select('*', { count: 'exact' });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error({ err: error }, 'Failed to list testimonials');
      errorResponse(res, 500, 'LIST_FAILED', 'Failed to load testimonials.');
      return;
    }

    // Get counts per status
    const { data: countData } = await supabase.from('testimonials').select('status');
    const counts = { pending: 0, approved: 0, rejected: 0, total: 0 };
    if (countData) {
      const rows = countData as Array<{ status: string }>;
      counts.total = rows.length;
      for (const row of rows) {
        if (row.status in counts) counts[row.status as keyof typeof counts]++;
      }
    }

    res.json({
      success: true,
      data: {
        testimonials: data ?? [],
        total: counts.total,
        pending: counts.pending,
        approved: counts.approved,
        rejected: counts.rejected,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Unexpected error listing testimonials');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

// â”€â”€ PATCH /:id â€” Update testimonial status (protected) â”€â”€â”€â”€â”€â”€â”€
protectedRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const status = body.status as string | undefined;
    const rejectionReason = body.rejectionReason as string | undefined;
    const editedQuote = body.editedQuote as string | undefined;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'status must be pending, approved, or rejected');
      return;
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (rejectionReason && status === 'rejected') {
      updateData.rejection_reason = rejectionReason.slice(0, 500);
    }

    if (editedQuote && status === 'approved') {
      updateData.edited_quote = editedQuote.slice(0, 1000);
    }

    const { error } = await supabase
      .from('testimonials')
      .update(updateData as never)
      .eq('id', id);

    if (error) {
      logger.error({ err: error, id }, 'Failed to update testimonial');
      errorResponse(res, 500, 'UPDATE_FAILED', 'Failed to update testimonial.');
      return;
    }

    res.json({ success: true, data: { id, status } });
  } catch (err) {
    logger.error({ err }, 'Unexpected error updating testimonial');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

// â”€â”€ DELETE /:id â€” Delete testimonial (protected) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
protectedRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
      logger.error({ err: error, id }, 'Failed to delete testimonial');
      errorResponse(res, 500, 'DELETE_FAILED', 'Failed to delete testimonial.');
      return;
    }

    res.json({ success: true, data: { id } });
  } catch (err) {
    logger.error({ err }, 'Unexpected error deleting testimonial');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

export { publicRouter as testimonialsPublicRouter, protectedRouter as testimonialsRouter };