import { CardSkeleton, RowSkeleton } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface/70" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-surface/50" />
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 h-5 w-32 animate-pulse rounded-lg bg-surface/70" />
        <RowSkeleton rows={5} />
      </div>
    </div>
  );
}
