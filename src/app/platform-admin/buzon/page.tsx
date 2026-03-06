"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const MIGRATION_CMD =
  "docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/108_email_log.sql";

export default function BuzonPage() {
  const [entries, setEntries] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchEmail, setSearchEmail] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTableMissing(false);
    try {
      const res = await fetch("/api/platform-admin/email-log");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.entries ?? []);
      setEntries(list);
      if (data?.tableMissing) setTableMissing(true);
      if (!res.ok && data?.error) setError(data.error);
    } catch {
      setError("No se pudo cargar el historial.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterType !== "all") {
      list = list.filter((e) => e.email_type === filterType);
    }
    if (searchEmail.trim()) {
      const q = searchEmail.trim().toLowerCase();
      list = list.filter((e) => e.to_email.toLowerCase().includes(q));
    }
    return list;
  }, [entries, filterType, searchEmail]);

  const types = useMemo(() => {
    const set = new Set(entries.map((e) => e.email_type));
    return ["all", ...Array.from(set).sort()];
  }, [entries]);

  return (
    <div className="card" style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>Buzón de correo</h1>
        <button
          type="button"
          onClick={fetchEntries}
          disabled={loading}
          className="btn btn-ghost"
          style={{ marginLeft: "auto", fontSize: "14px" }}
        >
          {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>
      <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>
        Historial de correos enviados por la plataforma (OTP, notificaciones).
      </p>

      {tableMissing && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>Tabla no encontrada.</strong> El agente DB puede crearla ejecutando las migraciones:
          <pre
            style={{
              margin: "8px 0 0",
              padding: "10px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "6px",
              overflow: "auto",
              fontSize: "13px",
            }}
          >
            npm run db:migrate
          </pre>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            (Requiere <code>DATABASE_URL</code> en .env. En Docker: <code>{MIGRATION_CMD}</code>)
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "8px",
            color: "#f87171",
          }}
        >
          {error}
          <button type="button" onClick={fetchEntries} className="btn btn-ghost" style={{ marginLeft: "8px", fontSize: "14px" }}>
            Reintentar
          </button>
        </div>
      )}

      {!error && entries.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Buscar por correo…"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.5)",
              color: "#e2e8f0",
              fontSize: "14px",
              minWidth: "200px",
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(15,23,42,0.5)",
              color: "#e2e8f0",
              fontSize: "14px",
            }}
          >
            <option value="all">Todos los tipos</option>
            {types.filter((t) => t !== "all").map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">
          {entries.length === 0
            ? "No hay registros aún. Los envíos OTP (modo producción) y otras notificaciones se listarán aquí."
            : "Ningún registro coincide con el filtro."}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.3)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Fecha</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Destinatario</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Asunto</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Vista previa</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
                  <td style={{ padding: "10px 12px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {new Date(e.created_at).toLocaleString("es-PA", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{e.to_email}</td>
                  <td style={{ padding: "10px 12px" }}>{TYPE_LABELS[e.email_type] ?? e.email_type}</td>
                  <td style={{ padding: "10px 12px", maxWidth: 200 }} title={e.subject ?? undefined}>
                    {(e.subject ?? "—").slice(0, 50)}
                    {(e.subject?.length ?? 0) > 50 ? "…" : ""}
                  </td>
                  <td style={{ padding: "10px 12px", maxWidth: 180, color: "#94a3b8" }} title={e.body_preview ?? undefined}>
                    {(e.body_preview ?? "—").slice(0, 40)}
                    {((e.body_preview?.length ?? 0) > 40) ? "…" : ""}
                  </td>
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
      {!loading && filtered.length > 0 && (
        <p className="muted" style={{ marginTop: "12px", fontSize: "13px" }}>
          Mostrando {filtered.length} de {entries.length} registros.
        </p>
      )}
    </div>
  );
}
