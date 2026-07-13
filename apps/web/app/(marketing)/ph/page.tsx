import Link from "next/link";
import type { Metadata } from "next";
import { BrandLockup } from "@/components/Brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CouponCapture } from "./CouponCapture";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Product Hunt Launch",
  description:
    "Monitor BullMQ queues without exposing Redis credentials. Product Hunt special: 20% off Pro for life with code PH20.",
  alternates: {
    canonical: `${siteUrl}/ph`,
  },
  openGraph: {
    title: "Qcanary — Monitor BullMQ Without Exposing Redis",
    description:
      "Zero-trust BullMQ monitoring. No Redis credentials needed. Product Hunt special: 20% off Pro for life.",
    url: `${siteUrl}/ph`,
  },
};

export default function ProductHuntPage() {
  return (
    <>
      <CouponCapture />
      <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <BrandLockup href="/" size="md" />
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <Link href="/pricing?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch" className="text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Pricing
            </Link>
            <Link href="/docs?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch" className="hidden sm:inline text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Docs
            </Link>
            <Link href="/sign-in?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch" className="text-sm text-text-muted transition-colors hover:text-text-primary whitespace-nowrap">
              Sign In
            </Link>
            <Link href="/sign-up?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-surface/10 via-bg to-surface/5">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          {/* Product Hunt Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5">
            <span className="text-sm">🚀</span>
            <span className="text-sm font-medium text-orange-300">Now Live on Product Hunt</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl max-w-4xl mx-auto">
            Monitor BullMQ Queues Without{" "}
            <span className="text-gradient">Sharing Redis Credentials</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-text-muted">
            A lightweight agent hooks into BullMQ&apos;s QueueEvents — no Redis URL ever leaves your worker process.
            Get real-time dashboards, alerts, and 30-day history in 3 lines of code.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch&coupon=PH20">
              <Button size="lg" className="group gap-2 text-base h-12 px-8">
                Start Free — No CC Required
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="/pricing?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch">
              <Button variant="secondary" size="lg" className="h-12 px-8">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-4 text-xs text-text-muted">
            3-line setup · 10 minutes to first event · Agent is MIT open-source
          </p>
        </div>
      </section>

      {/* PH Special Offer Banner */}
      <section className="border-b border-border bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-orange-500/5">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          <div className="mx-auto max-w-3xl rounded-2xl border-2 border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-surface/20 to-orange-500/5 p-8 md:p-10 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl">🎉</span>
              <Badge variant="outline" className="border-orange-400/40 text-orange-300">
                Product Hunt Exclusive
              </Badge>
            </div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              20% Off <span className="text-accent">Pro</span> for Life
            </h2>
            <p className="mt-2 max-w-lg mx-auto text-text-muted text-sm">
              As a thank you to the Product Hunt community, use code{" "}
              <code className="rounded-md bg-code-bg px-2.5 py-1 font-mono text-accent ring-1 ring-accent/20">
                PH20
              </code>{" "}
              at checkout to lock in 20% off Pro forever. Unlimited projects, queues, and webhook alerts.
            </p>
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="text-lg font-semibold">
                <span className="text-text-muted line-through">$24/mo</span>
                <span className="ml-3 text-accent">$19.20/mo</span>
                <span className="text-text-muted text-sm ml-1">with PH20</span>
              </div>
              <Link href="/sign-up?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch&coupon=PH20">
                <Button size="sm" className="gap-2 mt-2">
                  Claim 20% Off →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { value: "No Redis", label: "credentials needed", icon: "🔒" },
              { value: "3 Lines", label: "of code to install", icon: "⚡" },
              { value: "MIT", label: "open-source agent", icon: "📦" },
            ].map((stat) => (
              <div key={stat.label} className="text-center rounded-xl border border-border bg-surface/30 p-6">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How It Works</h2>
            <p className="mt-3 max-w-lg mx-auto text-text-muted text-sm">
              The Qcanary agent attaches to BullMQ inside your process. No network changes needed.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Install",
                desc: "npm install @qcanary/agent alongside your existing BullMQ worker.",
                icon: "📦",
              },
              {
                step: "02",
                title: "Connect",
                desc: "Initialize with your API key and queue names. The agent hooks into QueueEvents automatically.",
                icon: "🔗",
              },
              {
                step: "03",
                title: "Monitor",
                desc: "View live dashboards, set up Slack/email alerts, and track 30-day trends.",
                icon: "📊",
              },
            ].map((item) => (
              <div key={item.step} className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  <span className="text-xs font-mono text-accent">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What teams are saying</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                quote: "QCanary took 10 minutes to configure. The Slack alerts alone saved us from two production incidents.",
                name: "Emily Chen",
                title: "Senior Backend Engineer at TidyHQ",
              },
              {
                quote: "We evaluated three queue monitoring tools. QCanary was the only one that didn't ask for our Redis URL.",
                name: "Sarah Park",
                title: "DevOps Lead at Capiter",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-surface/30 p-6">
                <div className="mb-2 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-text-primary mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-xs font-medium text-accent">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{t.name}</div>
                    <div className="text-xs text-text-muted">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Start monitoring in <span className="text-gradient">3 lines of code</span>
          </h2>
          <p className="mt-4 max-w-xl text-base text-text-muted">
            No Redis credentials. No firewall changes. Just install, connect, and monitor.
            Don&apos;t forget code <code className="rounded-md bg-code-bg px-2 py-0.5 font-mono text-accent ring-1 ring-accent/20">PH20</code> for 20% off Pro.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch&coupon=PH20">
              <Button size="lg" className="group gap-2 text-base h-12 px-8">
                Start Free — No CC Required
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="https://www.producthunt.com/posts/qcanary" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface h-12 px-8 text-sm font-medium text-text-primary hover:bg-surface/80 transition-colors">
              <span>👍</span>
              Support on Product Hunt
            </Link>
          </div>
          <p className="mt-6 text-xs text-text-muted flex items-center gap-2 justify-center">
            <span>MIT open-source agent</span>
            <span className="opacity-40">·</span>
            <span>Free tier available</span>
            <span className="opacity-40">·</span>
            <span>No credit card</span>
            <span className="opacity-40">·</span>
            <span>Code <code className="rounded bg-code-bg px-1 font-mono text-accent">PH20</code> for 20% off</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-text-muted">
          <Link href="/" className="text-accent hover:underline">qcanary.dev</Link>
          <span className="mx-3">·</span>
          <Link href="/pricing?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch" className="hover:underline">Pricing</Link>
          <span className="mx-3">·</span>
          <Link href="/docs?utm_source=producthunt&utm_medium=ph_page&utm_campaign=launch" className="hover:underline">Docs</Link>
          <span className="mx-3">·</span>
          &copy; {new Date().getFullYear()} Qcanary
        </div>
      </footer>
    </main>
    </>
  );
}
