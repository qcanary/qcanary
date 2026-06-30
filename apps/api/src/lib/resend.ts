import { Resend } from 'resend';

let client: Resend | null | undefined;

export function getResend(): Resend | null {
  if (client !== undefined) {
    return client;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    client = null;
    return client;
  }

  client = new Resend(apiKey);
  return client;
}

export function getResendFromAddress(): string {
  const configured = process.env.RESEND_FROM_EMAIL;
  if (typeof configured === 'string' && configured.trim().length > 0) {
    return configured.trim();
  }

  return 'Qcanary <onboarding@resend.dev>';
}
