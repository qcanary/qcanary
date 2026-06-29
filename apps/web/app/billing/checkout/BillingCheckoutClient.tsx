"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingCheckoutClient() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "pro" ? "Pro" : "Starter";

  return (
    <main className="min-h-screen bg-bg px-6 py-16 text-text-primary">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <BrandLockup href="/" size="md" className="w-fit" />

        <Card>
          <CardHeader>
            <CardTitle>Complete billing checkout</CardTitle>
            <CardDescription>
              Dodo Payments handles secure checkout for your {plan} subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-muted">
              Start checkout from Settings and QCanary will redirect you to the secure Dodo Payments page.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/settings">
                <Button>Go to settings</Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary">View docs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
