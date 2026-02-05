"use client";

import { useEffect, useState } from "react";
import UpgradeBanner from "@/components/UpgradeBanner";
import DemoBanner from "@/components/DemoBanner";
import useUpgradeBanner from "@/hooks/useUpgradeBanner";
import AssemblyCreditsDisplay from "@/components/AssemblyCreditsDisplay";

const KPIS = [
  { label: "Propietarios activos", value: "200", note: "85% al dia" },
  { label: "Asambleas 2026", value: "3", note: "1 programada" },
  { label: "Face ID activo", value: "130", note: "65% configurado" },
  { label: "Alertas abiertas", value: "3", note: "2 en mora" },
];

const ALERTS = [
  "30 propietarios sin Face ID configurado",
  "50 propietarios en mora (+3 meses)",
  "Recordatorio: asamblea en 3 dias",
];

export default function AdminPhDashboard() {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { showBanner, limits } = useUpgradeBanner(subscriptionId);

  useEffect(() => {
    const stored = localStorage.getItem("assembly_subscription_id");
    setSubscriptionId(stored || "demo-subscription");
    const storedOrg = localStorage.getItem("assembly_organization_id");
    setOrganizationId(storedOrg || "demo-organization");
  }, []);

  return (
    <>
      <DemoBanner />
      {showBanner ? <UpgradeBanner limits={limits} /> : null}
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Panel principal</span>
            <h1 style={{ margin: "12px 0 8px" }}>Dashboard Admin PH</h1>
            <p style={{ color: "#cbd5f5", margin: 0 }}>
              Control total de asambleas, propietarios y votaciones en tiempo real.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a className="btn" href="/dashboard/admin-ph/assemblies">
              Ver asambleas
            </a>
            <a className="btn btn-primary" href="/dashboard/admin-ph/assembly/123/live">
              Iniciar asamblea
            </a>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        {KPIS.map((item) => (
          <div key={item.label} className="card">
            <p style={{ margin: 0, color: "#94a3b8" }}>{item.label}</p>
            <h3 style={{ margin: "10px 0" }}>{item.value}</h3>
            <p style={{ margin: 0, color: "#a5b4fc", fontSize: "14px" }}>{item.note}</p>
          </div>
        ))}
      </div>

      <AssemblyCreditsDisplay organizationId={organizationId} />

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Proxima Asamblea</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Ordinaria 2026 · 15 Feb 2026 · 6:00 PM
          </p>
          <div className="card-list">
            <div className="list-item">
              <span>👥</span>
              <span>170 electores (solo al dia)</span>
            </div>
            <div className="list-item">
              <span>✅</span>
              <span>130 con Face ID configurado</span>
            </div>
            <div className="list-item">
              <span>📍</span>
              <span>Salon de eventos - Piso 1</span>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a className="btn" href="/dashboard/admin-ph/assemblies">
              Ver detalles
            </a>
            <a className="btn btn-primary" href="/dashboard/admin-ph/assembly/123/live">
              Iniciar Asamblea
            </a>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Alertas Importantes</h3>
          <div className="card-list">
            {ALERTS.map((alert) => (
              <div key={alert} className="list-item">
                <span>🔔</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
          <a className="btn" style={{ marginTop: "16px" }} href="/dashboard/admin-ph/owners">
            Gestionar propietarios
          </a>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Asistencia ultimas 5 asambleas</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Tendencia de quorums y participacion.
          </p>
          <svg width="100%" height="140" viewBox="0 0 360 140" role="img" aria-label="Grafica de asistencia">
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              points="0,100 60,90 120,110 180,70 240,60 300,85 360,55"
            />
            <circle cx="360" cy="55" r="4" fill="#38bdf8" />
          </svg>
          <div className="chart-bar">
            <span style={{ width: "74%" }} />
          </div>
          <p className="muted" style={{ margin: "10px 0 0" }}>
            Promedio de asistencia 74%
          </p>
        </div>
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Estado de votaciones</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              { label: "Aprobacion presupuesto 2026", value: 67 },
              { label: "Eleccion junta directiva", value: 58 },
              { label: "Acta anterior", value: 92 },
            ].map((item) => (
              <div key={item.label} style={{ display: "grid", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{item.label}</span>
                  <span className="muted">{item.value}%</span>
                </div>
                <div className="chart-bar">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <a className="btn" style={{ marginTop: "16px" }} href="/dashboard/admin-ph/votations">
            Ver resultados
          </a>
        </div>
      </div>
    </>
  );
}
