/**
 * Dodo Payments integration — client initialization and webhook verification.
 *
 * # Safety & Security
 *
 * ## API Key Management
 * - `DODO_SECRET_KEY` is read at runtime, never logged or exposed to clients.
 * - The client is lazily initialized and reused for the lifetime of the process.
 * - If the env var is missing, `getDodo()` throws immediately — no silent fallback.
 *
 * ## Webhook Verification
 * - Incoming Dodo webhooks are verified using the `standardwebhooks` library
 *   with `DODO_WEBHOOK_SECRET`. Verification is mandatory for all webhook
 *   endpoints; requests with invalid signatures are rejected with 400.
 * - Headers required for verification: `webhook-id`, `webhook-timestamp`,
 *   `webhook-signature`. Missing headers are also rejected.
 *
 * ## Environment Isolation
 * - `DODO_ENVIRONMENT` controls which Dodo API environment is targeted.
 *   Explicitly set to `'live'` for production; anything else defaults to `test_mode`.
 * - In test mode, no real charges occur and checkout sessions use Dodo's sandbox.
 *   Production traffic must never reach a test-mode client.
 *
 * ## Rate Limiting
 * - The Dodo API has its own rate limits (~5 req/s on checkout session creation).
 * - The caller should handle `429 Too Many Requests` responses gracefully.
 *   Currently no retry logic is implemented.
 *
 * ## Error Handling
 * - `getDodo()` and `getOrCreateWebhook()` throw on missing configuration.
 * - `verifyDodoWebhook()` throws if the signature is invalid.
 * - All Dodo API calls in route handlers use try/catch with proper
 *   `error instanceof Error` narrowing before accessing `.message`.
 */

import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

let dodoClient: DodoPayments | null | undefined;
let webhookClient: Webhook | null | undefined;

/**
 * Get (or create) the singleton Dodo Payments SDK client.
 * Throws if `DODO_SECRET_KEY` or `APP_URL` is not configured.
 */
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

/**
 * Get (or create) the singleton webhook verification client.
 * Throws if `DODO_WEBHOOK_SECRET` is not configured.
 */
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

/**
 * Verify an incoming Dodo webhook payload.
 *
 * @param rawBody - The raw request body as received (Buffer).
 * @param headers - Headers object containing `webhook-id`, `webhook-timestamp`,
 *   and `webhook-signature`.
 * @returns The parsed webhook payload (type varies by event).
 * @throws If the signature is invalid, headers are missing, or the webhook
 *   secret is not configured.
 */
export function verifyDodoWebhook(
  rawBody: Buffer,
  headers: Record<string, string>
): unknown {
  const wh = getOrCreateWebhook();
  return wh.verify(rawBody, headers);
}
