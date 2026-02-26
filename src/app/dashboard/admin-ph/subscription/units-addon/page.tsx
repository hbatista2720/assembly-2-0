"use client";

/**
 * Comprar paquetes de unidades adicionales (más residentes).
 * Ref: Arquitecto/LIMITES_UNIDADES_POR_PLAN.md
 */

import Link from "next/link";
import { useCart } from "../../../../../context/CartContext";

const ADDONS_PH = [
  { units: 100, price: 50, label: "+100 unidades", desc: "Máx 500 unidades en total" },
  { units: 200, price: 100, label: "+200 unidades", desc: "Máx 500 unidades en total" },
  { units: 300, price: 150, label: "+300 unidades", desc: "Máx 500 unidades en total" },
];

const ADDONS_MULTI_LITE = [
  { units: 500, price: 50, label: "+500 unidades", desc: "Máx 3.000 en cartera" },
  { units: 1000, price: 100, label: "+1.000 unidades", desc: "Máx 3.000 en cartera" },
];

const ADDONS_MULTI_PRO = [
  { units: 1000, price: 100, label: "+1.000 unidades", desc: "Máx 10.000 en cartera" },
  { units: 2000, price: 200, label: "+2.000 unidades", desc: "Máx 10.000 en cartera" },
];

const planGuide = [
  { name: "Evento Único, Dúo Pack o Standard", hint: "Hasta 500 unidades. Base 250." },
  { name: "Multi-PH Lite", hint: "Hasta 3.000 unidades en cartera. Base 1.500." },
  { name: "Multi-PH Pro", hint: "Hasta 10.000 unidades. Base 5.000." },
];

type PlanType = "PH" | "MULTI_LITE" | "MULTI_PRO";

function AddonCard({ addon, planType }: { addon: { units: number; price: number; label: string; desc: string }; planType: PlanType }) {
  const { addUnitsAddon } = useCart();

  const handleAddToCart = () => {
    addUnitsAddon(addon.units, addon.price, addon.label, planType);
  };

  return (
    <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "22px", fontWeight: 700 }}>{addon.label}</div>
      <p className="muted" style={{ margin: 0, fontSize: "13px" }}>{addon.desc}</p>
      <p style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
        ${addon.price} <span className="muted" style={{ fontSize: "14px", fontWeight: 400 }}>pago único</span>
      </p>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "auto", padding: "12px" }}
        onClick={handleAddToCart}
      >
        Agregar al carrito
      </button>
      <Link
        className="btn btn-ghost"
        href="/dashboard/admin-ph/subscription/cart"
        style={{ width: "100%", padding: "10px", fontSize: "13px", textAlign: "center" }}
      >
        Ver carrito / efectuar pago →
      </Link>
    </div>
  );
}

export default function UnitsAddonPage() {
  const { itemCount } = useCart();

  return (
    <>
      <div className="card" style={{ padding: "24px", marginBottom: "24px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "20px", fontWeight: 700 }}>
              Comprar más unidades
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
              <strong>Paso 1:</strong> Identifica tu tipo de plan abajo. <strong>Paso 2:</strong> Agrega al carrito o compra ahora. Pago único.
            </p>
          </div>
          {itemCount > 0 && (
            <Link href="/dashboard/admin-ph/subscription/cart" className="btn btn-primary" style={{ padding: "10px 18px" }}>
              Ver carrito ({itemCount}) →
            </Link>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", fontSize: "13px" }}>
          {planGuide.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <strong style={{ color: "var(--color-text, #f1f5f9)" }}>{p.name}</strong>
              <span className="muted">{p.hint}</span>
            </div>
          ))}
        </div>
      </div>

      <section style={{ marginBottom: "28px" }} aria-labelledby="addon-ph-title">
        <h3 id="addon-ph-title" style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Si tu plan es Evento Único, Dúo Pack o Standard
        </h3>
        <p className="muted" style={{ marginBottom: "16px", fontSize: "14px" }}>
          +$50 por cada 100 unidades (máximo 500 en total).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {ADDONS_PH.map((addon) => (
            <AddonCard key={addon.units} addon={addon} planType="PH" />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "28px" }} aria-labelledby="addon-lite-title">
        <h3 id="addon-lite-title" style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Si tu plan es Multi-PH Lite
        </h3>
        <p className="muted" style={{ marginBottom: "16px", fontSize: "14px" }}>
          +$50 por cada 500 unidades (máximo 3.000 en cartera).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {ADDONS_MULTI_LITE.map((addon) => (
            <AddonCard key={addon.units} addon={addon} planType="MULTI_LITE" />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "28px" }} aria-labelledby="addon-pro-title">
        <h3 id="addon-pro-title" style={{ marginBottom: "8px", fontSize: "16px", fontWeight: 600 }}>
          Si tu plan es Multi-PH Pro
        </h3>
        <p className="muted" style={{ marginBottom: "16px", fontSize: "14px" }}>
          +$100 por cada 1.000 unidades (máximo 10.000).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {ADDONS_MULTI_PRO.map((addon) => (
            <AddonCard key={addon.units} addon={addon} planType="MULTI_PRO" />
          ))}
        </div>
      </section>

      <p className="muted" style={{ fontSize: "14px" }}>
        <a href="/dashboard/admin-ph/subscription">← Volver a Suscripción</a>
        {" · "}
        <a href="/dashboard/admin-ph">Volver al Panel de la Comunidad</a>
      </p>
    </>
  );
}
