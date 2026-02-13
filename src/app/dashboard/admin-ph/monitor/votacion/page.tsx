"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssemblies } from "../../../../../lib/assembliesStore";

export default function MonitorVotacionListPage() {
  const [assemblies, setAssemblies] = useState<{ id: string; title: string; date: string; status: string }[]>([]);

  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);

  return (
    <div className="card">
      <h1 style={{ marginTop: 0, marginBottom: "8px" }}>Monitor de Votación</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: "14px" }}>
        Vista resumen, vista tablero por unidades y filtro por tema de votación.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 18px",
          background: "rgba(99, 102, 241, 0.12)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          borderRadius: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <strong style={{ fontSize: "15px" }}>Demo</strong>
          <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
            Monitor de votación con datos de ejemplo
          </div>
        </div>
        <Link className="btn btn-primary" href="/dashboard/admin-ph/monitor/votacion/demo" scroll={true}>
          Abrir
        </Link>
      </div>
      {assemblies.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", background: "rgba(15, 23, 42, 0.4)", borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.2)" }}>
          <p className="muted" style={{ margin: "0 0 16px" }}>No hay asambleas. Cree una desde el módulo Asambleas.</p>
          <Link className="btn btn-primary" href="/dashboard/admin-ph/assemblies">
            Ir a Asambleas
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assemblies.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px 18px",
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
              }}
            >
              <div>
                <strong style={{ fontSize: "15px" }}>{a.title}</strong>
                <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                  {a.date.replace("T", " ")} · {a.status}
                </div>
              </div>
              <Link className="btn btn-primary" href={`/dashboard/admin-ph/monitor/votacion/${encodeURIComponent(a.id)}`} scroll={true}>
                Abrir
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
