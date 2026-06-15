"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type CheckoutState = "loading" | "ready" | "opening" | "error";

export function BillingCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scriptReady, setScriptReady] = React.useState(false);
  const [state, setState] = React.useState<CheckoutState>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const openedRef = React.useRef(false);

  const subscriptionId = searchParams.get("subscription_id") ?? "";
  const keyId = searchParams.get("key_id") ?? "";
  const plan = searchParams.get("plan") ?? "starter";

  React.useEffect(() => {
    if (!scriptReady) {
      setState("loading");
      return;
    }

    if (!subscriptionId || !keyId) {
      setError("Missing checkout details. Start the upgrade again from Settings.");
      setState("error");
      return;
    }

    setState("ready");
  }, [keyId, scriptReady, subscriptionId]);

  React.useEffect(() => {
    if (state !== "ready" || openedRef.current) {
      return;
    }
    openedRef.current = true;

    if (!window.Razorpay) {
      setError("Razorpay checkout failed to load. Please refresh and try again.");
      setState("error");
      return;
    }

    try {
      const checkout = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "Qcanary",
        description: `${plan === "pro" ? "Pro" : "Starter"} subscription`,
        image: "/favicon.png",
        callback_url: `${window.location.origin}/settings?billing=success&plan=${encodeURIComponent(plan)}`,
        modal: {
          ondismiss: () => {
            router.replace("/settings");
          },
        },
        theme: {
          color: "#22C55E",
        },
      });

      setState("opening");
      checkout.open();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to open Razorpay checkout. Please try again."
      );
      setState("error");
    }
  }, [keyId, plan, router, state, subscriptionId]);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setError("Failed to load Razorpay checkout script. Please try again.");
          setState("error");
        }}
      />
      <main className="min-h-screen bg-bg px-6 py-16 text-text-primary">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
          <BrandLockup href="/" size="md" className="w-fit" />

          <Card>
            <CardHeader>
              <CardTitle>Complete billing checkout</CardTitle>
              <CardDescription>
                We are opening Razorpay to finish your {plan === "pro" ? "Pro" : "Starter"} subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state !== "error" ? (
                <p className="text-sm text-text-muted">
                  {state === "loading" && "Loading secure checkout..."}
                  {state === "ready" && "Preparing checkout..."}
                  {state === "opening" && "If the modal did not open automatically, use the button below."}
                </p>
              ) : (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={!scriptReady || !subscriptionId || !keyId}
                  onClick={() => {
                    openedRef.current = false;
                    setState("ready");
                  }}
                >
                  Open checkout
                </Button>
                <Link href="/settings">
                  <Button variant="secondary">Back to settings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
