import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonPulse({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface/70 border border-border/60",
        className,
      )}
      style={style}
    />
  );
}

interface RowSkeletonProps {
  rows?: number;
  className?: string;
}

export function RowSkeleton({ rows = 3, className }: RowSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonPulse className="h-4 w-4 rounded-full" />
          <SkeletonPulse className="h-4 flex-1" />
          <SkeletonPulse className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-5 w-32" />
        <SkeletonPulse className="h-5 w-16" />
      </div>
      <div className="mt-4 space-y-3">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6",
        className,
      )}
    >
      <SkeletonPulse className="mb-6 h-5 w-40" />
      <div className="flex items-end gap-2" style={{ height: 180 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonPulse
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${Math.max(20, Math.random() * 100 + 30)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
