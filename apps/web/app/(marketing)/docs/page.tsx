import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const installSnippet = `npm install @qcanary/agent bullmq ioredis`;

const setupSnippet = `import { QueueMonitor } from "@qcanary/agent"

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue, reportQueue],
})
`;

const configRows = [
  { key: "apiKey", required: "yes", type: "string", defaultValue: "none", description: "Project API key from dashboard." },
  { key: "queues", required: "yes", type: "Queue[]", defaultValue: "none", description: "BullMQ queues to monitor." },
  { key: "includePayload", required: "no", type: "boolean", defaultValue: "false", description: "Include payload metadata if needed." },
  { key: "flushInterval", required: "no", type: "number", defaultValue: "5000", description: "Flush buffer interval in milliseconds." },
  { key: "environment", required: "no", type: "string", defaultValue: "production", description: "Environment label stored with events." },
];

const eventRows = [
  { event: "completed", status: "completed", fields: "queue, jobName, jobId, duration" },
  { event: "failed", status: "failed", fields: "queue, jobName, jobId, errorMessage, errorStack, attempts" },
  { event: "stalled", status: "stalled", fields: "queue, jobName, jobId" },
  { event: "delayed", status: "delayed", fields: "queue, jobName, jobId, delay" },
  { event: "active", status: "active", fields: "queue, jobName, jobId" },
  { event: "waiting", status: "waiting", fields: "queue, jobName" },
  { event: "drained", status: "drained", fields: "queue" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Qcanary Docs</h1>
        <p className="text-text-muted">
          Monitor BullMQ queues with alerts and historical health data without sharing Redis credentials.
        </p>
        <Link href="/onboarding" className="text-sm text-accent hover:underline">
          Open dashboard onboarding
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
          <CardDescription>Install the monitoring package and peer dependencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary">
            {installSnippet}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3-line setup</CardTitle>
          <CardDescription>Initialize the monitor inside your BullMQ worker app.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary">
            {setupSnippet}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration options</CardTitle>
          <CardDescription>QueueMonitor options and defaults.</CardDescription>
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
                  <td className="px-2 py-2 font-mono text-xs text-text-primary">{row.defaultValue}</td>
                  <td className="px-2 py-2 text-text-muted">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events captured</CardTitle>
          <CardDescription>Mapped BullMQ events and stored fields.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-2 py-2 font-medium">BullMQ event</th>
                <th className="px-2 py-2 font-medium">Stored status</th>
                <th className="px-2 py-2 font-medium">Fields</th>
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

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting FAQ</CardTitle>
          <CardDescription>Quick fixes for common integration issues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-text-primary">No events appear in dashboard</h3>
            <p className="mt-1 text-sm text-text-muted">
              Verify `QCANARY_API_KEY`, ensure monitored queues are passed to `queues`, and confirm your API URL is reachable.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-text-primary">Slack test alert fails</h3>
            <p className="mt-1 text-sm text-text-muted">
              Use an incoming webhook URL that starts with `https://hooks.slack.com/` and check the channel app permissions.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-text-primary">Agent affects app performance</h3>
            <p className="mt-1 text-sm text-text-muted">
              The agent buffers and flushes asynchronously. Keep `includePayload` disabled unless strictly needed.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-text-primary">Events drop during outages</h3>
            <p className="mt-1 text-sm text-text-muted">
              Failed requests retry up to 3 times with exponential backoff; prolonged outages intentionally drop events to protect app stability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
