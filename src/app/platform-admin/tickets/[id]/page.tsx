"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const seedTickets = useMemo(
    () => ({
      "tkt-001": {
        id: "tkt-001",
        ticket_number: "A2-1001",
        subject: "Asamblea no inicia en modo demo",
        description: "El administrador no puede iniciar la asamblea demo desde el dashboard.",
        status: "open",
        priority: "high",
        source: "web",
        messages: [],
      },
      "tkt-002": {
        id: "tkt-002",
        ticket_number: "A2-1002",
        subject: "Consulta sobre votación manual",
        description: "Se requiere guía rápida para registrar votos manuales.",
        status: "open",
        priority: "medium",
        source: "telegram",
        messages: [],
      },
    }),
    [],
  );

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, seedTickets]);

  async function loadTicket() {
    setLoading(true);
    setTicket(seedTickets[ticketId] || null);
    setLoading(false);
  }

  async function handleResolve() {
    if (!response.trim()) {
      toast.error("Escribe una respuesta antes de resolver.");
      return;
    }
    if (!ticket) return;
    setSubmitting(true);
    const updatedMessages = [
      ...(ticket.messages || []),
      { role: "admin", content: response, timestamp: new Date().toISOString() },
    ];
    setTicket({
      ...ticket,
      status: "resolved",
      resolved_by: "admin_henry",
      resolution_notes: response,
      resolved_at: new Date().toISOString(),
      messages: updatedMessages,
    });
    toast.success("Ticket resuelto.");
    setSubmitting(false);
    router.push("/dashboard/platform-admin");
  }

  async function handleEscalate() {
    if (!ticket) return;
    setSubmitting(true);
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
