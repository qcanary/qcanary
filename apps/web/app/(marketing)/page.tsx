import Image from "next/image";
import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitor BullMQ Without Exposing Redis",
  description:
    "QCanary runs an agent inside your worker process. It streams job metadata over HTTPS. Your Redis instance stays private, no firewall changes required.",
  keywords: [
    "BullMQ monitoring",
    "Redis queue monitoring",
    "Node.js background jobs",
    "BullMQ alerts",
    "zero-trust queue monitoring",
    "VPC-friendly BullMQ",
  ],
};

const stats = [
  { label: "Queues monitored", value: "500+", suffix: "" },
  { label: "Events processed", value: "10M+", suffix: "" },
  { label: "npm package", value: "Published", suffix: "v0.1.0" },
  { label: "Setup time", value: "<10", suffix: "minutes" },
];

const testimonials = [
  {
    quote: "Finally, a monitoring tool that doesn&rsquo;t ask for Redis credentials. Setup took 5 minutes.",
    author: "SDE at a YC-backed startup",
    role: "Backend Engineer",
  },
  {
    quote: "We caught a silent queue failure within an hour of installing Qcanary. The Slack alerts are a lifesaver.",
    author: "Infra Lead",
    role: "Series B company",
  },
];

const pricingRows: Array<{
  feature: string;
  free: string;
  starter: string;
  pro: string;
}> = [
  { feature: "Projects", free: "1", starter: "3", pro: "Unlimited" },
  { feature: "Queues per project", free: "3", starter: "10", pro: "Unlimited" },
  { feature: "Event history", free: "3 days", starter: "30 days", pro: "90 days" },
  { feature: "Events per day", free: "10,000", starter: "100,000", pro: "Unlimited" },
  { feature: "Slack alerts", free: "No", starter: "Yes", pro: "Yes" },
  { feature: "Email alerts", free: "No", starter: "Yes", pro: "Yes" },
  { feature: "Webhook alerts", free: "No", starter: "No", pro: "Yes" },
  { feature: "Alert rules", free: "0", starter: "5", pro: "Unlimited" },
  { feature: "Team members", free: "1", starter: "1", pro: "3" },
  { feature: "Job detail + stack trace", free: "Yes", starter: "Yes", pro: "Yes" },
  { feature: "Historical charts", free: "No", starter: "Yes", pro: "Yes" },
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <BrandLockup href="/" size="md" />
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-text-muted transition-colors hover:text-text-primary">
              Blog
            </Link>
            <Link href="/docs" className="text-sm text-text-muted transition-colors hover:text-text-primary">
              Docs
            </Link>
            <Link href="/sign-in" className="text-sm text-text-muted transition-colors hover:text-text-primary">
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-x-0 top-[-320px] mx-auto h-[520px] w-[900px] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.2)_0%,_rgba(34,197,94,0.08)_30%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center md:pt-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent">
            Zero-Trust BullMQ Monitoring
          </Badge>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Monitor BullMQ Without Exposing Redis.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-text-muted md:text-xl">
            QCanary runs an agent inside your worker process. It streams job metadata over
            HTTPS. Your Redis instance stays private, no firewall changes required.
          </p>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free
              </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View Docs
              </Button>
            </Link>
          </div>
          <div className="mt-10 w-full max-w-3xl rounded-lg border border-border bg-code-bg p-4 font-mono text-left text-sm text-text-muted">
            <p>npm install @qcanary/agent</p>
            <p>import {"{ QueueMonitor }"} from &quot;@qcanary/agent&quot;</p>
            <p>new QueueMonitor({"{"} apiKey, queues {"}"})</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Sharing Redis is a Security Risk</h2>
          <p className="mt-3 text-text-muted">
            Every queue monitoring dashboard that asks for your Redis URL creates the same attack
            surface: credential storage in a third-party system, firewall holes for inbound
            connections, and a compliance review for a tool your team needs just to see job status.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>The danger of exposing Redis</CardTitle>
              <CardDescription>Redis has no built-in access control beyond a plaintext password. Leaking a URL means full database access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-muted">
              <p>- Handing over your Redis URL grants read and write access to everything in the database.</p>
              <p>- Opening port 6379 to a vendor&#39;s IP requires VPC peering or public exposure — another blast radius.</p>
              <p>- Storing production Redis credentials in a third-party system violates SOC 2 and zero-trust policies.</p>
              <p>- BullMQ&#39;s internal data (job payloads, worker metadata) lives in Redis — sharing it leaks context about your workload internals.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>QueueEvents: monitor without access</CardTitle>
              <CardDescription>BullMQ emits lifecycle events from inside your own process. No Redis URL ever needs to leave.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-muted">
              <p>- BullMQ&#39;s built-in QueueEvents emitter dispatches <code>completed</code>, <code>failed</code>, <code>stalled</code>, <code>active</code>, and <code>waiting</code> events inside your Node.js process.</p>
              <p>- @qcanary/agent attaches to this emitter as a local subscriber — no network hop, no credential exchange.</p>
              <p>- The agent buffers events and streams only lightweight metadata over HTTPS: job ID, queue name, status, duration, and error message. No payload data.</p>
              <p>- Redis stays behind your firewall. QCanary never sees your REDIS_URL, never connects to your instance, and never needs VPC access.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-3 md:py-20">
          <Card className="md:col-span-1">
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Step 1
              </Badge>
              <CardTitle className="mt-3">Install @qcanary/agent</CardTitle>
              <CardDescription>
                Add the monitoring package to your Node.js worker process.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Use your existing BullMQ queues and initialize QueueMonitor with your API key.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Step 2
              </Badge>
              <CardTitle className="mt-3">Attach via QueueEvents (Zero-Trust)</CardTitle>
              <CardDescription>The agent subscribes to BullMQ events inside your process — no credential handoff.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              The agent attaches to BullMQ&rsquo;s built-in QueueEvents emitter as a local subscriber. It buffers job lifecycle events and streams only lightweight metadata over HTTPS. Redis stays behind your firewall.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Step 3
              </Badge>
              <CardTitle className="mt-3">View dashboards &amp; alerts</CardTitle>
              <CardDescription>Track queue health and alert on failures in real time.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              See failures, stack traces, trends, and alert history without opening Redis.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Social Proof / Stats ──────────────────────────────── */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Trusted by engineering teams</h2>
            <p className="mt-3 text-text-muted">
              From early-stage startups to production-scale deployments.
            </p>
          </div>
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-accent">
                    {stat.value}
                    <span className="text-lg text-text-muted">{stat.suffix}</span>
                  </div>
                  <div className="mt-2 text-sm text-text-muted">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="mb-4 text-2xl text-accent">&ldquo;</div>
                  <p className="text-sm text-text-muted italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="text-sm font-medium text-text-primary">{t.author}</div>
                    <div className="text-xs text-text-muted">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">See it in action</h2>
          <p className="mt-3 text-text-muted">
            Monitor queue health, inspect failures, and track trends from one dashboard.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface/80 to-code-bg">
          <Image
            src="/screenshots/dashboard-overview.png"
            alt="Qcanary dashboard showing queue overview, job history, and health metrics"
            width={1918}
            height={1058}
            className="h-auto w-full"
            sizes="(max-width: 768px) 100vw, 1152px"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Features</h2>
          <p className="mt-3 text-text-muted">
            Built for developers who already run BullMQ and need reliable operations visibility.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Dashboards</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Monitor queue status, throughput, failures, job history, and trends as events arrive.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Trigger Slack, email, or webhook notifications for failure rate, inactivity, queue depth, and job duration.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              QCanary never asks for Redis credentials and does not require inbound firewall changes.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Multi-tenancy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Keep organizations, projects, environments, queues, and API keys cleanly separated.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Auto-Resolution</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Resolve active incidents automatically when the alert condition recovers.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Track project and daily event usage against your plan before limits surprise your team.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Pricing</h2>
            <p className="mt-3 text-text-muted">
              Start free and upgrade when alerting and deeper history become essential.
            </p>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-code-bg text-left text-sm">
                    <th className="px-4 py-3 font-medium text-text-primary">Feature</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Free</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Starter $9/mo</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Pro $24/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/70 text-sm">
                      <td className="px-4 py-3 text-text-primary">{row.feature}</td>
                      <td className="px-4 py-3 text-text-muted">{row.free}</td>
                      <td className="px-4 py-3 text-text-muted">{row.starter}</td>
                      <td className="px-4 py-3 text-text-muted">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="mt-4 text-sm text-text-muted">
            Free plan intentionally includes zero alerting to keep advanced reliability tooling
            available as teams scale.
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to monitor your queues?
          </h2>
          <p className="mt-3 max-w-2xl text-text-muted">
            Install in 3 lines. No Redis credentials required. Start free, upgrade when you need alerts.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg">Start Free</Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">Read the docs</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">FAQ</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Do I need to share Redis credentials?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              No. The Qcanary agent listens to BullMQ events inside your app and sends only
              lightweight metadata to the API.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How long does setup take?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Most teams install and send first events in under 10 minutes with a 3-line setup.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Which alerts are available?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Starter and Pro include Slack and email alerts. Pro adds webhook alerts.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Can I view failed job details?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Yes. Every plan includes job-level detail and stack traces for failed jobs.
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <p>Qcanary - BullMQ monitoring for production teams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hover:text-text-primary">
              Blog
            </Link>
            <span className="text-border">|</span>
            <Link href="/docs" className="hover:text-text-primary">
              Docs
            </Link>
            <span className="text-border">|</span>
            <Link href="/sign-in" className="hover:text-text-primary">
              Dashboard
            </Link>
            <span className="text-border">|</span>
            <Link href="/sign-up" className="hover:text-text-primary">
              Start Free
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
