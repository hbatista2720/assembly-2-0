"use client";

/**
 * FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH. Stripe fuera de alcance.
 */

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PLANS, PlanTier } from "../../lib/types/pricing";

const PAYMENT_METHODS = [
  { id: "PAYPAL", label: "PayPal", desc: "Tarjeta o balance PayPal (retiros en Panamá)" },
  { id: "TILOPAY", label: "Tilopay", desc: "Tarjetas locales / Centroamérica" },
  { id: "MANUAL_YAPPY", label: "Yappy", desc: "Wallet móvil (Panamá)" },
  { id: "MANUAL_ACH", label: "ACH", desc: "Transferencia bancaria directa" },
  { id: "MANUAL_TRANSFER", label: "Transferencia", desc: "Transferencia manual" },
] as const;

const UNITS_ADDON_OPTIONS = [
  { units: 0, label: "250 residentes (incluido)", price: 0 },
  { units: 100, label: "+100 residentes (350 total)", price: 50 },
  { units: 200, label: "+200 residentes (450 total)", price: 100 },
  { units: 300, label: "+300 residentes (500 máx)", price: 150 },
];

function CheckoutContent() {
  const params = useSearchParams();
  const planId = (params.get("plan") || "STANDARD") as PlanTier;
  const fromDashboardPh = params.get("from") === "dashboard-admin-ph";
  const plan = useMemo(() => PLANS.find((p) => p.id === planId) ?? PLANS[2], [planId]);
  const [paymentMethod, setPaymentMethod] = useState<string>("MANUAL_YAPPY");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [addonUnits, setAddonUnits] = useState(0);

  const showUnitsAddon = plan.billing === "one-time" && (planId === "EVENTO_UNICO" || planId === "DUO_PACK");
  const addonPrice = showUnitsAddon ? (UNITS_ADDON_OPTIONS.find((o) => o.units === addonUnits)?.price ?? 0) : 0;
  const totalPrice = plan.price + addonPrice;

  async function handleCheckout() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_tier: plan.id,
          payment_method: paymentMethod,
          subscription_id: typeof window !== "undefined" ? localStorage.getItem("assembly_subscription_id") : null,
          organization_id: typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null,
          customer_email: email || undefined,
          units_addon: showUnitsAddon ? addonUnits : undefined,
          success_url: `${window.location.origin}/pricing?success=1`,
          cancel_url: `${window.location.origin}/checkout?plan=${plan.id}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al crear checkout" });
        if (data.fallback_manual) setPaymentMethod("MANUAL_YAPPY");
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      if (data.pending) {
        setMessage({
          type: data.checkout_available === false ? "error" : "ok",
          text: data.message || "Solicitud registrada. Te contactaremos pronto.",
        });
        if (data.fallback_manual) setPaymentMethod("MANUAL_YAPPY");
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Error de conexión" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      {fromDashboardPh && (
        <div style={{ marginBottom: "16px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          <a className="btn btn-ghost" href="/dashboard/admin-ph">
            ← Volver al Dashboard PH
          </a>
        </div>
      )}
      <div className="card" style={{ maxWidth: "560px", margin: "24px auto", padding: "28px" }}>
        <h1 style={{ marginTop: 0 }}>Completar pago</h1>
        <p className="muted" style={{ marginBottom: "20px" }}>
          Plan: <strong>{plan.displayName}</strong> — ${plan.price}
          {plan.billing === "monthly" ? "/mes" : " pago único"}
        </p>

        {showUnitsAddon && (
          <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(99,102,241,0.1)", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.3)" }}>
            <label style={{ display: "block", marginBottom: "10px", color: "#cbd5f5" }}>Agregar límite de residentes</label>
            <p className="muted" style={{ margin: "0 0 12px", fontSize: "14px" }}>Base 250 incluidos. Puedes sumar más hasta 500 (pago único).</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {UNITS_ADDON_OPTIONS.map((opt) => (
                <label
                  key={opt.units}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px",
                    border: addonUnits === opt.units ? "1px solid #6366f1" : "1px solid rgba(148,163,184,0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="addon"
                    checked={addonUnits === opt.units}
                    onChange={() => setAddonUnits(opt.units)}
                  />
                  <span>{opt.label}</span>
                  <span>{opt.price === 0 ? "Incluido" : `+$${opt.price}`}</span>
                </label>
              ))}
            </div>
            <p style={{ marginTop: "12px", marginBottom: 0, fontWeight: 700 }}>
              Total: ${totalPrice} pago único
            </p>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8" }}>Email (facturación)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="btn"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <span style={{ display: "block", marginBottom: "10px", color: "#94a3b8" }}>Método de pago</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: paymentMethod === pm.id ? "1px solid #6366f1" : "1px solid rgba(148,163,184,0.3)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === pm.id}
                  onChange={() => setPaymentMethod(pm.id)}
                />
                <div>
                  <div>{pm.label}</div>
                  <div className="muted" style={{ fontSize: "12px" }}>{pm.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {message ? (
          <p
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: message.type === "ok" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              color: message.type === "ok" ? "#86efac" : "#fca5a5",
            }}
          >
            {message.text}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          {fromDashboardPh && (
            <a className="btn btn-ghost" href="/dashboard/admin-ph">
              Volver al Dashboard PH
            </a>
          )}
          <a className="btn btn-ghost" href={fromDashboardPh ? "/pricing?from=dashboard-admin-ph" : "/pricing"}>
            Volver a precios
          </a>
          <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
            {loading ? "Procesando…" : showUnitsAddon ? `Comprar $${totalPrice}` : "Pagar con método elegido"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="card" style={{ maxWidth: "560px", margin: "24px auto", padding: "28px" }}>
          <p className="muted">Cargando…</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
