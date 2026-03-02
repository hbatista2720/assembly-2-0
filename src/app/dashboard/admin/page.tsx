"use client";

import { useEffect, useState, useMemo } from "react";
import PlatformAdminShell from "../../platform-admin/PlatformAdminShell";
import { getAlertConfig, setAlertConfig, getAlertLabels, type AlertConfig, type AlertType } from "../../../lib/alertNotificationsConfig";

const KPI_FALLBACK = [
  { label: "Funnel Conversión", value: "18.4%", note: "Desde BD" },
  { label: "Demos Activos", value: "—", note: "En curso" },
  { label: "Tickets Urgentes", value: "3", note: "2 requieren escalación" },
  { label: "Clientes Activos", value: "45", note: "Desde BD" },
];

const FUNNEL_STAGES_FALLBACK = [
  { stage: "New Lead", count: 64, color: "#38bdf8" },
  { stage: "Qualified", count: 28, color: "#22c55e" },
  { stage: "Demo Active", count: 12, color: "#f59e0b" },
  { stage: "Converted", count: 6, color: "#8b5cf6" },
];

const TICKETS = [
  { id: "TKT-2026-021", subject: "Error de quórum en PH Costa", priority: "Urgente", sla: "1h", owner: "Chatbot" },
  { id: "TKT-2026-019", subject: "Facturación Pro Multi-PH", priority: "Alta", sla: "4h", owner: "Email" },
  { id: "TKT-2026-017", subject: "Acceso demo expira hoy", priority: "Alta", sla: "6h", owner: "Landing" },
];

const CLIENTS_FALLBACK = [
  { name: "Administradora Panamá", plan: "Pro Multi-PH", buildings: "25", health: "Excelente" },
  { name: "Urban Tower PH", plan: "Standard", buildings: "1", health: "Bueno" },
  { name: "Pacific Developments", plan: "Enterprise + CRM", buildings: "12", health: "Atención" },
];

const CAMPAIGNS = [
  { name: "Demo 14 días - Admin PH", status: "Activa", next: "Enviar recordatorio día 5" },
  { name: "Reactivación Leads Fríos", status: "Pausada", next: "Revisar copy de valor" },
  { name: "Upgrade Pay-Per-Event", status: "Activa", next: "Oferta 50% primer mes" },
];

const STAGE_COLORS: Record<string, string> = {
  new_lead: "#38bdf8",
  qualified: "#22c55e",
  demo_active: "#f59e0b",
  converted: "#8b5cf6",
};
const STAGE_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  qualified: "Qualified",
  demo_active: "Demo Active",
  converted: "Converted",
};

type LeadRow = { id?: string; email?: string; company_name?: string; funnel_stage?: string; lead_qualified?: boolean };
type ClientRow = { id?: string; name?: string; plan?: string; status?: string; buildings?: number };

export default function AdminInteligenteDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Admin Plataforma");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [alertConfigModalOpen, setAlertConfigModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [leadsData, setLeadsData] = useState<LeadRow[] | null>(null);
  const [clientsData, setClientsData] = useState<ClientRow[] | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [alertConfigForm, setAlertConfigForm] = useState<AlertConfig>(() => getAlertConfig());

  useEffect(() => {
    const storedEmail = localStorage.getItem("assembly_email") || "";
    const storedRole = localStorage.getItem("assembly_role") || "";
    const storedDisplay = localStorage.getItem("assembly_platform_admin_display_name") || "";
    setUserEmail(storedEmail);
    setUserRole(storedRole === "admin-ph" ? "Admin PH" : "Admin Plataforma");
    setSavedDisplayName(storedDisplay);
  }, []);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (Array.isArray(data) ? setLeadsData(data) : setLeadsData(null)))
      .catch(() => setLeadsData(null));
  }, []);
  useEffect(() => {
    fetch("/api/platform-admin/clients")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (Array.isArray(data) ? setClientsData(data) : setClientsData(null)))
      .catch(() => setClientsData(null));
  }, []);

  useEffect(() => {
    fetch("/api/platform-admin/pending-orders")
      .then((res) => res.json())
      .then((data) => {
        const orders = data?.orders || [];
        setPendingApprovalsCount(Array.isArray(orders) ? orders.length : 0);
      })
      .catch(() => setPendingApprovalsCount(0));
  }, []);

  useEffect(() => {
    if (alertConfigModalOpen) {
      const cfg = getAlertConfig();
      if (cfg.emails.length === 0 && userEmail) {
        setAlertConfigForm({ ...cfg, emails: [userEmail] });
      } else {
        setAlertConfigForm(cfg);
      }
    }
  }, [alertConfigModalOpen, userEmail]);

  const kpi = useMemo(() => {
    if (leadsData && leadsData.length > 0) {
      const total = leadsData.length;
      const qualified = leadsData.filter((l) => (l.funnel_stage || "").toLowerCase() !== "new_lead").length;
      const pct = total ? Math.round((qualified / total) * 1000) / 10 : 0;
      const clientsCount = Array.isArray(clientsData) ? clientsData.length : 0;
      const demos = leadsData.filter((l) => (l.funnel_stage || "").toLowerCase() === "demo_active").length;
      return [
        { label: "Funnel Conversión", value: `${pct}%`, note: "Desde BD" },
        { label: "Demos Activos", value: String(demos), note: "En demo dashboard" },
        { label: "Tickets Urgentes", value: "3", note: "2 requieren escalación" },
        { label: "Clientes Activos", value: String(clientsCount || 45), note: clientsCount ? "Desde BD" : "—" },
      ];
    }
    if (Array.isArray(clientsData) && clientsData.length > 0) {
      return [
        KPI_FALLBACK[0],
        { label: "Demos Activos", value: "—", note: "Ver Funnel de leads" },
        KPI_FALLBACK[2],
        { label: "Clientes Activos", value: String(clientsData.length), note: "Desde BD" },
      ];
    }
    return KPI_FALLBACK;
  }, [leadsData, clientsData]);

  const funnelStages = useMemo(() => {
    if (!leadsData || leadsData.length === 0) return FUNNEL_STAGES_FALLBACK;
    const counts: Record<string, number> = {};
    for (const l of leadsData) {
      const s = (l.funnel_stage || "new_lead").toLowerCase().replace(/\s+/g, "_");
      counts[s] = (counts[s] || 0) + 1;
    }
    const order = ["new_lead", "qualified", "demo_active", "converted"];
    return order.map((key) => ({
      stage: STAGE_LABELS[key] || key,
      count: counts[key] ?? 0,
      color: STAGE_COLORS[key] || "#64748b",
    })).filter((r) => r.count > 0).length > 0
      ? order.map((key) => ({
          stage: STAGE_LABELS[key] || key,
          count: counts[key] ?? 0,
          color: STAGE_COLORS[key] || "#64748b",
        }))
      : FUNNEL_STAGES_FALLBACK;
  }, [leadsData]);

  const clients = useMemo(() => {
    if (!Array.isArray(clientsData) || clientsData.length === 0) return CLIENTS_FALLBACK;
    return clientsData.slice(0, 6).map((c) => ({
      name: c.name || "Sin nombre",
      plan: c.plan || "Standard",
      buildings: String(c.buildings ?? 1),
      health: c.status === "Activo" ? "Excelente" : c.status === "Suspendido" ? "Atención" : "Bueno",
    }));
  }, [clientsData]);

  const headerLabel = savedDisplayName.trim() ? `${savedDisplayName.trim()} (${userEmail || "admin@assembly2.com"})` : (userEmail || "admin@assembly2.com");

  const openProfileModal = () => {
    setDisplayName(localStorage.getItem("assembly_platform_admin_display_name") || "");
    setProfileModalOpen(true);
  };

  const saveProfile = () => {
    const trimmed = displayName.trim();
    try {
      if (trimmed) {
        localStorage.setItem("assembly_platform_admin_display_name", trimmed);
        setSavedDisplayName(trimmed);
      } else {
        localStorage.removeItem("assembly_platform_admin_display_name");
        setSavedDisplayName("");
      }
    } catch {
      // ignore
    }
    setProfileModalOpen(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("assembly_role");
      localStorage.removeItem("assembly_email");
      document.cookie = "assembly_role=; path=/; max-age=0";
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  return (
    <main className="container platform-admin-container">
      <PlatformAdminShell>
          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div
                className="icon-badge"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.8), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
                  border: "1px solid rgba(99, 102, 241, 0.7)",
                  boxShadow: "0 10px 24px rgba(99, 102, 241, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "18px" }}>👤</span>
              </div>
              <div style={{ flex: 1 }}>
                <strong>{headerLabel}</strong>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {userRole} · Suscripción Plataforma
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-ghost" onClick={openProfileModal}>
                  Editar perfil
                </button>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span className="pill">Estado general</span>
                  {(pendingApprovalsCount > 0 || getAlertConfig().enabled) && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: pendingApprovalsCount > 0 ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
                        border: `1px solid ${pendingApprovalsCount > 0 ? "rgba(239,68,68,0.35)" : "rgba(99,102,241,0.3)"}`,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      <span aria-hidden>🔔</span>
                      {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} alerta${pendingApprovalsCount > 1 ? "s" : ""}` : "Notificaciones activas"}
                    </span>
                  )}
                </div>
                <h1 style={{ margin: "12px 0 8px" }}>Dashboard Administrativo Inteligente</h1>
                <p style={{ color: "#cbd5f5", margin: 0 }}>
                  Seguimiento completo de ventas, soporte y crecimiento de la plataforma.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setAlertConfigModalOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span aria-hidden>⚙️</span>
                  Configurar alertas
                </button>
                <a className="btn" href="/api/platform-admin/leads/export?format=csv" download target="_blank" rel="noopener noreferrer">
                  Exportar reporte (CSV)
                </a>
                <a className="btn btn-ghost" href="/platform-admin/monitoring">
                  Ver monitor VPS
                </a>
                <a className="btn btn-ghost" href="/platform-admin/clients">
                  Abrir comunidades
                </a>
                <a className="btn btn-primary" href="/platform-admin/leads?stage=demo_active">
                  Activar demo
                </a>
              </div>
            </div>
          </div>

          <div className="chart-grid">
            {kpi.map((item) => (
              <div key={item.label} className="card">
                <p style={{ margin: 0, color: "#94a3b8" }}>{item.label}</p>
                <h3 style={{ margin: "10px 0" }}>{item.value}</h3>
                <p style={{ margin: 0, color: "#a5b4fc", fontSize: "14px" }}>{item.note}</p>
              </div>
            ))}
            <div
              className="card"
              style={{
                border: "1px solid rgba(99,102,241,0.25)",
                background: getAlertConfig().enabled ? "rgba(99,102,241,0.08)" : "rgba(30,41,59,0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>🔔</span>
                <p style={{ margin: 0, color: "#94a3b8" }}>Notificaciones</p>
              </div>
              <h3 style={{ margin: "8px 0" }}>
                {getAlertConfig().enabled ? "Activas" : "Desactivadas"}
              </h3>
              <p style={{ margin: 0, color: "#a5b4fc", fontSize: "13px" }}>
                {getAlertConfig().emails.length} correo(s) · {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} alerta(s)` : "Sin alertas"}
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: "12px" }}
                onClick={() => setAlertConfigModalOpen(true)}
              >
                Configurar
              </button>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3 style={{ marginTop: 0 }}>Resumen mensual</h3>
              <p className="muted" style={{ marginTop: 0 }}>
                Conversion y actividad por semanas
              </p>
              <svg width="100%" height="140" viewBox="0 0 360 140" role="img" aria-label="Grafica semanal">
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points="0,110 60,90 120,95 180,70 240,60 300,65 360,40"
                />
                <circle cx="360" cy="40" r="4" fill="#38bdf8" />
              </svg>
              <div className="chart-bar">
                <span style={{ width: "68%" }} />
              </div>
              <p className="muted" style={{ margin: "10px 0 0" }}>
                Meta mensual completada 68%
              </p>
            </div>
            <div className="chart-card">
              <h3 style={{ marginTop: 0 }}>Vista anual</h3>
              <p className="muted" style={{ marginTop: 0 }}>
                Ingresos por mes
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  { label: "Ene", value: 48 },
                  { label: "Feb", value: 62 },
                  { label: "Mar", value: 74 },
                  { label: "Abr", value: 88 },
                ].map((item) => (
                  <div key={item.label} style={{ display: "grid", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{item.label}</span>
                      <span className="muted">${item.value}k</span>
                    </div>
                    <div className="chart-bar">
                      <span style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section id="leads" className="section">
            <h2 className="section-title">Funnel de Leads</h2>
            <p className="section-subtitle">Conversion automatica con calificacion por chatbot.</p>
            <div className="grid grid-3">
              <div className="card" style={{ gridColumn: "span 2" }}>
                <h3 style={{ marginTop: 0 }}>Pipeline</h3>
                <div className="card-list">
                  {funnelStages.map((stage) => (
                    <div key={stage.stage} className="list-item">
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: stage.color }} />
                      <span style={{ flex: 1 }}>{stage.stage}</span>
                      <strong>{stage.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Últimos leads</h3>
                <div className="card-list">
                  {(leadsData && leadsData.length > 0
                    ? leadsData.slice(0, 5).map((l) => ({ id: l.id || "", label: l.company_name || l.email || "Sin nombre" }))
                    : [{ id: "1", label: "Laura Gomez · Administradora" }, { id: "2", label: "Carlos Ruiz · Junta" }, { id: "3", label: "PH Vista Azul · Promotora" }]
                  ).map((lead) => (
                    <div key={lead.id || lead.label} className="list-item">
                      <span>👤</span>
                      <span>{lead.label}</span>
                    </div>
                  ))}
                </div>
                <a className="btn" style={{ marginTop: "16px" }} href="/platform-admin/leads">
                  Ver lista completa
                </a>
              </div>
            </div>
          </section>

          <section id="tickets" className="section">
            <h2 className="section-title">Tickets Inteligentes</h2>
            <p className="section-subtitle">SLA y escalación automática cuando es crítico.</p>
            <div className="grid grid-3">
              {TICKETS.map((ticket) => (
                <div key={ticket.id} className="card">
                  <span className="pill">{ticket.priority}</span>
                  <h3 style={{ margin: "12px 0 6px" }}>{ticket.subject}</h3>
                  <p style={{ color: "#cbd5f5", margin: 0 }}>
                    {ticket.id} · SLA {ticket.sla} · Origen {ticket.owner}
                  </p>
                  <a className="btn" style={{ marginTop: "16px" }} href={`/platform-admin/tickets/${ticket.id}`}>
                    Revisar ticket
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section id="comunidades" className="section">
            <h2 className="section-title">Comunidades y Leads</h2>
            <p className="section-subtitle">Salud de cuentas, tipo de propiedad, proceso de asambleas y demos activas.</p>
            <div className="grid grid-3">
              {clients.map((client) => (
                <div key={client.name} className="card">
                  <h3 style={{ marginTop: 0 }}>{client.name}</h3>
                  <p style={{ color: "#cbd5f5", margin: 0 }}>{client.plan}</p>
                  <div className="card-list" style={{ marginTop: "12px" }}>
                    <div className="list-item">
                      <span>🏢</span>
                      <span>{client.buildings} {Number(client.buildings) === 1 ? "comunidad" : "comunidades"}</span>
                    </div>
                    <div className="list-item">
                      <span>✅</span>
                      <span>Salud: {client.health}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
              <a className="btn" href="/platform-admin/clients">
                Gestionar comunidades
              </a>
              <a className="btn btn-ghost" href="/dashboard/admin-ph/proceso-asamblea">
                Proceso de asambleas
              </a>
            </div>
          </section>

          <section id="crm" className="section">
            <h2 className="section-title">CRM y Campañas Automatizadas</h2>
            <p className="section-subtitle">Seguimiento automático por etapa del funnel.</p>
            <div className="grid grid-3">
              {CAMPAIGNS.map((campaign) => (
                <div key={campaign.name} className="card">
                  <span className="pill">{campaign.status}</span>
                  <h3 style={{ marginTop: "12px" }}>{campaign.name}</h3>
                  <p style={{ color: "#cbd5f5" }}>Siguiente acción: {campaign.next}</p>
                  <a className="btn" href="/platform-admin/crm">
                    Configurar
                  </a>
                </div>
              ))}
            </div>
          </section>
      </PlatformAdminShell>

      {alertConfigModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-config-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 51,
          }}
          onClick={() => setAlertConfigModalOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", margin: "16px", width: "100%", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="alert-config-modal-title" style={{ marginTop: 0 }}>Configurar alertas y notificaciones</h2>
            <p className="muted" style={{ marginBottom: "20px" }}>
              Recibe correos cuando haya órdenes pendientes, tickets urgentes, leads nuevos, etc. Soporta múltiples direcciones.
            </p>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={alertConfigForm.enabled}
                onChange={(e) => setAlertConfigForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              <span>Activar envío de notificaciones por correo</span>
            </label>

            <div style={{ marginBottom: "20px" }}>
              <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>Correos de notificación (Henry y equipo)</span>
              {alertConfigForm.emails.map((email, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const next = [...alertConfigForm.emails];
                      next[i] = e.target.value;
                      setAlertConfigForm((f) => ({ ...f, emails: next }));
                    }}
                    placeholder="ejemplo@assembly2.com"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: "rgba(15,23,42,0.6)",
                      color: "#e2e8f0",
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setAlertConfigForm((f) => ({ ...f, emails: f.emails.filter((_, j) => j !== i) }))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setAlertConfigForm((f) => ({ ...f, emails: [...f.emails, ""] }))}
              >
                + Añadir correo
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "10px" }}>Tipos de alerta</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(Object.keys(getAlertLabels()) as AlertType[]).map((type) => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={alertConfigForm.alertTypes.includes(type)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...alertConfigForm.alertTypes, type]
                          : alertConfigForm.alertTypes.filter((t) => t !== type);
                        setAlertConfigForm((f) => ({ ...f, alertTypes: next }));
                      }}
                    />
                    <span>{getAlertLabels()[type]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "10px" }}>Resumen de campañas (digest)</span>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={alertConfigForm.campaignDigest}
                  onChange={(e) => setAlertConfigForm((f) => ({ ...f, campaignDigest: e.target.checked }))}
                />
                <span>Incluir resumen de campañas en notificaciones</span>
              </label>
              <select
                value={alertConfigForm.campaignFrequency}
                onChange={(e) => setAlertConfigForm((f) => ({ ...f, campaignFrequency: e.target.value as "daily" | "weekly" | "off" }))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15,23,42,0.6)",
                  color: "#e2e8f0",
                }}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="off">Desactivado</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAlertConfig({
                    ...alertConfigForm,
                    emails: alertConfigForm.emails.filter((e) => e.trim()),
                  });
                  setAlertConfigModalOpen(false);
                }}
              >
                Guardar
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setAlertConfigModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "400px", margin: "16px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="profile-modal-title" style={{ marginTop: 0 }}>Editar perfil</h2>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Datos de sesión (solo lectura). Puedes definir un nombre para mostrar.
            </p>
            <div style={{ display: "grid", gap: "12px" }}>
              <label style={{ display: "grid", gap: "4px" }}>
                <span className="muted" style={{ fontSize: "12px" }}>Correo</span>
                <input
                  type="text"
                  value={userEmail || ""}
                  readOnly
                  disabled
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#94a3b8",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "4px" }}>
                <span className="muted" style={{ fontSize: "12px" }}>Rol</span>
                <input
                  type="text"
                  value={userRole}
                  readOnly
                  disabled
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#94a3b8",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "4px" }}>
                <span className="muted" style={{ fontSize: "12px" }}>Nombre para mostrar (opcional)</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Henry"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "#e2e8f0",
                  }}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button type="button" className="btn btn-primary" onClick={saveProfile}>
                Guardar
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setProfileModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
