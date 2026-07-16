"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { trackEvent, trackCriticalEvent } from "@/components/PostHogProvider";

type ApiError = { success: false; error: { code: string; message: string } };
type PlanName = "free" | "solo" | "team" | "business";

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
      eventsStatus?: "ok" | "grace" | "hard_capped";
    };
  };
};

type ProjectListResponse = {
  success: true;
  data: {
    projects: Array<{
      id: string;
      name: string;
      environment: string;
      createdAt: string;
    }>;
  };
};

type ProjectDetailResponse = {
  success: true;
  data: {
    project: { id: string; name: string; environment: string; createdAt: string };
    apiKeys: Array<{
      id: string;
      projectId: string;
      keyPrefix: string;
      label: string | null;
      lastUsedAt: string | null;
      createdAt: string;
      revokedAt: string | null;
    }>;
  };
};

type CreateKeyResponse = {
  success: true;
  data: {
    apiKey: string;
    key: { id: string; projectId: string; keyPrefix: string; label: string | null; createdAt: string };
  };
};

const planRank: Record<PlanName, number> = {
  free: 0,
  solo: 1,
  team: 2,
  business: 3,
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

function ApiKeysPanel({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [keys, setKeys] = React.useState<ProjectDetailResponse["data"]["apiKeys"] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newKeyPlaintext, setNewKeyPlaintext] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadKeys = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, { cache: "no-store" });
      const json = (await res.json()) as ProjectDetailResponse | ApiError;
      if (!json.success) throw new Error(json.error.message);
      setKeys(json.data.apiKeys.filter((k) => !k.revokedAt));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  async function createKey() {
    const keyLabel = window.prompt('Enter a label for this API key (e.g., "Production CI", "Staging"):', 'default');
    if (keyLabel === null) return;
    setError(null);
    setCreating(true);
    setNewKeyPlaintext(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/keys`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: keyLabel.trim() || 'default' }),
      });
      const json = (await res.json()) as CreateKeyResponse | ApiError;
      if (!json.success) throw new Error(json.error.message);
      setNewKeyPlaintext(json.data.apiKey);
      trackEvent("api_key_created", { projectId });
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/keys/${keyId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success: true } | ApiError;
      if (!json.success) throw new Error(json.error.message);
      trackEvent("api_key_revoked", { projectId });
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke API key");
    }
  }

  return (
    <div className="border border-border rounded-md">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface/40 transition-colors"
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && !keys) void loadKeys();
        }}
      >
        <div>
          <div className="text-sm font-medium text-text-primary">{projectName}</div>
          <div className="text-xs text-text-muted font-mono">{projectId}</div>
        </div>
        <div className="text-xs text-text-muted">{expanded ? "▲" : "▼"}</div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {error && <div className="text-xs text-red-400">{error}</div>}

          {loading ? (
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded-md bg-border" />
              <div className="h-10 animate-pulse rounded-md bg-border" />
            </div>
          ) : (
            <>
              {keys && keys.length > 0 && (
                <div className="space-y-2">
                  {keys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface/30 px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-text-primary">
                          {key.keyPrefix}...
                        </div>
                        <div className="text-xs text-text-muted">
                          Created {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void revokeKey(key.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {keys && keys.length === 0 && (
                <div className="text-xs text-text-muted">No active API keys.</div>
              )}

              {newKeyPlaintext && (
                <div className="rounded-md border border-accent/30 bg-accent/5 p-3 space-y-2">
                  <div className="text-xs font-medium text-accent">New API key created</div>
                  <div className="text-xs text-text-muted">
                    Copy this key now. You won&apos;t be able to see it again.
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-code-bg px-2 py-1 font-mono text-xs text-text-primary">
                      {newKeyPlaintext}
                    </code>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void navigator.clipboard.writeText(newKeyPlaintext);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={() => void createKey()}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create new API key"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const TABS = ["Plan", "Usage", "API Keys", "Billing"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("Plan");
  const [plan, setPlan] = React.useState<PlanName | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = React.useState<string | null>(null);
  const [usage, setUsage] = React.useState<UsageResponse["data"]["usage"] | null>(null);
  const [projects, setProjects] = React.useState<ProjectListResponse["data"]["projects"] | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState(true);
  const [loadingUsage, setLoadingUsage] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = React.useState<PlanName | null>(null);
  const [billingInterval, setBillingInterval] = React.useState<"month" | "year">("month");
  const [paymentMessage, setPaymentMessage] = React.useState<string | null>(null);
  const [couponCode, setCouponCode] = React.useState<string | null>(null);

  // Handle redirect-from-Dodo payment status, billing cancellation, and coupon codes
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentMessage('Payment successful! Your plan has been upgraded.');
      trackEvent("checkout_completed");
      window.history.replaceState({}, '', window.location.pathname);
    }
    const billing = params.get('billing');
    if (billing === 'cancelled') {
      setPaymentMessage('Billing upgrade was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Read coupon from URL param or sessionStorage (survives Clerk sign-up redirect)
    const coupon = params.get('coupon') || sessionStorage.getItem('qcanary_coupon');
    if (coupon) {
      setCouponCode(coupon.toUpperCase());
      sessionStorage.removeItem('qcanary_coupon');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        setLoadingPlan(true);
        setLoadingUsage(true);
        setError(null);
        // Fetch all three in parallel but handle each independently so a single
        // failure doesn't lose all data (e.g., billing API is down but usage works)
        const [planRes, usageRes, projectsRes] = await Promise.all([
          fetch("/api/v1/billing/plan", { cache: "no-store" }).catch(() => null),
          fetch("/api/v1/usage", { cache: "no-store" }).catch(() => null),
          fetch("/api/v1/projects", { cache: "no-store" }).catch(() => null),
        ]);

        let anyFailed = false;

        if (planRes && planRes.ok) {
          const planJson = await planRes.json().catch(() => null) as PlanResponse | null;
          if (planJson?.success) {
            if (!cancelled) {
              setPlan(planJson.data.plan);
              setPlanExpiresAt(planJson.data.planExpiresAt);
            }
          } else {
            anyFailed = true;
          }
        } else {
          anyFailed = true;
        }

        if (usageRes && usageRes.ok) {
          const usageJson = await usageRes.json().catch(() => null) as UsageResponse | null;
          if (usageJson?.success) {
            if (!cancelled) {
              setUsage(usageJson.data.usage);
            }
          } else {
            anyFailed = true;
          }
        } else {
          anyFailed = true;
        }

        if (projectsRes && projectsRes.ok) {
          const projectsJson = await projectsRes.json().catch(() => null) as ProjectListResponse | null;
          if (projectsJson?.success) {
            if (!cancelled) {
              setProjects(projectsJson.data.projects);
            }
          } else {
            anyFailed = true;
          }
        } else {
          anyFailed = true;
        }

        if (anyFailed && !cancelled) {
          setError("Some settings couldn't be loaded. Data shown may be incomplete.");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load settings.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false);
          setLoadingUsage(false);
        }
      }
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startUpgrade(targetPlan: PlanName) {
    if (targetPlan === "free") return;
    setError(null);
    setUpgradingPlan(targetPlan);
    trackEvent("plan_upgrade_started", { targetPlan, interval: billingInterval });
    try {
      const requestBody: Record<string, unknown> = { plan: targetPlan, interval: billingInterval };
      if (couponCode) {
        requestBody.coupon = couponCode;
      }
      const res = await fetch("/api/v1/billing/checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const json = (await res.json()) as { success: true; data: { checkoutUrl: string } } | ApiError;
      if (!json.success) throw new Error(json.error.message);
      trackCriticalEvent("checkout_started", { targetPlan, checkoutUrl: json.data.checkoutUrl });
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
        <p className="mt-2 text-text-muted">Manage plan, billing, and API keys.</p>
      </div>

      {paymentMessage && (
        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle>{paymentMessage}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Request failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl border border-border bg-surface/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-accent text-black shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Plan */}
      {activeTab === "Plan" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current plan
              {loadingPlan ? (
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              ) : (
                <Badge variant={currentPlan === "free" ? "outline" : "success"}>{currentPlan}</Badge>
              )}
            </CardTitle>
            <CardDescription>Active subscription for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPlan ? (
              <div className="text-sm text-text-muted">Loading plan details...</div>
            ) : (
              <div className="flex items-center gap-3">
                {expiresText && <span className="text-sm text-text-muted">Renews/ends: {expiresText}</span>}
                {currentPlan !== "business" && (
                  <span className="text-xs text-text-muted">
                    — <button type="button" onClick={() => setActiveTab("Billing")} className="text-accent hover:underline">Upgrade</button> for more features
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Usage */}
      {activeTab === "Usage" && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Current plan consumption for your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loadingUsage || !usage ? (
              <div className="text-sm text-text-muted">Loading usage...</div>
            ) : (
              <>
                <UsageMeter label="Projects" used={usage.projectsUsed} limit={usage.projectsLimit} />
                <UsageMeter label="Daily events" used={usage.eventsUsedToday} limit={usage.eventsLimit} />
                {usage.eventsStatus === "grace" && (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                    You&apos;re over your daily event limit but still within the 20% grace period. Events keep flowing — upgrade or wait for the daily reset to avoid a hard cut.
                  </div>
                )}
                {usage.eventsStatus === "hard_capped" && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    Daily event grace period exhausted. New events are being rejected until reset or upgrade.{" "}
                    <button type="button" onClick={() => setActiveTab("Billing")} className="underline hover:no-underline">Upgrade</button>
                  </div>
                )}
                {((usage.projectsLimit !== null && usage.projectsUsed >= usage.projectsLimit) ||
                  (usage.eventsLimit !== null && usage.eventsUsedToday >= usage.eventsLimit && usage.eventsStatus !== "grace" && usage.eventsStatus !== "hard_capped")) && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    Your current plan is at capacity. <button type="button" onClick={() => setActiveTab("Billing")} className="underline hover:no-underline">Upgrade</button> to raise these limits.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: API Keys */}
      {activeTab === "API Keys" && (
        <Card>
          <CardHeader>
            <CardTitle>API keys</CardTitle>
            <CardDescription>View and manage API keys for each project. Expand a project to see its keys.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!projects ? (
              <span className="text-sm text-text-muted">Loading projects...</span>
            ) : projects.length === 0 ? (
              <div className="text-sm text-text-muted">
                No projects yet.{' '}
                <a href="/onboarding" className="text-accent hover:underline">Create your first project</a>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <ApiKeysPanel key={project.id} projectId={project.id} projectName={project.name} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Billing */}
      {activeTab === "Billing" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade</CardTitle>
            <CardDescription>Choose a higher tier to unlock alerts and larger limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
          {/* Coupon code indicator */}
          {couponCode && (
            <div className="rounded-xl border-2 border-orange-400/30 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 p-4">
              <div className="flex items-center gap-2 text-sm">
                <span>🎉</span>
                <span className="font-medium text-orange-300">
                  Coupon <code className="rounded-md bg-code-bg px-1.5 py-0.5 font-mono text-accent ring-1 ring-accent/20">{couponCode}</code> applied
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                You&apos;ll receive <span className="text-accent font-medium">20% off Business for life</span>. The discount will show in the Dodo checkout.
              </p>
            </div>
          )}
          {/* Billing interval toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${billingInterval === "month" ? "font-medium text-text-primary" : "text-text-muted"}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={billingInterval === "year"}
              onClick={() => setBillingInterval(billingInterval === "month" ? "year" : "month")}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                billingInterval === "year" ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
                  billingInterval === "year" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm ${billingInterval === "year" ? "font-medium text-text-primary" : "text-text-muted"}`}>
              Yearly
              <span className="ml-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">Save 20%</span>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-surface/50 p-4">
              <div className="text-sm font-medium text-text-primary">
                Solo — {billingInterval === "year" ? "$144/yr" : "$15/mo"}
              </div>
              <div className="mt-1 text-xs text-text-muted">1 project, 5 queues, Slack + email (2 rules), 14-day history.</div>
              {billingInterval === "year" && (
                <div className="mt-1 text-xs text-accent">$12/mo billed annually</div>
              )}
              <Button
                className="mt-4 w-full"
                disabled={planRank.solo <= planRank[currentPlan] || upgradingPlan !== null || loadingPlan}
                onClick={() => void startUpgrade("solo")}
              >
                {currentPlan === "solo"
                  ? "Current plan"
                  : upgradingPlan === "solo"
                    ? "Redirecting..."
                    : billingInterval === "year" ? "Upgrade — $144/yr" : "Upgrade to Solo"}
              </Button>
            </div>

            <div className="rounded-md border border-border bg-surface/50 p-4">
              <div className="text-sm font-medium text-text-primary">
                Team — {billingInterval === "year" ? "$374/yr" : "$39/mo"}
              </div>
              <div className="mt-1 text-xs text-text-muted">3 projects, webhooks, 100K events/day, 30-day history.</div>
              {billingInterval === "year" && (
                <div className="mt-1 text-xs text-accent">~$31/mo billed annually</div>
              )}
              <Button
                className="mt-4 w-full"
                disabled={planRank.team <= planRank[currentPlan] || upgradingPlan !== null || loadingPlan}
                onClick={() => void startUpgrade("team")}
              >
                {currentPlan === "team"
                  ? "Current plan"
                  : upgradingPlan === "team"
                    ? "Redirecting..."
                    : billingInterval === "year" ? "Upgrade — $374/yr" : "Upgrade to Team"}
              </Button>
            </div>

            <div className="rounded-md border border-border bg-surface/50 p-4">
              <div className="text-sm font-medium text-text-primary">
                Business — {billingInterval === "year" ? "$1,430/yr" : "$149/mo"}
              </div>
              <div className="mt-1 text-xs text-text-muted">Unlimited projects/queues/events, 90-day history.</div>
              {billingInterval === "year" && (
                <div className="mt-1 text-xs text-accent">~$119/mo billed annually</div>
              )}
              <Button
                className="mt-4 w-full"
                disabled={planRank.business <= planRank[currentPlan] || upgradingPlan !== null || loadingPlan}
                onClick={() => void startUpgrade("business")}
              >
                {currentPlan === "business"
                  ? "Current plan"
                  : upgradingPlan === "business"
                    ? "Redirecting..."
                    : billingInterval === "year" ? "Upgrade — $1,430/yr" : "Upgrade to Business"}
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
