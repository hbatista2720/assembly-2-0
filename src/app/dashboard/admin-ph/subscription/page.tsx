"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLANS, Plan } from "../../../../lib/types/pricing";
import { useCart } from "../../../../context/CartContext";

const PLANES_PAGO_UNICO = PLANS.filter((p) => p.billing === "one-time");
const PLANES_SUSCRIPCION = PLANS.filter((p) => p.billing === "monthly");

type WizardStep = "ver-suscripcion" | "comprar-credito" | "afiliacion-mensual" | null;

const WIZARD_OPTIONS: { id: WizardStep; title: string; desc: string; icon: string }[] = [
  { id: "ver-suscripcion", title: "Ver mi suscripción actual", desc: "Plan, créditos, límites, historial", icon: "📋" },
  { id: "comprar-credito", title: "Comprar crédito", desc: "Pago único: Evento Único, Dúo Pack", icon: "💰" },
  { id: "afiliacion-mensual", title: "Afiliación mensual", desc: "Suscripción: Standard, Multi-PH Lite/Pro", icon: "📅" },
];

function getStepFromSearchParams(searchParams: URLSearchParams | null): WizardStep {
  if (!searchParams) return null;
  const s = searchParams.get("step");
  if (s && ["ver-suscripcion", "comprar-credito", "afiliacion-mensual"].includes(s)) return s as WizardStep;
  return null;
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<WizardStep>(() => getStepFromSearchParams(searchParams));
  const [planActualNombre, setPlanActualNombre] = useState("Standard");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setStep(getStepFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const demo =
      typeof window !== "undefined" &&
      (localStorage.getItem("assembly_subscription_id") === "demo-subscription" ||
        new URLSearchParams(window.location.search).get("mode") === "demo");
    setIsDemo(!!demo);
    if (demo) setPlanActualNombre("Plan Demo");
  }, []);

  const updateStep = (s: WizardStep) => {
    setStep(s);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (s) url.searchParams.set("step", s);
      else url.searchParams.delete("step");
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <>
      <div
        className="subscription-page-header"
        style={{
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div>
          <span
            className="subscription-section-badge"
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-primary)",
              marginBottom: "8px",
              padding: "6px 12px",
              background: "rgba(99,102,241,0.15)",
              borderRadius: "8px",
            }}
          >
            Suscripciones y planes
          </span>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Suscripciones y planes
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "14px", maxWidth: "560px" }}>
            Gestiona tu plan, compra crédito o afíliate mensualmente. Elige una opción abajo.
          </p>
        </div>
        <SubscriptionCartLink />
      </div>

      {/* Stepper */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(30,41,59,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Etapa 1: ¿Qué deseas hacer?
          </span>
          {step && (
            <>
              <span style={{ color: "#64748b", fontSize: "14px" }}>→</span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  background: "rgba(99,102,241,0.15)",
                  padding: "4px 12px",
                  borderRadius: "8px",
                }}
              >
                Etapa 2: {WIZARD_OPTIONS.find((o) => o.id === step)?.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Etapa 1: 3 opciones grandes */}
      <div
        className="card"
        style={{
          marginBottom: "28px",
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid rgba(148,163,184,0.15)",
          background: "rgba(30,41,59,0.4)",
        }}
      >
        <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>
          ¿Qué deseas hacer?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {WIZARD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateStep(opt.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "20px 20px",
                borderRadius: "12px",
                border: step === opt.id ? "2px solid rgba(99,102,241,0.6)" : "1px solid rgba(148,163,184,0.2)",
                background: step === opt.id ? "rgba(99,102,241,0.15)" : "rgba(30,41,59,0.5)",
                color: "inherit",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
                textAlign: "left",
              }}
              onMouseOver={(e) => {
                if (step !== opt.id) {
                  e.currentTarget.style.background = "rgba(71,85,105,0.4)";
                  e.currentTarget.style.borderColor = "rgba(148,163,184,0.35)";
                }
              }}
              onMouseOut={(e) => {
                if (step !== opt.id) {
                  e.currentTarget.style.background = "rgba(30,41,59,0.5)";
                  e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
                }
              }}
            >
              <span style={{ fontSize: "28px", marginBottom: "12px" }}>{opt.icon}</span>
              <span style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>{opt.title}</span>
              <span className="muted" style={{ fontSize: "13px" }}>{opt.desc}</span>
              <span
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                }}
              >
                {step === opt.id ? "Seleccionado ✓" : "Seleccionar"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Etapa 2: Contenido según opción */}
      {step && (
        <div
          className="card"
          style={{
            marginBottom: "28px",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(30,41,59,0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
              Etapa 2: {WIZARD_OPTIONS.find((o) => o.id === step)?.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <SubscriptionCartLink />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => updateStep(null)}
                style={{ fontSize: "13px" }}
              >
                Cambiar opción
              </button>
            </div>
          </div>

          {step === "ver-suscripcion" && (
            <WizardVerSuscripcion planActualNombre={planActualNombre} isDemo={isDemo} onComprarCredito={() => updateStep("comprar-credito")} onAfiliacion={() => updateStep("afiliacion-mensual")} />
          )}
          {step === "comprar-credito" && (
            <WizardComprarCredito planActualNombre={planActualNombre} isDemo={isDemo} />
          )}
          {step === "afiliacion-mensual" && (
            <WizardAfiliacionMensual planActualNombre={planActualNombre} isDemo={isDemo} />
          )}
        </div>
      )}

      <p className="muted" style={{ marginTop: "20px", fontSize: "14px" }}>
        Todos los planes coinciden con <a href="/pricing?from=dashboard-admin-ph">/pricing</a>. Agrega al carrito, aplica un cupón y efectúa el pago.
      </p>
    </>
  );
}

function WizardVerSuscripcion({
  planActualNombre,
  isDemo,
  onComprarCredito,
  onAfiliacion,
}: {
  planActualNombre: string;
  isDemo: boolean;
  onComprarCredito: () => void;
  onAfiliacion: () => void;
}) {
  return (
    <>
      <BillingSection planActualNombre={planActualNombre} isDemo={isDemo} />
      <div
        style={{
          marginTop: "24px",
          padding: "16px 20px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: "12px",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <p style={{ margin: "0 0 12px", fontSize: "14px" }}>¿Necesitas más?</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onComprarCredito}>
            Comprar crédito
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onAfiliacion}>
            Afiliación mensual
          </button>
        </div>
      </div>
    </>
  );
}

function WizardComprarCredito({
  planActualNombre,
  isDemo,
}: {
  planActualNombre: string;
  isDemo: boolean;
}) {
  return (
    <>
      <p className="muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
        Pago único. Ideal para 1 o 2 asambleas al año.
      </p>
      <div className="pricing-grid pricing-grid--pago-unico" style={{ marginBottom: "24px" }}>
        {PLANES_PAGO_UNICO.map((plan) => (
          <PlanCard key={plan.id} plan={plan} planActualNombre={planActualNombre} fromDashboard />
        ))}
      </div>
      <section
        id="mas-residentes"
        style={{
          padding: "20px 24px",
          background: "rgba(15,23,42,0.5)",
          borderRadius: "12px",
          border: "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
          ¿Necesitas más unidades?
        </h3>
        <p className="muted" style={{ marginBottom: "16px", fontSize: "14px" }}>
          Paquetes adicionales según tu plan. Evento/Dúo/Standard: +100 = $50. Multi-PH Lite: +500 = $50.
        </p>
        <Link
          className="btn btn-primary btn-sm"
          href="/dashboard/admin-ph/subscription/units-addon"
          style={{ display: "inline-flex" }}
        >
          Comprar más unidades →
        </Link>
      </section>
      <SubscriptionCartLink />
    </>
  );
}

function WizardAfiliacionMensual({
  planActualNombre,
  isDemo,
}: {
  planActualNombre: string;
  isDemo: boolean;
}) {
  return (
    <>
      <p className="muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
        Suscripción mensual con créditos acumulables. Para PH con varias asambleas al año.
      </p>
      <div className="pricing-grid">
        {PLANES_SUSCRIPCION.map((plan) => (
          <PlanCard key={plan.id} plan={plan} planActualNombre={planActualNombre} fromDashboard />
        ))}
      </div>
      <SubscriptionCartLink />
    </>
  );
}

type BillingHistoryItem = {
  id: string;
  type: "factura" | "solicitud_pago";
  description: string;
  plan_tier: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  status: string;
  contact_email: string | null;
  created_at: string;
  paid_at: string | null;
};

function BillingSection({ planActualNombre, isDemo }: { planActualNombre: string; isDemo: boolean }) {
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = () => {
    if (isDemo) return;
    const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    if (!orgId) {
      setLoading(false);
      setHistory([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/admin-ph/billing-history?organization_id=${encodeURIComponent(orgId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data.history)) {
          setHistory(data.history);
          setError("");
          return;
        }
        if (!res.ok) setError("No se pudo cargar el historial");
      })
      .catch(() => setError("No se pudo cargar el historial"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [isDemo]);

  const statusLabel: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    DRAFT: "Borrador",
    OVERDUE: "Vencido",
    CANCELLED: "Cancelado",
  };

  return (
    <section style={{ marginTop: 0 }}>
      <div style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(15,23,42,0.5)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.15)" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Resumen de cuenta</div>
        <p style={{ margin: 0, fontSize: "15px" }}><strong>Plan actual:</strong> {planActualNombre}</p>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
          {isDemo ? "Modo demo — sin cargos reales." : "Los cargos y compras aparecen en el historial."}
        </p>
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>Historial de facturación</div>
        {isDemo && <p className="muted" style={{ margin: 0 }}>En modo demo no hay historial real.</p>}
        {!isDemo && loading && <p className="muted" style={{ margin: 0 }}>Cargando…</p>}
        {!isDemo && error && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "var(--color-error, #ef4444)" }}>{error}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadHistory}>Reintentar</button>
          </div>
        )}
        {!isDemo && !loading && !error && history.length === 0 && (
          <p className="muted" style={{ margin: 0 }}>Aún no hay facturas registradas.</p>
        )}
        {!isDemo && !loading && history.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", fontWeight: 600, color: "#94a3b8" }}>Fecha</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, color: "#94a3b8" }}>Concepto</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, color: "#94a3b8" }}>Método</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, color: "#94a3b8" }}>Estado</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, color: "#94a3b8", textAlign: "right" }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                    <td style={{ padding: "10px 12px" }}>{new Date(h.created_at).toLocaleDateString("es-CL", { dateStyle: "short" })}</td>
                    <td style={{ padding: "10px 12px" }}>{h.type === "factura" ? h.description : `Plan ${h.plan_tier || ""} — ${h.payment_method}`}</td>
                    <td style={{ padding: "10px 12px" }}>{h.payment_method || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{statusLabel[h.status] || h.status}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>${Number(h.amount).toFixed(2)} {h.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SubscriptionCartLink() {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;
  return (
    <Link
      href="/dashboard/admin-ph/subscription/cart"
      className="btn btn-primary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      Ver carrito ({itemCount}) →
    </Link>
  );
}

function PlanCard({ plan, planActualNombre, fromDashboard }: { plan: Plan; planActualNombre: string; fromDashboard?: boolean }) {
  const isActual = planActualNombre === plan.displayName;
  const { addPlan } = useCart();
  const checkoutHref = plan.id === "ENTERPRISE" ? "/login" : `/checkout?plan=${plan.id}&from=dashboard-admin-ph`;
  const isEnterprise = plan.id === "ENTERPRISE";

  const handleAddToCart = () => {
    addPlan(plan.id, plan.displayName, plan.price, plan.billing);
  };

  return (
    <div className={`pricing-card ${plan.badge ? "highlight" : ""}`} style={{ padding: "16px" }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {fromDashboard && !isEnterprise && !isActual && (
          <button
            type="button"
            className={`btn ${plan.ctaVariant === "primary" || plan.ctaVariant === "accent" ? "btn-primary" : "btn-ghost"}`}
            style={{ width: "100%", textAlign: "center" }}
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </button>
        )}
        <a
          className="btn btn-ghost"
          href={checkoutHref}
          style={{ width: "100%", textAlign: "center", fontSize: "13px" }}
        >
          {isActual ? "Plan actual" : isEnterprise ? plan.cta : "O pagar directamente →"}
        </a>
      </div>
    </div>
  );
}
