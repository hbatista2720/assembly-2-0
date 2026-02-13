"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";

const TICKETS_INITIAL = [
  { id: "PH-101", subject: "Face ID sin activar", status: "Abierto", sla: "24h" },
  { id: "PH-099", subject: "Actualizacion de plan", status: "En seguimiento", sla: "48h" },
];

const CHAT_STORAGE_KEY = "assembly_admin_support_chat";

type ChatMessage = { role: "user" | "support"; text: string; at: string };

function loadChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveChatMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

function SupportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openChat = searchParams.get("open") === "chat";
  const openNew = searchParams.get("open") === "new";
  const messageParam = searchParams.get("message") ?? "";

  const [tickets, setTickets] = useState(TICKETS_INITIAL);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketBody, setNewTicketBody] = useState("");
  const [newTicketSent, setNewTicketSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages(loadChatMessages());
  }, []);

  useEffect(() => {
    if (messageParam && openChat) {
      setChatMessages((prev) => {
        const next = [...prev, { role: "user", text: messageParam, at: new Date().toISOString() }];
        saveChatMessages(next);
        return next;
      });
      router.replace("/dashboard/admin-ph/support?open=chat", { scroll: false });
    }
  }, [messageParam, openChat, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg: ChatMessage = { role: "user", text, at: new Date().toISOString() };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    saveChatMessages(next);
    setChatInput("");
    setTimeout(() => {
      const supportReply: ChatMessage = {
        role: "support",
        text: "Gracias por tu mensaje. Hemos registrado tu consulta y te responderemos por este chat o por correo en las próximas 24 h. Si es urgente, indica «Urgente» en el asunto de un nuevo ticket.",
        at: new Date().toISOString(),
      };
      setChatMessages((p) => {
        const n = [...p, supportReply];
        saveChatMessages(n);
        return n;
      });
    }, 800);
  };

  const submitNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = newTicketSubject.trim() || "Sin asunto";
    const body = newTicketBody.trim();
    if (!body) return;
    const id = `PH-${String(100 + tickets.length).padStart(3, "0")}`;
    setTickets((prev) => [...prev, { id, subject, status: "Abierto", sla: "24h" }]);
    setNewTicketSubject("");
    setNewTicketBody("");
    setNewTicketSent(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>Soporte</h2>
            <p className="muted" style={{ marginTop: "6px" }}>
              Tickets, chat de ayuda y base de conocimiento. Te atendemos para resolver incidencias y dudas.
            </p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/admin-ph/support?open=new">
            Nuevo ticket
          </Link>
        </div>
      </div>

      <div className="card" style={{ border: "1px solid rgba(99, 102, 241, 0.25)", background: "rgba(99, 102, 241, 0.04)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "8px" }}>💬 Chat de ayuda</h3>
        <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
          Zona estratégica para consultas rápidas. Escribe tu mensaje y lo atendemos como ticket o respuesta en chat.
        </p>
        <div
          style={{
            minHeight: 200,
            maxHeight: 320,
            overflowY: "auto",
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(15, 23, 42, 0.4)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            marginBottom: "12px",
          }}
        >
          {chatMessages.length === 0 && (
            <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
              Aún no hay mensajes. Escribe abajo para iniciar la conversación con soporte.
            </p>
          )}
          {chatMessages.map((m, i) => (
            <div
              key={i}
              style={{
                textAlign: m.role === "user" ? "right" : "left",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "85%",
                  background: m.role === "user" ? "rgba(99, 102, 241, 0.25)" : "rgba(148, 163, 184, 0.15)",
                  fontSize: "14px",
                }}
              >
                {m.text}
              </span>
              <div className="muted" style={{ fontSize: "11px", marginTop: "2px" }}>
                {m.role === "user" ? "Tú" : "Soporte"}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escribe tu consulta o problema..."
            rows={2}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(148, 163, 184, 0.3)",
              background: "rgba(15, 23, 42, 0.5)",
              color: "var(--color-text, #f1f5f9)",
              fontSize: 14,
              resize: "vertical",
              minHeight: 48,
            }}
          />
          <button type="button" className="btn btn-primary" onClick={sendChatMessage} disabled={!chatInput.trim()}>
            Enviar
          </button>
        </div>
      </div>

      {(openNew || newTicketSent) && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{newTicketSent ? "Ticket creado" : "Nuevo ticket"}</h3>
          {newTicketSent ? (
            <p className="muted" style={{ margin: "0 0 12px" }}>
              Hemos registrado tu ticket. Te contactaremos según el SLA indicado. <Link href="/dashboard/admin-ph/support">Ver todos los tickets</Link>
            </p>
          ) : (
            <form onSubmit={submitNewTicket}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                Asunto
              </label>
              <input
                type="text"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Ej. Error al crear asamblea"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, marginBottom: "12px" }}
              />
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                Mensaje <span style={{ color: "var(--color-error, #ef4444)" }}>*</span>
              </label>
              <textarea
                value={newTicketBody}
                onChange={(e) => setNewTicketBody(e.target.value)}
                placeholder="Describe el problema o consulta..."
                rows={4}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, marginBottom: "12px", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-primary" disabled={!newTicketBody.trim()}>
                  Enviar ticket
                </button>
                <Link className="btn btn-ghost" href="/dashboard/admin-ph/support">
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Mis tickets</h3>
        <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
          Historial de solicitudes. Haz clic en Ver para ver el detalle y el seguimiento.
        </p>
        <div className="card-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="list-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>{ticket.subject}</strong>
                <div className="muted" style={{ fontSize: "12px" }}>
                  {ticket.id} · Estado {ticket.status} · SLA {ticket.sla}
                </div>
              </div>
              <button type="button" className="btn btn-ghost">
                Ver ticket
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="card"><p className="muted">Cargando soporte…</p></div>}>
      <SupportContent />
    </Suspense>
  );
}
