"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Unit = {
  id: string;
  code: string;
  tower: string;
  owner: string;
  paymentStatus: "AL_DIA" | "MORA";
  isPresent: boolean;
  hasFaceId: boolean;
  voteValue: "SI" | "NO" | "ABSTENCION" | null;
  voteMethod: "FACE_ID" | "MANUAL" | null;
};

type AbandonEvent = {
  id: string;
  resident_name: string | null;
  unit: string | null;
  email: string;
  abandoned_at: string;
  display: string;
};

type Summary = {
  stats: {
    total: number;
    present: number;
    voted: number;
    mora: number;
    faceId: number;
  };
  quorum: {
    percentage: number;
    achieved: boolean;
    present: number;
    total: number;
  };
  votation: {
    topic: string;
    votesCount: number;
    attendeesCount: number;
    results: {
      si: number;
      no: number;
      abst: number;
    };
  };
  history: string[];
};

const TOWERS = [
  { id: "A", label: "Torre A", count: 200 },
  { id: "B", label: "Torre B", count: 111 },
];

const getBackgroundColor = (unit: Unit) => {
  if (unit.paymentStatus === "MORA") return "#475569";
  if (!unit.isPresent) return "#e2e8f0";
  if (unit.voteValue) return "#10b981";
  return "#fbbf24";
};

const getVoteIcon = (unit: Unit) => {
  if (!unit.voteValue) return null;
  if (unit.voteValue === "SI") return "✅";
  if (unit.voteValue === "NO") return "❌";
  return "⚪";
};

const getMethodIcon = (unit: Unit) => {
  if (unit.voteMethod === "MANUAL") return "📱";
  if (unit.hasFaceId) return "🔒";
  return null;
};

export default function MonitorPage() {
  const params = useParams();
  const assemblyId = typeof params?.assemblyId === "string" ? params.assemblyId : "demo";
  const [viewMode, setViewMode] = useState<"summary" | "grid">("summary");
  const [filterTower, setFilterTower] = useState("all");
  const [zoomLevel, setZoomLevel] = useState<"compact" | "normal" | "large">("normal");
  const [units, setUnits] = useState<Unit[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [abandons, setAbandons] = useState<AbandonEvent[]>([]);

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      const res = await fetch(`/api/monitor/summary?assemblyId=${assemblyId}`);
      if (!res.ok) return;
      const data = (await res.json()) as Summary;
      if (active) setSummary(data);
    };
    loadSummary();
    const interval = setInterval(loadSummary, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

  useEffect(() => {
    let active = true;
    const loadUnits = async () => {
      const res = await fetch(`/api/monitor/units?assemblyId=${assemblyId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (active) setUnits(data.units || []);
    };
    loadUnits();
    const interval = setInterval(loadUnits, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

  useEffect(() => {
    let active = true;
    const loadAbandons = async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hasValidAssemblyId = uuidRegex.test(assemblyId);
      const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
      const url = hasValidAssemblyId
        ? `/api/resident-abandon?assemblyId=${assemblyId}`
        : orgId
          ? `/api/resident-abandon?organizationId=${orgId}`
          : null;
      if (!url) return;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (active && Array.isArray(data.events)) setAbandons(data.events);
    };
    loadAbandons();
    const interval = setInterval(loadAbandons, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

  const filteredUnits = useMemo(() => {
    if (filterTower === "all") return units;
    return units.filter((unit) => unit.tower === filterTower);
  }, [filterTower, units]);

  const getGridColumns = () => {
    const total = filteredUnits.length;
    if (zoomLevel === "compact") {
      if (total > 400) return 40;
      if (total > 200) return 30;
      return 25;
    }
    if (zoomLevel === "large") {
      if (total > 400) return 20;
      if (total > 200) return 15;
      return 12;
    }
    if (total > 400) return 30;
    if (total > 200) return 20;
    return 16;
  };

  return (
    <div className="monitor-container">
      {abandons.length > 0 && (
        <div className="abandons-section" style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px" }}>
          <div style={{ fontWeight: 600, marginBottom: "8px", color: "#fca5a5" }}>Abandonos de sala</div>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#e2e8f0", fontSize: "13px" }}>
            {abandons.map((ev) => (
              <li key={ev.id}>{ev.display}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="monitor-header">
        <div className="view-toggle">
          <button className={viewMode === "summary" ? "active" : ""} onClick={() => setViewMode("summary")}>
            📊 Vista Resumen
          </button>
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
            🧩 Vista Unidades
          </button>
        </div>
        {viewMode === "grid" && (
          <>
            <select value={filterTower} onChange={(event) => setFilterTower(event.target.value)} className="tower-filter">
              <option value="all">🏢 Todas las Torres</option>
              {TOWERS.map((tower) => (
                <option key={tower.id} value={tower.id}>
                  {tower.label} ({tower.count} unidades)
                </option>
              ))}
            </select>
            <div className="zoom-controls">
              <button onClick={() => setZoomLevel("compact")}>🔍- Compacto</button>
              <button onClick={() => setZoomLevel("normal")}>🔍 Normal</button>
              <button onClick={() => setZoomLevel("large")}>🔍+ Grande</button>
            </div>
          </>
        )}
      </div>

      {viewMode === "summary" ? (
        <div className="summary-grid">
          {summary ? (
            <>
              {[
                { label: "Total unidades", value: summary.stats.total, icon: "🏢" },
                { label: "Presentes", value: summary.stats.present, icon: "✅" },
                { label: "Votaron", value: summary.stats.voted, icon: "🗳️" },
                { label: "En mora", value: summary.stats.mora, icon: "⚠️" },
                { label: "Face ID activo", value: summary.stats.faceId, icon: "🔒" },
              ].map((item) => (
                <div key={item.label} className="summary-card">
                  <div className="summary-icon">{item.icon}</div>
                  <div className="summary-value">{item.value}</div>
                  <div className="summary-label">{item.label}</div>
                </div>
              ))}
              <div className="summary-card large">
                <div className="summary-title">{summary.votation.topic}</div>
                <div className="summary-bars">
                  {[
                    { label: "SI", value: summary.votation.results.si, color: "#10b981" },
                    { label: "NO", value: summary.votation.results.no, color: "#ef4444" },
                    { label: "ABST", value: summary.votation.results.abst, color: "#94a3b8" },
                  ].map((bar) => (
                    <div key={bar.label} className="vote-bar">
                      <div className="vote-bar-label">
                        {bar.label} · {bar.value}%
                      </div>
                      <div className="vote-bar-track">
                        <span style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="summary-foot">
                  Votos emitidos: {summary.votation.votesCount} / {summary.votation.attendeesCount} presentes
                </div>
              </div>
            </>
          ) : (
            <div className="summary-card large">Cargando métricas...</div>
          )}
        </div>
      ) : (
        <div className="units-grid-container">
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#10b981" }} />
              🟢 Presente + Votó
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#fbbf24" }} />
              🟡 Presente + No votó
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#e2e8f0" }} />
              ⚪ Ausente
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#475569" }} />
              ⚫ En mora
            </div>
            <div className="legend-item">
              <span className="legend-icon">✅</span> Votó SI
            </div>
            <div className="legend-item">
              <span className="legend-icon">❌</span> Votó NO
            </div>
            <div className="legend-item">
              <span className="legend-icon">⚪</span> Abstención
            </div>
            <div className="legend-item">
              <span className="legend-icon">📱</span> Voto manual
            </div>
          </div>

          <div className={`units-grid zoom-${zoomLevel}`} style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}>
            {filteredUnits.map((unit) => {
              const isPending = unit.isPresent && !unit.voteValue && unit.paymentStatus !== "MORA";
              return (
                <div
                  key={unit.id}
                  className={`unit-cell ${isPending ? "pending-vote" : ""}`}
                  style={{ backgroundColor: getBackgroundColor(unit) }}
                  title={`${unit.code} · ${unit.owner}`}
                >
                  <div className="unit-code">{unit.code}</div>
                  <div className="unit-icons">
                    {getVoteIcon(unit)}
                    {getMethodIcon(unit)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid-stats">
            <div className="stat">
              Total: <strong>{filteredUnits.length}</strong>
            </div>
            <div className="stat">
              Presentes: <strong>{filteredUnits.filter((unit) => unit.isPresent).length}</strong>
            </div>
            <div className="stat">
              Votaron: <strong>{filteredUnits.filter((unit) => unit.voteValue).length}</strong>
            </div>
            <div className="stat">
              En mora: <strong>{filteredUnits.filter((unit) => unit.paymentStatus === "MORA").length}</strong>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .monitor-container {
          background: #0f172a;
          color: white;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .monitor-header {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
        }
        .view-toggle {
          display: flex;
          gap: 8px;
        }
        .view-toggle button {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(30, 41, 59, 0.9);
          color: white;
          cursor: pointer;
        }
        .view-toggle button.active {
          border-color: rgba(59, 130, 246, 0.8);
          background: rgba(59, 130, 246, 0.2);
        }
        .tower-filter {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(30, 41, 59, 0.9);
          color: white;
        }
        .zoom-controls {
          display: flex;
          gap: 8px;
        }
        .zoom-controls button {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(30, 41, 59, 0.9);
          color: white;
          cursor: pointer;
          font-size: 12px;
        }
        .summary-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .summary-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          padding: 16px;
        }
        .summary-card.large {
          grid-column: 1 / -1;
        }
        .summary-icon {
          font-size: 24px;
        }
        .summary-value {
          font-size: 28px;
          font-weight: 700;
          margin: 8px 0 4px;
        }
        .summary-label {
          color: #94a3b8;
          font-size: 13px;
        }
        .summary-title {
          font-weight: 600;
          margin-bottom: 12px;
        }
        .summary-bars {
          display: grid;
          gap: 10px;
        }
        .vote-bar-label {
          font-size: 12px;
          color: #cbd5f5;
          margin-bottom: 4px;
        }
        .vote-bar-track {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          height: 8px;
          overflow: hidden;
        }
        .vote-bar-track span {
          display: block;
          height: 100%;
          border-radius: 999px;
        }
        .summary-foot {
          margin-top: 10px;
          color: #cbd5f5;
          font-size: 12px;
        }
        .units-grid-container {
          display: grid;
          gap: 16px;
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: #cbd5f5;
        }
        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
        .units-grid {
          display: grid;
          gap: 4px;
        }
        .unit-cell {
          border-radius: 4px;
          min-height: 36px;
          font-size: 10px;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-weight: 700;
          position: relative;
        }
        .units-grid.zoom-compact .unit-cell {
          min-height: 22px;
          font-size: 8px;
        }
        .units-grid.zoom-large .unit-cell {
          min-height: 52px;
          font-size: 12px;
        }
        .unit-icons {
          display: flex;
          gap: 2px;
        }
        .pending-vote {
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        .grid-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          color: #cbd5f5;
          font-size: 13px;
        }
        .grid-stats strong {
          color: white;
        }
      `}</style>
    </div>
  );
}
