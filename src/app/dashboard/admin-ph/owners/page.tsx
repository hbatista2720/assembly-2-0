"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  getDemoResidents,
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

const iconBtn = { width: 16, height: 16, flexShrink: 0 };
const IconEdit = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconTemplate = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconBtn} aria-hidden><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { limits } = useUpgradeBanner(subscriptionId);

  useEffect(() => {
    const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    const subId = typeof window !== "undefined" ? localStorage.getItem("assembly_subscription_id") : null;
    setOrganizationId(orgId);
    setSubscriptionId(subId);
    setIsDemo(isDemoResidentsContext());
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
    setLoading(true);
    if (orgIdForResidents === DEMO_ORG_ID && typeof window !== "undefined") {
      setResidents(getDemoResidentsAsResidentList());
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
    <div className="card">
      <style>{`
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Propietarios / Residentes</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            {isDemo
              ? `${DEMO_PH_NAME} · ${residentLimit} espacios (demo). Gestión de residentes y Face ID (opcional).`
              : "Gestión de residentes y configuración de Face ID (opcional). OTP siempre disponible como respaldo."}
          </p>
          <p className="muted" style={{ marginTop: "4px", fontSize: "13px" }}>
            <strong>{residents.length} / {residentLimit}</strong> residentes.
            {atLimit && (
              <span style={{ color: "var(--color-error, #ef4444)", marginLeft: "8px" }}>
                Límite del plan alcanzado. <Link href="/dashboard/admin-ph/subscription" className="muted" style={{ textDecoration: "underline" }}>Actualizar plan</Link>
              </span>
            )}
            {isDemo && !atLimit && " Puede usar correos como "}
            {isDemo && !atLimit && <code>residente1@demo.assembly2.com</code>}
          </p>
          <p className="muted" style={{ marginTop: "2px", fontSize: "12px" }}>
            Puede agregar hasta <strong>{residentLimit}</strong> residentes (plan actual).
            {countHabilitados > 0 && activeTab === "residents" && (
              <span style={{ marginLeft: "12px" }}>· <strong>{countHabilitados}</strong> habilitados para asamblea</span>
            )}
          </p>
        </div>
      </div>

      {(organizationId || isDemo) && (
        <>
          <form onSubmit={handleAddResident} style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="email"
              placeholder="Correo del residente (ej. residente1@demo.assembly2.com)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", flex: "1 1 200px", minWidth: "180px" }}
            />
            <button type="submit" disabled={!newEmail.trim() || adding || !canAdd} style={{ padding: "8px 16px" }} title={atLimit ? "Límite alcanzado. Actualice su plan para agregar más residentes." : undefined}>
              {adding ? "Agregando…" : atLimit ? "Límite alcanzado" : "Agregar residente"}
            </button>
            {atLimit && (
              <span className="muted" style={{ fontSize: "13px" }}>Límite alcanzado. <Link href="/dashboard/admin-ph/subscription" style={{ textDecoration: "underline" }}>Actualice su plan</Link> para agregar más residentes.</span>
            )}
          </form>

          {isDemo && (
            <div className="owners-toolbar" style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={residents.length === 0} style={{ fontSize: "13px" }} title="Descargar lista actual en CSV">
                Exportar CSV
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleDownloadTemplate} style={{ fontSize: "13px" }} title="Descargar plantilla: correo, unidad, nombre, estado (Al Día/Mora), Face ID, Hab. asamblea">
                Plantilla para importar
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  refetchResidents();
                }}
                style={{ fontSize: "13px" }}
                title="Actualizar el listado desde la base de datos (sincronizado con el chatbot)"
              >
                Actualizar listado
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={atLimit}
                style={{ fontSize: "13px" }}
                title="Importar residentes desde un CSV con el formato de la plantilla"
              >
                Importar CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                style={{ display: "none" }}
              />
              {importSuccess && <span className="muted" style={{ fontSize: "13px" }}>{importSuccess}</span>}
            </div>
          )}
        </>
      )}

      {!organizationId && !isDemo && (
        <p className="muted" style={{ marginTop: "18px" }}>
          No hay organización seleccionada. Inicia sesión como Admin PH.
        </p>
      )}

      {(organizationId || isDemo) && loading && <p className="muted" style={{ marginTop: "18px" }}>Cargando residentes…</p>}
      {(organizationId || isDemo) && error && <p style={{ marginTop: "18px", color: "var(--color-error, #ef4444)" }}>{error}</p>}

      {(organizationId || isDemo) && !loading && !error && residents.length === 0 && activeTab === "residents" && (
        <p className="muted" style={{ marginTop: "18px" }}>No hay residentes. Agregue correos para esta {isDemo ? "demo (Urban Tower PH)" : "organización"}.</p>
      )}

      {(organizationId || isDemo) && !loading && (
        <div style={{ marginTop: "18px" }}>
          <div role="tablist" style={{ display: "flex", gap: "4px", borderBottom: "1px solid rgba(148,163,184,0.2)", marginBottom: "0" }}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "residents"}
              onClick={() => setActiveTab("residents")}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                background: activeTab === "residents" ? "rgba(148,163,184,0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "residents" ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
                color: activeTab === "residents" ? "var(--color-text, #f1f5f9)" : "#94a3b8",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
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
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                background: activeTab === "powers" ? "rgba(148,163,184,0.15)" : "transparent",
                border: "none",
                borderBottom: activeTab === "powers" ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
                color: activeTab === "powers" ? "var(--color-text, #f1f5f9)" : "#94a3b8",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
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
              <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <input
                  type="search"
                  placeholder="Buscar por correo, unidad, nombre, Nº finca o ID identidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", width: "260px", maxWidth: "100%", fontSize: "14px" }}
                />
                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as "all" | "al_dia" | "mora")} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>
                  <option value="all">Todos los estatus</option>
                  <option value="al_dia">Al Día</option>
                  <option value="mora">En Mora</option>
                </select>
                <select value={String(filterFaceId)} onChange={(e) => setFilterFaceId(e.target.value === "all" ? "all" : e.target.value === "true")} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>
                  <option value="all">Face ID: todos</option>
                  <option value="true">Face ID activo</option>
                  <option value="false">Face ID inactivo</option>
                </select>
                <select value={String(filterHabAsamblea)} onChange={(e) => setFilterHabAsamblea(e.target.value === "all" ? "all" : e.target.value === "true")} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}>
                  <option value="all">Hab. asamblea: todos</option>
                  <option value="true">Habilitado</option>
                  <option value="false">No habilitado</option>
                </select>
                <span className="muted" style={{ fontSize: "13px" }}>Mostrando {filteredResidents.length} de {residents.length}</span>
                <span className="muted" style={{ fontSize: "11px" }} title="El estatus Al Día/Mora de este listado se usa en el Monitor back office para las votaciones (quién puede votar).">Estatus ↔ Monitor votación</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setHelpModalOpen(true)}
                  style={{ marginLeft: "auto", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  title="Ver guía de uso del módulo"
                >
                  <span style={{ width: "18px", height: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--color-primary, #6366f1)", color: "#fff", fontWeight: 700, fontSize: "12px" }}>?</span>
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
            <div className="owners-list-wrap" style={{ border: "1px solid rgba(148,163,184,0.15)", borderRadius: "12px", overflow: "hidden", overflowX: "auto" }}>
              <div className="owners-list-header" style={{ display: "grid", gridTemplateColumns: "44px 80px 1fr 110px 90px 100px 110px 88px 100px 72px 140px", gap: "8px 12px", padding: "12px 14px", background: "rgba(15,23,42,0.4)", borderBottom: "1px solid rgba(148,163,184,0.2)", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", alignItems: "center", minWidth: "1024px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} aria-label="Seleccionar todos los visibles" style={{ width: "18px", height: "18px", accentColor: "var(--color-primary, #6366f1)" }} />
                </span>
                <span title="Al día o en mora (solo Al Día pueden votar, Ley 284)">Estatus</span>
                <span>Correo</span>
                <span>Nombre</span>
                <span title="Número de unidad">Unidad</span>
                <span title="Número de finca (folio real)">Nº finca</span>
                <span title="Cédula, pasaporte u otro documento de identidad">ID identidad</span>
                <span title="Cuota de asamblea">Cuota %</span>
                <span title="Habilitado para votar en la asamblea. Solo un titular por unidad en Sí; No = no vota.">Hab. asamblea (voto)</span>
                <span>Face ID</span>
                <span style={{ textAlign: "right" }}>Acciones</span>
              </div>
              <ul className="owners-list card-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {filteredResidents.map((r) => (
                  <li key={r.user_id} className="owners-list-item list-item" style={{ display: "grid", gridTemplateColumns: "44px 80px 1fr 110px 90px 100px 110px 88px 100px 72px 140px", gap: "8px 12px", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid rgba(148,163,184,0.08)", transition: "background 0.15s", minWidth: "1024px" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "44px" }}>
                      <input type="checkbox" checked={selectedIds.has(r.user_id)} onChange={() => toggleSelect(r.user_id)} aria-label={`Seleccionar ${r.email}`} style={{ width: "18px", height: "18px", accentColor: "var(--color-primary, #6366f1)" }} />
                    </span>
                    <span style={{ minWidth: "72px" }}>
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
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.email}>{r.email}</strong>
                    </div>
                    <span style={{ minWidth: "110px", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.nombre ?? ""}>{r.nombre || "—"}</span>
                    <span style={{ minWidth: "90px" }}>
                      {r.unit != null && r.unit !== "" ? (
                        isDemo ? (
                          <button type="button" onClick={() => openUnitModal(r.unit!)} className="owners-unit-link" style={{ background: "none", border: "none", padding: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #818cf8)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }} title="Abrir plantilla de la unidad">Unidad {r.unit}</button>
                        ) : (
                          <span style={{ fontSize: "13px", fontWeight: 500 }}>Unidad {r.unit}</span>
                        )
                      ) : (
                        <span className="muted" style={{ fontSize: "12px" }}>—</span>
                      )}
                    </span>
                    <span style={{ minWidth: "100px", fontVariantNumeric: "tabular-nums", fontSize: "13px" }} title={r.numero_finca ?? ""}>{r.numero_finca ?? "—"}</span>
                    <span style={{ minWidth: "110px", fontVariantNumeric: "tabular-nums", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.cedula_identidad ?? ""}>{r.cedula_identidad ?? "—"}</span>
                    <span style={{ minWidth: "88px", fontVariantNumeric: "tabular-nums", fontSize: "14px", fontWeight: 600 }}>{r.cuota_pct != null ? `${r.cuota_pct} %` : "—"}</span>
                    <span style={{ minWidth: "100px", fontSize: "13px" }} title={r.habilitado_para_asamblea ? "Este residente está habilitado para votar en la asamblea." : "No habilitado para votar en esta asamblea (solo uno por unidad puede estar en Sí)."}>{r.habilitado_para_asamblea ? "Sí" : "No"}</span>
                    <span style={{ minWidth: "72px", fontSize: "13px" }}>{r.face_id_enabled ? "Sí" : "No"}</span>
                    <span style={{ minWidth: "100px", textAlign: "right", display: "flex", gap: "4px", justifyContent: "flex-end", flexWrap: "wrap" }}>
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
