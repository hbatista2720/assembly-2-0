"use client";

import { useEffect, useState } from "react";

type EmailLogEntry = {
  id: string;
  to_email: string;
  subject: string | null;
  email_type: string;
  body_preview: string | null;
  success: boolean;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  otp: "Código OTP",
  power_notify: "Notificación poder",
  other: "Otro",
};

export default function BuzonPage() {
  const [entries, setEntries] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform-admin/email-log")
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card" style={{ maxWidth: "900px" }}>
      <h1 style={{ margin: "0 0 16px", fontSize: "20px" }}>Buzón de correo</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: "14px" }}>
        Historial de correos enviados por la plataforma (OTP, notificaciones). Si la tabla <code>email_log</code> no existe, ejecuta la migración <code>019_email_log.sql</code>.
      </p>
      {loading ? (
        <p className="muted">Cargando…</p>
      ) : entries.length === 0 ? (
        <p className="muted">No hay registros aún. Los envíos OTP (modo producción) se listarán aquí.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Fecha</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Destinatario</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Asunto</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>
                    {new Date(e.created_at).toLocaleString("es-PA", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{e.to_email}</td>
                  <td style={{ padding: "10px 12px" }}>{TYPE_LABELS[e.email_type] || e.email_type}</td>
                  <td style={{ padding: "10px 12px", maxWidth: 200 }}>{e.subject || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {e.success ? (
                      <span style={{ color: "#22c55e" }}>Enviado</span>
                    ) : (
                      <span style={{ color: "#ef4444" }}>Error</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
