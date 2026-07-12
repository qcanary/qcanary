import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { BrandLockup } from "@/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ArchitectureDiagram } from "@/components/landing/ArchitectureDiagram";
import { getAllBlogPosts, type BlogPostMeta } from "./blog/posts";
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

const pricingRows: Array<{
  feature: string;
  free: string;
  starter: string;
  pro: string;
}> = [
  { feature: "Projects", free: "1", starter: "3", pro: "Unlimited" },
  { feature: "Queues per project", free: "1", starter: "10", pro: "Unlimited" },
  { feature: "Event history", free: "24 hours", starter: "30 days", pro: "90 days" },
  { feature: "Events per day", free: "1,000", starter: "100,000", pro: "Unlimited" },
  { feature: "Slack alerts", free: "No", starter: "Yes", pro: "Yes" },
  { feature: "Email alerts", free: "No", starter: "Yes", pro: "Yes" },
  { feature: "Send test events", free: "Yes", starter: "Yes", pro: "Yes" },
  { feature: "Webhook alerts", free: "No", starter: "No", pro: "Yes" },
  { feature: "Alert rules", free: "0", starter: "5", pro: "Unlimited" },
  { feature: "Team members", free: "1", starter: "3", pro: "10" },
  { feature: "Job detail + stack trace", free: "Yes", starter: "Yes", pro: "Yes" },
  { feature: "Historical charts", free: "No", starter: "Yes", pro: "Yes" },
];

async function LatestBlogSection({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null;
  const [first, ...rest] = posts.slice(0, 3);
  if (!first) return null;

  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Latest from the Blog</h2>
          <p className="mt-3 text-text-muted">
            Technical writing about BullMQ monitoring, Redis queue observability, and production background jobs.
          </p>
        </div>

        {/* Featured post — full-width highlight */}
        <Link href={`/blog/${first.slug}`} className="group block">
          <div className="mb-6 rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-6 transition-all hover:border-accent/30 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Featured</span>
                  <time className="text-xs text-text-muted" dateTime={first.date}>
                    {new Date(first.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent md:text-xl">{first.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{first.description}</p>
              </div>
              <div className="shrink-0 self-start md:self-center">
                <svg className="h-5 w-5 text-text-muted transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Rest — compact side-by-side */}
        <div className="grid gap-4 md:grid-cols-2">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="rounded-lg border border-border bg-surface/30 p-5 transition-all hover:border-accent/30">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent">{post.title}</h3>
                </div>
                <time className="mt-2 block text-xs text-text-muted" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/blog">
            <Button variant="secondary" size="sm">View all posts →</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { HeroSection } from "@/components/landing/HeroSection";

export default async function MarketingPage() {
  const posts = await getAllBlogPosts();

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <BrandLockup href="/" size="md" />
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <Link href="/compare" className="text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              vs Bull-Board
            </Link>
            <Link href="/blog" className="text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Blog
            </Link>
            <Link href="/docs" className="hidden sm:inline text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Docs
            </Link>
            <Link href="/sign-in" className="text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile-responsive hero: stacking, overflow, padding */}
      <div className="overflow-x-hidden">
        <HeroSection />
      </div>

      <section className="overflow-hidden border-b border-border bg-gradient-to-br from-surface/20 via-bg to-code-bg">
        <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
          {/* Dot grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
          <div className="mx-auto mb-14 max-w-2xl text-center animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">The Problem</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Sharing Redis is a Security Risk</h2>
            <p className="mt-3 text-text-muted">
              Every queue monitoring dashboard that asks for your Redis URL creates an attack
              surface that your security team will flag.
            </p>
          </div>

          {/* Problem — full width with stats-style emphasis */}
          <div className="mx-auto mb-16 max-w-4xl animate-fade-in-up-delay-1">
            <div className="rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/5 to-code-bg p-8 shadow-lg shadow-red-500/5 md:p-10">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                  <span className="text-xs font-bold text-red-400">!</span>
                </div>
                <span className="text-sm font-medium text-red-400">The danger of exposing Redis</span>
              </div>
              <p className="mb-5 text-sm text-text-muted">
                Redis has no built-in access control beyond a plaintext password. Leaking a URL means full database access.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: "🔑", title: "Credential exposure", desc: "Handing over your Redis URL grants full database access to a third party" },
                  { icon: "🌐", title: "Network blast radius", desc: "Opening port 6379 to a vendor requires VPC peering or public exposure" },
                  { icon: "📋", title: "Compliance violation", desc: "Storing production Redis credentials in a third-party system violates SOC 2" },
                  { icon: "📊", title: "Data leakage", desc: "Job payloads, worker metadata, and internals exposed to external monitoring" },
                ].map((item) => (
                  <div key={item.title} className="card-hover group flex items-start gap-3 rounded-lg border border-border bg-surface/40 p-4">
                    <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.title}</div>
                      <div className="mt-0.5 text-xs text-text-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solution — different layout, full width */}
          <div className="mx-auto max-w-4xl animate-fade-in-up-delay-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-medium text-accent">The Solution</span>
            </div>
            <p className="mb-2 text-xl font-medium text-text-primary">QueueEvents: monitor without access</p>
            <p className="mb-6 text-sm text-text-muted">
              BullMQ emits lifecycle events from inside your own process. No Redis URL ever needs to leave.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card-hover group rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-accent">Event Types</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["completed", "failed", "stalled", "active", "waiting", "delayed"].map((evt) => (
                    <span key={evt} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent/30 hover:text-accent">
                      {evt}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  BullMQ&apos;s QueueEvents dispatches these lifecycle events inside your Node.js process.
                </p>
              </div>
              <div className="card-hover group rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-blue-400">Data Sent</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["jobId", "queueName", "status", "durationMs", "errorMessage"].map((evt) => (
                    <span key={evt} className="rounded-md border border-border bg-code-bg px-2.5 py-1 font-mono text-xs text-text-primary transition-colors hover:border-blue-400/30 hover:text-blue-400">
                      {evt}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Only metadata — no job payloads, no Redis keys, no credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-b from-surface/30 via-bg to-surface/30">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 md:py-20">
          {/* Corner decorative accent */}
          <div className="pointer-events-none absolute -left-20 top-[-40px] h-60 w-60 rounded-full bg-accent/[0.04] animate-float blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-[-40px] h-60 w-60 rounded-full bg-accent/[0.02] animate-float-delayed blur-3xl" />
          <div className="mb-10 max-w-2xl text-center animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Architecture</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">How It Works</h2>
            <p className="mt-3 text-text-muted">
              A lightweight agent inside your worker process streams job metadata to QCanary over HTTPS.
              Redis never leaves your network.
            </p>
          </div>

          <div className="mb-12 w-full max-w-5xl animate-fade-in-up-delay-1">
            <ArchitectureDiagram />
          </div>

          {/* Architecture Flow — Timeline with connecting dots */}
          <div className="relative flex w-full flex-col gap-0 md:flex-row md:items-start">
            {/* Desktop connecting line */}
            <div className="absolute left-[20px] top-0 hidden h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:left-1/2 md:top-auto md:h-px md:w-3/4 md:-translate-x-1/2 md:bg-gradient-to-r md:from-accent/30 md:via-accent/15 md:to-transparent" />

            {/* Mobile connecting line */}
            <div className="absolute left-[20px] top-0 h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:hidden" />

            {[
              {
                step: "01",
                title: "Install @qcanary/agent",
                desc: "Add the package to your worker process. Initialize with your API key and BullMQ queues. No Redis URL needed.",
                code: "npm install @qcanary/agent",
                icon: "📦",
              },
              {
                step: "02",
                title: "Agent attaches via QueueEvents",
                desc: "Subscribes to BullMQ's built-in lifecycle events as a local subscriber inside your process. Zero network changes.",
                code: "new QueueMonitor({ apiKey, queues })",
                icon: "🔗",
              },
              {
                step: "03",
                title: "Dashboards & Alerts live",
                desc: "Track failures, trends, and alerts in real time. Your Redis stays private — always.",
                code: "✓ Agent connected · streaming events",
                icon: "📊",
              },
            ].map((item, i) => (
              <div key={item.step} className={`relative flex-1 pb-8 md:pb-0 md:px-3 ${
                i === 0 ? 'animate-fade-in-up' : i === 1 ? 'animate-fade-in-up-delay-1' : 'animate-fade-in-up-delay-2'
              }`}>
                {/* Timeline dot + line container */}
                <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                  {/* Dot */}
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent/30 bg-gradient-to-br from-bg to-surface shadow-lg shadow-accent/5 transition-all group-hover:border-accent/60">
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1 md:mt-4">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.desc}</p>
                    {/* Code snippet */}
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-gradient-to-r from-code-bg to-surface/30 px-3 py-1.5 font-mono text-xs text-accent ring-1 ring-accent/10">
                      <span className="text-text-muted">$</span>
                      {item.code}
                    </div>
                  </div>
                </div>
                {/* Arrow between steps on desktop */}
                {i < 2 && (
                  <div className="absolute right-0 top-5 hidden md:block">
                    <svg className="h-4 w-4 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Community Metrics ─────────────────── */}
      <section className="border-y border-border bg-gradient-to-t from-surface/30 to-bg">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 max-w-2xl animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Community</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Open source and community driven</h2>
            <p className="mt-3 text-text-muted">
              The agent package is MIT-licensed and available on GitHub and npm.
              Built in the open with contributions from the BullMQ ecosystem.
            </p>
          </div>

          {/* Key metrics with Shields.io-style badges */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* GitHub Stars */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Open Source</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-muted">MIT-licensed</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      on GitHub
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available on npm */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v4.001H12V15H9.999v-.002h-1.33v-.001h-1v.001h-1v.001h-.002v-1.334h1.335v-2.667H9.333V14h1.333v-.002h.002v-4h1.334v4.002zm6.667 0v1.336H16v-5.335h-2.667v-1.33h8v1.33h-2.666v5.335h-1.334v-5.335h-1.333v5.335h-1.334v-6.666H20l.001 5.335h-1.332v1.33h-1v.001h-1.334v-1.334H20V10.668h-2.667z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">Available on npm</div>
                  <div className="text-xs text-text-muted">@qcanary/agent package</div>
                </div>
              </div>
            </div>

            {/* MIT Licensed */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">MIT Licensed</div>
                  <div className="text-xs text-text-muted">Free to use and modify</div>
                </div>
              </div>
            </div>

            {/* BullMQ Native */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">BullMQ Native</div>
                  <div className="text-xs text-text-muted">Built on QueueEvents API</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live stats row — Shields.io badges fetch from GitHub/npm APIs at render time */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </div>
              <div>
                <Image src="https://img.shields.io/github/stars/qcanary/qcanary?style=flat&labelColor=%23111111&color=%2322C55E&label=" alt="GitHub Stars" width={80} height={20} className="h-5 w-auto" />
                <div className="text-xs text-text-muted">GitHub Stars</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v4.001H12V15H9.999v-.002h-1.33v-.001h-1v.001h-1v.001h-.002v-1.334h1.335v-2.667H9.333V14h1.333v-.002h.002v-4h1.334v4.002zm6.667 0v1.336H16v-5.335h-2.667v-1.33h8v1.33h-2.666v5.335h-1.334v-5.335h-1.333v5.335h-1.334v-6.666H20l.001 5.335h-1.332v1.33h-1v.001h-1.334v-1.334H20V10.668h-2.667z" /></svg>
              </div>
              <div>
                <Image src="https://img.shields.io/npm/dt/@qcanary/agent?style=flat&labelColor=%23111111&color=%23EF4444&label=" alt="npm Downloads" width={80} height={20} className="h-5 w-auto" />
                <div className="text-xs text-text-muted">Weekly npm Downloads</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/40 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <div className="text-lg font-semibold">3-line</div>
                <div className="text-xs text-text-muted">Setup · 10 minutes</div>
              </div>
            </div>
          </div>

          {/* Technology stack / integrations */}
          <div className="animate-fade-in-up-delay-1">
            <div className="mb-4 text-xs font-medium uppercase tracking-wider text-text-muted">Built for the BullMQ ecosystem</div>
            <div className="flex flex-wrap gap-2">
              {["BullMQ", "Node.js", "Redis", "TypeScript", "Docker", "Express", "npm", "pnpm", "Supabase", "Vercel"].map((tech) => (
                <span key={tech} className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-accent/30 hover:text-accent">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Dashboard</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">See it in action</h2>
          <p className="mt-3 text-text-muted">
            Monitor queue health, inspect failures, and track trends from one dashboard.
          </p>
        </div>
        <div className="screenshot-glow relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface/80 to-code-bg shadow-lg shadow-accent/5">
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

      <section className="section-glow overflow-hidden border-y border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 max-w-2xl animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Features</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything you need to monitor queues</h2>
            <p className="mt-3 text-text-muted">
              Built for developers who already run BullMQ and need reliable operations visibility.
            </p>
          </div>

          {/* Feature 1 & 2 — side-by-side code-style cards */}
          <div className="mb-6 grid gap-5 md:grid-cols-2">
            <div className="card-hover group animate-fade-in-up rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-6">
              <div className="icon-glow mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Real-time Dashboards</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Monitor queue status, throughput, failures, job history, and trends as events arrive.</p>
              {/* Preview tags */}
              <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <span className="rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-accent ring-1 ring-accent/20 transition-all group-hover:ring-accent/40">completed</span>
                <span className="rounded-md bg-red-500/10 px-2.5 py-0.5 font-mono text-red-400 ring-1 ring-red-500/20">failed</span>
                <span className="text-text-muted">+3 more</span>
              </div>
              {/* Hover detail — revealed on card hover */}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Throughput charts</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Failure trends</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Job history</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Queue health</span>
                </div>
              </div>
            </div>
            <div className="card-hover group animate-fade-in-up-delay-1 rounded-xl border border-border bg-gradient-to-br from-surface/60 to-code-bg p-6">
              <div className="icon-glow mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Alert Rules</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">Trigger Slack, email, or webhook notifications for failure rate, inactivity, queue depth, and job duration.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <span className="rounded-md bg-accent/10 px-2.5 py-0.5 font-mono text-accent ring-1 ring-accent/20 transition-all group-hover:ring-accent/40">Slack</span>
                <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 font-mono text-blue-400 ring-1 ring-blue-500/20">Email</span>
                <span className="rounded-md bg-purple-500/10 px-2.5 py-0.5 font-mono text-purple-400 ring-1 ring-purple-500/20">Webhook</span>
              </div>
              {/* Hover detail — revealed on card hover */}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Failure rate</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Queue stall</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Job duration</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>Auto-resolve</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 — full-width highlight card */}
          <div className="card-hover group animate-fade-in-up-delay-2 mb-6 rounded-xl border border-accent/20 bg-gradient-to-r from-accent/5 via-surface/30 to-code-bg p-6 md:p-8">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
              <div className="icon-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary">Secure by Design</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">QCanary never asks for Redis credentials and does not require inbound firewall changes. Your Redis stays behind your VPC — always.</p>
              </div>
              <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent ring-1 ring-accent/20">Core feature</span>
            </div>
          </div>

          {/* Feature 4, 5, 6 — compact grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-hover group animate-fade-in-up rounded-xl border border-border bg-surface/30 p-5">
              <div className="icon-glow mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Multi-tenancy</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Keep organizations, projects, environments, queues, and API keys cleanly separated.</p>
            </div>
            <div className="card-hover group animate-fade-in-up-delay-1 rounded-xl border border-border bg-surface/30 p-5">
              <div className="icon-glow mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Auto-Resolution</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Resolve incidents automatically when the alert condition recovers — no manual cleanup.</p>
            </div>
            <div className="card-hover group animate-fade-in-up-delay-2 rounded-xl border border-border bg-surface/30 p-5">
              <div className="icon-glow mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Usage Limits</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Track project and daily event usage against your plan before limits surprise your team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 max-w-2xl animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Testimonials</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Loved by engineering teams</h2>
            <p className="mt-3 text-text-muted">
              From early-stage startups to production deployments, teams trust QCanary for queue monitoring.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                quote: "We were using Bull Board and manually checking Redis. QCanary caught a stalled queue before our customers noticed. The zero-trust setup meant our security team approved it in hours, not weeks.",
                name: "Ravi Patel",
                title: "Infrastructure Engineer at Laylo",
              },
              {
                quote: "Setting up alerting for worker failures used to require custom scripts and a separate Redis instance. QCanary took 10 minutes to configure. The Slack alerts alone saved us from two production incidents.",
                name: "Emily Chen",
                title: "Senior Backend Engineer at TidyHQ",
              },
              {
                quote: "The fact that @qcanary/agent runs inside our existing worker process and uses QueueEvents directly is brilliant. No VPC peering, no iptables changes, no security review bottleneck.",
                name: "Marcus Johansson",
                title: "CTO at Sync Labs",
              },
              {
                quote: "We evaluated three queue monitoring tools. QCanary was the only one that didn't ask for our Redis URL. That single decision point made it the winner for our SOC 2 compliance.",
                name: "Sarah Park",
                title: "DevOps Lead at Capiter",
              },
            ].map((t, idx) => (
              <div key={t.name} className={`card-hover group flex flex-col rounded-xl border border-border bg-surface/30 p-6 ${
                idx === 0 ? 'animate-fade-in-up' : idx === 1 ? 'animate-fade-in-up-delay-1' : idx === 2 ? 'animate-fade-in-up-delay-2' : 'animate-fade-in-up-delay-3'
              }`}>
                {/* Stars */}
                <div className="mb-3 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <div className="mb-4 text-sm leading-relaxed text-text-primary">
                  <span className="text-accent/30">{"\u201c"}</span>
                  {t.quote}
                  <span className="text-accent/30">{"\u201d"}</span>
                </div>
                {/* Author */}
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-xs font-medium text-accent ring-1 ring-accent/20">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{t.name}</div>
                    <div className="text-xs text-text-muted">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-br from-bg via-surface/20 to-code-bg">
        <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          {/* Dot grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Pricing</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Simple, usage-based pricing</h2>
            <p className="mt-3 text-text-muted">
              Start free and upgrade when alerting and deeper history become essential.
            </p>
          </div>

          {/* Pricing — Featured starter + compact free/pro */}
          <div className="mb-10">
            {/* Starter — full-width, highlighted */}
            <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg p-8 md:p-10">
              {/* Decorative corner gradient */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-semibold">Starter</h3>
                      <Badge variant="success">Most Popular</Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">For growing teams that need alerting</p>
                  </div>
                  <div className="text-right">
                    <div>
                      <span className="text-4xl font-bold">$9</span>
                      <span className="text-text-muted">/mo</span>
                    </div>
                    <div className="mt-2">
                      <Link href="/sign-up">
                        <Button size="sm">Start Free Trial</Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      3 projects, 10 queues
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      30-day event history
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      100,000 events / day
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Slack + Email alerts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Free + Pro — compact side-by-side */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative rounded-xl border border-border bg-surface/30 p-6">
                <h3 className="text-lg font-semibold">Free</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold">$0</span>
                  <span className="text-text-muted">/mo</span>
                </div>
                <p className="mt-0.5 text-xs text-text-muted">Personal projects</p>
                <ul className="mt-4 space-y-1.5">
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    1 project, 1 queue
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    24h history, 1K events/day
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Send test events
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="text-text-muted">No alerts</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="mt-5 block">
                  <Button size="sm" className="w-full" variant="secondary">Get Started</Button>
                </Link>
              </div>
              <div className="relative rounded-xl border border-border bg-surface/30 p-6">
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold">$24</span>
                  <span className="text-text-muted">/mo</span>
                </div>
                <p className="mt-0.5 text-xs text-text-muted">Production at scale</p>
                <ul className="mt-4 space-y-1.5">
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Unlimited projects &amp; queues
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    90-day history, unlimited events
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Webhook alerts
                  </li>
                </ul>
                <Link href="/sign-up" className="mt-5 block">
                  <Button size="sm" className="w-full" variant="secondary">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature comparison table - collapsible */}
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface/30 px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface/50 hover:border-accent/30 transition-colors">
              <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Full feature comparison
            </summary>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-code-bg text-left text-sm">
                      <th className="px-4 py-3 font-medium text-text-primary">Feature</th>
                      <th className="px-4 py-3 font-medium text-text-primary">Free</th>
                      <th className="px-4 py-3 font-medium text-text-primary">Starter</th>
                      <th className="px-4 py-3 font-medium text-text-primary">Pro</th>
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
            </div>
          </details>

          <p className="mt-4 text-sm text-text-muted">
            Free plan intentionally includes zero alerting to keep advanced reliability tooling
            available as teams scale.
          </p>
        </div>
      </section>

      {/* ── Latest from the Blog ───────────────────────────────── */}
      <LatestBlogSection posts={posts} />

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
          <div className="mb-10 max-w-2xl animate-fade-in-up">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">FAQ</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-3 text-text-muted">
              Quick answers to the most common questions about QCanary.
            </p>
          </div>
          <div className="space-y-3 animate-fade-in-up-delay-1">
            {[
              {
                q: "Do I need to share Redis credentials?",
                a: "No. The Qcanary agent listens to BullMQ events inside your app and sends only lightweight metadata to the API. Your Redis URL stays in your environment and is never shared.",
              },
              {
                q: "How long does setup take?",
                a: "Most teams install and send first events in under 10 minutes. It's a 3-line setup: install the package, initialize with your API key, and pass your BullMQ queues.",
              },
              {
                q: "Which alerts are available?",
                a: "Starter and Pro plans include Slack and email alerts. Pro adds webhook alerts for PagerDuty, OpsGenie, or custom integrations. Free plan intentionally excludes alerts.",
              },
              {
                q: "Can I view failed job details?",
                a: "Yes. Every plan includes job-level detail and stack traces for failed jobs. You can inspect the full error message, the number of attempts, and the job metadata from the dashboard.",
              },
              {
                q: "Is there a free plan?",
                a: "Yes. The Free plan includes 1 project, 1 queue, 24-hour event history, and 1,000 events per day. No credit card required. Perfect for personal projects and evaluation.",
              },
            ].map((faq) => (
              <details key={faq.q} className="group cursor-pointer rounded-xl border border-border bg-surface/30 transition-all hover:border-accent/30 open:border-accent/30 open:bg-surface/40">
                <summary className="flex items-center justify-between px-5 py-4 text-sm font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <div className="relative h-5 w-5 shrink-0 ml-4">
                    <svg className="absolute inset-0 h-5 w-5 text-text-muted transition-all group-open:rotate-45 group-open:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                </summary>
                <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-text-muted">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FAQPage JSON-LD Structured Data */}
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do I need to share Redis credentials?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. The Qcanary agent listens to BullMQ events inside your app and sends only lightweight metadata to the API.",
                },
              },
              {
                "@type": "Question",
                name: "How long does setup take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most teams install and send first events in under 10 minutes with a 3-line setup.",
                },
              },
              {
                "@type": "Question",
                name: "Which alerts are available?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Starter and Pro include Slack and email alerts. Pro adds webhook alerts.",
                },
              },
              {
                "@type": "Question",
                name: "Can I view failed job details?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Every plan includes job-level detail and stack traces for failed jobs.",
                },
              },
            ],
          }),
        }}
      />

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
          <div className="animate-fade-in-up">
            <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-border-glow">
              Get started in 3 lines
            </Badge>
          </div>
          <h2 className="animate-fade-in-up-delay-1 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Queue monitoring, <span className="text-gradient">reimagined.</span>
          </h2>
          <p className="animate-fade-in-up-delay-2 mt-4 max-w-xl text-base text-text-muted">
            No Redis credentials required. No firewall changes. Just install, connect, and monitor.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="group gap-2">
                Start Free
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="group gap-2">
                Read the docs
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </Button>
            </Link>
          </div>
          {/* Bottom trust line */}
          <p className="animate-fade-in-up-delay-4 mt-8 text-xs text-text-muted">
            No credit card required · 3-line setup · 10 minutes to first event
          </p>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <BrandLockup href="/" size="sm" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
                Monitor BullMQ queues without sharing Redis credentials. Zero-trust monitoring for production teams.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link href="https://github.com/qcanary" className="text-text-muted hover:text-text-primary transition-colors" aria-label="GitHub">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                </Link>
                <Link href="https://x.com/qcanary" className="text-text-muted hover:text-text-primary transition-colors" aria-label="X (Twitter)">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </Link>
              </div>
            </div>
            {/* Product */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Product</div>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/features" className="text-sm text-text-muted hover:text-text-primary transition-colors">Features</Link>
                <Link href="/pricing" className="text-sm text-text-muted hover:text-text-primary transition-colors">Pricing</Link>
                <Link href="/docs" className="text-sm text-text-muted hover:text-text-primary transition-colors">Documentation</Link>
                <Link href="/compare" className="text-sm text-text-muted hover:text-text-primary transition-colors">vs Bull-Board</Link>
              </div>
            </div>
            {/* Company */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">Company</div>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/blog" className="text-sm text-text-muted hover:text-text-primary transition-colors">Blog</Link>
                <Link href="/about" className="text-sm text-text-muted hover:text-text-primary transition-colors">About</Link>
                <Link href="/contact" className="text-sm text-text-muted hover:text-text-primary transition-colors">Contact</Link>
                <Link href="/sign-up" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">Sign Up →</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Qcanary. MIT-licensed agent. Built for the BullMQ ecosystem.
          </div>
        </div>
      </footer>
    </main>
  );
}
