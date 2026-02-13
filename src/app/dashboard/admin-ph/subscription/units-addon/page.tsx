"use client";

/**
 * Comprar paquetes de unidades adicionales (más residentes).
 * Ref: Arquitecto/LIMITES_UNIDADES_POR_PLAN.md
 */

const ADDONS_PH = [
  { units: 100, price: 50, label: "+100 unidades", desc: "Para Evento Único, Dúo Pack o Standard (máx 500)" },
  { units: 200, price: 100, label: "+200 unidades", desc: "Para Evento Único, Dúo Pack o Standard (máx 500)" },
  { units: 300, price: 150, label: "+300 unidades", desc: "Para Evento Único, Dúo Pack o Standard (máx 500)" },
];

const ADDONS_MULTI_LITE = [
  { units: 500, price: 50, label: "+500 unidades", desc: "Multi-PH Lite (máx 3.000 en cartera)" },
  { units: 1000, price: 100, label: "+1.000 unidades", desc: "Multi-PH Lite (máx 3.000 en cartera)" },
];

const ADDONS_MULTI_PRO = [
  { units: 1000, price: 100, label: "+1.000 unidades", desc: "Multi-PH Pro (máx 10.000 en cartera)" },
  { units: 2000, price: 200, label: "+2.000 unidades", desc: "Multi-PH Pro (máx 10.000 en cartera)" },
];

export default function UnitsAddonPage() {
  return (
    <>
      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Paquetes de unidades adicionales</h2>
        <p className="muted" style={{ margin: "0 0 12px" }}>
          Añade más residentes/unidades a tu plan (pago único). El límite de tu plan determina qué paquetes puedes comprar.
        </p>
        <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
          Si al subir propietarios en <strong>Gestión de residentes</strong> superas el límite, el sistema te ofrecerá comprar los paquetes necesarios.
        </p>
      </div>

      <h3 style={{ marginBottom: "12px" }}>Planes Evento Único, Dúo Pack y Standard</h3>
      <p className="muted" style={{ marginBottom: "12px" }}>Base 250 unidades. +$50 por cada 100 unidades extra (máx 500 total).</p>
      <div className="grid grid-3" style={{ gap: "16px", marginBottom: "24px" }}>
        {ADDONS_PH.map((addon) => (
          <div key={addon.units} className="card" style={{ padding: "20px" }}>
            <strong>{addon.label}</strong>
            <p className="muted" style={{ margin: "6px 0 12px", fontSize: "14px" }}>{addon.desc}</p>
            <p style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>${addon.price} <span className="muted" style={{ fontSize: "14px", fontWeight: 400 }}>pago único</span></p>
            <a className="btn btn-primary" href={`/checkout?addon=units&qty=${addon.units}&from=dashboard-admin-ph`} style={{ width: "100%" }}>
              Comprar {addon.label}
            </a>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: "12px" }}>Plan Multi-PH Lite</h3>
      <p className="muted" style={{ marginBottom: "12px" }}>Base 1.500 unidades en cartera. +$50 por cada 500 adicionales (máx 3.000).</p>
      <div className="grid grid-3" style={{ gap: "16px", marginBottom: "24px" }}>
        {ADDONS_MULTI_LITE.map((addon) => (
          <div key={addon.units} className="card" style={{ padding: "20px" }}>
            <strong>{addon.label}</strong>
            <p className="muted" style={{ margin: "6px 0 12px", fontSize: "14px" }}>{addon.desc}</p>
            <p style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>${addon.price} <span className="muted" style={{ fontSize: "14px", fontWeight: 400 }}>pago único</span></p>
            <a className="btn btn-primary" href={`/checkout?addon=units&qty=${addon.units}&from=dashboard-admin-ph`} style={{ width: "100%" }}>
              Comprar {addon.label}
            </a>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: "12px" }}>Plan Multi-PH Pro</h3>
      <p className="muted" style={{ marginBottom: "12px" }}>Base 5.000 unidades. +$100 por cada 1.000 adicionales (máx 10.000).</p>
      <div className="grid grid-3" style={{ gap: "16px", marginBottom: "24px" }}>
        {ADDONS_MULTI_PRO.map((addon) => (
          <div key={addon.units} className="card" style={{ padding: "20px" }}>
            <strong>{addon.label}</strong>
            <p className="muted" style={{ margin: "6px 0 12px", fontSize: "14px" }}>{addon.desc}</p>
            <p style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px" }}>${addon.price} <span className="muted" style={{ fontSize: "14px", fontWeight: 400 }}>pago único</span></p>
            <a className="btn btn-primary" href={`/checkout?addon=units&qty=${addon.units}&from=dashboard-admin-ph`} style={{ width: "100%" }}>
              Comprar {addon.label}
            </a>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: "14px" }}>
        <a href="/dashboard/admin-ph/subscription">← Volver a Suscripción</a>
        {" · "}
        <a href="/dashboard/admin-ph">Volver al Dashboard</a>
      </p>
    </>
  );
}
