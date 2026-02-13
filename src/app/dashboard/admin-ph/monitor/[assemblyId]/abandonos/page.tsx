"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type AbandonEvent = {
  id: string;
  resident_name: string | null;
  unit: string | null;
  email: string;
  abandoned_at: string;
  display: string;
};

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

export default function AbandonosPage() {
  const params = useParams();
  const router = useRouter();
  const assemblyId = typeof params?.assemblyId === "string" ? params.assemblyId : "demo";
  const [events, setEvents] = useState<AbandonEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const goToDashboardPrincipal = (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.removeItem("assembly_admin_selected_ph");
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-selected"));
    router.push("/dashboard/admin-ph");
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hasValidAssemblyId = uuidRegex.test(assemblyId);
      const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
      const url = hasValidAssemblyId
        ? `/api/resident-abandon?assemblyId=${assemblyId}`
        : orgId
          ? `/api/resident-abandon?organizationId=${orgId}`
          : null;
      if (!url) {
        if (active) setEvents([]);
        return;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.events)) setEvents(data.events);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

  return (
    <div className="monitor-container">
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <Link href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}`} className="btn btn-ghost" scroll={true}>
          ← Volver al Monitor
        </Link>
        <button type="button" className="btn btn-ghost" onClick={goToDashboardPrincipal}>
          Dashboard principal
        </button>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Histórico · Asistencia y abandonos</h1>
      </div>
      <p className="muted" style={{ marginBottom: "16px" }}>
        Bitácora unificada para auditoría: registro de abandonos de sala con hora. Al volver al monitor verá el tablero de asistencia en vivo.
      </p>
      {loading ? (
        <p className="muted">Cargando...</p>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <p className="muted">No hay registros de abandonos de sala.</p>
        </div>
      ) : (
        <div className="table" style={{ "--table-columns": "1fr 1fr 2fr 1.5fr" } as React.CSSProperties}>
          <div className="table-row table-header">
            <span>Residente</span>
            <span>Unidad</span>
            <span>Email</span>
            <span>Hora abandono</span>
          </div>
          {events.map((ev) => (
            <div key={ev.id} className="table-row">
              <span>{ev.resident_name ?? "—"}</span>
              <span>{ev.unit ?? "—"}</span>
              <span>{ev.email}</span>
              <span>{formatDateTime(ev.abandoned_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
