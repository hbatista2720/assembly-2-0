"use client";

import CartContent from "../../../../../components/CartContent";

const SUBSCRIPTION_HREF = "/dashboard/admin-ph/subscription";

export default function SubscriptionCartPage() {
  return (
    <main className="container" style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px" }}>
      <CartContent
        backHref={SUBSCRIPTION_HREF}
        backLabel="← Volver a Suscripciones"
        checkoutHref="/checkout?from=cart&from_dashboard=1"
      />
    </main>
  );
}
