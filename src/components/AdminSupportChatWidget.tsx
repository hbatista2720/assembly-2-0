"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const toggle = () => setOpen((prev) => !prev);

  const handleSendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessage("");
    setOpen(false);
    const params = new URLSearchParams({ open: "chat", message: text });
    router.push(`/dashboard/admin-ph/support?${params.toString()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Cerrar chat de soporte" : "Abrir chat de soporte"}
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 18px",
          borderRadius: 9999,
          border: "1px solid rgba(99, 102, 241, 0.4)",
          background: "var(--color-surface-elevated, #1e293b)",
          color: "var(--color-text, #f1f5f9)",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <span aria-hidden style={{ fontSize: 18 }}>💬</span>
        <span style={{ whiteSpace: "nowrap" }}>Soporte</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat de soporte"
          style={{
            position: "fixed",
            bottom: 80,
            right: 24,
            zIndex: 9999,
            width: 340,
            maxWidth: "calc(100vw - 48px)",
            borderRadius: 16,
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: "var(--color-surface-elevated, #1e293b)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              background: "rgba(99, 102, 241, 0.08)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Soporte</h3>
            <button
              type="button"
              onClick={toggle}
              aria-label="Cerrar"
              style={{
                width: 32,
                height: 32,
                border: "none",
                background: "transparent",
                color: "inherit",
                fontSize: 22,
                lineHeight: 1,
                cursor: "pointer",
                borderRadius: 8,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: 16, maxHeight: 360, overflowY: "auto" }}>
            <p className="muted" style={{ fontSize: "13px", margin: "0 0 12px" }}>
              ¿Necesitas ayuda? Atendemos tickets y consultas. Crea un ticket o escribe tu mensaje y te redirigimos al centro de soporte.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link className="btn btn-primary" href="/dashboard/admin-ph/support" onClick={() => setOpen(false)} style={{ width: "100%", textAlign: "center" }}>
                Ver mis tickets
              </Link>
              <Link className="btn btn-ghost" href="/dashboard/admin-ph/support?open=new" onClick={() => setOpen(false)} style={{ width: "100%", textAlign: "center" }}>
                Nuevo ticket
              </Link>
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(148, 163, 184, 0.2)" }}>
              <label htmlFor="admin-support-quick-msg" className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                Escribe tu consulta (se abrirá Soporte)
              </label>
              <textarea
                id="admin-support-quick-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej. No puedo crear asamblea, error al subir acta..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  background: "rgba(15, 23, 42, 0.5)",
                  color: "var(--color-text, #f1f5f9)",
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 60,
                }}
              />
              <button type="button" className="btn btn-primary" style={{ marginTop: 8, width: "100%" }} onClick={handleSendMessage} disabled={!message.trim()}>
                Enviar e ir a Soporte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
