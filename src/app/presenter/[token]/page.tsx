"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getDemoResidents, isDemoResidentsContext } from "../../../lib/demoResidentsStore";
import { findAssembly } from "../../../lib/assembliesStore";

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
  assemblyTitle?: string;
  assemblyDate?: string;
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
  if (u.paymentStatus === "MORA") return "rgba(180, 83, 9, 0.18)";
  if (!u.isPresent) return "rgba(148, 163, 184, 0.14)";
  if (u.voteValue === "NO") return "rgba(239, 68, 68, 0.1)";
  if (u.voteValue) return "rgba(16, 185, 129, 0.14)";
  return "rgba(234, 179, 8, 0.16)";
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

function formatAssemblyDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

export default function PresenterView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = typeof params?.token === "string" ? params.token : "demo-token";
  const assemblyIdFromUrl = searchParams.get("assemblyId") ?? undefined;

  const [now, setNow] = useState(new Date());
  const [data, setData] = useState<PresenterData | null>(null);
  const [demoMergedUnits, setDemoMergedUnits] = useState<Unit[] | null>(null);
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [localOverrides, setLocalOverrides] = useState<Record<string, { voteValue: "SI" | "NO" | "ABSTENCION" }>>({});
  const [syncTopic, setSyncTopic] = useState<{ topicId: string; topicTitle: string } | null>(null);

  const assemblyId = assemblyIdFromUrl ?? data?.assemblyId ?? "demo";
  const isDemo = token === "demo-token" && typeof window !== "undefined" && isDemoResidentsContext();

  const assembly = useMemo(() => {
    if (typeof window === "undefined" || !assemblyId) return null;
    return findAssembly(assemblyId);
  }, [assemblyId]);

  const displayTitle = assembly?.title ?? data?.assemblyTitle ?? "Asamblea";
  const displayDate = assembly?.date ? formatAssemblyDate(assembly.date) : (data?.assemblyDate ?? "");
  const assemblyTopics = useMemo(() => {
    if (assembly?.topics?.length) return assembly.topics.map((t) => ({ id: t.id, label: t.title }));
    return data?.topics ?? [];
  }, [assembly?.topics, data?.topics]);
  const historyItems = useMemo(() => {
    if (assembly?.topics?.length) return assembly.topics.map((t, i) => `Tema ${i + 1}: ${t.title}`);
    return data?.history ?? [];
  }, [assembly?.topics, data?.history]);

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
    const units = isDemo && demoMergedUnits?.length ? demoMergedUnits : (data?.units ?? []);
    const withOverrides = Object.keys(localOverrides).length === 0
      ? units
      : units.map((u) => {
          const ov = localOverrides[u.id];
          if (!ov) return u;
          return { ...u, voteValue: ov.voteValue, voteMethod: "MANUAL" as const };
        });
    return withOverrides;
  }, [isDemo, demoMergedUnits, data?.units, localOverrides]);

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

  const quorumDisplay = useMemo(() => {
    if (isDemo && effectiveUnits.length > 0) {
      const total = effectiveUnits.length;
      const present = effectiveUnits.filter((u) => u.isPresent).length;
      const percentage = total ? Math.round((present / total) * 1000) / 10 : 0;
      return { percentage, achieved: percentage >= 51, present, total };
    }
    return data?.quorum ?? null;
  }, [isDemo, effectiveUnits, data?.quorum]);

  const detailCounts = useMemo(() => {
    const list = effectiveUnits;
    const present = list.filter((u) => u.isPresent).length;
    const voted = list.filter((u) => u.voteValue).length;
    const presenteYVoto = list.filter((u) => u.isPresent && u.voteValue).length;
    const presenteNoVoto = Math.max(0, present - voted);
    const ausente = list.filter((u) => !u.isPresent).length;
    const enMora = list.filter((u) => u.paymentStatus === "MORA").length;
    const votaronSi = list.filter((u) => u.voteValue === "SI").length;
    const votaronNo = list.filter((u) => u.voteValue === "NO").length;
    const abstencion = list.filter((u) => u.voteValue === "ABSTENCION").length;
    const votoManual = list.filter((u) => u.voteMethod === "MANUAL").length;
    return { presenteYVoto, presenteNoVoto, ausente, enMora, votaronSi, votaronNo, abstencion, votoManual };
  }, [effectiveUnits]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const topicParams = syncTopic
      ? `&topicId=${encodeURIComponent(syncTopic.topicId)}&topicTitle=${encodeURIComponent(syncTopic.topicTitle)}`
      : "";
    const assemblyParam = assemblyId ? `&assemblyId=${encodeURIComponent(assemblyId)}` : "";
    const load = async () => {
      const res = await fetch(`/api/presenter/view?token=${token}${assemblyParam}${topicParams}`);
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
  }, [token, assemblyId, syncTopic?.topicId, syncTopic?.topicTitle]);

  useEffect(() => {
    if (!isDemo) {
      setDemoMergedUnits(null);
      return;
    }
    let active = true;
    const loadDemoUnits = async () => {
      const res = await fetch(`/api/monitor/units?assemblyId=demo&demo=1`);
      if (!res.ok) return;
      const json = await res.json();
      let list: Unit[] = json.units ?? [];
      try {
        const residents = getDemoResidents();
        list = list.filter((u) => residents.some((r) => (r.unit ?? "").trim() === (u.code ?? "").trim()));
        list = list.map((u) => {
          const unitCode = (u.code ?? "").trim();
          const inUnit = residents.filter((r) => (r.unit ?? "").trim() === unitCode);
          const resident = inUnit.find((r) => r.habilitado_para_asamblea) ?? inUnit[0];
          const paymentStatus = resident?.payment_status === "mora" ? "MORA" : "AL_DIA";
          const owner = resident?.nombre ?? resident?.email ?? u.owner;
          return { ...u, paymentStatus, owner };
        });
      } catch {
        // keep API units if store fails
      }
      if (active) setDemoMergedUnits(list);
    };
    loadDemoUnits();
    const interval = setInterval(loadDemoUnits, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isDemo]);

  return (
    <div className="presenter-root">
      <header className="presenter-header">
        <div>
          <div className="presenter-title">{displayTitle}</div>
          <div className="presenter-subtitle">
            {displayDate ? `${displayDate} · ` : ""}Modo Presentación · Solo lectura
          </div>
        </div>
        <div className="presenter-clock">{now.toLocaleTimeString()}</div>
      </header>

      <section className="presenter-grid">
        <div className="panel quorum">
          <div className="panel-title">Quórum Actual</div>
          <div className="quorum-value">{quorumDisplay ? `${quorumDisplay.percentage}%` : "--"}</div>
          <div className={`quorum-status ${quorumDisplay?.achieved ? "achieved" : "pending"}`}>
            {quorumDisplay?.achieved ? "✅ ALCANZADO" : "⚠️ PENDIENTE"}
          </div>
          <div className="quorum-detail">
            {quorumDisplay ? `${quorumDisplay.present} / ${quorumDisplay.total} propietarios presentes` : "Cargando..."}
          </div>
          <div className="quorum-detail">Actualización automática</div>
        </div>

        <div className="panel voting">
          <div className="panel-title">Tema en votación</div>
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
          <div className="panel-title">Temas de esta asamblea</div>
          {(historyItems.length ? historyItems : ["Cargando..."]).map((item) => (
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
              {assemblyTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filterTopic !== "all" && assemblyTopics.find((t) => t.id === filterTopic) && (
          <div className="presenter-topic-active">
            Tema: {assemblyTopics.find((t) => t.id === filterTopic)?.label}
          </div>
        )}
        <div className="presenter-units-legend">
          <span><span className="legend-sq" style={{ background: "#10b981" }} /> Presente + Votó</span>
          <span><span className="legend-sq" style={{ background: "#eab308" }} /> Presente + No votó</span>
          <span><span className="legend-sq" style={{ background: "#94a3b8" }} /> Ausente</span>
          <span><span className="legend-sq" style={{ background: "#b45309" }} /> En mora</span>
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
        {(data?.units || effectiveUnits.length > 0) && (
          <div className="presenter-units-stats">
            Total: <strong>{effectiveUnits.length}</strong>
            {" · "}
            Presentes: <strong>{effectiveUnits.filter((u) => u.isPresent).length}</strong>
            {" · "}
            Votaron: <strong>{effectiveUnits.filter((u) => u.voteValue).length}</strong>
            {" · "}
            En mora: <strong>{effectiveUnits.filter((u) => u.paymentStatus === "MORA").length}</strong>
          </div>
        )}
        <div className="presenter-detail-counts">
          <div className="presenter-detail-counts-title">Resumen por estado y voto (coincide con el grid)</div>
          <div className="presenter-detail-counts-grid">
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#10b981" }}><span className="presenter-detail-stat-label">Presente + Votó</span><strong>{detailCounts.presenteYVoto}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#eab308" }}><span className="presenter-detail-stat-label">Presente + No votó</span><strong>{detailCounts.presenteNoVoto}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#94a3b8" }}><span className="presenter-detail-stat-label">Ausente</span><strong>{detailCounts.ausente}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#b45309" }}><span className="presenter-detail-stat-label">En mora</span><strong>{detailCounts.enMora}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#10b981" }}><span className="presenter-detail-stat-label">Votó SI</span><strong>{detailCounts.votaronSi}</strong></div>
            <div className="presenter-detail-stat presenter-detail-stat--voto-no" style={{ borderLeftColor: "#ef4444" }}><span className="presenter-detail-stat-label">Votó NO</span><strong>{detailCounts.votaronNo}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#94a3b8" }}><span className="presenter-detail-stat-label">Abstención</span><strong>{detailCounts.abstencion}</strong></div>
            <div className="presenter-detail-stat" style={{ borderLeftColor: "#8b5cf6" }}><span className="presenter-detail-stat-label">Voto manual</span><strong>{detailCounts.votoManual}</strong></div>
          </div>
        </div>
      </section>

      <style>{`
        .presenter-root {
          min-height: 100vh;
          background: #0f172a;
          color: #e2e8f0;
          padding: 24px;
        }
        .presenter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.25);
          margin-bottom: 20px;
        }
        .presenter-title {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .presenter-subtitle {
          color: #94a3b8;
          font-size: 13px;
        }
        .presenter-clock {
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .presenter-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .panel {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 14px;
          padding: 16px;
        }
        .panel-title {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .panel-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 14px;
        }
        .quorum-value {
          font-size: 56px;
          font-weight: 800;
          color: #10b981;
        }
        .quorum-status {
          display: inline-flex;
          margin-top: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.25);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .quorum-status.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .quorum-detail {
          color: #94a3b8;
          font-size: 13px;
          margin-top: 6px;
        }
        .vote-bars {
          display: grid;
          gap: 12px;
        }
        .vote-bar-label {
          font-size: 12px;
          color: #e2e8f0;
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
          color: #94a3b8;
          font-size: 13px;
        }
        .history-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          font-size: 13px;
          color: #e2e8f0;
        }
        .presenter-units-section {
          margin-top: 24px;
          padding: 20px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 14px;
        }
        .presenter-units-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          margin-bottom: 14px;
        }
        .presenter-units-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .presenter-units-filter {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .presenter-units-filter label {
          color: #94a3b8;
          font-size: 13px;
        }
        .presenter-topic-select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(30, 41, 59, 0.9);
          color: #e2e8f0;
          font-size: 13px;
          min-width: 200px;
        }
        .presenter-topic-active {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .presenter-units-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12px;
          color: #94a3b8;
        }
        .presenter-units-legend .legend-sq {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 4px;
          margin-right: 6px;
          vertical-align: middle;
        }
        .presenter-units-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
          gap: 6px;
        }
        .presenter-unit-cell {
          aspect-ratio: 1;
          border-radius: 8px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #0f172a;
          font-weight: 600;
        }
        .presenter-unit-code {
          font-size: 11px;
          line-height: 1.2;
        }
        .presenter-unit-icons {
          font-size: 10px;
          margin-top: 2px;
        }
        .presenter-units-stats {
          margin-top: 12px;
          font-size: 13px;
          color: #94a3b8;
        }
        .presenter-units-stats strong {
          color: #e2e8f0;
        }
        .presenter-detail-counts {
          margin-top: 16px;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.15);
        }
        .presenter-detail-counts-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
        }
        .presenter-detail-counts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .presenter-detail-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px 12px;
          background: rgba(30, 41, 59, 0.6);
          border-radius: 10px;
          border-left: 3px solid #64748b;
          font-size: 13px;
          color: #e2e8f0;
        }
        .presenter-detail-stat strong {
          font-size: 18px;
          color: #f1f5f9;
        }
        .presenter-detail-stat-label {
          font-size: 11px;
          color: #94a3b8;
        }
        .presenter-detail-stat--voto-no {
          background: rgba(239, 68, 68, 0.18);
          border-left-width: 4px;
          border-left-color: #ef4444;
        }
      `}</style>
    </div>
  );
}
