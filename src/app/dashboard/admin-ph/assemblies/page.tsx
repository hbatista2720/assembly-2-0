"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createAssembly, getAssemblies, updateAssembly, deleteAssembly, isAssemblyCelebrated, findAssembly, resetDemoAssemblies, isDemoUserExport } from "../../../../lib/assembliesStore";
import type { TopicApprovalType, AssemblyType } from "../../../../lib/assembliesStore";

type FilterStatus = "" | "Programada" | "En vivo" | "Completada";
type FilterType = "" | AssemblyType;

/** Opciones de tipo de aprobación por tema (Ley 284 – Marketing). */
const APPROVAL_TYPE_OPTIONS: { value: TopicApprovalType; label: string }[] = [
  { value: "informativo", label: "Informativo (sin votación)" },
  { value: "votacion_simple", label: "Mayoría simple (51%)" },
  { value: "votacion_calificada", label: "Mayoría calificada (66%)" },
  { value: "votacion_reglamento", label: "Mayoría reglamento (según Reglamento)" },
];

/** Sugiere tipo de aprobación según el título del tema (Marketing). */
function suggestApprovalType(title: string): TopicApprovalType {
  const t = title.trim().toLowerCase();
  if (!t) return "votacion_simple";
  if (/\b(acta|informe|informativ)\b/.test(t)) return "informativo";
  if (/\b(presupuesto|cuota extraordinaria|elección|junta|proyecto|mejora|mantenimiento|obras?)\b/.test(t)) return "votacion_simple";
  if (/\b(estructura|cálculo|modificación de cuotas|cuotas de gastos)\b/.test(t)) return "votacion_calificada";
  if (/\b(reglamento|copropiedad)\b/.test(t)) return "votacion_reglamento";
  return "votacion_simple";
}

/** Etiqueta de tipo de asamblea para mostrar (Especial + texto manual o solo tipo). */
function getAssemblyTypeLabel(assembly: { type: AssemblyType; typeCustom?: string }): string {
  if (assembly.type === "Especial" && assembly.typeCustom?.trim()) return assembly.typeCustom.trim();
  if (assembly.type === "Especial") return "Especial";
  return assembly.type;
}

const KANBAN_COLUMNS = [
  { id: "Programada", label: "Programadas", icon: "📋" },
  { id: "En vivo", label: "En vivo", icon: "🔴" },
  { id: "Completada", label: "Completadas", icon: "✅" },
] as const;

const CONFIRM_DELETE_WORD = "eliminar";
const CONFIRM_RESET_DEMO_WORD = "restablecer";

type ViewMode = "list" | "kanban";

export default function AssembliesPage() {
  const [assemblies, setAssemblies] = useState(() => []);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [form, setForm] = useState<{
    title: string;
    type: AssemblyType;
    typeCustom: string;
    date: string;
    location: string;
    orderOfDay: string;
    secondCallWarning: boolean;
    mode: "Presencial" | "Virtual" | "Mixta";
    meetingLink: string;
    topics: { id: string; title: string; approvalType: TopicApprovalType }[];
  }>({
    title: "",
    type: "Ordinaria",
    typeCustom: "",
    date: "",
    location: "",
    orderOfDay: "",
    secondCallWarning: true,
    mode: "Presencial",
    meetingLink: "",
    topics: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [actaInmediataModal, setActaInmediataModal] = useState<{ assemblyId: string; title: string } | null>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showResetDemoModal, setShowResetDemoModal] = useState(false);
  const [resetDemoConfirmText, setResetDemoConfirmText] = useState("");
  const [detailModalTab, setDetailModalTab] = useState<"resumen" | "reprogramar" | "editar">("resumen");
  const [quickEdit, setQuickEdit] = useState({ title: "", date: "", location: "" });
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const [filterType, setFilterType] = useState<FilterType>("");
  const [filterSearch, setFilterSearch] = useState("");
  const filtersPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFiltersPanel && filtersPanelRef.current && !filtersPanelRef.current.contains(e.target as Node)) {
        setShowFiltersPanel(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showFiltersPanel]);

  const filteredAssemblies = useMemo(() => {
    return assemblies.filter((a) => {
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterType && a.type !== filterType) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.trim().toLowerCase();
        if (!a.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [assemblies, filterStatus, filterType, filterSearch]);

  const upcoming = useMemo(
    () => filteredAssemblies.filter((assembly) => assembly.status !== "Completada"),
    [filteredAssemblies],
  );
  const completed = useMemo(
    () => filteredAssemblies.filter((assembly) => assembly.status === "Completada"),
    [filteredAssemblies],
  );

  const byColumn = useMemo(() => {
    const map: Record<string, typeof filteredAssemblies> = { Programada: [], "En vivo": [], Completada: [] };
    filteredAssemblies.forEach((a) => {
      const status = a.status as keyof typeof map;
      if (map[status]) map[status].push(a);
    });
    return map;
  }, [filteredAssemblies]);

  const hasActiveFilters = Boolean(filterStatus || filterType || filterSearch.trim());
  const clearFilters = () => {
    setFilterStatus("");
    setFilterType("");
    setFilterSearch("");
  };

  /** Días mínimos de anticipación por tipo (Ley 284). Por derecho propio = residentes, 3-5 días. */
  const getMinDaysForType = (type: AssemblyType): number => {
    if (type === "Especial") return 0;
    if (type === "Extraordinaria") return 3;
    if (type === "Por derecho propio") return 3; // Por los residentes (3-5 días)
    return 10; // Ordinaria
  };

  const getMinDateForType = (type: AssemblyType) => {
    if (type === "Especial") return "";
    const now = new Date();
    const days = getMinDaysForType(type);
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getSuggestedDates = (type: AssemblyType): string[] => {
    const base = new Date();
    if (type === "Especial") {
      return [0, 1, 3, 7, 14].map((offset) => {
        const d = new Date(base);
        d.setDate(d.getDate() + offset);
        d.setHours(18, 0, 0, 0);
        return d.toISOString().slice(0, 16);
      });
    }
    const minDays = getMinDaysForType(type);
    return [0, 2, 4, 7, 10].map((offset) => {
      const d = new Date(base);
      d.setDate(d.getDate() + minDays + offset);
      d.setHours(18, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    });
  };

  const suggestedDates = useMemo(() => getSuggestedDates(form.type), [form.type]);

  const handleCreate = () => {
    setFormError(null);
    if (!form.title?.trim()) {
      setFormError("El título es obligatorio.");
      return;
    }
    if (!form.date) {
      setFormError("La fecha y hora son obligatorias.");
      return;
    }
    if (!form.orderOfDay?.trim()) {
      setFormError("El orden del día (agenda) es obligatorio (Ley 284).");
      return;
    }
    if (form.type !== "Especial") {
      const minDays = getMinDaysForType(form.type);
      const assemblyDate = new Date(form.date);
      const now = new Date();
      const minDate = new Date(now);
      minDate.setDate(minDate.getDate() + minDays);
      minDate.setHours(0, 0, 0, 0);
      if (assemblyDate < minDate) {
        setFormError(
          `Para asamblea ${form.type}, la convocatoria debe realizarse con al menos ${minDays} días de anticipación. Fecha mínima: ${minDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}.`
        );
        return;
      }
    }
    const topics = form.topics
      .filter((t) => t.title.trim())
      .map((t) => ({ id: t.id, title: t.title.trim(), type: t.approvalType as TopicApprovalType }));
    const newAssembly = createAssembly({
      title: form.title.trim(),
      type: form.type,
      typeCustom: form.type === "Especial" ? form.typeCustom?.trim() || undefined : undefined,
      date: form.date,
      location: form.location?.trim() || "Salón principal",
      orderOfDay: form.orderOfDay.trim(),
      secondCallWarning: form.secondCallWarning,
      mode: form.mode,
      meetingLink: form.meetingLink?.trim() || undefined,
      attendeesCount: 200,
      faceIdCount: 130,
      topics,
    });
    setAssemblies((prev) => [newAssembly, ...prev]);
    setForm({
      title: "",
      type: "Ordinaria",
      typeCustom: "",
      date: "",
      location: "",
      orderOfDay: "",
      secondCallWarning: true,
      mode: "Presencial",
      meetingLink: "",
      topics: [],
    });
    setShowForm(false);
  };

  const moveToStatus = (assemblyId: string, newStatus: "Programada" | "En vivo" | "Completada") => {
    const assembly = findAssembly(assemblyId);
    const updated = updateAssembly(assemblyId, (a) => ({ ...a, status: newStatus }));
    if (updated) {
      setAssemblies(getAssemblies());
      if (newStatus === "Completada" && assembly) {
        setActaInmediataModal({ assemblyId, title: assembly.title });
      }
    }
  };

  const handleDelete = (assemblyId: string) => {
    setDeleteModalId(assemblyId);
    setDeleteConfirmText("");
  };

  const confirmDeleteFromModal = () => {
    if (!deleteModalId) return;
    const a = assemblies.find((x) => x.id === deleteModalId);
    if (a && isAssemblyCelebrated(a)) return;
    if (deleteConfirmText.trim().toLowerCase() !== CONFIRM_DELETE_WORD) return;
    const deleted = deleteAssembly(deleteModalId);
    if (deleted) {
      setAssemblies(getAssemblies());
      setDeleteModalId(null);
      setDeleteConfirmText("");
    }
  };

  const openDetailModal = (assemblyId: string) => {
    const a = findAssembly(assemblyId);
    setDetailModalId(assemblyId);
    setDetailModalTab("resumen");
    if (a) {
      setQuickEdit({ title: a.title, date: a.date.slice(0, 16), location: a.location });
      setRescheduleDate(a.date.slice(0, 16));
    }
  };

  const saveQuickEdit = () => {
    if (!detailModalId) return;
    updateAssembly(detailModalId, (a) => ({
      ...a,
      title: quickEdit.title,
      date: quickEdit.date,
      location: quickEdit.location,
    }));
    setAssemblies(getAssemblies());
    setDetailModalTab("resumen");
  };

  const saveReschedule = () => {
    if (!detailModalId) return;
    updateAssembly(detailModalId, (a) => ({ ...a, date: rescheduleDate }));
    setAssemblies(getAssemblies());
    setDetailModalTab("resumen");
  };

  const formatCalendarDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr.replace("T", " ");
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  return (
    <div className="card assemblies-page-card">
      <div className="assemblies-page-header">
        <div className="assemblies-page-header-content">
          <h2 style={{ marginTop: 0 }}>Asambleas</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            Crear, programar y ejecutar asambleas en vivo.
          </p>
        </div>
        <div className="assemblies-page-toolbar">
          <div className="assemblies-view-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              Lista
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "kanban"}
              className={viewMode === "kanban" ? "active" : ""}
              onClick={() => setViewMode("kanban")}
            >
              Kanban
            </button>
          </div>
          <div style={{ position: "relative" }} ref={filtersPanelRef}>
            <button
              type="button"
              className={`btn ${showFiltersPanel || hasActiveFilters ? "btn-primary" : ""}`}
              onClick={(e) => { e.stopPropagation(); setShowFiltersPanel((v) => !v); }}
              title={hasActiveFilters ? "Filtros activos" : "Abrir filtros"}
            >
              Filtros {hasActiveFilters ? `(${filteredAssemblies.length}/${assemblies.length})` : ""}
            </button>
            {showFiltersPanel && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "8px",
                  minWidth: "280px",
                  padding: "16px",
                  zIndex: 50,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 style={{ margin: "0 0 12px", fontSize: "14px" }}>Filtrar asambleas</h4>
                <label style={{ display: "block", marginBottom: "12px" }}>
                  <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Estado</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "10px" }}
                  >
                    <option value="">Todos</option>
                    <option value="Programada">Programadas</option>
                    <option value="En vivo">En vivo</option>
                    <option value="Completada">Completadas</option>
                  </select>
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                  <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Tipo</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "10px" }}
                  >
                    <option value="">Todos</option>
                    <option value="Ordinaria">Ordinaria</option>
                    <option value="Extraordinaria">Extraordinaria</option>
                    <option value="Por derecho propio">Por derecho propio</option>
                    <option value="Especial">Especial</option>
                  </select>
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                  <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Buscar por título</span>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Ej. Ordinaria 2026"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", boxSizing: "border-box" }}
                  />
                </label>
                {hasActiveFilters && (
                  <button type="button" className="btn btn-ghost" onClick={clearFilters} style={{ width: "100%", marginTop: "4px" }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
          {isDemoUserExport() && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowResetDemoModal(true)}
              title="Borrar asambleas guardadas y volver a las 2 por defecto"
            >
              Restablecer asambleas demo
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear asamblea
          </button>
        </div>
      </div>

      {showForm && (
        <div className="create-ph-form card" style={{ marginTop: "16px" }}>
          <div className="create-ph-form-header">
            <h3 className="create-ph-form-title">Nueva asamblea</h3>
            <p className="create-ph-form-desc muted">
              Campos conforme Ley 284 (Panamá). Fecha en formato dd/mm/aaaa, hora 24h.
            </p>
          </div>
          {formError && (
            <p style={{ color: "var(--color-error, #ef4444)", fontSize: "13px", margin: "0 0 16px" }}>{formError}</p>
          )}
          <div className="create-ph-form-fields">
            <label className="create-ph-field">
              <span className="create-ph-label">Título</span>
              <input
                type="text"
                className="create-ph-input"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej. Asamblea Ordinaria 2026"
              />
            </label>
            <div className="create-ph-field-row">
              <label className="create-ph-field create-ph-field--narrow">
                <span className="create-ph-label">Tipo de asamblea</span>
                <select
                  className="create-ph-input create-ph-select"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AssemblyType }))}
                >
                  <option value="Ordinaria">Ordinaria (Ley 284, mín. 10 días)</option>
                  <option value="Extraordinaria">Extraordinaria (Ley 284, mín. 3 días)</option>
                  <option value="Por derecho propio">Por derecho propio (3-5 días)</option>
                  <option value="Especial">Especial</option>
                </select>
              </label>
              <label className="create-ph-field create-ph-field--narrow">
                <span className="create-ph-label">Fecha y hora</span>
                <input
                  type="datetime-local"
                  className="create-ph-input"
                  value={form.date}
                  min={getMinDateForType(form.type)}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                <span className="muted" style={{ fontSize: "12px", display: "block", marginTop: "6px" }}>
                  {form.type === "Especial" ? "Fechas sugeridas (sin plazo legal):" : "Fechas sugeridas (Ley 284):"}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {suggestedDates.map((iso) => {
                    const d = new Date(iso);
                    const label = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    return (
                      <button
                        key={iso}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setForm((prev) => ({ ...prev, date: iso }))}
                        style={{ fontSize: "11px" }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </label>
            </div>
            {form.type === "Especial" && (
              <label className="create-ph-field">
                <span className="create-ph-label">Tipo de asamblea (escribir manualmente)</span>
                <input
                  type="text"
                  className="create-ph-input"
                  value={form.typeCustom}
                  onChange={(e) => setForm((prev) => ({ ...prev, typeCustom: e.target.value }))}
                  placeholder="Ej. Por derecho propio, 20% de propietarios al día (Ley 284)"
                />
                <span className="muted" style={{ fontSize: "12px", display: "block", marginTop: "6px" }}>
                  Agregar con un clic:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setForm((prev) => ({ ...prev, typeCustom: "Por derecho propio" }))}
                  >
                    Por derecho propio
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setForm((prev) => ({ ...prev, typeCustom: "20% de propietarios al día" }))}
                  >
                    20% de propietarios al día
                  </button>
                </div>
              </label>
            )}
            <label className="create-ph-field">
              <span className="create-ph-label">Orden del día (agenda) <span className="create-ph-required">*</span></span>
              <textarea
                className="create-ph-input"
                value={form.orderOfDay}
                onChange={(e) => setForm((prev) => ({ ...prev, orderOfDay: e.target.value }))}
                placeholder="Temas específicos de la asamblea. Solo pueden votarse temas incluidos aquí (Ley 284)."
                rows={3}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </label>
            <div className="create-ph-field">
              <span className="create-ph-label">Temas para votación (tipo de aprobación por tema)</span>
              <p className="muted" style={{ fontSize: "12px", margin: "0 0 10px" }}>
                Opcional. Defina cada tema y el % requerido (Ley 284). Se sugiere automáticamente según el nombre.
              </p>
              {form.topics.map((topic) => (
                <div
                  key={topic.id}
                  style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}
                >
                  <input
                    type="text"
                    className="create-ph-input"
                    placeholder="Ej. Aprobación presupuesto 2026"
                    value={topic.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        topics: prev.topics.map((t) =>
                          t.id === topic.id ? { ...t, title } : t
                        ),
                      }));
                    }}
                    onBlur={() => {
                      const suggested = suggestApprovalType(topic.title);
                      if (topic.approvalType !== suggested) {
                        setForm((prev) => ({
                          ...prev,
                          topics: prev.topics.map((t) =>
                            t.id === topic.id ? { ...t, approvalType: suggested } : t
                          ),
                        }));
                      }
                    }}
                    style={{ flex: "1 1 200px", minWidth: "140px", boxSizing: "border-box" }}
                  />
                  <select
                    className="create-ph-input create-ph-select"
                    value={topic.approvalType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        topics: prev.topics.map((t) =>
                          t.id === topic.id ? { ...t, approvalType: e.target.value as TopicApprovalType } : t
                        ),
                      }))
                    }
                    style={{ width: "220px" }}
                  >
                    {APPROVAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setForm((prev) => ({ ...prev, topics: prev.topics.filter((t) => t.id !== topic.id) }))}
                    aria-label="Quitar tema"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    topics: [...prev.topics, { id: `topic_${Date.now()}_${Math.random().toString(16).slice(2)}`, title: "", approvalType: "votacion_simple" }],
                  }))
                }
              >
                + Añadir tema
              </button>
            </div>
            <div className="create-ph-field-row">
              <label className="create-ph-field create-ph-field--narrow">
                <span className="create-ph-label">Ubicación</span>
                <input
                  type="text"
                  className="create-ph-input"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Salón principal o enlace"
                />
              </label>
              <label className="create-ph-field create-ph-field--narrow">
                <span className="create-ph-label">Modo</span>
                <select
                  className="create-ph-input create-ph-select"
                  value={form.mode}
                  onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value as "Presencial" | "Virtual" | "Mixta" }))}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </label>
            </div>
            {(form.mode === "Virtual" || form.mode === "Mixta") && (
              <label className="create-ph-field">
                <span className="create-ph-label">Enlace de reunión</span>
                <input
                  type="url"
                  className="create-ph-input"
                  value={form.meetingLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.example.com/..."
                />
              </label>
            )}
            <label className="create-ph-field" style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={form.secondCallWarning}
                onChange={(e) => setForm((prev) => ({ ...prev, secondCallWarning: e.target.checked }))}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-primary, #6366f1)" }}
              />
              <span className="create-ph-label" style={{ marginBottom: 0 }}>
                Advertencia segundo llamado: si no hay quórum, segundo llamado 1h después (Ley 284)
              </span>
            </label>
          </div>
          <div className="create-ph-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setFormError(null); }}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate}>
              Guardar asamblea
            </button>
          </div>
        </div>
      )}

      {viewMode === "kanban" ? (
        <div style={{ marginTop: "20px" }}>
          {filteredAssemblies.length === 0 ? (
            <div className="card assemblies-empty-state" style={{ padding: "28px 24px", textAlign: "center" }}>
              {hasActiveFilters ? (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--color-text, #f1f5f9)" }}>
                    No hay asambleas que coincidan con los filtros
                  </p>
                  <p className="muted" style={{ margin: "0 0 20px", fontSize: "13px" }}>
                    Prueba con otros criterios o limpia los filtros.
                  </p>
                  <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--color-text, #f1f5f9)" }}>
                    Aún no hay asambleas creadas
                  </p>
                  <p className="muted" style={{ margin: "0 0 20px", fontSize: "13px" }}>
                    Crea una asamblea o abre el Monitor Back Office en modo demo para ver el panel en vivo.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                    <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
                      Crear asamblea
                    </button>
                    <Link className="btn btn-ghost" href="/dashboard/admin-ph/monitor">
                      Ir a Monitor Back Office
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
        <div className="assemblies-kanban">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">{col.icon}</span>
                <span className="kanban-column-title">{col.label}</span>
                <span className="kanban-column-count">{(byColumn[col.id] || []).length}</span>
              </div>
              <div className="kanban-column-cards">
                {(byColumn[col.id] || []).map((item) => (
                  <div key={item.id} className="kanban-card">
                    <span className="kanban-card-pill">{getAssemblyTypeLabel(item)}</span>
                    <h4 className="kanban-card-title">{item.title}</h4>
                    <div className="kanban-card-calendar" title={formatCalendarDate(item.date)}>
                      <span className="kanban-calendar-icon">📅</span>
                      <span>{formatShortDate(item.date)}</span>
                    </div>
                    <p className="kanban-card-meta muted">
                      {item.date.replace("T", " ")} · {item.attendeesCount} electores · {item.faceIdCount} Face ID
                    </p>
                    <div className="kanban-card-actions">
                      <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(item.id)}`} scroll={true}>
                        Ver detalles
                      </Link>
                      {item.status !== "Completada" && (
                        <>
                          <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(item.id)}`} scroll={true}>
                            Editar
                          </Link>
                          <a className="btn btn-primary btn-sm" href={`/dashboard/admin-ph/assembly/${encodeURIComponent(item.id)}/live`}>
                            Iniciar asamblea
                          </a>
                          <a className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(item.id)}`}>
                            Monitor Back Office
                          </a>
                          <button type="button" className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => handleDelete(item.id)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                    {item.status !== "Completada" && (
                      <div className="kanban-card-move">
                        <span className="muted" style={{ fontSize: "11px" }}>Mover a:</span>
                        {KANBAN_COLUMNS.filter((c) => c.id !== item.status).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => moveToStatus(item.id, c.id as "Programada" | "En vivo" | "Completada")}
                          >
                            {c.icon} {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
          )}
        </div>
      ) : (
        <>
          {upcoming.length === 0 && completed.length === 0 ? (
            <div className="card assemblies-empty-state" style={{ marginTop: "18px", padding: "28px 24px", textAlign: "center" }}>
              {hasActiveFilters ? (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--color-text, #f1f5f9)" }}>
                    No hay asambleas que coincidan con los filtros
                  </p>
                  <p className="muted" style={{ margin: "0 0 20px", fontSize: "13px" }}>
                    Prueba con otros criterios o limpia los filtros.
                  </p>
                  <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--color-text, #f1f5f9)" }}>
                    Aún no hay asambleas creadas
                  </p>
                  <p className="muted" style={{ margin: "0 0 20px", fontSize: "13px" }}>
                    Crea una asamblea o abre el Monitor Back Office en modo demo para ver el panel en vivo.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                    <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
                      Crear asamblea
                    </button>
                    <Link className="btn btn-ghost" href="/dashboard/admin-ph/monitor">
                      Ir a Monitor Back Office
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="assembly-cards-grid">
              {upcoming.map((item) => (
                <div key={item.id} className="assembly-card-widget">
                  <div className="assembly-card-widget-header">
                    <span className="assembly-card-widget-type">{getAssemblyTypeLabel(item)}</span>
                    <span className="assembly-card-widget-date">📅 {formatShortDate(item.date)}</span>
                  </div>
                  <h4 className="assembly-card-widget-title">{item.title}</h4>
                  <div className="assembly-card-widget-meta">
                    <span>{item.attendeesCount} electores</span>
                    <span>·</span>
                    <span>{item.faceIdCount} Face ID</span>
                    <span>·</span>
                    <span>{item.date.replace("T", " ")}</span>
                  </div>
                  <div className="assembly-card-widget-actions">
                    <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(item.id)}`} scroll={true}>
                      Ver detalles
                    </Link>
                    <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(item.id)}`} scroll={true}>
                      Editar
                    </Link>
                    <a className="btn btn-primary btn-sm" href={`/dashboard/admin-ph/assembly/${encodeURIComponent(item.id)}/live`}>
                      Iniciar asamblea
                    </a>
                    <a className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(item.id)}`}>
                      Monitor Back Office
                    </a>
                    <button type="button" className="btn btn-ghost btn-sm assembly-card-delete" onClick={() => handleDelete(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="assembly-completed-section">
            <h3 style={{ margin: "0 0 10px" }}>Completadas</h3>
            <p className="muted" style={{ margin: "0 0 14px", fontSize: "13px" }}>
              Asambleas celebradas: no se pueden editar, eliminar ni reprogramar (crédito consumido).
            </p>
            <div className="assembly-cards-grid assembly-cards-grid--completed">
              {completed.map((item) => (
                <div key={item.id} className="assembly-card-widget assembly-card-widget--completed">
                  <div className="assembly-card-widget-header">
                    <span className="assembly-card-widget-badge">✅</span>
                    <span className="assembly-card-widget-date">{formatShortDate(item.date)}</span>
                  </div>
                  <h4 className="assembly-card-widget-title">{item.title}</h4>
                  <p className="assembly-card-widget-meta muted">Acta generada</p>
                  <Link className="btn btn-ghost btn-sm" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(item.id)}`} scroll={true}>
                    Ver detalles
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {detailModalId && (() => {
        const a = findAssembly(detailModalId);
        if (!a) return null;
        const celebrated = isAssemblyCelebrated(a);
        return (
          <div className="kanban-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="kanban-detail-title" onClick={() => setDetailModalId(null)}>
            <div className="kanban-modal" onClick={(e) => e.stopPropagation()}>
              <div className="kanban-modal-header">
                <h3 id="kanban-detail-title">Detalle de asamblea</h3>
                <button type="button" className="kanban-modal-close" onClick={() => setDetailModalId(null)} aria-label="Cerrar">×</button>
              </div>
              <div className="kanban-modal-tabs">
                <button type="button" className={detailModalTab === "resumen" ? "active" : ""} onClick={() => setDetailModalTab("resumen")}>Resumen</button>
                {!celebrated && <button type="button" className={detailModalTab === "reprogramar" ? "active" : ""} onClick={() => { setDetailModalTab("reprogramar"); setRescheduleDate(a.date.slice(0, 16)); }}>Reprogramar</button>}
                {!celebrated && <button type="button" className={detailModalTab === "editar" ? "active" : ""} onClick={() => { setDetailModalTab("editar"); setQuickEdit({ title: a.title, date: a.date.slice(0, 16), location: a.location }); }}>Edición rápida</button>}
              </div>
              {detailModalTab === "resumen" && (
                <div className="kanban-modal-body">
                  <div className="kanban-detail-calendar">
                    <span className="kanban-detail-calendar-icon">📅</span>
                    <div>
                      <div className="kanban-detail-date">{formatCalendarDate(a.date)}</div>
                      <div className="muted" style={{ fontSize: "12px" }}>Fecha de la asamblea</div>
                    </div>
                  </div>
                  <p><span className="pill">{getAssemblyTypeLabel(a)}</span> <strong>{a.title}</strong></p>
                  <p className="muted">{a.location} · {a.attendeesCount} electores · {a.faceIdCount} Face ID</p>
                  <p className="muted">Estado: {a.status}</p>
                  {a.topics.length > 0 && (
                    <>
                      <h4 style={{ margin: "12px 0 6px", fontSize: "14px" }}>Temas de votación</h4>
                      <ul style={{ margin: 0, paddingLeft: "20px" }}>
                        {a.topics.map((t) => (
                          <li key={t.id}>{t.title} {t.votingOpen && <span className="pill" style={{ fontSize: "10px" }}>Abierta</span>}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <a className="btn btn-primary" href={`/dashboard/admin-ph/assembly/${encodeURIComponent(a.id)}/live`}>Iniciar asamblea</a>
                    <a className="btn btn-ghost" href={`/dashboard/admin-ph/monitor/${encodeURIComponent(a.id)}`}>Monitor Back Office</a>
                    <a className="btn btn-ghost" href={`/dashboard/admin-ph/assemblies/${encodeURIComponent(a.id)}`}>Ver página completa</a>
                  </div>
                </div>
              )}
              {detailModalTab === "reprogramar" && !celebrated && (
                <div className="kanban-modal-body">
                  <label className="list-item" style={{ alignItems: "center" }}>
                    <span>Nueva fecha y hora</span>
                    <input type="datetime-local" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }} />
                  </label>
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setDetailModalTab("resumen")}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={saveReschedule}>Guardar fecha</button>
                  </div>
                </div>
              )}
              {detailModalTab === "editar" && !celebrated && (
                <div className="kanban-modal-body">
                  <label className="list-item" style={{ alignItems: "center" }}>
                    <span>Título</span>
                    <input value={quickEdit.title} onChange={(e) => setQuickEdit((p) => ({ ...p, title: e.target.value }))} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }} />
                  </label>
                  <label className="list-item" style={{ alignItems: "center" }}>
                    <span>Fecha y hora</span>
                    <input type="datetime-local" value={quickEdit.date} onChange={(e) => setQuickEdit((p) => ({ ...p, date: e.target.value }))} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }} />
                  </label>
                  <label className="list-item" style={{ alignItems: "center" }}>
                    <span>Ubicación</span>
                    <input value={quickEdit.location} onChange={(e) => setQuickEdit((p) => ({ ...p, location: e.target.value }))} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: "10px" }} />
                  </label>
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setDetailModalTab("resumen")}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={saveQuickEdit}>Guardar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showResetDemoModal && (
        <div className="kanban-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-demo-title" onClick={() => { setShowResetDemoModal(false); setResetDemoConfirmText(""); }}>
          <div className="kanban-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kanban-modal-header">
              <h3 id="reset-demo-title">Restablecer asambleas demo</h3>
              <button type="button" className="kanban-modal-close" onClick={() => { setShowResetDemoModal(false); setResetDemoConfirmText(""); }} aria-label="Cerrar">×</button>
            </div>
            <div className="kanban-modal-body">
              <p style={{ marginBottom: "12px" }}>
                Se eliminarán todas las asambleas guardadas y se cargarán de nuevo las <strong>2 asambleas de ejemplo</strong> (Ordinaria 2026 y Extraordinaria Piscina). Esta acción no se puede deshacer.
              </p>
              <p className="muted" style={{ marginBottom: "12px" }}>Escriba <strong>restablecer</strong> para confirmar.</p>
              <input
                type="text"
                value={resetDemoConfirmText}
                onChange={(e) => setResetDemoConfirmText(e.target.value)}
                placeholder="escriba restablecer"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", marginBottom: "12px" }}
                autoComplete="off"
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowResetDemoModal(false); setResetDemoConfirmText(""); }}>Cancelar</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={resetDemoConfirmText.trim().toLowerCase() !== CONFIRM_RESET_DEMO_WORD}
                  onClick={() => {
                    if (resetDemoConfirmText.trim().toLowerCase() !== CONFIRM_RESET_DEMO_WORD) return;
                    resetDemoAssemblies();
                    setAssemblies(getAssemblies());
                    setShowResetDemoModal(false);
                    setResetDemoConfirmText("");
                  }}
                >
                  Restablecer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModalId && (() => {
        const a = assemblies.find((x) => x.id === deleteModalId);
        const celebrated = a ? isAssemblyCelebrated(a) : false;
        const canConfirm = !celebrated && deleteConfirmText.trim().toLowerCase() === CONFIRM_DELETE_WORD;
        return (
          <div className="kanban-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="kanban-delete-title" onClick={() => { setDeleteModalId(null); setDeleteConfirmText(""); }}>
            <div className="kanban-modal kanban-modal-delete" onClick={(e) => e.stopPropagation()}>
              <div className="kanban-modal-header">
                <h3 id="kanban-delete-title">Eliminar asamblea</h3>
                <button type="button" className="kanban-modal-close" onClick={() => { setDeleteModalId(null); setDeleteConfirmText(""); }} aria-label="Cerrar">×</button>
              </div>
              <div className="kanban-modal-body">
                {a && <p><strong>{a.title}</strong></p>}
                {celebrated ? (
                  <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", color: "#fca5a5" }}>
                    No se puede eliminar: asamblea celebrada, crédito consumido.
                  </div>
                ) : (
                  <>
                    <p className="muted" style={{ marginBottom: "12px" }}>Esta acción no se puede deshacer. Escriba <strong>eliminar</strong> para confirmar.</p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="escriba eliminar"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", marginBottom: "12px" }}
                      autoComplete="off"
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" className="btn btn-ghost" onClick={() => { setDeleteModalId(null); setDeleteConfirmText(""); }}>Cancelar</button>
                      <button type="button" className="btn btn-primary" style={{ background: "#dc2626" }} onClick={confirmDeleteFromModal} disabled={!canConfirm}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
                {celebrated && (
                  <button type="button" className="btn btn-ghost" style={{ marginTop: "12px" }} onClick={() => { setDeleteModalId(null); setDeleteConfirmText(""); }}>Cerrar</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {actaInmediataModal && (
        <div className="kanban-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="acta-inmediata-title" onClick={() => setActaInmediataModal(null)}>
          <div className="kanban-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="kanban-modal-header">
              <h3 id="acta-inmediata-title">Acta inmediata (resumen)</h3>
              <button type="button" className="kanban-modal-close" onClick={() => setActaInmediataModal(null)} aria-label="Cerrar">×</button>
            </div>
            <div className="kanban-modal-body">
              <p style={{ margin: "0 0 12px" }}><strong>{actaInmediataModal.title}</strong></p>
              <p className="muted" style={{ fontSize: "13px", margin: "0 0 12px" }}>
                Se ha generado el acta resumen con los resultados de la votación por tema y el detalle de unidades y su voto (SI, NO, ABST).
              </p>
              <div style={{ padding: "14px", background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "10px", marginBottom: "16px" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                  El acta legal formal se enviará en el plazo que indica la Ley 284 (máx. 10 días calendario desde la asamblea).
                </p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setActaInmediataModal(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .assemblies-page-card {
          overflow: visible;
        }
        .assemblies-page-header {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }
        .assemblies-page-header-content { flex: 1; min-width: 200px; }
        .assemblies-page-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .assemblies-view-toggle {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(148, 163, 184, 0.12);
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .assemblies-view-toggle button {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
        }
        .assemblies-view-toggle button.active {
          background: rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-weight: 500;
        }
        .assembly-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
          margin-top: 18px;
        }
        .assembly-cards-grid--completed { margin-top: 14px; }
        .assembly-card-widget {
          background: linear-gradient(160deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .assembly-card-widget:hover {
          border-color: rgba(99, 102, 241, 0.45);
          box-shadow: 0 8px 28px rgba(99, 102, 241, 0.14);
          transform: translateY(-2px);
        }
        .assembly-card-widget--completed {
          opacity: 0.92;
          border-color: rgba(148, 163, 184, 0.15);
        }
        .assembly-card-widget--completed:hover {
          border-color: rgba(148, 163, 184, 0.25);
          transform: none;
        }
        .assembly-card-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .assembly-card-widget-type {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-weight: 500;
        }
        .assembly-card-widget-badge { font-size: 14px; }
        .assembly-card-widget-date {
          font-size: 13px;
          color: #94a3b8;
        }
        .assembly-card-widget-title {
          margin: 0 0 10px;
          font-size: 1.05rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.3;
        }
        .assembly-card-widget-meta {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 14px;
        }
        .assembly-card-widget-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .assembly-card-widget-actions .btn-sm { padding: 6px 12px; font-size: 12px; }
        .assembly-card-delete { color: #f87171 !important; }
        .assembly-card-delete:hover { background: rgba(248, 113, 113, 0.15); }
        .assembly-completed-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(148, 163, 184, 0.18);
        }
        .assembly-completed-section h3 {
          font-size: 1.1rem;
          margin: 0 0 8px;
        }
        .assemblies-kanban {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          min-height: 320px;
        }
        @media (max-width: 900px) {
          .assemblies-kanban { grid-template-columns: 1fr; }
        }
        .kanban-column {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .kanban-column-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          font-weight: 600;
          font-size: 14px;
        }
        .kanban-column-icon { font-size: 16px; }
        .kanban-column-count {
          margin-left: auto;
          background: rgba(148, 163, 184, 0.2);
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
        }
        .kanban-column-cards {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }
        .kanban-card {
          background: linear-gradient(160deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.75));
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 14px;
          padding: 16px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .kanban-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.12);
        }
        .kanban-card-pill {
          display: inline-block;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          margin-bottom: 8px;
        }
        .kanban-card-title {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
        }
        .kanban-card-calendar {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          margin-bottom: 6px;
          padding: 4px 8px;
          background: rgba(148, 163, 184, 0.15);
          border-radius: 8px;
          width: fit-content;
        }
        .kanban-calendar-icon { font-size: 14px; }
        .kanban-card-meta { margin: 0 0 10px; font-size: 12px; }
        .kanban-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
        }
        .kanban-modal {
          background: #1e293b;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
        }
        .kanban-modal-delete { max-width: 400px; }
        .kanban-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        .kanban-modal-header h3 { margin: 0; font-size: 18px; }
        .kanban-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #94a3b8;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
        }
        .kanban-modal-tabs {
          display: flex;
          gap: 4px;
          padding: 12px 20px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        .kanban-modal-tabs button {
          padding: 8px 14px;
          border: none;
          border-radius: 8px 8px 0 0;
          background: transparent;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
        }
        .kanban-modal-tabs button.active {
          background: rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-weight: 500;
        }
        .kanban-modal-body { padding: 20px; }
        .kanban-detail-calendar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(148, 163, 184, 0.12);
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .kanban-detail-calendar-icon { font-size: 28px; }
        .kanban-detail-date { font-weight: 600; font-size: 15px; }
        html[data-theme="light"] .kanban-modal {
          background: #fff;
          border-color: #e2e8f0;
        }
        html[data-theme="light"] .kanban-modal-header { border-color: #e2e8f0; }
        html[data-theme="light"] .kanban-modal-tabs { border-color: #e2e8f0; }
        html[data-theme="light"] .kanban-modal-tabs button { color: #64748b; }
        html[data-theme="light"] .kanban-modal-tabs button.active { color: #4f46e5; background: rgba(99, 102, 241, 0.15); }
        html[data-theme="light"] .kanban-detail-calendar { background: #f1f5f9; }
        html[data-theme="light"] .kanban-card-calendar { background: #e2e8f0; color: #334155; }
        .kanban-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .kanban-card-actions .btn-sm { padding: 4px 10px; font-size: 11px; }
        .kanban-card-move {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding-top: 8px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        .kanban-card-move .btn-sm { padding: 2px 8px; font-size: 10px; }
        html[data-theme="light"] .assemblies-view-toggle {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }
        html[data-theme="light"] .assemblies-view-toggle button { color: #64748b; }
        html[data-theme="light"] .assemblies-view-toggle button.active {
          background: rgba(99, 102, 241, 0.2);
          color: #4f46e5;
        }
        html[data-theme="light"] .kanban-column {
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        html[data-theme="light"] .kanban-column-header { border-color: #e2e8f0; color: #334155; }
        html[data-theme="light"] .kanban-card {
          background: #fff;
          border-color: #e2e8f0;
        }
        html[data-theme="light"] .kanban-card:hover {
          border-color: #a5b4fc;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
        }
        html[data-theme="light"] .kanban-card-pill {
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
        }
        html[data-theme="light"] .kanban-card-title { color: #0f172a; }
      `}</style>
    </div>
  );
}
