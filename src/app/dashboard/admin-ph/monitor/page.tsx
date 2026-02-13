"use client";

import Link from "next/link";

export default function MonitorListPage() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0, marginBottom: "8px" }}>Monitor Back Office</h1>
      <p className="muted" style={{ margin: "0 0 24px", fontSize: "14px" }}>
        Primero valide el quórum (asistencia); luego abra el monitor de votación por temas.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
        <Link
          href="/dashboard/admin-ph/monitor/quorum"
          className="btn btn-primary"
          style={{ padding: "16px 24px", fontSize: "16px", textAlign: "center" }}
          scroll={true}
        >
          Monitor de Quórum
        </Link>
        <Link
          href="/dashboard/admin-ph/monitor/votacion"
          className="btn btn-ghost"
          style={{ padding: "16px 24px", fontSize: "16px", textAlign: "center", border: "1px solid rgba(148, 163, 184, 0.3)" }}
          scroll={true}
        >
          Monitor de Votación
        </Link>
      </div>
      <p className="muted" style={{ margin: "20px 0 0", fontSize: "13px" }}>
        <strong>Quórum:</strong> vista de unidades (presente / no presente). <strong>Votación:</strong> vista resumen, vista tablero por unidades y filtro por tema.
      </p>
    </div>
  );
}
