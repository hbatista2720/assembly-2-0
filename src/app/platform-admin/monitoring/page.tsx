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

  const defaultMetrics: ResourceMetric[] = [
    { label: "RAM", used: 6.7, total: 16, unit: "GB" },
    { label: "CPU", used: 2.8, total: 8, unit: "vCPU" },
    { label: "Disco", used: 217, total: 320, unit: "GB" },
    { label: "Conexiones DB", used: 2200, total: 10000, unit: "" },
  ];
  const [metrics, setMetrics] = useState<ResourceMetric[]>(defaultMetrics);
  const [activeAssemblies, setActiveAssemblies] = useState(8);
  const [reservedToday, setReservedToday] = useState(12);
  const [maxReservedWeek, setMaxReservedWeek] = useState(28);
  const [expandedCalendar, setExpandedCalendar] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState(false);

  useEffect(() => {
    fetch("/api/platform-admin/monitoring")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.metrics?.length) setMetrics(data.metrics);
        if (typeof data?.active_assemblies === "number") setActiveAssemblies(data.active_assemblies);
        if (typeof data?.reserved_today === "number") setReservedToday(data.reserved_today);
        if (typeof data?.max_reserved_week === "number") setMaxReservedWeek(data.max_reserved_week);
      })
      .catch(() => {});
  }, []);

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

  const capPercent = Math.round((reservedToday / VPS_PLANS[0].capacity) * 100);
  const healthColor = recommendation.status === "OK" ? "#22c55e" : recommendation.status === "WARNING" ? "#eab308" : "#ef4444";

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Monitor VPS</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Estado en tiempo real, capacidad y recomendaciones inteligentes.
        </p>
      </div>

      {/* Widgets principales — compactos y modernos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>En vivo</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#22c55e" }}>{activeAssemblies}</span>
          <span className="muted" style={{ fontSize: "13px" }}>asambleas activas</span>
        </div>
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hoy</span>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#818cf8" }}>{reservedToday}</span>
          <span className="muted" style={{ fontSize: "13px" }}>reservadas</span>
        </div>
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: capPercent <= 70 ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))" : capPercent <= 90 ? "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))" : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
            border: capPercent <= 70 ? "1px solid rgba(34,197,94,0.25)" : capPercent <= 90 ? "1px solid rgba(234,179,8,0.35)" : "1px solid rgba(239,68,68,0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Capacidad</span>
          <span style={{ fontSize: "28px", fontWeight: 700 }}>{reservedToday}<span style={{ fontSize: "14px", fontWeight: 500, color: "#94a3b8" }}>/{VPS_PLANS[0].capacity}</span></span>
          <div style={{ height: "6px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(capPercent, 100)}%`, height: "100%", background: capPercent <= 70 ? "#22c55e" : capPercent <= 90 ? "#eab308" : "#ef4444", borderRadius: "3px", transition: "width 0.3s" }} />
          </div>
          <span className="muted" style={{ fontSize: "13px" }}>{capPercent}% uso</span>
        </div>
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "rgba(30,41,59,0.5)",
            border: "1px solid rgba(148,163,184,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</span>
          <span style={{ fontSize: "18px", fontWeight: 600, color: healthColor }}>
            {recommendation.status === "OK" ? "✓ Saludable" : recommendation.status === "WARNING" ? "⚠ Monitorear" : "⚠️ Upgrade"}
          </span>
          <span className="muted" style={{ fontSize: "12px" }}>{recommendation.suggested ?? "Sin cambios"}</span>
        </div>
      </div>

      {/* Recursos del servidor — chips compactos */}
      <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600 }}>Recursos del servidor</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {metrics.map((metric) => {
            const percent = Math.round((metric.used / metric.total) * 100);
            const isOk = percent <= 70;
            const isWarn = percent > 70 && percent <= 90;
            return (
              <div
                key={metric.label}
                style={{
                  flex: "1 1 140px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: isOk ? "rgba(34,197,94,0.08)" : isWarn ? "rgba(234,179,8,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${isOk ? "rgba(34,197,94,0.2)" : isWarn ? "rgba(234,179,8,0.25)" : "rgba(239,68,68,0.25)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="muted" style={{ fontSize: "12px" }}>{metric.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{metric.used}{metric.unit} / {metric.total}{metric.unit}</span>
                </div>
                <div style={{ height: "6px", background: "rgba(0,0,0,0.15)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${percent}%`, height: "100%", background: isOk ? "#22c55e" : isWarn ? "#eab308" : "#ef4444", borderRadius: "3px" }} />
                </div>
                <span className="muted" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendación inteligente — compacta */}
      <div
        className="card"
        style={{
          padding: "20px",
          marginBottom: "16px",
          background: recommendation.status === "OK" ? "rgba(34,197,94,0.06)" : "rgba(234,179,8,0.06)",
          border: `1px solid ${recommendation.status === "OK" ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.25)"}`,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <strong style={{ fontSize: "15px" }}>{recommendation.status === "OK" ? "✅ VPS actual suficiente" : "💡 Recomendación"}</strong>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: "13px" }}>{recommendation.message}</p>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div><span className="muted" style={{ fontSize: "11px" }}>Actual</span><div><strong>{VPS_PLANS[0].name}</strong> · ${VPS_PLANS[0].price}/mes</div></div>
            <div><span className="muted" style={{ fontSize: "11px" }}>Sugerido</span><div><strong>{recommendation.suggested ?? "—"}</strong> · ${recommendation.estimatedCost}/mes</div></div>
            <div><span className="muted" style={{ fontSize: "11px" }}>Pico 7d</span><div><strong>{maxReservedWeek}</strong> asambleas</div></div>
          </div>
        </div>
      </div>

      {/* Calendario y alertas — resumidos con expansión */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <button
            type="button"
            onClick={() => setExpandedCalendar(!expandedCalendar)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            <span>📅 Calendario Feb 2026</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{expandedCalendar ? "▲ Ocultar" : "▼ Ver"}</span>
          </button>
          {!expandedCalendar && (
            <p className="muted" style={{ margin: "12px 0 0", fontSize: "13px" }}>
              {calendarDays.filter((d) => d.reserved > 15).length} días con alta ocupación. Pico: {Math.max(...calendarDays.map((d) => d.reserved))} reservas.
            </p>
          )}
          {expandedCalendar && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                {calendarDays.map((day) => {
                  const status = getCalendarStatus(day.reserved);
                  return (
                    <div
                      key={day.day}
                      style={{
                        width: "36px",
                        padding: "8px",
                        borderRadius: "8px",
                        background: status.tone,
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                      title={`Día ${day.day}: ${day.reserved} reservas - ${status.label}`}
                    >
                      <strong>{day.day}</strong>
                      <div className="muted" style={{ fontSize: "10px" }}>[{day.reserved}]</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", fontSize: "11px" }}>
                {["⚪0", "🟢1-10", "🟡11-20", "🟠21-25", "🔴26-30"].map((l) => (
                  <span key={l} className="muted">{l}</span>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: "12px" }} onClick={handleExportCalendar}>
                Exportar CSV
              </button>
            </>
          )}
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <button
            type="button"
            onClick={() => setExpandedAlerts(!expandedAlerts)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            <span>🔔 Alertas</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {alerts.length} activas · {expandedAlerts ? "▲" : "▼"}
            </span>
          </button>
          {!expandedAlerts && alerts.length > 0 && (
            <p className="muted" style={{ margin: "12px 0 0", fontSize: "13px" }}>
              {alerts[0]?.title} — {alerts[0]?.message.slice(0, 50)}…
            </p>
          )}
          {expandedAlerts && (
            <div style={{ marginTop: "16px" }}>
              {alerts.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>Sin alertas activas.</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: ALERT_COLORS[alert.type],
                      borderLeft: "4px solid rgba(99,102,241,0.6)",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>{alert.title}</strong>
                    <p className="muted" style={{ margin: "6px 0", fontSize: "13px" }}>{alert.message}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {alert.date && <span className="muted" style={{ fontSize: "12px" }}>{alert.date}</span>}
                      <button className="btn btn-ghost btn-sm" onClick={() => handleAcknowledge(alert.id)}>Reconocer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tablas compactas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginTop: "16px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px" }}>Planes VPS</h3>
          <div style={{ fontSize: "13px" }}>
            {VPS_PLANS.map((p) => (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                <span><strong>{p.name}</strong> · {p.capacity} asambleas</span>
                <span>${p.price}/mes</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px" }}>Próximos picos</h3>
          <div style={{ fontSize: "13px" }}>
            {forecast.slice(0, 3).map((item) => (
              <div key={item.date} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                <span>{item.date}</span>
                <span>{item.assemblies} asambleas · {item.users} usuarios</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
