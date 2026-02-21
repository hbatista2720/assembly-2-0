"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { findAssembly, updateAssembly, type Assembly, type AssemblyTopic } from "../../../../../lib/assembliesStore";
import { getDemoResidents, isDemoResidentsContext } from "../../../../../lib/demoResidentsStore";

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

const BUILDING_NAME_SINGLE = "Urban Tower PH";

/** Lógica de colores (Marketing): Verde = Presente+Votó, Amarillo = Presente+No votó, Gris claro = Ausente, Ámbar = En mora. */
const getBackgroundColor = (unit: Unit) => {
  if (unit.paymentStatus === "MORA") return "#b45309";
  if (!unit.isPresent) return "#94a3b8";
  if (unit.voteValue === "NO") return "#dc2626";
  if (unit.voteValue) return "#10b981";
  return "#eab308";
};

/** Mismo color pero para borde (tablero con fondo blanco + marco de color). */
const getBorderColor = (unit: Unit) => getBackgroundColor(unit);

/** Clase de estado para casilla (permite estilizar iconos cuando el fondo es blanco). */
function getUnitCellStatusClass(unit: Unit): string {
  if (unit.paymentStatus === "MORA") return "unit-cell--mora";
  if (!unit.isPresent) return "unit-cell--ausente";
  if (unit.voteValue === "NO") return "unit-cell--voto-no";
  if (unit.voteValue) return "unit-cell--presente-voto";
  return "unit-cell--presente-no-voto";
}

/** Solo 2 colores para la vista Tablero Quórum: presente = verde, no presente = gris. Quien abandonó deja de contar como presente. */
function getBackgroundColorQuorum(unit: Unit, abandonedCodes: Set<string>) {
  if (abandonedCodes.has(unit.code)) return "#94a3b8";
  return unit.isPresent ? "#10b981" : "#e2e8f0";
}

/* Iconos modernos para estado de voto y método */
const IconCheck = () => (
  <span className="unit-icon unit-icon-si" title="Votó SI" aria-hidden>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
  </span>
);
const IconCross = () => (
  <span className="unit-icon unit-icon-no" title="Votó NO" aria-hidden>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
  </span>
);
const IconCircle = () => (
  <span className="unit-icon unit-icon-abst" title="Abstención" aria-hidden>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /></svg>
  </span>
);
const IconManual = () => (
  <span className="unit-icon unit-icon-manual" title="Voto manual" aria-hidden>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
  </span>
);
const IconLock = () => (
  <span className="unit-icon unit-icon-faceid" title="Face ID activo" aria-hidden>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
  </span>
);

/** Iconos de voto solo en casillas verdes (Presente+Votó). Ausente/En mora no muestran ✓, X ni ○ (Ley 284). */
function getVoteIcon(unit: Unit): ReactNode {
  if (!unit.isPresent || unit.paymentStatus === "MORA" || !unit.voteValue) return null;
  if (unit.voteValue === "SI") return <IconCheck />;
  if (unit.voteValue === "NO") return <IconCross />;
  return <IconCircle />;
}

/** Método: mano = voto manual; candado = Face ID activo (solo en presentes). En mora mostramos candado para indicar "solo asistencia". */
function getMethodIcon(unit: Unit): ReactNode {
  if (!unit.isPresent) return null;
  if (unit.paymentStatus === "MORA") return <IconLock />;
  if (unit.voteMethod === "MANUAL") return <IconManual />;
  if (unit.hasFaceId) return <IconLock />;
  return null;
}

type ManualOverride = {
  voteValue?: "SI" | "NO" | "ABSTENCION";
  comment?: string;
  isModification?: boolean;
  /** Si la unidad estaba en mora y el residente regularizó a última hora, el admin puede marcarla como al día para permitir el voto. */
  paymentStatusOverride?: "AL_DIA";
};

const DEMO_EMAIL = "demo@assembly2.com";
const OVERRIDES_STORAGE_PREFIX = "assembly_monitor_overrides_";
const CURRENT_TOPIC_STORAGE_PREFIX = "assembly_monitor_current_topic_";
const ASSEMBLY_STARTED_AT_PREFIX = "assembly_monitor_started_at_";
const ASSEMBLY_FIRST_CALL_PREFIX = "assembly_monitor_first_call_";
const ASSEMBLY_CONVOCATION_APPROVED_PREFIX = "assembly_monitor_convocation_approved_";
const ASSEMBLY_ORDER_OF_DAY_PREFIX = "assembly_monitor_order_of_day_";

function loadAssemblyStartedAt(assemblyId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ASSEMBLY_STARTED_AT_PREFIX + assemblyId);
}
function saveAssemblyStartedAt(assemblyId: string, iso: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSEMBLY_STARTED_AT_PREFIX + assemblyId, iso);
}
function loadAssemblyFirstCall(assemblyId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ASSEMBLY_FIRST_CALL_PREFIX + assemblyId);
}
function saveAssemblyFirstCall(assemblyId: string, iso: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSEMBLY_FIRST_CALL_PREFIX + assemblyId, iso);
}

type ConvocationApproved = "primera" | "segunda";
function loadConvocationApproved(assemblyId: string): ConvocationApproved | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ASSEMBLY_CONVOCATION_APPROVED_PREFIX + assemblyId);
  return v === "primera" || v === "segunda" ? v : null;
}
function saveConvocationApproved(assemblyId: string, value: ConvocationApproved) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSEMBLY_CONVOCATION_APPROVED_PREFIX + assemblyId, value);
}

type OrderOfDayMethod = "votacion_total" | "asentimiento";
const ASSEMBLY_ORDER_OF_DAY_VOTES_PREFIX = "assembly_monitor_order_of_day_votes_";

function loadOrderOfDayApproved(assemblyId: string): OrderOfDayMethod | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ASSEMBLY_ORDER_OF_DAY_PREFIX + assemblyId);
  if (v === "votacion_total" || v === "asentimiento") return v;
  if (v === "voto") return "votacion_total";
  if (v === "verbal") return "asentimiento";
  return null;
}
function saveOrderOfDayApproved(assemblyId: string, value: OrderOfDayMethod) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSEMBLY_ORDER_OF_DAY_PREFIX + assemblyId, value);
}

function loadOrderOfDayVotes(assemblyId: string): Record<string, "SI" | "NO" | "ABSTENCION"> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSEMBLY_ORDER_OF_DAY_VOTES_PREFIX + assemblyId);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, "SI" | "NO" | "ABSTENCION">;
  } catch { return {}; }
}
function saveOrderOfDayVotes(assemblyId: string, votes: Record<string, "SI" | "NO" | "ABSTENCION">) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSEMBLY_ORDER_OF_DAY_VOTES_PREFIX + assemblyId, JSON.stringify(votes));
}

function loadOverridesFromStorage(assemblyId: string): Record<string, ManualOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_PREFIX + assemblyId);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ManualOverride>;
  } catch {
    return {};
  }
}

function saveOverridesToStorage(assemblyId: string, overrides: Record<string, ManualOverride>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OVERRIDES_STORAGE_PREFIX + assemblyId, JSON.stringify(overrides));
  } catch {}
}

/** monitorMode: desde la ruta /monitor/votacion/... o /monitor/quorum/... */
function useMonitorMode() {
  const pathname = usePathname();
  return typeof pathname === "string" && pathname.includes("/monitor/quorum/") ? "quorum" : "votacion";
}

export default function MonitorPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const assemblyId = typeof params?.assemblyId === "string" ? params.assemblyId : "demo";
  const monitorMode = useMonitorMode();

  useEffect(() => {
    if (typeof pathname !== "string") return;
    if (pathname.includes("/monitor/votacion/") || pathname.includes("/monitor/quorum/")) return;
    if (/\/dashboard\/admin-ph\/monitor\/[^/]+$/.test(pathname))
      router.replace(`/dashboard/admin-ph/monitor/votacion/${encodeURIComponent(assemblyId)}`);
  }, [pathname, assemblyId, router]);

  const [isDemo, setIsDemo] = useState(false);
  const [viewMode, setViewMode] = useState<"summary" | "grid" | "quorum">("grid");
  const [filterTower, setFilterTower] = useState("all");
  const [zoomLevel, setZoomLevel] = useState<"compact" | "normal" | "large">("normal");
  const [units, setUnits] = useState<Unit[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [abandons, setAbandons] = useState<AbandonEvent[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Record<string, ManualOverride>>(() => loadOverridesFromStorage(assemblyId));
  const [voteModalUnit, setVoteModalUnit] = useState<Unit | null>(null);
  const [voteModalValue, setVoteModalValue] = useState<"SI" | "NO" | "ABSTENCION">("SI");
  const [voteModalComment, setVoteModalComment] = useState("");
  const [moraConfirmText, setMoraConfirmText] = useState("");
  const [moraComment, setMoraComment] = useState("");
  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const [votingTopics, setVotingTopics] = useState<AssemblyTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<AssemblyTopic | null>(null);
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [finalizeConfirm, setFinalizeConfirm] = useState(false);
  const [assemblyStartedAt, setAssemblyStartedAt] = useState<string | null>(null);
  const [firstCallAt, setFirstCallAt] = useState<string | null>(null);
  const [convocationApproved, setConvocationApproved] = useState<ConvocationApproved | null>(null);
  const [orderOfDayApproved, setOrderOfDayApproved] = useState<OrderOfDayMethod | null>(null);
  const [orderOfDayVotes, setOrderOfDayVotes] = useState<Record<string, "SI" | "NO" | "ABSTENCION">>(() => loadOrderOfDayVotes(assemblyId));
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    notifyChatbot?: boolean;
    notifyEvent?: string;
    notifyLabel?: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [showGuiaVotacion, setShowGuiaVotacion] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setAssemblyStartedAt(loadAssemblyStartedAt(assemblyId));
    setFirstCallAt(loadAssemblyFirstCall(assemblyId));
    setConvocationApproved(loadConvocationApproved(assemblyId));
    setOrderOfDayApproved(loadOrderOfDayApproved(assemblyId));
    setOrderOfDayVotes(loadOrderOfDayVotes(assemblyId));
  }, [assemblyId]);

  const effectiveUnits = useMemo(() => {
    return units.map((u) => {
      const ov = manualOverrides[u.id];
      const paymentStatus = ov?.paymentStatusOverride === "AL_DIA" ? "AL_DIA" : u.paymentStatus;
      const voteValue = ov?.voteValue ?? u.voteValue;
      const voteMethod = ov?.voteValue ? ("MANUAL" as const) : u.voteMethod;
      return { ...u, paymentStatus, voteValue, voteMethod };
    });
  }, [units, manualOverrides]);

  /** Cargar votos orden del día desde API (votos desde chatbot + voto manual). */
  const fetchOrderOfDayVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/monitor/order-of-day-vote?assemblyId=${encodeURIComponent(assemblyId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { votes?: Record<string, "SI" | "NO" | "ABSTENCION"> };
      const byCode = data.votes ?? {};
      setOrderOfDayVotes((prev) => {
        const next = { ...prev };
        units.forEach((u) => {
          if (byCode[u.code] != null) next[u.id] = byCode[u.code];
        });
        return next;
      });
    } catch {
      // keep localStorage fallback
    }
  }, [assemblyId, units]);

  useEffect(() => {
    if (orderOfDayApproved !== "votacion_total") return;
    fetchOrderOfDayVotes();
    const t = setInterval(fetchOrderOfDayVotes, 5000);
    return () => clearInterval(t);
  }, [orderOfDayApproved, fetchOrderOfDayVotes]);

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    notifyChatbot?: boolean,
    notifyEvent?: string,
    notifyLabel?: string
  ) => {
    setConfirmModal({ open: true, title, message, onConfirm, notifyChatbot, notifyEvent, notifyLabel });
  };
  const closeConfirm = () => setConfirmModal((m) => ({ ...m, open: false }));
  const handleConfirm = async () => {
    confirmModal.onConfirm();
    closeConfirm();
    if (confirmModal.notifyChatbot && (confirmModal.notifyEvent || confirmModal.notifyLabel)) {
      try {
        await fetch("/api/monitor/notify-residents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assemblyId,
            event: confirmModal.notifyEvent ?? "notify",
            label: confirmModal.notifyLabel ?? confirmModal.title,
          }),
        });
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    setManualOverrides(loadOverridesFromStorage(assemblyId));
  }, [assemblyId]);

  useEffect(() => {
    const email = (typeof window !== "undefined" && localStorage.getItem("assembly_email")) || "";
    setIsDemo(email.toLowerCase() === DEMO_EMAIL);
  }, []);

  useEffect(() => {
    const key = OVERRIDES_STORAGE_PREFIX + assemblyId;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setManualOverrides(JSON.parse(e.newValue) as Record<string, ManualOverride>);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [assemblyId]);

  useEffect(() => {
    if (typeof window === "undefined" || !assemblyId) return;
    const a = findAssembly(assemblyId);
    setAssembly(a ?? null);
    const topics = a?.topics?.filter(
      (t) => t.type === "votacion_simple" || t.type === "votacion_calificada"
    ) ?? [];
    setVotingTopics(topics);
    setSelectedTopic(topics.length > 0 ? topics[0]! : null);
  }, [assemblyId]);

  useEffect(() => {
    if (typeof window === "undefined" || !assemblyId) return;
    const key = CURRENT_TOPIC_STORAGE_PREFIX + assemblyId;
    if (selectedTopic) {
      try {
        localStorage.setItem(key, JSON.stringify({ topicId: selectedTopic.id, topicTitle: selectedTopic.title }));
      } catch {}
    } else {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  }, [assemblyId, selectedTopic]);

  const demoParam = isDemo ? "&demo=1" : "";
  const topicParams = selectedTopic
    ? `&topicId=${encodeURIComponent(selectedTopic.id)}&topicTitle=${encodeURIComponent(selectedTopic.title)}`
    : "";

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      const res = await fetch(
        `/api/monitor/summary?assemblyId=${encodeURIComponent(assemblyId)}${demoParam}${topicParams}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as Summary;
      if (active) setSummary(data);
    };
    loadSummary();
    const interval = setInterval(loadSummary, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId, demoParam, topicParams]);

  useEffect(() => {
    let active = true;
    const loadUnits = async () => {
      const res = await fetch(`/api/monitor/units?assemblyId=${encodeURIComponent(assemblyId)}${demoParam}`);
      if (!res.ok) return;
      const data = await res.json();
      let list: Unit[] = data.units || [];
      if (active && isDemoResidentsContext()) {
        try {
          const residents = getDemoResidents();
          // Solo mostrar unidades que tengan al menos un residente en el listado (QA Mejora 2)
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
      }
      if (active) setUnits(list);
    };
    loadUnits();
    const interval = setInterval(loadUnits, 12_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId, demoParam]);

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
    const interval = setInterval(loadAbandons, 12_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [assemblyId]);

  const towerOptions = useMemo(() => {
    const byTower: Record<string, number> = {};
    units.forEach((u) => {
      byTower[u.tower] = (byTower[u.tower] || 0) + 1;
    });
    const entries = Object.entries(byTower);
    if (entries.length === 1 && entries[0][1] === 50) {
      return [{ id: entries[0][0], label: BUILDING_NAME_SINGLE, count: 50 }];
    }
    return entries.map(([id, count]) => ({
      id,
      label: id === "A" ? "Torre A" : id === "B" ? "Torre B" : `Torre ${id}`,
      count,
    }));
  }, [units]);

  const filteredUnits = useMemo(() => {
    const list = filterTower === "all" ? effectiveUnits : effectiveUnits.filter((unit) => unit.tower === filterTower);
    return list;
  }, [filterTower, effectiveUnits]);

  /** Unidades que abandonaron la sala: dejan de contar como presentes para el quórum (T12). */
  const abandonedUnitCodes = useMemo(
    () => new Set<string>(abandons.map((e) => e.unit).filter((u): u is string => !!u)),
    [abandons]
  );

  const displayStats = useMemo(() => {
    if (!summary) return null;
    const isDemo = isDemoResidentsContext();
    const hasOverrides = Object.keys(manualOverrides).length > 0;
    if (isDemo && effectiveUnits.length > 0) {
      const total = effectiveUnits.length;
      const present = effectiveUnits.filter((u) => u.isPresent).length;
      const voted = effectiveUnits.filter((u) => u.voteValue).length;
      const mora = effectiveUnits.filter((u) => u.paymentStatus === "MORA").length;
      const faceId = effectiveUnits.filter((u) => u.hasFaceId).length;
      return { total, present, voted, mora, faceId };
    }
    if (hasOverrides) {
      const total = effectiveUnits.length;
      const present = effectiveUnits.filter((u) => u.isPresent).length;
      const voted = effectiveUnits.filter((u) => u.voteValue).length;
      const mora = effectiveUnits.filter((u) => u.paymentStatus === "MORA").length;
      const faceId = effectiveUnits.filter((u) => u.hasFaceId).length;
      return { total, present, voted, mora, faceId };
    }
    return summary.stats;
  }, [summary, manualOverrides, effectiveUnits]);

  /** Contadores detallados por estado y tipo de voto. Presente+No votó = Presentes − Votaron (una sola fuente de verdad). */
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

  /** Mismos contadores sobre las unidades filtradas (tablero) para que grid y resumen coincidan. */
  const detailCountsFiltered = useMemo(() => {
    const list = filteredUnits;
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
  }, [filteredUnits]);

  /** Quórum considerando abandonos: quien abandona deja de contar como presente (T12). Si tras abandonos ya no se alcanza, quorumLost. */
  const quorumResult = useMemo(() => {
    const stats = displayStats ?? summary?.stats ?? null;
    const quorumFromApi = summary?.quorum;
    const total = stats?.total ?? quorumFromApi?.total ?? effectiveUnits.length ?? 0;
    const presentRaw = stats?.present ?? quorumFromApi?.present ?? effectiveUnits.filter((u) => u.isPresent).length;
    const presentAdjusted = effectiveUnits.filter((u) => u.isPresent && !abandonedUnitCodes.has(u.code)).length;
    const present = total ? Math.min(presentAdjusted, total) : 0;
    const percentage = total ? Math.round((present / total) * 100) : 0;
    const achieved = total ? present / total >= 0.5 : false;
    const achievedBeforeAbandons = total ? presentRaw / total >= 0.5 : false;
    const quorumLost = achievedBeforeAbandons && !achieved && abandonedUnitCodes.size > 0;
    return { percentage, present, total, achieved, quorumLost };
  }, [summary, displayStats, effectiveUnits, abandonedUnitCodes]);

  const handleExportExcel = () => {
    const buildingName = towerOptions.length === 1 ? towerOptions[0].label : "Monitor Asamblea";
    const stats = displayStats ?? summary?.stats ?? { total: 0, present: 0, voted: 0, mora: 0, faceId: 0 };
    const quorumStatus = quorumResult.quorumLost ? "Perdido (tras abandonos)" : quorumResult.achieved ? "Alcanzado" : "No alcanzado";
    const topic = summary?.votation?.topic ?? "Votación en curso";
    const results = summary?.votation?.results ?? { si: 0, no: 0, abst: 0 };
    const dateStr = new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

    const sections: string[][] = [
      ["INFORME DE ASAMBLEA"],
      [buildingName, dateStr],
      [],
      ["1. RESUMEN DE LA ASAMBLEA"],
      ["Indicador", "Valor"],
      ["Total unidades", String(stats.total)],
      ["Presentes (excl. abandonos)", String(quorumResult.present)],
      ["Votaron", String(stats.voted)],
      ["En mora", String(stats.mora)],
      ["Face ID activo", String(stats.faceId)],
      [],
      ["2. TEMA O PREGUNTA DE LA VOTACIÓN"],
      ["Tema", topic],
      ["SI %", String(results.si)],
      ["NO %", String(results.no)],
      ["Abstención %", String(results.abst)],
      ["Votos emitidos", `${stats.voted} / ${quorumResult.present}`],
      [],
      ["3. QUÓRUM"],
      ["Estado", quorumStatus],
      ["Presentes / Total", `${quorumResult.present} / ${quorumResult.total}`],
      [],
      ["4. ABANDONOS DE SALA"],
      ["Total abandonos", String(abandons.length)],
      ["Residente", "Unidad", "Email", "Hora"],
      ...abandons.slice(0, 100).map((e) => [
        e.resident_name ?? "—",
        e.unit ?? "—",
        e.email,
        e.abandoned_at ? new Date(e.abandoned_at).toLocaleString("es-ES") : "—",
      ]),
      [],
      ["5. VISTA POR UNIDAD"],
      ["Unidad", "Propietario", "Estado", "Voto", "Método"],
      ...effectiveUnits.map((u) => {
        const estado = u.paymentStatus === "MORA" ? "En mora" : u.isPresent ? "Presente" : "Ausente";
        return [u.code, u.owner, estado, u.voteValue ?? "—", u.voteMethod ?? "—"];
      }),
      [],
      ["6. LEYENDA"],
      ["Verde", "Presente + Votó"],
      ["Amarillo", "Presente + No votó"],
      ["Gris claro", "Ausente"],
      ["Gris oscuro", "En mora"],
      ["✅", "Votó SI"],
      ["❌", "Votó NO"],
      ["⚪", "Abstención"],
      ["📱", "Voto manual"],
    ];
    const csv = sections.map((row) => row.map(esc).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Informe_Asamblea_${buildingName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const buildingName = towerOptions.length === 1 ? towerOptions[0].label : "Monitor Asamblea";
    const stats = displayStats ?? summary?.stats ?? { total: 0, present: 0, voted: 0, mora: 0, faceId: 0 };
    const topic = summary?.votation?.topic ?? "Votación en curso";
    const results = summary?.votation?.results ?? { si: 0, no: 0, abst: 0 };
    const votesCount = summary?.votation?.votesCount ?? stats.voted;
    const attendeesCount = summary?.votation?.attendeesCount ?? quorumResult.present;
    const dateStr = new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });

    const quorumStatus = quorumResult.quorumLost ? "Perdido (tras abandonos)" : quorumResult.achieved ? "Alcanzado" : "No alcanzado";
    const quorumPct = quorumResult.percentage;

    const rows = effectiveUnits.map((u) => {
      const estado = u.paymentStatus === "MORA" ? "En mora" : u.isPresent ? "Presente" : "Ausente";
      const voto = u.voteValue ?? "—";
      return `<tr><td>${u.code}</td><td>${u.owner}</td><td>${estado}</td><td>${voto}</td><td>${u.voteMethod ?? "—"}</td></tr>`;
    }).join("");

    const abandonsRows = abandons.slice(0, 50).map((e) => `<tr><td>${e.resident_name ?? "—"}</td><td>${e.unit ?? "—"}</td><td>${e.email}</td><td>${e.abandoned_at ? new Date(e.abandoned_at).toLocaleString("es-ES") : "—"}</td></tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Informe de Asamblea - ${buildingName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 12px; color: #1e293b; line-height: 1.4; max-width: 900px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 8px; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .meta { color: #64748b; font-size: 11px; margin-bottom: 20px; }
    h2 { font-size: 14px; margin: 20px 0 10px; color: #334155; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 16px; }
    .stat-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
    .stat-value { font-size: 18px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 10px; color: #64748b; margin-top: 2px; }
    .vote-bars { margin: 12px 0; }
    .vote-bar { margin-bottom: 8px; }
    .vote-bar-label { font-size: 11px; margin-bottom: 2px; display: flex; justify-content: space-between; }
    .vote-bar-track { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .vote-bar-fill { height: 100%; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    tr:nth-child(even) { background: #fafafa; }
    .leyenda { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; font-size: 10px; color: #475569; }
    .leyenda-item { display: flex; align-items: center; gap: 4px; }
    .leyenda-color { width: 12px; height: 12px; border-radius: 3px; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 16px; } .card { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Informe de Asamblea</h1>
  <p class="meta">${buildingName} · Generado el ${dateStr}</p>

  <h2>1. Resumen de la asamblea</h2>
  <div class="card">
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-value">${stats.total}</div><div class="stat-label">Total unidades</div></div>
      <div class="stat-box"><div class="stat-value">${stats.present}</div><div class="stat-label">Presentes</div></div>
      <div class="stat-box"><div class="stat-value">${stats.voted}</div><div class="stat-label">Votaron</div></div>
      <div class="stat-box"><div class="stat-value">${stats.mora}</div><div class="stat-label">En mora</div></div>
      <div class="stat-box"><div class="stat-value">${stats.faceId}</div><div class="stat-label">Face ID activo</div></div>
    </div>
  </div>

  <h2>2. Tema o pregunta de la votación</h2>
  <div class="card">
    <p style="margin: 0 0 10px; font-weight: 600;">${topic}</p>
    <p style="margin: 0; font-size: 11px; color: #64748b;">Votos emitidos: ${votesCount} / ${attendeesCount} presentes</p>
    <div class="vote-bars">
      <div class="vote-bar"><div class="vote-bar-label"><span>SI</span><span>${results.si}%</span></div><div class="vote-bar-track"><div class="vote-bar-fill" style="width:${results.si}%; background:#10b981;"></div></div></div>
      <div class="vote-bar"><div class="vote-bar-label"><span>NO</span><span>${results.no}%</span></div><div class="vote-bar-track"><div class="vote-bar-fill" style="width:${results.no}%; background:#ef4444;"></div></div></div>
      <div class="vote-bar"><div class="vote-bar-label"><span>Abstención</span><span>${results.abst}%</span></div><div class="vote-bar-track"><div class="vote-bar-fill" style="width:${results.abst}%; background:#94a3b8;"></div></div></div>
    </div>
  </div>

  <h2>3. Quórum</h2>
  <div class="card">
    <p style="margin: 0;"><strong>Estado:</strong> ${quorumStatus} · ${quorumResult.present} / ${quorumResult.total} (${quorumPct}%)</p>
  </div>

  <h2>4. Abandonos de sala</h2>
  <div class="card">
    <p style="margin: 0 0 8px;"><strong>Total abandonos registrados:</strong> ${abandons.length}</p>
    ${abandons.length > 0 ? `<table><thead><tr><th>Residente</th><th>Unidad</th><th>Email</th><th>Hora</th></tr></thead><tbody>${abandonsRows}</tbody></table>` : "<p style='margin:0; color:#64748b;'>No hay registros de abandono de sala.</p>"}
  </div>

  <h2>5. Vista por unidad</h2>
  <div class="card">
    <table><thead><tr><th>Unidad</th><th>Propietario</th><th>Estado</th><th>Voto</th><th>Método</th></tr></thead><tbody>${rows}</tbody></table>
  </div>

  <h2>6. Leyenda</h2>
  <div class="card">
    <div class="leyenda">
      <div class="leyenda-item"><span class="leyenda-color" style="background:#10b981;"></span> Presente + Votó</div>
      <div class="leyenda-item"><span class="leyenda-color" style="background:#fbbf24;"></span> Presente + No votó</div>
      <div class="leyenda-item"><span class="leyenda-color" style="background:#e2e8f0;"></span> Ausente</div>
      <div class="leyenda-item"><span class="leyenda-color" style="background:#475569;"></span> En mora</div>
      <div class="leyenda-item">✅ Votó SI</div>
      <div class="leyenda-item">❌ Votó NO</div>
      <div class="leyenda-item">⚪ Abstención</div>
      <div class="leyenda-item">📱 Voto manual</div>
    </div>
  </div>

  <p class="footer">Assembly 2.0 · Informe generado desde el Monitor de asamblea. Este documento es un resumen con fines de seguimiento.</p>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const w = window.open(blobUrl, "_blank", "noopener");
    if (w) {
      URL.revokeObjectURL(blobUrl);
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Informe_Asamblea_${buildingName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      alert("No se pudo abrir una nueva pestaña. Se ha descargado el informe en HTML. Ábrelo en el navegador y usa Imprimir (Ctrl+P) → Guardar como PDF para obtener el resumen profesional.");
    }
  };

  const openVoteModal = (unit: Unit) => {
    const ov = manualOverrides[unit.id];
    setVoteModalUnit(unit);
    setVoteModalValue(ov?.voteValue ?? unit.voteValue ?? "SI");
    setVoteModalComment(ov?.comment ?? "");
    if (unit.paymentStatus === "MORA") {
      setMoraConfirmText("");
      setMoraComment("");
    }
  };

  const saveVoteModal = () => {
    if (!voteModalUnit) return;
    const originalUnit = units.find((u) => u.id === voteModalUnit.id);
    const isModification = !!(originalUnit?.voteValue) || !!manualOverrides[voteModalUnit.id];
    if (isModification && !voteModalComment.trim()) {
      alert("Debe indicar el motivo del cambio de voto (comentario obligatorio).");
      return;
    }
    const votoAnterior = manualOverrides[voteModalUnit.id]?.voteValue ?? originalUnit?.voteValue ?? "—";
    const votoNuevo = voteModalValue;
    const existing = manualOverrides[voteModalUnit.id];
    const nextOverrides = {
      ...manualOverrides,
      [voteModalUnit.id]: {
        ...existing,
        voteValue: voteModalValue,
        comment: voteModalComment.trim() || undefined,
        isModification,
      },
    };
    setManualOverrides(nextOverrides);
    saveOverridesToStorage(assemblyId, nextOverrides);
    if (typeof window !== "undefined") {
      const key = `vote_changes_${assemblyId}`;
      const raw = localStorage.getItem(key);
      const list: { id: string; resident_name: string; unit: string; email: string; voto_anterior: string; voto_nuevo: string; changed_at: string; comment?: string }[] = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: `vc-${Date.now()}-${voteModalUnit.id}`,
        resident_name: voteModalUnit.owner,
        unit: voteModalUnit.code,
        email: "",
        voto_anterior: typeof votoAnterior === "string" ? votoAnterior : "—",
        voto_nuevo: votoNuevo,
        changed_at: new Date().toISOString(),
        comment: voteModalComment.trim() || undefined,
      });
      localStorage.setItem(key, JSON.stringify(list));
    }
    setVoteModalUnit(null);
  };

  const setAlDiaOverride = (unitId: string, comment?: string) => {
    const existing = manualOverrides[unitId];
    const nextOverrides = {
      ...manualOverrides,
      [unitId]: { ...existing, paymentStatusOverride: "AL_DIA" as const, comment: comment || existing?.comment },
    };
    setManualOverrides(nextOverrides);
    saveOverridesToStorage(assemblyId, nextOverrides);
    setVoteModalUnit(null);
  };

  const revertMoraOverride = (unitId: string) => {
    const existing = manualOverrides[unitId];
    if (!existing) return;
    const { paymentStatusOverride: _, ...rest } = existing;
    const nextOverrides = { ...manualOverrides };
    if (Object.keys(rest).length > 0) {
      nextOverrides[unitId] = rest as ManualOverride;
    } else {
      delete nextOverrides[unitId];
    }
    setManualOverrides(nextOverrides);
    saveOverridesToStorage(assemblyId, nextOverrides);
    setVoteModalUnit(null);
  };

  const syncTemaActivoToChatbot = async (title: string, status: "Abierto" | "Cerrado") => {
    try {
      await fetch("/api/tema-activo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status }),
      });
    } catch {
      // ignore
    }
  };

  const setTopicVotingOpen = (topicId: string, open: boolean) => {
    if (!assembly) return;
    const updated = updateAssembly(assembly.id, (current) => ({
      ...current,
      topics: current.topics.map((t) =>
        t.id === topicId ? { ...t, votingOpen: open } : t
      ),
    }));
    if (updated) {
      setAssembly(updated);
      const topic = updated.topics.find((t) => t.id === topicId);
      if (topic) {
        setVotingTopics(updated.topics.filter((t) => t.type === "votacion_simple" || t.type === "votacion_calificada"));
        syncTemaActivoToChatbot(topic.title, open ? "Abierto" : "Cerrado");
      }
    }
  };

  const handleFinalizeAssembly = () => {
    if (!assembly) return;
    const updated = updateAssembly(assembly.id, (current) => ({
      ...current,
      status: "Completada" as const,
      topics: current.topics.map((t) => ({ ...t, votingOpen: false })),
    }));
    if (updated) {
      setAssembly(updated);
      setVotingTopics(updated.topics.filter((t) => t.type === "votacion_simple" || t.type === "votacion_calificada"));
      syncTemaActivoToChatbot(assembly.title, "Cerrado");
      setFinalizeConfirm(false);
    }
  };

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
      <h1 className="monitor-page-title" style={{ marginTop: 0, marginBottom: "16px", fontSize: "1.35rem", fontWeight: 600 }}>
        {monitorMode === "quorum" ? "Monitor de Quórum" : "Monitor de Votación"}
        {" · "}
        {assemblyId === "demo" ? "Demo" : (assembly?.title ?? "Asamblea")}
      </h1>
      <div className="monitor-actions" style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <Link
          href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}/abandonos`}
          className="btn btn-ghost"
          scroll={true}
          title="Ver histórico de asistencia y abandonos para auditoría"
        >
          Histórico
        </Link>
        {monitorMode === "quorum" && (
          convocationApproved ? (
            <span className="monitor-badge-asistencia-tardios" title="Quórum aprobado">
              Convocatoria cumplida
            </span>
          ) : (
            <span className="monitor-badge-asistencia-activa" title="Registro de asistencia activo">
              Chatbot · Asistencia activa
            </span>
          )
        )}
        {monitorMode !== "quorum" && (
        <Link
          href={`/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyId)}/modificaciones-voto`}
          className="btn btn-ghost"
          scroll={true}
        >
          Modificaciones de voto
        </Link>
        )}
      </div>
      {monitorMode === "votacion" && (
      <div className="monitor-header">
        {votingTopics.length > 0 && (
          <div className="monitor-topic-filter monitor-topic-filter-labeled" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: "13px" }}>Tema de votación (resultados):</span>
            <select
              value={selectedTopic?.id ?? ""}
              onChange={(e) => {
                const t = votingTopics.find((x) => x.id === e.target.value);
                setSelectedTopic(t ?? null);
              }}
              className="tower-filter"
              aria-label="Filtrar por tema de votación"
              style={{ minWidth: "200px" }}
              title="Filtra los resultados SI/NO/ABST por tema."
            >
              {votingTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="view-toggle">
          <button className={viewMode === "summary" ? "active" : ""} onClick={() => setViewMode("summary")}>
            📊 Vista Resumen
          </button>
          <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} title="Vista en tablero por unidades">
            <span className="view-toggle-icon" aria-hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
            Vista Tablero
          </button>
        </div>
        {viewMode === "grid" && (
          <>
            {towerOptions.length > 1 && (
              <select value={filterTower} onChange={(event) => setFilterTower(event.target.value)} className="tower-filter">
                <option value="all">🏢 Todas las Torres</option>
                {towerOptions.map((tower) => (
                  <option key={tower.id} value={tower.id}>
                    {tower.label} ({tower.count} unidades)
                  </option>
                ))}
              </select>
            )}
            <div className="zoom-controls" role="group" aria-label="Vista de la unidad en el tablero">
              <span className="zoom-controls-label">Vista de la Unidad:</span>
              <button type="button" onClick={() => setZoomLevel("compact")} className={zoomLevel === "compact" ? "active" : ""} title="Celdas más pequeñas, más unidades visibles">Pequeñas</button>
              <button type="button" onClick={() => setZoomLevel("normal")} className={zoomLevel === "normal" ? "active" : ""} title="Tamaño estándar">Medianas</button>
              <button type="button" onClick={() => setZoomLevel("large")} className={zoomLevel === "large" ? "active" : ""} title="Celdas más grandes para leer mejor">Grandes</button>
            </div>
          </>
        )}
        <div className="monitor-export" style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button type="button" className="btn btn-ghost" onClick={handleExportExcel}>
            Exportar Excel
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleExportPdf}>
            Exportar PDF
          </button>
        </div>
      </div>
      )}
      {monitorMode === "quorum" && (
        <div className="monitor-header">
          {towerOptions.length > 1 && (
            <select value={filterTower} onChange={(event) => setFilterTower(event.target.value)} className="tower-filter">
              <option value="all">🏢 Todas las Torres</option>
              {towerOptions.map((tower) => (
                <option key={tower.id} value={tower.id}>{tower.label} ({tower.count} unidades)</option>
              ))}
            </select>
          )}
          <div className="zoom-controls" role="group" aria-label="Vista de la unidad en el tablero">
            <span className="zoom-controls-label">Vista de la Unidad:</span>
            <button type="button" onClick={() => setZoomLevel("compact")} className={zoomLevel === "compact" ? "active" : ""} title="Celdas más pequeñas, más unidades visibles">Pequeñas</button>
            <button type="button" onClick={() => setZoomLevel("normal")} className={zoomLevel === "normal" ? "active" : ""} title="Tamaño estándar">Medianas</button>
            <button type="button" onClick={() => setZoomLevel("large")} className={zoomLevel === "large" ? "active" : ""} title="Celdas más grandes para leer mejor">Grandes</button>
          </div>
        </div>
      )}

      {/* Tablero Quórum: resultado de quórum y asistencia. Un solo reloj arriba para no confundir. */}
      <div className="monitor-tableros" id="tablero-quorum">
        <div className="tablero-clock tablero-clock-single" aria-live="polite" style={{ gridColumn: "1 / -1", marginBottom: "8px", fontSize: "14px", opacity: 0.9 }}>
          {liveNow.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}{" "}
          · {liveNow.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className="tablero-card tablero-quorum-result">
          <div className="tablero-header">
            <span className="tablero-title">Tablero Quórum</span>
            <span className="tablero-live">En vivo</span>
          </div>
          <div className="tablero-quorum-stats">
            <div className="tablero-quorum-value">
              {(summary || displayStats) ? `${quorumResult.percentage}%` : "—"}
            </div>
            <div className="tablero-quorum-label">Resultado de quórum</div>
            <div className="tablero-quorum-detail">
              {quorumResult.total > 0 ? `${quorumResult.present} / ${quorumResult.total} presentes` : "—"}
            </div>
            <div className="tablero-quorum-estado">
              <span className={`tablero-quorum-badge ${quorumResult.quorumLost ? "quorum-lost" : quorumResult.achieved ? "achieved" : "not-achieved"}`}>
                {quorumResult.quorumLost ? "Quórum perdido" : quorumResult.achieved ? "Quórum alcanzado" : "Quórum no alcanzado"}
              </span>
            </div>
          </div>
        </div>
        {monitorMode !== "quorum" && (
        <div className="tablero-card tablero-asistencia">
          <div className="tablero-header">
            <span className="tablero-title">Asistencia</span>
            <span className="tablero-live">En vivo</span>
          </div>
          <div className="tablero-quorum-stats">
            <div className="tablero-quorum-value">
              {(summary || displayStats) ? `${quorumResult.percentage}%` : "—"}
            </div>
            <div className="tablero-quorum-label">Asistencia</div>
            <div className="tablero-quorum-detail">
              {quorumResult.total > 0 ? `${quorumResult.present} / ${quorumResult.total} presentes` : "—"}
            </div>
          </div>
        </div>
        )}
        {(() => {
          const assembly = findAssembly(assemblyId);
          const scheduledDate = assembly?.date ? new Date(assembly.date) : null;
          const primeraConvocatoriaHora = scheduledDate
            ? scheduledDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
            : "—";
          const segundaConvocatoriaDate = scheduledDate ? new Date(scheduledDate.getTime() + 60 * 60 * 1000) : null;
          const segundaConvocatoriaHora = segundaConvocatoriaDate
            ? segundaConvocatoriaDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
            : "—";
          const now = liveNow.getTime();
          const oneHourMs = 60 * 60 * 1000;
          const firstCallMs = firstCallAt ? new Date(firstCallAt).getTime() : 0;
          const oneHourFulfilled = firstCallMs > 0 && now - firstCallMs >= oneHourMs;
          const minutesRemaining = firstCallMs > 0 && !oneHourFulfilled
            ? Math.ceil((firstCallMs + oneHourMs - now) / 60000)
            : 0;

          const step1Done = !!assemblyStartedAt;
          const step2Done = !!firstCallAt;
          const step3Done = oneHourFulfilled;
          const step4Label = "Segunda Convocatoria";
          const step5Done = !!convocationApproved;

          return (
            <div className="tablero-card tablero-convocatorias">
              <div className="tablero-header">
                <span className="tablero-title">Cronograma · Convocatorias</span>
                <span className="tablero-live">En vivo</span>
              </div>
              <div className="conv-timeline">
                {/* Etapa 1: Inicio */}
                <div className={`conv-timeline-step ${step1Done ? "conv-timeline-step--done" : "conv-timeline-step--current"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">Inicio de asamblea</span>
                    {assemblyStartedAt ? (
                      <span className="conv-timeline-time">
                        {new Date(assemblyStartedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    ) : (
                      <>
                        <span className="conv-timeline-muted">No registrado</span>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const iso = new Date().toISOString(); saveAssemblyStartedAt(assemblyId, iso); setAssemblyStartedAt(iso); }}>
                          Marcar inicio de hora
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Etapa 2: Primera Convocatoria */}
                <div className={`conv-timeline-step ${step2Done ? "conv-timeline-step--done" : step1Done ? "conv-timeline-step--current" : "conv-timeline-step--pending"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">Primera Convocatoria</span>
                    <span className="conv-timeline-muted">Hora pactada {primeraConvocatoriaHora}</span>
                    {firstCallAt ? (
                      <span className="conv-timeline-time">
                        Primer llamado a las {new Date(firstCallAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    ) : scheduledDate && step1Done && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const iso = new Date().toISOString(); saveAssemblyFirstCall(assemblyId, iso); setFirstCallAt(iso); }}>
                        Registrar primer llamado realizado
                      </button>
                    )}
                  </div>
                </div>

                {/* Etapa 3: Espera 1 hora (para segunda convocatoria) */}
                <div className={`conv-timeline-step ${step3Done ? "conv-timeline-step--done" : step2Done ? "conv-timeline-step--current" : "conv-timeline-step--pending"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">Espera 1 hora (segunda convocatoria)</span>
                    {step3Done && firstCallAt && (
                      <span className="conv-timeline-time">
                        Cumplido · 1 h desde las {new Date(firstCallAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {step2Done && !step3Done && (
                      <span className="conv-timeline-muted">
                        En espera · {minutesRemaining} min restantes
                      </span>
                    )}
                    {!step2Done && <span className="conv-timeline-muted">Registre primer llamado</span>}
                  </div>
                </div>

                {/* Etapa 4: Segunda Convocatoria */}
                <div className={`conv-timeline-step ${step5Done ? "conv-timeline-step--done" : step3Done ? "conv-timeline-step--current" : "conv-timeline-step--pending"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">{step4Label}</span>
                    <span className="conv-timeline-muted">Hora pactada {segundaConvocatoriaHora}</span>
                  </div>
                </div>

                {/* Etapa 5: Quórum · Primera o Segunda convocatoria */}
                <div className={`conv-timeline-step ${step5Done ? "conv-timeline-step--done" : "conv-timeline-step--current"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">Quórum · Convocatoria</span>
                    {convocationApproved ? (
                      <>
                        <span className="conv-timeline-time conv-timeline-time--approved">
                          Quórum aprobado · {convocationApproved === "primera" ? "Primera convocatoria" : "Segunda convocatoria"}
                        </span>
                        <span className="conv-timeline-next-msg">
                          Avance a la siguiente etapa: Aprobar orden del día
                        </span>
                      </>
                    ) : (
                      <span className="conv-cta-buttons" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                        <button
                          type="button"
                          className="btn conv-btn-cta conv-btn-cta--primera"
                          title="Marcar primera convocatoria como aprobada (quórum alcanzado)"
                          onClick={() => openConfirm("Primera convocatoria", "Quórum alcanzado.", () => { saveConvocationApproved(assemblyId, "primera"); setConvocationApproved("primera"); }, true, "convocation_approved", "Primera convocatoria aprobada")}
                        >
                          Primera convocatoria
                        </button>
                        <button
                          type="button"
                          className="btn conv-btn-cta conv-btn-cta--segunda"
                          title="Marcar segunda convocatoria como aprobada (quórum alcanzado)"
                          onClick={() => openConfirm("Segunda convocatoria", "Quórum alcanzado.", () => { saveConvocationApproved(assemblyId, "segunda"); setConvocationApproved("segunda"); }, true, "convocation_approved", "Segunda convocatoria aprobada")}
                        >
                          Segunda convocatoria
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Etapa 6: Aprobar orden del día (después de quórum) */}
                <div className={`conv-timeline-step ${orderOfDayApproved ? "conv-timeline-step--done" : convocationApproved ? "conv-timeline-step--current" : "conv-timeline-step--pending"}`}>
                  <div className="conv-timeline-dot" aria-hidden />
                  <div className="conv-timeline-content">
                    <span className="conv-timeline-title">Aprobar orden del día</span>
                    {orderOfDayApproved ? (
                      <span className="conv-timeline-time conv-timeline-time--approved">
                        {orderOfDayApproved === "votacion_total" ? "Tipo: Votación Total" : "Por Asentimiento · Registrado en acta. Avance a votaciones."}
                      </span>
                    ) : convocationApproved ? (
                      <span className="conv-cta-buttons" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                        <span className="conv-timeline-muted" style={{ width: "100%", marginBottom: "4px" }}>Tipo:</span>
                        <button
                          type="button"
                          className="btn conv-btn-cta conv-btn-cta--primera"
                          title="Votación para aprobar orden del día (solo unidades al día)"
                          onClick={() => openConfirm("Aprobar orden del día", "Tipo: Votación Total. Se abrirá el tablero; solo votan quienes están al día.", () => { saveOrderOfDayApproved(assemblyId, "votacion_total"); setOrderOfDayApproved("votacion_total"); }, true, "order_of_day_approved", "Orden del día: Votación Total")}
                        >
                          Votación Total
                        </button>
                        <button
                          type="button"
                          className="btn conv-btn-cta conv-btn-cta--segunda"
                          title="Registrar en acta y avanzar a votaciones (sin votación)"
                          onClick={() => openConfirm("Aprobar orden del día", "Por Asentimiento. Se registrará en acta y se avanzará a la fase de votaciones.", () => { saveOrderOfDayApproved(assemblyId, "asentimiento"); setOrderOfDayApproved("asentimiento"); }, true, "order_of_day_approved", "Orden del día: Por Asentimiento")}
                        >
                          Por Asentimiento
                        </button>
                      </span>
                    ) : (
                      <span className="conv-timeline-muted">Primero registre la convocatoria (primera o segunda) arriba.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {monitorMode === "quorum" && orderOfDayApproved === "votacion_total" && (() => {
        const unitsAlDia = effectiveUnits.filter((u) => u.paymentStatus === "AL_DIA");
        const votados = unitsAlDia.filter((u) => orderOfDayVotes[u.id]);
        const si = votados.filter((u) => orderOfDayVotes[u.id] === "SI").length;
        const no = votados.filter((u) => orderOfDayVotes[u.id] === "NO").length;
        const abst = votados.filter((u) => orderOfDayVotes[u.id] === "ABSTENCION").length;
        const totalAlDia = unitsAlDia.length;
        const aprobado100 = totalAlDia > 0 && si === totalAlDia && no === 0 && abst === 0;
        return (
          <div className="tablero-card tablero-orden-dia" style={{ marginTop: "16px", borderLeftColor: "#8b5cf6" }}>
            <div className="tablero-header">
              <span className="tablero-title">Tablero: Aprobar orden del día</span>
              <span className="tablero-live" style={{ color: "#34d399" }}>Solo unidades al día pueden votar</span>
            </div>
            <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
              Residentes al día que pueden votar (desde chatbot o voto manual). Para aprobar se requiere el 100% de las unidades al día votando SI.
            </p>
            <p className="muted" style={{ margin: "0 0 12px", fontSize: "13px" }}>
              {votados.length} de {totalAlDia} unidades al día han votado. SI: {si} · NO: {no} · Abst: {abst}
              {aprobado100 && (
                <span className="conv-timeline-time conv-timeline-time--approved" style={{ marginLeft: "12px" }}>
                  Aprobado (100%)
                </span>
              )}
            </p>
            <div className="units-grid zoom-normal" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
              {unitsAlDia.map((u) => (
                <div
                  key={u.id}
                  className="unit-cell"
                  style={{
                    backgroundColor: orderOfDayVotes[u.id] === "SI" ? "#10b981" : orderOfDayVotes[u.id] === "NO" ? "#ef4444" : orderOfDayVotes[u.id] === "ABSTENCION" ? "#94a3b8" : "#334155",
                    color: "#fff",
                    padding: "6px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  title={`${u.code} · ${orderOfDayVotes[u.id] ?? "Sin voto"} (voto desde chatbot o clic para voto manual)`}
                  onClick={async () => {
                    const next = !orderOfDayVotes[u.id] ? "SI" : orderOfDayVotes[u.id] === "SI" ? "NO" : orderOfDayVotes[u.id] === "NO" ? "ABSTENCION" : null;
                    const nextVotes = next ? { ...orderOfDayVotes, [u.id]: next } : (() => { const o = { ...orderOfDayVotes }; delete o[u.id]; return o; })();
                    setOrderOfDayVotes(nextVotes);
                    saveOrderOfDayVotes(assemblyId, nextVotes);
                    try {
                        await fetch("/api/monitor/order-of-day-vote", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ assemblyId, unitCode: u.code, value: next ?? null }),
                        });
                      } catch {
                        // keep local state
                      }
                  }}
                >
                  {u.code} {orderOfDayVotes[u.id] ? (orderOfDayVotes[u.id] === "SI" ? "✓" : orderOfDayVotes[u.id] === "NO" ? "✗" : "—") : ""}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {monitorMode === "votacion" && assembly && assembly.status !== "Completada" && (
        <div className="monitor-acciones-asamblea">
          <h3 style={{ margin: "0 0 10px", fontSize: "15px" }}>Voto por tema y chatbot</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {votingTopics.map((t) => (
              <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span className="muted" style={{ fontSize: "13px" }}>{t.title}:</span>
                {t.votingOpen ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTopicVotingOpen(t.id, false)}>
                    Cerrar votación
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setTopicVotingOpen(t.id, true)}>
                    Habilitar voto
                  </button>
                )}
              </span>
            ))}
            <button type="button" className="btn btn-ghost" style={{ marginLeft: "8px", color: "var(--color-error, #ef4444)" }} onClick={() => setFinalizeConfirm(true)}>
              Finalizar asamblea
            </button>
          </div>
          <p className="muted" style={{ margin: "8px 0 0", fontSize: "12px" }}>Al habilitar o cerrar la votación por tema se sincroniza con el chatbot de residentes.</p>
        </div>
      )}

      {monitorMode === "votacion" && assembly?.status === "Completada" && (
        <div className="monitor-banner-finalizada" style={{ padding: "12px 16px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.35)", borderRadius: "12px", marginBottom: "16px" }}>
          <strong>Asamblea finalizada.</strong> La votación por tema está cerrada para residentes.
        </div>
      )}

      {finalizeConfirm && (
        <div className="monitor-vote-modal-overlay" onClick={() => setFinalizeConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="finalize-title">
          <div className="monitor-vote-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="finalize-title">Finalizar asamblea</h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
              Se cerrará la asamblea y todas las votaciones por tema. Los residentes no podrán votar desde el chatbot. ¿Continuar?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setFinalizeConfirm(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleFinalizeAssembly}>Finalizar asamblea</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="monitor-confirm-overlay" onClick={closeConfirm} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="monitor-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-modal-title" className="monitor-confirm-title">{confirmModal.title}</h3>
            <p className="monitor-confirm-message">{confirmModal.message}</p>
            {confirmModal.notifyChatbot && (
              <p className="monitor-confirm-notify">
                Se notificará a los residentes activos en el chatbot.
              </p>
            )}
            <div className="monitor-confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={closeConfirm}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {showGuiaVotacion && (
        <div className="monitor-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="guia-votacion-title" onClick={() => setShowGuiaVotacion(false)}>
          <div className="monitor-confirm-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <h3 id="guia-votacion-title" className="monitor-confirm-title">Guía de votación</h3>
            <p className="muted" style={{ marginBottom: "16px", fontSize: "13px" }}>Explicación de colores y símbolos del tablero.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px", textAlign: "left" }}>
              <div>
                <strong style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Colores de las casillas</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.7 }}>
                  <li><span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "4px", background: "#10b981", verticalAlign: "middle", marginRight: "8px" }} /> <strong>Verde</strong> — Presente + Votó (SI, NO o Abstención)</li>
                  <li><span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "4px", background: "#eab308", verticalAlign: "middle", marginRight: "8px" }} /> <strong>Amarillo</strong> — Presente + No votó aún</li>
                  <li><span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "4px", background: "#94a3b8", verticalAlign: "middle", marginRight: "8px" }} /> <strong>Gris</strong> — Ausente</li>
                  <li><span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "4px", background: "#b45309", verticalAlign: "middle", marginRight: "8px" }} /> <strong>Ámbar</strong> — En mora (solo asistencia, Ley 284)</li>
                </ul>
              </div>
              <div>
                <strong style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Símbolos de voto</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.7 }}>
                  <li><span className="legend-icon-wrap legend-icon-si" style={{ marginRight: "8px" }}><IconCheck /></span> <strong>✓</strong> — Votó SI</li>
                  <li><span className="legend-icon-wrap legend-icon-no" style={{ marginRight: "8px" }}><IconCross /></span> <strong>✗</strong> — Votó NO</li>
                  <li><span className="legend-icon-wrap legend-icon-abst" style={{ marginRight: "8px" }}><IconCircle /></span> <strong>○</strong> — Abstención</li>
                  <li><span className="legend-icon-wrap legend-icon-manual" style={{ marginRight: "8px" }}><IconManual /></span> <strong>Mano</strong> — Voto registrado manualmente por el administrador</li>
                  <li><span className="legend-icon-wrap legend-icon-faceid" style={{ marginRight: "8px" }}><IconLock /></span> <strong>Candado</strong> — Face ID activo o unidad en mora</li>
                </ul>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", padding: "10px 12px", background: "rgba(99, 102, 241, 0.12)", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
                💡 <strong>Voto manual:</strong> haga clic en cualquier casilla del tablero para abrir el cuadro de voto manual (SI / NO / Abstención) y registrar o modificar el voto de esa unidad.
              </p>
            </div>
            <div className="monitor-confirm-actions">
              <button type="button" className="btn btn-primary" onClick={() => setShowGuiaVotacion(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {monitorMode === "quorum" ? (
        <div className="units-grid-container" id="tablero-quorum-vista">
          <div className="legend legend-modern">
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#10b981" }} />
              <span>Presente</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#e2e8f0" }} />
              <span>No presente</span>
            </div>
          </div>
          <div className={`units-grid zoom-${zoomLevel} units-grid-quorum`} style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}>
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="unit-cell"
                style={{ backgroundColor: getBackgroundColorQuorum(unit, abandonedUnitCodes), color: unit.isPresent && !abandonedUnitCodes.has(unit.code) ? "#fff" : "#475569" }}
                title={abandonedUnitCodes.has(unit.code) ? `${unit.code} · Abandonó la sala` : `${unit.code} · ${unit.isPresent ? "Presente" : "No presente"}`}
              >
                <div className="unit-code">{unit.code}</div>
              </div>
            ))}
          </div>
          <div className="grid-stats monitor-grid-stats">
            <div className="stat">Total: <strong>{filteredUnits.length}</strong></div>
            <div className="stat">Presentes: <strong>{filteredUnits.filter((u) => u.isPresent && !abandonedUnitCodes.has(u.code)).length}</strong></div>
            <div className="stat">No presentes: <strong>{filteredUnits.filter((u) => !u.isPresent || abandonedUnitCodes.has(u.code)).length}</strong></div>
          </div>
        </div>
      ) : viewMode === "summary" ? (
        <div className="summary-grid">
          {(summary || displayStats) ? (
            <>
              {[
                { label: "Total unidades", value: (displayStats ?? summary!.stats).total, icon: "🏢" },
                { label: "Presentes", value: (displayStats ?? summary!.stats).present, icon: "✅" },
                { label: "Votaron", value: (displayStats ?? summary!.stats).voted, icon: "🗳️" },
                { label: "En mora", value: (displayStats ?? summary!.stats).mora, icon: "⚠️" },
                { label: "Face ID activo", value: (displayStats ?? summary!.stats).faceId, icon: "🔒" },
              ].map((item) => (
                <div key={item.label} className="summary-card">
                  <div className="summary-icon">{item.icon}</div>
                  <div className="summary-value">{item.value}</div>
                  <div className="summary-label">{item.label}</div>
                </div>
              ))}
              <div className="summary-detail-row">
                <div className="summary-detail-title">Resumen por estado y voto</div>
                <div className="summary-detail-grid">
                  <div className="summary-detail-card" style={{ borderLeftColor: "#10b981" }}><span className="summary-detail-label">Presente + Votó</span><strong>{detailCounts.presenteYVoto}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#eab308" }}><span className="summary-detail-label">Presente + No votó</span><strong>{detailCounts.presenteNoVoto}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#94a3b8" }}><span className="summary-detail-label">Ausente</span><strong>{detailCounts.ausente}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#b45309" }}><span className="summary-detail-label">En mora</span><strong>{detailCounts.enMora}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#10b981" }}><span className="summary-detail-label">Votó SI</span><strong>{detailCounts.votaronSi}</strong></div>
                  <div className="summary-detail-card summary-detail-card--voto-no" style={{ borderLeftColor: "#ef4444" }}><span className="summary-detail-label">Votó NO</span><strong>{detailCounts.votaronNo}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#94a3b8" }}><span className="summary-detail-label">Abstención</span><strong>{detailCounts.abstencion}</strong></div>
                  <div className="summary-detail-card" style={{ borderLeftColor: "#8b5cf6" }}><span className="summary-detail-label">Voto manual</span><strong>{detailCounts.votoManual}</strong></div>
                </div>
              </div>
              {(displayStats ? displayStats.voted : summary.votation.votesCount) > 0 ? (
              <div className="summary-card large">
                <div className="summary-title">{summary.votation.topic}</div>
                <div className="summary-bars">
                  {[
                    { value: summary.votation.results.si, color: "#10b981" },
                    { value: summary.votation.results.no, color: "#ef4444" },
                    { value: summary.votation.results.abst, color: "#94a3b8" },
                  ].map((bar, i) => (
                    <div key={i} className="vote-bar">
                      <div className="vote-bar-label">
                        {bar.value}%
                      </div>
                      <div className="vote-bar-track">
                        <span style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "12px" }}>
                  % sobre {summary.votation.votesCount} votos emitidos
                </p>
              </div>
            ) : null}
            </>
          ) : (
            <div className="summary-card large">Cargando métricas...</div>
          )}
        </div>
      ) : (
        <div className="units-grid-container">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div className="legend legend-modern" style={{ flex: "1 1 auto" }}>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "#10b981" }} />
                <span>Presente + Votó</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "#eab308" }} />
                <span>Presente + No votó</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "#94a3b8" }} />
                <span>Ausente</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "#b45309" }} />
                <span>En mora (solo asistencia)</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon-wrap legend-icon-faceid"><IconLock /></span>
                <span>Candado (Face ID activo / En mora)</span>
              </div>
              <div className="legend-item legend-item--vote">
                <span className="legend-icon-wrap legend-icon-si"><IconCheck /></span>
                <span>Votó SI</span>
              </div>
              <div className="legend-item legend-item--vote">
                <span className="legend-icon-wrap legend-icon-no"><IconCross /></span>
                <span>Votó NO</span>
              </div>
              <div className="legend-item legend-item--vote">
                <span className="legend-icon-wrap legend-icon-abst"><IconCircle /></span>
                <span>Abstención</span>
              </div>
              <div className="legend-item legend-item--vote">
                <span className="legend-icon-wrap legend-icon-manual"><IconManual /></span>
                <span>Voto manual</span>
              </div>
              <p className="legend-note" style={{ gridColumn: "1 / -1", margin: "8px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                Verde = Presente + Votó SI o Abstención. Roja = Votó NO. Los iconos ✓, X, ○ y mano en verdes o rojas.
              </p>
              <div className="legend-cta" style={{ gridColumn: "1 / -1" }}>
                <span className="legend-cta-icon" aria-hidden>👆</span>
                <span>Clic en cualquier casilla para abrir voto manual</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowGuiaVotacion(true)}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "8px 14px" }}
              title="Ver explicación de colores y símbolos"
            >
              <span style={{ fontSize: "16px" }}>📋</span>
              Guía de votación
            </button>
          </div>

          {filteredUnits.length === 0 ? (
            <div className="monitor-empty-units" style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
              No hay unidades en el tablero. En modo demo, agregue residentes en <strong>Propietarios/Residentes</strong> o use &quot;Restablecer listado demo&quot; para cargar las 50 unidades.
            </div>
          ) : (
          <>
          <div className={`units-grid zoom-${zoomLevel}`} style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}>
            {filteredUnits.map((unit) => {
              const isPending = unit.isPresent && !unit.voteValue && unit.paymentStatus !== "MORA";
              return (
                <button
                  key={unit.id}
                  type="button"
                  className={`unit-cell unit-cell-clickable ${getUnitCellStatusClass(unit)} ${isPending ? "pending-vote" : ""}`}
                  style={{
                    border: `3px solid ${getBorderColor(unit)}`,
                    color: "#fff",
                  }}
                  title={`Unidad ${unit.code} · ${unit.owner}${unit.paymentStatus === "MORA" ? " · En mora (solo asistencia)" : ""}. Clic para voto manual.`}
                  onClick={() => openVoteModal(unit)}
                >
                  <div className="unit-code">{unit.code}</div>
                  <div className="unit-icons">
                    {getVoteIcon(unit)}
                    {getMethodIcon(unit)}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="grid-stats monitor-grid-stats">
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
          <div className="monitor-detail-counts">
            <div className="monitor-detail-counts-title">Resumen por estado y voto (coincide con el grid)</div>
            <div className="monitor-detail-counts-grid">
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#10b981" }}><span className="monitor-detail-stat-label">Presente + Votó</span><strong>{detailCountsFiltered.presenteYVoto}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#eab308" }}><span className="monitor-detail-stat-label">Presente + No votó</span><strong>{detailCountsFiltered.presenteNoVoto}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#94a3b8" }}><span className="monitor-detail-stat-label">Ausente</span><strong>{detailCountsFiltered.ausente}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#b45309" }}><span className="monitor-detail-stat-label">En mora</span><strong>{detailCountsFiltered.enMora}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#10b981" }}><span className="monitor-detail-stat-label">Votó SI</span><strong>{detailCountsFiltered.votaronSi}</strong></div>
              <div className="monitor-detail-stat monitor-detail-stat--voto-no" style={{ borderLeftColor: "#ef4444" }}><span className="monitor-detail-stat-label">Votó NO</span><strong>{detailCountsFiltered.votaronNo}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#94a3b8" }}><span className="monitor-detail-stat-label">Abstención</span><strong>{detailCountsFiltered.abstencion}</strong></div>
              <div className="monitor-detail-stat" style={{ borderLeftColor: "#8b5cf6" }}><span className="monitor-detail-stat-label">Voto manual</span><strong>{detailCountsFiltered.votoManual}</strong></div>
            </div>
          </div>
          </>
          )}
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
        .monitor-tableros {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .tablero-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 14px;
          padding: 16px;
        }
        .tablero-quorum-result { border-left: 4px solid #0ea5e9; }
        .tablero-quorum-estado { margin-top: 10px; }
        .tablero-quorum-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .tablero-quorum-badge.achieved {
          background: rgba(16, 185, 129, 0.25);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .tablero-quorum-badge.not-achieved {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .tablero-quorum-badge.quorum-lost {
          background: rgba(239, 68, 68, 0.25);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
        .monitor-badge-asistencia-activa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 6px 12px;
          border-radius: 8px;
        }
        .monitor-badge-asistencia-tardios {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.3);
          padding: 6px 12px;
          border-radius: 8px;
        }
        .conv-btn-cta {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .conv-btn-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .conv-btn-cta--primera {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
        .conv-btn-cta--primera:hover {
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
        }
        .conv-btn-cta--segunda {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }
        .conv-btn-cta--segunda:hover {
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.5);
        }
        .tablero-asistencia { border-left: 4px solid #10b981; }
        .tablero-convocatorias { border-left: 4px solid #6366f1; }
        .conv-timeline {
          position: relative;
          margin-top: 12px;
          padding-left: 20px;
          border-left: 2px solid rgba(148, 163, 184, 0.35);
        }
        .conv-timeline-step {
          position: relative;
          padding-bottom: 16px;
        }
        .conv-timeline-step:last-child { padding-bottom: 0; }
        .conv-timeline-dot {
          position: absolute;
          left: -26px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #475569;
          border: 2px solid #334155;
        }
        .conv-timeline-step--done .conv-timeline-dot {
          background: #10b981;
          border-color: #059669;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }
        .conv-timeline-step--current .conv-timeline-dot {
          background: #6366f1;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
        }
        .conv-timeline-step--pending .conv-timeline-dot {
          background: #334155;
          border-color: #475569;
        }
        .conv-timeline-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .conv-timeline-title {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .conv-timeline-step--pending .conv-timeline-title { color: #64748b; }
        .conv-timeline-time {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          color: #34d399;
        }
        .conv-timeline-time--approved {
          font-size: 15px;
          font-weight: 700;
          color: #34d399;
          letter-spacing: 0.02em;
          margin-top: 4px;
          display: inline-block;
        }
        .conv-timeline-next-msg {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: #a5b4fc;
          font-weight: 500;
        }
        .conv-timeline-muted {
          font-size: 12px;
          color: #94a3b8;
        }
        .tablero-convocatorias .btn-sm { margin-top: 4px; }
        .tablero-convocatorias-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }
        .tablero-conv-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 13px;
        }
        .tablero-conv-label {
          color: #94a3b8;
          min-width: 140px;
        }
        .tablero-conv-value {
          font-weight: 600;
          color: #e2e8f0;
          font-variant-numeric: tabular-nums;
        }
        .tablero-conv-done .tablero-conv-value { color: #34d399; }
        .tablero-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .tablero-title {
          font-weight: 600;
          font-size: 15px;
          color: #f1f5f9;
        }
        .tablero-live {
          font-size: 11px;
          font-weight: 600;
          color: #34d399;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tablero-clock {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 12px;
          font-variant-numeric: tabular-nums;
        }
        .tablero-quorum-stats { margin-top: 4px; }
        .tablero-quorum-value {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
          line-height: 1.2;
        }
        .tablero-quorum-label {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }
        .tablero-quorum-detail {
          font-size: 13px;
          color: #cbd5e1;
          margin-top: 4px;
        }
        .tablero-quorum-help {
          font-size: 11px;
          color: #64748b;
          margin: 10px 0 0;
          line-height: 1.35;
        }
        .tablero-primer-text {
          font-size: 12px;
          color: #94a3b8;
          margin: 8px 0 0;
          line-height: 1.4;
        }
        .monitor-acciones-asamblea {
          padding: 14px 18px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 12px;
          margin-bottom: 20px;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
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
          align-items: center;
          gap: 8px;
        }
        .zoom-controls-label {
          font-size: 12px;
          color: #94a3b8;
          margin-right: 4px;
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
        .zoom-controls button.active {
          background: rgba(99, 102, 241, 0.35);
          border-color: rgba(99, 102, 241, 0.6);
          color: #c7d2fe;
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
        .legend-modern .legend-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }
        .legend-modern .legend-icon-wrap svg {
          width: 100%;
          height: 100%;
        }
        .legend-modern .legend-item--vote .legend-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          padding: 4px;
          box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.4);
        }
        /* Tema oscuro: resaltar tono de los símbolos para buena visibilidad */
        .legend-item--vote .legend-icon-wrap.legend-icon-si { color: #10b981; }
        .legend-item--vote .legend-icon-wrap.legend-icon-no { color: #ef4444; }
        .legend-item--vote .legend-icon-wrap.legend-icon-abst {
          color: #334155;
          background: #f1f5f9 !important;
          box-shadow: 0 0 0 1px #94a3b8;
        }
        .legend-item--vote .legend-icon-wrap.legend-icon-manual { color: #818cf8; }
        .legend-icon-wrap.legend-icon-manual { color: #818cf8; }
        .legend-icon-wrap.legend-icon-faceid { color: #94a3b8; }
        .legend-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding: 10px 16px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.5);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #c7d2fe;
        }
        .legend-cta-icon {
          font-size: 18px;
        }
        .unit-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .unit-icon.unit-icon-si { color: #6ee7b7; }
        .unit-icon.unit-icon-no { color: #fca5a5; }
        .unit-icon.unit-icon-abst { color: #cbd5e1; }
        .unit-icon.unit-icon-manual { color: #a5b4fc; }
        .unit-icon.unit-icon-faceid { color: rgba(255,255,255,0.85); }
        /* Casilla con fondo oscuro: iconos visibles en tema oscuro */
        .unit-cell--presente-voto .unit-icon.unit-icon-si,
        .unit-cell--presente-voto .unit-icon.unit-icon-no,
        .unit-cell--presente-voto .unit-icon.unit-icon-abst {
          border-radius: 50%;
          padding: 3px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        .unit-cell--presente-voto .unit-icon.unit-icon-si { color: #34d399; }
        .unit-cell--presente-voto .unit-icon.unit-icon-no { color: #f87171; }
        .unit-cell--presente-voto .unit-icon.unit-icon-abst { color: #94a3b8; }
        .unit-cell--voto-no .unit-icon.unit-icon-si,
        .unit-cell--voto-no .unit-icon.unit-icon-no,
        .unit-cell--voto-no .unit-icon.unit-icon-abst {
          border-radius: 50%;
          padding: 3px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        .unit-cell--voto-no .unit-icon.unit-icon-no { color: #f87171; }
        .unit-cell--presente-no-voto .unit-icon { color: #fde047; }
        .unit-cell--ausente .unit-icon { color: #94a3b8; }
        .unit-cell--mora .unit-icon { color: #fdba74; }
        .units-grid {
          display: grid;
          gap: 6px;
        }
        .unit-cell {
          border-radius: 8px;
          min-height: 36px;
          font-size: 10px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-weight: 700;
          position: relative;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .unit-cell .unit-code {
          color: #fff;
          text-shadow: 0 0 1px rgba(0,0,0,0.3);
        }
        .unit-cell--presente-voto { background-color: rgba(16, 185, 129, 0.14); }
        .unit-cell--voto-no { background-color: rgba(239, 68, 68, 0.1); }
        .unit-cell--presente-no-voto { background-color: rgba(234, 179, 8, 0.16); }
        .unit-cell--ausente { background-color: rgba(148, 163, 184, 0.14); }
        .unit-cell--mora { background-color: rgba(180, 83, 9, 0.18); }
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
        .monitor-detail-counts {
          margin-top: 16px;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.15);
        }
        .monitor-detail-counts-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
        }
        .monitor-detail-counts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .monitor-detail-stat {
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
        .monitor-detail-stat strong {
          font-size: 18px;
          color: #f1f5f9;
        }
        .monitor-detail-stat-label {
          font-size: 11px;
          color: #94a3b8;
        }
        .summary-detail-row {
          grid-column: 1 / -1;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.15);
        }
        .summary-detail-title {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
        }
        .summary-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }
        .summary-detail-card {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          background: rgba(30, 41, 59, 0.6);
          border-radius: 10px;
          border-left: 3px solid #64748b;
          font-size: 13px;
          color: #e2e8f0;
        }
        .summary-detail-card strong {
          font-size: 18px;
          color: #f1f5f9;
        }
        .summary-detail-label {
          font-size: 11px;
          color: #94a3b8;
        }
        .summary-detail-card--voto-no,
        .monitor-detail-stat--voto-no {
          background: rgba(239, 68, 68, 0.18);
          border-left-width: 4px;
          border-left-color: #ef4444;
        }
        .unit-cell-clickable {
          cursor: pointer;
          border: none;
          font: inherit;
        }
        .unit-cell-clickable:hover {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
          transform: scale(1.02);
        }
        .monitor-vote-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .monitor-vote-modal {
          background: #1e293b;
          color: #f1f5f9;
          border-radius: 16px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.3);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
        .monitor-vote-modal h3 {
          margin: 0 0 8px;
        }
        .monitor-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .monitor-confirm-modal {
          background: #1e293b;
          color: #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .monitor-confirm-title {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
        }
        .monitor-confirm-message {
          margin: 0 0 8px;
          font-size: 14px;
          color: #e2e8f0;
          line-height: 1.45;
        }
        .monitor-confirm-notify {
          margin: 0 0 20px;
          font-size: 13px;
          color: #34d399;
          font-weight: 500;
        }
        .monitor-confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        /* Tema claro: misma secuencia en todos los módulos (fondo claro + texto oscuro), sin afectar tema oscuro */
        html[data-theme="light"] .monitor-container .tablero-card {
          background: #ffffff !important;
          border-color: #e2e8f0 !important;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }
        html[data-theme="light"] .monitor-container .tablero-title {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .tablero-quorum-label,
        html[data-theme="light"] .monitor-container .tablero-quorum-detail,
        html[data-theme="light"] .monitor-container .tablero-quorum-help,
        html[data-theme="light"] .monitor-container .tablero-primer-text {
          color: #334155 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-quorum-value {
          color: #047857 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-clock {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-title {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-step--pending .conv-timeline-title {
          color: #475569 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-muted {
          color: #475569 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-time,
        html[data-theme="light"] .monitor-container .conv-timeline-time--approved {
          color: #047857 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-next-msg {
          color: #4338ca !important;
        }
        html[data-theme="light"] .monitor-container .tablero-conv-label {
          color: #475569 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-conv-value {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .tablero-conv-done .tablero-conv-value {
          color: #047857 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-live {
          color: #047857 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-quorum-badge.achieved {
          color: #047857 !important;
          border-color: rgba(16, 185, 129, 0.5);
        }
        html[data-theme="light"] .monitor-container .tablero-quorum-badge.not-achieved {
          color: #b45309 !important;
        }
        html[data-theme="light"] .monitor-container .tablero-quorum-badge.quorum-lost {
          color: #b91c1c !important;
        }
        html[data-theme="light"] .monitor-container .tablero-card .btn-ghost {
          color: #1e293b !important;
        }
        html[data-theme="light"] .monitor-container .tablero-card .btn-ghost:hover {
          color: #0f172a !important;
          background: rgba(0, 0, 0, 0.06);
        }
        html[data-theme="light"] .monitor-container .tablero-card .muted {
          color: #475569 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-dot {
          border-color: #94a3b8 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-step--pending .conv-timeline-dot {
          background: #cbd5e1 !important;
          border-color: #94a3b8 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-step--done .conv-timeline-dot {
          background: #10b981 !important;
          border-color: #059669 !important;
        }
        html[data-theme="light"] .monitor-container .conv-timeline-step--current .conv-timeline-dot {
          background: #6366f1 !important;
          border-color: #4f46e5 !important;
        }
        html[data-theme="light"] .monitor-container .monitor-acciones-asamblea,
        html[data-theme="light"] .monitor-container .monitor-acciones-asamblea h3 {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .monitor-acciones-asamblea {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }
        /* Tema claro: casillas del grid con número e iconos en negro para misma secuencia */
        html[data-theme="light"] .monitor-container .unit-cell,
        html[data-theme="light"] .monitor-container .unit-cell .unit-code {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .unit-cell .unit-icon.unit-icon-si { color: #047857 !important; }
        html[data-theme="light"] .monitor-container .unit-cell .unit-icon.unit-icon-no { color: #b91c1c !important; }
        html[data-theme="light"] .monitor-container .unit-cell .unit-icon.unit-icon-abst { color: #475569 !important; }
        html[data-theme="light"] .monitor-container .unit-cell .unit-icon.unit-icon-manual { color: #4338ca !important; }
        html[data-theme="light"] .monitor-container .unit-cell .unit-icon.unit-icon-faceid { color: #475569 !important; }
        html[data-theme="light"] .monitor-container .monitor-banner-finalizada {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .monitor-banner-finalizada strong {
          color: #0f172a !important;
        }
        html[data-theme="light"] .monitor-container .legend-item--vote .legend-icon-wrap.legend-icon-abst {
          background: #ffffff !important;
          box-shadow: 0 0 0 1px #e2e8f0;
          color: #475569 !important;
        }
      `}</style>

      {voteModalUnit && (() => {
        const originalUnit = units.find((u) => u.id === voteModalUnit.id);
        const isMora = voteModalUnit.paymentStatus === "MORA";
        const hasAlDiaOverride = manualOverrides[voteModalUnit.id]?.paymentStatusOverride === "AL_DIA";
        const showRevertMora = originalUnit?.paymentStatus === "MORA" && hasAlDiaOverride;
        return (
          <div className="monitor-vote-modal-overlay" onClick={() => setVoteModalUnit(null)} role="dialog" aria-modal="true" aria-labelledby="vote-modal-title">
            <div className="monitor-vote-modal" onClick={(e) => e.stopPropagation()}>
              <h3 id="vote-modal-title" style={{ fontSize: "1.25rem", marginBottom: "4px" }}>
                {isMora ? "Unidad en mora" : (manualOverrides[voteModalUnit.id]?.voteValue || originalUnit?.voteValue) ? "Modificar voto" : "Voto manual"}
              </h3>
              <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px", paddingBottom: "12px", borderBottom: "1px solid rgba(148, 163, 184, 0.2)" }}>
                Unidad {voteModalUnit.code} · {voteModalUnit.owner}
              </p>
              {isMora ? (
                <>
                  <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(180, 83, 9, 0.2)", border: "1px solid rgba(180, 83, 9, 0.5)", borderRadius: "12px", fontSize: "13px" }}>
                    <strong style={{ color: "#f59e0b" }}>Advertencia:</strong> Esta unidad está en mora. <strong>No se puede registrar voto</strong> hasta marcarla como &quot;Al día&quot; (abajo). Las unidades en mora solo tienen asistencia, no voto (Ley 284).
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#cbd5e1" }}>
                    Si el residente regularizó a última hora y validó que está al día, marque la unidad como &quot;Al día&quot; para permitir el voto desde este tablero.
                  </p>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Escriba &quot;Permitir&quot; para confirmar</label>
                    <input
                      type="text"
                      value={moraConfirmText}
                      onChange={(e) => setMoraConfirmText(e.target.value)}
                      placeholder='Escriba Permitir'
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(148, 163, 184, 0.3)", fontSize: "14px", background: "rgba(15, 23, 42, 0.6)", color: "#e2e8f0" }}
                      aria-label="Confirmar escribiendo Permitir"
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Comentario / motivo del cambio</label>
                    <textarea
                      value={moraComment}
                      onChange={(e) => setMoraComment(e.target.value)}
                      placeholder="Indique el motivo por el que se permite el voto (ej. residente regularizó a última hora)"
                      rows={3}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(148, 163, 184, 0.3)", fontSize: "14px", background: "rgba(15, 23, 42, 0.6)", color: "#e2e8f0" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setVoteModalUnit(null)}>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={moraConfirmText.trim().toLowerCase() !== "permitir" || !moraComment.trim()}
                      onClick={() => setAlDiaOverride(voteModalUnit.id, moraComment.trim())}
                    >
                      Marcar como al día (permitir voto)
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {(manualOverrides[voteModalUnit.id]?.voteValue || originalUnit?.voteValue) && (
                    <p className="muted" style={{ margin: "0 0 14px", fontSize: "13px", padding: "10px 12px", background: "rgba(148, 163, 184, 0.15)", borderRadius: "10px" }}>
                      <strong>Voto actual:</strong> {manualOverrides[voteModalUnit.id]?.voteValue ?? originalUnit?.voteValue ?? "—"}
                    </p>
                  )}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>Nuevo voto</label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {(["SI", "NO", "ABSTENCION"] as const).map((v) => {
                        const isChecked = voteModalValue === v;
                        const chipBorder = v === "SI" ? "#10b981" : v === "NO" ? "#ef4444" : "#94a3b8";
                        const chipBgSoft = v === "SI" ? "rgba(16, 185, 129, 0.12)" : v === "NO" ? "rgba(239, 68, 68, 0.1)" : "rgba(148, 163, 184, 0.15)";
                        return (
                          <label
                            key={v}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              cursor: "pointer",
                              padding: "10px 16px",
                              borderRadius: "12px",
                              background: isChecked ? chipBgSoft : "rgba(30, 41, 59, 0.5)",
                              border: `2px solid ${isChecked ? chipBorder : "rgba(148, 163, 184, 0.35)"}`,
                              color: isChecked ? (v === "SI" ? "#047857" : v === "NO" ? "#b91c1c" : "#475569") : "#e2e8f0",
                              fontWeight: 600,
                              fontSize: "14px",
                            }}
                          >
                            <input type="radio" name="vote" checked={isChecked} onChange={() => setVoteModalValue(v)} style={{ accentColor: chipBorder }} />
                            {v === "ABSTENCION" ? "Abstención" : v}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                      Comentario {(voteModalUnit.voteValue || manualOverrides[voteModalUnit.id]?.voteValue) ? "(obligatorio al modificar)" : "(opcional)"}
                    </label>
                    <textarea
                      value={voteModalComment}
                      onChange={(e) => setVoteModalComment(e.target.value)}
                      placeholder="Motivo del voto manual o del cambio de voto..."
                      rows={3}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(148, 163, 184, 0.3)", fontSize: "14px", background: "rgba(15, 23, 42, 0.6)", color: "#e2e8f0" }}
                    />
                  </div>
                  {showRevertMora && (
                    <p style={{ margin: "0 0 12px", fontSize: "12px" }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: "4px 0", fontSize: "12px", color: "#94a3b8" }} onClick={() => revertMoraOverride(voteModalUnit.id)}>
                        Revertir a en mora
                      </button>
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setVoteModalUnit(null)}>
                      Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={saveVoteModal}>
                      Guardar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
