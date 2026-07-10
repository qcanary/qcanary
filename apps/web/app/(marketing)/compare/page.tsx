import Link from "next/link";
import type { Metadata } from "next";
import { Shield, Zap, Bell, BarChart3, Layers, Clock, Lock, Users, ExternalLink } from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Qcanary vs Bull-Board — BullMQ Monitoring Comparison",
  description:
    "Compare Qcanary with Bull-Board: features, security model, alerting, and pricing. See why teams choose Qcanary for production BullMQ monitoring.",
};

const comparisons: Array<{
  feature: string;
  icon: React.ReactNode;
  bullBoard: string;
  qcanary: string;
  qcanaryWins: boolean;
}> = [
  {
    feature: "No Redis credentials needed",
    icon: <Shield className="h-4 w-4" />,
    bullBoard: "Requires full Redis URL access",
    qcanary: "Zero-trust agent — never shares credentials",
    qcanaryWins: true,
  },
  {
    feature: "Real-time queue monitoring",
    icon: <BarChart3 className="h-4 w-4" />,
    bullBoard: "✅ Yes",
    qcanary: "✅ Yes",
    qcanaryWins: false,
  },
  {
    feature: "Alerts (Slack, Email, Webhook)",
    icon: <Bell className="h-4 w-4" />,
    bullBoard: "❌ None",
    qcanary: "✅ Slack + Email (Starter), Webhook (Pro)",
    qcanaryWins: true,
  },
  {
    feature: "Persistent event history",
    icon: <Clock className="h-4 w-4" />,
    bullBoard: "❌ Redis state only (lost on restart)",
    qcanary: "✅ 24h–90 day retention (plan-dependent)",
    qcanaryWins: true,
  },
  {
    feature: "Authentication & team access",
    icon: <Users className="h-4 w-4" />,
    bullBoard: "❌ No built-in auth",
    qcanary: "✅ Clerk-powered auth + org management",
    qcanaryWins: true,
  },
  {
    feature: "Multi-project support",
    icon: <Layers className="h-4 w-4" />,
    bullBoard: "❌ Single app only",
    qcanary: "✅ Workspace-based multi-tenant",
    qcanaryWins: true,
  },
  {
    feature: "SOC 2 / compliance ready",
    icon: <Lock className="h-4 w-4" />,
    bullBoard: "❌ Requires Redis credential sharing",
    qcanary: "✅ No credentials leave your network",
    qcanaryWins: true,
  },
  {
    feature: "Setup time",
    icon: <Zap className="h-4 w-4" />,
    bullBoard: "~15 min (npm + queue setup)",
    qcanary: "~10 min (npm + agent init)",
    qcanaryWins: false,
  },
  {
    feature: "Job detail + stack traces",
    icon: <ExternalLink className="h-4 w-4" />,
    bullBoard: "✅ Yes (view job data from Redis)",
    qcanary: "✅ Yes (streamed via agent)",
    qcanaryWins: false,
  },
  {
    feature: "Retry jobs from dashboard",
    icon: <Bell className="h-4 w-4" />,
    bullBoard: "✅ Yes",
    qcanary: "Coming soon",
    qcanaryWins: false,
  },
  {
    feature: "Hosted / managed",
    icon: <BarChart3 className="h-4 w-4" />,
    bullBoard: "❌ Self-hosted (you maintain it)",
    qcanary: "✅ Fully managed SaaS",
    qcanaryWins: true,
  },
  {
    feature: "Pricing",
    icon: <Shield className="h-4 w-4" />,
    bullBoard: "Free (self-hosted, infra costs)",
    qcanary: "Free tier + $9/mo Starter + $24/mo Pro",
    qcanaryWins: false,
  },
  {
    feature: "Open source",
    icon: <Layers className="h-4 w-4" />,
    bullBoard: "✅ MIT License",
    qcanary: "✅ Agent is MIT-licensed",
    qcanaryWins: false,
  },
];

const featureCards: Array<{
  title: string;
  description: string;
  details: string[];
}> = [
  {
    title: "Security Model",
    description: "The fundamental difference",
    details: [
      "Bull-Board connects directly to Redis using your credentials — a non-starter for SOC 2 compliance.",
      "Qcanary runs a lightweight agent inside your worker process, listening to BullMQ's QueueEvents API.",
      "No Redis URL, no credentials, no firewall changes — ever.",
    ],
  },
  {
    title: "Alerting",
    description: "Proactive vs reactive monitoring",
    details: [
      "Bull-Board shows you queues — you have to watch them yourself.",
      "Qcanary alerts you via Slack, email, or webhook when failure rates spike, queues stall, or jobs exceed duration thresholds.",
      "Auto-resolution means alerts close when recovery happens — no manual cleanup.",
    ],
  },
  {
    title: "Team Access",
    description: "Built for collaboration",
    details: [
      "Bull-Board has no auth — anyone with the URL can see your queues.",
      "Qcanary provides Clerk-powered auth with organization management, team roles, and API key controls.",
      "Keep your queues visible to your team and invisible to everyone else.",
    ],
  },
];

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <BrandLockup href="/" size="md" />
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <Link href="/blog" className="text-sm text-text-muted whitespace-nowrap transition-colors hover:text-text-primary">
              Blog
            </Link>
            <Link href="/docs" className="hidden sm:inline text-sm text-text-muted whitespace-nowrap transition-colors hover:text-text-primary">
              Docs
            </Link>
            <Link href="/sign-in" className="text-sm text-text-muted whitespace-nowrap transition-colors hover:text-text-primary">
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute left-[-200px] top-[-240px] h-[600px] w-[800px] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.12)_0%,_rgba(34,197,94,0.04)_40%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent">
            Comparison
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Qcanary vs Bull-Board
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Bull-Board is a great debugging tool. Qcanary is a production monitoring platform.
            They serve different needs. Here&apos;s how they compare.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Try Qcanary Free</Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg">Read Docs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key differentiators */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">
            When to choose which
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bull-Board column */}
            <div className="rounded-xl border border-border bg-surface/30 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <span className="text-lg font-bold text-blue-400">B</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Choose Bull-Board when…</h3>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-blue-400">•</span>
                  You need a quick visual for your local dev environment
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-blue-400">•</span>
                  You&apos;re comfortable sharing Redis credentials internally
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-blue-400">•</span>
                  You don&apos;t need alerts, history, or team access
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-blue-400">•</span>
                  You want zero-cost and are fine with self-hosting
                </li>
              </ul>
            </div>
            {/* Qcanary column */}
            <div className="rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <span className="text-lg font-bold text-accent">Q</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Choose Qcanary when…</h3>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-accent">•</span>
                  Your security team won&apos;t approve sharing Redis credentials
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-accent">•</span>
                  You need Slack/email alerts when queues fail or stall
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-accent">•</span>
                  You want persistent job history beyond Redis memory
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-accent">•</span>
                  You need team access, multi-project, and audit trails
                </li>
                <li className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 text-accent">•</span>
                  You want a managed SaaS — no servers to maintain
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Feature comparison</h2>
          <p className="mb-10 text-text-muted">Side-by-side breakdown of capabilities across both tools.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-code-bg">
                  <th className="px-5 py-4 text-left text-sm font-medium text-text-primary">Feature</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-blue-400">Bull-Board</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-accent">Qcanary</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border/70 text-sm ${
                      row.qcanaryWins ? "bg-accent/[0.02]" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-text-primary">{row.feature}</td>
                    <td className="px-5 py-4 text-text-muted">{row.bullBoard}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2">
                        {row.qcanaryWins && (
                          <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        <span className={row.qcanaryWins ? "text-accent" : "text-text-muted"}>
                          {row.qcanary}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detailed breakdown */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Why the difference matters</h2>
          <p className="mb-10 text-text-muted">Three areas where Qcanary fundamentally changes how you monitor queues.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-surface/40 p-6 transition-all hover:border-accent/30">
                <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                <p className="text-xs text-text-muted mb-4">{card.description}</p>
                <ul className="space-y-2">
                  {card.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-24">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent">
            Get started in 3 lines
          </Badge>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Ready to upgrade your queue monitoring?
          </h2>
          <p className="mt-4 max-w-xl text-base text-text-muted">
            No Redis credentials required. No firewall changes. No servers to maintain.
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

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <p>Qcanary - BullMQ monitoring for production teams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hover:text-text-primary">Blog</Link>
            <span className="text-border">|</span>
            <Link href="/docs" className="hover:text-text-primary">Docs</Link>
            <span className="text-border">|</span>
            <Link href="/" className="hover:text-text-primary">Home</Link>
            <span className="text-border">|</span>
            <Link href="/sign-up" className="hover:text-text-primary">Start Free</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
