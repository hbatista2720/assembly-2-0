"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  getDemoResidents,
  addDemoResident,
  removeDemoResident,
  updateDemoResidentFaceId,
  updateDemoResident,
  setDemoResidentHabilitadoParaAsamblea,
  exportDemoResidentsCsv,
  getImportTemplateCsv,
  importDemoResidentsFromCsv,
  getResidentsByUnit,
  updateUnitTemplate,
  isDemoResidentsContext,
  resetDemoResidents,
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
};

const DEFAULT_RESIDENT_LIMIT = 250;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { limits } = useUpgradeBanner(subscriptionId);

  useEffect(() => {
    const orgId = typeof window !== "undefined" ? localStorage.getItem("assembly_organization_id") : null;
    const subId = typeof window !== "undefined" ? localStorage.getItem("assembly_subscription_id") : null;
    setOrganizationId(orgId);
    setSubscriptionId(subId);
    setIsDemo(isDemoResidentsContext());
  }, []);

  useEffect(() => {
    if (isDemo) {
      try {
        setResidents(getDemoResidents());
        setError("");
      } catch {
        setError("Error al cargar residentes demo.");
        setResidents([]);
      }
      setLoading(false);
      return;
    }
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/admin-ph/residents?organization_id=${encodeURIComponent(organizationId)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Error al cargar"))))
      .then((data) => {
        setResidents(Array.isArray(data?.residents) ? data.residents : []);
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
  }, [organizationId, isDemo]);

  const refreshDemoResidents = () => {
    if (!isDemo) return;
    try {
      setResidents(() => [...getDemoResidents()]);
    } catch {
      setResidents([]);
    }
  };

  const handleToggleHabilitadoAsamblea = (userId: string, current: boolean) => {
    if (!isDemo || updatingId) return;
    setUpdatingId(userId);
    setDemoResidentHabilitadoParaAsamblea(userId, !current);
    refreshDemoResidents();
    setUpdatingId(null);
  };

  const handleToggleFaceId = (userId: string, current: boolean) => {
    if (isDemo) {
      if (updatingId) return;
      setUpdatingId(userId);
      updateDemoResidentFaceId(userId, !current);
      refreshDemoResidents();
      setUpdatingId(null);
      return;
    }
    if (!organizationId || updatingId) return;
    setUpdatingId(userId);
    fetch(`/api/admin-ph/residents/${userId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: organizationId, face_id_enabled: !current }),
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
    if (isDemo) {
      if (!newEmail.trim() || adding) return;
      setAdding(true);
      setError("");
      const result = addDemoResident(newEmail.trim());
      if (result.ok) {
        setResidents((prev) => [...prev, result.resident]);
        setNewEmail("");
      } else {
        setError(result.error);
      }
      setAdding(false);
      return;
    }
    if (!organizationId || !newEmail.trim() || adding) return;
    if (residents.length >= residentLimit) {
      setError(`Su plan permite hasta ${residentLimit} residentes. Actualice el plan para agregar más.`);
      return;
    }
    setAdding(true);
    setError("");
    fetch("/api/admin-ph/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: organizationId, email: newEmail.trim().toLowerCase() }),
    })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (res.ok) {
          setResidents((prev) => [...prev, { user_id: data.user_id, email: data.email, face_id_enabled: true }]);
          setNewEmail("");
        } else {
          setError(data?.error || "Error al agregar residente");
        }
      })
      .catch(() => setError("Error al agregar residente"))
      .finally(() => setAdding(false));
  };

  const handleRemoveResident = (userId: string) => {
    if (isDemo) {
      if (!confirm("¿Quitar a este residente de la lista?")) return;
      removeDemoResident(userId);
      refreshDemoResidents();
      return;
    }
    if (!organizationId || !confirm("¿Eliminar residente de la organización?")) return;
    fetch(`/api/admin-ph/residents/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: organizationId }),
    })
      .then((res) => {
        if (res.ok) setResidents((prev) => prev.filter((r) => r.user_id !== userId));
        else res.json().then((d) => setError(d?.error || "No se pudo eliminar"));
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
        setResidents(getDemoResidents());
        setImportSuccess(`Se importaron ${result.count} residente(s).`);
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
    const cuota = editModalForm.cuota_pct.trim() ? parseFloat(editModalForm.cuota_pct.replace(",", ".")) : undefined;
    const ok = updateDemoResident(r.user_id, {
      email: editModalForm.email.trim() || undefined,
      nombre: editModalForm.nombre.trim() || undefined,
      unit: editModalForm.unit.trim() || undefined,
      cuota_pct: Number.isFinite(cuota) ? cuota : undefined,
      numero_finca: editModalForm.numero_finca.trim() || undefined,
      cedula_identidad: editModalForm.cedula_identidad.trim() || undefined,
      payment_status: editModalForm.payment_status,
      face_id_enabled: editModalForm.face_id_enabled,
      habilitado_para_asamblea: editModalForm.habilitado_para_asamblea,
    });
    if (ok) {
      setDemoResidentHabilitadoParaAsamblea(r.user_id, editModalForm.habilitado_para_asamblea);
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

  const saveUnitTemplate = () => {
    if (!unitModalUnit || !isDemo || savingUnit) return;
    setSavingUnit(true);
    setError("");
    const result = updateUnitTemplate(unitModalUnit, {
      titular_1_email: unitForm.titular_1_email,
      titular_2_email: unitForm.titular_2_email || undefined,
      habilitado_titular_1: unitForm.habilitado_titular_1,
      habilitado_titular_2: unitForm.habilitado_titular_2,
    });
    setSavingUnit(false);
    if (result.ok) {
      setResidents(getDemoResidents());
      closeUnitModal();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="card">
      <style>{`
        .owners-list-wrap .owners-list-item:hover { background: rgba(148,163,184,0.06); }
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
            {isDemo && !atLimit && <code>residente.Urban1@demo.assembly2.com</code>}
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
              placeholder="Correo del residente (ej. residente.Urban1@demo.assembly2.com)"
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
                if (typeof window !== "undefined" && window.confirm("¿Restablecer el listado demo? Se borrarán sus cambios y se cargarán de nuevo los 50 residentes por defecto.")) {
                  resetDemoResidents();
                  setResidents(() => [...getDemoResidents()]);
                }
              }}
                style={{ fontSize: "13px" }}
                title="Borrar datos del listado demo y volver a los 50 residentes por defecto"
              >
                Restablecer listado demo
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
            <div className="card" style={{ marginTop: "12px", padding: "24px", background: "rgba(15,23,42,0.3)", borderRadius: "12px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>Gestión y solicitudes de poderes de asamblea</h3>
              <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
                Aquí podrá gestionar los poderes otorgados por los residentes para representación en asambleas y consultar solicitudes pendientes. (Próximamente.)
              </p>
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
              </div>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "12px" }}>
                <strong>Hab. asamblea</strong> = habilitado para votar en la asamblea (solo uno por unidad puede estar en Sí). <strong>No</strong> = no vota en esta asamblea. El estatus <strong>Al Día / En Mora</strong> se sincroniza con el Monitor de votación.
              </p>
            <div className="owners-list-wrap" style={{ border: "1px solid rgba(148,163,184,0.15)", borderRadius: "12px", overflow: "hidden", overflowX: "auto" }}>
              <div className="owners-list-header" style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 100px 110px 88px 100px 72px 140px", gap: "8px 12px", padding: "12px 14px", background: "rgba(15,23,42,0.4)", borderBottom: "1px solid rgba(148,163,184,0.2)", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", alignItems: "center", minWidth: "980px" }}>
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
                  <li key={r.user_id} className="owners-list-item list-item" style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 100px 110px 88px 100px 72px 140px", gap: "8px 12px", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid rgba(148,163,184,0.08)", transition: "background 0.15s", minWidth: "980px" }}>
                    <span style={{ minWidth: "72px" }}>
                      {isDemo ? (
                        <select
                          value={r.payment_status === "mora" ? "mora" : "al_dia"}
                          onChange={(e) => {
                            const v = e.target.value as "al_dia" | "mora";
                            if (v === r.payment_status) return;
                            updateDemoResident(r.user_id, { payment_status: v });
                            if (v === "mora") setDemoResidentHabilitadoParaAsamblea(r.user_id, false);
                            // Forzar lectura del store y nueva referencia para que la columna Hab. asamblea se actualice
                            setResidents(() => [...getDemoResidents()]);
                          }}
                          style={{ padding: "4px 6px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: r.payment_status === "mora" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: r.payment_status === "mora" ? "#f87171" : "#4ade80", border: "1px solid transparent", cursor: "pointer", minWidth: "72px" }}
                          title="Al día / En Mora. Cambiar actualiza Hab. asamblea."
                        >
                          <option value="al_dia">Al día</option>
                          <option value="mora">En Mora</option>
                        </select>
                      ) : r.payment_status === "mora" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="En mora"><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f87171" }} aria-hidden /><span style={{ fontSize: "11px", fontWeight: 600, color: "#f87171" }}>Mora</span></span>
                      ) : r.payment_status === "al_dia" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="Al día"><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} aria-hidden /><span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80" }}>Al día</span></span>
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
                      <button type="button" className="btn btn-ghost" style={{ color: "var(--color-error, #ef4444)", padding: "6px 8px", minWidth: "32px" }} onClick={() => handleRemoveResident(r.user_id)} title="Eliminar"><IconTrash /></button>
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
                  <input type="text" className="create-ph-input" value={editModalForm.unit} onChange={(e) => setEditModalForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Ej. 101" />
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
