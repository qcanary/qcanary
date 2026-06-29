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

type UsageResponse = {
  success: true;
  data: {
    plan: PlanName;
    usage: {
      projectsUsed: number;
      projectsLimit: number | null;
      eventsUsedToday: number;
      eventsLimit: number | null;
    };
  };
};

const planRank: Record<PlanName, number> = {
  free: 0,
  starter: 1,
  pro: 2,
};

function formatLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : limit.toLocaleString();
}

function progressTone(used: number, limit: number | null): string {
  if (limit === null || limit <= 0) {
    return "bg-accent";
  }
  const percent = (used / limit) * 100;
  if (percent >= 100) {
    return "bg-red-500";
  }
  if (percent > 80) {
    return "bg-yellow-400";
  }
  return "bg-accent";
}

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const percent = limit === null || limit <= 0 ? 100 : Math.min((used / limit) * 100, 100);
  const atLimit = limit !== null && used >= limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-sm text-text-muted">
          {used.toLocaleString()} / {formatLimit(limit)}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${progressTone(used, limit)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {atLimit && (
        <div className="text-xs font-medium text-red-300">Limit reached. Upgrade to keep scaling.</div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [plan, setPlan] = React.useState<PlanName | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = React.useState<string | null>(null);
  const [usage, setUsage] = React.useState<UsageResponse["data"]["usage"] | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState(true);
  const [loadingUsage, setLoadingUsage] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = React.useState<PlanName | null>(null);
  const [paymentMessage, setPaymentMessage] = React.useState<string | null>(null);

  // Handle redirect-from-Dodo payment status
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentMessage('Payment successful! Your plan has been upgraded.');
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle billing cancellation query param
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get('billing');
    if (billing === 'cancelled') {
      setPaymentMessage('Billing upgrade was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function loadBillingSettings() {
      try {
        setLoadingPlan(true);
        setLoadingUsage(true);
        setError(null);
        const [planRes, usageRes] = await Promise.all([
          fetch("/api/v1/billing/plan", { cache: "no-store" }),
          fetch("/api/v1/usage", { cache: "no-store" }),
        ]);
        const planJson = (await planRes.json()) as PlanResponse | ApiError;
        const usageJson = (await usageRes.json()) as UsageResponse | ApiError;
        if (!planJson.success) {
          throw new Error(planJson.error.message);
        }
        if (!usageJson.success) {
          throw new Error(usageJson.error.message);
        }
        if (!cancelled) {
          setPlan(planJson.data.plan);
          setPlanExpiresAt(planJson.data.planExpiresAt);
          setUsage(usageJson.data.usage);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load billing settings.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false);
          setLoadingUsage(false);
        }
      }
    }

    void loadBillingSettings();
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

      {paymentMessage && (
        <Card>
          <CardHeader>
            <CardTitle>{paymentMessage}</CardTitle>
          </CardHeader>
        </Card>
      )}

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
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current plan consumption for your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loadingUsage || !usage ? (
            <span className="text-sm text-text-muted">Loading usage...</span>
          ) : (
            <>
              <UsageMeter label="Projects" used={usage.projectsUsed} limit={usage.projectsLimit} />
              <UsageMeter label="Daily events" used={usage.eventsUsedToday} limit={usage.eventsLimit} />
              {((usage.projectsLimit !== null && usage.projectsUsed >= usage.projectsLimit) ||
                (usage.eventsLimit !== null && usage.eventsUsedToday >= usage.eventsLimit)) && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  Your current plan is at capacity. Upgrade to raise these limits.
                </div>
              )}
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
