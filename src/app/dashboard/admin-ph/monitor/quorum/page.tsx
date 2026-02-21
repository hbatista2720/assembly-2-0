"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssemblies, type Assembly } from "../../../../../lib/assembliesStore";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr.replace("T", " ");
  }
}

function AssemblyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WidgetCard({
  title,
  subtitle,
  href,
  variant,
  assembly,
}: {
  title: string;
  subtitle: string;
  href: string;
  variant?: "demo" | "proxima" | "default";
  assembly?: Assembly | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipContent = assembly
    ? {
        fecha: formatDate(assembly.date),
        residentes: assembly.attendeesCount,
        tipo: assembly.type,
        lugar: assembly.location,
      }
    : null;

  return (
    <div
      className={`monitor-quorum-widget${variant === "demo" ? " monitor-quorum-widget--demo" : ""}${variant === "proxima" ? " monitor-quorum-widget--proxima" : ""}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link href={href} className="monitor-quorum-widget-link" scroll={true}>
        <span className="monitor-quorum-widget-icon">
          <AssemblyIcon />
        </span>
        <span className="monitor-quorum-widget-body">
          <span className="monitor-quorum-widget-title">{title}</span>
          <span className="monitor-quorum-widget-subtitle">{subtitle}</span>
          {variant === "proxima" && (
            <span className="monitor-quorum-widget-badge">Próxima</span>
          )}
        </span>
        <span className="monitor-quorum-widget-action">Abrir</span>
      </Link>
      {tooltipContent && showTooltip && (
        <div className="monitor-quorum-widget-tooltip" role="tooltip">
          <div className="monitor-quorum-widget-tooltip-row">
            <span className="monitor-quorum-widget-tooltip-label">Fecha pactada</span>
            <span>{tooltipContent.fecha}</span>
          </div>
          <div className="monitor-quorum-widget-tooltip-row">
            <span className="monitor-quorum-widget-tooltip-label">Residentes</span>
            <span>{tooltipContent.residentes}</span>
          </div>
          <div className="monitor-quorum-widget-tooltip-row">
            <span className="monitor-quorum-widget-tooltip-label">Tipo</span>
            <span>{tooltipContent.tipo}</span>
          </div>
          <div className="monitor-quorum-widget-tooltip-row">
            <span className="monitor-quorum-widget-tooltip-label">Lugar</span>
            <span>{tooltipContent.lugar}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const WIDGET_STYLES = `
  .monitor-quorum-widget { position: relative; border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.22); background: rgba(30, 41, 59, 0.5); transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
  .monitor-quorum-widget:hover { border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); transform: translateY(-2px); }
  .monitor-quorum-widget-link { display: flex; align-items: center; gap: 16px; padding: 16px 20px; text-decoration: none; color: inherit; min-height: 72px; }
  .monitor-quorum-widget-icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; flex-shrink: 0; }
  .monitor-quorum-widget-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; position: relative; }
  .monitor-quorum-widget-title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
  .monitor-quorum-widget-subtitle { font-size: 13px; color: #94a3b8; }
  .monitor-quorum-widget-badge { position: absolute; top: -2px; right: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #34d399; background: rgba(16, 185, 129, 0.2); padding: 2px 8px; border-radius: 6px; }
  .monitor-quorum-widget-action { font-size: 13px; font-weight: 600; color: #6366f1; padding: 8px 16px; border-radius: 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); flex-shrink: 0; transition: background 0.2s, color 0.2s; }
  .monitor-quorum-widget-link:hover .monitor-quorum-widget-action { background: rgba(99, 102, 241, 0.3); color: #c7d2fe; }
  .monitor-quorum-widget--demo { border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.08); }
  .monitor-quorum-widget--demo .monitor-quorum-widget-icon { background: rgba(16, 185, 129, 0.25); color: #34d399; }
  .monitor-quorum-widget--proxima { border-color: rgba(99, 102, 241, 0.35); background: rgba(99, 102, 241, 0.06); }
  .monitor-quorum-widget-tooltip { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% + 12px); z-index: 20; min-width: 260px; padding: 14px 16px; background: #1e293b; border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 12px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4); font-size: 13px; color: #e2e8f0; pointer-events: none; }
  .monitor-quorum-widget-tooltip::after { content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 8px solid transparent; border-top-color: #1e293b; }
  .monitor-quorum-widget-tooltip-row { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; }
  .monitor-quorum-widget-tooltip-row:not(:last-child) { border-bottom: 1px solid rgba(148, 163, 184, 0.15); }
  .monitor-quorum-widget-tooltip-label { color: #94a3b8; flex-shrink: 0; }
`;

export default function MonitorQuorumListPage() {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);

  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);

  const now = typeof window !== "undefined" ? Date.now() : 0;
  const sortedAssemblies = [...assemblies].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const proximaIndex = sortedAssemblies.findIndex((a) => new Date(a.date).getTime() >= now);
  const proximaId = proximaIndex >= 0 ? sortedAssemblies[proximaIndex]?.id : null;

  return (
    <div className="card">
      <style>{WIDGET_STYLES}</style>
      <h1 style={{ marginTop: 0, marginBottom: "8px" }}>Monitor de Quórum</h1>
      <p className="muted" style={{ margin: "0 0 24px", fontSize: "14px" }}>
        Vista tablero de unidades: presente (verde) y no presente (gris claro).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {assemblies.length === 0 ? (
          <div
            style={{
              padding: "28px 24px",
              textAlign: "center",
              background: "rgba(15, 23, 42, 0.5)",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <p className="muted" style={{ margin: "0 0 8px" }}>
              No hay asambleas. El Monitor solo muestra datos de una asamblea.
            </p>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: "13px" }}>
              Cree al menos una asamblea en el módulo Asambleas para ver aquí el tablero de unidades.
            </p>
            <Link className="btn btn-primary" href="/dashboard/admin-ph/assemblies">
              Ir a Asambleas
            </Link>
          </div>
        ) : (
          <>
          <WidgetCard
            title="Demo"
            subtitle="Tablero quórum con datos de ejemplo"
            href="/dashboard/admin-ph/monitor/quorum/demo"
            variant="demo"
            assembly={null}
          />
          {sortedAssemblies.map((a) => (
            <WidgetCard
              key={a.id}
              title={a.title}
              subtitle={`${a.date.replace("T", " ").slice(0, 16)} · ${a.status}`}
              href={`/dashboard/admin-ph/monitor/quorum/${encodeURIComponent(a.id)}`}
              variant={a.id === proximaId ? "proxima" : "default"}
              assembly={a}
            />
          ))}
          </>
        )}
      </div>
    </div>
  );
}
