"use client";

import * as React from "react";

type AnomalyStatus = "healthy" | "warning" | "critical" | "building_baseline";

interface AnomalyBadgeProps {
  status: AnomalyStatus;
  anomalyCount?: number;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  AnomalyStatus,
  { dot: string; label: string; pulse: boolean }
> = {
  healthy: {
    dot: "bg-accent",
    label: "Healthy",
    pulse: false,
  },
  warning: {
    dot: "bg-yellow-400",
    label: "Warning",
    pulse: true,
  },
  critical: {
    dot: "bg-red-500",
    label: "Critical",
    pulse: true,
  },
  building_baseline: {
    dot: "bg-gray-400",
    label: "Building baseline...",
    pulse: false,
  },
};

export function AnomalyBadge({
  status,
  anomalyCount,
  className = "",
  showLabel = true,
}: AnomalyBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        status === "critical"
          ? "bg-red-500/10 text-red-400"
          : status === "warning"
            ? "bg-yellow-500/10 text-yellow-400"
            : status === "building_baseline"
              ? "bg-gray-500/10 text-gray-400"
              : "bg-accent/10 text-accent"
      } ${className}`}
      title={
        status === "building_baseline"
          ? "Not enough data yet for anomaly detection. Data is being collected."
          : status === "critical"
            ? `Critical anomalies detected${anomalyCount ? ` (${anomalyCount})` : ""}`
            : status === "warning"
              ? `Warning-level anomalies detected${anomalyCount ? ` (${anomalyCount})` : ""}`
              : "No anomalies detected"
      }
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot} ${
          config.pulse ? "animate-pulse" : ""
        }`}
      />
      {showLabel && <span>{config.label}</span>}
      {anomalyCount !== undefined && anomalyCount > 0 && (
        <span className="tabular-nums">({anomalyCount})</span>
      )}
    </span>
  );
}

/**
 * Hook to fetch anomaly status for a queue from the API.
 */
export function useAnomalyStatus(
  projectId: string,
  queueName: string
): {
  status: AnomalyStatus;
  anomalyCount: number;
  loading: boolean;
  error: string | null;
} {
  const [status, setStatus] = React.useState<AnomalyStatus>("building_baseline");
  const [anomalyCount, setAnomalyCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch(
          `/api/v1/projects/${projectId}/queues/${encodeURIComponent(queueName)}/anomalies`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled && json.success) {
          setStatus(json.data.status);
          setAnomalyCount(json.data.anomalyCount ?? 0);
          setError(null);
        } else if (!cancelled) {
          setError("Failed to load anomaly status");
        }
      } catch {
        if (!cancelled) setError("Failed to load anomaly status");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchStatus();

    // Poll every 60 seconds for real-time-ish updates
    const interval = setInterval(fetchStatus, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId, queueName]);

  return { status, anomalyCount, loading, error };
}
