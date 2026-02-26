"use client";

import CartContent from "../../components/CartContent";

const SUBSCRIPTION_HREF = "/dashboard/admin-ph/subscription";

export default function CartPage() {
  return (
    <main className="container" style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px" }}>
      <CartContent
        backHref={SUBSCRIPTION_HREF}
        backLabel="← Suscripciones"
        checkoutHref="/checkout?from=cart&from_dashboard=1"
      />
    </main>
  );
}
