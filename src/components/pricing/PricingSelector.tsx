"use client";

import { useMemo, useState } from "react";
import { PLANS, Plan } from "../../lib/types/pricing";

const PH_PLANS = ["EVENTO_UNICO", "DUO_PACK", "STANDARD"];
const ADMIN_PLANS = ["MULTI_PH_LITE", "MULTI_PH_PRO", "ENTERPRISE"];

export default function PricingSelector() {
  const [userType, setUserType] = useState<"ph" | "admin">("ph");

  const plans = useMemo(() => {
    const allowed = userType === "ph" ? PH_PLANS : ADMIN_PLANS;
    return PLANS.filter((plan) => allowed.includes(plan.id));
  }, [userType]);

  return (
    <section className="section">
      <div className="card" style={{ padding: "20px" }}>
        <h2 style={{ marginTop: 0 }}>Selecciona tu perfil</h2>
        <p className="muted" style={{ marginTop: "6px" }}>
          Ajustamos los planes segun tu tipo de operacion.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <button
            className={`btn ${userType === "ph" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setUserType("ph")}
          >
            🏢 Soy un PH
          </button>
          <button
            className={`btn ${userType === "admin" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setUserType("admin")}
          >
            🏛️ Soy Administradora/Promotora
          </button>
        </div>
      </div>

      <div className="pricing-grid" style={{ marginTop: "20px" }}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`pricing-card ${plan.badge ? "highlight" : ""}`}
      style={{
        border: plan.badge ? "1px solid rgba(99, 102, 241, 0.7)" : "1px solid rgba(148,163,184,0.2)",
        boxShadow: plan.badge ? "0 22px 60px rgba(99, 102, 241, 0.35)" : "none",
        background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginTop: 0 }}>{plan.displayName}</h3>
        {plan.badge ? <span className="pill">{plan.badge}</span> : null}
      </div>
      <p style={{ color: "#cbd5f5" }}>{plan.tagline}</p>
      <p style={{ fontSize: "26px", margin: "12px 0" }}>
        ${plan.price}
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{plan.billing === "monthly" ? "/mes" : " pago unico"}</span>
      </p>
      <div className="card-list">
        {plan.features.slice(0, 5).map((feature) => (
          <div key={feature} className="list-item">
            <span>•</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>
      {plan.restrictions?.length ? (
        <div className="card-list" style={{ marginTop: "12px" }}>
          {plan.restrictions.map((restriction) => (
            <div key={restriction} className="list-item">
              <span>⚠️</span>
              <span>{restriction}</span>
            </div>
          ))}
        </div>
      ) : null}
      <a
        className={`btn ${plan.ctaVariant === "primary" ? "btn-primary" : "btn-ghost"}`}
        href={plan.id === "ENTERPRISE" ? "/login" : `/checkout?plan=${plan.id}`}
      >
        {plan.cta}
      </a>
    </div>
  );
}
