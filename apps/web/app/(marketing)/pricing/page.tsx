import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { IncidentCostCalculator } from "@/components/landing/IncidentCostCalculator";
import { PricingTiers } from "@/components/pricing/PricingTiers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, upgrade when you need alerts and history. Product Hunt launch special: 20% off Pro for life with code PH20.",
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: "QCanary Pricing — Monitor BullMQ Without Exposing Redis",
    description:
      "Start free, upgrade when you need alerts. Product Hunt special: 20% off Pro for life.",
    url: `${siteUrl}/pricing`,
  },
};

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
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Pay for peace of mind. <span className="text-accent">Not events.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-text-muted">
            You don&apos;t care how many events we process. You care that your queue doesn&apos;t stall
            at 2am on a Saturday. Our pricing reflects that.
          </p>
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
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 transition-colors"
              >
                Claim Discount
                <span className="text-xs opacity-70">→</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Incident Cost Calculator */}
      <section className="border-b border-border bg-gradient-to-b from-bg via-surface/[0.03] to-code-bg/10">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <IncidentCostCalculator />
        </div>
      </section>

      {/* Pricing Tiers (client component with toggle, cards, table, FAQ, CTA) */}
      <PricingTiers />
    </main>
  );
}
