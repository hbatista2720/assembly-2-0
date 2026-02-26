"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getDemoResidents,
  DEMO_RESIDENTS_STORAGE_KEY,
  updateDemoResidentFaceId,
  updateDemoResident,
  setDemoResidentHabilitadoParaAsamblea,
  updateDemoResidentByEmail,
  setDemoResidentHabilitadoParaAsambleaByEmail,
  updateDemoResidentFaceIdByEmail,
  ensureDemoResident,
  exportDemoResidentsCsv,
  getImportTemplateCsv,
  importDemoResidentsFromCsv,
  getResidentsByUnit,
  updateUnitTemplate,
  isDemoResidentsContext,
  getDemoResidentSessionHistoryByEmail,
  type SessionLogEntry,
  DEMO_RESIDENTS_LIMIT,
  DEMO_PH_NAME,
} from "../../../../lib/demoResidentsStore";
import useUpgradeBanner from "../../../../hooks/useUpgradeBanner";

type Resident = {
  user_id: string;
  email: string;
  nombre?: string;
  numero_finca?: string;
  cedula_identidad?: string;
  face_id_enabled: boolean;
  unit?: string;
  cuota_pct?: number;
  payment_status?: "al_dia" | "mora";
  chatbot_registered?: boolean;
  chatbot_login_status?: "never" | "registered" | "logged_in";
  chatbot_session_active?: boolean;
  last_activity_at?: string;
  assembly_activity?: string;
  titular_orden?: 1 | 2;
  habilitado_para_asamblea?: boolean;
  /** Ocupada | Alquilada | Sin inquilino */
  estatus_unidad?: "Ocupada" | "Alquilada" | "Sin inquilino";
};

const DEFAULT_RESIDENT_LIMIT = 250;
/** UUID de la organización demo (usado en pestaña Poderes para cargar config y solicitudes desde BD). */
const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

type PowerRequestItem = {
  id: string;
  resident_email: string;
  apoderado_tipo: string;
  apoderado_email: string;
  apoderado_nombre: string;
  apoderado_cedula?: string;
  apoderado_telefono?: string;
  vigencia?: string;
  status: string;
  created_at: string;
};

/** 5 solicitudes de poder demo para simular recepción de datos y aprobar/rechazar. */
const DEMO_POWER_REQUESTS: PowerRequestItem[] = [
  { id: "demo-power-1", resident_email: "residente5@demo.assembly2.com", apoderado_tipo: "titular_mayor_edad", apoderado_email: "maria.garcia@email.com", apoderado_nombre: "María García López", apoderado_cedula: "1.234.567-8", apoderado_telefono: "+56 9 8765 4321", vigencia: "Asamblea 2026-01", status: "PENDING", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-power-2", resident_email: "residente12@demo.assembly2.com", apoderado_tipo: "residente_mismo_ph", apoderado_email: "carlos.vega@email.com", apoderado_nombre: "Carlos Vega Soto", apoderado_cedula: "9.876.543-2", apoderado_telefono: "+56 9 1234 5678", vigencia: "Una asamblea", status: "PENDING", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-power-3", resident_email: "residente8@demo.assembly2.com", apoderado_tipo: "titular_mayor_edad", apoderado_email: "ana.rodriguez@email.com", apoderado_nombre: "Ana Rodríguez", apoderado_cedula: "12.345.678-9", vigencia: "Hasta dic 2026", status: "APPROVED", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-power-4", resident_email: "residente20@demo.assembly2.com", apoderado_tipo: "residente_mismo_ph", apoderado_email: "pedro.silva@email.com", apoderado_nombre: "Pedro Silva", apoderado_telefono: "+56 9 5555 1234", status: "REJECTED", created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "demo-power-5", resident_email: "residente3@demo.assembly2.com", apoderado_tipo: "titular_mayor_edad", apoderado_email: "lucia.mendoza@email.com", apoderado_nombre: "Lucía Mendoza Fernández", apoderado_cedula: "11.222.333-4", apoderado_telefono: "+56 9 7777 8888", vigencia: "Asamblea ordinaria 2026", status: "PENDING", created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m} min ${s} s` : `${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h} h ${min} min` : `${h} h`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "medium" });
}

function SessionHistoryList({ email }: { email: string }) {
  const [history, setHistory] = useState<(SessionLogEntry & { is_current?: boolean })[]>([]);
  useEffect(() => {
    const load = () => setHistory(getDemoResidentSessionHistoryByEmail(email));
    load();
    const onChanged = () => load();
    window.addEventListener("admin-ph-residents-changed", onChanged);
    const interval = setInterval(load, 5000); // Actualizar cada 5 s si está online
    return () => {
      window.removeEventListener("admin-ph-residents-changed", onChanged);
      clearInterval(interval);
    };
  }, [email]);
  if (history.length === 0) {
    return <p className="muted" style={{ fontSize: "13px" }}>Sin historial de sesiones todavía.</p>;
  }
  const totalSeconds = history.reduce((acc, e) => acc + (e.duration_seconds ?? 0), 0);
  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "12px", fontWeight: 600 }}>
        Tiempo total en chatbot: {formatDuration(totalSeconds)}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {history.map((e, i) => {
          const isCurrent = (e as { is_current?: boolean }).is_current;
          return (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                padding: "10px 12px",
                background: isCurrent ? "rgba(74, 222, 128, 0.12)" : "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                marginBottom: "8px",
                borderLeft: isCurrent ? "3px solid #4ade80" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: "13px", flex: 1, minWidth: 0 }}>
                {formatDateTime(e.started_at)}
                {isCurrent ? (
                  <span style={{ color: "#4ade80", fontWeight: 600, marginLeft: "8px" }}>• En curso</span>
                ) : (
                  <> → {formatDateTime(e.ended_at)}</>
                )}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: "13px" }}>
                {formatDuration(e.duration_seconds)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const iconBtn = { width: 16, height: 16, flexShrink: 0 };
const IconEdit = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconTemplate = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const IconHistory = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>;

function FromWizardBanner() {
  const sp = useSearchParams();
  const from = sp.get("from");
  const assemblyId = sp.get("assemblyId");
  if (from !== "proceso-asamblea") return null;
  const href = assemblyId
    ? `/dashboard/admin-ph/proceso-asamblea?assemblyId=${assemblyId}`
    : "/dashboard/admin-ph/proceso-asamblea";
  return (
    <div
      style={{
        marginBottom: "16px",
        padding: "12px 16px",
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "14px", color: "#c7d2fe" }}>
        Paso 1 del Proceso de Asamblea. Registra residentes y vuelve al wizard cuando termines.
      </span>
      <Link href={href} className="btn btn-primary" style={{ borderRadius: "999px", fontSize: "13px", padding: "8px 16px" }}>
        ← Volver al Proceso de Asamblea
      </Link>
    </div>
  );
}

export default function OwnersPage() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [editModalResident, setEditModalResident] = useState<Resident | null>(null);
  const [editModalForm, setEditModalForm] = useState({
    email: "", nombre: "", unit: "", cuota_pct: "", numero_finca: "", cedula_identidad: "",
    payment_status: "al_dia" as "al_dia" | "mora", face_id_enabled: true, habilitado_para_asamblea: false,
    estatus_unidad: "Ocupada" as "Ocupada" | "Alquilada" | "Sin inquilino",
  });
  const [savingEditModal, setSavingEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<"all" | "al_dia" | "mora">("all");
  const [filterFaceId, setFilterFaceId] = useState<boolean | "all">("all");
  const [filterHabAsamblea, setFilterHabAsamblea] = useState<boolean | "all">("all");
  const [filterChatbot, setFilterChatbot] = useState<"all" | "online" | "inactive">("all");
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [unitModalUnit, setUnitModalUnit] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState({ titular_1_email: "", titular_2_email: "", habilitado_titular_1: true, habilitado_titular_2: false });
  const [savingUnit, setSavingUnit] = useState(false);
  const [activeTab, setActiveTab] = useState<"residents" | "powers">("residents");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApplying, setBulkApplying] = useState(false);
  const [powersEnabled, setPowersEnabled] = useState(false);
  const [powerRequests, setPowerRequests] = useState<PowerRequestItem[]>([]);
  const [loadingPowers, setLoadingPowers] = useState(false);
  const [updatingPowerId, setUpdatingPowerId] = useState<string | null>(null);
  const [savingPowersConfig, setSavingPowersConfig] = useState(false);
  const [deleteResidentPending, setDeleteResidentPending] = useState<{ userId: string; email: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [sessionHistoryResident, setSessionHistoryResident] = useState<Resident | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { limits } = useUpgradeBanner(subscriptionId);

  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    const subId = typeof window !== "undefined" ? localStorage.getItem("assembly_subscription_id") : null;
    setOrganizationId(orgId);
    setSubscriptionId(subId);
    setIsDemo(isDemoResidentsContext());
    setAuthChecked(true);
  }, []);

  const orgIdForResidents = isDemo ? DEMO_ORG_ID : organizationId;

  /** En demo, fusiona la lista de la API con el store local para que payment_status, nombre, unit, etc. se muestren y persistan al cambiar estatus. */
  const mergeResidentsWithDemoStore = (
    apiList: { user_id: string; email: string; face_id_enabled?: boolean }[]
  ): Resident[] => {
    if (orgIdForResidents !== DEMO_ORG_ID || typeof window === "undefined") {
      return apiList.map((r) => ({
        user_id: r.user_id,
        email: r.email,
        face_id_enabled: r.face_id_enabled !== false,
      }));
    }
    const storeList = getDemoResidents();
    return apiList.map((r) => {
      const stored = storeList.find(
        (s) =>
          (s.email ?? "").toLowerCase() === (r.email ?? "").toLowerCase() || s.user_id === r.user_id
      );
      return {
        user_id: r.user_id,
        email: r.email,
        face_id_enabled: stored?.face_id_enabled ?? r.face_id_enabled !== false,
        nombre: stored?.nombre,
        numero_finca: stored?.numero_finca,
        cedula_identidad: stored?.cedula_identidad,
        unit: stored?.unit,
        cuota_pct: stored?.cuota_pct,
        payment_status: stored?.payment_status ?? "al_dia",
        habilitado_para_asamblea: stored?.habilitado_para_asamblea,
        estatus_unidad: stored?.estatus_unidad,
        chatbot_registered: stored?.chatbot_registered,
        chatbot_login_status: stored?.chatbot_login_status,
        chatbot_session_active: stored?.chatbot_session_active,
      };
    });
  };

  /** En demo: lista de los 50 residentes del store para mostrar de inmediato (evita 0/50) y para limitar a 50. */
  const getDemoResidentsAsResidentList = (): Resident[] => {
    if (typeof window === "undefined") return [];
    return getDemoResidents().map((d) => ({
      user_id: d.user_id,
      email: d.email ?? "",
      face_id_enabled: d.face_id_enabled ?? true,
      nombre: d.nombre,
      numero_finca: d.numero_finca,
      cedula_identidad: d.cedula_identidad,
      unit: d.unit,
      cuota_pct: d.cuota_pct,
      payment_status: (d.payment_status ?? "al_dia") as "al_dia" | "mora",
      habilitado_para_asamblea: d.habilitado_para_asamblea,
      estatus_unidad: d.estatus_unidad,
      chatbot_registered: d.chatbot_registered,
      chatbot_login_status: d.chatbot_login_status,
      chatbot_session_active: d.chatbot_session_active,
    }));
  };

  const capDemoResidents = (merged: Resident[]): Resident[] => {
    if (orgIdForResidents !== DEMO_ORG_ID || merged.length <= DEMO_RESIDENTS_LIMIT) return merged;
    const storeOrder = getDemoResidents().map((r) => (r.email ?? "").toLowerCase());
    return [...merged]
      .sort((a, b) => {
        const ai = storeOrder.indexOf((a.email ?? "").toLowerCase());
        const bi = storeOrder.indexOf((b.email ?? "").toLowerCase());
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .slice(0, DEMO_RESIDENTS_LIMIT);
  };

  useEffect(() => {
    if (!orgIdForResidents) {
      setLoading(false);
      return;
    }
    setError("");
    const isDemoOrg = orgIdForResidents === DEMO_ORG_ID && typeof window !== "undefined";
    if (isDemoOrg) {
      setResidents(getDemoResidentsAsResidentList());
      setLoading(false);
    } else {
      setLoading(true);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(orgIdForResidents)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Error al cargar"))))
      .then(async (data) => {
        const list = Array.isArray(data?.residents) ? data.residents : [];
        const apiEmails = new Set(list.map((r: { email: string }) => (r.email || "").toLowerCase()));
        let merged = mergeResidentsWithDemoStore(
          list.map((r: { user_id: string; email: string; face_id_enabled?: boolean }) => ({
            user_id: r.user_id,
            email: r.email,
            face_id_enabled: r.face_id_enabled,
          }))
        );
        merged = capDemoResidents(merged);
        if (orgIdForResidents !== DEMO_ORG_ID || merged.length > 0) setResidents(merged);
        if (orgIdForResidents === DEMO_ORG_ID && orgIdForResidents) {
          try {
            const storeList = getDemoResidents();
            const storeEmails = [...new Set(storeList.map((r) => (r.email || "").trim().toLowerCase()).filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))];
            const toSync = storeEmails.filter((e) => !apiEmails.has(e));
            if (toSync.length > 0) {
              await Promise.all(
                toSync.map((email) =>
                  fetch("/api/admin-ph/residents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ organization_id: orgIdForResidents, email }),
                  })
                )
              );
              const res2 = await fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(orgIdForResidents)}`);
              const data2 = res2.ok ? await res2.json() : null;
              if (Array.isArray(data2?.residents)) {
                let merged2 = mergeResidentsWithDemoStore(
                  data2.residents.map((r: { user_id: string; email: string; face_id_enabled?: boolean }) => ({
                    user_id: r.user_id,
                    email: r.email,
                    face_id_enabled: r.face_id_enabled,
                  }))
                );
                merged2 = capDemoResidents(merged2);
                setResidents(merged2);
              }
            }
          } catch {
            // ignorar errores de sincronización
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("No se pudieron cargar los residentes.");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [orgIdForResidents]);

  useEffect(() => {
    if (!orgIdForResidents) return;
    const onResidentsChanged = () => {
      fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(orgIdForResidents)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          const list = Array.isArray(data?.residents) ? data.residents : [];
          let merged = mergeResidentsWithDemoStore(
            list.map((r: { user_id: string; email: string; face_id_enabled?: boolean }) => ({
              user_id: r.user_id,
              email: r.email,
              face_id_enabled: r.face_id_enabled,
            }))
          );
          merged = capDemoResidents(merged);
          setResidents(merged);
        })
        .catch(() => {});
    };
    if (typeof window !== "undefined") {
      window.addEventListener("admin-ph-residents-changed", onResidentsChanged);
      return () => window.removeEventListener("admin-ph-residents-changed", onResidentsChanged);
    }
  }, [orgIdForResidents]);

  /** En demo: sincronizar Online/Inactivo cuando cambia el store en otra pestaña (storage event + visibility + poll). */
  useEffect(() => {
    if (orgIdForResidents !== DEMO_ORG_ID || typeof window === "undefined") return;
    const refreshFromStore = () => {
      setResidents((prev) => {
        if (prev.length === 0) return prev;
        const merged = mergeResidentsWithDemoStore(
          prev.map((r) => ({ user_id: r.user_id, email: r.email, face_id_enabled: r.face_id_enabled }))
        );
        return capDemoResidents(merged);
      });
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === DEMO_RESIDENTS_STORAGE_KEY) refreshFromStore();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshFromStore();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(refreshFromStore, 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, [orgIdForResidents]);

  const orgIdForPowers = isDemo ? DEMO_ORG_ID : organizationId;
  useEffect(() => {
    if (activeTab !== "powers" || !orgIdForPowers) return;
    setLoadingPowers(true);
    Promise.all([
      fetch(`/api/admin-ph/powers-config?organization_id=${encodeURIComponent(orgIdForPowers)}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/admin-ph/power-requests?organization_id=${encodeURIComponent(orgIdForPowers)}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([config, list]) => {
        if (config?.powers_enabled !== undefined) setPowersEnabled(config.powers_enabled);
        if (isDemo) {
          setPowerRequests(DEMO_POWER_REQUESTS);
        } else if (Array.isArray(list?.requests)) {
          setPowerRequests(list.requests);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPowers(false));
  }, [activeTab, orgIdForPowers, isDemo]);

  const handleTogglePowersEnabled = () => {
    if (!orgIdForPowers || savingPowersConfig) return;
    setSavingPowersConfig(true);
    fetch("/api/admin-ph/powers-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgIdForPowers, powers_enabled: !powersEnabled }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) setPowersEnabled(data.powers_enabled);
      })
      .finally(() => setSavingPowersConfig(false));
  };

  const handlePowerRequestAction = (requestId: string, status: "APPROVED" | "REJECTED") => {
    if (!orgIdForPowers || updatingPowerId) return;
    setUpdatingPowerId(requestId);
    if (isDemo) {
      setPowerRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
      setUpdatingPowerId(null);
      return;
    }
    fetch(`/api/admin-ph/power-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgIdForPowers, status }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setPowerRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
        }
      })
      .finally(() => setUpdatingPowerId(null));
  };

  const refetchResidents = () => {
    if (!orgIdForResidents) return;
    fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(orgIdForResidents)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Error al cargar"))))
      .then((data) => {
        const list = Array.isArray(data?.residents) ? data.residents : [];
        let merged = mergeResidentsWithDemoStore(
          list.map((r: { user_id: string; email: string; face_id_enabled?: boolean }) => ({
            user_id: r.user_id,
            email: r.email,
            face_id_enabled: r.face_id_enabled,
          }))
        );
        merged = capDemoResidents(merged);
        setResidents(merged);
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
      })
      .catch(() => {});
  };

  const refreshDemoResidents = () => {
    if (!isDemo) return;
    refetchResidents();
  };

  const handleToggleHabilitadoAsamblea = (userId: string, current: boolean) => {
    if (!isDemo || updatingId) return;
    const r = residents.find((x) => x.user_id === userId);
    if (!r?.email) return;
    setUpdatingId(userId);
    ensureDemoResident(r.email);
    setDemoResidentHabilitadoParaAsambleaByEmail(r.email, !current);
    refreshDemoResidents();
    setUpdatingId(null);
  };

  const handleToggleFaceId = (userId: string, current: boolean) => {
    const orgId = orgIdForResidents ?? organizationId;
    if (!orgId || updatingId) return;
    setUpdatingId(userId);
    fetch(`/api/admin-ph/residents/${userId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgId, face_id_enabled: !current }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setResidents((prev) =>
          prev.map((r) => (r.user_id === userId ? { ...r, face_id_enabled: data.face_id_enabled } : r))
        );
      })
      .catch(() => {})
      .finally(() => setUpdatingId(null));
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = orgIdForResidents ?? organizationId;
    if (!orgId || !newEmail.trim() || adding) return;
    if (residents.length >= residentLimit) {
      setError(`Su plan permite hasta ${residentLimit} residentes. Actualice el plan para agregar más.`);
      return;
    }
    setAdding(true);
    setError("");
    fetch("/api/admin-ph/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgId, email: newEmail.trim().toLowerCase() }),
    })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (res.ok) {
          if (isDemo && data?.email) ensureDemoResident(data.email);
          setResidents((prev) => [...prev, { user_id: data.user_id, email: data.email, face_id_enabled: true }]);
          setNewEmail("");
          if (isDemo) refetchResidents();
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
        } else {
          setError(data?.error || "Error al agregar residente");
        }
      })
      .catch(() => setError("Error al agregar residente"))
      .finally(() => setAdding(false));
  };

  const openDeleteResidentModal = (userId: string) => {
    const r = residents.find((x) => x.user_id === userId);
    if (!r) return;
    setDeleteResidentPending({ userId, email: r.email || "" });
    setDeleteConfirmText("");
    setError("");
  };

  const confirmRemoveResident = () => {
    const pending = deleteResidentPending;
    const orgId = orgIdForResidents ?? organizationId;
    if (!pending || !orgId) return;
    if (deleteConfirmText.trim().toLowerCase() !== "eliminar") return;
    setDeleteResidentPending(null);
    setDeleteConfirmText("");
    fetch(`/api/admin-ph/residents/${pending.userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: orgId }),
    })
      .then((res) => {
        if (res.ok) {
          setResidents((prev) => prev.filter((r) => r.user_id !== pending.userId));
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
        } else res.json().then((d) => setError(d?.error || "No se pudo eliminar"));
      })
      .catch(() => setError("Error al eliminar"));
  };

  const residentLimit = isDemo ? DEMO_RESIDENTS_LIMIT : (limits?.units?.limit ?? DEFAULT_RESIDENT_LIMIT);
  const atLimit = residents.length >= residentLimit;
  const canAdd = residents.length < residentLimit;

  const handleExport = () => {
    if (!isDemo) return;
    const csv = exportDemoResidentsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `residentes_${DEMO_PH_NAME.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const csv = getImportTemplateCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_importar_residentes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isDemo) return;
    setImportSuccess(null);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = importDemoResidentsFromCsv(text);
      if (result.ok) {
        refetchResidents();
        setImportSuccess(`Se importaron ${result.count} residente(s). Listado actualizado.`);
      } else {
        setError(result.error);
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const openEditModal = (r: Resident) => {
    setEditModalResident(r);
    setEditModalForm({
      email: r.email,
      nombre: r.nombre ?? "",
      unit: r.unit ?? "",
      cuota_pct: r.cuota_pct != null ? String(r.cuota_pct) : "",
      numero_finca: r.numero_finca ?? "",
      cedula_identidad: r.cedula_identidad ?? "",
      payment_status: r.payment_status ?? "al_dia",
      face_id_enabled: r.face_id_enabled ?? false,
      habilitado_para_asamblea: !!r.habilitado_para_asamblea,
      estatus_unidad: r.estatus_unidad ?? "Ocupada",
    });
    setError("");
  };

  const closeEditModal = () => {
    setEditModalResident(null);
    setSavingEditModal(false);
  };

  const saveEditModal = () => {
    const r = editModalResident;
    if (!r || !isDemo || savingEditModal) return;
    setSavingEditModal(true);
    setError("");
    if (r.email) ensureDemoResident(r.email);
    const cuota = editModalForm.cuota_pct.trim() ? parseFloat(editModalForm.cuota_pct.replace(",", ".")) : undefined;
    const ok = updateDemoResidentByEmail(r.email, {
      email: editModalForm.email.trim() || undefined,
      nombre: editModalForm.nombre.trim() || undefined,
      unit: editModalForm.unit.trim() || undefined,
      cuota_pct: Number.isFinite(cuota) ? cuota : undefined,
      numero_finca: editModalForm.numero_finca.trim() || undefined,
      cedula_identidad: editModalForm.cedula_identidad.trim() || undefined,
      payment_status: editModalForm.payment_status,
      face_id_enabled: editModalForm.face_id_enabled,
      habilitado_para_asamblea: editModalForm.habilitado_para_asamblea,
      estatus_unidad: editModalForm.estatus_unidad,
    });
    if (ok) {
      refreshDemoResidents();
      closeEditModal();
    } else {
      setError("No se pudo actualizar (revise que el correo no esté duplicado).");
    }
    setSavingEditModal(false);
  };

  const searchLower = searchQuery.trim().toLowerCase();
  const filteredResidents = residents.filter((r) => {
    if (searchLower) {
      const matchEmail = r.email?.toLowerCase().includes(searchLower);
      const matchUnit = r.unit?.toLowerCase().includes(searchLower);
      const matchNombre = r.nombre?.toLowerCase().includes(searchLower);
      const matchFinca = r.numero_finca?.toLowerCase().includes(searchLower);
      const matchCedula = r.cedula_identidad?.toLowerCase().includes(searchLower);
      if (!matchEmail && !matchUnit && !matchNombre && !matchFinca && !matchCedula) return false;
    }
    if (filterEstado !== "all" && r.payment_status !== filterEstado) return false;
    if (filterFaceId !== "all" && r.face_id_enabled !== filterFaceId) return false;
    if (filterHabAsamblea !== "all" && !!r.habilitado_para_asamblea !== filterHabAsamblea) return false;
    if (filterChatbot === "online" && !r.chatbot_session_active) return false;
    if (filterChatbot === "inactive") {
      if (r.chatbot_session_active) return false;
      if (!r.chatbot_registered && !r.chatbot_login_status) return false;
    }
    return true;
  });
  const countHabilitados = residents.filter((r) => r.habilitado_para_asamblea).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allFilteredSelected = filteredResidents.length > 0 && filteredResidents.every((r) => selectedIds.has(r.user_id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredResidents.map((r) => r.user_id)));
  };
  const clearSelection = () => setSelectedIds(new Set());

  const applyBulkMora = () => {
    if (!isDemo || selectedIds.size === 0 || bulkApplying) return;
    setBulkApplying(true);
    selectedIds.forEach((userId) => {
      const r = residents.find((x) => x.user_id === userId);
      if (r?.email) {
        ensureDemoResident(r.email);
        updateDemoResidentByEmail(r.email, { payment_status: "mora" });
        setDemoResidentHabilitadoParaAsambleaByEmail(r.email, false);
      }
    });
    refetchResidents();
    setSelectedIds(new Set());
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
    setBulkApplying(false);
  };
  const applyBulkAlDia = () => {
    if (!isDemo || selectedIds.size === 0 || bulkApplying) return;
    setBulkApplying(true);
    selectedIds.forEach((userId) => {
      const r = residents.find((x) => x.user_id === userId);
      if (r?.email) {
        ensureDemoResident(r.email);
        updateDemoResidentByEmail(r.email, { payment_status: "al_dia" });
      }
    });
    refetchResidents();
    setSelectedIds(new Set());
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
    setBulkApplying(false);
  };
  const applyBulkFaceId = (enabled: boolean) => {
    if (!isDemo || selectedIds.size === 0 || bulkApplying) return;
    setBulkApplying(true);
    selectedIds.forEach((userId) => {
      const r = residents.find((x) => x.user_id === userId);
      if (r?.email) {
        ensureDemoResident(r.email);
        updateDemoResidentFaceIdByEmail(r.email, enabled);
      }
    });
    refetchResidents();
    setSelectedIds(new Set());
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
    setBulkApplying(false);
  };

  const isConnected = (lastActivity?: string) => {
    if (!lastActivity) return false;
    const t = new Date(lastActivity).getTime();
    return Date.now() - t < 30 * 60 * 1000;
  };

  const formatLastActivity = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "Hace un momento";
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hoy ${d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "2-digit" });
  };

  const openUnitModal = (unit: string) => {
    if (!unit || !isDemo) return;
    const byUnit = getResidentsByUnit(unit);
    const t1 = byUnit.find((r) => (r.titular_orden ?? 1) === 1);
    const t2 = byUnit.find((r) => r.titular_orden === 2);
    const h1 = !!t1?.habilitado_para_asamblea;
    const h2 = !!t2?.habilitado_para_asamblea;
    // Solo un habilitado por unidad: si ambos true, priorizar titular 1; si ninguno, default titular 1
    const habilitado_titular_1 = h1 || (h1 && h2) || (!h1 && !h2);
    const habilitado_titular_2 = h2 && !h1;
    setUnitForm({
      titular_1_email: t1?.email ?? "",
      titular_2_email: t2?.email ?? "",
      habilitado_titular_1,
      habilitado_titular_2,
    });
    setUnitModalUnit(unit);
    setError("");
  };

  const closeUnitModal = () => {
    setUnitModalUnit(null);
    setUnitForm({ titular_1_email: "", titular_2_email: "", habilitado_titular_1: true, habilitado_titular_2: false });
  };

  const saveUnitTemplate = async () => {
    if (!unitModalUnit || !isDemo || savingUnit) return;
    const orgId = orgIdForResidents ?? organizationId;
    if (!orgId) return;
    setSavingUnit(true);
    setError("");
    const result = updateUnitTemplate(unitModalUnit, {
      titular_1_email: unitForm.titular_1_email,
      titular_2_email: unitForm.titular_2_email || undefined,
      habilitado_titular_1: unitForm.habilitado_titular_1,
      habilitado_titular_2: unitForm.habilitado_titular_2,
    });
    if (!result.ok) {
      setError(result.error);
      setSavingUnit(false);
      return;
    }
    const emails = [unitForm.titular_1_email.trim(), unitForm.titular_2_email.trim()].filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    const uniqueEmails = [...new Set(emails)];
    try {
      await Promise.all(
        uniqueEmails.map((email) =>
          fetch("/api/admin-ph/residents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organization_id: orgId, email: email.toLowerCase() }),
          })
        )
      );
    } catch {
      // Si falla el registro en BD, la plantilla ya se guardó en el store
    }
    refetchResidents();
    closeUnitModal();
    setSavingUnit(false);
  };

  return (
    <div className="card owners-page-modern">
      <Suspense fallback={null}>
        <FromWizardBanner />
      </Suspense>
      <style>{`
        .owners-page-modern { padding: 0; overflow: hidden; }
        .owners-page-modern .owners-header-modern { padding: 24px 28px; background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 50%); border-bottom: 1px solid rgba(148,163,184,0.12); }
        .owners-page-modern .owners-stats-row { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px; }
        .owners-page-modern .owners-stat-card { min-width: 120px; padding: 12px 18px; background: rgba(15,23,42,0.4); border-radius: 12px; border: 1px solid rgba(148,163,184,0.1); }
        .owners-page-modern .owners-stat-card--limit { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
        .owners-page-modern .owners-action-bar { padding: 20px 28px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; background: rgba(15,23,42,0.25); border-bottom: 1px solid rgba(148,163,184,0.1); }
        .owners-page-modern .owners-action-form-group { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
        .owners-page-modern .owners-action-form-group .owners-action-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
        .owners-page-modern .owners-action-form-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .owners-page-modern .owners-action-bar input[type="email"] {
          min-width: 280px; max-width: 360px; padding: 10px 14px; border-radius: 10px; font-size: 14px;
          border: 1px solid rgba(148,163,184,0.4); background: rgba(30,41,59,0.9); color: #f1f5f9; caret-color: var(--color-primary);
        }
        .owners-page-modern .owners-action-bar input[type="email"]::placeholder { color: #94a3b8; }
        .owners-page-modern .owners-action-bar input[type="email"]:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        .owners-page-modern .owners-tools-group { display: flex; flex-direction: column; gap: 8px; }
        .owners-page-modern .owners-tools-group .owners-action-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
        .owners-page-modern .owners-toolbar-compact { display: flex; gap: 6px; flex-wrap: wrap; }
        .owners-page-modern .owners-toolbar-compact .btn { padding: 8px 12px; font-size: 12px; border-radius: 8px; }
        .owners-page-modern .owners-filters-bar { padding: 16px 28px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; background: rgba(30,41,59,0.6); border-bottom: 1px solid rgba(148,163,184,0.25); }
        .owners-page-modern .owners-filters-bar .owners-filters-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-right: 4px; }
        .owners-page-modern .owners-filters-bar input[type="search"] {
          padding: 10px 14px; border-radius: 10px; width: 260px; max-width: 100%; font-size: 14px;
          border: 2px solid rgba(148,163,184,0.45); background: rgba(51,65,85,0.95) !important;
          color: #f1f5f9 !important; caret-color: var(--color-primary);
          font-weight: 500; -webkit-appearance: none; appearance: none;
        }
        .owners-page-modern .owners-filters-bar input[type="search"]::placeholder { color: #94a3b8; opacity: 1; }
        .owners-page-modern .owners-filters-bar input[type="search"]:focus {
          outline: none; border-color: var(--color-primary, #818cf8); box-shadow: 0 0 0 2px rgba(99,102,241,0.25);
        }
        .owners-page-modern .owners-filters-bar select {
          padding: 10px 36px 10px 12px; border-radius: 10px; font-size: 13px;
          border: 2px solid rgba(148,163,184,0.45); background: rgba(51,65,85,0.95) !important;
          color: #f1f5f9 !important; min-width: 140px; cursor: pointer;
          font-weight: 500; -webkit-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 10px center !important;
        }
        .owners-page-modern .owners-filters-bar select option { background: #1e293b !important; color: #f1f5f9 !important; }
        .owners-page-modern .owners-filters-bar .owners-filter-count { font-size: 13px; font-weight: 600; color: #cbd5e1; margin-left: auto; }
        .owners-page-modern .owners-filters-bar .owners-filter-count .muted { font-weight: 500; color: #94a3b8; }
        html[data-theme="light"] .owners-page-modern .owners-filters-bar input[type="search"],
        html[data-theme="light"] .owners-page-modern .owners-filters-bar select { background: #fff; color: #1e293b; border-color: #cbd5e1; }
        html[data-theme="light"] .owners-page-modern .owners-filters-bar input[type="search"]::placeholder { color: #64748b; }
        html[data-theme="light"] .owners-page-modern .owners-filters-bar select option { background: #fff; color: #1e293b; }
        html[data-theme="light"] .owners-page-modern .owners-action-bar input[type="email"] { background: #fff; color: #1e293b; border-color: #cbd5e1; }
        html[data-theme="light"] .owners-page-modern .owners-action-bar input[type="email"]::placeholder { color: #64748b; }
        .owners-page-modern .owners-content-area { padding: 20px 28px 28px; }
        .owners-page-modern .owners-list-wrap { border-radius: 12px; }
        .owners-list-wrap .owners-list-item:hover { background: rgba(148,163,184,0.06); }
        html[data-theme="light"] .resident-status--al-dia {
          background: rgba(34, 197, 94, 0.22) !important;
          border: 1px solid #22c55e !important;
          color: #15803d !important;
          padding: 4px 8px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
        }
        html[data-theme="light"] .resident-status--al-dia span {
          color: #15803d !important;
        }
        html[data-theme="light"] .resident-status--mora {
          background: rgba(239, 68, 68, 0.22) !important;
          border: 1px solid #ef4444 !important;
          color: #b91c1c !important;
          padding: 4px 8px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
        }
        html[data-theme="light"] .resident-status--mora span {
          color: #b91c1c !important;
        }
        html[data-theme="light"] .resident-status--mora span[style*="background"] {
          background: #dc2626 !important;
        }
      `}</style>
      <div className="owners-header-modern">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>Propietarios / Residentes</h2>
            <p className="muted" style={{ marginTop: "6px", fontSize: "14px" }}>
              {isDemo
                ? `${DEMO_PH_NAME} · Demo`
                : "Gestión de residentes y Face ID. OTP siempre disponible como respaldo."}
            </p>
          </div>
          <div className="owners-stats-row">
            <div className={`owners-stat-card ${atLimit ? "owners-stat-card--limit" : ""}`}>
              <div className="muted" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Residentes</div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{residents.length} <span className="muted" style={{ fontSize: "14px", fontWeight: 500 }}>/ {residentLimit}</span></div>
              {atLimit && (
                <Link href="/dashboard/admin-ph/subscription" style={{ fontSize: "11px", color: "var(--color-primary)", textDecoration: "underline", marginTop: "4px", display: "inline-block" }}>Actualizar plan</Link>
              )}
            </div>
            {countHabilitados > 0 && activeTab === "residents" && (
              <div className="owners-stat-card">
                <div className="muted" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Habilitados asamblea</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#4ade80" }}>{countHabilitados}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(organizationId || isDemo) && (
        <div className="owners-action-bar">
          <div className="owners-action-form-group">
            <span className="owners-action-label">Agregar residente</span>
            <form onSubmit={handleAddResident} className="owners-action-form-row">
              <input
                type="email"
                placeholder={isDemo && !atLimit ? "Ej: residente1@demo.assembly2.com" : "Correo del residente"}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button type="submit" disabled={!newEmail.trim() || adding || !canAdd} className="btn btn-primary" style={{ padding: "10px 18px", borderRadius: "10px", fontWeight: 600 }} title={atLimit ? "Límite alcanzado" : undefined}>
                {adding ? "…" : atLimit ? "Límite alcanzado" : "Agregar"}
              </button>
            </form>
          </div>
          {isDemo && (
            <div className="owners-tools-group">
              <span className="owners-action-label">Herramientas CSV</span>
              <div className="owners-toolbar-compact">
                <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={residents.length === 0} title="Exportar CSV">Exportar</button>
                <button type="button" className="btn btn-ghost" onClick={handleDownloadTemplate} title="Plantilla para importar">Plantilla</button>
                <button type="button" className="btn btn-ghost" onClick={() => refetchResidents()} title="Actualizar listado">Actualizar</button>
                <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={atLimit} title="Importar CSV">Importar</button>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
              </div>
            </div>
          )}
          {importSuccess && <span className="muted" style={{ fontSize: "12px", alignSelf: "center" }}>{importSuccess}</span>}
        </div>
      )}

      {authChecked && !organizationId && !isDemo && (
        <p className="muted" style={{ marginTop: "18px" }}>
          No hay organización seleccionada. Inicia sesión como Admin de Comunidad.
        </p>
      )}

      {(organizationId || isDemo) && loading && <p className="muted" style={{ marginTop: "18px" }}>Cargando residentes…</p>}
      {(organizationId || isDemo) && error && <p style={{ marginTop: "18px", color: "var(--color-error, #ef4444)" }}>{error}</p>}

      {(organizationId || isDemo) && !loading && !error && residents.length === 0 && activeTab === "residents" && (
        <p className="muted" style={{ marginTop: "18px" }}>No hay residentes. Agregue correos para esta {isDemo ? "demo (Urban Tower)" : "organización"}.</p>
      )}

      {(organizationId || isDemo) && !loading && (
        <div className="owners-content-area">
          <div role="tablist" style={{ display: "flex", gap: "2px", marginBottom: "1px" }}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "residents"}
              onClick={() => setActiveTab("residents")}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                background: activeTab === "residents" ? "rgba(99,102,241,0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "residents" ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
                color: activeTab === "residents" ? "var(--color-text, #f1f5f9)" : "#94a3b8",
                cursor: "pointer",
                borderRadius: "10px 10px 0 0",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              Residentes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "powers"}
              onClick={() => setActiveTab("powers")}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                background: activeTab === "powers" ? "rgba(99,102,241,0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "powers" ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
                color: activeTab === "powers" ? "var(--color-text, #f1f5f9)" : "#94a3b8",
                cursor: "pointer",
                borderRadius: "10px 10px 0 0",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              Poderes de asamblea
            </button>
          </div>

          {activeTab === "powers" && (
            <div className="card owners-powers-card" style={{ marginTop: "12px", padding: "24px", background: "rgba(15,23,42,0.3)", borderRadius: "12px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>Gestión y solicitudes de poderes de asamblea</h3>
              <p className="muted" style={{ margin: 0, marginBottom: "16px", fontSize: "14px" }}>
                Active el botón &quot;Ceder poder&quot; para que los residentes lo vean en el chatbot y puedan enviar solicitudes. Revise y apruebe o rechace las solicitudes pendientes.
              </p>
              {isDemo && <p className="muted" style={{ margin: 0, marginBottom: "12px", fontSize: "12px" }}>Modo demo: se usa la organización demo en BD. Si hay residentes con sesión en esa organización, podrán ver &quot;Ceder poder&quot; y las solicitudes aparecerán aquí.</p>}
              {loadingPowers ? (
                <p className="muted" style={{ margin: 0 }}>Cargando…</p>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={powersEnabled}
                        onChange={handleTogglePowersEnabled}
                        disabled={savingPowersConfig}
                        style={{ width: "18px", height: "18px" }}
                      />
                      Activar botón de poderes para residentes
                    </label>
                    {savingPowersConfig && <span className="muted" style={{ fontSize: "13px" }}>Guardando…</span>}
                    {powersEnabled && <span style={{ fontSize: "12px", color: "var(--color-primary, #818cf8)", fontWeight: 500 }}>Los residentes ven &quot;Ceder poder&quot; en el chatbot.</span>}
                  </div>
                  <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600 }}>
                    Solicitudes
                    {isDemo && powerRequests.length > 0 && <span className="muted" style={{ marginLeft: "8px", fontWeight: 400, fontSize: "12px" }}>(ejemplo demo — puede aprobar o rechazar)</span>}
                  </h4>
                  {powerRequests.length === 0 ? (
                    <p className="muted" style={{ margin: 0, fontSize: "13px" }}>No hay solicitudes de poder. Cuando un residente envíe una desde el chatbot, aparecerá aquí.</p>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {powerRequests.map((r) => (
                        <li key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(148,163,184,0.15)", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ flex: "1 1 260px" }}>
                            <strong style={{ fontSize: "13px" }}>{r.resident_email}</strong>
                            <span className="muted" style={{ margin: "0 8px", fontSize: "12px" }}>→</span>
                            <span style={{ fontSize: "13px" }}>{r.apoderado_nombre}</span>
                            <span className="muted" style={{ marginLeft: "6px", fontSize: "12px" }}>({r.apoderado_email})</span>
                            <div className="muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                              {r.apoderado_tipo === "titular_mayor_edad" ? "Titular mayor de edad" : "Residente mismo PH"} · {new Date(r.created_at).toLocaleString("es")}
                              {(r.apoderado_cedula || r.apoderado_telefono || r.vigencia) && (
                                <span style={{ display: "block", marginTop: "2px" }}>
                                  {[r.apoderado_cedula && `Cédula: ${r.apoderado_cedula}`, r.apoderado_telefono && `Tel: ${r.apoderado_telefono}`, r.vigencia && `Vigencia: ${r.vigencia}`].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: r.status === "PENDING" ? "#eab308" : r.status === "APPROVED" ? "#22c55e" : "#ef4444" }}>{r.status === "PENDING" ? "Pendiente" : r.status === "APPROVED" ? "Aprobado" : "Rechazado"}</span>
                            {r.status === "PENDING" && (
                              <>
                                <button type="button" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "13px" }} disabled={updatingPowerId === r.id} onClick={() => handlePowerRequestAction(r.id, "APPROVED")}>{updatingPowerId === r.id ? "…" : "Aprobar"}</button>
                                <button type="button" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "13px", color: "var(--color-error, #ef4444)" }} disabled={updatingPowerId === r.id} onClick={() => handlePowerRequestAction(r.id, "REJECTED")}>{updatingPowerId === r.id ? "…" : "Rechazar"}</button>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "residents" && residents.length > 0 && (
            <>
              <div className="owners-filters-bar">
                <span className="owners-filters-label">Buscar</span>
                <input
                  type="search"
                  placeholder="Correo, unidad, nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar residentes"
                />
                <span className="owners-filters-label" style={{ marginLeft: "8px" }}>Filtros</span>
                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as "all" | "al_dia" | "mora")} aria-label="Estatus pago">
                  <option value="all">Estatus: todos</option>
                  <option value="al_dia">Al Día</option>
                  <option value="mora">En Mora</option>
                </select>
                <select value={String(filterFaceId)} onChange={(e) => setFilterFaceId(e.target.value === "all" ? "all" : e.target.value === "true")} aria-label="Face ID">
                  <option value="all">Face ID: todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <select value={String(filterHabAsamblea)} onChange={(e) => setFilterHabAsamblea(e.target.value === "all" ? "all" : e.target.value === "true")} aria-label="Habilitado asamblea">
                  <option value="all">Hab. asamblea: todos</option>
                  <option value="true">Habilitado</option>
                  <option value="false">No habilitado</option>
                </select>
                <select value={filterChatbot} onChange={(e) => setFilterChatbot(e.target.value as "all" | "online" | "inactive")} aria-label="Chatbot">
                  <option value="all">Chatbot: todos</option>
                  <option value="online">Online</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <span className="owners-filter-count">
                  Mostrando <strong>{filteredResidents.length}</strong> <span className="muted">de {residents.length}</span>
                </span>
                <button type="button" className="btn btn-ghost" onClick={() => setHelpModalOpen(true)} style={{ padding: "6px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }} title="Ver guía">
                  <span style={{ width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: "11px" }}>?</span>
                  Ayuda
                </button>
              </div>
              <div style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setGuideOpen((o) => !o)}
                  style={{ background: "none", border: "none", padding: "4px 0", fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #818cf8)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {guideOpen ? "Ocultar guía" : "Ver guía"}
                  <span style={{ fontSize: "10px" }}>{guideOpen ? "▼" : "▶"}</span>
                </button>
                {guideOpen && (
                  <div className="muted" style={{ marginTop: "8px", padding: "12px 14px", background: "rgba(15,23,42,0.35)", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.15)", maxWidth: "720px", fontSize: "12px" }}>
                    <p style={{ margin: "0 0 8px" }}>
                <strong>Hab. asamblea</strong> = habilitado para votar en la asamblea (solo uno por unidad puede estar en Sí). <strong>No</strong> = no vota en esta asamblea. El estatus <strong>Al Día / En Mora</strong> se sincroniza con el Monitor de votación.
                    </p>
                    <p style={{ margin: "0 0 8px" }}>
                      <strong>Chatbot</strong>: <strong>Online</strong> = conectado en sesión actual. <strong>Inactivo</strong> = registrado pero desconectado. <strong>—</strong> = no registrado.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>¿Cómo se relaciona este listado con las asambleas?</strong> Este es el listado <em>único</em> de residentes/propietarios de su PH. <strong>No se agregan residentes “a una asamblea”</strong>: cuando abre el Monitor de cualquier asamblea (Quórum o Votación), el sistema usa automáticamente este mismo listado. Quien esté aquí con Unidad asignada y (si aplica) Hab. asamblea = Sí y Al Día, podrá votar en esa asamblea. Mantenga el listado al día y el Monitor reflejará los mismos datos.
              </p>
                  </div>
                )}
              </div>
              {selectedIds.size > 0 && (
                <div style={{ marginBottom: "12px", padding: "12px 14px", background: "rgba(99, 102, 241, 0.12)", borderRadius: "10px", border: "1px solid rgba(99, 102, 241, 0.25)", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                  <strong style={{ fontSize: "14px" }}>Edición masiva: {selectedIds.size} seleccionado(s)</strong>
                  {isDemo ? (
                    <>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={applyBulkMora} disabled={bulkApplying} style={{ fontSize: "13px" }}>Marcar como Mora</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={applyBulkAlDia} disabled={bulkApplying} style={{ fontSize: "13px" }}>Marcar como Al Día</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyBulkFaceId(true)} disabled={bulkApplying} style={{ fontSize: "13px" }}>Habilitar Face ID</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyBulkFaceId(false)} disabled={bulkApplying} style={{ fontSize: "13px" }}>Deshabilitar Face ID</button>
                    </>
                  ) : (
                    <span className="muted" style={{ fontSize: "13px" }}>Disponible en modo demo.</span>
                  )}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={clearSelection} style={{ marginLeft: "auto", fontSize: "13px" }}>Deseleccionar todo</button>
                </div>
              )}
            <div className="owners-list-wrap" style={{ border: "1px solid rgba(148,163,184,0.12)", overflow: "hidden", overflowX: "auto", marginTop: "16px", marginBottom: "24px", background: "rgba(15,23,42,0.2)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div className="owners-list-header" style={{ display: "grid", gridTemplateColumns: "44px 88px 1fr 70px 100px 110px 80px 85px 72px 100px 140px", gap: "8px 12px", padding: "12px 14px", background: "rgba(15,23,42,0.4)", borderBottom: "1px solid rgba(148,163,184,0.2)", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", alignItems: "center", minWidth: "1100px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }} aria-hidden>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} aria-label="Seleccionar todos los visibles" style={{ width: "18px", height: "18px", accentColor: "var(--color-primary, #6366f1)" }} />
                </span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Al día o en mora (solo Al Día pueden votar, Ley 284)">Estatus</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }}>Nombre</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Número de unidad">Unidad</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Número de finca (folio real)">Nº finca</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Cédula, pasaporte u otro documento de identidad">ID identidad</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Cuota de asamblea">Cuota %</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Habilitado para votar en la asamblea. Solo un titular por unidad en Sí; No = no vota.">Habilitado</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }}>Face ID</span>
                <span style={{ whiteSpace: "nowrap", minWidth: 0 }} title="Estado en chatbot: Online = sesión abierta; Inactivo = registrado pero desconectado; — = no registrado">Chatbot</span>
                <span style={{ display: "flex", justifyContent: "center", minWidth: 0, whiteSpace: "nowrap" }}>Acciones</span>
              </div>
              <ul className="owners-list card-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {filteredResidents.map((r) => (
                  <li key={r.user_id} className="owners-list-item list-item" style={{ display: "grid", gridTemplateColumns: "44px 88px 1fr 70px 100px 110px 80px 85px 72px 100px 140px", gap: "8px 12px", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid rgba(148,163,184,0.08)", transition: "background 0.15s", minWidth: "1100px" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                      <input type="checkbox" checked={selectedIds.has(r.user_id)} onChange={() => toggleSelect(r.user_id)} aria-label={`Seleccionar ${r.email}`} style={{ width: "18px", height: "18px", accentColor: "var(--color-primary, #6366f1)" }} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      {isDemo ? (
                        <select
                          className={`resident-status resident-status--${r.payment_status === "mora" ? "mora" : "al-dia"}`}
                          value={r.payment_status === "mora" ? "mora" : "al_dia"}
                          onChange={(e) => {
                            const v = e.target.value as "al_dia" | "mora";
                            if (v === r.payment_status) return;
                            let ok = updateDemoResidentByEmail(r.email, { payment_status: v });
                            if (!ok && r.email) {
                              ensureDemoResident(r.email);
                              ok = updateDemoResidentByEmail(r.email, { payment_status: v });
                            }
                            if (ok && v === "mora") setDemoResidentHabilitadoParaAsambleaByEmail(r.email, false);
                            if (ok) {
                              refetchResidents();
                              if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-residents-changed"));
                            }
                          }}
                          style={{ padding: "4px 6px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: r.payment_status === "mora" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: r.payment_status === "mora" ? "#f87171" : "#4ade80", border: "1px solid transparent", cursor: "pointer", minWidth: "72px" }}
                          title="Al día / En Mora. Cambiar actualiza Hab. asamblea."
                        >
                          <option value="al_dia">Al día</option>
                          <option value="mora">En Mora</option>
                        </select>
                      ) : r.payment_status === "mora" ? (
                        <span className="resident-status resident-status--mora" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="En mora"><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f87171" }} aria-hidden /><span style={{ fontSize: "11px", fontWeight: 600, color: "#f87171" }}>Mora</span></span>
                      ) : r.payment_status === "al_dia" ? (
                        <span className="resident-status resident-status--al-dia" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="Al día"><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} aria-hidden /><span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80" }}>Al día</span></span>
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>—</span>
                      )}
                    </span>
                    <span style={{ minWidth: 0, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.nombre ?? r.email ?? ""}>{r.nombre || "—"}</span>
                    <span style={{ minWidth: 0, fontVariantNumeric: "tabular-nums" }}>
                      {r.unit != null && r.unit !== "" ? (
                        isDemo ? (
                          <button type="button" onClick={() => openUnitModal(r.unit!)} className="owners-unit-link" style={{ background: "none", border: "none", padding: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #818cf8)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }} title={`Plantilla unidad ${r.unit}`}>{r.unit}</button>
                        ) : (
                          <span style={{ fontSize: "13px", fontWeight: 500 }}>{r.unit}</span>
                        )
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>—</span>
                      )}
                    </span>
                    <span style={{ minWidth: 0, fontVariantNumeric: "tabular-nums", fontSize: "13px" }} title={r.numero_finca ?? ""}>{r.numero_finca ?? "—"}</span>
                    <span style={{ minWidth: 0, fontVariantNumeric: "tabular-nums", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.cedula_identidad ?? ""}>{r.cedula_identidad ?? "—"}</span>
                    <span style={{ minWidth: 0, fontVariantNumeric: "tabular-nums", fontSize: "13px", fontWeight: 600 }}>{r.cuota_pct != null ? `${r.cuota_pct} %` : "—"}</span>
                    <span style={{ minWidth: 0, fontSize: "13px" }} title={r.habilitado_para_asamblea ? "Este residente está habilitado para votar en la asamblea." : "No habilitado para votar en esta asamblea (solo uno por unidad puede estar en Sí)."}>{r.habilitado_para_asamblea ? "Sí" : "No"}</span>
                    <span style={{ minWidth: 0, fontSize: "13px" }}>{r.face_id_enabled ? "Sí" : "No"}</span>
                    <span style={{ minWidth: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                      <span title={r.chatbot_session_active ? "Conectado al chatbot (online)" : r.chatbot_registered || r.chatbot_login_status ? "Pre-registro ok; inactivo en chatbot" : "No registrado en chatbot"} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {(r.chatbot_registered || r.chatbot_login_status || r.chatbot_session_active) && (
                          <span style={{ display: "inline-flex", alignItems: "center", color: "#4ade80" }} title="Pre-registro ok">
                            <IconCheck />
                          </span>
                        )}
                        {r.chatbot_session_active ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#4ade80", fontWeight: 600 }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} aria-hidden />
                            Online
                          </span>
                        ) : r.chatbot_registered || r.chatbot_login_status ? (
                          <span className="muted" style={{ fontSize: "12px" }}>Inactivo</span>
                        ) : (
                          <span className="muted" style={{ fontSize: "12px" }}>—</span>
                        )}
                      </span>
                      {isDemo && (r.chatbot_registered || r.chatbot_login_status || r.chatbot_session_active) && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: "4px 6px", minWidth: "28px" }}
                          onClick={() => setSessionHistoryResident(r)}
                          title="Ver historial de sesión"
                        >
                          <IconHistory />
                        </button>
                      )}
                    </span>
                    <span style={{ minWidth: 0, display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                      {isDemo && (
                        <>
                          <button type="button" className="btn btn-ghost" style={{ padding: "6px 8px", minWidth: "32px" }} onClick={() => openEditModal(r)} title="Edición rápida"><IconEdit /></button>
                          <button type="button" className="btn btn-ghost" style={{ padding: "6px 8px", minWidth: "32px" }} onClick={() => r.unit && openUnitModal(r.unit)} disabled={!r.unit || r.unit === ""} title={r.unit ? "Plantilla de unidad" : "Asigne unidad"}><IconTemplate /></button>
                        </>
                      )}
                      <button type="button" className="btn btn-ghost" style={{ color: "var(--color-error, #ef4444)", padding: "6px 8px", minWidth: "32px" }} onClick={() => openDeleteResidentModal(r.user_id)} title="Eliminar"><IconTrash /></button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            </>
          )}
        </div>
      )}

      {unitModalUnit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unit-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && closeUnitModal()}
        >
          <div
            style={{
              background: "var(--color-surface, #1e293b)",
              borderRadius: "12px",
              padding: "20px 24px",
              minWidth: "360px",
              maxWidth: "90vw",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="unit-modal-title" style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 600 }}>
              Plantilla de unidad {unitModalUnit}
            </h2>
            <p className="muted" style={{ marginBottom: "8px", fontSize: "13px" }}>
              Titulares y quién está habilitado para la asamblea.
            </p>
            <p style={{ marginBottom: "16px", fontSize: "12px", color: "var(--color-primary, #818cf8)", fontWeight: 500 }}>
              Solo un titular puede estar habilitado para la asamblea por unidad.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                Titular 1 (correo)
                <input
                  type="email"
                  value={unitForm.titular_1_email}
                  onChange={(e) => setUnitForm((f) => ({ ...f, titular_1_email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  style={{ padding: "8px 10px", borderRadius: "8px", fontSize: "14px" }}
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={unitForm.habilitado_titular_1}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUnitForm((f) => ({ ...f, habilitado_titular_1: checked, habilitado_titular_2: checked ? false : f.habilitado_titular_2 }));
                  }}
                  style={{ width: "16px", height: "16px" }}
                />
                Titular 1 habilitado para asamblea
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                Titular 2 (correo, opcional)
                <input
                  type="email"
                  value={unitForm.titular_2_email}
                  onChange={(e) => setUnitForm((f) => ({ ...f, titular_2_email: e.target.value }))}
                  placeholder="opcional"
                  style={{ padding: "8px 10px", borderRadius: "8px", fontSize: "14px" }}
                />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={unitForm.habilitado_titular_2}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUnitForm((f) => ({ ...f, habilitado_titular_2: checked, habilitado_titular_1: checked ? false : f.habilitado_titular_1 }));
                  }}
                  style={{ width: "16px", height: "16px" }}
                />
                Titular 2 habilitado para asamblea
              </label>
            </div>
            {error && <p style={{ marginBottom: "12px", color: "var(--color-error, #ef4444)", fontSize: "13px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={closeUnitModal}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={saveUnitTemplate} disabled={savingUnit}>
                {savingUnit ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionHistoryResident && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-history-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && setSessionHistoryResident(null)}
        >
          <div
            style={{
              background: "var(--color-surface, #1e293b)",
              borderRadius: "12px",
              padding: "20px 24px",
              minWidth: "400px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="session-history-modal-title" style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>
              Historial de sesión — {sessionHistoryResident.nombre || sessionHistoryResident.email}
            </h2>
            <p className="muted" style={{ marginBottom: "16px", fontSize: "13px" }}>{sessionHistoryResident.email}</p>
            <SessionHistoryList email={sessionHistoryResident.email} />
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSessionHistoryResident(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteResidentPending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-resident-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && (setDeleteResidentPending(null), setDeleteConfirmText(""))}
        >
          <div
            style={{
              background: "var(--color-surface, #1e293b)",
              borderRadius: "12px",
              padding: "20px 24px",
              minWidth: "360px",
              maxWidth: "90vw",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-resident-modal-title" style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600 }}>
              Eliminar residente
            </h2>
            <p style={{ marginBottom: "8px", fontSize: "14px", color: "var(--color-text, #e2e8f0)" }}>
              ¿Eliminar residente de la organización?
              {deleteResidentPending.email && (
                <span style={{ display: "block", marginTop: "6px", fontWeight: 500, color: "var(--color-primary, #818cf8)" }}>
                  {deleteResidentPending.email}
                </span>
              )}
            </p>
            <p className="muted" style={{ marginBottom: "10px", fontSize: "12px" }}>
              Escriba <strong>Eliminar</strong> para confirmar la acción.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Eliminar"
              autoComplete="off"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}
            />
            {error && <p style={{ marginBottom: "12px", color: "var(--color-error, #ef4444)", fontSize: "13px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setDeleteResidentPending(null); setDeleteConfirmText(""); setError(""); }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "var(--color-error, #dc2626)", color: "#fff" }}
                disabled={deleteConfirmText.trim().toLowerCase() !== "eliminar"}
                onClick={confirmRemoveResident}
              >
                Eliminar residente
              </button>
            </div>
          </div>
        </div>
      )}

      {helpModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={(e) => e.target === e.currentTarget && setHelpModalOpen(false)}
        >
          <div
            style={{ background: "var(--color-surface, #1e293b)", borderRadius: "12px", padding: "24px", maxWidth: "560px", width: "90vw", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="help-modal-title" style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 600 }}>Cómo usar el módulo Propietarios / Residentes</h2>
            <div className="muted" style={{ fontSize: "14px", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 12px" }}>
                <strong>Listado único.</strong> Este es el listado de residentes/propietarios de su PH. No se agregan residentes "a una asamblea": el Monitor de cualquier asamblea (Quórum o Votación) usa automáticamente este mismo listado.
              </p>
              <p style={{ margin: "0 0 12px" }}>
                <strong>Estatus (Al Día / En Mora).</strong> Quien esté Al Día puede votar (según Ley 284). En Mora no vota. Puede cambiar el estatus en la tabla (demo) o en el modal Editar.
              </p>
              <p style={{ margin: "0 0 12px" }}>
                <strong>Hab. asamblea (voto).</strong> Solo un titular por unidad puede tener "Sí". Quien tenga "No" no vota en esa asamblea. En demo puede cambiar desde la tabla o desde la plantilla de unidad (clic en Unidad).
              </p>
              <p style={{ margin: "0 0 12px" }}>
                <strong>Agregar / Editar / Eliminar.</strong> Use el campo de correo para agregar; el lápiz para editar datos y estatus; el icono de eliminar para quitar al residente de la organización (con confirmación).
              </p>
              <p style={{ margin: "0 0 12px" }}>
                <strong>Exportar / Importar CSV.</strong> En demo puede descargar la plantilla, rellenarla y subir un CSV para importar residentes en bloque.
              </p>
              <p style={{ margin: 0 }}>
                Mantenga el listado al día y el Monitor de votación reflejará los mismos datos.
              </p>
            </div>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-primary" onClick={() => setHelpModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {editModalResident && (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-resident-modal-title" className="edit-resident-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEditModal()}>
          <div className="edit-resident-modal card create-ph-form" onClick={(e) => e.stopPropagation()}>
            <div className="create-ph-form-header">
              <h2 id="edit-resident-modal-title" className="create-ph-form-title">Editar residente</h2>
              <p className="create-ph-form-desc">Complete o modifique los datos.</p>
            </div>
            <div className="create-ph-form-fields">
              <label className="create-ph-field">
                <span className="create-ph-label">Correo</span>
                <input type="email" className="create-ph-input" value={editModalForm.email} onChange={(e) => setEditModalForm((f) => ({ ...f, email: e.target.value }))} />
              </label>
              <div className="create-ph-field-row">
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Nombre</span>
                  <input type="text" className="create-ph-input" value={editModalForm.nombre} onChange={(e) => setEditModalForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" />
                </label>
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Unidad</span>
                  <input type="text" className="create-ph-input" value={editModalForm.unit} onChange={(e) => setEditModalForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Ej. 1" />
                </label>
              </div>
              <div className="create-ph-field-row">
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Nº finca</span>
                  <input type="text" className="create-ph-input" value={editModalForm.numero_finca} onChange={(e) => setEditModalForm((f) => ({ ...f, numero_finca: e.target.value }))} placeholder="Ej. 96051" />
                </label>
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">ID identidad</span>
                  <input type="text" className="create-ph-input" value={editModalForm.cedula_identidad} onChange={(e) => setEditModalForm((f) => ({ ...f, cedula_identidad: e.target.value }))} placeholder="Cédula, pasaporte…" />
                </label>
              </div>
              <div className="create-ph-field-row">
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Cuota %</span>
                  <input type="text" className="create-ph-input" value={editModalForm.cuota_pct} onChange={(e) => setEditModalForm((f) => ({ ...f, cuota_pct: e.target.value }))} placeholder="2" />
                </label>
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Estatus de unidad</span>
                  <select
                    className="create-ph-input create-ph-select"
                    value={editModalForm.estatus_unidad}
                    onChange={(e) => setEditModalForm((f) => ({ ...f, estatus_unidad: e.target.value as "Ocupada" | "Alquilada" | "Sin inquilino" }))}
                  >
                    <option value="Ocupada">Ocupada</option>
                    <option value="Alquilada">Alquilada</option>
                    <option value="Sin inquilino">Sin inquilino</option>
                  </select>
                </label>
              </div>
              <div className="create-ph-field-row">
                <label className="create-ph-field create-ph-field--narrow">
                  <span className="create-ph-label">Estatus de pago</span>
                  <select
                    className="create-ph-input create-ph-select"
                    value={editModalForm.payment_status}
                    onChange={(e) => {
                      const v = e.target.value as "al_dia" | "mora";
                      setEditModalForm((f) => ({ ...f, payment_status: v, habilitado_para_asamblea: v === "mora" ? false : f.habilitado_para_asamblea }));
                    }}
                  >
                    <option value="al_dia">Al Día</option>
                    <option value="mora">En Mora</option>
                  </select>
                  <span className="muted" style={{ fontSize: "11px", marginTop: "2px" }}>Ley 284.</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input type="checkbox" checked={editModalForm.face_id_enabled} onChange={(e) => setEditModalForm((f) => ({ ...f, face_id_enabled: e.target.checked }))} style={{ width: "14px", height: "14px" }} />
                  Face ID habilitado
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: editModalForm.payment_status === "mora" ? "not-allowed" : "pointer", fontSize: "13px", opacity: editModalForm.payment_status === "mora" ? 0.7 : 1 }}>
                  <input type="checkbox" checked={editModalForm.habilitado_para_asamblea} disabled={editModalForm.payment_status === "mora"} onChange={(e) => setEditModalForm((f) => ({ ...f, habilitado_para_asamblea: e.target.checked }))} style={{ width: "14px", height: "14px" }} />
                  Hab. asamblea (solo Al Día; uno por unidad)
                </label>
              </div>
            </div>
            <details className="edit-resident-detail" style={{ marginTop: "12px" }}>
              <summary className="muted" style={{ fontSize: "12px", cursor: "pointer" }}>Detalle (solo lectura)</summary>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: "12px", marginTop: "8px", color: "#94a3b8" }}>
                <span>Registro chatbot:</span><span>{editModalResident.chatbot_registered ? "Sí" : "No"}</span>
                <span>Login chatbot:</span><span>{editModalResident.chatbot_login_status === "logged_in" ? "Conectado" : editModalResident.chatbot_login_status === "registered" ? "Registrado" : "Sin acceso"}</span>
                <span>Sesión:</span><span>{editModalResident.chatbot_session_active ? "Abierta" : "—"}</span>
                <span>Conectado:</span><span>{isConnected(editModalResident.last_activity_at) ? "Sí" : "—"}</span>
                <span>Actividad:</span><span>{editModalResident.assembly_activity || formatLastActivity(editModalResident.last_activity_at) || "—"}</span>
              </div>
            </details>
            {error && <p style={{ marginTop: "12px", marginBottom: "0", color: "var(--color-error, #ef4444)", fontSize: "13px" }}>{error}</p>}
            <div className="create-ph-form-actions">
              <button type="button" className="btn btn-primary" onClick={saveEditModal} disabled={savingEditModal}>{savingEditModal ? "Guardando…" : "Guardar"}</button>
              <button type="button" className="btn btn-ghost create-ph-cancel" onClick={closeEditModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
