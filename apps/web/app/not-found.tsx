import Link from "next/link";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

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
