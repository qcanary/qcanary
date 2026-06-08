"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/components/PostHogProvider";

type ApiError = { success: false; error: { code: string; message: string } };
type PlanName = "free" | "starter" | "pro";

type PlanResponse = {
  success: true;
  data: {
    plan: PlanName;
    planExpiresAt: string | null;
  };
};

const planRank: Record<PlanName, number> = {
  free: 0,
  starter: 1,
  pro: 2,
};

export default function SettingsPage() {
  const [plan, setPlan] = React.useState<PlanName | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = React.useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = React.useState<PlanName | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      try {
        setLoadingPlan(true);
        setError(null);
        const res = await fetch("/api/v1/billing/plan", { cache: "no-store" });
        const json = (await res.json()) as PlanResponse | ApiError;
        if (!json.success) {
          throw new Error(json.error.message);
        }
        if (!cancelled) {
          setPlan(json.data.plan);
          setPlanExpiresAt(json.data.planExpiresAt);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load billing settings.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false);
        }
      }
    }

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startUpgrade(targetPlan: PlanName) {
    if (targetPlan === "free") {
      return;
    }
    setError(null);
    setUpgradingPlan(targetPlan);
    trackEvent("plan_upgrade_started", { targetPlan });
    try {
      const res = await fetch("/api/v1/billing/checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const json = (await res.json()) as { success: true; data: { checkoutUrl: string } } | ApiError;
      if (!json.success) {
        throw new Error(json.error.message);
      }
      window.location.href = json.data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start upgrade.");
      setUpgradingPlan(null);
    }
  }

  const currentPlan = plan ?? "free";
  const expiresText = planExpiresAt ? new Date(planExpiresAt).toLocaleString() : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-text-muted">Manage plan and billing upgrades.</p>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Billing request failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Active subscription for your organization.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          {loadingPlan ? (
            <span className="text-sm text-text-muted">Loading plan...</span>
          ) : (
            <>
              <Badge variant={currentPlan === "free" ? "outline" : "success"}>{currentPlan}</Badge>
              {expiresText && <span className="text-sm text-text-muted">Renews/ends: {expiresText}</span>}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade</CardTitle>
          <CardDescription>Choose a higher tier to unlock alerts and larger limits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface/50 p-4">
            <div className="text-sm font-medium text-text-primary">Starter - $9/mo</div>
            <div className="mt-1 text-xs text-text-muted">Slack/email alerts, 3 projects, 30-day history.</div>
            <Button
              className="mt-4 w-full"
              disabled={planRank.starter <= planRank[currentPlan] || upgradingPlan !== null || loadingPlan}
              onClick={() => void startUpgrade("starter")}
            >
              {currentPlan === "starter"
                ? "Current plan"
                : upgradingPlan === "starter"
                  ? "Redirecting..."
                  : "Upgrade to Starter"}
            </Button>
          </div>

          <div className="rounded-md border border-border bg-surface/50 p-4">
            <div className="text-sm font-medium text-text-primary">Pro - $24/mo</div>
            <div className="mt-1 text-xs text-text-muted">Unlimited projects/queues and advanced alerting.</div>
            <Button
              className="mt-4 w-full"
              disabled={planRank.pro <= planRank[currentPlan] || upgradingPlan !== null || loadingPlan}
              onClick={() => void startUpgrade("pro")}
            >
              {currentPlan === "pro"
                ? "Current plan"
                : upgradingPlan === "pro"
                  ? "Redirecting..."
                  : "Upgrade to Pro"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
