"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAuthedSupabaseClient } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type ApiError = { success: false; error: { code: string; message: string } };

type Period = "7d" | "30d";

type MetricsPoint = {
  hour: string;
  completed: number;
  failed: number;
  stalled: number;
  totalJobs: number;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
};

type QueueMetricsOk = {
  success: true;
  data: {
    queueName: string;
    period: "24h" | "7d" | "30d";
    points: MetricsPoint[];
    summary: {
      totalJobs: number;
      completed: number;
      failed: number;
      stalled: number;
      failureRate: number;
    };
  };
};

type JobListItem = {
  id: number;
  jobId: string;
  jobName: string | null;
  eventType: string;
  status: string;
  durationMs: number | null;
  attempts: number | null;
  errorMessage: string | null;
  environment: string | null;
  timestamp: string;
  createdAt: string;
};

type JobEventRealtimeRow = {
  id: number;
  project_id: string;
  queue_name: string;
  job_id: string;
  job_name: string | null;
  event_type: string;
  status: string;
  duration_ms: number | null;
  attempts: number | null;
  error_message: string | null;
  environment: string | null;
  timestamp: string;
  created_at: string;
};

type QueueJobsOk = {
  success: true;
  data: {
    queueName: string;
    jobs: JobListItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    filters: { status: string | null };
  };
};

type JobDetailOk = {
  success: true;
  data: {
    job: {
      id: number;
      jobId: string;
      jobName: string | null;
      queueName: string;
      eventType: string;
      status: string;
      durationMs: number | null;
      attempts: number | null;
      errorMessage: string | null;
      errorStack: string | null;
      environment: string | null;
      timestamp: string;
      createdAt: string;
    };
    history: Array<{
      id: number;
      eventType: string;
      status: string;
      durationMs: number | null;
      attempts: number | null;
      errorMessage: string | null;
      timestamp: string;
    }>;
  };
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

function statusBadgeVariant(status: string): "success" | "danger" | "muted" {
  if (status === "failed") return "danger";
  if (status === "completed") return "success";
  return "muted";
}

function axisHourLabel(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`;
}

function safeDuration(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toJobListItem(row: JobEventRealtimeRow): JobListItem {
  return {
    id: row.id,
    jobId: row.job_id,
    jobName: row.job_name,
    eventType: row.event_type,
    status: row.status,
    durationMs: row.duration_ms,
    attempts: row.attempts,
    errorMessage: row.error_message,
    environment: row.environment,
    timestamp: row.timestamp,
    createdAt: row.created_at,
  };
}

function JobDetailDialog({
  open,
  onOpenChange,
  projectId,
  queueName,
  jobId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  queueName: string;
  jobId: string | null;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<JobDetailOk["data"] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !jobId) return;
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const res = await fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/jobs/${encodeURIComponent(jobId)}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as JobDetailOk | ApiError;
        if (!json.success) throw new Error(json.error.message);
        if (!cancelled) setData(json.data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load job details.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, jobId, projectId, queueName]);

  const job = data?.job ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="truncate">{job?.jobName ?? jobId ?? "Job"}</span>
            {job?.status && <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {queueName} · {jobId ?? "—"}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {!loading && error && (
          <Card>
            <CardHeader>
              <CardTitle>Couldn’t load job</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !error && job && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-xs text-text-muted">Attempts</div>
                <div className="mt-1 font-mono text-sm text-text-primary">
                  {typeof job.attempts === "number" ? formatNumber(job.attempts) : "—"}
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-xs text-text-muted">Duration</div>
                <div className="mt-1 font-mono text-sm text-text-primary">
                  {typeof job.durationMs === "number" ? `${formatNumber(job.durationMs)}ms` : "—"}
                </div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-xs text-text-muted">Environment</div>
                <div className="mt-1 font-mono text-sm text-text-primary">{job.environment ?? "—"}</div>
              </div>
              <div className="rounded-md border border-border bg-surface/40 p-3">
                <div className="text-xs text-text-muted">Last event</div>
                <div className="mt-1 font-mono text-sm text-text-primary">{formatRelativeOrIso(job.timestamp)}</div>
              </div>
            </div>

            {(job.errorMessage || job.errorStack) && (
              <div className="space-y-3">
                {job.errorMessage && (
                  <div>
                    <div className="mb-2 text-xs text-text-muted">Error message</div>
                    <pre className="whitespace-pre-wrap rounded-md border border-border bg-code-bg p-3 font-mono text-xs text-text-primary">
                      {job.errorMessage}
                    </pre>
                  </div>
                )}
                {job.errorStack && (
                  <div>
                    <div className="mb-2 text-xs text-text-muted">Stack trace</div>
                    <pre className="overflow-auto whitespace-pre-wrap rounded-md border border-border bg-code-bg p-3 font-mono text-xs text-text-primary">
                      {job.errorStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="mb-2 text-xs text-text-muted">Event history</div>
              {!data?.history || data.history.length === 0 ? (
                <div className="text-sm text-text-muted">No history.</div>
              ) : (
                <div className="space-y-2">
                  {data.history.slice(0, 20).map((h) => (
                    <div key={h.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface/40 p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusBadgeVariant(h.status)}>{h.status}</Badge>
                          <span className="truncate font-mono text-xs text-text-muted">{h.eventType}</span>
                        </div>
                        {h.errorMessage && <div className="mt-1 line-clamp-2 text-xs text-text-muted">{h.errorMessage}</div>}
                      </div>
                      <div className="shrink-0 text-xs text-text-muted">{formatRelativeOrIso(h.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function QueueDetailClient({ projectId, queueName }: { projectId: string; queueName: string }) {
  const { getToken } = useAuth();

  const [period, setPeriod] = React.useState<Period>("7d");
  const [status, setStatus] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);

  const [metrics, setMetrics] = React.useState<QueueMetricsOk["data"] | null>(null);
  const [jobs, setJobs] = React.useState<QueueJobsOk["data"] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [metricsError, setMetricsError] = React.useState<string | null>(null);
  const [jobsError, setJobsError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [periodLoading, setPeriodLoading] = React.useState(false);

  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    // Track if this is a period switch (metrics already loaded)
    const isPeriodSwitch = metrics !== null;
    if (isPeriodSwitch) {
      setPeriodLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setMetricsError(null);
    setJobsError(null);

    try {
      const [metricsRes, jobsRes] = await Promise.all([
        fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/metrics?period=${period}`,
          { cache: "no-store" }
        ),
        fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/jobs?page=${page}&limit=${limit}${
            status ? `&status=${encodeURIComponent(status)}` : ""
          }`,
          { cache: "no-store" }
        ),
      ]);

      const [metricsJson, jobsJson] = (await Promise.all([
        metricsRes.json(),
        jobsRes.json(),
      ])) as [QueueMetricsOk | ApiError, QueueJobsOk | ApiError];

      if (!metricsJson.success) {
        setMetricsError(metricsJson.error.message);
      } else {
        setMetrics(metricsJson.data);
      }
      if (!jobsJson.success) {
        setJobsError(jobsJson.error.message);
      } else {
        setJobs(jobsJson.data);
      }

      // If both failed, set a general error
      if (!metricsJson.success && !jobsJson.success) {
        setError("Failed to load queue data.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load queue.";
      setError(message);
      setMetricsError(message);
      setJobsError(message);
    } finally {
      setLoading(false);
      setPeriodLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page, period, projectId, queueName, status]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  // Stable ref for status to avoid channel thrashing on filter change
  const statusRef = React.useRef(status);
  statusRef.current = status;

  React.useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function initRealtime() {
      const token = await getToken().catch(() => null);
      if (!token || cancelled) return;

      const supabase = createAuthedSupabaseClient(token);
      if (!supabase || cancelled) return;

      const channel = supabase
        .channel(`queue-events-${projectId}-${queueName}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "job_events", filter: `project_id=eq.${projectId}` },
          (payload) => {
            const row = payload.new as Partial<JobEventRealtimeRow>;
            if (
              row.project_id !== projectId ||
              row.queue_name !== queueName ||
              typeof row.id !== "number" ||
              typeof row.job_id !== "string" ||
              typeof row.event_type !== "string" ||
              typeof row.status !== "string" ||
              typeof row.timestamp !== "string" ||
              typeof row.created_at !== "string"
            ) {
              return;
            }

            const item = toJobListItem(row as JobEventRealtimeRow);
            const currentStatus = statusRef.current;
            setJobs((prev) => {
              if (!prev || (currentStatus && item.status !== currentStatus)) return prev;
              // Deduplicate by jobId: keep only the latest event per jobId
              const existing = prev.jobs.filter((existing) => existing.jobId !== item.jobId);
              const nextJobs = [item, ...existing].slice(0, prev.pagination.limit);
              return {
                ...prev,
                jobs: nextJobs,
                pagination: {
                  ...prev.pagination,
                  total: prev.pagination.total + 1,
                },
              };
            });

            setMetrics((prev) => {
              if (!prev) return prev;
              const nextSummary = { ...prev.summary };
              if (item.status === "completed") {
                nextSummary.completed += 1;
                nextSummary.totalJobs += 1;
              } else if (item.status === "failed") {
                nextSummary.failed += 1;
                nextSummary.totalJobs += 1;
              } else if (item.status === "stalled") {
                nextSummary.stalled += 1;
                nextSummary.totalJobs += 1;
              }
              nextSummary.failureRate = nextSummary.totalJobs > 0
                ? (nextSummary.failed / nextSummary.totalJobs) * 100
                : 0;
              return {
                ...prev,
                summary: nextSummary,
              };
            });
          }
        )
        .subscribe();

      cleanup = () => {
        void channel.unsubscribe();
      };
    }

    void initRealtime();
    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  // Remove `status` from deps — it's read from a ref to avoid channel thrashing
  }, [getToken, projectId, queueName]);

  React.useEffect(() => {
    setPage(1);
  }, [status, limit, period]);

  const points = metrics?.points ?? [];
  const summary = metrics?.summary ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Queue</h1>
          <p className="mt-2 text-text-muted">
            <span className="font-mono text-text-primary">{queueName}</span>
            <span className="text-text-muted"> · </span>
            project <span className="font-mono text-text-primary">{projectId}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={period === "7d" ? "default" : "secondary"}
            size="sm"
            onClick={() => setPeriod("7d")}
          >
            7d
          </Button>
          <Button
            variant={period === "30d" ? "default" : "secondary"}
            size="sm"
            onClick={() => setPeriod("30d")}
          >
            30d
          </Button>
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <Button variant={!status ? "default" : "secondary"} size="sm" onClick={() => setStatus(null)}>
            All
          </Button>
          <Button
            variant={status === "failed" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatus("failed")}
          >
            Failed
          </Button>
          <Button
            variant={status === "completed" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatus("completed")}
          >
            Completed
          </Button>
          <Button
            variant={status === "active" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={status === "stalled" ? "default" : "secondary"}
            size="sm"
            onClick={() => setStatus("stalled")}
          >
            Stalled
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t load queue</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" onClick={() => void refresh()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {metricsError && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-200">Metrics: {metricsError}</span>
              <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {jobsError && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-200">Jobs: {jobsError}</span>
              <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue stat cards with color-coded values */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(() => {
          const total = summary?.totalJobs ?? 0;
          const failed = summary?.failed ?? 0;
          const completed = summary?.completed ?? 0;
          const stalled = summary?.stalled ?? 0;
          const rate = summary?.failureRate ?? 0;
          
          return [
            { label: `Total jobs (${period})`, value: summary ? formatNumber(total) : "—", sub: "Completed + failed + stalled", icon: "📊", tone: "default" as const, progress: total > 0 ? 100 : 0, progressColor: "bg-accent/50" },
            { label: `Failed (${period})`, value: summary ? formatNumber(failed) : "—", sub: `Failure rate ${summary ? formatPercent(rate) : "—"}`, icon: "❌", tone: failed > 0 ? "danger" as const : "default" as const, progress: total > 0 ? Math.min((failed / total) * 100, 100) : 0, progressColor: "bg-red-500" },
            { label: `Completed (${period})`, value: summary ? formatNumber(completed) : "—", sub: "Successful jobs", icon: "✅", tone: completed > 0 ? "success" as const : "default" as const, progress: total > 0 ? Math.min((completed / total) * 100, 100) : 0, progressColor: "bg-accent" },
            { label: `Stalled (${period})`, value: summary ? formatNumber(stalled) : "—", sub: "Potential issues", icon: stalled > 0 ? "⚠️" : "⚡", tone: stalled > 0 ? "warning" as const : "default" as const, progress: total > 0 ? Math.min((stalled / total) * 100, 100) : 0, progressColor: stalled > 0 ? "bg-yellow-400" : "bg-accent/50" },
          ];
        })().map((stat) => (
          <div key={stat.label} className="card-hover group rounded-xl border border-border bg-surface p-5">
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
              <div className="h-10 w-10 shrink-0 rounded-lg bg-surface/60 border border-border flex items-center justify-center text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.tone === 'danger' ? '📈' : stat.tone === 'success' ? '🎯' : '📉'}
              </div>
            </div>
            <div className="mt-3 text-xs text-text-muted">{stat.sub}</div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border/50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.progressColor}`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job volume</CardTitle>
          <CardDescription>Completed vs failed jobs over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !metrics ? (
            <Skeleton className="h-64 w-full" />
          ) : points.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-3xl">📈</div>
              <div>
                <p className="text-sm font-medium text-text-primary">No metrics yet</p>
                <p className="mt-1 text-xs text-text-muted">
                  Metrics appear as events flow through this queue. The hourly chart will populate once
                  we have enough data for the selected time period.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-64 w-full">
              {periodLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/40 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
                    Loading…
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="failedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={axisHourLabel}
                    minTickGap={28}
                    stroke="rgba(255,255,255,0.25)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="count"
                    stroke="rgba(255,255,255,0.25)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                    width={34}
                  />
                  <YAxis
                    yAxisId="duration"
                    orientation="right"
                    stroke="rgba(255,255,255,0.25)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                    tickFormatter={(value) => `${formatNumber(Number(value))}ms`}
                    width={62}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0F0F0F",
                      border: "1px solid #1F1F1F",
                      borderRadius: 8,
                      color: "#FAFAFA",
                      fontSize: 12,
                    }}
                    labelFormatter={(label) => axisHourLabel(String(label))}
                    formatter={(value, name) => {
                      if (name === "avg duration" || name === "p95 duration") {
                        return [`${formatNumber(Number(value))}ms`, name];
                      }
                      return [formatNumber(Number(value)), name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    yAxisId="count"
                    type="monotone"
                    dataKey="completed"
                    name="completed"
                    stroke="#22C55E"
                    fill="url(#completedFill)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    yAxisId="count"
                    type="monotone"
                    dataKey="failed"
                    name="failed"
                    stroke="#ef4444"
                    fill="url(#failedFill)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="duration"
                    type="monotone"
                    dataKey={(point: MetricsPoint) => safeDuration(point.avgDurationMs)}
                    name="avg duration"
                    stroke="#22C55E"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="duration"
                    type="monotone"
                    dataKey={(point: MetricsPoint) => safeDuration(point.p95DurationMs)}
                    name="p95 duration"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>Click a row to see full error + stack trace.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setLimit(20)} className={cn(limit === 20 && "border-accent/60")}>
              20
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setLimit(50)} className={cn(limit === 50 && "border-accent/60")}>
              50
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setLimit(100)} className={cn(limit === 100 && "border-accent/60")}>
              100
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !jobs ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !jobs || jobs.jobs.length === 0 ? (
            <div className="text-sm text-text-muted">No jobs yet for this filter.</div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Attempts</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.jobs.map((job) => (                        <TableRow
                      key={`${job.id}-${job.jobId}`}
                      className="cursor-pointer hover:bg-surface/60"
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for job ${job.jobName ?? job.jobId}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedJobId(job.jobId);
                          setJobDialogOpen(true);
                        }
                      }}
                      onClick={() => {
                        setSelectedJobId(job.jobId);
                        setJobDialogOpen(true);
                      }}
                    >
                      <TableCell className="min-w-0">
                        <div className="truncate text-sm font-medium text-text-primary">{job.jobName ?? "Unnamed job"}</div>
                        <div className="mt-1 truncate font-mono text-xs text-text-muted">{job.jobId}</div>
                        {job.errorMessage && <div className="mt-1 line-clamp-1 text-xs text-text-muted">{job.errorMessage}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-text-muted">
                        {typeof job.attempts === "number" ? formatNumber(job.attempts) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-text-muted">
                        {typeof job.durationMs === "number" ? `${formatNumber(job.durationMs)}ms` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-text-muted">{formatRelativeOrIso(job.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-text-muted">
                  Page {jobs.pagination.page} of {Math.max(jobs.pagination.totalPages, 1)} ·{" "}
                  {formatNumber(jobs.pagination.total)} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={jobs.pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={jobs.pagination.totalPages === 0 || jobs.pagination.page >= jobs.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <JobDetailDialog
        open={jobDialogOpen}
        onOpenChange={(next) => {
          setJobDialogOpen(next);
          if (!next) setSelectedJobId(null);
        }}
        projectId={projectId}
        queueName={queueName}
        jobId={selectedJobId}
      />
    </div>
  );
}
