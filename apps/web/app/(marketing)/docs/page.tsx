import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/Brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

const installSnippet = `npm install @qcanary/agent`;

const setupSnippet = `import express from "express";
import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const app = express();
const emailQueue = new Queue("email", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY,
  queues: [emailQueue],
});

await monitor.start();

app.listen(3000);
`;

const envSnippet = `const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue, reportQueue],
  environment: "staging",           // tag events by environment
  flushInterval: 3000,              // flush every 3s instead of 5s
})`;

const configRows = [
  { key: "apiKey", required: "yes", type: "string", defaultValue: "—", description: "Project API key from the Qcanary dashboard. Production keys start with qca_live_." },
  { key: "queues", required: "yes", type: "Queue[]", defaultValue: "—", description: "BullMQ Queue instances to monitor. Pass all queues whose events you want to capture." },
  { key: "apiBaseUrl", required: "no", type: "string", defaultValue: "https://api.qcanary.dev", description: "Override for self-hosted deployments. Must point to your Qcanary API instance." },
  { key: "includePayload", required: "no", type: "boolean", defaultValue: "false", description: "Include job `.data` payload in events. ⚠️ May contain sensitive information — keep disabled unless necessary." },
  { key: "flushInterval", required: "no", type: "number", defaultValue: "5000", description: "How often (ms) the agent flushes buffered events to the API." },
  { key: "maxBufferSize", required: "no", type: "number", defaultValue: "100", description: "Max events buffered before triggering an immediate flush." },
  { key: "maxRetries", required: "no", type: "number", defaultValue: "3", description: "HTTP retry attempts with exponential backoff before dropping the batch." },
  { key: "environment", required: "no", type: "string", defaultValue: "production", description: "Environment label stored with every event. Use to filter between prod, staging, dev." },
  { key: "connection", required: "no", type: "ConnectionOptions", defaultValue: "from Queue", description: "Redis connection for QueueEvents. Falls back to the first queue's connection." },
  { key: "onError", required: "no", type: "(err: Error) => void", defaultValue: "noop", description: "Optional callback for non-fatal errors. Useful for local debugging." },
];

const eventRows = [
  { event: "completed", status: "completed", fields: "queueName, jobName, jobId, durationMs, environment" },
  { event: "failed", status: "failed", fields: "queueName, jobName, jobId, errorMessage, errorStack, attempts, environment" },
  { event: "stalled", status: "stalled", fields: "queueName, jobName, jobId, environment" },
  { event: "delayed", status: "delayed", fields: "queueName, jobName, jobId, delayMs, environment" },
  { event: "active", status: "active", fields: "queueName, jobName, jobId, environment" },
  { event: "waiting", status: "waiting", fields: "queueName, jobName, jobId, environment" },
  { event: "drained", status: "drained", fields: "queueName, environment" },
];

export const metadata: Metadata = {
  title: "QCanary Docs — BullMQ Monitoring Agent",
  description:
    "Install @qcanary/agent in your worker process to stream BullMQ queue events over HTTPS. No Redis credentials required. Quick start, configuration, alert rules, and API key management.",
  openGraph: {
    title: "QCanary Docs",
    description:
      "Install @qcanary/agent in your worker process to stream BullMQ queue events over HTTPS. No Redis credentials required.",
  },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <BrandLockup
          href="/"
          size="sm"
          className="w-fit"
          labelClassName="text-sm uppercase tracking-[0.22em] text-text-muted"
        />
        <h1 className="text-4xl font-semibold tracking-tight">Qcanary Docs</h1>
        <p className="text-text-muted">
          Monitor BullMQ queues with alerts and historical health data — without sharing Redis credentials.
        </p>
        <Link href="/onboarding" className="text-sm text-accent hover:underline">
          Open dashboard onboarding →
        </Link>
      </div>

      {/* ── Quick Start ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>Create a project, install the agent, and stream events in minutes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">1. Create a project and copy your API key</h3>
            <p className="mb-2 text-sm text-text-muted">
              Create a project in the Qcanary dashboard and copy the generated API key. Production keys
              start with <code className="text-accent">qca_live_</code>. Store it as an environment variable:
            </p>
            <CodeBlock>{`QCANARY_KEY=qca_live_<your-project-key>`}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">2. Install the agent</h3>
            <p className="mb-2 text-sm text-text-muted">
              Install the lightweight package in the same service that creates your BullMQ queues.
            </p>
            <CodeBlock>{installSnippet}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">3. Initialize in your app</h3>
            <p className="mb-2 text-sm text-text-muted">
              Pass your BullMQ queues to <code className="text-accent">QueueMonitor</code>. The agent attaches
              to QueueEvents and sends metadata to QCanary asynchronously:
            </p>
            <CodeBlock>{setupSnippet}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* ── Configuration ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration options</CardTitle>
          <CardDescription>All QueueMonitor constructor options.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-2 py-2 font-medium">Option</th>
                <th className="px-2 py-2 font-medium">Required</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">Default</th>
                <th className="px-2 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {configRows.map((row) => (
                <tr key={row.key} className="border-b border-border/70">
                  <td className="px-2 py-2 font-mono text-xs text-text-primary">{row.key}</td>
                  <td className="px-2 py-2 text-text-primary">{row.required}</td>
                  <td className="px-2 py-2 font-mono text-xs text-text-primary">{row.type}</td>
                  <td className="px-2 py-2 font-mono text-xs text-text-muted">{row.defaultValue}</td>
                  <td className="px-2 py-2 text-text-muted">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ─── Multi-environment ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-environment setup</CardTitle>
          <CardDescription>Monitor production, staging, and development separately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-muted">
            Create one project per environment in the dashboard, then pass the matching API key and
            environment tag to each QueueMonitor instance:
          </p>
          <CodeBlock>{envSnippet}</CodeBlock>
          <p className="text-sm text-text-muted">
            Events are tagged with the environment name so you can filter by environment in the dashboard.
          </p>
        </CardContent>
      </Card>

      {/* ── Events ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Events captured</CardTitle>
          <CardDescription>BullMQ QueueEvents mapped to Qcanary event types.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-2 py-2 font-medium">BullMQ event</th>
                <th className="px-2 py-2 font-medium">Stored status</th>
                <th className="px-2 py-2 font-medium">Captured fields</th>
              </tr>
            </thead>
            <tbody>
              {eventRows.map((row) => (
                <tr key={row.event} className="border-b border-border/70">
                  <td className="px-2 py-2 font-mono text-xs text-text-primary">{row.event}</td>
                  <td className="px-2 py-2 font-mono text-xs text-text-primary">{row.status}</td>
                  <td className="px-2 py-2 text-text-muted">{row.fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Alert Rules ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Alert rules</CardTitle>
          <CardDescription>Get notified when something goes wrong in your queues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Condition types</h3>
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
                  Fires when a single job&rsquo;s processing time exceeds the threshold (in ms).
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Slack alerts</h3>
            <p className="mb-2 text-sm text-text-muted">
              Create an incoming webhook in Slack (Slack App → Incoming Webhooks → Add New Webhook),
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
              Enter the recipient email address. A cooldown period prevents alert fatigue —
              the same rule won&rsquo;t fire again until the cooldown expires.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Webhook alerts (Pro plan)</h3>
            <p className="text-sm text-text-muted">
              Pro plan supports custom webhook destinations. Qcanary POSTs a JSON payload to your
              endpoint with the alert details. Useful for PagerDuty, OpsGenie, or custom integrations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Dashboard ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard overview</CardTitle>
          <CardDescription>Understanding your queue health at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                View your current plan, upgrade to Starter or Pro via Dodo Payments, and manage billing.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── API Key Management ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>API key management</CardTitle>
          <CardDescription>Create and revoke keys without redeploying.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-muted">
            Each project can have multiple API keys. Keys are hashed with SHA-256 before storage —
            Qcanary never stores the plaintext key. The plaintext key is shown only once at creation time.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">Creating keys</div>
              <div className="mt-1 text-xs text-text-muted">
                Open a project in the dashboard, navigate to project settings, and create a new key.
                Optionally label it (e.g. &ldquo;production-worker&rdquo;) for identification.
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="text-sm font-medium text-text-primary">Revoking keys</div>
              <div className="mt-1 text-xs text-text-muted">
                Revoking a key immediately invalidates it. The agent will receive 401 responses
                and silently drop events until a valid key is configured.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Plans & Limits ───────────────────────────────────── */}
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
                  <th className="px-2 py-2 font-medium">Starter — $9/mo</th>
                  <th className="px-2 py-2 font-medium">Pro — $24/mo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Projects</td>
                  <td className="px-2 py-2 text-text-muted">1</td>
                  <td className="px-2 py-2 text-text-muted">3</td>
                  <td className="px-2 py-2 text-text-muted">Unlimited</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Queues per project</td>
                  <td className="px-2 py-2 text-text-muted">3</td>
                  <td className="px-2 py-2 text-text-muted">10</td>
                  <td className="px-2 py-2 text-text-muted">Unlimited</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Event history</td>
                  <td className="px-2 py-2 text-text-muted">3 days</td>
                  <td className="px-2 py-2 text-text-muted">30 days</td>
                  <td className="px-2 py-2 text-text-muted">90 days</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Events / day</td>
                  <td className="px-2 py-2 text-text-muted">10,000</td>
                  <td className="px-2 py-2 text-text-muted">100,000</td>
                  <td className="px-2 py-2 text-text-muted">Unlimited</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Slack alerts</td>
                  <td className="px-2 py-2 text-text-muted">—</td>
                  <td className="px-2 py-2 text-text-muted">✓</td>
                  <td className="px-2 py-2 text-text-muted">✓</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Email alerts</td>
                  <td className="px-2 py-2 text-text-muted">—</td>
                  <td className="px-2 py-2 text-text-muted">✓</td>
                  <td className="px-2 py-2 text-text-muted">✓</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Webhook alerts</td>
                  <td className="px-2 py-2 text-text-muted">—</td>
                  <td className="px-2 py-2 text-text-muted">—</td>
                  <td className="px-2 py-2 text-text-muted">✓</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Team members</td>
                  <td className="px-2 py-2 text-text-muted">1</td>
                  <td className="px-2 py-2 text-text-muted">1</td>
                  <td className="px-2 py-2 text-text-muted">3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Security Model ───────────────────────────────────── */}
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

      {/* ── Troubleshooting ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Quick fixes for common issues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-text-primary">No events appear in dashboard</h3>
            <p className="mt-1 text-sm text-text-muted">
              Verify that <code className="text-accent">QCANARY_API_KEY</code> is set correctly, that you&rsquo;re passing
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
              The agent operates entirely asynchronously — events are buffered and flushed on a timer.
              Keep <code className="text-accent">includePayload</code> disabled unless strictly needed, as fetching job
              data from Redis adds a small overhead per event.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-text-primary">Events drop during outages</h3>
            <p className="mt-1 text-sm text-text-muted">
              Failed HTTP requests retry up to 3 times with exponential backoff (1s → 2s → 4s).
              Prolonged Qcanary API outages intentionally drop events to protect the stability of your application.
              This is by design — your queues continue to work normally regardless of Qcanary availability.
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
  );
}
