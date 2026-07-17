import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";


import { BrandLockup } from "@/components/Brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "QCanary Docs â€” BullMQ Monitoring Agent",
  description:
    "Install @qcanary/agent in your worker process to stream BullMQ queue events over HTTPS. No Redis credentials required. Quick start, configuration, alert rules, and API key management.",
  alternates: {
    canonical: `${siteUrl}/docs`,
  },
  openGraph: {
    title: "QCanary Docs",
    description:
      "Install @qcanary/agent in your worker process to stream BullMQ queue events over HTTPS. No Redis credentials required.",
    url: `${siteUrl}/docs`,
  },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary" translate="no">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 md:px-6">
        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-3">
          <BrandLockup
            href="/"
            size="sm"
            className="w-fit"
            labelClassName="text-sm uppercase tracking-[0.22em] text-text-muted"
          />
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Qcanary Docs</h1>
          <p className="text-text-muted">
            Monitor BullMQ queues with alerts and historical health data &mdash; without sharing Redis credentials.
          </p>
          <Link href="/onboarding" className="text-sm text-accent hover:underline">
            Open dashboard onboarding &rarr;
          </Link>
        </div>

        {/* â”€â”€ Quick Start (condensed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card>
          <CardHeader>
            <CardTitle>Quick start</CardTitle>
            <CardDescription>Get up and running in minutes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-muted">
              1. Create a project in the dashboard and copy your API key (starts with <code className="text-accent">qca_live_</code>).
            </p>
            <CodeBlock>{`npm install @qcanary/agent`}</CodeBlock>
            <CodeBlock>{`import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY,
  queues: [emailQueue],
});

await monitor.start();`}</CodeBlock>
            <p className="text-sm text-text-muted">
              See the full walkthrough: <Link href="/docs/quick-start" className="text-accent hover:underline">Quick Start guide &rarr;</Link>
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* â”€â”€ Browse by topic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Browse by topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/docs/quick-start" className="group">
              <Card className="transition-colors group-hover:border-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">Installation</CardTitle>
                  <CardDescription>Step-by-step setup from zero to streaming events.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/docs/configuration" className="group">
              <Card className="transition-colors group-hover:border-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">Configuration</CardTitle>
                  <CardDescription>Agent options, event types, and multi-environment setup.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/docs/alert-rules" className="group">
              <Card className="transition-colors group-hover:border-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">Alert Rules</CardTitle>
                  <CardDescription>Slack, email, and webhook notifications with cooldowns.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/docs/api-reference" className="group">
              <Card className="transition-colors group-hover:border-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">API Reference</CardTitle>
                  <CardDescription>POST /v1/ingest, authentication, and rate limits.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* â”€â”€ Dashboard overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card id="dashboard">
          <CardHeader>
            <CardTitle>Dashboard overview</CardTitle>
            <CardDescription>Understanding your queue health at a glance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">Overview page</div>
                <div className="mt-1 text-xs text-text-muted">
                  Summary cards show total jobs, failures, success rate, and active/stalled counts.
                  The queue table shows per-queue health with last event timestamps.
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">Queue detail</div>
                <div className="mt-1 text-xs text-text-muted">
                  Click any queue to see hourly metrics charts (completed, failed, duration),
                  a paginated job event list, and detailed job history with stack traces.
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">Alerts</div>
                <div className="mt-1 text-xs text-text-muted">
                  Create alert rules with conditional triggers. Test delivery before saving.
                  The alert history log shows every trigger with delivery status.
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">Settings</div>
                <div className="mt-1 text-xs text-text-muted">
                  View your current plan, upgrade to Solo, Team, or Business via Dodo Payments, and manage billing.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* â”€â”€ Team Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card id="teams">
          <CardHeader>
            <CardTitle>Team management</CardTitle>
            <CardDescription>Collaborate with your team on queue monitoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">
              Team and Business plans support multiple team members. Invite teammates from the
              dashboard settings to share access to projects, alert rules, and queue data.
            </p>
          </CardContent>
        </Card>

        {/* â”€â”€ Security Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card>
          <CardHeader>
            <CardTitle>Security model</CardTitle>
            <CardDescription>No Redis credentials. No job payloads by default.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border bg-surface/40 p-4">
              <h3 className="text-sm font-medium text-text-primary">How it works</h3>
              <p className="mt-1 text-sm text-text-muted">
                The Qcanary agent runs in your own worker process and creates BullMQ QueueEvents listeners
                for the queues you pass to QueueMonitor. QueueEvents emits job lifecycle notifications such
                as completed, failed, active, waiting, stalled, and delayed. QCanary never connects to Redis
                from its servers, never receives your Redis URL, and never reads Redis data directly. The
                agent sends only job metadata over HTTPS to the QCanary API.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">What we never see</div>
                <ul className="mt-2 list-inside list-disc text-xs text-text-muted space-y-1">
                  <li>Your Redis connection string or password</li>
                  <li>Job payload data (unless includePayload is enabled)</li>
                  <li>Your infrastructure credentials</li>
                </ul>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-sm font-medium text-text-primary">Safety guarantees</div>
                <ul className="mt-2 list-inside list-disc text-xs text-text-muted space-y-1">
                  <li>Agent never crashes your app (all errors caught)</li>
                  <li>Events are buffered and sent asynchronously</li>
                  <li>API keys are stored hashed (SHA-256)</li>
                  <li>Failed deliveries are silently dropped after retries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* â”€â”€ Plans & Limits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card>
          <CardHeader>
            <CardTitle>Plans &amp; limits</CardTitle>
            <CardDescription>Choose the right tier for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="px-2 py-2 font-medium">Feature</th>
                    <th className="px-2 py-2 font-medium">Free</th>
                    <th className="px-2 py-2 font-medium">Solo &mdash; $15/mo</th>
                    <th className="px-2 py-2 font-medium">Team &mdash; $39/mo</th>
                    <th className="px-2 py-2 font-medium">Business &mdash; $149/mo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Projects</td>
                    <td className="px-2 py-2 text-text-muted">1</td>
                    <td className="px-2 py-2 text-text-muted">1</td>
                    <td className="px-2 py-2 text-text-muted">3</td>
                    <td className="px-2 py-2 text-text-muted">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Queues per project</td>
                    <td className="px-2 py-2 text-text-muted">1</td>
                    <td className="px-2 py-2 text-text-muted">5</td>
                    <td className="px-2 py-2 text-text-muted">10</td>
                    <td className="px-2 py-2 text-text-muted">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Event history</td>
                    <td className="px-2 py-2 text-text-muted">24 hours</td>
                    <td className="px-2 py-2 text-text-muted">14 days</td>
                    <td className="px-2 py-2 text-text-muted">30 days</td>
                    <td className="px-2 py-2 text-text-muted">90 days</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Events / day</td>
                    <td className="px-2 py-2 text-text-muted">5,000</td>
                    <td className="px-2 py-2 text-text-muted">25,000</td>
                    <td className="px-2 py-2 text-text-muted">100,000</td>
                    <td className="px-2 py-2 text-text-muted">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Slack alerts</td>
                    <td className="px-2 py-2 text-text-muted">No</td>
                    <td className="px-2 py-2 text-text-muted">Yes</td>
                    <td className="px-2 py-2 text-text-muted">Yes</td>
                    <td className="px-2 py-2 text-text-muted">Yes</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Email alerts</td>
                    <td className="px-2 py-2 text-text-muted">1 rule</td>
                    <td className="px-2 py-2 text-text-muted">2 rules</td>
                    <td className="px-2 py-2 text-text-muted">Unlimited</td>
                    <td className="px-2 py-2 text-text-muted">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Webhook alerts</td>
                    <td className="px-2 py-2 text-text-muted">No</td>
                    <td className="px-2 py-2 text-text-muted">No</td>
                    <td className="px-2 py-2 text-text-muted">Yes</td>
                    <td className="px-2 py-2 text-text-muted">Yes</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-2 py-2 text-text-primary">Team members</td>
                    <td className="px-2 py-2 text-text-muted">1</td>
                    <td className="px-2 py-2 text-text-muted">1</td>
                    <td className="px-2 py-2 text-text-muted">5</td>
                    <td className="px-2 py-2 text-text-muted">20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* â”€â”€ Troubleshooting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Quick fixes for common issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary">No events appear in dashboard</h3>
              <p className="mt-1 text-sm text-text-muted">
                Verify that <code className="text-accent">QCANARY_API_KEY</code> is set correctly, that you&apos;re passing
                the right Queue instances, and that your server can reach <code className="text-accent">api.qcanary.dev</code>.
                Check the agent logs for any <code className="text-accent">onError</code> callbacks.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-text-primary">Slack test alert fails</h3>
              <p className="mt-1 text-sm text-text-muted">
                Make sure the webhook URL starts with <code className="text-accent">https://hooks.slack.com/services/</code>.
                Verify the Slack app has the <code className="text-accent">incoming-webhook</code> scope and is installed to the correct channel.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-text-primary">Agent affects app performance</h3>
              <p className="mt-1 text-sm text-text-muted">
                The agent operates entirely asynchronously &mdash; events are buffered and flushed on a timer.
                Keep <code className="text-accent">includePayload</code> disabled unless strictly needed, as fetching job
                data from Redis adds a small overhead per event.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-text-primary">Events drop during outages</h3>
              <p className="mt-1 text-sm text-text-muted">
                Failed HTTP requests retry up to 3 times with exponential backoff (1s &rarr; 2s &rarr; 4s).
                Prolonged Qcanary API outages intentionally drop events to protect the stability of your application.
                This is by design &mdash; your queues continue to work normally regardless of Qcanary availability.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-text-primary">Custom Redis or API URL</h3>
              <p className="mt-1 text-sm text-text-muted">
                Pass a custom <code className="text-accent">connection</code> option for QueueEvents to use a specific Redis
                instance, and <code className="text-accent">apiBaseUrl</code> to point the agent at a self-hosted Qcanary API.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* JSON-LD BreadcrumbList */}
        <Script
          id="json-ld-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "QCanary",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Docs",
                  item: `${siteUrl}/docs`,
                },
              ],
            }),
          }}
        />
      </div>
    </>
  );
}
