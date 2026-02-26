"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLANS, type Plan, type PlanTier } from "../../../lib/types/pricing";

const PLAN_OVERRIDES_KEY = "assembly_platform_admin_plan_overrides";

function loadOverrides(): Record<PlanTier, number | null> {
  if (typeof window === "undefined") return {} as Record<PlanTier, number | null>;
  try {
    const raw = localStorage.getItem(PLAN_OVERRIDES_KEY);
    if (!raw) return {} as Record<PlanTier, number | null>;
    return JSON.parse(raw);
  } catch {
    return {} as Record<PlanTier, number | null>;
  }
}

function saveOverrides(overrides: Record<PlanTier, number | null>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_OVERRIDES_KEY, JSON.stringify(overrides));
}

function getEffectivePrice(plan: Plan, overrides: Record<PlanTier, number | null>): number {
  const override = overrides[plan.id];
  return override !== undefined && override !== null ? override : plan.price;
}

function formatLimit(
  val: number | "unlimited"
): string {
  return val === "unlimited" ? "∞" : String(val);
}

export default function PlansPage() {
  const [overrides, setOverrides] = useState<Record<PlanTier, number | null>>({});
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  const handleSavePrice = () => {
    if (!editingPlan) return;
    const num = parseFloat(editPrice);
    if (Number.isNaN(num) || num < 0) return;
    const next = { ...overrides, [editingPlan.id]: num };
    setOverrides(next);
    saveOverrides(next);
    setEditingPlan(null);
    setEditPrice("");
  };

  const handleResetAll = () => {
    setOverrides({});
    saveOverrides({} as Record<PlanTier, number | null>);
    setEditingPlan(null);
  };

  const hasOverrides = Object.values(overrides).some((v) => v !== null && v !== undefined);

  return (
    <>
      <div className="card" style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/admin" className="page-back-link" style={{ marginBottom: "16px", display: "inline-flex" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h1 style={{ margin: "12px 0 8px" }}>Planes y precios</h1>
            <p className="muted" style={{ margin: 0 }}>
              Configuración de planes, precios y créditos. Fuente: <code>Marketing/MARKETING_PRECIOS_COMPLETO.md</code>.
              Los overrides se guardan localmente (Fase 1).
            </p>
          </div>
          {hasOverrides && (
            <button type="button" className="btn btn-ghost" onClick={handleResetAll} style={{ color: "#f59e0b" }}>
              Restaurar valores por defecto
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <div style={{ minWidth: "720px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#94a3b8" }}>Plan</th>
                <th style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600, color: "#94a3b8" }}>Precio</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#94a3b8" }}>Ciclo</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#94a3b8" }}>Asambleas</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#94a3b8" }}>Unidades</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#94a3b8" }}>Edificios</th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#94a3b8", width: 100 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map((plan) => {
                const price = getEffectivePrice(plan, overrides);
                const isOverridden = overrides[plan.id] !== undefined && overrides[plan.id] !== null;
                const asm =
                  plan.limits.assembliesPerMonth === "unlimited"
                    ? "∞"
                    : typeof plan.limits.assembliesPerMonth === "number"
                      ? plan.billing === "monthly"
                        ? `${plan.limits.assembliesPerMonth}/mes`
                        : String(plan.limits.assembliesPerMonth)
                      : "—";
                return (
                  <tr key={plan.id} className="plans-table-row" style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600 }}>{plan.displayName}</div>
                      <div className="muted" style={{ fontSize: "12px", marginTop: "2px" }}>{plan.tagline}</div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <span style={{ fontWeight: 700, color: isOverridden ? "#f59e0b" : "inherit" }}>
                        ${price.toLocaleString("es-PA")}
                      </span>
                      {plan.billing === "monthly" && <span className="muted" style={{ fontSize: "12px" }}>/mes</span>}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span className="pill" style={{ fontSize: "11px" }}>
                        {plan.billing === "one-time" ? "Pago único" : "Mensual"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>{asm}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      {formatLimit(plan.limits.maxPropertiesPerAssembly)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      {formatLimit(plan.limits.maxBuildings)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm plans-edit-btn"
                        onClick={() => {
                          setEditingPlan(plan);
                          setEditPrice(String(getEffectivePrice(plan, overrides)));
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar precio
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px", padding: "20px 24px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "15px" }}>Referencia de precios (Marketing)</h3>
        <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
          Evento Único $225 · Dúo Pack $389 · Standard $189/mes · Multi-PH Lite $399/mes · Multi-PH Pro $699/mes · Enterprise $2,499/mes.
          Los overrides permiten pruebas sin modificar el código.
        </p>
      </div>

      {editingPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-plan-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setEditingPlan(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "380px", margin: 16, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-plan-title" style={{ marginTop: 0 }}>Editar precio · {editingPlan.displayName}</h2>
            <label style={{ display: "block", marginTop: "16px" }}>
              <span className="muted" style={{ fontSize: "12px" }}>Precio (USD)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15,23,42,0.6)",
                  color: "#e2e8f0",
                }}
              />
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button type="button" className="btn btn-primary" onClick={handleSavePrice}>
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const next = { ...overrides, [editingPlan.id]: null };
                  setOverrides(next);
                  saveOverrides(next);
                  setEditingPlan(null);
                }}
              >
                Restaurar original
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingPlan(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
