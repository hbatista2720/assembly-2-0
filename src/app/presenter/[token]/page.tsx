"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getDemoResidents, isDemoResidentsContext } from "../../../lib/demoResidentsStore";
import { findAssembly } from "../../../lib/assembliesStore";

const OVERRIDES_STORAGE_PREFIX = "assembly_monitor_overrides_";
const CURRENT_TOPIC_STORAGE_PREFIX = "assembly_monitor_current_topic_";
const ASSEMBLY_STARTED_AT_PREFIX = "assembly_monitor_started_at_";
const ASSEMBLY_FIRST_CALL_PREFIX = "assembly_monitor_first_call_";
const ASSEMBLY_CONVOCATION_APPROVED_PREFIX = "assembly_monitor_convocation_approved_";
const ASSEMBLY_ORDER_OF_DAY_PREFIX = "assembly_monitor_order_of_day_";

function loadTimelineFromStorage(assemblyId: string) {
  if (typeof window === "undefined") return { startedAt: null, firstCallAt: null, convocationApproved: null as "primera" | "segunda" | null, orderOfDayApproved: null as "votacion_total" | "asentimiento" | null };
  const startedAt = localStorage.getItem(ASSEMBLY_STARTED_AT_PREFIX + assemblyId);
  const firstCallAt = localStorage.getItem(ASSEMBLY_FIRST_CALL_PREFIX + assemblyId);
  const convV = localStorage.getItem(ASSEMBLY_CONVOCATION_APPROVED_PREFIX + assemblyId);
  const convocationApproved = convV === "primera" || convV === "segunda" ? convV : null;
  const orderV = localStorage.getItem(ASSEMBLY_ORDER_OF_DAY_PREFIX + assemblyId);
  const orderOfDayApproved = orderV === "votacion_total" || orderV === "asentimiento" ? orderV : (orderV === "voto" ? "votacion_total" : orderV === "verbal" ? "asentimiento" : null);
  return { startedAt, firstCallAt, convocationApproved, orderOfDayApproved };
}

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

/** Mismos colores que Monitor Back Office: casillas bien visibles en tema oscuro. */
const getUnitBg = (u: Unit) => {
  if (u.paymentStatus === "MORA") return "#b45309";
  if (!u.isPresent) return "#94a3b8";
  if (u.voteValue === "NO") return "#dc2626";
  if (u.voteValue) return "#10b981";
  return "#eab308";
};

const getUnitBorderColor = (u: Unit) => getUnitBg(u);

/* Iconos SVG igual que vista tablero Back Office (mejor contraste en tema oscuro). */
const IconCheck = () => (
  <span className="presenter-unit-icon presenter-unit-icon-si" title="Votó SI" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
  </span>
);
const IconCross = () => (
  <span className="presenter-unit-icon presenter-unit-icon-no" title="Votó NO" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
  </span>
);
const IconCircle = () => (
  <span className="presenter-unit-icon presenter-unit-icon-abst" title="Abstención" aria-hidden>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /></svg>
  </span>
);
const IconManual = () => (
  <span className="presenter-unit-icon presenter-unit-icon-manual" title="Voto manual" aria-hidden>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
  </span>
);
const IconLock = () => (
  <span className="presenter-unit-icon presenter-unit-icon-faceid" title="Face ID activo" aria-hidden>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
  </span>
);

function getVoteIcon(u: Unit): ReactNode {
  if (!u.isPresent || u.paymentStatus === "MORA" || !u.voteValue) return null;
  if (u.voteValue === "SI") return <IconCheck />;
  if (u.voteValue === "NO") return <IconCross />;
  return <IconCircle />;
}

function getMethodIcon(u: Unit): ReactNode {
  if (!u.isPresent) return null;
  if (u.paymentStatus === "MORA") return <IconLock />;
  if (u.voteMethod === "MANUAL") return <IconManual />;
  if (u.hasFaceId) return <IconLock />;
  return null;
}

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
  const [timeline, setTimeline] = useState(() =>
    typeof window !== "undefined" ? loadTimelineFromStorage(new URLSearchParams(window.location.search).get("assemblyId") || "demo") : loadTimelineFromStorage("demo")
  );
  const [abandons, setAbandons] = useState<{ unit?: string; abandoned_at?: string }[]>([]);

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

  /** Unidades que abandonaron: no cuentan como presentes (igual que Monitor Back Office). */
  const abandonedUnitCodes = useMemo(
    () => new Set<string>(abandons.map((e) => e.unit).filter((u): u is string => !!u)),
    [abandons]
  );

  const quorumDisplay = useMemo(() => {
    if (isDemo && effectiveUnits.length > 0) {
      const total = effectiveUnits.length;
      const presentRaw = effectiveUnits.filter((u) => u.isPresent).length;
      const present = effectiveUnits.filter((u) => u.isPresent && !abandonedUnitCodes.has(u.code)).length;
      const percentage = total ? Math.round((Math.min(present, total) / total) * 1000) / 10 : 0;
      return { percentage, achieved: percentage >= 50, present, total };
    }
    return data?.quorum ?? null;
  }, [isDemo, effectiveUnits, abandonedUnitCodes, data?.quorum]);

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
    const refreshTimeline = () => setTimeline(loadTimelineFromStorage(assemblyId));
    refreshTimeline();
    const interval = setInterval(refreshTimeline, 3000);
    return () => clearInterval(interval);
  }, [assemblyId]);

  useEffect(() => {
    let active = true;
    const loadAbandons = async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hasValidAssemblyId = typeof assemblyId === "string" && uuidRegex.test(assemblyId);
      const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
      const url = hasValidAssemblyId
        ? `/api/resident-abandon?assemblyId=${encodeURIComponent(assemblyId)}`
        : orgId
          ? `/api/resident-abandon?organizationId=${encodeURIComponent(orgId)}`
          : null;
      if (!url) return;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();
      if (active && Array.isArray(json?.events)) setAbandons(json.events);
    };
    loadAbandons();
    const interval = setInterval(loadAbandons, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

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
      const res = await fetch(`/api/monitor/units?assemblyId=${encodeURIComponent(assemblyId)}&demo=1`);
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
    const interval = setInterval(loadDemoUnits, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isDemo, assemblyId]);

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

        <div className="panel presenter-timeline">
          <div className="panel-title">Línea de tiempo · Etapas</div>
          <div className="presenter-timeline-steps">
            <div className={`presenter-timeline-step ${timeline.startedAt ? "done" : "pending"}`}>
              <span className="presenter-timeline-dot" />
              <span className="presenter-timeline-label">Inicio de asamblea</span>
              {timeline.startedAt ? (
                <span className="presenter-timeline-time">{new Date(timeline.startedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              ) : (
                <span className="presenter-timeline-muted">No registrado</span>
              )}
            </div>
            <div className={`presenter-timeline-step ${timeline.firstCallAt ? "done" : "pending"}`}>
              <span className="presenter-timeline-dot" />
              <span className="presenter-timeline-label">Primera Convocatoria</span>
              {timeline.firstCallAt ? (
                <span className="presenter-timeline-time">{new Date(timeline.firstCallAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
              ) : (
                <span className="presenter-timeline-muted">Pendiente</span>
              )}
            </div>
            <div className={`presenter-timeline-step ${timeline.convocationApproved ? "done" : "pending"}`}>
              <span className="presenter-timeline-dot" />
              <span className="presenter-timeline-label">Quórum aprobado</span>
              {timeline.convocationApproved ? (
                <span className="presenter-timeline-time">{timeline.convocationApproved === "primera" ? "Primera convocatoria" : "Segunda convocatoria"}</span>
              ) : (
                <span className="presenter-timeline-muted">Pendiente</span>
              )}
            </div>
            <div className={`presenter-timeline-step ${timeline.orderOfDayApproved ? "done" : "pending"}`}>
              <span className="presenter-timeline-dot" />
              <span className="presenter-timeline-label">Orden del día aprobado</span>
              {timeline.orderOfDayApproved ? (
                <span className="presenter-timeline-time">{timeline.orderOfDayApproved === "votacion_total" ? "Votación Total" : "Por Asentimiento"}</span>
              ) : (
                <span className="presenter-timeline-muted">Pendiente</span>
              )}
            </div>
            <div className={`presenter-timeline-step ${timeline.orderOfDayApproved ? "done" : "pending"}`}>
              <span className="presenter-timeline-dot" />
              <span className="presenter-timeline-label">Fase de votación de temas</span>
              {timeline.orderOfDayApproved ? (
                <span className="presenter-timeline-time">En curso</span>
              ) : (
                <span className="presenter-timeline-muted">Tras aprobar orden del día</span>
              )}
            </div>
          </div>
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
              style={{
                backgroundColor: getUnitBg(unit),
                border: `2px solid ${getUnitBorderColor(unit)}`,
                color: "#fff",
              }}
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
        .presenter-timeline {
          grid-column: 1 / -1;
        }
        .presenter-timeline-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 24px;
          align-items: flex-start;
        }
        .presenter-timeline-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }
        .presenter-timeline-step .presenter-timeline-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          background: rgba(148, 163, 184, 0.4);
        }
        .presenter-timeline-step.done .presenter-timeline-dot {
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }
        .presenter-timeline-step .presenter-timeline-label {
          color: #e2e8f0;
          font-weight: 500;
        }
        .presenter-timeline-step .presenter-timeline-time {
          color: #10b981;
          font-weight: 600;
        }
        .presenter-timeline-step .presenter-timeline-muted {
          color: #64748b;
          font-size: 12px;
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
          font-weight: 600;
          color: #fff !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .presenter-unit-code {
          font-size: 11px;
          line-height: 1.2;
          color: #fff !important;
        }
        .presenter-unit-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-top: 2px;
        }
        .presenter-unit-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .presenter-unit-icon.presenter-unit-icon-si { color: #6ee7b7; }
        .presenter-unit-icon.presenter-unit-icon-no { color: #fca5a5; }
        .presenter-unit-icon.presenter-unit-icon-abst { color: #e2e8f0; }
        .presenter-unit-icon.presenter-unit-icon-manual { color: #a5b4fc; }
        .presenter-unit-icon.presenter-unit-icon-faceid { color: rgba(255,255,255,0.9); }
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
