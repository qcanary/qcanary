import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

const secretKey = process.env.DODO_SECRET_KEY;
const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

if (!secretKey) {
  throw new Error('DODO_SECRET_KEY is not set');
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL is not set');
}

const environment = process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode';

export const dodo = new DodoPayments({
  bearerToken: secretKey,
  environment,
});

export function verifyDodoWebhook(
  rawBody: Buffer,
  headers: Record<string, string>
): unknown {
  if (!webhookSecret) {
    throw new Error('DODO_WEBHOOK_SECRET is not set');
  }
  const wh = new Webhook(webhookSecret);
  return wh.verify(rawBody, headers);
}
