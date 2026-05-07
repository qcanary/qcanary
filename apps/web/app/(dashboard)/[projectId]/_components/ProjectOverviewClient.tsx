"use client";

import Link from "next/link";
import * as React from "react";
import { useAuth } from "@clerk/nextjs";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createAuthedSupabaseClient } from "@/lib/supabaseClient";

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
  const { getToken } = useAuth();

  const [queues, setQueues] = React.useState<QueueSummary[] | null>(null);
  const [recentFailures, setRecentFailures] = React.useState<JobEventRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshQueues = React.useCallback(async () => {
    const res = await fetch(`/api/v1/projects/${projectId}/queues`, { cache: "no-store" });
    const json = (await res.json()) as QueuesOk | ApiError;
    if (!json.success) {
      throw new Error(json.error.message);
    }
    setQueues(json.data.queues);
  }, [projectId]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await refreshQueues();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load project data.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
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
          .subscribe();

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
        <div className="text-xs text-text-muted">{loading ? "Loading…" : "Live"}</div>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t load dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Total jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatNumber(totals.totalJobs)}</div>
            <div className="mt-2 text-sm text-text-muted">Across all queues</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatNumber(totals.failed)}</div>
            <div className="mt-2 text-sm text-text-muted">Failure rate {formatPercent(totals.failureRate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Success rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatPercent(totals.successRate)}</div>
            <div className="mt-2 text-sm text-text-muted">Completed / total</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted">Active / stalled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {formatNumber(totals.active)} <span className="text-text-muted">/</span> {formatNumber(totals.stalled)}
            </div>
            <div className="mt-2 text-sm text-text-muted">Currently in-flight vs stalled</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Queues</CardTitle>
            <CardDescription>Health updates live as events arrive (≤3s).</CardDescription>
          </CardHeader>
          <CardContent>
            {!queues || queues.length === 0 ? (
              <div className="text-sm text-text-muted">
                No queues yet. Install the agent and start sending events, then refresh.
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
                    <TableRow key={q.queueName}>
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

