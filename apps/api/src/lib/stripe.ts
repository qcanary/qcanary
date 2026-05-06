import Stripe from 'stripe';
import { supabase } from './supabase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.API_BASE_URL ?? 'http://localhost:3000';

const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

interface TeamForBilling {
  id: string;
  stripe_customer_id: string | null;
}

type BillingPlan = 'starter' | 'pro';

function getPriceId(plan: BillingPlan): string {
  if (plan === 'starter') {
    if (!starterPriceId) {
      throw new Error('Missing required environment variable: STRIPE_STARTER_PRICE_ID');
    }
    return starterPriceId;
  }

  if (!proPriceId) {
    throw new Error('Missing required environment variable: STRIPE_PRO_PRICE_ID');
  }
  return proPriceId;
}

async function getTeamById(teamId: string): Promise<TeamForBilling | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, stripe_customer_id')
    .eq('id', teamId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as TeamForBilling;
}

async function ensureStripeCustomer(team: TeamForBilling): Promise<string> {
  if (team.stripe_customer_id) {
    return team.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    metadata: {
      teamId: team.id,
    },
  });

  await supabase
    .from('teams')
    .update({ stripe_customer_id: customer.id } as never)
    .eq('id', team.id);

  return customer.id;
}

export async function createCheckoutSession(teamId: string, plan: BillingPlan): Promise<Stripe.Checkout.Session> {
  const team = await getTeamById(teamId);

  if (!team) {
    throw new Error('Team not found for checkout session');
  }

  const customerId = await ensureStripeCustomer(team);
  const priceId = getPriceId(plan);

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appBaseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl}/billing/cancelled`,
    metadata: {
      teamId,
      plan,
    },
  });
}
