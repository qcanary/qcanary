import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Alert Rules | QCanary Docs",
  description: "Configure Slack, email, and webhook alerts for your BullMQ queues.",
  alternates: { canonical: `${siteUrl}/docs/alert-rules` },
  openGraph: {
    title: "Alert Rules | QCanary Docs",
    description: "Configure Slack, email, and webhook alerts for your BullMQ queues.",
    url: `${siteUrl}/docs/alert-rules`,
  },
};

export default function AlertRulesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Alert Rules</h1>
        <p className="text-text-muted">
          Get notified when something goes wrong in your queues.
        </p>
      </div>

      {/* ── Condition types ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Condition types</CardTitle>
          <CardDescription>Choose when alerts fire.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">Failure rate</div>
              <div className="mt-1 text-xs text-text-muted">
                Fires when the percentage of failed jobs exceeds the threshold within the window.
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">No activity</div>
              <div className="mt-1 text-xs text-text-muted">
                Fires when fewer than N total events are received within the window. Detects silent queues.
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">Queue depth</div>
              <div className="mt-1 text-xs text-text-muted">
                Fires when the number of in-flight jobs (waiting + active + delayed) exceeds the threshold.
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">Job duration</div>
              <div className="mt-1 text-xs text-text-muted">
                Fires when a single job&apos;s processing time exceeds the threshold (in ms).
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Channels ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Alert channels</CardTitle>
          <CardDescription>Where alerts are delivered.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Slack alerts</h3>
            <p className="mb-2 text-sm text-text-muted">
              Create an incoming webhook in Slack (Slack App &rarr; Incoming Webhooks &rarr; Add New Webhook),
              then paste the webhook URL as the destination when creating the rule.
            </p>
            <p className="text-xs text-text-muted">
              URL format: <code className="text-accent">https://hooks.slack.com/services/...</code>
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Email alerts</h3>
            <p className="text-sm text-text-muted">
              Enter the recipient email address. A cooldown period prevents alert fatigue &mdash;
              the same rule won&apos;t fire again until the cooldown expires.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Webhook alerts (Team+)</h3>
            <p className="text-sm text-text-muted">
              Team and Business plans support custom webhook destinations. Qcanary POSTs a JSON payload to your
              endpoint with the alert details. Useful for PagerDuty, OpsGenie, or custom integrations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Cooldown ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Cooldown periods</CardTitle>
          <CardDescription>Prevent alert fatigue with configurable cooldowns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            After an alert fires, the same rule enters a cooldown period during which it won&apos;t fire again.
            This prevents a single incident from generating dozens of notifications.
          </p>
          <p className="text-sm text-text-muted">
            Cooldown duration is configurable per rule when creating or editing the alert in the dashboard.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-text-muted">
        <p>
          Next: <Link href="/docs/api-reference" className="text-accent hover:underline">API reference</Link> &mdash;
          the HTTP ingest endpoint and authentication.
        </p>
      </div>
    </div>
  );
}
