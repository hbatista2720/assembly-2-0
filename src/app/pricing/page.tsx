"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PricingSelector from "../../components/pricing/PricingSelector";
import ROICalculator from "../../components/pricing/ROICalculator";
import EnterprisePlanCard from "../../components/pricing/EnterprisePlanCard";
import { getPlanVisibility } from "../../lib/planVisibility";

const DASHBOARD_SUBSCRIPTION = "/dashboard/admin-ph/subscription";
const LOGIN_REDIRECT = "/login?redirect=" + encodeURIComponent(DASHBOARD_SUBSCRIPTION);

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDashboardPh = searchParams.get("from") === "dashboard-admin-ph";
  const [showEnterprise, setShowEnterprise] = useState(true);

  useEffect(() => {
    setShowEnterprise(getPlanVisibility().ENTERPRISE);
  }, []);

  useEffect(() => {
    if (!fromDashboardPh) {
      router.replace(LOGIN_REDIRECT);
    }
  }, [fromDashboardPh, router]);

  if (!fromDashboardPh) {
    return (
      <main className="container">
        <div className="card" style={{ padding: "28px", marginBottom: "16px" }}>
          <p className="muted">Redirigiendo… Crea tu cuenta o inicia sesión para ver planes y suscripciones en el dashboard.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <a className="btn btn-ghost" href="/dashboard/admin-ph">
          ← Volver al Panel de la Comunidad
        </a>
        <Link className="btn btn-ghost" href={DASHBOARD_SUBSCRIPTION} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          🛒 Suscripciones y carrito
        </Link>
      </div>
      <section className="card" style={{ padding: "28px", marginBottom: "16px" }}>
        <span className="pill">Precios v4.0</span>
        <h1 style={{ margin: "12px 0 8px" }}>Planes y suscripciones</h1>
        <p className="muted" style={{ margin: 0 }}>
          Matriz oficial con límites por comunidad, residentes y asambleas.
        </p>
      </section>

      <PricingSelector />

      <ROICalculator />

      {showEnterprise && (
        <section className="section">
          <h2 className="section-title">Plan Enterprise premium</h2>
          <p className="section-subtitle">Para promotoras grandes con necesidad de escalamiento ilimitado.</p>
          <div className="pricing-grid">
            <EnterprisePlanCard />
          </div>
        </section>
      )}
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="card" style={{ padding: "28px", marginBottom: "16px" }}>
          <p className="muted">Cargando…</p>
        </div>
      </main>
    }>
      <PricingContent />
    </Suspense>
  );
}
