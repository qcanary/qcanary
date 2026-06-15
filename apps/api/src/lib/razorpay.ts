import Razorpay from 'razorpay';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.API_BASE_URL ?? 'http://localhost:3000';
const starterPlanId = process.env.RAZORPAY_STARTER_PLAN_ID;
const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID;

type BillingPlan = 'starter' | 'pro';

function getRazorpayClient(): Razorpay {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Missing required environment variables: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }

  return new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

function getPlanId(plan: BillingPlan): string {
  if (plan === 'starter') {
    if (!starterPlanId) {
      throw new Error('Missing required environment variable: RAZORPAY_STARTER_PLAN_ID');
    }
    return starterPlanId;
  }

  if (!proPlanId) {
    throw new Error('Missing required environment variable: RAZORPAY_PRO_PLAN_ID');
  }
  return proPlanId;
}

export interface RazorpayCheckoutSession {
  subscriptionId: string;
  keyId: string;
  checkoutUrl: string;
}

export async function createCheckoutSession(teamId: string, plan: BillingPlan): Promise<RazorpayCheckoutSession> {
  const planId = getPlanId(plan);
  const razorpay = getRazorpayClient();
  const subscription = await new Promise<{ id: string }>((resolve, reject) => {
    razorpay.subscriptions.create(
      {
        plan_id: planId,
        customer_notify: 1,
        total_count: 120,
        quantity: 1,
        notes: {
          teamId,
          plan,
        },
      },
      (error: unknown, value: { id: string } | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        if (!value || typeof value.id !== 'string') {
          reject(new Error('Failed to create Razorpay subscription'));
          return;
        }
        resolve(value);
      }
    );
  });

  const checkoutUrl = new URL('/billing/checkout', appBaseUrl);
  checkoutUrl.searchParams.set('subscription_id', subscription.id);
  checkoutUrl.searchParams.set('plan', plan);
  checkoutUrl.searchParams.set('key_id', razorpayKeyId as string);

  return {
    subscriptionId: subscription.id,
    keyId: razorpayKeyId as string,
    checkoutUrl: checkoutUrl.toString(),
  };
}
