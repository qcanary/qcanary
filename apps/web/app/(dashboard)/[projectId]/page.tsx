/**
 * Project overview page
 * Full implementation: Session 13
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-text-muted">
          Project: <span className="font-mono text-text-primary">{params.projectId}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-muted">Loading…</CardTitle>
              <CardDescription className="sr-only">Metric placeholder</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-3 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queues</CardTitle>
          <CardDescription>Queue health will appear here once events start flowing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
