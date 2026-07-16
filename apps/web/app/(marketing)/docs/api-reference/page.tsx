import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary" translate="no">
      <code>{children}</code>
    </pre>
  );
}

export const metadata: Metadata = {
  title: "API Reference | QCanary Docs",
  description: "POST /v1/ingest endpoint, request format, authentication, and rate limits.",
  alternates: { canonical: `${siteUrl}/docs/api-reference` },
  openGraph: {
    title: "API Reference | QCanary Docs",
    description: "POST /v1/ingest endpoint, request format, authentication, and rate limits.",
    url: `${siteUrl}/docs/api-reference`,
  },
};

export default function ApiReferencePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">API Reference</h1>
        <p className="text-text-muted">
          The HTTP ingest endpoint used by the agent to send events.
        </p>
      </div>

      {/* ── Endpoint ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>POST /v1/ingest</CardTitle>
          <CardDescription>Receive batched events from the agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-surface/40 p-3">
            <span className="font-mono text-xs text-text-primary">POST</span>{" "}
            <span className="font-mono text-xs text-accent">https://api.qcanary.dev/v1/ingest</span>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Request headers</h3>
            <CodeBlock>{`Authorization: Bearer qca_live_<your-api-key>
Content-Type: application/json`}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Request body</h3>
            <p className="mb-2 text-sm text-text-muted">
              The agent sends an array of event objects. Each event contains metadata about a single BullMQ job lifecycle change.
            </p>
            <CodeBlock>{`[
  {
    "event": "completed",
    "queueName": "email",
    "jobName": "send-welcome",
    "jobId": "42",
    "durationMs": 1234,
    "environment": "production",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
]`}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Response</h3>
            <CodeBlock>{`{
  "received": 1,
  "queued": true
}`}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* ── Authentication ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>API keys and how they work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            Every request must include a valid API key in the <code className="text-accent">Authorization</code> header
            using Bearer token format. Keys are project-scoped &mdash; each project in the dashboard has its own set of keys.
          </p>
          <p className="text-sm text-text-muted">
            Keys are hashed with SHA-256 before storage. The plaintext key is shown only once at creation time.
            Revoking a key immediately invalidates it &mdash; the agent will receive 401 responses and silently drop events.
          </p>
          <div className="rounded-md border border-border bg-surface/40 p-3">
            <p className="text-xs text-text-muted">
              Production keys start with <code className="text-accent">qca_live_</code>.
              Use test keys (<code className="text-accent">qca_test_</code>) for development.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Rate limits ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Rate limits</CardTitle>
          <CardDescription>Ingestion limits per project per day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            Rate limits are enforced per project per day. When the daily limit is reached, the API
            returns <code className="text-accent">429 Too Many Requests</code> and the agent drops events until the next day.
          </p>
          <div className="overflow-auto">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-2 py-2 font-medium">Plan</th>
                  <th className="px-2 py-2 font-medium">Events / day</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Free</td>
                  <td className="px-2 py-2 text-text-muted">5,000</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Solo</td>
                  <td className="px-2 py-2 text-text-muted">25,000</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Team</td>
                  <td className="px-2 py-2 text-text-muted">100,000</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-2 text-text-primary">Business</td>
                  <td className="px-2 py-2 text-text-muted">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-text-muted">
        <p>
          See also: <Link href="/docs/configuration" className="text-accent hover:underline">Configuration</Link> &mdash;
          all QueueMonitor constructor options.
        </p>
      </div>
    </div>
  );
}
