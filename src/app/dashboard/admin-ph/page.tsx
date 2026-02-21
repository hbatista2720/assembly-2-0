"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import UpgradeBanner from "../../../components/UpgradeBanner";
import DemoBanner from "../../../components/DemoBanner";
import useUpgradeBanner from "../../../hooks/useUpgradeBanner";
import AssemblyCreditsDisplay from "../../../components/AssemblyCreditsDisplay";
import { getAssemblies } from "../../../lib/assembliesStore";
import { getDemoResidents, isDemoResidentsContext } from "../../../lib/demoResidentsStore";
import { PLANS } from "../../../lib/types/pricing";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_RESIDENTS = 50;

type PhItem = {
  id: string;
  name: string;
  edificios: string;
  propietarios: string;
  direccion?: string;
  tipoPh?: "Edificio" | "Complejo de casas cerrado" | "Otro";
};

const PH_LIST_FULL: PhItem[] = [{ id: "urban-tower", name: "Urban Tower PH", edificios: "1", propietarios: "200" }];
const PH_LIST_DEMO: PhItem[] = [{ id: "urban-tower", name: "Urban Tower PH", edificios: "1", propietarios: String(DEMO_RESIDENTS) }];

const CUSTOM_PH_STORAGE_KEY = "assembly_admin_ph_custom_properties";

function loadCustomPhList(): PhItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PH_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCustomPhList(list: PhItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PH_STORAGE_KEY, JSON.stringify(list));
}

const KPIS_FULL = [
  { label: "Propietarios activos", value: "200", note: "85% al dia" },
  { label: "Asambleas 2026", value: "3", note: "1 programada" },
  { label: "Face ID activo", value: "130", note: "65% configurado" },
  { label: "Alertas abiertas", value: "3", note: "2 en mora" },
];
const KPIS_DEMO = [
  { label: "Propietarios activos", value: String(DEMO_RESIDENTS), note: "modo demo" },
  { label: "Asambleas 2026", value: "1", note: "1 programada" },
  { label: "Face ID activo", value: String(Math.round(DEMO_RESIDENTS * 0.65)), note: "65% configurado" },
  { label: "Alertas abiertas", value: "2", note: "ejemplo" },
];

const ALERTS_FULL = [
  "30 propietarios sin Face ID configurado",
  "50 propietarios en mora (+3 meses)",
  "Recordatorio: asamblea en 3 dias",
];
const ALERTS_DEMO = [
  "18 propietarios sin Face ID configurado",
  "5 propietarios en mora (+3 meses)",
  "Recordatorio: asamblea en 3 dias",
];

export default function AdminPhDashboard() {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedPhId, setSelectedPhId] = useState<string | null>(null);
  const [showResetDemoModal, setShowResetDemoModal] = useState(false);
  const { showBanner, limits } = useUpgradeBanner(subscriptionId);

  const handleConfirmResetDemo = () => {
    // Solo restablece contadores/métricas mostrados; no borra residentes ni asambleas (diseño/datos se mantienen).
    if (typeof window !== "undefined") window.location.reload();
  };

  useEffect(() => {
    const stored = localStorage.getItem("assembly_subscription_id");
    setSubscriptionId(stored || "demo-subscription");
    const storedOrg = localStorage.getItem("assembly_organization_id");
    setOrganizationId(storedOrg || "demo-organization");
    const ph = typeof window !== "undefined" ? sessionStorage.getItem("assembly_admin_selected_ph") : null;
    setSelectedPhId(ph || null);
  }, []);

  const enterPh = (id: string) => {
    sessionStorage.setItem("assembly_admin_selected_ph", id);
    setSelectedPhId(id);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-selected", { detail: id }));
  };

  const showPhList = selectedPhId === null;
  const [isDemo, setIsDemo] = useState(() => typeof window !== "undefined" && isDemoResidentsContext());
  const [contextReady, setContextReady] = useState(() => typeof window !== "undefined");
  const [customPhList, setCustomPhList] = useState<PhItem[]>([]);
  const [showCreatePh, setShowCreatePh] = useState(false);
  const [newPhForm, setNewPhForm] = useState({
    name: "",
    direccion: "",
    cantidadResidentes: "",
    tipoPh: "Edificio" as PhItem["tipoPh"],
  });

  useEffect(() => {
    const demo = typeof window !== "undefined" && isDemoResidentsContext();
    setIsDemo(!!demo);
    setContextReady(true);
  }, []);

  useEffect(() => {
    setCustomPhList(loadCustomPhList());
  }, []);

  const basePhList = isDemo ? PH_LIST_DEMO : PH_LIST_FULL;
  const PH_LIST = useMemo(() => [...basePhList, ...customPhList], [basePhList, customPhList]);

  const planSuggestion = useMemo(() => {
    const n = parseInt(newPhForm.cantidadResidentes, 10);
    const hasResidents = !Number.isNaN(n) && n > 0;
    const pagoUnico = PLANS.filter((p) => p.billing === "one-time" && (p.limits.maxPropertiesPerAssembly === "unlimited" || (typeof p.limits.maxPropertiesPerAssembly === "number" && n <= p.limits.maxPropertiesPerAssembly)));
    const mensual = PLANS.filter((p) => p.billing === "monthly" && (p.limits.maxPropertiesPerAssembly === "unlimited" || (typeof p.limits.maxPropertiesPerAssembly === "number" && n <= p.limits.maxPropertiesPerAssembly)));
    const needsMultiPh = !Number.isNaN(n) && n > 250;
    return { hasResidents, n, pagoUnico, mensual, needsMultiPh };
  }, [newPhForm.cantidadResidentes]);

  const handleCreatePh = () => {
    const name = newPhForm.name.trim();
    const residents = newPhForm.cantidadResidentes.trim();
    if (!name) return;
    const id = `ph_${Date.now()}`;
    const edificios = newPhForm.tipoPh === "Edificio" ? "1" : newPhForm.tipoPh === "Complejo de casas cerrado" ? "1" : "1";
    const newPh: PhItem = {
      id,
      name,
      edificios,
      propietarios: residents || "0",
      direccion: newPhForm.direccion.trim() || undefined,
      tipoPh: newPhForm.tipoPh,
    };
    const updated = [...customPhList, newPh];
    setCustomPhList(updated);
    saveCustomPhList(updated);
    setNewPhForm({ name: "", direccion: "", cantidadResidentes: "", tipoPh: "Edificio" });
    setShowCreatePh(false);
  };
  const [assemblies, setAssemblies] = useState<{ id: string; title: string; date: string; status: string; location?: string }[]>([]);
  const [residents, setResidents] = useState<{ payment_status?: string; face_id_enabled?: boolean }[]>([]);
  const [abandonEvents, setAbandonEvents] = useState<{ abandoned_at: string }[]>([]);
  const now = useMemo(() => new Date(), []);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const todayLabel = useMemo(() => {
    const s = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [now]);
  const refreshAssemblies = () => setAssemblies(getAssemblies());
  const refreshResidents = () => {
    if (typeof window !== "undefined" && isDemoResidentsContext()) {
      try {
        setResidents(getDemoResidents());
      } catch {
        setResidents([]);
      }
    }
  };
  useEffect(() => {
    refreshAssemblies();
  }, []);
  useEffect(() => {
    refreshResidents();
  }, []);
  useEffect(() => {
    if (!selectedPhId || !organizationId) return;
    const orgId = organizationId === "demo-organization" ? DEMO_ORG_ID : organizationId;
    let active = true;
    fetch(`/api/resident-abandon?organizationId=${encodeURIComponent(orgId)}`)
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (active && Array.isArray(data?.events)) setAbandonEvents(data.events);
      })
      .catch(() => {
        if (active) setAbandonEvents([]);
      });
    return () => { active = false; };
  }, [selectedPhId, organizationId]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onVisibility = () => {
      refreshAssemblies();
      refreshResidents();
    };
    const onResidentsChanged = () => {
      refreshResidents();
      refreshAssemblies();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("admin-ph-residents-changed", onResidentsChanged);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("admin-ph-residents-changed", onResidentsChanged);
    };
  }, []);
  const nextAssembly = useMemo(
    () => assemblies.find((a) => a.status !== "Completada") ?? null,
    [assemblies],
  );
  const completedCount = useMemo(() => assemblies.filter((a) => a.status === "Completada").length, [assemblies]);
  const scheduledOrLiveCount = useMemo(() => assemblies.filter((a) => a.status === "Programada" || a.status === "En vivo").length, [assemblies]);
  const totalResidents = residents.length;
  const residentsAlDia = useMemo(() => residents.filter((r) => r.payment_status !== "mora").length, [residents]);
  const residentsFaceId = useMemo(() => residents.filter((r) => r.face_id_enabled).length, [residents]);
  const morososCount = useMemo(() => totalResidents - residentsAlDia, [totalResidents, residentsAlDia]);
  const sinFaceIdCount = useMemo(() => totalResidents - residentsFaceId, [totalResidents, residentsFaceId]);
  const assemblyIdForLinks = nextAssembly?.id ?? "demo";
  const hrefVerDetalle = nextAssembly ? `/dashboard/admin-ph/assemblies/${nextAssembly.id}` : "/dashboard/admin-ph/assemblies";
  const hrefIniciar = nextAssembly ? `/dashboard/admin-ph/assembly/${nextAssembly.id}/live` : "/dashboard/admin-ph/assemblies";
  const hrefMonitor = nextAssembly ? `/dashboard/admin-ph/monitor/votacion/${encodeURIComponent(nextAssembly.id)}` : "/dashboard/admin-ph/monitor/votacion";
  const kpisFromData = isDemo && residents.length > 0 ? [
    { label: "Propietarios activos", value: String(totalResidents), note: `${residentsAlDia} al día` },
    { label: "Asambleas 2026", value: String(assemblies.length), note: scheduledOrLiveCount > 0 ? `${scheduledOrLiveCount} programada(s)` : completedCount > 0 ? `${completedCount} completada(s)` : "sin asambleas" },
    { label: "Face ID activo", value: String(residentsFaceId), note: totalResidents ? `${Math.round((residentsFaceId / totalResidents) * 100)}% configurado` : "—" },
    { label: "En mora", value: String(morososCount), note: morososCount > 0 ? "no votan (solo asistencia)" : "al día" },
  ] : null;
  const KPIS = kpisFromData ?? (isDemo ? KPIS_DEMO : KPIS_FULL);
  const alertsFromData = useMemo(() => {
    if (!isDemo || residents.length === 0) return null;
    const list: string[] = [];
    if (morososCount > 0) list.push(`${morososCount} propietario(s) en mora (no votan, solo asistencia)`);
    if (sinFaceIdCount > 0) list.push(`${sinFaceIdCount} propietario(s) sin Face ID configurado`);
    if (nextAssembly && nextAssembly.date) {
      const days = Math.ceil((new Date(nextAssembly.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      if (days >= 0 && days <= 7) list.push(`Recordatorio: asamblea en ${days === 0 ? "hoy" : days === 1 ? "1 día" : `${days} días`}`);
    }
    return list.length > 0 ? list : null;
  }, [isDemo, residents.length, morososCount, sinFaceIdCount, nextAssembly]);
  const ALERTS = alertsFromData ?? (isDemo ? ALERTS_DEMO : ALERTS_FULL);
  const nextAssemblyElectors = isDemo && residents.length > 0 ? residentsAlDia : (isDemo ? DEMO_RESIDENTS : 170);
  const nextAssemblyFaceId = isDemo && residents.length > 0 ? residentsFaceId : (isDemo ? Math.round(DEMO_RESIDENTS * 0.65) : 130);

  const assembliesInFilter = useMemo(() => {
    return assemblies.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMonth;
    });
  }, [assemblies, filterYear, filterMonth]);
  const celebradas = useMemo(() => assembliesInFilter.filter((a) => a.status === "Completada"), [assembliesInFilter]);
  const canceladas = useMemo(() => assembliesInFilter.filter((a) => (a as { canceled?: boolean }).canceled), [assembliesInFilter]);
  const abandonosInPeriod = useMemo(() => {
    return abandonEvents.filter((e) => {
      const d = new Date(e.abandoned_at);
      return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMonth;
    });
  }, [abandonEvents, filterYear, filterMonth]);
  const promedioAbandonoPorAsamblea = celebradas.length > 0
    ? (abandonosInPeriod.length / celebradas.length).toFixed(1)
    : "—";
  const yearsForFilter = useMemo(() => {
    const y = now.getFullYear();
    return [y - 1, y, y + 1];
  }, [now]);
  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <>
      {contextReady && showPhList && <DemoBanner />}
      {!contextReady ? (
        <div className="card dashboard-widget">
          <p className="muted" style={{ margin: 0 }}>Cargando panel…</p>
        </div>
      ) : showPhList ? (
        <div className="card dashboard-widget">
          <h2>Tus propiedades horizontales</h2>
          <p className="muted" style={{ margin: "0 0 20px" }}>
            Elige el PH para ver su dashboard o crea una nueva propiedad.
          </p>
          <div style={{ display: "grid", gap: "12px" }}>
            {PH_LIST.map((ph) => (
              <div
                key={ph.id}
                className="ph-card-widget"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="ph-card-icon">{ph.tipoPh === "Complejo de casas cerrado" ? "🏘️" : "🏢"}</div>
                  <div>
                    <strong>{ph.name}</strong>
                    <div className="muted" style={{ fontSize: "13px", marginTop: "2px" }}>
                      {ph.edificios} {ph.tipoPh === "Complejo de casas cerrado" ? "complejo" : "edificio"} · {ph.propietarios} propietarios
                      {isDemo && !ph.direccion ? " (demo)" : ""}
                      {ph.direccion ? ` · ${ph.direccion}` : ""}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => enterPh(ph.id)}>
                  Entrar al dashboard
                </button>
              </div>
            ))}
          </div>

          <div className="dashboard-create-ph-wrap">
            {!showCreatePh ? (
              <button type="button" className="btn btn-ghost btn-create-ph-trigger" onClick={() => setShowCreatePh(true)}>
                + Crear propiedad
              </button>
            ) : (
              <div className="create-ph-form card">
                <div className="create-ph-form-header">
                  <h3 className="create-ph-form-title">Crear propiedad horizontal</h3>
                  <p className="create-ph-form-desc">Completa los datos necesarios para registrar el PH.</p>
                </div>
                <div className="create-ph-form-fields">
                  <label className="create-ph-field">
                    <span className="create-ph-label">Nombre del PH <span className="create-ph-required">*</span></span>
                    <input
                      type="text"
                      className="create-ph-input"
                      value={newPhForm.name}
                      onChange={(e) => setNewPhForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ej. Urban Tower PH"
                    />
                  </label>
                  <label className="create-ph-field">
                    <span className="create-ph-label">Dirección</span>
                    <input
                      type="text"
                      className="create-ph-input"
                      value={newPhForm.direccion}
                      onChange={(e) => setNewPhForm((p) => ({ ...p, direccion: e.target.value }))}
                      placeholder="Ej. Av. Principal 123, Ciudad"
                    />
                  </label>
                  <div className="create-ph-field-row">
                    <label className="create-ph-field create-ph-field--narrow">
                      <span className="create-ph-label">Cantidad de residentes / propietarios</span>
                      <input
                        type="number"
                        min={1}
                        className="create-ph-input"
                        value={newPhForm.cantidadResidentes}
                        onChange={(e) => setNewPhForm((p) => ({ ...p, cantidadResidentes: e.target.value }))}
                        placeholder="Ej. 50"
                      />
                    </label>
                    <label className="create-ph-field create-ph-field--narrow">
                      <span className="create-ph-label">Tipo de PH</span>
                      <select
                        className="create-ph-input create-ph-select"
                        value={newPhForm.tipoPh}
                        onChange={(e) => setNewPhForm((p) => ({ ...p, tipoPh: e.target.value as PhItem["tipoPh"] }))}
                      >
                        <option value="Edificio">Edificio</option>
                        <option value="Complejo de casas cerrado">Complejo de casas cerrado</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </label>
                  </div>
                </div>

                {(planSuggestion.hasResidents || newPhForm.name.trim()) && (
                  <div className="create-ph-plan-suggestion card">
                    <h4 className="create-ph-plan-suggestion-title">💡 Sugerencia de plan</h4>
                    <p className="create-ph-plan-suggestion-desc muted">
                      Según los datos de tu PH{planSuggestion.hasResidents ? ` (${planSuggestion.n} residentes)` : ""}, te orientamos a elegir el tipo de suscripción que mejor se adapta:
                    </p>
                    <div className="create-ph-plan-suggestion-actions">
                      <Link className="btn btn-ghost btn-sm" href="/dashboard/admin-ph/subscription#pago-unico">
                        Pago único
                      </Link>
                      <span className="muted">Ideal para 1 o 2 asambleas al año. Sin cuota mensual.</span>
                    </div>
                    <div className="create-ph-plan-suggestion-actions">
                      <Link className="btn btn-primary btn-sm" href="/dashboard/admin-ph/subscription#suscripcion">
                        Plan mensual
                      </Link>
                      <span className="muted">Varias asambleas al año, histórico ilimitado y soporte prioritario.</span>
                    </div>
                    {planSuggestion.needsMultiPh && (
                      <p className="muted create-ph-plan-suggestion-note">
                        Con más de 250 unidades puedes revisar planes Multi-PH en <Link href="/dashboard/admin-ph/subscription#suscripcion">Suscripción</Link>.
                      </p>
                    )}
                  </div>
                )}

                <div className="create-ph-form-actions">
                  <button type="button" className="btn btn-primary" onClick={handleCreatePh}>
                    Guardar propiedad
                  </button>
                  <button type="button" className="btn btn-ghost create-ph-cancel" onClick={() => { setShowCreatePh(false); setNewPhForm({ name: "", direccion: "", cantidadResidentes: "", tipoPh: "Edificio" }); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card dashboard-current-ph" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span className="muted">
                PH actual: <strong>{PH_LIST.find((p) => p.id === selectedPhId)?.name ?? "Urban Tower PH"}</strong>
              </span>
              <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                Límites según tu plan: asambleas y lista de propietarios según suscripción (p. ej. pago único = 1 asamblea; Standard = 2/mes). <a href="/dashboard/admin-ph/subscription">Ver Suscripción</a>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                sessionStorage.removeItem("assembly_admin_selected_ph");
                setSelectedPhId(null);
                if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-selected"));
              }}
            >
              Cambiar PH
            </button>
          </div>
      {showBanner && !isDemo ? <UpgradeBanner limits={limits} /> : null}
      <div className="card dashboard-widget">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <span className="pill">Panel principal</span>
            <h1>Dashboard Admin PH</h1>
            <p className="muted" style={{ margin: 0 }}>
              Control total de asambleas, propietarios y votaciones en tiempo real.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" href="/dashboard/admin-ph/assemblies" scroll={true}>Ver asambleas</Link>
            {isDemo && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ border: "1px solid rgba(239, 68, 68, 0.35)", color: "#fca5a5", fontSize: "13px" }}
                onClick={() => setShowResetDemoModal(true)}
                title="Borra residentes y asambleas demo para que QA empiece desde cero"
              >
                Restablecer todo (demo)
              </button>
            )}
          </div>
        </div>
      </div>

      {showResetDemoModal && (
        <div
          className="profile-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}
          onClick={() => setShowResetDemoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-demo-title"
        >
          <div
            className="profile-modal-card"
            style={{ maxWidth: "420px", margin: 16, padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reset-demo-title" style={{ margin: "0 0 12px", fontSize: "1.2rem" }}>Restablecer data demo</h2>
            <p className="muted" style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: 1.5 }}>
              ¿Restablecer contadores y métricas del demo? Los datos (residentes, asambleas) se mantienen. La página se recargará.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowResetDemoModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none" }} onClick={handleConfirmResetDemo}>
                Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card dashboard-widget" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
          <span className="muted" style={{ fontSize: "14px" }}>
            <strong style={{ color: "var(--color-text, #e2e8f0)" }}>Hoy:</strong> {todayLabel}
          </span>
          <span className="muted" style={{ fontSize: "13px" }}>Filtro por periodo:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="create-ph-input create-ph-select"
            style={{ width: "auto", minWidth: "100px" }}
            aria-label="Año"
          >
            {yearsForFilter.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="create-ph-input create-ph-select"
            style={{ width: "auto", minWidth: "140px" }}
            aria-label="Mes"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-grid">
        {KPIS.map((item) => (
          <div key={item.label} className="card dashboard-kpi-widget">
            <p className="kpi-label">{item.label}</p>
            <h3 className="kpi-value">{item.value}</h3>
            <p className="kpi-note">{item.note}</p>
          </div>
        ))}
      </div>

      <AssemblyCreditsDisplay organizationId={organizationId} />

      {(isDemo && totalResidents > 0) && (
        <div className="card" style={{ borderLeft: "4px solid #6366f1", marginBottom: "16px" }}>
          <h3 style={{ marginTop: 0, fontSize: "15px" }}>Para coordinar la asamblea</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: "13px" }}>
            Resumen por nivel de importancia: quiénes pueden votar y quiénes solo asistencia.
          </p>
          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span>Al día (pueden votar)</span>
                <strong style={{ color: "#34d399" }}>{residentsAlDia}</strong>
              </div>
              <div style={{ height: "10px", borderRadius: "8px", background: "rgba(30, 41, 59, 0.8)", overflow: "hidden", display: "flex" }}>
                <span style={{ width: `${totalResidents ? (residentsAlDia / totalResidents) * 100 : 0}%`, background: "#34d399", borderRadius: "8px 0 0 8px" }} />
                <span style={{ width: `${totalResidents ? (morososCount / totalResidents) * 100 : 0}%`, background: "#64748b", borderRadius: residentsAlDia === 0 ? "8px" : "0 8px 8px 0" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span>En mora (solo asistencia)</span>
                <strong style={{ color: "#94a3b8" }}>{morososCount}</strong>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", paddingTop: "4px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
              <span>Face ID listos para voto</span>
              <strong>{residentsFaceId}</strong>
            </div>
          </div>
          <Link className="btn btn-ghost" style={{ marginTop: "12px", fontSize: "13px" }} href="/dashboard/admin-ph/owners">Ver listado de residentes</Link>
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <h3>Próxima Asamblea</h3>
          {nextAssembly ? (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                {nextAssembly.title} · {nextAssembly.date.replace("T", " ")}
              </p>
              <div className="card-list">
                <div className="list-item">
                  <span>👥</span>
                  <span>{nextAssemblyElectors} electores (solo al día)</span>
                </div>
                <div className="list-item">
                  <span>✅</span>
                  <span>{nextAssemblyFaceId} con Face ID configurado</span>
                </div>
                <div className="list-item">
                  <span>📍</span>
                  <span>{nextAssembly.location || "Salón de eventos - Piso 1"}</span>
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link className="btn btn-ghost" href={hrefVerDetalle} scroll={true}>Ver detalles</Link>
                <Link className="btn btn-primary" href={hrefIniciar} scroll={true}>Iniciar asamblea</Link>
                <Link className="btn btn-ghost" href={hrefMonitor} scroll={true}>Monitor</Link>
              </div>
            </>
          ) : (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                {assemblies.length === 0
                  ? "No hay asambleas. Cree una desde el módulo Asambleas."
                  : "No hay asamblea programada. Todas las asambleas están completadas."}
              </p>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/dashboard/admin-ph/assemblies" scroll={true}>Ver asambleas</Link>
                <Link className="btn btn-ghost" href="/dashboard/admin-ph/monitor/votacion" scroll={true}>Monitor</Link>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>Alertas Importantes</h3>
          <div className="card-list">
            {ALERTS.map((alert) => (
              <div key={alert} className="list-item">
                <span>🔔</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
          <a className="btn btn-ghost" style={{ marginTop: "16px" }} href="/dashboard/admin-ph/owners">
            Gestionar propietarios
          </a>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Asistencia últimas 5 asambleas</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Tendencia de quórums y participación.
          </p>
          <div className="chart-graph-wrap">
            <svg width="100%" height="140" viewBox="0 0 360 140" role="img" aria-label="Gráfica de asistencia">
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                points="0,100 60,90 120,110 180,70 240,60 300,85 360,55"
              />
              <circle cx="360" cy="55" r="4" fill="#6366f1" />
            </svg>
          </div>
          <div className="chart-bar">
            <span style={{ width: "74%" }} />
          </div>
          <p className="muted" style={{ margin: "10px 0 0" }}>
            Promedio de asistencia 74%
          </p>
        </div>
        <div className="chart-card">
          <h3>Estado de votaciones</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              { label: "Aprobación presupuesto 2026", value: 67 },
              { label: "Elección junta directiva", value: 58 },
              { label: "Acta anterior", value: 92 },
            ].map((item) => (
              <div key={item.label} className="chart-vote-row" style={{ display: "grid", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span>{item.label}</span>
                  <span className="muted">{item.value}%</span>
                </div>
                <div className="chart-bar">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <a className="btn btn-ghost" style={{ marginTop: "16px" }} href="/dashboard/admin-ph/votations">
            Ver resultados
          </a>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "16px" }}>
        <div className="card">
          <h3>Abandono de sala (chatbot)</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Residentes que se salieron de la sesión antes de finalizar la asamblea.
          </p>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(99, 102, 241, 0.12)", borderRadius: "10px" }}>
              <span>Abandonos {MONTHS[filterMonth - 1]} {filterYear}</span>
              <strong>{abandonosInPeriod.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Total abandonos (chatbot)</span>
              <span>{abandonEvents.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Promedio por asamblea celebrada</span>
              <span>{promedioAbandonoPorAsamblea}</span>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "12px", fontSize: "12px" }}>
            Residentes que cerraron sesión en el chatbot antes de finalizar la asamblea (abandono de sala).
          </p>
          <Link className="btn btn-ghost" style={{ marginTop: "12px" }} href={nextAssembly ? `/dashboard/admin-ph/monitor/${encodeURIComponent(nextAssembly.id)}/abandonos` : "/dashboard/admin-ph/monitor/demo/abandonos"}>
            Ver histórico de abandonos
          </Link>
        </div>
        <div className="card">
          <h3>Historial de asambleas</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Celebradas y canceladas · {MONTHS[filterMonth - 1]} {filterYear}
          </p>
          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "14px", margin: "0 0 8px", color: "var(--color-text, #e2e8f0)" }}>Celebradas</h4>
              {celebradas.length === 0 ? (
                <p className="muted" style={{ margin: 0, fontSize: "13px" }}>No hay asambleas celebradas en este periodo.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {celebradas.map((a) => (
                    <li key={a.id} style={{ marginBottom: "4px" }}>
                      <strong>{a.title}</strong>
                      <span className="muted" style={{ marginLeft: "8px", fontSize: "13px" }}>
                        {new Date(a.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 style={{ fontSize: "14px", margin: "0 0 8px", color: "var(--color-text, #e2e8f0)" }}>Canceladas</h4>
              {canceladas.length === 0 ? (
                <p className="muted" style={{ margin: 0, fontSize: "13px" }}>No hay asambleas canceladas en este periodo.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {canceladas.map((a) => (
                    <li key={a.id} style={{ marginBottom: "4px" }}>
                      <strong>{a.title}</strong>
                      <span className="muted" style={{ marginLeft: "8px", fontSize: "13px" }}>
                        {new Date(a.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Link className="btn btn-ghost" style={{ marginTop: "16px" }} href="/dashboard/admin-ph/assemblies">
            Ver todas las asambleas
          </Link>
        </div>
      </div>

      {isDemo && selectedPhId && (
        <div className="card" style={{ marginTop: "16px", borderColor: "rgba(148, 163, 184, 0.3)", background: "rgba(15, 23, 42, 0.35)" }}>
          <h3 style={{ marginTop: 0, fontSize: "15px" }}>Para QA: estado limpio</h3>
          <p className="muted" style={{ margin: "0 0 12px", fontSize: "13px" }}>
            Borra toda la data de residentes y asambleas (demo) para empezar la prueba desde cero: registrar usuarios, crear 2 asambleas y ejecutar el ciclo completo. Ver <strong>QA/MANUAL_QA_CICLO_COMPLETO_DEMO.md</strong>.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5" }}
            onClick={() => setShowResetDemoModal(true)}
          >
            Restablecer todo (demo)
          </button>
        </div>
      )}
        </>
      )}
    </>
  );
}
