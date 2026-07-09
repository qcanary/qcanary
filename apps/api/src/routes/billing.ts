import express from 'express';
import type { Request, Response } from 'express';
import { getDodo, verifyDodoWebhook } from '../lib/dodo';
import { supabase } from '../lib/supabase';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';
import { updateRows } from '../lib/typedSupabase';
import { deliverEmail, escapeHtml } from '../lib/alertDelivery';
import { logger } from '../lib/logger';

const router = express.Router();
const publicRouter = express.Router();

function errorResponse(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

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

// ── Public Webhook Endpoint ────────────────────────────────

publicRouter.post('/webhook', express.raw({ type: 'application/json', limit: '500kb' }), async (req: Request, res: Response) => {
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

function requireTeamId(req: DashboardAuthedRequest, res: Response): string | null {
  const teamId = typeof req.teamId === 'string' ? req.teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

// POST /billing/checkout-session — Create Dodo checkout session
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

  const dodoProductId = plan === 'starter'
    ? process.env.DODO_STARTER_PRODUCT_ID
    : process.env.DODO_PRO_PRODUCT_ID;

  if (!dodoProductId) {
    errorResponse(res, 500, 'CONFIG_ERROR', `DODO_${plan.toUpperCase()}_PRODUCT_ID is not configured`);
    return;
  }

  try {
    const session = await getDodo().checkoutSessions.create({
      product_cart: [
        {
          product_id: dodoProductId,
          quantity: 1,
        },
      ],
      return_url: `${process.env.APP_URL}/settings?payment=success`,
      cancel_url: `${process.env.APP_URL}/settings?billing=cancelled`,
      metadata: {
        teamId,
        plan,
      },
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
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    logger.error({ err: error }, 'Checkout session creation failed');
    errorResponse(res, 500, 'CHECKOUT_SESSION_FAILED', message);
  }
});

// POST /billing/cancel — Cancel active subscription at next billing date
router.post('/cancel', async (req: Request, res: Response) => {
  const teamId = requireTeamId(req as DashboardAuthedRequest, res);
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
