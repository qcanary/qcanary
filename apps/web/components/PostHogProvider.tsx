"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

/**
 * Track a custom event with optional properties.
 * Safe to call anywhere — no-ops if PostHog isn't initialized.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  try {
    if (posthog.__loaded) {
      posthog.capture(event, properties);
    }
  } catch {
    // silently fail — analytics are non-critical
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && !posthog.__loaded && POSTHOG_KEY) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        autocapture: true,
        loaded: (ph) => {
          ph.register_for_session({ project_id: "459800" });
        },
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
