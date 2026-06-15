import { Suspense } from "react";

import { BillingCheckoutClient } from "./BillingCheckoutClient";

export default function BillingCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <BillingCheckoutClient />
    </Suspense>
  );
}
