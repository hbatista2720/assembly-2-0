"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DateTimePickerPopup from "../../../../components/DateTimePickerPopup";
import useAssemblyCredits from "../../../../hooks/useAssemblyCredits";
import {
  archiveAssembly,
  createAssembly,
  deleteArchivedAssemblyPermanently,
  findAssembly,
  getArchivedAssemblies,
  getAssemblies,
  getWizardStepLabel,
  restoreArchivedAssembly,
  updateAssembly,
  updateAssemblyWizardStep,
  type Assembly,
  type AssemblyTopic,
  type AssemblyType,
  type TopicApprovalType,
  type WizardStep,
} from "../../../../lib/assembliesStore";

const createId = () => `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;

/** Días mínimos de anticipación por tipo (Ley 284). */
function getMinDaysForType(type: AssemblyType): number {
  if (type === "Especial") return 0;
  if (type === "Extraordinaria") return 3;
  if (type === "Por derecho propio") return 3;
  return 10; // Ordinaria
}

function getMinDateForType(type: AssemblyType): string {
  if (type === "Especial") return "";
  const now = new Date();
  const d = new Date(now);
  d.setDate(d.getDate() + getMinDaysForType(type));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

const STEPS: { step: WizardStep; label: string; desc: string }[] = [
  { step: 1, label: "Residentes", desc: "Registro de propietarios" },
  { step: 2, label: "Crear", desc: "Configurar asamblea" },
  { step: 3, label: "Agendar", desc: "Fecha y lugar" },
  { step: 4, label: "Monitor", desc: "En vivo" },
  { step: 5, label: "Finalizar", desc: "Acta" },
];

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d.slice(0, 10);
  }
}

function ProcesoAsambleaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assemblyId = searchParams.get("assemblyId");
  const [phName, setPhName] = useState<string | null>(null);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [embeddedModule, setEmbeddedModule] = useState<"owners" | "assembly-live" | "monitor" | "acts" | null>(null);
  const [phId, setPhId] = useState<string>("urban-tower");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string>("");
  const assembly = assemblyId ? findAssembly(assemblyId) : null;
  const { credits: creditsData } = useAssemblyCredits(organizationId);
  const hasCredits = creditsData ? creditsData.total_available >= 1 : true;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("assembly_admin_selected_ph");
    const name = sessionStorage.getItem("assembly_admin_selected_ph_name");
    const id = stored || "urban-tower";
    if (!stored) {
      sessionStorage.setItem("assembly_admin_selected_ph", id);
      if (!name) sessionStorage.setItem("assembly_admin_selected_ph_name", "Urban Tower");
    }
    setPhId(id);
    setPhName(name || "Urban Tower");
    const orgId = localStorage.getItem("assembly_organization_id");
    setOrganizationId(orgId || "demo-organization");
  }, []);
  useEffect(() => {
    if (!embeddedModule || typeof window === "undefined") {
      setIframeSrc("");
      return;
    }
    const origin = window.location.origin;
    const params = new URLSearchParams({ from: "proceso-asamblea", embed: "1", phId });
    if (assemblyId) params.set("assemblyId", assemblyId);
    const aid = assembly?.id || assemblyId || "demo";
    let url: string;
    switch (embeddedModule) {
      case "owners":
        url = `${origin}/dashboard/admin-ph/owners?${params.toString()}`;
        break;
      case "assembly-live":
        url = `${origin}/dashboard/admin-ph/assembly/${aid}/live?embed=1&phId=${encodeURIComponent(phId)}`;
        break;
      case "monitor":
        url = `${origin}/dashboard/admin-ph/monitor?${params.toString()}`;
        break;
      case "acts":
        url = `${origin}/dashboard/admin-ph/acts?${params.toString()}`;
        break;
      default:
        url = "";
    }
    setIframeSrc(url);
  }, [embeddedModule, assemblyId, assembly?.id, phId]);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [archivedAssemblies, setArchivedAssemblies] = useState<Assembly[]>([]);
  const [deletePermanentAssembly, setDeletePermanentAssembly] = useState<Assembly | null>(null);
  const [deletePermanentConfirm, setDeletePermanentConfirm] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "Ordinaria" as AssemblyType,
    typeCustom: "",
    date: "",
    location: "",
    orderOfDay: "",
    mode: "Presencial" as "Presencial" | "Virtual" | "Mixta",
    meetingLink: "",
    secondCallWarning: true,
    topics: [] as { id: string; title: string; type: TopicApprovalType }[],
  });

  useEffect(() => {
    setAssemblies(getAssemblies());
    setArchivedAssemblies(getArchivedAssemblies());
  }, []);

  const refreshData = () => {
    setAssemblies(getAssemblies());
    setArchivedAssemblies(getArchivedAssemblies());
  };

  const handleDeleteAssembly = () => {
    if (!assembly || !assemblyId) return;
    if (deleteConfirmText.trim().toUpperCase() !== "ELIMINAR") return;
    if (archiveAssembly(assembly.id)) {
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      router.push("/dashboard/admin-ph/proceso-asamblea");
      refreshData();
    }
  };

  const handleRestoreAssembly = (id: string) => {
    if (restoreArchivedAssembly(id, phId)) {
      refreshData();
      router.push(`/dashboard/admin-ph/proceso-asamblea?assemblyId=${id}`);
    }
  };

  const handleDeletePermanentAssembly = () => {
    if (!deletePermanentAssembly || deletePermanentConfirm.trim().toUpperCase() !== "ELIMINAR") return;
    if (deleteArchivedAssemblyPermanently(deletePermanentAssembly.id, phId)) {
      setDeletePermanentAssembly(null);
      setDeletePermanentConfirm("");
      refreshData();
    }
  };

  const pendingAssemblies = useMemo(
    () => assemblies.filter((a) => a.status !== "Completada"),
    [assemblies],
  );

  // Sincronizar estado cuando cambia assemblyId o los datos del assembly (evitar dependencia de objeto que provoca bucle)
  useEffect(() => {
    if (!assembly) return;
    const stepParam = searchParams.get("step");
    const stepFromUrl = stepParam ? parseInt(stepParam, 10) : NaN;
    const validStep = !Number.isNaN(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 5 ? stepFromUrl : null;
    const step = (validStep ?? assembly.wizard_step ?? 1) as WizardStep;
    setCurrentStep(step);
    setForm({
      title: assembly.title || "",
      type: assembly.type || "Ordinaria",
      typeCustom: assembly.typeCustom || "",
      date: assembly.date?.slice(0, 16) || "",
      location: assembly.location || "",
      orderOfDay: assembly.orderOfDay || "",
      mode: (assembly.mode as "Presencial" | "Virtual" | "Mixta") || "Presencial",
      meetingLink: assembly.meetingLink || "",
      secondCallWarning: assembly.secondCallWarning ?? true,
      topics: (assembly.topics || []).map((t) => ({ id: t.id, title: t.title, type: t.type })),
    });
  }, [assemblyId, assembly?.id, assembly?.wizard_step, searchParams]);

  // En paso 3: si la fecha guardada es anterior al mínimo (Ley 284) o vacía, corregir para que el calendario abra correctamente
  const minDateStr = getMinDateForType(form.type);
  useEffect(() => {
    if (currentStep !== 3) return;
    if (form.type === "Especial") return;
    if (!minDateStr) return;
    const minDate = new Date(minDateStr);
    const currentDate = form.date ? new Date(form.date) : null;
    const isInvalid = !form.date || !currentDate || isNaN(currentDate.getTime()) || currentDate < minDate;
    if (isInvalid) {
      setForm((f) => ({ ...f, date: minDateStr }));
    }
  }, [currentStep, form.type, minDateStr]);

  const handleNewAssembly = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    defaultDate.setHours(18, 0, 0, 0);
    const created = createAssembly({
      title: "Nueva asamblea",
      type: "Ordinaria",
      date: defaultDate.toISOString().slice(0, 16),
      location: "Salón principal",
      orderOfDay: "1. Orden del día.\n2. Temas varios.",
      secondCallWarning: true,
      mode: "Presencial",
      attendeesCount: 50,
      faceIdCount: 35,
      topics: [],
    });
    setAssemblies(getAssemblies());
    router.push(`/dashboard/admin-ph/proceso-asamblea?assemblyId=${created.id}`);
  };

  const handlePrev = () => {
    if (currentStep <= 1 || !assembly) return;
    const prev = (currentStep - 1) as WizardStep;
    updateAssemblyWizardStep(assembly.id, prev);
    setCurrentStep(prev);
    setEmbeddedModule(null);
    setAssemblies(getAssemblies());
  };

  const handleNext = () => {
    if (!assembly) return;
    if (currentStep === 2 && !hasCredits) return;
    setFormError(null);
    if (currentStep === 2) {
      if (!form.title?.trim()) {
        setFormError("El título es obligatorio.");
        return;
      }
      if (!form.orderOfDay?.trim()) {
        setFormError("El orden del día (agenda) es obligatorio (Ley 284).");
        return;
      }
    }
    if (currentStep === 3) {
      if (!form.date) {
        setFormError("La fecha y hora son obligatorias.");
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
            `Para asamblea ${form.type}, la convocatoria debe realizarse con al menos ${minDays} días de anticipación (Ley 284). Fecha mínima: ${minDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}.`
          );
          return;
        }
      }
    }
    if (currentStep === 2 || currentStep === 3) {
      const topicsNorm: AssemblyTopic[] = form.topics
        .filter((t) => t.title.trim())
        .map((t) => ({ id: t.id, title: t.title.trim(), type: t.type }));
      updateAssembly(assembly.id, (a) => ({
        ...a,
        title: form.title || a.title,
        type: form.type,
        typeCustom: form.type === "Especial" ? form.typeCustom?.trim() || undefined : undefined,
        date: form.date || a.date,
        location: form.location || a.location,
        orderOfDay: form.orderOfDay || a.orderOfDay,
        mode: form.mode,
        meetingLink: form.meetingLink,
        secondCallWarning: form.secondCallWarning,
        topics: topicsNorm.length > 0 ? topicsNorm : a.topics,
      }));
    }
    if (currentStep >= 5) return;
    const next = (currentStep + 1) as WizardStep;
    updateAssemblyWizardStep(assembly.id, next);
    setCurrentStep(next);
    setEmbeddedModule(null);
    setAssemblies(getAssemblies());
  };

  const base = "/dashboard/admin-ph";

  // Vista inicial: lista de asambleas pendientes
  if (!assemblyId) {
    return (
      <>
      <div className="card" style={{ width: "100%", maxWidth: "min(1400px, 96vw)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <Link href={base} className="btn btn-ghost" style={{ borderRadius: "999px", padding: "8px 16px" }} scroll={true}>
            ← Volver al Panel de la Comunidad
          </Link>
        </div>
        {phName && (
          <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "4px", fontWeight: 500 }}>
            {phName}
          </div>
        )}
        <h2 style={{ marginTop: 0 }}>Proceso de Asamblea</h2>
        <p className="muted" style={{ marginTop: "6px", marginBottom: "24px" }}>
          Gestiona el ciclo completo de una asamblea, paso a paso.
        </p>
        {!hasCredits && (
          <div className="card" style={{ marginBottom: "24px", borderLeft: "4px solid rgba(234, 179, 8, 0.8)", background: "rgba(250, 204, 21, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <span style={{ fontSize: "28px" }} aria-hidden>⚠️</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, color: "#f59e0b" }}>Sin créditos disponibles</h3>
                <p className="muted" style={{ marginTop: "6px", marginBottom: "16px" }}>
                  No tiene créditos disponibles para crear asambleas. Debe comprar crédito primero.
                </p>
                <Link href="/dashboard/admin-ph/subscription" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  Ir a Comprar Créditos
                </Link>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNewAssembly}
          style={{ marginBottom: "24px" }}
          disabled={!hasCredits}
        >
          Nueva asamblea
        </button>
        {pendingAssemblies.length === 0 ? (
          <p className="muted">No hay asambleas pendientes. Crea una nueva para empezar.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingAssemblies.map((a) => {
              const step = (a.wizard_step ?? 1) as WizardStep;
              return (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: "12px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{a.title}</div>
                    <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                      {a.status} · Paso {step}: {getWizardStepLabel(step)} · {formatDate(a.date)}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/admin-ph/proceso-asamblea?assemblyId=${a.id}`}
                    className="btn btn-primary"
                    style={{ borderRadius: "999px" }}
                  >
                    {step > 1 ? "Reanudar" : "Continuar"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {archivedAssemblies.length > 0 && (
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#94a3b8", marginBottom: "12px" }}>
              Archivo temporal
            </h3>
            <p className="muted" style={{ fontSize: "13px", marginBottom: "12px" }}>
              Asambleas eliminadas en fase 1. Puede restaurarlas si fue por error.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {archivedAssemblies.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "rgba(148,163,184,0.08)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "10px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, color: "#94a3b8" }}>{a.title}</div>
                    <div className="muted" style={{ fontSize: "12px", marginTop: "2px" }}>{formatDate(a.date)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: "13px", borderRadius: "8px" }}
                      onClick={() => handleRestoreAssembly(a.id)}
                    >
                      Restaurar
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: "13px", borderRadius: "8px", color: "#f87171" }}
                      onClick={() => { setDeletePermanentAssembly(a); setDeletePermanentConfirm(""); }}
                    >
                      Borrar definitivamente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {deletePermanentAssembly && (
          <div className="profile-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }} onClick={() => setDeletePermanentAssembly(null)} role="dialog" aria-modal="true" aria-labelledby="delete-permanent-title">
            <div className="profile-modal-card" style={{ maxWidth: "420px", margin: 16, padding: "24px" }} onClick={(e) => e.stopPropagation()}>
              <h2 id="delete-permanent-title" style={{ margin: "0 0 12px", fontSize: "1.2rem", color: "#f87171" }}>Borrar definitivamente</h2>
              <p className="muted" style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: 1.5 }}>
                <strong>Advertencia:</strong> La asamblea &quot;{deletePermanentAssembly.title}&quot; se eliminará permanentemente del archivo temporal. Esta acción no se puede deshacer. No podrás restaurarla.
              </p>
              <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>
                Escribe <strong>ELIMINAR</strong> para confirmar:
              </p>
              <input
                type="text"
                className="create-ph-input"
                value={deletePermanentConfirm}
                onChange={(e) => setDeletePermanentConfirm(e.target.value)}
                placeholder="ELIMINAR"
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn" style={{ background: "#dc2626", color: "white", border: "none" }} onClick={handleDeletePermanentAssembly} disabled={deletePermanentConfirm.trim().toUpperCase() !== "ELIMINAR"}>
                  Borrar definitivamente
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDeletePermanentAssembly(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    );
  }

  // Vista wizard
  if (!assembly) {
    return (
      <div className="card">
        <Link href={base} className="btn btn-ghost" style={{ marginBottom: "16px", display: "inline-block" }}>
          ← Volver al Panel de la Comunidad
        </Link>
        {phName && <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px", fontWeight: 500 }}>{phName}</div>}
        <p>Asamblea no encontrada.</p>
        <Link href="/dashboard/admin-ph/proceso-asamblea" className="btn btn-ghost" style={{ marginTop: "12px", display: "inline-block" }}>
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: "100%", maxWidth: "min(1400px, 96vw)" }}>
      {/* Cabecera + stepper fijos arriba para ver siempre la fase actual */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "inherit", paddingBottom: "4px", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <Link href={base} className="btn btn-ghost" style={{ borderRadius: "999px", padding: "8px 16px" }} scroll={true}>
            ← Volver al Panel de la Comunidad
          </Link>
          {assemblyId && (
            <Link href="/dashboard/admin-ph/proceso-asamblea" className="btn btn-ghost" style={{ borderRadius: "999px", padding: "8px 16px" }} scroll={true}>
              Ver listado de asambleas
            </Link>
          )}
          {assembly && currentStep === 1 && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginLeft: "auto", borderRadius: "999px", padding: "8px 16px", color: "var(--color-error, #f87171)", border: "1px solid rgba(239,68,68,0.3)" }}
              onClick={() => setShowDeleteModal(true)}
            >
              Eliminar asamblea
            </button>
          )}
        </div>
        {phName && (
          <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "4px", fontWeight: 500 }}>
            {phName}
          </div>
        )}
        <h2 style={{ marginTop: 0 }}>Proceso de Asamblea</h2>
        <p className="muted" style={{ marginTop: "6px", marginBottom: "24px" }}>
          Gestiona el ciclo completo de una asamblea, paso a paso.
        </p>

        {/* Stepper horizontal - indica la fase actual */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "28px",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(148,163,184,0.2)",
          }}
        >
        {STEPS.map((s, i) => {
          const isActive = s.step === currentStep;
          const isPast = s.step < currentStep;
          return (
            <div
              key={s.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flex: "1 1 0",
                minWidth: "100px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: isActive ? "rgba(99,102,241,0.9)" : isPast ? "rgba(99,102,241,0.4)" : "rgba(148,163,184,0.2)",
                  color: isActive || isPast ? "#fff" : "#94a3b8",
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#a5b4fc" : "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  {s.label}
                </div>
                <div className="muted" style={{ fontSize: "11px" }}>{s.desc}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: "20px",
                    height: "2px",
                    background: isPast ? "rgba(99,102,241,0.4)" : "rgba(148,163,184,0.2)",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Contenido del paso actual o módulo embebido */}
      <div style={{ minHeight: "200px", marginBottom: "24px" }}>
        {embeddedModule ? (
          <div
            style={{
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: "12px",
              overflow: "hidden",
              background: "rgba(15,23,42,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(99,102,241,0.15)",
                borderBottom: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <span style={{ fontWeight: 600, color: "#a5b4fc", fontSize: "14px" }}>
                {embeddedModule === "owners" && "Propietarios"}
                {embeddedModule === "assembly-live" && "Asamblea en vivo"}
                {embeddedModule === "monitor" && "Monitor Back Office"}
                {embeddedModule === "acts" && "Actas"}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEmbeddedModule(null)}
                style={{ fontSize: "13px", padding: "6px 12px" }}
              >
                ← Cerrar y volver al wizard
              </button>
            </div>
            <iframe
              key={embeddedModule}
              src={iframeSrc}
              title={embeddedModule}
              style={{
                width: "100%",
                height: "min(75vh, 750px)",
                minHeight: "500px",
                border: "none",
                display: "block",
              }}
            />
          </div>
        ) : (
          <>
        {currentStep === 1 && (
          <div>
            <h3 style={{ marginTop: 0, fontSize: "16px" }}>Registro de propietarios y residentes</h3>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Abre el módulo de Propietarios para registrar o revisar residentes. Se mostrará aquí sin salir del wizard.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: "999px" }}
              onClick={() => setEmbeddedModule("owners")}
            >
              Abrir módulo Propietarios →
            </button>
          </div>
        )}

        {currentStep === 2 && !hasCredits && (
          <div className="card" style={{ borderLeft: "4px solid rgba(234, 179, 8, 0.8)", background: "rgba(250, 204, 21, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <span style={{ fontSize: "28px" }} aria-hidden>⚠️</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, color: "#f59e0b" }}>Sin créditos disponibles</h3>
                <p className="muted" style={{ marginTop: "6px", marginBottom: "16px" }}>
                  No tiene créditos disponibles para crear asambleas. Debe comprar crédito primero para continuar.
                </p>
                <Link href="/dashboard/admin-ph/subscription" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  Ir a Comprar Créditos
                </Link>
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && hasCredits && (
          <div>
            <h3 style={{ marginTop: 0, fontSize: "16px" }}>Crear y configurar asamblea</h3>
            <p className="muted" style={{ marginBottom: "12px", fontSize: "13px" }}>
              Configuración conforme Ley 284. En el siguiente paso se validará la fecha según el tipo.
            </p>
            {formError && (
              <p style={{ color: "var(--color-error, #ef4444)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>
            )}
            <div style={{ display: "grid", gap: "16px", maxWidth: "480px" }}>
              <label>
                <span>Título *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej. Asamblea Ordinaria 2026"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                />
              </label>
              <label>
                <span>Tipo (Ley 284)</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AssemblyType }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                >
                  <option value="Ordinaria">Ordinaria (mín. 10 días)</option>
                  <option value="Extraordinaria">Extraordinaria (mín. 3 días)</option>
                  <option value="Por derecho propio">Por derecho propio (mín. 3 días)</option>
                  <option value="Especial">Especial (sin plazo legal)</option>
                </select>
              </label>
              {form.type === "Especial" && (
                <label>
                  <span>Tipo (texto manual)</span>
                  <input
                    type="text"
                    value={form.typeCustom}
                    onChange={(e) => setForm((f) => ({ ...f, typeCustom: e.target.value }))}
                    placeholder="Ej. Por derecho propio"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                  />
                </label>
              )}
              <label>
                <span>Orden del día *</span>
                <textarea
                  value={form.orderOfDay}
                  onChange={(e) => setForm((f) => ({ ...f, orderOfDay: e.target.value }))}
                  placeholder="1. Orden del día&#10;2. Aprobación presupuesto&#10;3. Temas varios"
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                />
              </label>
              <div>
                <span style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Temas</span>
                {form.topics.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => {
                        const next = [...form.topics];
                        next[i] = { ...next[i]!, title: e.target.value };
                        setForm((f) => ({ ...f, topics: next }));
                      }}
                      placeholder="Título del tema"
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                    />
                    <select
                      value={t.type}
                      onChange={(e) => {
                        const next = [...form.topics];
                        next[i] = { ...next[i]!, type: e.target.value as TopicApprovalType };
                        setForm((f) => ({ ...f, topics: next }));
                      }}
                      style={{ width: "140px", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                    >
                      <option value="informativo">Informativo</option>
                      <option value="votacion_simple">Mayoría simple</option>
                      <option value="votacion_calificada">Mayoría calificada</option>
                      <option value="votacion_reglamento">Mayoría reglamento</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, topics: form.topics.filter((_, j) => j !== i) }))}
                      style={{ padding: "8px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", color: "#fca5a5", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, topics: [...f.topics, { id: createId(), title: "", type: "votacion_simple" as TopicApprovalType }] }))}
                  className="btn btn-ghost"
                  style={{ fontSize: "13px", padding: "8px 12px" }}
                >
                  + Agregar tema
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ marginTop: 0, fontSize: "16px" }}>Fecha, hora y lugar</h3>
            <p className="muted" style={{ marginBottom: "12px", fontSize: "13px" }}>
              {form.type === "Especial"
                ? "Sin plazo legal mínimo."
                : `Ley 284: ${form.type} requiere al menos ${getMinDaysForType(form.type)} días de anticipación.`}
            </p>
            {formError && (
              <p style={{ color: "var(--color-error, #ef4444)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>
            )}
            <div style={{ display: "grid", gap: "16px", maxWidth: "400px" }}>
              <label>
                <span>Fecha y hora *</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <DateTimePickerPopup
                      value={form.date}
                      onChange={(v) => { setForm((f) => ({ ...f, date: v })); setFormError(null); }}
                      minDate={minDateStr || undefined}
                      placeholder="Haz clic para abrir el calendario"
                    />
                  </div>
                  {form.type !== "Especial" && minDateStr && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => { setForm((f) => ({ ...f, date: minDateStr })); setFormError(null); }}
                      style={{ fontSize: "13px", padding: "8px 12px", whiteSpace: "nowrap" }}
                    >
                      Usar fecha mínima
                    </button>
                  )}
                </div>
                {form.type !== "Especial" && minDateStr && (
                  <span className="muted" style={{ fontSize: "12px", marginTop: "4px", display: "block" }}>
                    Fecha mínima Ley 284: {new Date(minDateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </label>
              <label>
                <span>Lugar *</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Salón de eventos"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                />
              </label>
              <label>
                <span>Modo</span>
                <select
                  value={form.mode}
                  onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as "Presencial" | "Virtual" | "Mixta" }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </label>
              {(form.mode === "Virtual" || form.mode === "Mixta") && (
                <label>
                  <span>Enlace de reunión</span>
                  <input
                    type="url"
                    value={form.meetingLink}
                    onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                    placeholder="https://meet.example.com/..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.6)", color: "#e2e8f0" }}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 style={{ marginTop: 0, fontSize: "16px" }}>Celebrar y monitor en vivo</h3>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Inicia la asamblea y monitorea quórum y votaciones en tiempo real. Se mostrará aquí sin salir del wizard.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: "999px", marginRight: "12px" }}
              onClick={() => setEmbeddedModule("assembly-live")}
            >
              Iniciar asamblea / Monitor →
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)" }}
              onClick={() => setEmbeddedModule("monitor")}
            >
              Ver Monitor Back Office
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h3 style={{ marginTop: 0, fontSize: "16px" }}>Cerrar asamblea y acta</h3>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Cierra la asamblea y genera el acta con los resultados. Se mostrará aquí sin salir del wizard.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: "999px" }}
              onClick={() => setEmbeddedModule("acts")}
            >
              Crear acta →
            </button>
          </div>
        )}
          </>
        )}
      </div>

      {/* Botones de navegación */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handlePrev}
          disabled={currentStep <= 1}
          style={{ borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)", opacity: currentStep <= 1 ? 0.5 : 1 }}
        >
          ← Anterior
        </button>
        {currentStep < 5 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={currentStep === 2 && !hasCredits}
            style={{ borderRadius: "999px", opacity: currentStep === 2 && !hasCredits ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        ) : (
          <Link
            href="/dashboard/admin-ph/proceso-asamblea"
            className="btn btn-primary"
            style={{ borderRadius: "999px", textDecoration: "none" }}
          >
            Finalizar
          </Link>
        )}
      </div>

      {/* Modal de confirmación eliminar asamblea */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-assembly-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
        >
          <div
            style={{
              background: "var(--color-surface, #1e293b)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "90vw",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-assembly-modal-title" style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600 }}>
              ¿Eliminar asamblea?
            </h3>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: 1.5 }}>
              La asamblea &quot;{assembly?.title}&quot; se moverá al archivo temporal. Podrá restaurarla desde allí si fue por error.
            </p>
            <p className="muted" style={{ margin: "0 0 8px", fontSize: "13px" }}>
              Escriba <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.3)",
                background: "rgba(15,23,42,0.6)",
                color: "#e2e8f0",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: "var(--color-error, #dc2626)", color: "#fff", border: "none", opacity: deleteConfirmText.trim().toUpperCase() === "ELIMINAR" ? 1 : 0.5 }}
                onClick={handleDeleteAssembly}
                disabled={deleteConfirmText.trim().toUpperCase() !== "ELIMINAR"}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcesoAsambleaPage() {
  return (
    <Suspense fallback={<div className="card" style={{ padding: "24px" }}><p className="muted" style={{ margin: 0 }}>Cargando…</p></div>}>
      <ProcesoAsambleaContent />
    </Suspense>
  );
}
