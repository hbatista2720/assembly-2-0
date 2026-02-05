"use client";

import PricingSelector from "@/components/pricing/PricingSelector";
import ROICalculator from "@/components/pricing/ROICalculator";
import EnterprisePlanCard from "@/components/pricing/EnterprisePlanCard";

export default function PricingPage() {
  return (
    <main className="container">
      <section className="card" style={{ padding: "28px", marginBottom: "16px" }}>
        <span className="pill">Precios v4.0</span>
        <h1 style={{ margin: "12px 0 8px" }}>Planes y suscripciones</h1>
        <p className="muted" style={{ margin: 0 }}>
          Matriz oficial con limites por PH, residentes y asambleas.
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
