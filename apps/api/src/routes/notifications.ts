import express from 'express';
import type { Request, Response } from 'express';
import { getResend, getResendFromAddress } from '../lib/resend';
import { logger } from '../lib/logger';

const router = express.Router();

type OnboardingStep = 1 | 2 | 3;

interface OnboardingEmail {
  subject: string;
  html: string;
}

function errorResponse(res: Response, statusCode: number, code: string, message: string): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function isAuthorized(req: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret || configuredSecret.trim().length === 0) {
    return false;
  }

  const providedSecret = req.header('x-cron-secret') ?? '';
  return providedSecret.length > 0 && providedSecret === configuredSecret;
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseStep(value: unknown): OnboardingStep | null {
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }
  if (value === '1' || value === '2' || value === '3') {
    return Number(value) as OnboardingStep;
  }
  return null;
}

function onboardingEmailForStep(step: OnboardingStep): OnboardingEmail {
  if (step === 1) {
    return {
      subject: 'Welcome to QCanary',
      html: [
        '<h1>Welcome to QCanary</h1>',
        '<p>QCanary monitors BullMQ queues without asking for Redis credentials.</p>',
        '<p>Install the agent in the service that creates your queues:</p>',
        '<pre><code>npm install @qcanary/agent</code></pre>',
        '<p>Create a project, copy your qca_live_ API key, and initialize QueueMonitor with your existing BullMQ queues.</p>',
        '<p><a href="https://qcanary.dev/docs">View setup guide</a></p>',
      ].join(''),
    };
  }

  if (step === 2) {
    return {
      subject: 'Add alerts to your BullMQ queues',
      html: [
        '<h1>Turn queue events into alerts</h1>',
        '<p>Create alert rules for failure rate, no activity, queue depth, and long-running jobs.</p>',
        '<p>Starter plans include Slack and email alerts; Pro adds webhooks.</p>',
        '<p>A good first rule: alert when failure rate is above 5% over the last 10 minutes.</p>',
        '<p><a href="https://qcanary.dev/docs">Configure alerts</a></p>',
      ].join(''),
    };
  }

  return {
    subject: 'Keep more BullMQ history in QCanary',
    html: [
      '<h1>Keep more queue history</h1>',
      '<p>QCanary plans include project, event, alert, and history limits so monitoring can scale with queue volume.</p>',
      '<p>Starter adds 30-day history and alert rules. Pro adds unlimited projects, unlimited daily events, webhooks, and 90-day history.</p>',
      '<p><a href="https://qcanary.dev/settings">Review plans</a></p>',
    ].join(''),
  };
}

router.use(express.json({ limit: '128kb' }));

router.post('/send-onboarding', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return;
  }

  const body = req.body as { email?: unknown; step?: unknown };
  if (!isValidEmail(body.email)) {
    errorResponse(res, 400, 'INVALID_EMAIL', 'email must be a valid email address');
    return;
  }

  const step = parseStep(body.step);
  if (!step) {
    errorResponse(res, 400, 'INVALID_STEP', 'step must be 1, 2, or 3');
    return;
  }

  const resend = getResend();
  if (!resend) {
    errorResponse(res, 503, 'RESEND_UNAVAILABLE', 'RESEND_API_KEY is not configured');
    return;
  }

  const email = onboardingEmailForStep(step);
  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: body.email,
    subject: email.subject,
    html: email.html,
  });

  if (error) {
    logger.error({ err: error, step }, 'Failed to send onboarding email');
    errorResponse(res, 502, 'EMAIL_SEND_FAILED', error.message);
    return;
  }

  res.status(200).json({
    success: true,
    data: { sent: true, step },
  });
});

export { router as notificationsRouter };
