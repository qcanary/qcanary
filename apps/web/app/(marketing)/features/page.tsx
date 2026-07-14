import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield,
  BarChart3,
  Bell,
  Zap,
  Clock,
  Users,
  Lock,
  Filter,
  Search,
} from "lucide-react";
import { BrandMark } from "@/components/Brand";
import MarketingNav from "@/components/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Qcanary's features: zero-trust BullMQ monitoring, real-time dashboards, Slack/email/webhook alerts, job debugging, and team collaboration — all without exposing your infrastructure.",
  alternates: {
    canonical: `${siteUrl}/features`,
  },
  openGraph: {
    url: `${siteUrl}/features`,
  },
};

const featureGroups = [
  {
    title: "Monitoring & Visibility",
    badge: "Core",
    features: [
      {
        icon: BarChart3,
        title: "Real-time Dashboards",
        desc: "Monitor queue status, throughput, failures, job history, and trends as events arrive — updated in real time via Supabase Realtime.",
        details: ["Live queue health metrics", "Throughput and failure charts", "Job history timeline", "Per-queue drill-down"],
      },
      {
        icon: Clock,
        title: "Persistent Event History",
        desc: "Events are stored in a database, not Redis memory. View job history from 24 hours (Free) up to 90 days (Pro).",
        details: ["Database-backed storage", "Up to 90-day retention", "Search and filter events", "Exportable event logs"],
      },
      {
        icon: Search,
        title: "Job Detail & Stack Traces",
        desc: "Inspect failed job details, error messages, stack traces, and attempt counts — all without accessing Redis directly.",
        details: ["Full error message inspection", "Stack trace capture", "Attempt history", "Job metadata view"],
      },
    ],
  },
  {
    title: "Alerting",
    badge: "Starter+",
    features: [
      {
        icon: Bell,
        title: "Multi-Channel Alerts",
        desc: "Configure alert rules that trigger Slack messages, emails, or webhooks when failure rates spike, queues stall, or jobs exceed duration thresholds.",
        details: ["Slack notifications", "Email alerts", "Webhook integrations", "Custom alert rules"],
      },
      {
        icon: Zap,
        title: "Auto-Resolution",
        desc: "Alerts close automatically when the triggering condition recovers — no manual cleanup, no stale notifications.",
        details: ["Automatic recovery detection", "No manual dismissal needed", "Alert history log", "Rate-limited notifications"],
      },
      {
        icon: Filter,
        title: "Smart Alert Rules",
        desc: "Define conditions based on failure rate %, queue inactivity, job duration, and queue depth. Pro plans get unlimited rules.",
        details: ["Failure rate thresholds", "Inactivity detection", "Duration monitoring", "Queue depth triggers"],
      },
    ],
  },
  {
    title: "Security & Compliance",
    badge: "Core",
    features: [
      {
        icon: Shield,
        title: "Zero-Trust Architecture",
        desc: "No Redis credentials ever leave your infrastructure. The agent attaches via BullMQ's built-in QueueEvents API — no firewall changes needed.",
        details: ["No Redis URL sharing", "No VPC peering required", "Agent runs in your process", "Metadata-only transmission"],
      },
      {
        icon: Lock,
        title: "SOC 2 in Progress",
        desc: "We are working toward SOC 2 Type II certification. Our zero-trust architecture — no Redis credentials shared — provides a strong foundation for compliance.",
        details: ["No third-party Redis access", "SOC 2 Type II audit in progress", "API-key based auth", "Encrypted data in transit"],
      },
      {
        icon: Users,
        title: "Team Access Control",
        desc: "Clerk-powered authentication with organization management, team roles, and granular API key controls.",
        details: ["Clerk auth integration", "Organization management", "Role-based access", "API key revocation"],
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute left-[-200px] top-[-300px] h-[700px] w-[900px] animate-pulse-glow rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.12)_0%,_rgba(34,197,94,0.04)_40%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-fade-in-up">Features</Badge>
          <h1 className="animate-fade-in-up-delay-1 text-3xl font-semibold tracking-tight md:text-4xl lg:text-6xl">
            Everything you need to <span className="text-gradient">monitor queues</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Real-time dashboards, multi-channel alerts, zero-trust security — built for teams that run BullMQ in production.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-8 flex justify-center gap-4">
            <Link href="/sign-up"><Button size="lg">Start Free</Button></Link>
            <Link href="/docs"><Button variant="secondary" size="lg">Read Docs</Button></Link>
          </div>
        </div>
      </section>

      {/* Feature groups */}
      {featureGroups.map((group, gi) => (
        <section key={group.title} className={`border-y border-border ${gi % 2 === 0 ? 'bg-gradient-to-b from-surface/20 to-bg' : 'bg-bg'}`}>
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="mb-12 flex items-center gap-3">
              <Badge variant={group.badge === "Core" ? "success" : "outline"} className={group.badge === "Starter+" ? "border-accent/30 text-accent" : ""}>
                {group.badge}
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{group.title}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {group.features.map((feature) => (
                <div key={feature.title} className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
                  <div className="icon-glow mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {feature.details.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-xs text-text-muted">
                        <div className="h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-24">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Ready to get started?</h2>
          <p className="mt-3 max-w-lg text-text-muted">No Redis credentials required. 3-line setup. 10 minutes to your first event.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/sign-up"><Button size="lg">Start Free</Button></Link>
            <Link href="/compare"><Button variant="secondary" size="lg">vs Bull-Board</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <p>Qcanary - BullMQ monitoring for production teams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-text-primary">Home</Link>
            <span className="text-border">|</span>
            <Link href="/docs" className="hover:text-text-primary">Docs</Link>
            <span className="text-border">|</span>
            <Link href="/blog" className="hover:text-text-primary">Blog</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
