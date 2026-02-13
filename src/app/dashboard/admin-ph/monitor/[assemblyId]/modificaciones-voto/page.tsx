"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type VoteChange = {
  id: string;
  resident_name: string;
  unit: string;
  email: string;
  voto_anterior: string;
  voto_nuevo: string;
  changed_at: string;
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

export default function ModificacionesVotoPage() {
  const params = useParams();
  const router = useRouter();
  const assemblyId = typeof params?.assemblyId === "string" ? params.assemblyId : "demo";
  const changes = useVoteChanges(assemblyId);

  const goToDashboardPrincipal = (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.removeItem("assembly_admin_selected_ph");
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-selected"));
    router.push("/dashboard/admin-ph");
  };

  return (
    <div className="monitor-container">
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <Link href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}`} className="btn btn-ghost" scroll={true}>
          ← Volver al Monitor
        </Link>
        <button type="button" className="btn btn-ghost" onClick={goToDashboardPrincipal}>
          Dashboard principal
        </button>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Bitácora: Modificaciones de voto</h1>
      </div>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Registro de cambios de voto por residente (voto anterior → voto nuevo) con fecha y hora.
      </p>
      {changes.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <p className="muted">No hay registros de modificaciones de voto aún.</p>
          <p className="muted" style={{ marginTop: "8px", fontSize: "13px" }}>
            Cuando un residente cambie su voto durante la asamblea, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="table" style={{ "--table-columns": "1fr 1fr 1.5fr 1fr 1fr 1.5fr" } as React.CSSProperties}>
          <div className="table-row table-header">
            <span>Residente</span>
            <span>Unidad</span>
            <span>Email</span>
            <span>Voto anterior</span>
            <span>Voto nuevo</span>
            <span>Fecha y hora</span>
          </div>
          {changes.map((ev) => (
            <div key={ev.id} className="table-row">
              <span>{ev.resident_name}</span>
              <span>{ev.unit}</span>
              <span>{ev.email}</span>
              <span>{ev.voto_anterior}</span>
              <span>{ev.voto_nuevo}</span>
              <span>{formatDateTime(ev.changed_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
