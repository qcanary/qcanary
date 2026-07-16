"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


// ── Data ────────────────────────────────────────────────────

const TIERS = [
  {
    name: "Free",
    price: 0,
    period: "/month",
    badge: null,
    description: "For personal projects and evaluation.",
    cta: "Get Started Free →",
    ctaHref: "/sign-up",
    ctaVariant: "secondary" as const,
    highlighted: false,
    enterprise: false,
    annualMonthly: undefined,
    annualYearly: undefined,
    features: [
      "1 project",
      "1 queue",
      "5,000 events/day",
      "24-hour history",
      "1 user",
      "Email alerts (1 rule)",
      "Community support",
    ],
  },
  {
    name: "Solo",
    price: 15,
    period: "/month",
    badge: "For Indie Hackers",
    description: "For solo founders and side projects going to production.",
    cta: "Start Solo →",
    ctaHref: "/sign-up",
    ctaVariant: "default" as const,
    highlighted: false,
    enterprise: false,
    annualMonthly: 15,
    annualYearly: 144,
    features: [
      "1 project",
      "5 queues",
      "25,000 events/day",
      "14-day history",
      "1 user",
      "Email + Slack alerts (2 rules)",
      "Basic support (48h response)",
    ],
  },
  {
    name: "Team",
    price: 39,
    period: "/month",
    badge: "Most Popular",
    description: "For production teams that need reliable queue monitoring.",
    cta: "Start Team Trial →",
    ctaHref: "/sign-up",
    ctaVariant: "default" as const,
    highlighted: true,
    enterprise: false,
    annualMonthly: 39,
    annualYearly: 374,
    features: [
      "3 projects",
      "10 queues per project",
      "100,000 events/day",
      "30-day history",
      "5 team members",
      "Slack + Email + Webhook alerts (unlimited rules)",
      "Auto-resolution (coming soon)",
      "API access (coming soon)",
      "Basic support (48h response)",
    ],
  },
  {
    name: "Business",
    price: 149,
    period: "/month",
    badge: "For Organizations",
    description: "For teams with compliance needs and scale requirements.",
    cta: "Start Business Trial →",
    ctaHref: "/sign-up",
    ctaVariant: "default" as const,
    highlighted: false,
    enterprise: false,
    annualMonthly: 149,
    annualYearly: 1430,
    features: [
      "Unlimited projects",
      "Unlimited queues",
      "Unlimited events",
      "90-day history",
      "20 team members",
      "SSO (SAML/OIDC) (coming soon)",
      "Role-based access control (coming soon)",
      "PagerDuty + OpsGenie webhooks (coming soon)",
      "Priority support (24h response, Slack channel)",
      "Usage analytics & reporting",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    badge: "Self-Hosted",
    description: "For regulated industries and teams that need full control.",
    cta: "Contact Sales →",
    ctaHref: "/enterprise",
    ctaVariant: "secondary" as const,
    highlighted: false,
    enterprise: true,
    annualMonthly: undefined,
    annualYearly: undefined,
    features: [
      "Everything in Business",
      "Self-hosted deployment",
      "Unlimited team members",
      "Unlimited history",
      "Custom SLA (99.9% uptime)",
      "Dedicated support engineer",
      "SOC 2 Type II report",
      "Annual security audits",
      "White-glove onboarding",
      "Custom integrations",
    ],
  },
] as const;

const COMPARISON_ROWS = [
  { feature: "Projects", free: "1", solo: "1", team: "3", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Queues", free: "1", solo: "5", team: "10/project", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Events/day", free: "5,000", solo: "25,000", team: "100,000", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "History", free: "24h", solo: "14 days", team: "30 days", business: "90 days", enterprise: "Unlimited" },
  { feature: "Team members", free: "1", solo: "1", team: "5", business: "20", enterprise: "Unlimited" },
  { feature: "Email alerts", free: "1 rule", solo: "2 rules", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
  { feature: "Slack alerts", free: "—", solo: "✓", team: "✓", business: "✓", enterprise: "✓" },
  { feature: "Webhook alerts", free: "—", solo: "—", team: "✓", business: "✓", enterprise: "✓" },
  { feature: "Auto-resolution", free: "—", solo: "—", team: "Coming soon", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "SSO/SAML", free: "—", solo: "—", team: "—", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "Role-based access", free: "—", solo: "—", team: "—", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "API access", free: "—", solo: "—", team: "Coming soon", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "PagerDuty/OpsGenie", free: "—", solo: "—", team: "—", business: "Coming soon", enterprise: "Coming soon" },
  { feature: "Support", free: "Community", solo: "48h", team: "48h", business: "24h + Slack", enterprise: "Dedicated engineer" },
  { feature: "Self-hosted", free: "—", solo: "—", team: "—", business: "—", enterprise: "✓" },
  { feature: "Custom SLA", free: "—", solo: "—", team: "—", business: "—", enterprise: "✓" },
  { feature: "SOC 2 report", free: "—", solo: "—", team: "—", business: "—", enterprise: "✓" },
];

const FAQS = [
  {
    q: "What's the difference between Free and Solo?",
    a: "Solo gives you 5 queues (vs. 1), 14-day history (vs. 24 hours), Slack alerts, and 25,000 events/day (vs. 5,000). It's for solo founders who need production monitoring without the team features.",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes. The Free tier is free forever for personal projects. Use it to evaluate QCanary. When you're ready for production, upgrade to Solo or Team.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We'll notify you at 80% and 100% of your daily event limit. Past 100%, a 20% grace band keeps events flowing so you aren't cut off mid-incident. After that grace is used, new events are rejected until the daily reset or you upgrade.",
  },
  {
    q: "Do I need a credit card for the free tier?",
    a: "No. No credit card required. No time limit. The free tier is free forever for personal projects and evaluation.",
  },
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Yes. You can switch at any time from your dashboard. Annual plans save 20%.",
  },
  {
    q: "What's the difference between Solo and Team?",
    a: "Team adds multiple projects, team member access (5 people), unlimited alert rules, webhooks, and API access. Solo is for one person. Team is for a group.",
  },
  {
    q: "What's the difference between Team and Business?",
    a: "Business adds SSO (SAML/OIDC), role-based access control, PagerDuty/OpsGenie integrations, priority support with a Slack channel, and usage analytics. If you have a dedicated DevOps or SRE team, Business is the right fit.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. 14-day money-back guarantee on your first paid invoice. No questions asked.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards. Enterprise customers can pay via invoice (ACH, wire transfer) with annual contracts.",
  },
  {
    q: "Is there a discount for startups or non-profits?",
    a: "Yes. Startups under 2 years old and non-profits get 50% off Solo, Team, or Business for the first year. Contact us with proof of status.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-3.5 w-3.5 shrink-0 text-accent"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────

export function PricingTiers() {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      {/* ── Annual Toggle ──────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-br from-bg via-surface/10 to-code-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${annual ? "text-text-muted" : "text-text-primary"}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                annual ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? "text-text-primary" : "text-text-muted"}`}>
              Annual <span className="text-accent font-semibold">(save 20%)</span>
            </span>
          </div>

          {/* ── Tier Cards ──────────────────────────────────── */}
          <div className="grid gap-5 md:grid-cols-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  tier.highlighted
                    ? "border-2 border-accent/40 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg shadow-lg shadow-accent/5 scale-[1.02]"
                    : tier.enterprise
                    ? "border-border/60 bg-gradient-to-br from-surface/20 via-surface/10 to-code-bg/30"
                    : "border-border bg-surface/30"
                }`}
              >
                {/* Glow for highlighted card */}
                {tier.highlighted && (
                  <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
                )}

                <div className="relative">
                  {/* Badge */}
                  {tier.badge && (
                    <Badge
                      variant={tier.highlighted ? "success" : "outline"}
                      className={`mb-3 ${
                        tier.highlighted ? "" : "border-accent/20 text-accent bg-accent/[0.05]"
                      }`}
                    >
                      {tier.badge}
                    </Badge>
                  )}

                  {/* Name */}
                  <h2 className="text-lg font-semibold">{tier.name}</h2>

                  {/* Price */}
                  <div className="mt-1">
                    {tier.price !== null ? (
                      <>
                        <span className="text-3xl font-bold md:text-4xl">
                          {annual && tier.annualYearly ? `$${tier.annualYearly}` : `$${tier.price}`}
                        </span>
                        <span className="text-text-muted">
                          {annual && tier.annualYearly ? "/year" : tier.period}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold md:text-4xl">Custom</span>
                    )}
                  </div>

                  {/* Annual subnote */}
                  {tier.price !== null && tier.annualYearly && !annual && (
                    <div className="mt-0.5 text-xs text-accent">
                      ${tier.annualYearly}/year when billed annually (save 20%)
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">
                    {tier.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-4 flex-1 space-y-2">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs">
                        <CheckIcon />
                        <span className="text-text-primary">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6">
                    <Link href={tier.ctaHref}>
                      <Button variant={tier.ctaVariant} className="w-full">
                        {tier.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Feature Comparison Table ──────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Full feature comparison</h2>
          <p className="text-sm text-text-muted mb-8">See exactly what you get with each plan.</p>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-code-bg text-left text-sm">
                    <th className="px-4 py-3 font-medium text-text-primary">Feature</th>
                    <th className="px-4 py-3 font-medium text-text-muted">Free</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Solo</th>
                    <th className="px-4 py-3 font-medium text-accent">Team</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Business</th>
                    <th className="px-4 py-3 font-medium text-text-primary">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
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
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-text-muted mb-8">Quick answers about QCanary pricing and plans.</p>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group cursor-pointer rounded-xl border border-border bg-surface/30 transition-all hover:border-accent/30 open:border-accent/30 open:bg-surface/40"
              >
                <summary className="flex items-center justify-between px-5 py-4 text-sm font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <div className="relative ml-4 h-5 w-5 shrink-0">
                    <svg
                      className="absolute inset-0 h-5 w-5 text-text-muted transition-all group-open:rotate-45 group-open:text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
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

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
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

      {/* ── JSON-LD Structured Data ────────────────────────── */}
      <Script
        id="json-ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "QCanary",
            applicationCategory: "DeveloperApplication",
            description: "Monitor BullMQ queues without sharing Redis credentials.",
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "USD",
                description: "1 project, 1 queue, 5K events/day, 24-hour history, email alerts (1 rule).",
              },
              {
                "@type": "Offer",
                name: "Solo",
                price: "15",
                priceCurrency: "USD",
                priceInterval: "Monthly",
                description: "1 project, 5 queues, 25K events/day, 14-day history, Slack + Email alerts.",
              },
              {
                "@type": "Offer",
                name: "Team",
                price: "39",
                priceCurrency: "USD",
                priceInterval: "Monthly",
                description: "3 projects, 10 queues, 100K events/day, 30-day history, Slack + Email + Webhook alerts.",
              },
              {
                "@type": "Offer",
                name: "Business",
                price: "149",
                priceCurrency: "USD",
                priceInterval: "Monthly",
                description: "Unlimited projects & queues, unlimited events, 90-day history, SSO, RBAC, priority support.",
              },
              {
                "@type": "Offer",
                name: "Enterprise",
                price: "12000",
                priceCurrency: "USD",
                priceInterval: "Yearly",
                description: "Self-hosted deployment, unlimited everything, dedicated support, SOC 2, custom SLA.",
              },
            ],
          }),
        }}
      />

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-text-muted">
          <Link href="/" className="text-accent hover:underline">← Back to home</Link>
          <span className="mx-3">·</span>
          &copy; {new Date().getFullYear()} QCanary. MIT-licensed agent.
        </div>
      </footer>
    </>
  );
}
