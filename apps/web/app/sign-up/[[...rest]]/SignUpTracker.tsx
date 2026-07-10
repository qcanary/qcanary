"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/PostHogProvider";

/**
 * Client component that fires analytics events on the sign-up page.
 * Renders nothing — just fires a page_viewed event via useEffect.
 * Sign-up completion is tracked on the /onboarding page after redirect.
 */
export function SignUpTracker() {
  useEffect(() => {
    trackEvent("sign_up_page_viewed");
  }, []);

  return null;
}
