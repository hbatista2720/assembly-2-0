"use client";

import { useEffect, useState } from "react";

const TICKETS_FALLBACK = [
  { id: "TKT-2026-021", ticket_number: "TKT-2026-021", subject: "Error de quórum en PH Costa", priority: "Urgente", sla: "1h", source: "Chatbot" },
  { id: "TKT-2026-019", ticket_number: "TKT-2026-019", subject: "Facturación Pro Multi-PH", priority: "Alta", sla: "4h", source: "Email" },
  { id: "TKT-2026-017", ticket_number: "TKT-2026-017", subject: "Acceso demo expira hoy", priority: "Alta", sla: "6h", source: "Landing" },
];

const PRIORITY_LABEL: Record<string, string> = { urgent: "Urgente", high: "Alta", medium: "Media", low: "Baja" };

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<typeof TICKETS_FALLBACK>(TICKETS_FALLBACK);

  useEffect(() => {
    fetch("/api/platform-admin/tickets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTickets(
            data.map((t: any) => ({
              id: t.ticket_number || t.id,
              ticket_number: t.ticket_number,
              subject: t.subject,
              priority: PRIORITY_LABEL[t.priority] || t.priority,
              sla: t.sla || "6h",
              source: t.source,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="card" style={{ marginBottom: "16px" }}>
        <a href="/dashboard/admin" className="btn btn-ghost">
          ← Volver al Dashboard
        </a>
        <h1 style={{ margin: "12px 0 0" }}>Tickets inteligentes</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          SLA y escalación automática cuando es crítico.
        </p>
      </div>

      <div className="grid grid-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card">
            <span className="pill">{ticket.priority}</span>
            <h3 style={{ margin: "12px 0 6px" }}>{ticket.subject}</h3>
            <p style={{ color: "#cbd5f5", margin: 0 }}>
              {ticket.ticket_number || ticket.id} · SLA {ticket.sla} · Origen {ticket.source}
            </p>
            <a className="btn" style={{ marginTop: "16px" }} href={`/platform-admin/tickets/${ticket.ticket_number || ticket.id}`}>
              Revisar ticket
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
