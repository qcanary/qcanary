import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, upgrade when you need alerts and history. Product Hunt launch special: 20% off Pro for life with code PH20.",
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: "Qcanary Pricing — Monitor BullMQ Without Exposing Redis",
    description:
      "Start free, upgrade when you need alerts. Product Hunt special: 20% off Pro for life.",
  },
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
  { feature: "Email alerts", free: "Email only", starter: "Yes", pro: "Yes" },
  { feature: "Send test events", free: "Yes", starter: "Yes", pro: "Yes" },
  { feature: "Webhook alerts", free: "No", starter: "No", pro: "Yes" },
  { feature: "Team members", free: "1", starter: "3", pro: "10" },
  { feature: "Job detail + stack trace", free: "Yes", starter: "Yes", pro: "Yes" },
  { feature: "Historical charts", free: "No", starter: "Yes", pro: "Yes" },
];

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      {/* Navigation */}
      <MarketingNav showCompare={false} showBlog={false} />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-surface/10 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 text-center">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">
            Pricing
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Simple, usage-based pricing
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-text-muted">
            Start free and upgrade when alerting and deeper history become essential.
            No credit card required.
          </p>

          {/* Product Hunt Launch Special Banner */}
          <div className="mt-8 mx-auto max-w-lg rounded-2xl border-2 border-orange-400/30 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-orange-300">
                  Product Hunt Launch Special
                </div>
                <div className="text-xs text-orange-400/70">
                  Limited time offer for our PH community
                </div>
              </div>
            </div>
            <p className="text-sm text-text-primary mb-3">
              <span className="font-bold text-accent">20% off Pro for life</span> — use code{" "}
              <code className="rounded-md bg-code-bg px-2 py-0.5 font-mono text-sm text-accent ring-1 ring-accent/20">
                PH20
              </code>{" "}
              at checkout.
            </p>
            <Link href="/sign-up">
              <Button size="sm" className="gap-2">
                Claim Discount
                <span className="text-xs opacity-70">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="border-b border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          {/* Starter — highlighted */}
          <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg p-8 md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">Starter</h2>
                    <Badge variant="success">Most Popular</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">For growing teams that need alerting</p>
                </div>
                <div className="text-right">
                  <div>
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-text-muted">/mo</span>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    or <span className="text-accent font-medium">$92/yr</span> (save 15%)
                  </div>
                  <div className="mt-3">
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

          {/* Free + Pro side-by-side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative rounded-xl border border-border bg-surface/30 p-6">
              <h2 className="text-lg font-semibold">Free</h2>
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
                </li>                  <li className="flex items-center gap-2 text-xs">
                    <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Email alerts (1 rule)
                  </li>
              </ul>
              <Link href="/sign-up" className="mt-5 block">
                <Button size="sm" className="w-full" variant="secondary">Get Started</Button>
              </Link>
            </div>

            {/* Pro with PH discount callout */}
            <div className="relative rounded-xl border-2 border-orange-400/20 bg-gradient-to-br from-orange-500/5 via-surface/30 to-code-bg p-6">
              <div className="absolute -top-2.5 right-4">
                <Badge variant="outline" className="border-orange-400/40 text-orange-300 bg-orange-500/10 text-[10px]">
                  PH20 = 20% off
                </Badge>
              </div>
              <h2 className="text-lg font-semibold">Pro</h2>
              <div className="mt-1">
                <span className="text-2xl font-bold">$24</span>
                <span className="text-text-muted">/mo</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">Production at scale</p>
              <div className="mt-2 text-xs text-accent">
                Use code <code className="rounded bg-code-bg px-1 font-mono ring-1 ring-accent/20">PH20</code> → <span className="font-semibold">$19.20/mo for life</span>
              </div>
              <ul className="mt-3 space-y-1.5">
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
                  Webhook alerts (PagerDuty, etc.)
                </li>
                <li className="flex items-center gap-2 text-xs">
                  <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited alert rules
                </li>
              </ul>
              <Link href="/sign-up" className="mt-5 block">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Feature Comparison Table */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Full feature comparison</h2>
          <p className="text-sm text-text-muted mb-8">See exactly what you get with each plan.</p>

          <div className="overflow-hidden rounded-xl border border-border">
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
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-text-muted mb-8">Quick answers about Qcanary pricing and plans.</p>
          <div className="space-y-3">
            {[
              {
                q: "Do I need to share Redis credentials?",
                a: "No. The Qcanary agent listens to BullMQ events inside your app and sends only lightweight metadata to the API. Your Redis URL stays in your environment.",
              },
              {
                q: "How does the PH discount work?",
                a: "Use code PH20 at checkout to get 20% off Pro for life. This is our Product Hunt launch special — it's not available anywhere else.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade or downgrade at any time. If you upgrade, you get immediate access to the new features. If you downgrade, the changes apply at the next billing cycle.",
              },
              {
                q: "Is there a free plan?",
                a: "Yes. The Free plan includes 1 project, 1 queue, 24-hour event history, and 1,000 events per day. No credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards and debit cards. Payments are processed securely through Dodo Payments.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel your subscription at any time from your settings page. Your access continues until the end of the billing period.",
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

      {/* CTA */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Start monitoring your queues <span className="text-gradient">in 3 lines</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-text-muted">
            Start with a single queue. Add alerting when you need it. Scale to production without switching tools.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="group gap-2">
                Start Free
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="group gap-2">
                Read the docs
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-xs text-text-muted">
            No credit card required · 3-line setup · 10 minutes to first event
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-text-muted">
          <Link href="/" className="text-accent hover:underline">← Back to home</Link>
          <span className="mx-3">·</span>
          &copy; {new Date().getFullYear()} Qcanary. MIT-licensed agent.
        </div>
      </footer>
    </main>
  );
}
