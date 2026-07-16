"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingCheckoutClient() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const plan =
    planParam === "business"
      ? "Business"
      : planParam === "solo"
        ? "Solo"
        : "Team";
  const status = searchParams.get("status");

  return (
    <main className="min-h-screen bg-bg px-6 py-16 text-text-primary">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <BrandLockup href="/" size="md" className="w-fit" />

        {status === "complete" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-accent">Payment complete!</CardTitle>
              <CardDescription>
                Your {plan} subscription is now active. You can manage billing from the settings page.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {status === "error" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-400">Payment failed</CardTitle>
              <CardDescription>
                There was a problem processing your payment. Please try again or contact support.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {status === "cancelled" && (
          <Card>
            <CardHeader>
              <CardTitle>Checkout cancelled</CardTitle>
              <CardDescription>
                You cancelled the checkout process. No charges were made. You can upgrade at any time from your settings page.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Complete billing checkout</CardTitle>
            <CardDescription>
              Dodo Payments handles secure checkout for your {plan} subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-text-muted">
              <div className="mb-2 flex items-center gap-2 text-accent">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Secure payment</span>
              </div>
              <p>
                Your payment is processed securely through Dodo Payments. We never store your payment details.
                After checkout, you&apos;ll be redirected back to the settings page where your plan will be updated automatically.
              </p>
            </div>

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
