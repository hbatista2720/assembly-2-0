"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import UpgradeBanner from "../../../components/UpgradeBanner";
import DemoBanner from "../../../components/DemoBanner";
import useUpgradeBanner from "../../../hooks/useUpgradeBanner";
import AssemblyCreditsDisplay from "../../../components/AssemblyCreditsDisplay";
import { getAssemblies } from "../../../lib/assembliesStore";
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
  const { showBanner, limits } = useUpgradeBanner(subscriptionId);

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
  const [isDemo, setIsDemo] = useState(false);
  const [customPhList, setCustomPhList] = useState<PhItem[]>([]);
  const [showCreatePh, setShowCreatePh] = useState(false);
  const [newPhForm, setNewPhForm] = useState({
    name: "",
    direccion: "",
    cantidadResidentes: "",
    tipoPh: "Edificio" as PhItem["tipoPh"],
  });

  useEffect(() => {
    const sub = localStorage.getItem("assembly_subscription_id");
    const org = localStorage.getItem("assembly_organization_id");
    const demo =
      sub === "demo-subscription" ||
      org === DEMO_ORG_ID ||
      org === "demo-organization" ||
      (typeof window !== "undefined" && window.location.search.includes("mode=demo"));
    setIsDemo(!!demo);
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
  const KPIS = isDemo ? KPIS_DEMO : KPIS_FULL;
  const ALERTS = isDemo ? ALERTS_DEMO : ALERTS_FULL;
  const nextAssemblyElectors = isDemo ? DEMO_RESIDENTS : 170;
  const nextAssemblyFaceId = isDemo ? Math.round(DEMO_RESIDENTS * 0.65) : 130;

  const [assemblies, setAssemblies] = useState<{ id: string; title: string; date: string; status: string }[]>([]);
  useEffect(() => {
    setAssemblies(getAssemblies());
  }, []);
  const nextAssembly = useMemo(
    () => assemblies.find((a) => a.status !== "Completada") ?? assemblies[0] ?? null,
    [assemblies],
  );
  const assemblyIdForLinks = nextAssembly?.id ?? "demo";
  const hrefVerDetalle = nextAssembly ? `/dashboard/admin-ph/assemblies/${nextAssembly.id}` : "/dashboard/admin-ph/assemblies";
  const hrefIniciar = nextAssembly ? `/dashboard/admin-ph/assembly/${nextAssembly.id}/live` : "/dashboard/admin-ph/assemblies";
  const hrefMonitor = `/dashboard/admin-ph/monitor/${encodeURIComponent(assemblyIdForLinks)}`;

  return (
    <>
      {showPhList && <DemoBanner />}
      {showPhList ? (
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
          </div>
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

      <div className="two-col">
        <div className="card">
          <h3>Próxima Asamblea</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            {nextAssembly ? `${nextAssembly.title} · ${nextAssembly.date.replace("T", " ")}` : "Ordinaria 2026 · 15 Feb 2026 · 6:00 PM"}
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
              <span>Salón de eventos - Piso 1</span>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" href={hrefVerDetalle} scroll={true}>Ver detalles</Link>
            <Link className="btn btn-primary" href={hrefIniciar} scroll={true}>Iniciar asamblea</Link>
            <Link className="btn btn-ghost" href={hrefMonitor} scroll={true}>Monitor</Link>
          </div>
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
        </>
      )}
    </>
  );
}
