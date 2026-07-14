"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createAuthedSupabaseClient } from "@/lib/supabaseClient";
import { trackEvent } from "@/components/PostHogProvider";

type ApiError = { success: false; error: { code: string; message: string } };

type QueueSummary = {
  queueName: string;
  totalJobs: number;
  completed: number;
  failed: number;
  active: number;
  stalled: number;
  failureRate: number;
  avgDurationMs: number | null;
  lastEventAt: string | null;
};

type QueuesOk = { success: true; data: { queues: QueueSummary[] } };

type JobEventRow = {
  id: number;
  queue_name: string;
  job_id: string;
  job_name: string | null;
  status: string;
  error_message: string | null;
  timestamp: string;
};

function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}  function DashboardViewTracker({ projectId }: { projectId: string }) {
    const tracked = React.useRef(false);
    React.useEffect(() => {
      if (!tracked.current && queues && queues.length > 0) {
        tracked.current = true;
        trackEvent("dashboard_viewed", { projectId, queueCount: queues.length });
      }
    }, [queues, projectId]);
    return null;
  }

  function formatRelativeOrIso(iso: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return iso;
  const diffMs = Date.now() - ts;
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(ts).toLocaleString();
}

function healthVariant(queue: QueueSummary): "success" | "danger" | "muted" {
  if (queue.failed > 0) return "danger";
  if (queue.totalJobs > 0) return "success";
  return "muted";
}

function healthLabel(queue: QueueSummary): string {
  if (queue.failed > 0) return "Degraded";
  if (queue.totalJobs > 0) return "Healthy";
  return "No data";
}

export function ProjectOverviewClient({ projectId }: { projectId: string }) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  const [queues, setQueues] = React.useState<QueueSummary[] | null>(null);
  const [recentFailures, setRecentFailures] = React.useState<JobEventRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const authRedirected = React.useRef(false);

  // Redirect unauthenticated users to sign-in
  React.useEffect(() => {
    if (isSignedIn === false) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  const refreshQueues = React.useCallback(async () => {
    const res = await fetch(`/api/v1/projects/${projectId}/queues`, { cache: "no-store" });
    if (res.status === 401) {
      authRedirected.current = true;
      router.push("/sign-in");
      throw new Error("Unauthorized");
    }
    let json: QueuesOk | ApiError;
    try {
      json = (await res.json()) as QueuesOk | ApiError;
    } catch {
      throw new Error(`Server returned ${res.status}: expected JSON, got unexpected response`);
    }
    if (!json.success) {
      throw new Error(json.error.message);
    }
    setQueues(json.data.queues);
  }, [projectId, router]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await refreshQueues();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load project data.";
        if (!cancelled && !authRedirected.current) setError(message);
      } finally {
        if (!cancelled && !authRedirected.current) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshQueues]);

  React.useEffect(() => {
    let cancelled = false;
    let channelUnsubscribed = false;

    async function initRealtime() {
      try {
        const token = await getToken().catch(() => null);
        if (!token) return;

        const supabase = createAuthedSupabaseClient(token);
        if (!supabase) return;

        const { data, error: fetchError } = await supabase
          .from("job_events")
          .select("id, queue_name, job_id, job_name, status, error_message, timestamp")
          .eq("project_id", projectId)
          .eq("status", "failed")
          .order("timestamp", { ascending: false })
          .limit(20);

        if (!cancelled) {
          setRecentFailures(((data ?? []) as JobEventRow[]).slice(0, 20));
        }

        if (fetchError) {
          return;
        }

        let refreshTimer: ReturnType<typeof setTimeout> | null = null;
        const scheduleRefresh = () => {
          if (refreshTimer) return;
          refreshTimer = setTimeout(() => {
            refreshTimer = null;
            void refreshQueues().catch(() => {});
          }, 600);
        };

        const channel = supabase
          .channel(`job-events-${projectId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "job_events", filter: `project_id=eq.${projectId}` },
            (payload) => {
              const row = payload.new as Partial<JobEventRow> & { status?: unknown };
              scheduleRefresh();
              if (row.status === "failed") {
                setRecentFailures((prev) => {
                  const next = [row as JobEventRow, ...(prev ?? [])];
                  const deduped = new Map<number, JobEventRow>();
                  for (const item of next) {
                    if (typeof item?.id === "number") deduped.set(item.id, item);
                  }
                  return Array.from(deduped.values())
                    .sort((a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""))
                    .slice(0, 20);
                });
              }
            }
          )
          .subscribe((status) => { if (status !== "SUBSCRIBED") { console.error("Realtime subscription error for project", projectId, status); } });

        return () => {
          if (refreshTimer) clearTimeout(refreshTimer);
          if (!channelUnsubscribed) {
            channelUnsubscribed = true;
            void supabase.removeChannel(channel);
          }
        };
      } catch {
        // Realtime is best-effort; swallow all errors.
        return;
      }
    }

    let cleanup: (() => void) | undefined;
    void initRealtime().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [getToken, projectId, refreshQueues]);

  const totals = React.useMemo(() => {
    const base = { totalJobs: 0, completed: 0, failed: 0, stalled: 0, active: 0 };
    const q = queues ?? [];
    for (const item of q) {
      base.totalJobs += item.totalJobs;
      base.completed += item.completed;
      base.failed += item.failed;
      base.stalled += item.stalled;
      base.active += item.active;
    }
    const successRate = base.totalJobs > 0 ? ((base.completed / base.totalJobs) * 100) : 0;
    const failureRate = base.totalJobs > 0 ? ((base.failed / base.totalJobs) * 100) : 0;
    return { ...base, successRate, failureRate };
  }, [queues]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-2 text-text-muted">
            Project: <span className="font-mono text-text-primary">{projectId}</span>
          </p>
        </div>
        <div className="text-xs text-text-muted" aria-live="polite">{loading ? "Loading…" : "Live"}</div>
      </div>

      {/* Conversion funnel tracking */}
      <DashboardViewTracker projectId={projectId} />
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t load dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" onClick={async () => {
              setError(null);
              try {
                await refreshQueues();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load project data.");
              }
            }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat cards with mini progress bars — animated counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(() => {
          const progressFailed = totals.totalJobs > 0 ? Math.min((totals.failed / totals.totalJobs) * 100, 100) : 0;
          const progressSuccess = totals.successRate;
          const progressActive = totals.totalJobs > 0 ? Math.min(((totals.active + totals.completed) / totals.totalJobs) * 100, 100) : 0;
          
          return [
            { label: "Total jobs", value: formatNumber(totals.totalJobs), sub: "Across all queues", icon: "📊", tone: "default" as const, progress: 100, progressColor: "bg-accent/50" },
            { label: "Failed", value: formatNumber(totals.failed), sub: `Failure rate ${formatPercent(totals.failureRate)}`, icon: "❌", tone: totals.failed > 0 ? "danger" as const : "default" as const, progress: progressFailed, progressColor: "bg-red-500" },
            { label: "Success rate", value: formatPercent(totals.successRate), sub: "Completed / total", icon: "✅", tone: totals.successRate > 90 ? "success" as const : totals.failureRate > 10 ? "danger" as const : "default" as const, progress: progressSuccess, progressColor: "bg-accent" },
            { label: "Active / stalled", value: `${formatNumber(totals.active)} / ${formatNumber(totals.stalled)}`, sub: "Currently in-flight vs stalled", icon: totals.stalled > 0 ? "⚠️" : "⚡", tone: totals.stalled > 0 ? "warning" as const : "default" as const, progress: progressActive, progressColor: totals.stalled > 0 ? "bg-yellow-400" : "bg-accent/50" },
          ];
        })().map((stat, idx) => (
          <div key={stat.label} className={`card-hover group rounded-xl border border-border bg-surface p-5 ${idx === 0 ? 'animate-fade-in-up' : idx === 1 ? 'animate-fade-in-up-delay-1' : idx === 2 ? 'animate-fade-in-up-delay-2' : 'animate-fade-in-up-delay-3'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <span className="text-base">{stat.icon}</span>
                  {stat.label}
                </div>
                <div className={`mt-2 text-3xl font-semibold tracking-tight ${
                  stat.tone === 'danger' ? 'text-red-400' : 
                  stat.tone === 'success' ? 'text-accent' : 
                  stat.tone === 'warning' ? 'text-yellow-400' : 
                  'text-text-primary'
                }`}>
                  {stat.value}
                </div>
              </div>
              {/* Mini indicator */}
              <div className="h-10 w-10 shrink-0 rounded-lg bg-surface/60 border border-border flex items-center justify-center text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.tone === 'danger' ? '📈' : stat.tone === 'success' ? '🎯' : '📉'}
              </div>
            </div>
            <div className="mt-3 text-xs text-text-muted">{stat.sub}</div>
            {/* Progress bar — data-driven width */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.progressColor}`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Queues</CardTitle>
            <CardDescription>Health updates live as events arrive (≤3s).</CardDescription>
          </CardHeader>
          <CardContent>
            {!queues || queues.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="text-4xl">📡</div>
                <div>
                  <p className="text-sm font-medium text-text-primary">No queues detected yet</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Install the Qcanary agent in your BullMQ service and start sending events.
                    Once events arrive, your queues will show up here in real-time.
                  </p>
                </div>
                <a
                  href="https://github.com/qcanary/qcanary#quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-xs font-medium text-text-primary hover:bg-surface/80 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  View setup guide
                </a>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Jobs</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Failure rate</TableHead>
                    <TableHead className="text-right">Last event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queues.map((q) => (
                    <TableRow key={`${projectId}-${q.queueName}`}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/${projectId}/queues/${encodeURIComponent(q.queueName)}`}
                          className="hover:underline"
                        >
                          {q.queueName}
                        </Link>
                        <div className="mt-1 text-xs text-text-muted">
                          Avg duration {q.avgDurationMs === null ? "—" : `${formatNumber(q.avgDurationMs)}ms`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(q)}>{healthLabel(q)}</Badge>
                        {q.stalled > 0 && (
                          <span className="ml-2 text-xs text-text-muted">
                            stalled {formatNumber(q.stalled)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(q.totalJobs)}</TableCell>
                      <TableCell className="text-right">{formatNumber(q.failed)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(q.failureRate > 0 ? "text-red-200" : "text-text-muted")}>
                          {formatPercent(q.failureRate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-text-muted">{formatRelativeOrIso(q.lastEventAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent failures</CardTitle>
            <CardDescription>Latest failed jobs across all queues.</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentFailures || recentFailures.length === 0 ? (
              <div className="text-sm text-text-muted">No failures yet.</div>
            ) : (
              <div className="space-y-4">
                {recentFailures.slice(0, 8).map((f) => (
                  <div key={f.id} className="rounded-md border border-border bg-surface/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-text-primary">
                          {f.job_name ?? "Unnamed job"}
                          <span className="text-text-muted"> · </span>
                          <span className="font-mono text-xs text-text-muted">{f.job_id}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                          <Badge variant="danger">failed</Badge>
                          <span className="truncate">
                            <span className="text-text-muted">queue</span>{" "}
                            <span className="text-text-primary">{f.queue_name}</span>
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-text-muted">{formatRelativeOrIso(f.timestamp)}</div>
                    </div>
                    {f.error_message && (
                      <div className="mt-2 line-clamp-2 text-xs text-text-muted">{f.error_message}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

