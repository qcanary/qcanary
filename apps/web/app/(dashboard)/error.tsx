"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <div className="mb-2 text-4xl">⚠️</div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred in the dashboard. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-code-bg p-3 text-xs text-text-muted">
            <code>{error.message || "Unknown error"}</code>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Link href="/onboarding">
              <Button variant="secondary">Go to onboarding</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
