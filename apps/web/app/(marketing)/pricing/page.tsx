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
