import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { createCheckoutSession } from '../lib/razorpay';
import { supabase } from '../lib/supabase';

const router = express.Router();

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

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
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

router.post('/checkout-session', async (req: Request, res: Response) => {
  const { teamId, plan } = req.body as { teamId?: unknown; plan?: unknown };

  if (typeof teamId !== 'string' || teamId.trim().length === 0) {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'teamId is required');
    return;
  }

  if (plan !== 'starter' && plan !== 'pro') {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'plan must be starter or pro');
    return;
  }

  try {
    const session = await createCheckoutSession(teamId.trim(), plan);
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

export { router as billingRouter };
