"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const OVERRIDES_STORAGE_PREFIX = "assembly_monitor_overrides_";
const CURRENT_TOPIC_STORAGE_PREFIX = "assembly_monitor_current_topic_";

function loadCurrentTopicFromStorage(assemblyId: string): { topicId: string; topicTitle: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_TOPIC_STORAGE_PREFIX + assemblyId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { topicId?: string; topicTitle?: string };
    if (parsed?.topicId && parsed?.topicTitle) return { topicId: parsed.topicId, topicTitle: parsed.topicTitle };
    return null;
  } catch {
    return null;
  }
}

function loadOverridesFromStorage(assemblyId: string): Record<string, { voteValue: "SI" | "NO" | "ABSTENCION" }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_PREFIX + assemblyId);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, { voteValue: "SI" | "NO" | "ABSTENCION"; comment?: string; isModification?: boolean }>;
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, { voteValue: v.voteValue }]));
  } catch {
    return {};
  }
}

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

type PresenterData = {
  assemblyId?: string;
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
  units?: Unit[];
  topics?: { id: string; label: string }[];
};

const getUnitBg = (u: Unit) => {
  if (u.paymentStatus === "MORA") return "#475569";
  if (!u.isPresent) return "#334155";
  if (u.voteValue) return "#10b981";
  return "#eab308";
};

const getVoteIcon = (u: Unit) => {
  if (!u.voteValue) return null;
  if (u.voteValue === "SI") return "✅";
  if (u.voteValue === "NO") return "❌";
  return "⚪";
};

const getMethodIcon = (u: Unit) => {
  if (u.voteMethod === "MANUAL") return "📱";
  if (u.hasFaceId) return "🔒";
  return null;
};

export default function PresenterView() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "demo-token";
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState<PresenterData | null>(null);
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [localOverrides, setLocalOverrides] = useState<Record<string, { voteValue: "SI" | "NO" | "ABSTENCION" }>>({});
  const [syncTopic, setSyncTopic] = useState<{ topicId: string; topicTitle: string } | null>(null);

  const assemblyId = data?.assemblyId ?? "demo";

  useEffect(() => {
    setLocalOverrides(loadOverridesFromStorage(assemblyId));
  }, [assemblyId]);

  useEffect(() => {
    if (!data?.assemblyId) return;
    const stored = loadCurrentTopicFromStorage(data.assemblyId);
    setSyncTopic(stored);
    if (stored) setFilterTopic(stored.topicId);
  }, [data?.assemblyId]);

  useEffect(() => {
    const key = OVERRIDES_STORAGE_PREFIX + assemblyId;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Record<string, { voteValue: "SI" | "NO" | "ABSTENCION" }>;
          setLocalOverrides(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, { voteValue: v.voteValue }])));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [assemblyId]);

  const effectiveUnits = useMemo(() => {
    const units = data?.units ?? [];
    if (Object.keys(localOverrides).length === 0) return units;
    return units.map((u) => {
      const ov = localOverrides[u.id];
      if (!ov) return u;
      return { ...u, voteValue: ov.voteValue, voteMethod: "MANUAL" as const };
    });
  }, [data?.units, localOverrides]);

  const presenterResults = useMemo(() => {
    const units = effectiveUnits;
    const withVote = units.filter((u) => u.voteValue && u.paymentStatus !== "MORA");
    const total = withVote.length;
    if (total === 0) return data?.votation?.results ?? { si: 0, no: 0, abst: 0 };
    const si = withVote.filter((u) => u.voteValue === "SI").length;
    const no = withVote.filter((u) => u.voteValue === "NO").length;
    const abst = withVote.filter((u) => u.voteValue === "ABSTENCION").length;
    return {
      si: Math.round((si / total) * 100),
      no: Math.round((no / total) * 100),
      abst: Math.round((abst / total) * 100),
    };
  }, [effectiveUnits, data?.votation?.results]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const topicParams = syncTopic
      ? `&topicId=${encodeURIComponent(syncTopic.topicId)}&topicTitle=${encodeURIComponent(syncTopic.topicTitle)}`
      : "";
    const load = async () => {
      const res = await fetch(`/api/presenter/view?token=${token}${topicParams}`);
      if (!res.ok) return;
      const payload = (await res.json()) as PresenterData;
      if (active) setData(payload);
    };
    load();
    const interval = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token, syncTopic?.topicId, syncTopic?.topicTitle]);

  return (
    <div className="presenter-root">
      <header className="presenter-header">
        <div>
          <div className="presenter-title">Urban Tower · Asamblea Ordinaria 2026</div>
          <div className="presenter-subtitle">Modo Presentación · Solo lectura</div>
        </div>
        <div className="presenter-clock">{now.toLocaleTimeString()}</div>
      </header>

      <section className="presenter-grid">
        <div className="panel quorum">
          <div className="panel-title">Quórum Actual</div>
          <div className="quorum-value">{data ? `${data.quorum.percentage}%` : "--"}</div>
          <div className={`quorum-status ${data?.quorum.achieved ? "achieved" : "pending"}`}>
            {data?.quorum.achieved ? "✅ ALCANZADO" : "⚠️ PENDIENTE"}
          </div>
          <div className="quorum-detail">
            {data ? `${data.quorum.present} / ${data.quorum.total} propietarios presentes` : "Cargando..."}
          </div>
          <div className="quorum-detail">Actualización automática</div>
        </div>

        <div className="panel voting">
          <div className="panel-title">Votación Activa</div>
          <div className="panel-subtitle">{data?.votation.topic || "Sin votación activa"}</div>
          <div className="vote-bars">
            {[
              { label: "SI", value: presenterResults.si, color: "#10b981" },
              { label: "NO", value: presenterResults.no, color: "#ef4444" },
              { label: "ABST", value: presenterResults.abst, color: "#94a3b8" },
            ].map((bar) => (
              <div key={bar.label} className="vote-bar">
                <div className="vote-bar-label">
                  {bar.label}: {bar.value}%
                </div>
                <div className="vote-bar-track">
                  <span style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-foot">
            Votos emitidos: {effectiveUnits.filter((u) => u.voteValue && u.paymentStatus !== "MORA").length} / {effectiveUnits.filter((u) => u.isPresent).length} presentes
          </div>
        </div>

        <div className="panel history">
          <div className="panel-title">Histórico de Votaciones</div>
          {(data?.history || ["Cargando histórico..."]).map((item) => (
            <div key={item} className="history-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="presenter-units-section">
        <div className="presenter-units-header">
          <h3 className="presenter-units-title">Vista de unidades</h3>
          <div className="presenter-units-filter">
            <label htmlFor="filter-topic">Filtrar por tema:</label>
            <select
              id="filter-topic"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="presenter-topic-select"
            >
              <option value="all">Todos los temas</option>
              {(data?.topics || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filterTopic !== "all" && data?.topics?.find((t) => t.id === filterTopic) && (
          <div className="presenter-topic-active">
            Tema seleccionado: {data.topics.find((t) => t.id === filterTopic)?.label}
          </div>
        )}
        <div className="presenter-units-legend">
          <span><span className="legend-sq" style={{ background: "#10b981" }} /> Presente + Votó</span>
          <span><span className="legend-sq" style={{ background: "#eab308" }} /> Presente + No votó</span>
          <span><span className="legend-sq" style={{ background: "#334155" }} /> Ausente</span>
          <span><span className="legend-sq" style={{ background: "#475569" }} /> En mora</span>
          <span>✅ SI · ❌ NO · ⚪ Abst · 📱 Manual · 🔒 Face ID</span>
        </div>
        <div className="presenter-units-grid">
          {effectiveUnits.map((unit) => (
            <div
              key={unit.id}
              className="presenter-unit-cell"
              style={{ backgroundColor: getUnitBg(unit) }}
              title={`${unit.code} · ${unit.owner}`}
            >
              <div className="presenter-unit-code">{unit.code}</div>
              <div className="presenter-unit-icons">
                {getVoteIcon(unit)}
                {getMethodIcon(unit)}
              </div>
            </div>
          ))}
        </div>
        {data?.units && (
          <div className="presenter-units-stats">
            Total: <strong>{data.units.length}</strong>
            {" · "}
            Presentes: <strong>{data.units.filter((u) => u.isPresent).length}</strong>
            {" · "}
            Votaron: <strong>{data.units.filter((u) => u.voteValue).length}</strong>
            {" · "}
            En mora: <strong>{data.units.filter((u) => u.paymentStatus === "MORA").length}</strong>
          </div>
        )}
      </section>

      <style>{`
        .presenter-root {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.15), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.2), transparent 50%),
            #0b1020;
          color: #e2e8f0;
          padding: 32px;
        }
        .presenter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.2);
          margin-bottom: 24px;
        }
        .presenter-title {
          font-size: 24px;
          font-weight: 700;
        }
        .presenter-subtitle {
          color: #cbd5f5;
          font-size: 14px;
        }
        .presenter-clock {
          font-size: 20px;
          font-weight: 600;
        }
        .presenter-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .panel {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          padding: 24px;
        }
        .panel-title {
          font-size: 16px;
          color: #cbd5f5;
          margin-bottom: 12px;
        }
        .panel-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .quorum-value {
          font-size: 64px;
          font-weight: 800;
          color: #38bdf8;
        }
        .quorum-status {
          display: inline-flex;
          margin-top: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .quorum-status.pending {
          background: rgba(234, 179, 8, 0.2);
          color: #fde68a;
          border-color: rgba(234, 179, 8, 0.4);
        }
        .quorum-detail {
          color: #cbd5f5;
          font-size: 14px;
          margin-top: 6px;
        }
        .vote-bars {
          display: grid;
          gap: 12px;
        }
        .vote-bar-label {
          font-size: 12px;
          color: #cbd5f5;
          margin-bottom: 6px;
        }
        .vote-bar-track {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
          height: 10px;
          overflow: hidden;
        }
        .vote-bar-track span {
          display: block;
          height: 100%;
          border-radius: 999px;
        }
        .panel-foot {
          margin-top: 14px;
          color: #cbd5f5;
          font-size: 13px;
        }
        .history-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }
        .presenter-units-section {
          margin-top: 28px;
          padding: 24px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
        }
        .presenter-units-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .presenter-units-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #e2e8f0;
        }
        .presenter-units-filter {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .presenter-units-filter label {
          color: #94a3b8;
          font-size: 14px;
        }
        .presenter-topic-select {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(30, 41, 59, 0.9);
          color: #e2e8f0;
          font-size: 14px;
          min-width: 220px;
        }
        .presenter-topic-active {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .presenter-units-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          margin-bottom: 14px;
          font-size: 12px;
          color: #94a3b8;
        }
        .presenter-units-legend .legend-sq {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 4px;
          vertical-align: middle;
        }
        .presenter-units-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          gap: 8px;
        }
        .presenter-unit-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(148, 163, 184, 0.15);
          color: #0f172a;
        }
        .presenter-unit-code {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
        }
        .presenter-unit-icons {
          font-size: 10px;
          margin-top: 2px;
        }
        .presenter-units-stats {
          margin-top: 14px;
          font-size: 13px;
          color: #94a3b8;
        }
        .presenter-units-stats strong {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
