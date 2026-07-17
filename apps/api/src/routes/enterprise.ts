import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { insertRow } from '../lib/typedSupabase';
import { getResend, getResendFromAddress } from '../lib/resend';
import { errorResponse } from '../lib/responseUtils';
import { getAppUrl } from '../lib/validationUtils';
import { logger } from '../lib/logger';

const publicRouter = express.Router();
const protectedRouter = express.Router();

// â”€â”€ Rate limiting (in-memory, public endpoint only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 2;
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

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

const VALID_TEAM_SIZES = ['1-10', '11-50', '51-200', '200+'] as const;
const VALID_DEPLOYMENTS = ['Docker Compose', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'On-premise', 'Not sure yet'] as const;
const VALID_TIMELINES = ['ASAP', 'This quarter', 'Next quarter', 'Just exploring'] as const;

publicRouter.use(express.json({ limit: '256kb' }));
protectedRouter.use(express.json({ limit: '256kb' }));

// â”€â”€ POST /inquiry â€” Public enterprise inquiry submission â”€â”€â”€â”€â”€
publicRouter.post('/inquiry', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    if (isRateLimited(clientIp)) {
      errorResponse(res, 429, 'RATE_LIMITED', 'Too many submissions. Please try again later.');
      return;
    }

    const body = req.body as Record<string, unknown>;

    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 200);
    const company = sanitizeString(body.company, 200);
    const teamSize = sanitizeString(body.teamSize, 20);
    const industry = sanitizeString(body.industry, 100);
    const currentSetup = sanitizeString(body.currentSetup, 2000);
    const reason = sanitizeString(body.reason, 2000);
    const deployment = sanitizeString(body.deployment, 50);
    const timeline = sanitizeString(body.timeline, 50);

    // Validation
    const errors: string[] = [];
    if (!name) errors.push('Name is required');
    if (!isValidEmail(email)) errors.push('A valid work email is required');
    if (!company) errors.push('Company name is required');
    if (!VALID_TEAM_SIZES.includes(teamSize as typeof VALID_TEAM_SIZES[number])) {
      errors.push('Team size is required');
    }
    if (!industry) errors.push('Industry is required');
    if (!currentSetup) errors.push('Please describe your current queue setup');

    if (errors.length > 0) {
      errorResponse(res, 400, 'VALIDATION_ERROR', errors.join('; '));
      return;
    }

    // Store in database
    const { error: dbError } = await insertRow('enterprise_inquiries', {
      name,
      email,
      company,
      team_size: teamSize,
      industry,
      current_setup: currentSetup,
      reason: reason || null,
      deployment: deployment || null,
      timeline: timeline || null,
      status: 'new',
    });

    if (dbError) {
      logger.error({ err: dbError, email }, 'Failed to store enterprise inquiry');
      errorResponse(res, 500, 'STORE_FAILED', 'Failed to submit inquiry. Please try again.');
      return;
    }

    // Send notification email to founder
    try {
      const resend = getResend();
      if (resend) {
        const fromAddress = getResendFromAddress();
        await resend.emails.send({
          from: fromAddress,
          to: fromAddress,
          subject: `[Enterprise] New inquiry from ${name} at ${company}`,
          html: [
            '<h1>New Enterprise Inquiry</h1>',
            `<p><strong>Name:</strong> ${name}</p>`,
            `<p><strong>Email:</strong> ${email}</p>`,
            `<p><strong>Company:</strong> ${company}</p>`,
            `<p><strong>Team Size:</strong> ${teamSize}</p>`,
            `<p><strong>Industry:</strong> ${industry}</p>`,
            `<p><strong>Current Setup:</strong> ${currentSetup}</p>`,
            reason ? `<p><strong>Why self-hosted:</strong> ${reason}</p>` : '',
            deployment ? `<p><strong>Preferred Deployment:</strong> ${deployment}</p>` : '',
            timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : '',
            '<hr/>',
            '<p>Log into the admin dashboard to view: <a href="${getAppUrl()}/enterprise">${getAppUrl()}/enterprise</a></p>',
          ].join(''),
        });

        // Send auto-reply to the submitter
        await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: `Thanks for your inquiry, ${name}`,
          html: [
            '<h1>Thanks for reaching out</h1>',
            `<p>Hi ${name},</p>`,
            '<p>Thanks for your interest in QCanary Enterprise. We\'ve received your inquiry and will review it within 24 hours.</p>',
            '<p>If you\'d like to speak with us sooner, reply to this email and we\'ll fast-track your request.</p>',
            '<hr/>',
            '<p style="color: #666; font-size: 12px;">QCanary â€” Monitor BullMQ without exposing Redis</p>',
          ].join(''),
        });
      }
    } catch (emailErr) {
      // Don't fail the request if email fails â€” data is stored
      logger.warn({ err: emailErr }, 'Failed to send enterprise inquiry notification email');
    }

    res.status(200).json({
      success: true,
      message: "Thanks for your inquiry! We'll get back to you within 24 hours.",
    });
  } catch (err) {
    logger.error({ err }, 'Unexpected error processing enterprise inquiry');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again.');
  }
});

// â”€â”€ GET / â€” List inquiries (protected, admin only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
protectedRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let query = supabase.from('enterprise_inquiries').select('*', { count: 'exact' });

    if (status && ['new', 'contacted', 'qualified', 'closed-won', 'closed-lost'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error({ err: error }, 'Failed to list enterprise inquiries');
      errorResponse(res, 500, 'LIST_FAILED', 'Failed to load inquiries.');
      return;
    }

    // Get counts per status
    const { data: countData } = await supabase.from('enterprise_inquiries').select('status');
    const statuses = ['new', 'contacted', 'qualified', 'closed-won', 'closed-lost'] as const;
    const counts: Record<string, number> = { total: 0 };
    for (const s of statuses) counts[s] = 0;
    if (countData) {
      const rows = countData as Array<{ status: string }>;
      counts.total = rows.length;
      for (const row of rows) {
        if (row.status in counts) counts[row.status]++;
      }
    }

    res.json({
      success: true,
      data: {
        inquiries: data ?? [],
        ...counts,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Unexpected error listing enterprise inquiries');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

// â”€â”€ PATCH /:id â€” Update inquiry status/notes (protected) â”€â”€â”€â”€â”€
protectedRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const status = body.status as string | undefined;
    const notes = body.notes as string | undefined;

    const validStatuses = ['new', 'contacted', 'qualified', 'closed-won', 'closed-lost'];

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }

    if (typeof notes === 'string') {
      updateData.notes = notes.slice(0, 2000);
    }

    const { error } = await supabase
      .from('enterprise_inquiries')
      .update(updateData as never)
      .eq('id', id);

    if (error) {
      logger.error({ err: error, id }, 'Failed to update enterprise inquiry');
      errorResponse(res, 500, 'UPDATE_FAILED', 'Failed to update inquiry.');
      return;
    }

    res.json({ success: true, data: { id, status, notes } });
  } catch (err) {
    logger.error({ err }, 'Unexpected error updating enterprise inquiry');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

// â”€â”€ DELETE /:id â€” Delete inquiry (protected) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
protectedRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('enterprise_inquiries').delete().eq('id', id);

    if (error) {
      logger.error({ err: error, id }, 'Failed to delete enterprise inquiry');
      errorResponse(res, 500, 'DELETE_FAILED', 'Failed to delete inquiry.');
      return;
    }

    res.json({ success: true, data: { id } });
  } catch (err) {
    logger.error({ err }, 'Unexpected error deleting enterprise inquiry');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
  }
});

export { publicRouter as enterprisePublicRouter, protectedRouter as enterpriseRouter };