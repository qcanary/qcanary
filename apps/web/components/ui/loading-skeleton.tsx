"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — a base loading placeholder with shimmer animation.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface/50",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-accent/[0.04] before:to-transparent before:animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

// ── Text skeletons ───────────────────────────────────

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// ── Card skeleton ────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-6", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="mt-1.5 h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// ── Queue stat card skeleton ─────────────────────────

function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-7 w-20" />
      <Skeleton className="mt-1 h-2 w-full rounded-full" />
    </div>
  );
}

// ── Table row skeleton ───────────────────────────────

function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 border-b border-border px-4 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-1/3" : "flex-1"
          )}
        />
      ))}
    </div>
  );
}

// ── Queue detail skeleton ────────────────────────────

function SkeletonQueueDetail({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Chart area */}
      <Skeleton className="h-64 w-full" />

      {/* Table */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border bg-surface/40 px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonQueueDetail,
};
