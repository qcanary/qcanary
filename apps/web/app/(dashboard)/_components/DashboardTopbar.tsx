"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export function DashboardTopbar() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <div className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {publishableKey ? (
          <>
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "text-text-primary",
                },
              }}
            />
            <UserButton />
          </>
        ) : (
          <div className="text-sm text-text-muted">Clerk not configured</div>
        )}
      </div>
    </div>
  );
}

