"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useUpgradeModal } from "./UpgradeModalContext";

const PLANS = [
  {
    name: "Solo",
    price: 15,
    period: "/month",
    badge: null,
    description: "For solo founders and side projects going to production.",
    cta: "Start Solo",
    ctaHref: "/sign-up",
    highlighted: false,
    features: [
      "1 project",
      "5 queues",
      "25,000 events/day",
      "14-day history",
      "Email + Slack alerts (2 rules)",
    ],
  },
  {
    name: "Team",
    price: 39,
    period: "/month",
    badge: "Most Popular",
    description: "For production teams that need reliable queue monitoring.",
    cta: "Start Team Trial",
    ctaHref: "/sign-up",
    highlighted: true,
    features: [
      "3 projects",
      "10 queues per project",
      "100,000 events/day",
      "30-day history",
      "5 team members",
      "Slack + Email + Webhook alerts",
      "Unlimited alert rules",
      "Auto-resolution",
      "API access",
    ],
  },
  {
    name: "Business",
    price: 149,
    period: "/month",
    badge: null,
    description: "For teams with compliance needs and scale requirements.",
    cta: "Start Business Trial",
    ctaHref: "/sign-up",
    highlighted: false,
    features: [
      "Unlimited projects & queues",
      "Unlimited events",
      "90-day history",
      "20 team members",
      "SSO (SAML/OIDC)",
      "Role-based access control",
      "PagerDuty + OpsGenie webhooks",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    badge: "Self-Hosted",
    description: "For regulated industries and teams that need full control.",
    cta: "Contact Sales",
    ctaHref: "/enterprise",
    highlighted: false,
    features: [
      "Everything in Business",
      "Self-hosted deployment",
      "Unlimited team members",
      "Custom SLA",
      "Dedicated support engineer",
      "SOC 2 Type II report",
      "White-glove onboarding",
    ],
  },
];

export function UpgradeModal() {
  const { isOpen, close } = useUpgradeModal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Choose your plan</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-4 py-4 md:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-5 transition-all ${
                plan.highlighted
                  ? "border-2 border-accent/40 bg-gradient-to-br from-accent/5 via-surface/30 to-code-bg shadow-lg shadow-accent/5 scale-[1.02]"
                  : "border-border bg-surface/30"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <Badge
                  variant={plan.highlighted ? "success" : "outline"}
                  className={`mb-2 ${
                    plan.highlighted ? "" : "border-accent/20 text-accent bg-accent/[0.05]"
                  }`}
                >
                  {plan.badge}
                </Badge>
              )}

              <h3 className="text-base font-semibold">{plan.name}</h3>

              <div className="mt-1">
                {plan.price !== null ? (
                  <>
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-text-muted text-sm">{plan.period}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">Custom</span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {plan.description}
              </p>

              <ul className="mt-4 flex-1 space-y-1.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-primary">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {plan.highlighted ? (
                  <Link href={plan.ctaHref} onClick={close}>
                    <Button className="w-full text-sm">{plan.cta}</Button>
                  </Link>
                ) : (
                  <Link href={plan.ctaHref} onClick={close}>
                    <Button variant="secondary" className="w-full text-sm">
                      {plan.cta}
                    </Button>
                  </Link>
                )}
                {plan.highlighted && (
                  <p className="mt-2 text-center text-[10px] text-text-muted/60">
                    No credit card required for trial
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-text-muted/60">
          Questions? Email us at{" "}
          <a href="mailto:founder@qcanary.dev" className="text-accent hover:underline">
            founder@qcanary.dev
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
