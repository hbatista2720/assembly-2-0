"use client";

import { useEffect, useMemo, useState } from "react";

type ResourceMetric = {
  label: string;
  used: number;
  total: number;
  unit: string;
};

type AlertItem = {
  id: string;
  type: "info" | "warning" | "critical";
  title: string;
  message: string;
  action?: string;
  date?: string;
};

type ForecastItem = {
  date: string;
  assemblies: number;
  users: number;
  status: string;
};

type CalendarDay = {
  day: number;
  reserved: number;
};

const VPS_PLANS = [
  { name: "CX51 (actual)", price: 32, capacity: 30 },
  { name: "CX61", price: 64, capacity: 50 },
  { name: "Multi-VPS", price: 100, capacity: 100 },
];

const ALERT_COLORS = {
  info: "rgba(59,130,246,0.12)",
  warning: "rgba(234,179,8,0.15)",
  critical: "rgba(239,68,68,0.15)",
};

function getCalendarStatus(reserved: number) {
  if (reserved === 0) return { label: "Libre", dot: "⚪", tone: "rgba(148,163,184,0.3)" };
  if (reserved <= 10) return { label: "Normal", dot: "🟢", tone: "rgba(16,185,129,0.25)" };
  if (reserved <= 20) return { label: "En carga", dot: "🟡", tone: "rgba(234,179,8,0.25)" };
  if (reserved <= 25) return { label: "Ocupado", dot: "🟠", tone: "rgba(249,115,22,0.25)" };
  if (reserved <= 30) return { label: "Lleno", dot: "🔴", tone: "rgba(239,68,68,0.25)" };
  return { label: "Upgrade", dot: "⚠️", tone: "rgba(239,68,68,0.3)" };
}

function getRecommendation(active: number, reservedToday: number, maxWeek: number) {
  const current = VPS_PLANS[0];
  const peak = Math.max(active, reservedToday, maxWeek);
  const utilization = Math.round((peak / current.capacity) * 100);

  if (utilization <= 70) {
    return {
      status: "OK",
      message: `VPS actual es suficiente. Capacidad usada: ${utilization}%`,
      suggested: null,
      estimatedCost: current.price,
    };
  }
  if (utilization <= 90) {
    return {
      status: "WARNING",
      message: `Cerca del límite (${utilization}%). Monitorea los próximos días.`,
      suggested: VPS_PLANS[1].name,
      estimatedCost: VPS_PLANS[1].price,
    };
  }
  return {
    status: "UPGRADE_NEEDED",
    message: `Upgrade recomendado. Pico esperado: ${peak} asambleas.`,
    suggested: peak > 50 ? VPS_PLANS[2].name : VPS_PLANS[1].name,
    estimatedCost: peak > 50 ? VPS_PLANS[2].price : VPS_PLANS[1].price,
  };
}

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const metrics = useMemo<ResourceMetric[]>(
    () => [
      { label: "RAM", used: 6.7, total: 16, unit: "GB" },
      { label: "CPU", used: 2.8, total: 8, unit: "vCPU" },
      { label: "Disco", used: 217, total: 320, unit: "GB" },
      { label: "Conexiones DB", used: 2200, total: 10000, unit: "" },
    ],
    [],
  );

  const activeAssemblies = 8;
  const reservedToday = 12;
  const maxReservedWeek = 28;
  const recommendation = getRecommendation(activeAssemblies, reservedToday, maxReservedWeek);

  useEffect(() => {
    setAlerts([
      {
        id: "alert-001",
        type: "warning",
        title: "Alta ocupacion el 15 Feb",
        message: "Tienes 28 asambleas reservadas (93% capacidad)",
        action: "Ver opciones de upgrade",
        date: "2026-02-15",
      },
      {
        id: "alert-002",
        type: "info",
        title: "Semana tranquila",
        message: "Proxima semana: maximo 12 asambleas/dia",
        date: "2026-02-03",
      },
    ]);

    setForecast([
      { date: "2026-02-10", assemblies: 6, users: 4100, status: "OK" },
      { date: "2026-02-15", assemblies: 28, users: 9200, status: "Upgrade sugerido" },
      { date: "2026-02-20", assemblies: 12, users: 5200, status: "OK" },
    ]);

    setCalendarDays([
      { day: 1, reserved: 3 },
      { day: 2, reserved: 5 },
      { day: 3, reserved: 2 },
      { day: 4, reserved: 1 },
      { day: 5, reserved: 0 },
      { day: 6, reserved: 4 },
      { day: 7, reserved: 8 },
      { day: 8, reserved: 15 },
      { day: 9, reserved: 12 },
      { day: 10, reserved: 6 },
      { day: 11, reserved: 3 },
      { day: 12, reserved: 2 },
      { day: 13, reserved: 9 },
      { day: 14, reserved: 22 },
      { day: 15, reserved: 28 },
      { day: 16, reserved: 18 },
      { day: 17, reserved: 7 },
      { day: 18, reserved: 4 },
      { day: 19, reserved: 11 },
      { day: 20, reserved: 6 },
      { day: 21, reserved: 9 },
      { day: 22, reserved: 13 },
      { day: 23, reserved: 8 },
      { day: 24, reserved: 5 },
      { day: 25, reserved: 16 },
      { day: 26, reserved: 20 },
      { day: 27, reserved: 14 },
      { day: 28, reserved: 10 },
    ]);
  }, []);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleExportCalendar = () => {
    const header = "date,reserved,status\n";
    const rows = calendarDays
      .map((day) => {
        const status = getCalendarStatus(day.reserved).label;
        return `2026-02-${String(day.day).padStart(2, "0")},${day.reserved},${status}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "calendario_asambleas_feb_2026.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Monitor de Recursos y Capacidad</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Asambleas activas, calendario de ocupación y recomendación automática de VPS.
        </p>
      </div>

      <div className="chart-grid">
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Asambleas ahora
          </p>
          <h2 style={{ margin: "10px 0" }}>🟢 {activeAssemblies}</h2>
          <p className="muted" style={{ margin: 0 }}>
            activas en vivo
          </p>
        </div>
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Reservadas hoy
          </p>
          <h2 style={{ margin: "10px 0" }}>📅 {reservedToday}</h2>
          <p className="muted" style={{ margin: 0 }}>
            programadas
          </p>
        </div>
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Capacidad VPS
          </p>
          <h2 style={{ margin: "10px 0" }}>
            {reservedToday}/{VPS_PLANS[0].capacity}
          </h2>
          <div className="chart-bar">
            <span style={{ width: `${Math.round((reservedToday / VPS_PLANS[0].capacity) * 100)}%` }} />
          </div>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            Uso actual {Math.round((reservedToday / VPS_PLANS[0].capacity) * 100)}%
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ marginTop: 0 }}>Estado del servidor</h3>
        <div className="grid grid-4">
          {metrics.map((metric) => {
            const percent = Math.round((metric.used / metric.total) * 100);
            return (
              <div key={metric.label} className="card" style={{ border: "1px solid rgba(148,163,184,0.2)" }}>
                <p className="muted" style={{ margin: 0 }}>
                  {metric.label}
                </p>
                <h3 style={{ margin: "10px 0" }}>
                  {metric.used}
                  {metric.unit} / {metric.total}
                  {metric.unit}
                </h3>
                <div className="chart-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  {percent}% usado
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ marginTop: 0 }}>Recomendación automática</h3>
        <div className="card" style={{ background: "rgba(15,23,42,0.4)" }}>
          <h4 style={{ marginTop: 0 }}>
            {recommendation.status === "OK" ? "✅ VPS actual es suficiente" : "⚠️ Requiere atención"}
          </h4>
          <p className="muted" style={{ marginTop: "6px" }}>
            {recommendation.message}
          </p>
          <div className="grid grid-3" style={{ marginTop: "12px" }}>
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                VPS actual
              </p>
              <strong>{VPS_PLANS[0].name}</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                ${VPS_PLANS[0].price}/mes
              </p>
            </div>
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                Sugerido
              </p>
              <strong>{recommendation.suggested ?? "Mantener"}</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                ${recommendation.estimatedCost}/mes
              </p>
            </div>
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                Pico 7 dias
              </p>
              <strong>{maxReservedWeek} asambleas</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                max esperado
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: "16px" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ marginTop: 0 }}>Calendario de ocupación - Febrero 2026</h3>
            <button className="btn btn-ghost" onClick={handleExportCalendar}>
              Exportar CSV
            </button>
          </div>
          <div className="grid grid-7" style={{ gap: "10px" }}>
            {calendarDays.map((day) => {
              const status = getCalendarStatus(day.reserved);
              return (
                <div
                  key={day.day}
                  className="card"
                  style={{
                    padding: "10px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    background: status.tone,
                  }}
                >
                  <strong>{day.day}</strong>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    [{day.reserved}]
                  </p>
                  <span style={{ fontSize: "12px" }}>{status.dot}</span>
                </div>
              );
            })}
          </div>
          <div className="card-list" style={{ marginTop: "12px" }}>
            {[
              "⚪ 0 reservas",
              "🟢 1-10 libre",
              "🟡 11-20 normal",
              "🟠 21-25 ocupado",
              "🔴 26-30 lleno",
              "⚠️ >30 upgrade",
            ].map((item) => (
              <div key={item} className="list-item">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Alertas proactivas</h3>
          <div className="card-list">
            {alerts.length === 0 ? (
              <p className="muted">No hay alertas activas.</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card"
                  style={{ borderLeft: "4px solid rgba(99,102,241,0.7)", background: ALERT_COLORS[alert.type] }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <strong>{alert.title}</strong>
                      <p className="muted" style={{ marginTop: "6px" }}>
                        {alert.message}
                      </p>
                      {alert.action && <p style={{ marginTop: "6px" }}>Accion: {alert.action}</p>}
                      {alert.date && (
                        <p className="muted" style={{ marginTop: "6px" }}>
                          Fecha: {alert.date}
                        </p>
                      )}
                    </div>
                    <button className="btn btn-ghost" onClick={() => handleAcknowledge(alert.id)}>
                      Reconocer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ marginTop: 0 }}>Analisis costo / capacidad</h3>
        <div className="table" style={{ "--table-columns": "1.3fr 1fr 1fr 1fr" } as any}>
          <div className="table-row table-header">
            <span>VPS</span>
            <span>Precio</span>
            <span>Capacidad</span>
            <span>Costo/Asamblea</span>
          </div>
          {VPS_PLANS.map((plan) => (
            <div key={plan.name} className="table-row">
              <span>{plan.name}</span>
              <span>${plan.price}/mes</span>
              <span>{plan.capacity} asambleas</span>
              <span>${(plan.price / plan.capacity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: "10px" }}>
          Tip: el costo por asamblea se mantiene o baja al escalar.
        </p>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ marginTop: 0 }}>Prediccion de carga (30 dias)</h3>
        <div className="table" style={{ "--table-columns": "1fr 1fr 1fr 1fr" } as any}>
          <div className="table-row table-header">
            <span>Fecha</span>
            <span>Asambleas</span>
            <span>Usuarios estimados</span>
            <span>Estado</span>
          </div>
          {forecast.map((item) => (
            <div key={item.date} className="table-row">
              <span>{item.date}</span>
              <span>{item.assemblies}</span>
              <span>{item.users}</span>
              <span className="badge badge-warning">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
