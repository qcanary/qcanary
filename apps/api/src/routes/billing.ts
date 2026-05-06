import express from 'express';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { createCheckoutSession, stripe } from '../lib/stripe';
import { supabase } from '../lib/supabase';

const router = express.Router();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Missing required environment variable: STRIPE_WEBHOOK_SECRET');
}

function errorResponse(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function resolvePlanFromPrice(priceId: string | null | undefined): 'starter' | 'pro' | null {
  if (!priceId) {
    return null;
  }

  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    return 'starter';
  }

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }

  return null;
}

async function updateTeamPlanByCustomer(
  customerId: string,
  plan: 'free' | 'starter' | 'pro',
  planExpiresAt: string | null
): Promise<void> {
  await supabase
    .from('teams')
    .update({ plan, plan_expires_at: planExpiresAt } as never)
    .eq('stripe_customer_id', customerId);
}

async function attachCustomerToTeam(teamId: string, customerId: string): Promise<void> {
  await supabase
    .from('teams')
    .update({ stripe_customer_id: customerId } as never)
    .eq('id', teamId);
}

async function handleCheckoutSessionCompleted(event: Stripe.CheckoutSessionCompletedEvent): Promise<void> {
  const session = event.data.object;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const teamId = typeof session.metadata?.teamId === 'string' ? session.metadata.teamId : null;
  const planFromMetadata =
    session.metadata?.plan === 'starter' || session.metadata?.plan === 'pro'
      ? session.metadata.plan
      : null;

  if (!customerId || !teamId || !planFromMetadata) {
    return;
  }

  await attachCustomerToTeam(teamId, customerId);
  await updateTeamPlanByCustomer(customerId, planFromMetadata, null);
}

async function handleSubscriptionEvent(
  event: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent
): Promise<void> {
  const subscription = event.data.object;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    return;
  }

  const itemPriceId = subscription.items.data[0]?.price?.id ?? null;
  const plan = resolvePlanFromPrice(itemPriceId);

  if (!plan) {
    return;
  }

  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  await updateTeamPlanByCustomer(customerId, plan, periodEnd);
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent): Promise<void> {
  const subscription = event.data.object;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    return;
  }

  await updateTeamPlanByCustomer(customerId, 'free', null);
}

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.header('stripe-signature');
  if (!signature) {
    errorResponse(res, 400, 'MISSING_SIGNATURE', 'Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    errorResponse(res, 400, 'INVALID_SIGNATURE', message);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event as Stripe.CheckoutSessionCompletedEvent);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(
          event as Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent
        );
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent);
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
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    errorResponse(res, 500, 'CHECKOUT_SESSION_FAILED', message);
  }
});

export { router as billingRouter };
