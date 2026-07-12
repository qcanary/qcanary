"use client";

import { useEffect } from "react";

/**
 * Captures a ?coupon=XXX URL parameter and persists it to sessionStorage
 * so it survives the Clerk sign-up redirect chain.
 *
 * Renders nothing — purely a side-effect component.
 */
export function CouponCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coupon = params.get("coupon");
    if (coupon) {
      sessionStorage.setItem("qcanary_coupon", coupon.toUpperCase());
    }
  }, []);
  return null;
}
