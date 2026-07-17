import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { insertRow } from '../lib/typedSupabase';
import { getAppUrl } from '../lib/validationUtils';
import { getResend, getResendFromAddress } from '../lib/resend';
import { errorResponse } from '../lib/responseUtils';
import { logger } from '../lib/logger';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';
import crypto from 'node:crypto';

const router = express.Router();

// POST /invite â€” Invite a team member
router.post('/invite', async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as DashboardAuthedRequest;
    const teamId = authReq.teamId;
    const userId = authReq.clerkUserId;

    if (!teamId || !userId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'Team context required');
      return;
    }

    const { email, role } = req.body as { email?: string; role?: string };

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Valid email is required');
      return;
    }

    const validRoles = ['admin', 'engineer', 'viewer'];
    const memberRole = validRoles.includes(role ?? '') ? role! : 'engineer';

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await insertRow('team_invites' as never, {
      team_id: teamId,
      email: email.toLowerCase().trim(),
      role: memberRole,
      invited_by: userId,
      token,
      expires_at: expiresAt,
    } as never);

    if (error) {
      if (error.code === '23505') {
        res.json({ success: true, message: 'Invite already sent to this email' });
        return;
      }
      logger.error({ err: error }, 'Failed to create invite');
      errorResponse(res, 500, 'INVITE_FAILED', 'Failed to create invite');
      return;
    }

    // Send invite email
    const resend = getResend();
    if (resend) {
      const fromAddress = getResendFromAddress();
    const inviteUrl = `${getAppUrl()}/accept-invite?token=${token}`;

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: 'You\'ve been invited to join QCanary',
        html: [
          '<div style="font-family:Inter,Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px">',
          '<h2 style="color:#059669">You\'re invited!</h2>',
          '<p>You\'ve been invited to join a QCanary team. Click below to accept:</p>',
          `<a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:500">Accept Invitation</a>`,
          '<p style="color:#999;font-size:12px;margin-top:20px">This link expires in 7 days.</p>',
          '</div>',
        ].join(''),
      });
    }

    res.json({ success: true, message: 'Invite sent' });
  } catch (err) {
    logger.error({ err }, 'Failed to send invite');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

// POST /accept â€” Accept an invite
router.post('/accept', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body as { token?: string };

    if (!token || typeof token !== 'string') {
      errorResponse(res, 400, 'VALIDATION_ERROR', 'Token is required');
      return;
    }

    const { data: invite, error: inviteError } = await supabase
      .from('team_invites' as never)
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invite) {
      errorResponse(res, 400, 'INVALID_TOKEN', 'Invalid or expired invite');
      return;
    }

    const inviteData = invite as Record<string, unknown>;
    const expiresAt = new Date(inviteData.expires_at as string);
    if (expiresAt < new Date()) {
      errorResponse(res, 400, 'EXPIRED', 'Invite has expired');
      return;
    }

    // Mark invite as accepted
    await supabase
      .from('team_invites' as never)
      .update({ accepted_at: new Date().toISOString() } as never)
      .eq('token', token);

    res.json({
      success: true,
      data: {
        teamId: inviteData.team_id,
        role: inviteData.role,
        email: inviteData.email,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to accept invite');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

// GET / â€” List pending invites
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as DashboardAuthedRequest;
    const teamId = authReq.teamId;
    if (!teamId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'Team context required');
      return;
    }

    const { data: invites, error } = await supabase
      .from('team_invites' as never)
      .select('id, email, role, invited_by, created_at, accepted_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      errorResponse(res, 500, 'LIST_FAILED', 'Failed to load invites');
      return;
    }

    res.json({
      success: true,
      data: { invites: invites ?? [] },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to list invites');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

// DELETE /:id â€” Revoke an invite
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as DashboardAuthedRequest;
    const teamId = authReq.teamId;

    const { error } = await supabase
      .from('team_invites' as never)
      .delete()
      .eq('id', id)
      .eq('team_id', teamId!);

    if (error) {
      errorResponse(res, 500, 'DELETE_FAILED', 'Failed to revoke invite');
      return;
    }

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, 'Failed to revoke invite');
    errorResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
});

export { router as ssoRouter };