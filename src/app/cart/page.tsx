"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CartContent from "../../components/CartContent";

const SUBSCRIPTION_HREF = "/dashboard/admin-ph/subscription";
const LOGIN_REDIRECT = "/login?redirect=" + encodeURIComponent(SUBSCRIPTION_HREF);

export default function CartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(LOGIN_REDIRECT);
  }, [router]);

  return (
    <main className="container" style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px" }}>
      <p className="muted">Redirigiendo a acceso seguro… El carrito está disponible dentro del dashboard tras iniciar sesión.</p>
    </main>
  );
}
