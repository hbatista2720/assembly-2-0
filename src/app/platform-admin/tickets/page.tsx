"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  sla: string;
  source: string;
  created_at?: string;
};

const TICKETS_FALLBACK: Ticket[] = [
  { id: "TKT-2026-021", ticket_number: "TKT-2026-021", subject: "Error de quórum en PH Costa", status: "open", priority: "urgent", sla: "1h", source: "Chatbot", created_at: new Date().toISOString() },
  { id: "TKT-2026-019", ticket_number: "TKT-2026-019", subject: "Facturación Pro Multi-PH", status: "open", priority: "high", sla: "4h", source: "Email", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "TKT-2026-017", ticket_number: "TKT-2026-017", subject: "Acceso demo expira hoy", status: "open", priority: "high", sla: "6h", source: "Landing", created_at: new Date(Date.now() - 7200000).toISOString() },
];

const PRIORITY_LABEL: Record<string, string> = { urgent: "Urgente", high: "Alta", medium: "Media", low: "Baja" };
const STATUS_LABEL: Record<string, string> = { open: "Abierto", in_progress: "En curso", escalated: "Escalado", resolved: "Resuelto" };
const STATUS_ORDER = ["open", "in_progress", "escalated", "resolved"];

function priorityColor(p: string) {
  const k = (p || "").toLowerCase();
  if (k === "urgent") return { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#f87171" };
  if (k === "high") return { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", text: "#fb923c" };
  if (k === "medium") return { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)", text: "#facc15" };
  return { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.3)", text: "#94a3b8" };
}

function TicketCard({ ticket, view }: { ticket: Ticket; view: string }) {
  const colors = priorityColor(ticket.priority);
  const href = `/platform-admin/tickets/${ticket.ticket_number || ticket.id}`;
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: view === "tablero" ? "14px 16px" : "16px 20px",
        borderRadius: "12px",
        background: "rgba(30,41,59,0.5)",
        border: "1px solid rgba(148,163,184,0.15)",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
        e.currentTarget.style.background = "rgba(99,102,241,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)";
        e.currentTarget.style.background = "rgba(30,41,59,0.5)";
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: "11px",
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: "6px",
          marginBottom: "8px",
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
        }}
      >
        {PRIORITY_LABEL[ticket.priority] || ticket.priority}
      </span>
      <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{ticket.subject}</div>
      <div className="muted" style={{ fontSize: "12px" }}>
        {ticket.ticket_number} · SLA {ticket.sla} · {ticket.source}
      </div>
      {view === "detalle" && ticket.created_at && (
        <div className="muted" style={{ fontSize: "11px", marginTop: "6px" }}>
          {new Date(ticket.created_at).toLocaleString("es-PA", { dateStyle: "short", timeStyle: "short" })}
        </div>
      )}
    </Link>
  );
}

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"tablero" | "lista" | "detalle">("tablero");
  const [filterStatus, setFilterStatus] = useState<string | "">("");
  const [filterPriority, setFilterPriority] = useState<string | "">("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/platform-admin/tickets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTickets(
            data.map((t: any) => ({
              id: t.id || t.ticket_number,
              ticket_number: t.ticket_number || t.id,
              subject: t.subject,
              status: String(t.status || "open").toLowerCase().replace(/\s+/g, "_"),
              priority: String(t.priority || "medium").toLowerCase(),
              sla: t.sla || "6h",
              source: t.source || "—",
              created_at: t.created_at,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sortedTickets = useMemo(() => {
    const list = [...tickets];
    list.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    return list;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let list = sortedTickets;
    if (filterStatus) {
      list = list.filter((t) => (t.status || "open") === filterStatus);
    }
    if (filterPriority) {
      list = list.filter((t) => (t.priority || "medium") === filterPriority);
    }
    return list;
  }, [sortedTickets, filterStatus, filterPriority]);

  const byStatus = useMemo(() => {
    const groups: Record<string, Ticket[]> = {};
    for (const s of STATUS_ORDER) groups[s] = [];
    for (const t of filteredTickets) {
      const s = t.status || "open";
      if (!groups[s]) groups[s] = [];
      groups[s].push(t);
    }
    return groups;
  }, [filteredTickets]);

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Tickets inteligentes</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          SLA y escalación automática cuando es crítico. Organiza por tablero, lista o lista detallada.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginTop: "16px" }}>
          <span className="muted" style={{ fontSize: "12px" }}>Vista:</span>
          {(["tablero", "lista", "detalle"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={`btn ${view === v ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "8px 14px", fontSize: "13px" }}
              onClick={() => setView(v)}
            >
              {v === "tablero" ? "Tablero" : v === "lista" ? "Lista" : "Lista detallada"}
            </button>
          ))}
          <span style={{ width: "1px", height: "24px", background: "rgba(148,163,184,0.3)", margin: "0 8px" }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.6)",
              color: "#e2e8f0",
              fontSize: "13px",
            }}
          >
            <option value="">Todos los estados</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.6)",
              color: "#e2e8f0",
              fontSize: "13px",
            }}
          >
            <option value="">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card"><p className="muted">Cargando tickets…</p></div>
      ) : view === "tablero" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {STATUS_ORDER.map((status) => {
            const list = byStatus[status] || [];
            const label = STATUS_LABEL[status] || status;
            const isOpen = status === "open";
            const isResolved = status === "resolved";
            return (
              <div
                key={status}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: "rgba(30,41,59,0.4)",
                  border: "1px solid rgba(148,163,184,0.15)",
                  minHeight: "200px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{label}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      background: isOpen ? "rgba(99,102,241,0.2)" : isResolved ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                      color: isOpen ? "#a5b4fc" : isResolved ? "#4ade80" : "#94a3b8",
                    }}
                  >
                    {list.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {list.length === 0 ? (
                    <p className="muted" style={{ fontSize: "13px", margin: 0 }}>Sin tickets</p>
                  ) : (
                    list.map((t) => <TicketCard key={t.id} ticket={t} view="tablero" />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === "lista" ? (
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}>Ticket</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}>Asunto</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}>Prioridad</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}>SLA</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}>Origen</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "12px", color: "#94a3b8" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const colors = priorityColor(t.priority);
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500 }}>{t.ticket_number}</td>
                    <td style={{ padding: "14px 16px", fontSize: "14px" }}>{t.subject}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: colors.bg, color: colors.text }}>
                        {PRIORITY_LABEL[t.priority] || t.priority}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px" }}>{t.sla}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px" }}>{t.source}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Link className="btn btn-primary btn-sm" href={`/platform-admin/tickets/${t.ticket_number || t.id}`}>
                        Revisar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <p className="muted" style={{ padding: "32px", textAlign: "center", margin: 0 }}>No hay tickets que coincidan con los filtros.</p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTickets.map((t) => {
            const colors = priorityColor(t.priority);
            const href = `/platform-admin/tickets/${t.ticket_number || t.id}`;
            return (
              <div
                key={t.id}
                style={{
                  padding: "20px",
                  background: "rgba(30,41,59,0.4)",
                  borderRadius: "12px",
                  border: "1px solid rgba(148,163,184,0.15)",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px", background: colors.bg, color: colors.text }}>{PRIORITY_LABEL[t.priority] || t.priority}</span>
                    <span className="muted" style={{ fontSize: "12px" }}>{t.ticket_number}</span>
                    <span className="muted" style={{ fontSize: "12px" }}>{STATUS_LABEL[t.status] || t.status}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>{t.subject}</div>
                  <div className="muted" style={{ fontSize: "13px" }}>
                    SLA {t.sla} · Origen {t.source}
                    {t.created_at && ` · ${new Date(t.created_at).toLocaleString("es-PA", { dateStyle: "medium", timeStyle: "short" })}`}
                  </div>
                </div>
                <Link className="btn btn-primary" href={href} style={{ flexShrink: 0 }}>
                  Revisar y responder
                </Link>
              </div>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="card"><p className="muted" style={{ margin: 0, textAlign: "center", padding: "32px" }}>No hay tickets que coincidan con los filtros.</p></div>
          )}
        </div>
      )}
    </>
  );
}
