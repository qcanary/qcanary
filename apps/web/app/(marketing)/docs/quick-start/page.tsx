import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Quick Start | QCanary Docs",
  description: "Install @qcanary/agent and start monitoring your BullMQ queues in minutes.",
  alternates: { canonical: `${siteUrl}/docs/quick-start` },
  openGraph: {
    title: "Quick Start | QCanary Docs",
    description: "Install @qcanary/agent and start monitoring your BullMQ queues in minutes.",
    url: `${siteUrl}/docs/quick-start`,
  },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-border bg-code-bg p-4 font-mono text-xs text-text-primary" translate="no">
      <code>{children}</code>
    </pre>
  );
}

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Quick Start</h1>
        <p className="text-text-muted">
          Create a project, install the agent, and stream events in minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Create a project and copy your API key</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-text-muted">
            Create a project in the Qcanary dashboard and copy the generated API key. Production keys
            start with <code className="text-accent">qca_live_</code>. Store it as an environment variable:
          </p>
          <CodeBlock>{`QCANARY_KEY=qca_live_<your-project-key>`}</CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Install the agent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-text-muted">
            Install the lightweight package in the same service that creates your BullMQ queues.
          </p>
          <CodeBlock>{`npm install @qcanary/agent`}</CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Initialize QueueMonitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-text-muted">
            Pass your BullMQ queues to <code className="text-accent">QueueMonitor</code>. The agent attaches
            to QueueEvents and sends metadata to QCanary asynchronously:
          </p>
          <CodeBlock>{`import express from "express";
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

app.listen(3000);`}</CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Verify events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-muted">
            Enqueue a test job and check the Qcanary dashboard. You should see completed (or failed) events
            appear within a few seconds. Events are flushed every 5 seconds by default.
          </p>
          <div className="rounded-md border border-border bg-surface/40 p-3">
            <p className="text-sm text-text-muted">
              If no events appear, verify that <code className="text-accent">QCANARY_API_KEY</code> is set correctly
              and your server can reach <code className="text-accent">api.qcanary.dev</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-text-muted">
        <p>
          Next: <Link href="/docs/configuration" className="text-accent hover:underline">Configuration options</Link> —
          customize flush intervals, environments, and more.
        </p>
      </div>
    </div>
  );
}
