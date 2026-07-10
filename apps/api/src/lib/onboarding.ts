/**
 * Onboarding email cron — sends step-based onboarding emails to new teams.
 *
 * ## How it works
 *
 * The cron runs daily and processes teams whose `created_at` falls within
 * specific age ranges. Each team receives up to 3 emails over their first
 * month, timed to their usage milestones:
 *
 *   Step 1 (1–2 days old):  "Welcome to QCanary" — install guide
 *   Step 2 (3–7 days old):   "Add alerts" — only if they have active events
 *   Step 3 (7–30 days old):  "Upgrade" — only if they have significant usage
 *
 * ## Email resolution
 *
 * The teams table does not store email addresses. The cron resolves the
 * team admin's email by calling the Clerk Backend API:
 *
 *   GET https://api.clerk.com/v1/organizations/{clerk_org_id}/memberships
 *   Headers: { Authorization: "Bearer <CLERK_SECRET_KEY>" }
 *
 * The first member with `role: 'admin'` is used. If no admin is found or
 * the Clerk API call fails, the team is skipped and retried next cycle.
 *
 * ## Deduplication
 *
 * Rather than storing sent-state in the database, the cron uses natural
 * time windows. A team that receives Step 1 on day 2 won't receive it
 * again on day 3 because it's now outside the 1–2 day window. This avoids
 * requiring a DB migration for a tracking column.
 *
 * ## Env vars required
 *
 *   CLERK_SECRET_KEY  — Clerk Backend API key (starts with "sk_")
 *   RESEND_API_KEY    — Already required for alert delivery
 *   RESEND_FROM_EMAIL — Already configured (falls back to resend.dev)
 *   CRON_SECRET       — Used for internal auth (already configured)
 *   APP_URL           — Used for email links (already configured)
 */

import { supabase } from './supabase';
import { getResend, getResendFromAddress } from './resend';
import { logger } from './logger';

// ── Types ─────────────────────────────────────────────────

interface TeamRow {
  id: string;
  name: string;
  clerk_org_id: string | null;
  created_at: string;
}

interface ProjectRow {
  id: string;
}

/** Clerk API org membership response (partial) */
interface ClerkMembership {
  id: string;
  role: 'admin' | 'basic_member';
  user: {
    id: string;
    email_address: string;
    primary_email_address: string;
  };
}

/** Clerk API paginated response */
interface ClerkPaginatedResponse<T> {
  data: T[];
  total_count: number;
}

// ── Step definitions ──────────────────────────────────────

interface OnboardingStep {
  step: 1 | 2 | 3;
  /** Min team age in days to qualify */
  minAgeDays: number;
  /** Max team age in days to qualify */
  maxAgeDays: number;
  /** Whether the team must have active usage to qualify */
  requiresActivity: boolean;
  /** Whether the team must be a "power user" to qualify */
  requiresPowerUsage: boolean;
  subject: string;
  buildHtml: (teamName: string) => string;
}

const STEPS: OnboardingStep[] = [
  {
    step: 1,
    minAgeDays: 1,
    maxAgeDays: 2,
    requiresActivity: false,
    requiresPowerUsage: false,
    subject: 'Welcome to QCanary',
    buildHtml: (teamName: string) => [
      `<h1>Welcome to QCanary, ${escapeHtml(teamName)}!</h1>`,
      '<p>QCanary monitors BullMQ queues without asking for Redis credentials.</p>',
      '<p>Getting started takes 2 minutes:</p>',
      '<ol>',
      '  <li>Create a project from your dashboard</li>',
      '  <li>Copy your <code>qca_live_</code> API key</li>',
      '  <li>Install the agent: <code>npm install @qcanary/agent</code></li>',
      '  <li>Initialize <code>QueueMonitor</code> with your existing BullMQ queues</li>',
      '</ol>',
      `<p><a href="${getAppUrl()}/onboarding">Open your dashboard →</a></p>`,
    ].join('\n'),
  },
  {
    step: 2,
    minAgeDays: 3,
    maxAgeDays: 7,
    requiresActivity: true,
    requiresPowerUsage: false,
    subject: 'Add alerts to your BullMQ queues',
    buildHtml: (_teamName: string) => [
      '<h1>Turn queue events into alerts</h1>',
      '<p>Your queues are sending events — great! Now set up alerts so you never miss a failure.</p>',
      '<p>Create alert rules for:</p>',
      '<ul>',
      '  <li><strong>Failure rate</strong> — Notify when failures exceed a threshold</li>',
      '  <li><strong>No activity</strong> — Detect stalled queues</li>',
      '  <li><strong>Queue depth</strong> — Get warned before backlogs grow</li>',
      '  <li><strong>Job duration</strong> — Catch slow jobs early</li>',
      '</ul>',
      '<p>A good first rule: alert when failure rate is above 5% over the last 10 minutes.</p>',
      `<p><a href="${getAppUrl()}/settings">Configure alerts →</a></p>`,
    ].join('\n'),
  },
  {
    step: 3,
    minAgeDays: 7,
    maxAgeDays: 30,
    requiresActivity: true,
    requiresPowerUsage: true,
    subject: 'Keep more BullMQ history with QCanary',
    buildHtml: (_teamName: string) => [
      '<h1>Scale your monitoring</h1>',
      '<p>You\'re processing a healthy volume of queue events. Consider upgrading to keep more history and unlock additional features.</p>',
      '<p><strong>Starter ($9/mo)</strong> — Slack/email alerts, 3 projects, 30-day history</p>',
      '<p><strong>Pro ($24/mo)</strong> — Unlimited projects, unlimited daily events, webhooks, 90-day history</p>',
      `<p><a href="${getAppUrl()}/settings">Review plans →</a></p>`,
      '<p>Questions? Reply to this email — we read every message.</p>',
    ].join('\n'),
  },
];

// ── Helpers ───────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAppUrl(): string {
  return process.env.APP_URL ?? 'https://qcanary.dev';
}

/**
 * Fetch the admin email for a Clerk organization.
 * Uses Clerk's Backend API (does NOT require Clerk SDK — just a secret key).
 */
async function getClerkOrgAdminEmail(clerkOrgId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    logger.warn('CLERK_SECRET_KEY is not set — cannot resolve org admin emails');
    return null;
  }

  try {
    const res = await fetch(
      `https://api.clerk.com/v1/organizations/${encodeURIComponent(clerkOrgId)}/memberships?limit=20`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      logger.warn({ status: res.status, clerkOrgId }, 'Clerk API returned non-OK status');
      return null;
    }

    const body = (await res.json()) as ClerkPaginatedResponse<ClerkMembership>;
    const admin = body.data?.find((m) => m.role === 'admin');
    if (!admin) {
      logger.warn({ clerkOrgId }, 'No admin found in Clerk org');
      return null;
    }

    return admin.user?.primary_email_address ?? admin.user?.email_address ?? null;
  } catch (error) {
    logger.error({ err: error, clerkOrgId }, 'Failed to fetch Clerk org admin email');
    return null;
  }
}

/**
 * Check if a team has sent any job events (active usage).
 */
async function hasActiveEvents(teamId: string): Promise<boolean> {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('team_id', teamId);

  const projectRows = (projects ?? []) as ProjectRow[];
  if (projectRows.length === 0) return false;

  const projectIds = projectRows.map((p) => p.id);
  const { count } = await supabase
    .from('job_events')
    .select('id', { head: true, count: 'exact' })
    .in('project_id', projectIds);

  return (count ?? 0) > 0;
}

/**
 * Check if a team is a "power user" (>100 events total).
 */
async function hasPowerUsage(teamId: string): Promise<boolean> {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('team_id', teamId);

  const projectRows = (projects ?? []) as ProjectRow[];
  if (projectRows.length === 0) return false;

  const projectIds = projectRows.map((p) => p.id);
  const { count } = await supabase
    .from('job_events')
    .select('id', { head: true, count: 'exact' })
    .in('project_id', projectIds)
    .limit(101);

  // count === null means > 101 rows (Supabase returns null when limit is hit)
  return count === null || (count ?? 0) >= 100;
}

// ── Main cron handler ─────────────────────────────────────

/**
 * Run the onboarding email cycle.
 *
 * Call this from a cron job (e.g., daily at 10:00 UTC).
 * Safe to call multiple times — deduplication is age-window-based.
 */
export async function sendOnboardingEmails(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
}> {
  const resend = getResend();
  if (!resend) {
    logger.warn('Resend not configured — skipping onboarding emails');
    return { processed: 0, sent: 0, skipped: 0, errors: 0 };
  }

  if (!process.env.CLERK_SECRET_KEY) {
    logger.warn('CLERK_SECRET_KEY not set — onboarding emails require Clerk API access');
    return { processed: 0, sent: 0, skipped: 0, errors: 0 };
  }

  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  // Fetch teams created in the last 30 days
  const { data: teams, error } = await supabase
    .from('teams')
    .select('id, name, clerk_org_id, created_at')
    .gte('created_at', thirtyDaysAgo)
    .lte('created_at', oneDayAgo) // At least 1 day old
    .not('clerk_org_id', 'is', null)
    .order('created_at', { ascending: true });

  if (error || !teams) {
    logger.error({ err: error }, 'Failed to fetch teams for onboarding');
    return { processed: 0, sent: 0, skipped: 0, errors: 1 };
  }

  const teamRows = teams as TeamRow[];
  logger.info({ teamCount: teamRows.length }, 'Onboarding cron: processing teams');

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const team of teamRows) {
    processed++;

    if (!team.clerk_org_id) {
      skipped++;
      continue;
    }

    // Calculate team age in days
    const teamAgeMs = now - new Date(team.created_at).getTime();
    const teamAgeDays = teamAgeMs / (24 * 60 * 60 * 1000);

    // Check each step
    for (const step of STEPS) {
      // Age check
      if (teamAgeDays < step.minAgeDays || teamAgeDays > step.maxAgeDays) {
        continue;
      }

      // Activity check
      if (step.requiresActivity) {
        const hasEvents = await hasActiveEvents(team.id);
        if (!hasEvents) {
          skipped++;
          continue;
        }
      }

      // Power usage check
      if (step.requiresPowerUsage) {
        const isPowerUser = await hasPowerUsage(team.id);
        if (!isPowerUser) {
          skipped++;
          continue;
        }
      }

      // Resolve email from Clerk
      const email = await getClerkOrgAdminEmail(team.clerk_org_id);
      if (!email) {
        logger.warn({ teamId: team.id, clerkOrgId: team.clerk_org_id }, 'Could not resolve admin email — skipping');
        skipped++;
        continue;
      }

      // Send the email
      try {
        const { error: sendError } = await resend.emails.send({
          from: getResendFromAddress(),
          to: email,
          subject: step.subject,
          html: [
            '<div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#fafafa;background:#0f0f0f;padding:32px">',
            `<div style="font-size:12px;color:#71717a;margin-bottom:24px">QCanary · BullMQ Queue Monitoring</div>`,
            step.buildHtml(team.name),
            '<hr style="border:none;border-top:1px solid #1f1f1f;margin-top:32px" />',
            '<p style="font-size:12px;color:#71717a">Sent by QCanary · <a href="https://qcanary.dev/settings" style="color:#22C55E">Unsubscribe</a></p>',
            '</div>',
          ].join('\n'),
        });

        if (sendError) {
          logger.error({ err: sendError, teamId: team.id, step: step.step }, 'Failed to send onboarding email');
          errors++;
        } else {
          logger.info({ teamId: team.id, step: step.step, email }, 'Onboarding email sent');
          sent++;
        }
      } catch (error) {
        logger.error({ err: error, teamId: team.id, step: step.step }, 'Exception sending onboarding email');
        errors++;
      }
    }
  }

  logger.info({ processed, sent, skipped, errors }, 'Onboarding cron completed');
  return { processed, sent, skipped, errors };
}
