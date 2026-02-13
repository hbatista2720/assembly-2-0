"use client";

import { useEffect, useState } from "react";
import { PLANS, Plan } from "../../../../lib/types/pricing";

const PLANES_PAGO_UNICO = PLANS.filter((p) => p.billing === "one-time");
const PLANES_SUSCRIPCION = PLANS.filter((p) => p.billing === "monthly");

export default function SubscriptionPage() {
  const [planActualNombre, setPlanActualNombre] = useState("Standard");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demo =
      typeof window !== "undefined" &&
      (localStorage.getItem("assembly_subscription_id") === "demo-subscription" ||
        new URLSearchParams(window.location.search).get("mode") === "demo");
    setIsDemo(!!demo);
    if (demo) setPlanActualNombre("Plan Demo");
  }, []);

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Tu plan actual</h2>
        <p className="muted" style={{ margin: "0 0 12px" }}>
          Uso y límites de tu suscripción. Puedes cambiar de plan cuando quieras.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: "18px" }}>{planActualNombre}</strong>
            <div className="muted" style={{ fontSize: "14px", marginTop: "4px" }}>
              {isDemo ? "1/1 asambleas · Demo" : "Uso según tu plan · Ver límites abajo"}
            </div>
            {!isDemo && (
              <a href="#mas-residentes" className="muted" style={{ fontSize: "13px", marginTop: "6px", display: "inline-block" }}>
                ¿Necesitas más unidades? Agregar residentes →
              </a>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="#pago-unico">
              Ver planes pago único
            </a>
            <a className="btn btn-ghost" href="#suscripcion">
              Ver planes mensuales
            </a>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: "8px" }} id="pago-unico">
        Planes de pago único
      </h3>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Ideal para 1 o 2 asambleas al año. Sin suscripción mensual. Los mismos planes que en la landing.
      </p>
      <div className="pricing-grid" style={{ marginBottom: "28px" }}>
        {PLANES_PAGO_UNICO.map((plan) => (
          <PlanCard key={plan.id} plan={plan} planActualNombre={planActualNombre} />
        ))}
      </div>

      <h3 style={{ marginBottom: "8px" }} id="suscripcion">
        Planes por suscripción mensual
      </h3>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Para PH con varias asambleas al año o administradoras. Coinciden con la página de precios.
      </p>
      <div className="pricing-grid">
        {PLANES_SUSCRIPCION.map((plan) => (
          <PlanCard key={plan.id} plan={plan} planActualNombre={planActualNombre} />
        ))}
      </div>

      <h3 style={{ marginTop: "32px", marginBottom: "8px" }} id="mas-residentes">
        Agregar más residentes (unidades)
      </h3>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Si tu PH tiene más unidades que las incluidas en tu plan, puedes comprar paquetes adicionales. Aplica tanto a planes de <strong>pago único</strong> (Evento Único, Dúo Pack) como a planes <strong>mensuales</strong> (Standard, Multi-PH).
      </p>
      <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="card-list">
          <div className="list-item">
            <span>📋</span>
            <span><strong>Evento Único, Dúo Pack y Standard:</strong> +100 unidades por <strong>$50</strong> (pago único). Límite máximo 500 unidades.</span>
          </div>
          <div className="list-item">
            <span>📋</span>
            <span><strong>Multi-PH Lite:</strong> +500 unidades por <strong>$50</strong>. Límite máximo 3.000 unidades en cartera.</span>
          </div>
          <div className="list-item">
            <span>📋</span>
            <span><strong>Multi-PH Pro:</strong> +1.000 unidades por <strong>$100</strong>. Límite máximo 10.000 unidades.</span>
          </div>
          <div className="list-item">
            <span>ℹ️</span>
            <span><strong>Enterprise:</strong> unidades ilimitadas, no requiere paquetes. <strong>Demo:</strong> no permite unidades adicionales.</span>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <a className="btn btn-primary" href="/dashboard/admin-ph/subscription/units-addon">
            Comprar paquetes de unidades →
          </a>
        </div>
      </div>

      <p className="muted" style={{ marginTop: "20px", fontSize: "14px" }}>
        Todos los planes y precios son los mismos que en la landing y en <a href="/pricing?from=dashboard-admin-ph">/pricing</a>. Para contratar o cambiar: el botón de cada plan te lleva al checkout.
      </p>
    </>
  );
}

function PlanCard({ plan, planActualNombre }: { plan: Plan; planActualNombre: string }) {
  const isActual = planActualNombre === plan.displayName;
  const checkoutHref = plan.id === "ENTERPRISE" ? "/login" : `/checkout?plan=${plan.id}&from=dashboard-admin-ph`;

  return (
    <div
      className={`pricing-card ${plan.badge ? "highlight" : ""}`}
      style={{ padding: "20px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginTop: 0, fontSize: "1.15rem" }}>{plan.displayName}</h3>
        {plan.badge ? <span className="pill">{plan.badge}</span> : null}
      </div>
      <p className="pricing-card-tagline">{plan.tagline}</p>
      <p className="pricing-card-price">
        ${plan.price}
        <span className="pricing-card-price-suffix">
          {plan.billing === "monthly" ? "/mes" : " pago único"}
        </span>
      </p>
      <div className="card-list" style={{ marginBottom: "12px" }}>
        {plan.features.slice(0, 5).map((f) => (
          <div key={f} className="list-item">
            <span>•</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      {plan.restrictions?.length ? (
        <div className="card-list" style={{ marginBottom: "12px" }}>
          {plan.restrictions.map((r) => (
            <div key={r} className="list-item">
              <span>⚠️</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      ) : null}
      <a
        className={`btn ${plan.ctaVariant === "primary" || plan.ctaVariant === "accent" ? "btn-primary" : "btn-ghost"}`}
        href={checkoutHref}
        style={{ width: "100%", textAlign: "center" }}
      >
        {isActual ? "Plan actual" : plan.cta}
      </a>
    </div>
  );
}
