"use client";

import { useMemo } from "react";

type BusinessMetric = {
  label: string;
  value: string;
  note: string;
};

export default function BusinessMetricsPage() {
  const metrics = useMemo<BusinessMetric[]>(
    () => [
      { label: "Ingresos mensuales", value: "$18.4k", note: "+12% vs mes anterior" },
      { label: "Clientes activos", value: "45", note: "Churn 3.1%" },
      { label: "Asambleas realizadas", value: "128", note: "+22 este mes" },
      { label: "Proyeccion 90 dias", value: "+18%", note: "Crecimiento esperado" },
    ],
    [],
  );

  const revenueByMonth = [
    { month: "Ene", value: 12 },
    { month: "Feb", value: 14 },
    { month: "Mar", value: 16 },
    { month: "Abr", value: 18 },
  ];

  const churnData = [
    { label: "Activos", value: 92 },
    { label: "Churned", value: 8 },
  ];

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Metricas de Negocio</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Ingresos, churn y proyeccion de crecimiento.
        </p>
      </div>

      <div className="chart-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="card">
            <p className="muted" style={{ margin: 0 }}>
              {metric.label}
            </p>
            <h3 style={{ margin: "10px 0" }}>{metric.value}</h3>
            <p style={{ margin: 0, color: "#a5b4fc", fontSize: "14px" }}>{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: "16px" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ingresos mensuales</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {revenueByMonth.map((item) => (
              <div key={item.month} style={{ display: "grid", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{item.month}</span>
                  <span className="muted">${item.value}k</span>
                </div>
                <div className="chart-bar">
                  <span style={{ width: `${item.value * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Clientes activos vs churned</h3>
          <div className="card-list">
            {churnData.map((item) => (
              <div key={item.label} className="list-item">
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: "12px" }}>
            Objetivo: mantener churn por debajo de 5%.
          </p>
        </div>
      </div>
    </main>
  );
}
