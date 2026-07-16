import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SecuritySection } from "@/components/landing/SecuritySection";

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
  solo: string;
  team: string;
  business: string;
  enterprise: string;
}> = [
  { feature: "Projects", free: "1", solo: "1", team: "3", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Queues per project", free: "1", solo: "5", team: "10", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Event history", free: "24 hours", solo: "14 days", team: "30 days", business: "90 days", enterprise: "Unlimited" },
  { feature: "Events per day", free: "5,000", solo: "25,000", team: "100,000", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Slack alerts", free: "—", solo: "✓", team: "✓", business: "✓", enterprise: "✓" },
  { feature: "Email alerts", free: "1 rule", solo: "2 rules", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Send test events", free: "✓", solo: "✓", team: "✓", business: "✓", enterprise: "✓" },
  { feature: "Webhook alerts", free: "—", solo: "—", team: "✓", business: "✓", enterprise: "✓" },
  { feature: "Team members", free: "1", solo: "1", team: "5", business: "20", enterprise: "Unlimited" },
  { feature: "SSO/SAML", free: "—", solo: "—", team: "—", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "PagerDuty/OpsGenie", free: "—", solo: "—", team: "—", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "Self-hosted", free: "—", solo: "—", team: "—", business: "—", enterprise: "✓" },
  { feature: "Custom SLA", free: "—", solo: "—", team: "—", business: "—", enterprise: "✓" },
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

export default async function MarketingPage() {
  const posts = await getAllBlogPosts();

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />

      {/* Mobile-responsive hero: stacking, overflow, padding */}
      <div className="overflow-x-hidden">
        <HeroSection />
      </div>

      <ProblemSection />
      <SolutionSection />
      <ComparisonSection />
      <SocialProofSection />

      {/* ── Dashboard Preview ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Dashboard</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">See it in action</h2>
          <p className="mt-3 text-text-muted">
            Monitor queue health, inspect failures, and track trends from one dashboard.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface/80 shadow-card">            <Image
              src="/screenshots/dashboard-overview.png"
              alt="Qcanary dashboard showing queue overview, job history, and health metrics"
              width={1918}
              height={1058}
              loading="lazy"
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
        </div>
      </section>

      <FeaturesSection />
      <SecuritySection />

      {/* ── Why I Built This ──────────────────────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 animate-fade-in-up">
              <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Why I Built This</Badge>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">I got tired of security teams saying no.</h2>
            </div>
            <div className="animate-fade-in-up-delay-1 space-y-4 text-base leading-relaxed text-text-primary md:text-lg">
              <p>
                Every queue monitoring tool I wanted to use required handing over our Redis URL.
                That&rsquo;s full database access. My security team flagged it every time. Bull Board
                was great for local development, but production needed something that didn&rsquo;t
                require a third party to touch our infrastructure.
              </p>
              <p>
                So I built QCanary. The agent runs inside your own worker process. Your Redis
                credentials never leave your network. We only see metadata — never your job payloads,
                never your data, never your keys.
              </p>
              <p>
                It&rsquo;s not revolutionary. It&rsquo;s just the bare minimum that security-conscious
                teams should expect from infrastructure monitoring.
              </p>
            </div>
            <div className="animate-fade-in-up-delay-2 mt-6 flex items-center gap-4">
              <p className="text-sm text-text-muted italic">
                &mdash; the founder, building QCanary in public
              </p>
            </div>
            <div className="animate-fade-in-up-delay-3 flex flex-wrap items-center gap-3">
              <Link href="/trust">
                <Button variant="secondary" className="gap-2 group">
                  Read our security architecture
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Button>
              </Link>
              <Link href="/feedback">
                <Button variant="ghost" className="gap-2 group">
                  Want to help us improve? Get free Pro access
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-br from-bg via-surface/20 to-code-bg">
        <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-20">

          <div className="mb-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Pricing</Badge>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Simple, usage-based pricing</h2>
            <p className="mt-3 text-text-muted">
              Start free and upgrade when alerting and deeper history become essential.
            </p>
          </div>

          {/* Pricing — 5-tier grid: Free, Solo ($15), Team ($39), Business ($149), Enterprise */}
          <div className="mb-10 grid gap-4 md:grid-cols-5">
            {/* Free */}
            <div className="relative rounded-xl border border-border bg-surface/30 p-5">
              <h3 className="text-base font-semibold">Free</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold">$0</span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">Personal projects and evaluation</p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>1 project, 1 queue</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>5,000 events/day</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>24-hour history</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Email alerts (1 rule)</li>
              </ul>
              <Link href="/sign-up" className="mt-5 block"><Button size="sm" className="w-full" variant="secondary">Get Started Free →</Button></Link>
            </div>

            {/* Solo */}
            <div className="relative rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.03] via-surface/30 to-bg p-5">
              <Badge variant="outline" className="mb-2 border-accent/20 text-accent bg-accent/[0.05]">For Indie Hackers</Badge>
              <h3 className="text-base font-semibold">Solo</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold">$15</span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">For solo founders and side projects</p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>1 project, 5 queues</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>25,000 events/day</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>14-day history</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Slack + Email alerts (2 rules)</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Basic support (48h)</li>
              </ul>
              <Link href="/sign-up" className="mt-5 block"><Button size="sm" className="w-full">Start Solo →</Button></Link>
            </div>

            {/* Team — featured */}
            <div className="relative -mx-2 scale-[1.04] z-10 rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg p-6 shadow-lg shadow-accent/10">
              <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
              <Badge variant="success" className="mb-2">Most Popular</Badge>
              <h3 className="text-base font-semibold">Team</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold">$39</span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">For production teams needing reliable monitoring</p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>3 projects, 10 queues/project</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>100,000 events/day</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>30-day history</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>5 team members</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Slack + Email + Webhook alerts</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>API access + Auto-resolution</li>
              </ul>
              <Link href="/sign-up" className="mt-5 block"><Button size="sm" className="w-full">Start Team Trial →</Button></Link>
              <p className="mt-2 text-center text-[10px] text-text-muted/60">No credit card required</p>
            </div>

            {/* Business */}
            <div className="relative rounded-xl border border-border bg-surface/30 p-5">
              <Badge variant="outline" className="mb-2 border-accent/20 text-accent bg-accent/[0.05]">For Organizations</Badge>
              <h3 className="text-base font-semibold">Business</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold">$149</span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">For teams with compliance and scale needs</p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Unlimited projects &amp; queues</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Unlimited events</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>90-day history</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>20 team members</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SSO + RBAC + PagerDuty/OpsGenie</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Priority support (24h, Slack)</li>
              </ul>
              <Link href="/sign-up" className="mt-5 block"><Button size="sm" className="w-full" variant="secondary">Start Business Trial →</Button></Link>
            </div>

            {/* Enterprise */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-surface/20 via-surface/10 to-code-bg/30 p-5">
              <Badge variant="outline" className="mb-2 border-accent/20 text-accent bg-accent/[0.05]">Self-Hosted</Badge>
              <h3 className="text-base font-semibold">Enterprise</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold">Custom</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">For regulated industries and full control</p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Everything in Business</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Self-hosted deployment</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Dedicated support + custom SLA</li>
                <li className="flex items-center gap-2 text-xs"><svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SOC 2 Type II + annual audits</li>
              </ul>
              <Link href="/enterprise" className="mt-5 block"><Button size="sm" className="w-full" variant="secondary">Contact Sales →</Button></Link>
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
                      <th className="px-4 py-3 font-medium text-text-primary">Solo</th>
                      <th className="px-4 py-3 font-medium text-accent">Team</th>
                      <th className="px-4 py-3 font-medium text-text-primary">Business</th>
                      <th className="px-4 py-3 font-medium text-text-primary">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((row) => (
                      <tr key={row.feature} className="border-b border-border/70 text-sm">
                        <td className="px-4 py-3 text-text-primary">{row.feature}</td>
                        <td className="px-4 py-3 text-text-muted">{row.free}</td>
                        <td className="px-4 py-3 text-text-muted">{row.solo}</td>
                        <td className="px-4 py-3 text-text-muted">{row.team}</td>
                        <td className="px-4 py-3 text-text-muted">{row.business}</td>
                        <td className="px-4 py-3 text-text-muted">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <p className="mt-4 text-sm text-text-muted">
            Free plan includes email alerting so you can catch failures from day one.
            Upgrade to Solo for Slack alerts and Team for full advanced rules.
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
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Frequently Asked Questions</h2>
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
                a: "Solo and Team plans include Slack and email alerts. Team and Business add webhook alerts for PagerDuty, OpsGenie, or custom integrations. Free plan includes email alerts (1 rule) to get you started.",
              },
              {
                q: "Can I view failed job details?",
                a: "Yes. Every plan includes job-level detail and stack traces for failed jobs. You can inspect the full error message, the number of attempts, and the job metadata from the dashboard.",
              },
              {
                q: "Is there a free plan?",
                a: "Yes. The Free plan includes 1 project, 1 queue, 24-hour event history, and 5,000 events per day. No credit card required. Perfect for personal projects and evaluation.",
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
                  text: "Solo and Team include Slack and email alerts. Team and Business add webhook alerts.",
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

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
          <div className="animate-fade-in-up">
            <Badge variant="outline" className="mb-6 border-accent/40 text-accent">
              Get started in 3 lines
            </Badge>
          </div>
          <h2 className="animate-fade-in-up-delay-1 text-[clamp(1.75rem,5vw,3.75rem)] font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Queue monitoring,            <span className="text-highlight">reimagined.</span>
          </h2>
          <p className="animate-fade-in-up-delay-2 mt-4 max-w-xl text-base text-text-muted">
            Monitor every queue. Catch every failure. Install in 3 lines, go live in 10 minutes.
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

      <MarketingFooter />
    </main>
  );
}
