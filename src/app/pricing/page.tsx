"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PricingSelector from "../../components/pricing/PricingSelector";
import ROICalculator from "../../components/pricing/ROICalculator";
import EnterprisePlanCard from "../../components/pricing/EnterprisePlanCard";
import CartNavLink from "../../components/CartNavLink";

function PricingContent() {
  const searchParams = useSearchParams();
  const fromDashboardPh = searchParams.get("from") === "dashboard-admin-ph";

  return (
    <main className="container">
      <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        {fromDashboardPh && (
          <a className="btn btn-ghost" href="/dashboard/admin-ph">
            ← Volver al Panel de la Comunidad
          </a>
        )}
        <CartNavLink variant="button" />
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

      <section className="section">
        <h2 className="section-title">Plan Enterprise premium</h2>
        <p className="section-subtitle">Para promotoras grandes con necesidad de escalamiento ilimitado.</p>
        <div className="pricing-grid">
          <EnterprisePlanCard />
        </div>
      </section>
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
