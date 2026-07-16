"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type AnomalyStatus = "healthy" | "warning" | "critical" | "building_baseline";

interface AnomalyDetectionResult {
  rule_name: string;
  rule_description: string;
  severity: "critical" | "warning";
  metric_name: string;
  current_value: number;
  baseline_value: number;
  threshold_multiplier: number;
  queue_name: string;
}

interface AnomalyStatusResponse {
  status: AnomalyStatus;
  anomalyCount: number;
  anomalies: AnomalyDetectionResult[];
  buildingBaseline: boolean;
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    variant: "danger" as const,
    icon: "🚨",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  warning: {
    label: "Warning",
    variant: "default" as const,
    icon: "⚠️",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
  },
};

const METRIC_LABELS: Record<string, string> = {
  throughput: "Throughput",
  failure_rate: "Failure Rate",
  queue_depth: "Queue Depth",
  avg_duration: "Avg Duration",
  retry_rate: "Retry Rate",
};

function formatMetricValue(metricName: string, value: number): string {
  if (metricName === "failure_rate" || metricName === "retry_rate") {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (metricName === "avg_duration") {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
    return `${Math.round(value)}ms`;
  }
  if (metricName === "throughput") {
    return `${Math.round(value)}/hr`;
  }
  if (metricName === "queue_depth") {
    return String(Math.round(value));
  }
  return String(value);
}

function AnomalySeverityBadge({ severity }: { severity: "critical" | "warning" }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Badge variant={config.variant}>
      {config.icon} {config.label}
    </Badge>
  );
}

function AnomalyCard({
  anomaly,
}: {
  anomaly: AnomalyDetectionResult;
}) {
  const config = SEVERITY_CONFIG[anomaly.severity];

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{anomaly.rule_name}</span>
            <AnomalySeverityBadge severity={anomaly.severity} />
          </div>
          <p className="mt-1 text-xs text-text-muted">{anomaly.rule_description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md bg-surface/30 p-2.5 text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Current</div>
          <div className={`mt-1 text-sm font-semibold ${config.text}`}>
            {formatMetricValue(anomaly.metric_name, anomaly.current_value)}
          </div>
        </div>
        <div className="rounded-md bg-surface/30 p-2.5 text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Baseline</div>
          <div className="mt-1 text-sm font-semibold text-text-primary">
            {formatMetricValue(anomaly.metric_name, anomaly.baseline_value)}
          </div>
        </div>
        <div className="rounded-md bg-surface/30 p-2.5 text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Deviation</div>
          <div className={`mt-1 text-sm font-semibold ${config.text}`}>
            {anomaly.threshold_multiplier.toFixed(1)}x
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-text-muted">
        <span className="rounded bg-surface/30 px-1.5 py-0.5 font-mono">
          {METRIC_LABELS[anomaly.metric_name] || anomaly.metric_name}
        </span>
        <span>·</span>
        <span>Queue: {anomaly.queue_name}</span>
      </div>
    </div>
  );
}

export function AnomalyDetailPanel({
  projectId,
  queueName,
}: {
  projectId: string;
  queueName: string;
}) {
  return (
    <ErrorBoundary>
      <AnomalyDetailPanelInner projectId={projectId} queueName={queueName} />
    </ErrorBoundary>
  );
}

function AnomalyDetailPanelInner({
  projectId,
  queueName,
}: {
  projectId: string;
  queueName: string;
}) {
  const [data, setData] = React.useState<AnomalyStatusResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/anomalies`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled && json.success) {
          setData(json.data);
        } else if (!cancelled) {
          setError("Failed to load anomaly data");
        }
      } catch {
        if (!cancelled) setError("Failed to load anomaly data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    // Refresh every 30 seconds
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId, queueName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
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

  if (!data) {
    return null;
  }

  if (data.buildingBaseline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anomaly Detection</CardTitle>
          <CardDescription>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
              Building baseline...
            </span>
            <span className="ml-2">
              Data is being collected for anomaly detection. Baselines become reliable
              after 3 days of queue activity.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (data.anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Anomaly Detection
            <Badge variant="success">Healthy</Badge>
          </CardTitle>
          <CardDescription>
            No anomalies detected. Queue is operating within normal parameters.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Anomaly Detection</CardTitle>
            <CardDescription>
              {data.anomalyCount} anomaly{data.anomalyCount !== 1 ? "ies" : "y"} detected for this queue
            </CardDescription>
          </div>
          <Badge
            variant={data.status === "critical" ? "danger" : "warning"}
            className="text-xs"
          >
            {data.status === "critical" ? "🚨 Critical" : "⚠️ Warning"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.anomalies.map((anomaly, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <Separator />}
            <AnomalyCard anomaly={anomaly} />
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
