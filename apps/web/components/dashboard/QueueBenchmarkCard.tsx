"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Assessment = "excellent" | "good" | "average" | "warning" | "critical";

interface MetricComparison {
  value: number | null;
  percentile: number;
  assessment: Assessment;
  message: string;
}

interface BenchmarkData {
  available: boolean;
  message?: string;
  queue?: {
    name: string;
    category: string;
    metrics: Record<string, number | null>;
  };
  benchmark?: {
    category: string;
    sampleSize: number;
    calculatedAt: string | null;
  };
  comparison?: Record<string, MetricComparison>;
}

const ASSESSMENT_COLORS: Record<Assessment, { bg: string; text: string; bar: string }> = {
  excellent: { bg: "bg-accent/10", text: "text-accent", bar: "bg-accent" },
  good: { bg: "bg-blue-500/10", text: "text-blue-400", bar: "bg-blue-500" },
  average: { bg: "bg-gray-500/10", text: "text-gray-400", bar: "bg-gray-500" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-400", bar: "bg-yellow-500" },
  critical: { bg: "bg-red-500/10", text: "text-red-400", bar: "bg-red-500" },
};

const METRIC_LABELS: Record<string, string> = {
  failure_rate: "Failure Rate",
  stall_rate: "Stall Rate",
  avg_duration_ms: "Avg Duration",
  duration_stddev_ms: "Duration Variance",
  throughput: "Throughput",
  retry_rate: "Retry Rate",
};

function formatMetricValue(metricName: string, value: number | null): string {
  if (value === null) return "—";
  if (metricName === "failure_rate" || metricName === "stall_rate" || metricName === "retry_rate") {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (metricName === "avg_duration_ms" || metricName === "duration_stddev_ms") {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
    return `${Math.round(value)}ms`;
  }
  if (metricName === "throughput") {
    return `${Math.round(value)}/hr`;
  }
  return String(value);
}

function AssessmentBadge({ assessment }: { assessment: Assessment }) {
  const colors = ASSESSMENT_COLORS[assessment];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}>
      {assessment === "excellent" && "✅"}
      {assessment === "good" && "👍"}
      {assessment === "average" && "👌"}
      {assessment === "warning" && "⚠️"}
      {assessment === "critical" && "🚨"}
      <span className="ml-1">{assessment}</span>
    </span>
  );
}

export function QueueBenchmarkCard({ projectId, queueName }: { projectId: string; queueName: string }) {
  const [data, setData] = React.useState<BenchmarkData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/benchmark`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled && json.success) {
          setData(json.data);
        } else if (!cancelled) {
          setError("Failed to load benchmark");
        }
      } catch {
        if (!cancelled) setError("Failed to load benchmark");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [projectId, queueName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue Health Benchmark</CardTitle>
          <CardDescription>
            {data?.message || "Loading..."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data.comparison || Object.keys(data.comparison).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue Health Benchmark</CardTitle>
          <CardDescription>
            Not enough data yet for {data.benchmark?.category} queues.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const comparisonEntries = Object.entries(data.comparison);
  const sampleSize = data.benchmark?.sampleSize ?? 0;
  const calculatedAt = data.benchmark?.calculatedAt;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Queue Health Benchmark
          {data.queue?.category && (
            <span className="text-xs font-normal text-text-muted bg-surface/50 rounded-full px-2 py-0.5">
              {data.queue.category}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Compared to {sampleSize} similar {data.queue?.category} queues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisonEntries.map(([metricName, comp]) => {
            const assessmentColors = ASSESSMENT_COLORS[comp.assessment];
            return (
              <div key={metricName}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-primary">
                    {METRIC_LABELS[metricName] || metricName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {formatMetricValue(metricName, comp.value)}
                    </span>
                    <AssessmentBadge assessment={comp.assessment} />
                  </div>
                </div>
                {/* Percentile bar */}
                <div className="relative h-2 w-full rounded-full bg-border/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${assessmentColors.bar}`}
                    style={{ width: `${comp.percentile}%` }}
                  />
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-text-muted">
                  <span>{comp.percentile}th percentile</span>
                  <span className="italic">{comp.message}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-text-muted/60">
          <span>
            Last updated: {calculatedAt ? new Date(calculatedAt).toLocaleDateString() : "—"}
          </span>
          <span>Sample: {sampleSize} queues</span>
        </div>

        <p className="mt-2 text-[9px] text-text-muted/40 italic">
          Benchmarks are calculated from anonymized data across all QCanary users.
          Your specific queue data is never shared.
        </p>
      </CardContent>
    </Card>
  );
}
