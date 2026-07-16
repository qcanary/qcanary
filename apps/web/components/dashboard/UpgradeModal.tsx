"use client";

import * as React from "react";
import Link from "next/link";
import { X, Loader2 } from "lucide-react";
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
    planSlug: "solo",
    description: "For solo founders and side projects going to production.",
    cta: "Start Solo",
    highlighted: false,
    features: [
      "1 project",
      "5 queues",
      "25,000 events/day",
      "14-day history",
      "Email + Slack alerts (2 rules)",
      "Basic support (48h response)",
    ],
  },
  {
    name: "Team",
    price: 39,
    period: "/month",
    badge: "Most Popular",
    planSlug: "team",
    description: "For production teams that need reliable queue monitoring.",
    cta: "Start Team Trial",
    highlighted: true,
    features: [
      "3 projects",
      "10 queues per project",
      "100,000 events/day",
      "30-day history",
      "5 team members",
      "Slack + Email + Webhook alerts",
      "Unlimited alert rules",
      "Auto-resolution (coming soon)",
      "API access (coming soon)",
    ],
  },
  {
    name: "Business",
    price: 149,
    period: "/month",
    badge: null,
    planSlug: "business",
    description: "For teams with compliance needs and scale requirements.",
    cta: "Start Business Trial",
    highlighted: false,
    features: [
      "Unlimited projects & queues",
      "Unlimited events",
      "90-day history",
      "20 team members",
      "SSO (SAML/OIDC) (coming soon)",
      "Role-based access control (coming soon)",
      "PagerDuty + OpsGenie webhooks (coming soon)",
      "Priority support (24h response, Slack channel)",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    badge: "Self-Hosted",
    planSlug: null,
    description: "For regulated industries and teams that need full control.",
    cta: "Contact Sales",
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

function useCheckout() {
  const [loading, setLoading] = React.useState<string | null>(null);

  const checkout = React.useCallback(
    async (planSlug: string) => {
      setLoading(planSlug);
      try {
        const res = await fetch("/api/v1/billing/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planSlug, interval: "month" }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message ?? "Failed to create checkout");
        }
        // Redirect to Dodo Payments checkout
        window.location.href = json.data.checkoutUrl;
      } catch (err) {
        console.error("Checkout error:", err);
        alert(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(null);
      }
    },
    []
  );

  return { loading, checkout };
}

export function UpgradeModal() {
  const { isOpen, close } = useUpgradeModal();
  const { loading, checkout } = useCheckout();

  return (
    <>
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
                  {plan.planSlug && plan.name !== "Enterprise" ? (
                    <Button
                      variant={plan.highlighted ? "default" : "secondary"}
                      className="w-full text-sm gap-2"
                      disabled={loading === plan.planSlug}
                      onClick={() => {
                        close();
                        void checkout(plan.planSlug!);
                      }}
                    >
                      {loading === plan.planSlug ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  ) : (
                    <Link href="/enterprise" onClick={close}>
                      <Button variant="secondary" className="w-full text-sm">
                        {plan.cta}
                      </Button>
                    </Link>
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
    </>
  );
}
