import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { createCheckoutSession } from '../lib/razorpay';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();
const publicRouter = express.Router();

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Missing required environment variable: RAZORPAY_WEBHOOK_SECRET');
}

function errorResponse(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function resolvePlanFromPlanId(planId: string | null | undefined): 'starter' | 'pro' | null {
  if (!planId) {
    return null;
  }

  if (planId === process.env.RAZORPAY_STARTER_PLAN_ID) {
    return 'starter';
  }

  if (planId === process.env.RAZORPAY_PRO_PLAN_ID) {
    return 'pro';
  }

  return null;
}

async function updateTeamPlanById(
  teamId: string,
  plan: 'free' | 'starter' | 'pro',
  planExpiresAt: string | null
): Promise<void> {
  await supabase
    .from('teams')
    .update({ plan, plan_expires_at: planExpiresAt } as never)
    .eq('id', teamId);
}

interface RazorpaySubscriptionPayload {
  id?: string;
  plan_id?: string;
  customer_id?: string;
  current_end?: number;
  notes?: Record<string, string | undefined>;
}

function verifyWebhook(rawBody: Buffer, signature: string): boolean {
  const digest = crypto.createHmac('sha256', webhookSecret as string).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

async function handleSubscriptionActivated(subscription: RazorpaySubscriptionPayload): Promise<void> {
  const teamId = typeof subscription.notes?.teamId === 'string' ? subscription.notes.teamId : '';
  const planFromNotes =
    subscription.notes?.plan === 'starter' || subscription.notes?.plan === 'pro' ? subscription.notes.plan : null;
  const plan = planFromNotes ?? resolvePlanFromPlanId(subscription.plan_id);

  if (!teamId || !plan) {
    return;
  }

  const periodEnd =
    typeof subscription.current_end === 'number'
      ? new Date(subscription.current_end * 1000).toISOString()
      : null;
  await updateTeamPlanById(teamId, plan, periodEnd);
}

async function handleSubscriptionCancelled(subscription: RazorpaySubscriptionPayload): Promise<void> {
  const teamId = typeof subscription.notes?.teamId === 'string' ? subscription.notes.teamId : '';
  if (!teamId) {
    return;
  }
  await updateTeamPlanById(teamId, 'free', null);
}

publicRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.header('x-razorpay-signature');
  if (!signature) {
    errorResponse(res, 400, 'MISSING_SIGNATURE', 'Missing x-razorpay-signature header');
    return;
  }

  const rawBody = req.body as Buffer;
  if (!verifyWebhook(rawBody, signature)) {
    errorResponse(res, 400, 'INVALID_SIGNATURE', 'Webhook signature verification failed');
    return;
  }

  type RazorpayEventBody = {
    event?: string;
    payload?: {
      subscription?: {
        entity?: RazorpaySubscriptionPayload;
      };
    };
  };

  let parsed: RazorpayEventBody;
  try {
    parsed = JSON.parse(rawBody.toString('utf8')) as RazorpayEventBody;
  } catch {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'Invalid webhook payload');
    return;
  }
  const eventName = typeof parsed.event === 'string' ? parsed.event : '';
  const subscription = parsed.payload?.subscription?.entity;

  try {
    switch (eventName) {
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.resumed':
        if (subscription) {
          await handleSubscriptionActivated(subscription);
        }
        break;
      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted':
      case 'subscription.paused':
        if (subscription) {
          await handleSubscriptionCancelled(subscription);
        }
        break;
      default:
        break;
    }
  } catch {
    // Intentionally swallow handler errors so webhook endpoint remains stable.
  }

  res.status(200).json({
    success: true,
    data: { received: true },
  });
});

router.use(express.json({ limit: '1mb' }));

function requireTeamId(req: DashboardAuthedRequest, res: Response): string | null {
  const teamId = typeof req.teamId === 'string' ? req.teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

router.post('/checkout-session', async (req: Request, res: Response) => {
  const teamId = requireTeamId(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }
  const { plan } = req.body as { plan?: unknown };

  if (plan !== 'starter' && plan !== 'pro') {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'plan must be starter or pro');
    return;
  }

  try {
    const session = await createCheckoutSession(teamId, plan);
    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.checkoutUrl,
        sessionId: session.subscriptionId,
        razorpayKeyId: session.keyId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    errorResponse(res, 500, 'CHECKOUT_SESSION_FAILED', message);
  }
});

router.get('/plan', async (req: Request, res: Response) => {
  const teamId = requireTeamId(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const { data, error } = await supabase
    .from('teams')
    .select('plan, plan_expires_at')
    .eq('id', teamId)
    .maybeSingle();

  if (error || !data) {
    errorResponse(res, 500, 'TEAM_PLAN_FETCH_FAILED', 'Failed to fetch team plan');
    return;
  }

  const row = data as { plan: 'free' | 'starter' | 'pro'; plan_expires_at: string | null };
  res.status(200).json({
    success: true,
    data: {
      plan: row.plan,
      planExpiresAt: row.plan_expires_at,
    },
  });
});

export { router as billingRouter, publicRouter as billingPublicRouter };
