"use client";

import { useEffect, useState } from "react";

const KPI = [
  { label: "Funnel Conversión", value: "18.4%", note: "↑ +2.1% esta semana" },
  { label: "Tickets Urgentes", value: "3", note: "2 requieren escalación" },
  { label: "Clientes Activos", value: "45", note: "8 demos en curso" },
];

const FUNNEL_STAGES = [
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

const CLIENTS = [
  { name: "Administradora Panamá", plan: "Pro Multi-PH", buildings: "25", health: "Excelente" },
  { name: "Urban Tower PH", plan: "Standard", buildings: "1", health: "Bueno" },
  { name: "Pacific Developments", plan: "Enterprise + CRM", buildings: "12", health: "Atención" },
];

const CAMPAIGNS = [
  { name: "Demo 14 días - Admin PH", status: "Activa", next: "Enviar recordatorio día 5" },
  { name: "Reactivación Leads Fríos", status: "Pausada", next: "Revisar copy de valor" },
  { name: "Upgrade Pay-Per-Event", status: "Activa", next: "Oferta 50% primer mes" },
];

export default function AdminInteligenteDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Admin Plataforma");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("assembly_email") || "";
    const storedRole = localStorage.getItem("assembly_role") || "";
    const storedDisplay = localStorage.getItem("assembly_platform_admin_display_name") || "";
    setUserEmail(storedEmail);
    setUserRole(storedRole === "admin-ph" ? "Admin PH" : "Admin Plataforma");
    setSavedDisplayName(storedDisplay);
  }, []);

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
    <main className="container">
      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <span className="pill">Assembly 2.0</span>
            <h3 style={{ margin: "12px 0 4px" }}>Admin Plataforma</h3>
            <p className="muted" style={{ margin: 0 }}>
              Panel maestro de la operación
            </p>
          </div>
          <nav style={{ display: "grid", gap: "10px" }}>
            <a className="sidebar-link active" href="/dashboard/admin">
              📊 Resumen ejecutivo
            </a>
            <a className="sidebar-link" href="/platform-admin/monitoring">
              🖥️ Monitor VPS
            </a>
            <a className="sidebar-link" href="/platform-admin/clients">
              👥 Gestión de clientes
            </a>
            <a className="sidebar-link" href="/platform-admin/business">
              💹 Métricas de negocio
            </a>
            <a className="sidebar-link" href="/platform-admin/leads">
              🎯 Funnel de leads
            </a>
            <a className="sidebar-link" href="/platform-admin/tickets">
              🎫 Tickets inteligentes
            </a>
            <a className="sidebar-link" href="/platform-admin/clients">
              👥 Clientes y demos
            </a>
            <a className="sidebar-link" href="/platform-admin/crm">
              📣 CRM y campañas
            </a>
            <a className="sidebar-link" href="/platform-admin/chatbot-config">
              🤖 Configuración Chatbot
            </a>
          </nav>
          <div style={{ marginTop: "auto", display: "grid", gap: "10px" }}>
            <a className="btn btn-ghost" href="/">
              Volver a landing
            </a>
            <a className="btn btn-primary" href="/demo">Crear demo</a>
          </div>
        </aside>

        <section className="content-area">
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
                <span className="pill">Estado general</span>
                <h1 style={{ margin: "12px 0 8px" }}>Dashboard Administrativo Inteligente</h1>
                <p style={{ color: "#cbd5f5", margin: 0 }}>
                  Seguimiento completo de ventas, soporte y crecimiento de la plataforma.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a className="btn" href="/platform-admin/leads">
                  Exportar reporte
                </a>
                <a className="btn btn-ghost" href="/platform-admin/monitoring">
                  Ver monitor VPS
                </a>
                <a className="btn btn-ghost" href="/platform-admin/clients">
                  Abrir clientes
                </a>
                <a className="btn btn-primary" href="/platform-admin/leads?stage=demo_active">
                  Activar demo
                </a>
              </div>
            </div>
          </div>

          <div className="chart-grid">
            {KPI.map((item) => (
              <div key={item.label} className="card">
                <p style={{ margin: 0, color: "#94a3b8" }}>{item.label}</p>
                <h3 style={{ margin: "10px 0" }}>{item.value}</h3>
                <p style={{ margin: 0, color: "#a5b4fc", fontSize: "14px" }}>{item.note}</p>
              </div>
            ))}
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
                  {FUNNEL_STAGES.map((stage) => (
                    <div key={stage.stage} className="list-item">
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: stage.color }} />
                      <span style={{ flex: 1 }}>{stage.stage}</span>
                      <strong>{stage.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Ultimos leads</h3>
                <div className="card-list">
                  {["Laura Gomez · Administradora", "Carlos Ruiz · Junta", "PH Vista Azul · Promotora"].map((lead) => (
                    <div key={lead} className="list-item">
                      <span>👤</span>
                      <span>{lead}</span>
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

          <section id="clientes" className="section">
            <h2 className="section-title">Clientes y Leads</h2>
            <p className="section-subtitle">Salud de cuentas, upgrades y demos activas.</p>
            <div className="grid grid-3">
              {CLIENTS.map((client) => (
                <div key={client.name} className="card">
                  <h3 style={{ marginTop: 0 }}>{client.name}</h3>
                  <p style={{ color: "#cbd5f5", margin: 0 }}>{client.plan}</p>
                  <div className="card-list" style={{ marginTop: "12px" }}>
                    <div className="list-item">
                      <span>🏢</span>
                      <span>{client.buildings} edificios</span>
                    </div>
                    <div className="list-item">
                      <span>✅</span>
                      <span>Salud: {client.health}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a className="btn" style={{ marginTop: "16px" }} href="/platform-admin/clients">
              Gestionar clientes
            </a>
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
        </section>
      </div>

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
