import { Skeleton, SkeletonCard, SkeletonTableRow } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Page header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
        <SkeletonTableRow />
      </div>
    </div>
  );
}
