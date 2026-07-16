import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

const configRows = [
  { key: "apiKey", required: "yes", type: "string", defaultValue: "—", description: "Project API key from the Qcanary dashboard. Production keys start with qca_live_." },
  { key: "queues", required: "yes", type: "Queue[]", defaultValue: "—", description: "BullMQ Queue instances to monitor. Pass all queues whose events you want to capture." },
  { key: "apiBaseUrl", required: "no", type: "string", defaultValue: "https://api.qcanary.dev", description: "Override for self-hosted deployments. Must point to your Qcanary API instance." },
  { key: "includePayload", required: "no", type: "boolean", defaultValue: "false", description: "Include job `.data` payload in events. May contain sensitive information — keep disabled unless necessary." },
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
  title: "Configuration | QCanary Docs",
  description: "QueueMonitor constructor options, event types, and multi-environment setup.",
  alternates: { canonical: `${siteUrl}/docs/configuration` },
  openGraph: {
    title: "Configuration | QCanary Docs",
    description: "QueueMonitor constructor options, event types, and multi-environment setup.",
    url: `${siteUrl}/docs/configuration`,
  },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary" translate="no">
      <code>{children}</code>
    </pre>
  );
}

export default function ConfigurationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Configuration</h1>
        <p className="text-text-muted">
          All QueueMonitor constructor options, event types, and environment setup.
        </p>
      </div>

      {/* ── Configuration Options ──────────────────────────────── */}
      <Card id="agent-options">
        <CardHeader>
          <CardTitle>Agent options</CardTitle>
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

      {/* ── Multi-environment ──────────────────────────────────── */}
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
          <CodeBlock>{`const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue, reportQueue],
  environment: "staging",           // tag events by environment
  flushInterval: 3000,              // flush every 3s instead of 5s
})`}</CodeBlock>
          <p className="text-sm text-text-muted">
            Events are tagged with the environment name so you can filter by environment in the dashboard.
          </p>
        </CardContent>
      </Card>

      {/* ── Events ────────────────────────────────────────────── */}
      <Card id="event-types">
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

      <Separator />

      <div className="text-sm text-text-muted">
        <p>
          Next: <Link href="/docs/alert-rules" className="text-accent hover:underline">Alert rules</Link> —
          get notified when something goes wrong.
        </p>
      </div>
    </div>
  );
}
