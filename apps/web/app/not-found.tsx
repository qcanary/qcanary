"use client";

import Link from "next/link";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";

/**
 * Global 404 page.
 * Next.js automatically sets HTTP 404 status when this component is rendered.
 * Title inherits from root layout ("404 | QCanary").
 */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-text-primary">
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandLockup href="/" size="md" />
        <div className="space-y-2">
          <h1 className="text-6xl font-semibold tracking-tight text-accent">404</h1>
          <p className="text-xl text-text-muted">Page not found</p>
          <p className="max-w-md text-sm text-text-muted">
            The page you are looking for doesn&rsquo;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface/80 transition-colors"
          >
            Go back
          </button>
          <Link href="/">
            <Button>Go home</Button>
          </Link>
          <Link href="/docs">
            <Button variant="secondary">View docs</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
