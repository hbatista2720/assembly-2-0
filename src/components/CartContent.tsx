"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { PLANS } from "../lib/types/pricing";
import type { PlanTier } from "../lib/types/pricing";

const UNIT_ADDONS = [
  { planType: "PH" as const, units: 100, price: 50, label: "+100 unidades" },
  { planType: "PH" as const, units: 200, price: 100, label: "+200 unidades" },
  { planType: "PH" as const, units: 300, price: 150, label: "+300 unidades" },
  { planType: "MULTI_LITE" as const, units: 500, price: 50, label: "+500 unidades" },
  { planType: "MULTI_LITE" as const, units: 1000, price: 100, label: "+1.000 unidades" },
  { planType: "MULTI_PRO" as const, units: 1000, price: 100, label: "+1.000 unidades" },
  { planType: "MULTI_PRO" as const, units: 2000, price: 200, label: "+2.000 unidades" },
];

type CartContentProps = {
  backHref?: string;
  backLabel?: string;
  checkoutHref?: string;
};

const DEFAULT_BACK = { href: "/dashboard/admin-ph/subscription", label: "← Suscripciones" };
const DEFAULT_CHECKOUT = "/checkout?from=cart&from_dashboard=1";

export default function CartContent({
  backHref = DEFAULT_BACK.href,
  backLabel = DEFAULT_BACK.label,
  checkoutHref = DEFAULT_CHECKOUT,
}: CartContentProps = {}) {
  const {
    cart,
    itemCount,
    subtotal,
    discount,
    total,
    addPlan,
    addUnitsAddon,
    removePlan,
    removeUnitAddon,
    applyCouponCode,
    setCoupon,
    clearCart,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  async function handleApplyCoupon() {
    setCouponMessage(null);
    setApplying(true);
    const result = await applyCouponCode(couponInput);
    setApplying(false);
    setCouponMessage({ type: result.success ? "ok" : "error", text: result.message });
    if (result.success) setCouponInput("");
  }

  const hasPlan = !!cart.plan;
  const canCheckout = itemCount > 0 && hasPlan;
  const planSubtotal = cart.plan ? cart.plan.price : 0;
  const unitsSubtotal = cart.unitAddons.reduce((s, a) => s + a.price, 0);

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <Link className="btn btn-primary" href={backHref} style={{ padding: "10px 18px" }}>
          {backLabel}
        </Link>
      </div>

      <div className="card" style={{ padding: "24px", borderRadius: "14px", border: "1px solid rgba(148,163,184,0.2)" }}>
        <h1 style={{ marginTop: 0, marginBottom: "4px", fontSize: "22px", fontWeight: 700 }}>
          Carrito de compra
        </h1>
        <p className="muted" style={{ marginBottom: "20px", fontSize: "14px" }}>
          Agrega plan y unidades aquí, aplica un cupón si tienes y efectúa el pago.
        </p>

        <div style={{ marginBottom: "24px", padding: "20px", background: "rgba(99,102,241,0.08)", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.2)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 600 }}>Agregar desde aquí</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>Plan</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {PLANS.filter((p) => p.id !== "ENTERPRISE").map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => addPlan(plan.id as PlanTier, plan.displayName, plan.price, plan.billing)}
                    style={{ padding: "8px 14px", fontSize: "13px", border: "1px solid rgba(148,163,184,0.3)", borderRadius: "8px" }}
                  >
                    {plan.displayName} — ${plan.price}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>Más residentes (unidades)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {UNIT_ADDONS.map((a) => (
                  <button
                    key={`${a.planType}-${a.units}`}
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => addUnitsAddon(a.units, a.price, a.label, a.planType)}
                    style={{ padding: "8px 14px", fontSize: "13px", border: "1px solid rgba(148,163,184,0.3)", borderRadius: "8px" }}
                  >
                    {a.label} — ${a.price}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {itemCount > 0 ? (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", borderBottom: "1px solid rgba(148,163,184,0.2)", paddingBottom: "20px" }}>
              {cart.plan && (
                <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                  <div>
                    <strong>Plan: {cart.plan.displayName}</strong>
                    <span className="muted" style={{ marginLeft: "8px", fontSize: "13px" }}>
                      {cart.plan.billing === "monthly" ? "/mes" : " pago único"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600 }}>${cart.plan.price}</span>
                    <button type="button" className="btn btn-ghost" onClick={() => removePlan()} style={{ padding: "4px 8px", fontSize: "12px" }} aria-label="Quitar plan">
                      Quitar
                    </button>
                  </div>
                </li>
              )}
              {cart.unitAddons.map((addon) => (
                <li key={addon.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                  <div>
                    <strong>{addon.label}</strong>
                    <span className="muted" style={{ marginLeft: "8px", fontSize: "13px" }}>+{addon.units} residentes</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600 }}>${addon.price}</span>
                    <button type="button" className="btn btn-ghost" onClick={() => removeUnitAddon(addon.id)} style={{ padding: "4px 8px", fontSize: "12px" }} aria-label="Quitar">
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}>
                Cupón de descuento
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Código del cupón"
                  style={{
                    flex: 1,
                    minWidth: "140px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "rgba(30,41,59,0.9)",
                    color: "#f1f5f9",
                    fontSize: "14px",
                  }}
                />
                <button type="button" className="btn btn-ghost" onClick={handleApplyCoupon} disabled={applying || !couponInput.trim()}>
                  {applying ? "…" : "Aplicar"}
                </button>
              </div>
              {cart.coupon && (
                <p style={{ marginTop: "8px", fontSize: "13px", color: "#4ade80" }}>
                  Cupón <strong>{cart.coupon.code}</strong>: {cart.coupon.discountPercent}% de descuento.{" "}
                  <button type="button" className="btn btn-ghost" style={{ padding: 0, fontSize: "13px", textDecoration: "underline" }} onClick={() => setCoupon(null)}>
                    Quitar cupón
                  </button>
                </p>
              )}
              {couponMessage && (
                <p style={{ marginTop: "8px", fontSize: "13px", color: couponMessage.type === "ok" ? "#4ade80" : "#f87171" }}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            <div style={{ padding: "18px", background: "rgba(15,23,42,0.5)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.15)", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
                Resumen de precios
              </div>
              {planSubtotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                  <span className="muted">Plan</span>
                  <span>${planSubtotal.toFixed(2)}</span>
                </div>
              )}
              {unitsSubtotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                  <span className="muted">Unidades adicionales</span>
                  <span>${unitsSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                <span className="muted">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px", color: "#4ade80" }}>
                  <span>Descuento ({cart.coupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
                <span>Total a pagar</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px", alignItems: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={clearCart} style={{ color: "var(--color-error, #ef4444)" }}>
                Vaciar carrito
              </button>
              {!hasPlan && itemCount > 0 && (
                <span className="muted" style={{ fontSize: "13px" }}>Agrega un plan arriba para poder pagar.</span>
              )}
              {canCheckout && (
                <Link className="btn btn-primary" href={checkoutHref} style={{ marginLeft: "auto", padding: "12px 24px" }}>
                  Efectuar pago →
                </Link>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: "20px 0" }}>
            <p className="muted" style={{ marginBottom: "16px" }}>
              No hay ítems. Usa la sección <strong>Agregar desde aquí</strong> para elegir plan y cantidad de residentes, o ve a Suscripciones.
            </p>
            <Link className="btn btn-primary" href={backHref}>
              Ir a Suscripciones
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
