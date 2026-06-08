import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
          <Link href="/" className="text-lg font-semibold tracking-tight text-text-primary">
            Qcanary
          </Link>
          <div className="flex items-center gap-4">
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
            Built for BullMQ in production
          </Badge>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Know when your jobs fail. Before your users do.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-text-muted md:text-xl">
            BullMQ monitoring with Slack alerts and job history. Install in 3 lines. No
            Redis credentials required.
          </p>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Open Dashboard
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
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">The Problem</h2>
          <p className="mt-3 text-text-muted">
            Background jobs fail quietly until a user reports missing emails, stale reports, or
            broken automations. Existing monitoring tools ask for direct Redis access, which
            creates avoidable security and compliance risk.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What teams deal with today</CardTitle>
              <CardDescription>Failures are discovered after customer impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-muted">
              <p>- No default visibility into job failures across queues.</p>
              <p>- Alerts are missing, delayed, or too noisy to trust.</p>
              <p>- On-call engineers debug from logs without queue context.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How Qcanary changes it</CardTitle>
              <CardDescription>Monitoring without sharing Redis credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-muted">
              <p>- Native BullMQ `QueueEvents` capture with lightweight metadata.</p>
              <p>- Slack and email notifications when rules are breached.</p>
              <p>- Historical queue health and full failure details in one dashboard.</p>
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
              <CardTitle className="mt-3">Install the agent</CardTitle>
              <CardDescription>
                Add Qcanary to your Node.js codebase in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Use your existing BullMQ queues and initialize `QueueMonitor`.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Step 2
              </Badge>
              <CardTitle className="mt-3">Stream job metadata</CardTitle>
              <CardDescription>No payloads and no direct Redis access.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Events are buffered and sent to Qcanary over HTTP with retries.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Step 3
              </Badge>
              <CardTitle className="mt-3">Act before users notice</CardTitle>
              <CardDescription>Track queue health and get real alerts.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              See failures, stack traces, and trends in a live dashboard.
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
          <div className="aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl">📊</div>
              <p className="mt-4 text-sm text-text-muted">
                Dashboard preview &mdash; add your screenshot here
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Queue overview, job history, charts, and alert rules
              </p>
            </div>
          </div>
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
              <CardTitle>Live Queue Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Monitor queues, statuses, throughput, and failure rates in real time.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Failure Alerts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Trigger Slack and email notifications based on configurable thresholds.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Stack Trace Visibility</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Inspect complete error messages and stack traces for each failed job.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Historical Health Charts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Analyze queue behavior over time to detect regressions and spikes.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rule-Based Alerting</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Define rules for failure rate, inactivity, queue depth, and job duration.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-muted">
              Qcanary never requires your Redis credentials to deliver observability.
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
          <p>Qcanary - BullMQ monitoring for production teams.</p>
          <div className="flex items-center gap-3">
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
