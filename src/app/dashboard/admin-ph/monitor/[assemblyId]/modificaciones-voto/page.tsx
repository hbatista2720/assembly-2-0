"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type VoteChange = {
  id: string;
  resident_name: string;
  unit: string;
  email: string;
  voto_anterior: string;
  voto_nuevo: string;
  changed_at: string;
  comment?: string;
};

function readVoteChangesFromStorage(assemblyId: string): VoteChange[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`vote_changes_${assemblyId}`);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as VoteChange[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Lee desde localStorage (Monitor escribe al guardar voto manual/modificado). En producción podría venir de GET /api/vote-changes?assemblyId= */
function useVoteChanges(assemblyId: string): VoteChange[] {
  const [items, setItems] = useState<VoteChange[]>(() => readVoteChangesFromStorage(assemblyId));
  useEffect(() => {
    setItems(readVoteChangesFromStorage(assemblyId));
  }, [assemblyId]);
  useEffect(() => {
    const onVisible = () => setItems(readVoteChangesFromStorage(assemblyId));
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [assemblyId]);
  return items;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncate(str: string, maxLen: number): string {
  if (!str) return "—";
  return str.length <= maxLen ? str : str.slice(0, maxLen) + "…";
}

function buildCsv(changes: VoteChange[]): string {
  const header = "Residente;Unidad;Email;Voto anterior;Voto nuevo;Motivo;Fecha y hora";
  const rows = changes.map((ev) =>
    [
      `"${(ev.resident_name || "").replace(/"/g, '""')}"`,
      `"${(ev.unit || "").replace(/"/g, '""')}"`,
      `"${(ev.email || "").replace(/"/g, '""')}"`,
      `"${(ev.voto_anterior || "").replace(/"/g, '""')}"`,
      `"${(ev.voto_nuevo || "").replace(/"/g, '""')}"`,
      `"${(ev.comment || "").replace(/"/g, '""')}"`,
      `"${formatDateTime(ev.changed_at)}"`,
    ].join(";")
  );
  return "\uFEFF" + header + "\n" + rows.join("\n");
}

export default function ModificacionesVotoPage() {
  const params = useParams();
  const assemblyId = typeof params?.assemblyId === "string" ? params.assemblyId : "demo";
  const changes = useVoteChanges(assemblyId);
  const [detailItem, setDetailItem] = useState<VoteChange | null>(null);

  const exportCsv = () => {
    const csv = buildCsv(changes);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modificaciones-voto-${assemblyId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="monitor-container">
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <Link href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}`} className="btn btn-primary" scroll={true} style={{ fontWeight: 600 }}>
          ← Volver al Monitor
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Bitácora: Modificaciones de voto</h1>
        {changes.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={exportCsv} style={{ marginLeft: "auto" }}>
            Exportar
          </button>
        )}
      </div>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Registro de cambios de voto por residente (voto anterior → voto nuevo) con fecha, hora y motivo.
      </p>
      {changes.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <p className="muted">No hay registros de modificaciones de voto aún.</p>
          <p className="muted" style={{ marginTop: "8px", fontSize: "13px" }}>
            Cuando un administrador modifique un voto desde el monitor (con comentario obligatorio), aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="table" style={{ "--table-columns": "1fr 0.8fr 1.2fr 0.9fr 0.9fr 2fr 1.4fr auto" } as React.CSSProperties}>
          <div className="table-row table-header">
            <span>Residente</span>
            <span>Unidad</span>
            <span>Email</span>
            <span>Voto anterior</span>
            <span>Voto nuevo</span>
            <span>Motivo</span>
            <span>Fecha y hora</span>
            <span style={{ textAlign: "center" }}>Acciones</span>
          </div>
          {changes.map((ev) => (
            <div key={ev.id} className="table-row">
              <span>{ev.resident_name}</span>
              <span>{ev.unit}</span>
              <span>{ev.email || "—"}</span>
              <span>{ev.voto_anterior}</span>
              <span>{ev.voto_nuevo}</span>
              <span title={ev.comment || undefined}>{truncate(ev.comment ?? "", 50)}</span>
              <span>{formatDateTime(ev.changed_at)}</span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px", fontSize: "13px" }}
                  onClick={() => setDetailItem(ev)}
                >
                  Ver detalle
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {detailItem && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalle-modal-title"
          onClick={() => setDetailItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "480px",
              width: "90%",
              padding: "24px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 id="detalle-modal-title" style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>
              Detalle de modificación de voto
            </h2>
            <dl style={{ margin: 0, display: "grid", gap: "10px 16px", gridTemplateColumns: "auto 1fr" }}>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Residente</dt>
              <dd style={{ margin: 0 }}>{detailItem.resident_name}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Unidad</dt>
              <dd style={{ margin: 0 }}>{detailItem.unit}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Email</dt>
              <dd style={{ margin: 0 }}>{detailItem.email || "—"}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Voto anterior</dt>
              <dd style={{ margin: 0 }}>{detailItem.voto_anterior}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Voto nuevo</dt>
              <dd style={{ margin: 0 }}>{detailItem.voto_nuevo}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Fecha y hora</dt>
              <dd style={{ margin: 0 }}>{formatDateTime(detailItem.changed_at)}</dd>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>Motivo del cambio</dt>
              <dd style={{ margin: 0 }}>{detailItem.comment || "—"}</dd>
            </dl>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-primary" onClick={() => setDetailItem(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
