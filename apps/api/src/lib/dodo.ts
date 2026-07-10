import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

let dodoClient: DodoPayments | null | undefined;
let webhookClient: Webhook | null | undefined;

export function getDodo(): DodoPayments {
  if (dodoClient !== undefined) {
    if (!dodoClient) {
      throw new Error('DODO_SECRET_KEY is not set');
    }
    return dodoClient;
  }

  const secretKey = process.env.DODO_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    dodoClient = null;
    throw new Error('DODO_SECRET_KEY is not set');
  }

  if (!process.env.APP_URL) {
    throw new Error('APP_URL is not set');
  }

  const environment = process.env.DODO_ENVIRONMENT === 'live' ? 'live_mode' : 'test_mode';

  dodoClient = new DodoPayments({
    bearerToken: secretKey,
    environment,
  });

  return dodoClient;
}

function getOrCreateWebhook(): Webhook {
  if (webhookClient) {
    return webhookClient;
  }

  if (webhookClient === null) {
    throw new Error('DODO_WEBHOOK_SECRET is not set');
  }

  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim().length === 0) {
    webhookClient = null;
    throw new Error('DODO_WEBHOOK_SECRET is not set');
  }

  webhookClient = new Webhook(webhookSecret);
  return webhookClient;
}

export function verifyDodoWebhook(
  rawBody: Buffer,
  headers: Record<string, string>
): unknown {
  const wh = getOrCreateWebhook();
  return wh.verify(rawBody, headers);
}
