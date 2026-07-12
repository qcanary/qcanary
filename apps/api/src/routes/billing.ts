import express from 'express';
import type { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { getDodo, verifyDodoWebhook } from '../lib/dodo';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';
import { updateRows } from '../lib/typedSupabase';
import { deliverEmail, escapeHtml } from '../lib/alertDelivery';
import { errorResponse, requireTeamContext } from '../lib/responseUtils';
import { logger } from '../lib/logger';

const router = express.Router();
const publicRouter = express.Router();

async function updateTeamPlanById(
  teamId: string,
  plan: 'free' | 'starter' | 'pro',
  planExpiresAt: string | null,
  dodoSubscriptionId?: string | null
): Promise<void> {
  type TeamPlanUpdate = Parameters<typeof updateRows<'teams'>>[1];
  const updateData: TeamPlanUpdate = { plan, plan_expires_at: planExpiresAt, dodo_subscription_id: dodoSubscriptionId ?? null };
  const { error } = await updateRows('teams', updateData)
    .eq('id', teamId);

  if (error) {
    logger.error({ err: error, teamId }, 'Failed to update team plan');
    throw error;
  }
}

// ── In-memory rate limiter for public webhook ─────────────
const webhookRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WEBHOOK_RATE_LIMIT = 100; // requests per window
const WEBHOOK_RATE_WINDOW_MS = 60_000; // 1 minute

function checkWebhookRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = webhookRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    webhookRateLimitMap.set(ip, { count: 1, resetAt: now + WEBHOOK_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= WEBHOOK_RATE_LIMIT) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Periodic cleanup to prevent memory leak from stale entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of webhookRateLimitMap) {
    if (now > entry.resetAt) {
      webhookRateLimitMap.delete(ip);
    }
  }
}, 60_000);

// ── Public Webhook Endpoint ────────────────────────────────

publicRouter.post('/webhook', express.raw({ type: 'application/json', limit: '500kb' }), async (req: Request, res: Response) => {
  // Rate limit by IP to protect against webhook floods
  const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  if (!checkWebhookRateLimit(clientIp)) {
    errorResponse(res, 429, 'RATE_LIMITED', 'Too many webhook requests. Please try again later.');
    return;
  }

  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    errorResponse(res, 503, 'BILLING_UNAVAILABLE', 'Billing webhook is not configured');
    return;
  }

  const signature = req.headers['webhook-signature'] as string | undefined;
  if (!signature) {
    errorResponse(res, 400, 'MISSING_SIGNATURE', 'Missing webhook-signature header');
    return;
  }

  const rawBody = req.body as Buffer;

  let parsed: { type: string; data: Record<string, unknown> };
  try {
    const verified = verifyDodoWebhook(rawBody, {
      'webhook-id': (req.headers['webhook-id'] as string) ?? '',
      'webhook-timestamp': (req.headers['webhook-timestamp'] as string) ?? '',
      'webhook-signature': signature,
    });
    parsed = verified as { type: string; data: Record<string, unknown> };
  } catch (err) {
    logger.error({ err }, 'Billing webhook signature verification failed');
    errorResponse(res, 400, 'INVALID_SIGNATURE', 'Webhook signature verification failed');
    return;
  }

  const eventName = parsed.type;
  const data = parsed.data;

  try {
    switch (eventName) {
      case 'subscription.active': {
        const subscription = data as {
          subscription_id: string;
          product_id?: string;
          metadata?: Record<string, string>;
          status?: string;
          next_billing_date?: string;
          [key: string]: unknown;
        };
        const teamId = typeof subscription.metadata?.teamId === 'string' ? subscription.metadata.teamId : '';
        const plan = subscription.metadata?.plan === 'starter' || subscription.metadata?.plan === 'pro'
          ? subscription.metadata.plan as 'starter' | 'pro'
          : null;

        if (teamId && plan) {
          const periodEnd = subscription.next_billing_date
            ? new Date(subscription.next_billing_date).toISOString()
            : null;
          await updateTeamPlanById(teamId, plan, periodEnd, subscription.subscription_id);
          logger.info({ teamId, plan, subscriptionId: subscription.subscription_id }, 'Subscription activated');
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription.failed': {
        const cancelledSub = data as {
          subscription_id: string;
          metadata?: Record<string, string>;
          [key: string]: unknown;
        };
        const cancelTeamId = typeof cancelledSub.metadata?.teamId === 'string' ? cancelledSub.metadata.teamId : '';
        if (cancelTeamId) {
          await updateTeamPlanById(cancelTeamId, 'free', null);
          logger.info({ teamId: cancelTeamId, event: eventName }, 'Subscription downgraded to free');
        }
        break;
      }

      case 'payment.succeeded': {
        const payment = data as {
          id?: string;
          amount?: number;
          currency?: string;
          subscription_id?: string;
          [key: string]: unknown;
        };
        logger.info({ paymentId: payment.id, amount: payment.amount, currency: payment.currency }, 'Payment succeeded');
        break;
      }

      case 'payment.failed': {
        const failedPayment = data as {
          id?: string;
          subscription_id?: string;
          customer_email?: string;
          [key: string]: unknown;
        };
        logger.error({ paymentId: failedPayment.id, subscriptionId: failedPayment.subscription_id }, 'Payment failed');
        if (typeof failedPayment.customer_email === 'string' && failedPayment.customer_email.length > 0) {
          try {
            const subject = '[Qcanary] Payment failed';
            const plainText = 'Unfortunately, your most recent payment to Qcanary has failed. ' +
                'Please check your payment method and update it in your billing settings to avoid service interruption.';
            await deliverEmail(failedPayment.customer_email, subject, `<p>${escapeHtml(plainText)}</p>`);
            logger.info({ email: failedPayment.customer_email }, 'Payment failure notification sent');
          } catch (emailError) {
            logger.error({ err: emailError, email: failedPayment.customer_email }, 'Failed to send payment failure email');
          }
        }
        break;
      }

      default:
        logger.warn({ eventName }, 'Unhandled billing webhook event');
        break;
    }
  } catch (error) {
    logger.error({ err: error, eventName }, 'Billing webhook handler error');
    res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_HANDLER_ERROR', message: 'Internal error processing webhook' },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { received: true },
  });
});

// ── Authenticated Routes ──────────────────────────────────

router.use(express.json({ limit: '1mb' }));



// POST /billing/checkout-session — Create Dodo checkout session
router.post('/checkout-session', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }
  const body = req.body as { plan?: unknown; interval?: unknown; coupon?: unknown };
  const { plan, interval } = body;
  const coupon = typeof body.coupon === 'string' && body.coupon.trim().length > 0 ? body.coupon.trim() : null;

  if (plan !== 'starter' && plan !== 'pro') {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'plan must be starter or pro');
    return;
  }

  const billingInterval = interval === 'year' ? 'year' : 'month';

  const isYearly = billingInterval === 'year';
  const dodoProductId = plan === 'starter'
    ? (isYearly ? process.env.DODO_STARTER_YEARLY_PRODUCT_ID : process.env.DODO_STARTER_PRODUCT_ID)
    : (isYearly ? process.env.DODO_PRO_YEARLY_PRODUCT_ID : process.env.DODO_PRO_PRODUCT_ID);

  if (!dodoProductId) {
    const envVarName = plan === 'starter'
      ? (isYearly ? 'DODO_STARTER_YEARLY_PRODUCT_ID' : 'DODO_STARTER_PRODUCT_ID')
      : (isYearly ? 'DODO_PRO_YEARLY_PRODUCT_ID' : 'DODO_PRO_PRODUCT_ID');
    errorResponse(res, 500, 'CONFIG_ERROR', `${envVarName} is not configured`);
    return;
  }

  if (!process.env.APP_URL) {
    errorResponse(res, 500, 'CONFIG_ERROR', 'APP_URL environment variable is not configured');
    return;
  }

  const appUrl = process.env.APP_URL;

  try {
    const session = await getDodo().checkoutSessions.create({
      product_cart: [
        {
          product_id: dodoProductId,
          quantity: 1,
        },
      ],
      return_url: `${appUrl}/settings?payment=success`,
      cancel_url: `${appUrl}/settings?billing=cancelled`,
      metadata: {
        teamId,
        plan,
        interval: billingInterval,
      },
      // Pass coupon code to Dodo if provided (PH20 discount for Product Hunt launch)
      ...(coupon ? { discount_codes: [coupon] } : {}),
    });

    if (!session.checkout_url) {
      logger.error({ sessionId: session.session_id, plan }, 'Dodo returned null checkout_url');
      errorResponse(res, 502, 'CHECKOUT_URL_MISSING', 'Dodo Payments did not return a checkout URL. Please try again.');
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.checkout_url,
        sessionId: session.session_id,
      },
    });
  } catch (error) {
    // Best-effort Sentry capture — never let error reporting crash the handler
    if (process.env.SENTRY_DSN) {
      try {
        Sentry.captureException(error, { level: 'error' });
      } catch { /* best-effort */ }
    }

    // Dodo SDK errors have a response body with the actual API error detail.
    // The SDK attaches `statusCode`, `response?.data`, and `body` to the error object.
    let message = 'Failed to create checkout session';
    if (error instanceof Error) {
      message = error.message;

      // Safely extract the Dodo API response body (may not exist on all errors)
      let responseBody: unknown;
      try {
        const dodoError = error as unknown as { response?: { data?: unknown }; body?: unknown };
        responseBody = dodoError.response?.data ?? dodoError.body;
      } catch { /* ignore extraction failures */ }

      // Extract a user-friendly detail string from the response body
      let detail: unknown;
      if (responseBody && typeof responseBody === 'object') {
        const obj = responseBody as Record<string, unknown>;
        detail = obj.detail ?? obj.message;
      }

      if (typeof detail === 'string') {
        message = `${message}: ${detail}`;
      }

      logger.error({ err: error, responseBody, productId: dodoProductId, interval: billingInterval }, 'Checkout session creation failed');
    } else {
      logger.error({ err: error, productId: dodoProductId }, 'Checkout session creation failed (non-Error)');
    }

    errorResponse(res, 500, 'CHECKOUT_SESSION_FAILED', message);
  }
});

// POST /billing/cancel — Cancel active subscription at next billing date
router.post('/cancel', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  try {
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('dodo_subscription_id')
      .eq('id', teamId)
      .maybeSingle();

    if (fetchError || !team) {
      errorResponse(res, 500, 'TEAM_FETCH_FAILED', 'Failed to fetch team details');
      return;
    }

    const teamRow = team as { dodo_subscription_id: string | null };
    const subscriptionId = teamRow.dodo_subscription_id;

    if (!subscriptionId) {
      // No Dodo subscription on record — just downgrade plan directly
      await updateTeamPlanById(teamId, 'free', null);
      res.status(200).json({ success: true, data: { cancelled: true } });
      return;
    }

    await getDodo().subscriptions.update(subscriptionId, {
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    });

    logger.info({ teamId, subscriptionId }, 'Subscription cancelled');

    res.status(200).json({
      success: true,
      data: { cancelled: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    logger.error({ err: error, teamId }, 'Cancel subscription failed');
    errorResponse(res, 500, 'CANCEL_FAILED', message);
  }
});

// GET /billing/plan — Get current plan for the authenticated team
router.get('/plan', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
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
