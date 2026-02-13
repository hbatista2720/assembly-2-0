"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const SEED_TICKETS: Record<string, any> = {
  "TKT-2026-021": {
    id: "TKT-2026-021",
    ticket_number: "TKT-2026-021",
    subject: "Error de quórum en PH Costa",
    description: "El sistema reporta error de quórum en asamblea del PH Costa. Revisar configuración y asistencia.",
    status: "open",
    priority: "urgent",
    source: "Chatbot",
    messages: [],
  },
  "TKT-2026-019": {
    id: "TKT-2026-019",
    ticket_number: "TKT-2026-019",
    subject: "Facturación Pro Multi-PH",
    description: "Consulta sobre facturación del plan Pro Multi-PH. Cliente solicita desglose.",
    status: "open",
    priority: "high",
    source: "Email",
    messages: [],
  },
  "TKT-2026-017": {
    id: "TKT-2026-017",
    ticket_number: "TKT-2026-017",
    subject: "Acceso demo expira hoy",
    description: "El acceso demo del cliente expira hoy. ¿Renovar o contactar para conversión?",
    status: "open",
    priority: "high",
    source: "Landing",
    messages: [],
  },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params.id as string) || "";

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/platform-admin/tickets/${encodeURIComponent(ticketId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setTicket(data);
          setFromApi(true);
        } else {
          setTicket(SEED_TICKETS[ticketId] || null);
          setFromApi(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTicket(SEED_TICKETS[ticketId] || null);
          setFromApi(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  async function handleResolve() {
    if (!response.trim()) {
      toast.error("Escribe una respuesta antes de resolver.");
      return;
    }
    if (!ticket) return;
    setSubmitting(true);
    if (fromApi) {
      const res = await fetch(`/api/platform-admin/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", resolution_notes: response }),
      });
      const data = await res.json().catch(() => ({}));
      setSubmitting(false);
      if (res.ok && data?.ok) {
        toast.success("Ticket resuelto.");
        router.push("/dashboard/platform-admin");
      } else {
        toast.error(data?.error || "No se pudo resolver.");
      }
      return;
    }
    setTicket({
      ...ticket,
      status: "resolved",
      resolved_by: "admin_henry",
      resolution_notes: response,
      resolved_at: new Date().toISOString(),
      messages: [...(ticket.messages || []), { role: "admin", content: response, timestamp: new Date().toISOString() }],
    });
    toast.success("Ticket resuelto.");
    setSubmitting(false);
    router.push("/dashboard/platform-admin");
  }

  async function handleEscalate() {
    if (!ticket) return;
    setSubmitting(true);
    if (fromApi) {
      const res = await fetch(`/api/platform-admin/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "escalate" }),
      });
      const data = await res.json().catch(() => ({}));
      setSubmitting(false);
      if (res.ok && data?.ok) {
        toast.success("Ticket escalado.");
        setTicket({ ...ticket, status: "escalated", priority: "urgent" });
      } else {
        toast.error(data?.error || "No se pudo escalar.");
      }
      return;
    }
    setTicket({
      ...ticket,
      status: "escalated",
      escalation_reason: "Escalado manualmente por admin",
      priority: "urgent",
    });
    toast.success("Ticket escalado.");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card">Cargando ticket...</div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="container">
        <div className="card">Ticket no encontrado.</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <button className="btn btn-ghost" onClick={() => router.back()}>
          ← Volver al Dashboard
        </button>
        <h1 style={{ margin: "12px 0 0" }}>Ticket {ticket.ticket_number || ticket.id}</h1>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{ticket.subject}</h2>
        <p className="muted">{ticket.description}</p>
        <div className="card-list" style={{ marginTop: "16px" }}>
          <div className="list-item">
            <span>Estado</span>
            <strong>{ticket.status}</strong>
          </div>
          <div className="list-item">
            <span>Prioridad</span>
            <strong>{ticket.priority}</strong>
          </div>
          <div className="list-item">
            <span>Origen</span>
            <strong>{ticket.source}</strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Responder</h3>
        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          placeholder="Escribe la resolución del ticket..."
          style={{
            width: "100%",
            minHeight: "120px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.3)",
            background: "rgba(15, 23, 42, 0.6)",
            color: "#e2e8f0",
            padding: "12px",
          }}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleResolve} disabled={submitting}>
            Resolver ticket
          </button>
          <button className="btn" onClick={handleEscalate} disabled={submitting}>
            Escalar prioridad
          </button>
        </div>
      </div>
    </main>
  );
}
