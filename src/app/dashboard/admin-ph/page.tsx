"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpgradeBanner from "../../../components/UpgradeBanner";
import useUpgradeBanner from "../../../hooks/useUpgradeBanner";
import AssemblyCreditsDisplay from "../../../components/AssemblyCreditsDisplay";
import { getAssemblies } from "../../../lib/assembliesStore";
import { getDemoResidents, isDemoResidentsContext } from "../../../lib/demoResidentsStore";
import { PLANS } from "../../../lib/types/pricing";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_RESIDENTS = 50;

export type TipoComunidad = "EDIFICIO_PH" | "PLAZA" | "COMPLEJO_CASAS" | "CENTRO_COMERCIAL" | "OTRO";

type PhItem = {
  id: string;
  name: string;
  edificios: string;
  propietarios: string;
  direccion?: string;
  tipoPh?: TipoComunidad;
};

/** Etiquetas cortas para badge en tarjetas */
const TIPO_LABELS: Record<string, string> = {
  EDIFICIO_PH: "Edificio (PH)",
  PLAZA: "Plaza comercial",
  COMPLEJO_CASAS: "Complejo casas",
  CENTRO_COMERCIAL: "Centro comercial",
  OTRO: "Otro",
};

/** Opciones del dropdown según INSTRUCCIONES_CODER_TERMINOLOGIA_UNIFICADA_COMUNIDAD.md */
const TIPO_OPCIONES: { value: TipoComunidad; label: string }[] = [
  { value: "EDIFICIO_PH", label: "Edificio (PH)" },
  { value: "PLAZA", label: "Plaza comercial" },
  { value: "COMPLEJO_CASAS", label: "Complejo de casas cerrado" },
  { value: "CENTRO_COMERCIAL", label: "Centro comercial" },
  { value: "OTRO", label: "Otro" },
];

/** Normaliza valores legacy a tipo_comunidad actual */
function normalizeTipoPh(v: string | undefined): TipoComunidad {
  if (!v) return "EDIFICIO_PH";
  const map: Record<string, TipoComunidad> = {
    Edificio: "EDIFICIO_PH",
    PLAZA: "PLAZA",
    Plaza: "PLAZA",
    "Complejo de casas cerrado": "COMPLEJO_CASAS",
    COMPLEJO_CASAS: "COMPLEJO_CASAS",
    CENTRO_COMERCIAL: "CENTRO_COMERCIAL",
    Otro: "OTRO",
    OTRO: "OTRO",
    EDIFICIO_PH: "EDIFICIO_PH",
  };
  return map[v] ?? "EDIFICIO_PH";
}

const CUSTOM_PH_OVERRIDES_KEY = "assembly_admin_ph_overrides";
function loadPhOverrides(): Record<string, Partial<PhItem>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_PH_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PhItem>>;
    const out: Record<string, Partial<PhItem>> = {};
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = { ...v, tipoPh: v.tipoPh ? normalizeTipoPh(v.tipoPh) : undefined };
    }
    return out;
  } catch {
    return {};
  }
}
function savePhOverrides(overrides: Record<string, Partial<PhItem>>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PH_OVERRIDES_KEY, JSON.stringify(overrides));
}

const PH_LIST_FULL: PhItem[] = [{ id: "urban-tower", name: "Urban Tower PH", edificios: "1", propietarios: "200", tipoPh: "EDIFICIO_PH" }];
const PH_LIST_DEMO: PhItem[] = [{ id: "urban-tower", name: "Urban Tower PH", edificios: "1", propietarios: String(DEMO_RESIDENTS), tipoPh: "EDIFICIO_PH" }];

const CUSTOM_PH_STORAGE_KEY = "assembly_admin_ph_custom_properties";
const CUSTOM_PH_ARCHIVE_KEY = "assembly_admin_ph_custom_archive";
const REMINDERS_STORAGE_KEY = "assembly_admin_ph_reminders";

function loadArchivedCustomPhList(): PhItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PH_ARCHIVE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PhItem[];
    return list.map((ph) => ({
      ...ph,
      tipoPh: ph.tipoPh ? normalizeTipoPh(ph.tipoPh) : "EDIFICIO_PH",
    }));
  } catch {
    return [];
  }
}

function saveArchivedCustomPhList(list: PhItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PH_ARCHIVE_KEY, JSON.stringify(list));
}

const quickIconStyle = { width: 22, height: 22, minWidth: 22, minHeight: 22, color: "currentColor", flexShrink: 0 };
function QuickIconAssembly() {
  return <svg viewBox="0 0 24 24" style={quickIconStyle} fill="currentColor" aria-hidden><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
}
function QuickIconAdd() {
  return <svg viewBox="0 0 24 24" style={{ ...quickIconStyle, width: 20, height: 20 }} fill="currentColor" aria-hidden><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>;
}
function QuickIconUsers() {
  return <svg viewBox="0 0 24 24" style={quickIconStyle} fill="currentColor" aria-hidden><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
function QuickIconMonitor() {
  return <svg viewBox="0 0 24 24" style={quickIconStyle} fill="currentColor" aria-hidden><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2h2v-2h2v2h2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg>;
}
function QuickIconFile() {
  return <svg viewBox="0 0 24 24" style={quickIconStyle} fill="currentColor" aria-hidden><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
}
const kpiIconStyle = { width: 20, height: 20, minWidth: 20, minHeight: 20, color: "currentColor", flexShrink: 0, opacity: 0.85 };
function KpiIconUsers() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
function KpiIconAssembly() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
}
function KpiIconMora() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>;
}
function KpiIconElectors() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
function KpiIconCheck() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
}
function KpiIconLocation() {
  return <svg viewBox="0 0 24 24" style={kpiIconStyle} fill="currentColor" aria-hidden><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
}
function loadCustomPhList(): PhItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PH_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PhItem[];
    return list.map((ph) => ({
      ...ph,
      tipoPh: ph.tipoPh ? normalizeTipoPh(ph.tipoPh) : "EDIFICIO_PH",
    }));
  } catch {
    return [];
  }
}

function saveCustomPhList(list: PhItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_PH_STORAGE_KEY, JSON.stringify(list));
}

type ReminderItem = { id: string; text: string; checked: boolean };

function loadReminders(): ReminderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x: unknown, i: number) => {
      if (typeof x === "string") return { id: `r_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`, text: x, checked: false };
      if (x && typeof x === "object" && "text" in x && typeof (x as { text: string }).text === "string") {
        const o = x as { text: string; checked?: boolean; id?: string };
        return { id: o.id ?? `r_${Date.now()}_${Math.random().toString(36).slice(2)}`, text: o.text, checked: !!o.checked };
      }
      return null;
    }).filter(Boolean) as ReminderItem[];
  } catch {
    return [];
  }
}

function saveReminders(items: ReminderItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(items));
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
  const router = useRouter();
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("assembly_admin_selected_ph", id);
      sessionStorage.removeItem("assembly_admin_from_cambiar_ph");
      const ph = PH_LIST.find((p) => p.id === id);
      if (ph?.name) sessionStorage.setItem("assembly_admin_selected_ph_name", ph.name);
    }
    setSelectedPhId(id);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("admin-ph-selected", { detail: id }));
  };

  const showPhList = selectedPhId === null;
  const [isDemo, setIsDemo] = useState(() => typeof window !== "undefined" && isDemoResidentsContext());
  const [contextReady, setContextReady] = useState(() => typeof window !== "undefined");
  const [customPhList, setCustomPhList] = useState<PhItem[]>([]);
  const [archivedPhList, setArchivedPhList] = useState<PhItem[]>([]);
  const [showCreatePh, setShowCreatePh] = useState(false);
  const [showArchivedPh, setShowArchivedPh] = useState(false);
  const [reminderNotes, setReminderNotes] = useState<ReminderItem[]>([]);
  const [newPhForm, setNewPhForm] = useState({
    name: "",
    direccion: "",
    cantidadResidentes: "",
    tipoPh: "EDIFICIO_PH",
  });

  useEffect(() => {
    const demo = typeof window !== "undefined" && isDemoResidentsContext();
    setIsDemo(!!demo);
    setContextReady(true);
  }, []);

  useEffect(() => {
    setCustomPhList(loadCustomPhList());
    setArchivedPhList(loadArchivedCustomPhList());
    setReminderNotes(loadReminders());
  }, []);

  const basePhList = isDemo ? PH_LIST_DEMO : PH_LIST_FULL;
  const [phOverrides, setPhOverrides] = useState<Record<string, Partial<PhItem>>>(() => (typeof window !== "undefined" ? loadPhOverrides() : {}));
  const PH_LIST = useMemo(() => {
    const list = [...basePhList, ...customPhList];
    return list.map((ph) => ({ ...ph, ...phOverrides[ph.id] }));
  }, [basePhList, customPhList, phOverrides]);
  const [editPh, setEditPh] = useState<PhItem | null>(null);
  const [editPhForm, setEditPhForm] = useState({ name: "", direccion: "", cantidadResidentes: "", tipoPh: "EDIFICIO_PH" as TipoComunidad });
  const [deletePh, setDeletePh] = useState<PhItem | null>(null);
  const [deletePhConfirm, setDeletePhConfirm] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !selectedPhId) return;
    const name = sessionStorage.getItem("assembly_admin_selected_ph_name");
    if (!name) {
      const ph = PH_LIST.find((p) => p.id === selectedPhId);
      if (ph?.name) {
        sessionStorage.setItem("assembly_admin_selected_ph_name", ph.name);
        window.dispatchEvent(new CustomEvent("admin-ph-title-update"));
      }
    }
  }, [selectedPhId, PH_LIST]);

  const planSuggestion = useMemo(() => {
    const n = parseInt(newPhForm.cantidadResidentes, 10);
    const hasResidents = !Number.isNaN(n) && n > 0;
    const pagoUnico = PLANS.filter((p) => p.billing === "one-time" && (p.limits.maxPropertiesPerAssembly === "unlimited" || (typeof p.limits.maxPropertiesPerAssembly === "number" && n <= p.limits.maxPropertiesPerAssembly)));
    const mensual = PLANS.filter((p) => p.billing === "monthly" && (p.limits.maxPropertiesPerAssembly === "unlimited" || (typeof p.limits.maxPropertiesPerAssembly === "number" && n <= p.limits.maxPropertiesPerAssembly)));
    const needsMultiPh = !Number.isNaN(n) && n > 250;
    return { hasResidents, n, pagoUnico, mensual, needsMultiPh };
  }, [newPhForm.cantidadResidentes]);

  const orgLimitExceeded =
    limits?.organizations?.limit != null && PH_LIST.length >= limits.organizations.limit;

  const handleCreatePh = () => {
    const name = newPhForm.name.trim();
    const residents = newPhForm.cantidadResidentes.trim();
    if (!name) return;
    if (orgLimitExceeded) return;
    const id = `ph_${Date.now()}`;
    const edificios = "1";
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
    setNewPhForm({ name: "", direccion: "", cantidadResidentes: "", tipoPh: "EDIFICIO_PH" });
    setShowCreatePh(false);
  };

  const openEditPh = (ph: PhItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditPh(ph);
    setEditPhForm({
      name: ph.name,
      direccion: ph.direccion ?? "",
      cantidadResidentes: ph.propietarios ?? "",
      tipoPh: ph.tipoPh ? normalizeTipoPh(ph.tipoPh) : "EDIFICIO_PH",
    });
  };
  const handleSaveEditPh = () => {
    if (!editPh) return;
    const name = editPhForm.name.trim();
    if (!name) return;
    const isCustom = customPhList.some((c) => c.id === editPh.id);
    if (isCustom) {
      const updated = customPhList.map((c) =>
        c.id === editPh.id
          ? { ...c, name, direccion: editPhForm.direccion.trim() || undefined, propietarios: editPhForm.cantidadResidentes || "0", tipoPh: editPhForm.tipoPh }
          : c
      );
      setCustomPhList(updated);
      saveCustomPhList(updated);
    } else {
      const next = { ...phOverrides[editPh.id], name, direccion: editPhForm.direccion.trim() || undefined, propietarios: editPhForm.cantidadResidentes || "0", tipoPh: editPhForm.tipoPh };
      const updated = { ...phOverrides, [editPh.id]: next };
      setPhOverrides(updated);
      savePhOverrides(updated);
    }
    setEditPh(null);
  };

  const openDeletePh = (ph: PhItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePh(ph);
    setDeletePhConfirm("");
  };
  const handleConfirmDeletePh = () => {
    if (!deletePh || deletePhConfirm.trim().toUpperCase() !== "ELIMINAR") return;
    if (!deletePh.id.startsWith("ph_")) return; // solo comunidades custom eliminables
    const updated = customPhList.filter((c) => c.id !== deletePh.id);
    setCustomPhList(updated);
    saveCustomPhList(updated);
    const newArchived = [...archivedPhList, deletePh];
    setArchivedPhList(newArchived);
    saveArchivedCustomPhList(newArchived);
    setDeletePh(null);
    setDeletePhConfirm("");
  };

  const handleRestorePh = (ph: PhItem) => {
    const restored = [...customPhList, ph];
    setCustomPhList(restored);
    saveCustomPhList(restored);
    const newArchived = archivedPhList.filter((c) => c.id !== ph.id);
    setArchivedPhList(newArchived);
    saveArchivedCustomPhList(newArchived);
  };
  const canDeletePh = (ph: PhItem) => ph.id.startsWith("ph_");
  const [assemblies, setAssemblies] = useState<{ id: string; title: string; date: string; status: string; type?: string; location?: string }[]>([]);
  const [residents, setResidents] = useState<{ payment_status?: string; face_id_enabled?: boolean }[]>([]);
  const [abandonEvents, setAbandonEvents] = useState<{ abandoned_at: string }[]>([]);
  const [clientNow, setClientNow] = useState<Date | null>(null);
  const [filterYear, setFilterYear] = useState(2024);
  const [filterMonth, setFilterMonth] = useState(1);
  useLayoutEffect(() => {
    const d = new Date();
    setClientNow(d);
    setFilterYear(d.getFullYear());
    setFilterMonth(d.getMonth() + 1);
  }, []);
  const fallbackDate = useMemo(() => new Date(), []);
  const effectiveNow = clientNow ?? fallbackDate;
  const goToCurrentMonth = () => {
    const d = new Date();
    setFilterYear(d.getFullYear());
    setFilterMonth(d.getMonth() + 1);
  };
  const isFilterCurrentMonth = clientNow != null && filterYear === clientNow.getFullYear() && filterMonth === clientNow.getMonth() + 1;
  const todayLabel = useMemo(() => {
    const s = effectiveNow.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [effectiveNow]);
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
  }, [selectedPhId]);
  useEffect(() => {
    refreshResidents();
  }, [selectedPhId]);
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
  const upcomingAssemblies = useMemo(() => {
    const programadas = assemblies
      .filter((a) => (a.status === "Programada" || a.status === "En vivo") && new Date(a.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return programadas.slice(0, 3);
  }, [assemblies]);
  const upcomingAssembliesWithPh = useMemo(() => {
    const now = Date.now();
    const all: { id: string; title: string; date: string; status: string; phId: string; phName: string }[] = [];
    for (const ph of PH_LIST) {
      const list = getAssemblies(ph.id);
      const programadas = list
        .filter((a) => (a.status === "Programada" || a.status === "En vivo") && new Date(a.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const a of programadas) {
        all.push({ ...a, phId: ph.id, phName: ph.name });
      }
    }
    all.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
    return all.slice(0, 5);
  }, [PH_LIST, assemblies]);

  const goToProcesoAsamblea = (phId: string, phName: string, assemblyId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("assembly_admin_selected_ph", phId);
      sessionStorage.setItem("assembly_admin_selected_ph_name", phName);
      window.dispatchEvent(new CustomEvent("admin-ph-selected", { detail: phId }));
    }
    router.push(`/dashboard/admin-ph/proceso-asamblea?assemblyId=${assemblyId}`);
  };
  const countdownToNext = useMemo(() => {
    if (!nextAssembly?.date) return null;
    const ms = new Date(nextAssembly.date).getTime() - Date.now();
    const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
    if (days < 0) return null;
    if (days === 0) return "Hoy";
    if (days === 1) return "Mañana";
    if (days < 7) return `En ${days} días`;
    if (days < 30) return `En ${Math.floor(days / 7)} semana(s)`;
    return `En ${Math.floor(days / 30)} mes(es)`;
  }, [nextAssembly]);
  const completedCount = useMemo(() => assemblies.filter((a) => a.status === "Completada").length, [assemblies]);
  const scheduledOrLiveCount = useMemo(() => assemblies.filter((a) => a.status === "Programada" || a.status === "En vivo").length, [assemblies]);
  const totalResidents = residents.length;
  const residentsAlDia = useMemo(() => residents.filter((r) => r.payment_status !== "mora").length, [residents]);
  const residentsFaceId = useMemo(() => residents.filter((r) => r.face_id_enabled).length, [residents]);
  const morososCount = useMemo(() => totalResidents - residentsAlDia, [totalResidents, residentsAlDia]);
  const sinFaceIdCount = useMemo(() => totalResidents - residentsFaceId, [totalResidents, residentsFaceId]);
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
    const y = effectiveNow.getFullYear();
    return [y - 1, y, y + 1];
  }, [effectiveNow]);
  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <>
      {!contextReady ? (
        <div className="card dashboard-widget">
          <p className="muted" style={{ margin: 0 }}>Cargando panel…</p>
        </div>
      ) : showPhList ? (
        <>
          <div className="dashboard-widgets-row">
            <div className="dashboard-widget-card dashboard-widget-calendar">
              <div className="dashboard-widget-header">
                <span className="dashboard-widget-icon">📅</span>
                <h3>Calendario</h3>
              </div>
              <div className="dashboard-widget-calendar-body">
                <div className="dashboard-widget-today">{todayLabel}</div>
                {upcomingAssembliesWithPh.length === 0 ? (
                  <div className="dashboard-widget-upcoming">
                    <span className="muted">No hay asambleas programadas</span>
                  </div>
                ) : (
                  <div className="dashboard-widget-upcoming-list">
                    {upcomingAssembliesWithPh.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="dashboard-widget-event"
                        onClick={() => goToProcesoAsamblea(a.phId, a.phName, a.id)}
                        style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", appearance: "none", WebkitAppearance: "none" }}
                      >
                        <div className="dashboard-widget-event-date">
                          {new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          <span className="dashboard-widget-event-time">{new Date(a.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="dashboard-widget-event-content">
                          <strong>{a.title}</strong>
                          <span className="dashboard-widget-event-ph-badge" style={{ display: "block", fontSize: "12px", color: "#94a3b8", fontWeight: 500, marginTop: "4px" }}>
                            {a.phName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="dashboard-ph-header" style={{ marginTop: "24px" }}>
            <h2>Tus Comunidades</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Elige la comunidad para ver su panel o crea una nueva.
            </p>
          </div>

          <div className="dashboard-ph-cards-grid">
            {PH_LIST.map((ph) => {
              const phResidents = isDemo ? getDemoResidents(ph.id) : [];
              const phAssemblies = getAssemblies(ph.id);
              const phTotal = phResidents.length;
              const phAlDia = phResidents.filter((r) => r.payment_status !== "mora").length;
              const phMorosos = phTotal - phAlDia;
              const phFaceId = phResidents.filter((r) => r.face_id_enabled).length;
              const nextAsm = phAssemblies.find((a) => a.status !== "Completada") ?? null;
              const nextOrdinaria = phAssemblies.find((a) => a.type === "Ordinaria" && a.status !== "Completada" && new Date(a.date).getTime() >= Date.now()) ?? null;
              const lastOrdinariaYear = phAssemblies.filter((a) => a.type === "Ordinaria" && a.status === "Completada").map((a) => new Date(a.date).getFullYear()).sort((a, b) => b - a)[0];
              const currentYear = effectiveNow.getFullYear();
              const ordinariaPendiente = !nextOrdinaria && lastOrdinariaYear !== currentYear;
              const formatDate = (d: string) => {
                try {
                  const dt = new Date(d);
                  return dt.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                } catch {
                  return "—";
                }
              };
              return (
                <div key={ph.id} className="ph-card-modern" onClick={() => enterPh(ph.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enterPh(ph.id); } }}>
                  <div className="ph-card-modern-header">
                    <div className="ph-card-modern-icon">
                    {ph.tipoPh === "COMPLEJO_CASAS" ? "🏘️" : ph.tipoPh === "PLAZA" ? "🏪" : ph.tipoPh === "CENTRO_COMERCIAL" ? "🏬" : "🏢"}
                  </div>
                    <div className="ph-card-modern-title">{ph.name}</div>
                    <span className="ph-card-modern-badge">
                      {ph.edificios} edificio{ph.edificios !== "1" ? "s" : ""} · {ph.propietarios} prop.
                      {ph.tipoPh ? ` · ${TIPO_LABELS[ph.tipoPh] ?? ph.tipoPh}` : ""}
                    </span>
                  </div>
                  <div className="ph-card-assembly-alert">
                    <span className="ph-card-assembly-alert-icon">⚠️</span>
                    <div className="ph-card-assembly-alert-content">
                      <strong>Asamblea Ordinaria:</strong> obligatoria 1 vez/año (Ley 284). Coordinar con tiempo.
                      {nextOrdinaria ? (
                        <span className="ph-card-assembly-alert-date"> Próxima: {formatDate(nextOrdinaria.date)}</span>
                      ) : ordinariaPendiente ? (
                        <span className="ph-card-assembly-alert-pending"> Pendiente para {currentYear}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="ph-card-modern-indicators">
                    <div className="ph-card-indicator">
                      <span className="ph-card-indicator-label">Próx. asamblea</span>
                      <span className="ph-card-indicator-value">{nextAsm ? formatDate(nextAsm.date) : "—"}</span>
                    </div>
                    <div className="ph-card-indicator">
                      <span className="ph-card-indicator-label">Al día</span>
                      <span className="ph-card-indicator-value" style={{ color: "#34d399" }}>{isDemo ? phAlDia : "—"}</span>
                    </div>
                    <div className="ph-card-indicator">
                      <span className="ph-card-indicator-label">En mora</span>
                      <span className="ph-card-indicator-value" style={{ color: phMorosos > 0 ? "#f87171" : "#94a3b8" }}>{isDemo ? phMorosos : "—"}</span>
                    </div>
                    <div className="ph-card-indicator">
                      <span className="ph-card-indicator-label">Face ID</span>
                      <span className="ph-card-indicator-value">{isDemo && phTotal > 0 ? `${Math.round((phFaceId / phTotal) * 100)}%` : "—"}</span>
                    </div>
                  </div>
                  <div className="ph-card-modern-footer">
                    <button type="button" className="btn btn-primary ph-card-btn" onClick={(e) => { e.stopPropagation(); enterPh(ph.id); }}>
                      Entrar al panel
                    </button>
                    <div className="ph-card-actions-secondary">
                      <button type="button" className="btn btn-ghost btn-sm ph-card-action-btn" onClick={(e) => openEditPh(ph, e)} title="Editar comunidad">
                        Editar
                      </button>
                      {canDeletePh(ph) && (
                        <button type="button" className="btn btn-ghost btn-sm ph-card-action-btn ph-card-delete-btn" onClick={(e) => openDeletePh(ph, e)} title="Eliminar comunidad (se mueve al archivo y puedes restaurarla)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: "middle" }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {archivedPhList.length > 0 && (
            <div className="ph-archived-section card" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="ph-archived-toggle"
                onClick={() => setShowArchivedPh(!showArchivedPh)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", textAlign: "left" }}
              >
                <span>📁 Comunidades eliminadas ({archivedPhList.length})</span>
                <span aria-hidden>{showArchivedPh ? "▼" : "▶"}</span>
              </button>
              {showArchivedPh && (
                <div className="ph-archived-list" style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
                  <p className="muted" style={{ fontSize: "13px", margin: "12px 0 8px" }}>
                    Puede restaurar una comunidad si fue eliminada por error. Los datos se guardan en el navegador (localStorage).
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {archivedPhList.map((ph) => (
                      <div key={ph.id} className="ph-archived-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(30,41,59,0.5)", borderRadius: 8, border: "1px solid rgba(148,163,184,0.15)" }}>
                        <span>{ph.name}</span>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleRestorePh(ph)} title="Restaurar comunidad">
                          Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="dashboard-create-ph-wrap">
            {!showCreatePh ? (
              <button type="button" className="btn btn-ghost btn-create-ph-trigger" onClick={() => setShowCreatePh(true)}>
                + Crear comunidad
              </button>
            ) : (
              <div className="create-ph-form card">
                <div className="create-ph-form-header">
                  <h3 className="create-ph-form-title">Crear comunidad</h3>
                  <p className="create-ph-form-desc">Completa los datos necesarios para registrar la comunidad.</p>
                </div>
                <div className="create-ph-form-fields">
                  <label className="create-ph-field">
                    <span className="create-ph-label">Nombre de la comunidad <span className="create-ph-required">*</span></span>
                    <input
                      type="text"
                      className="create-ph-input"
                      value={newPhForm.name}
                      onChange={(e) => setNewPhForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ej. Urban Tower"
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
                      <span className="create-ph-label">Tipo de comunidad</span>
                      <select
                        className="create-ph-input create-ph-select"
                        value={newPhForm.tipoPh}
                        onChange={(e) => setNewPhForm((p) => ({ ...p, tipoPh: e.target.value as TipoComunidad }))}
                      >
                        {TIPO_OPCIONES.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
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
                    Crear comunidad
                  </button>
                  <button type="button" className="btn btn-ghost create-ph-cancel" onClick={() => { setShowCreatePh(false); setNewPhForm({ name: "", direccion: "", cantidadResidentes: "", tipoPh: "EDIFICIO_PH" }); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {archivedPhList.length > 0 && (
            <div className="ph-archived-section card" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="ph-archived-toggle"
                onClick={() => setShowArchivedPh(!showArchivedPh)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", color: "inherit", font: "inherit", textAlign: "left" }}
              >
                <span className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden>📁</span>
                  Comunidades eliminadas ({archivedPhList.length})
                </span>
                <span aria-hidden style={{ opacity: 0.7 }}>{showArchivedPh ? "▼" : "▶"}</span>
              </button>
              {showArchivedPh && (
                <div className="ph-archived-list" style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
                  <p className="muted" style={{ margin: "12px 0 8px", fontSize: 13 }}>
                    Puedes restaurar comunidades que eliminaste por error.
                  </p>
                  {archivedPhList.map((ph) => (
                    <div key={ph.id} className="ph-archived-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(30,41,59,0.5)", borderRadius: 10, marginBottom: 8, gap: 12 }}>
                      <span>{ph.name}</span>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleRestorePh(ph)}>
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {editPh && (
            <div className="profile-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }} onClick={() => setEditPh(null)} role="dialog" aria-modal="true" aria-labelledby="edit-ph-title">
              <div className="profile-modal-card" style={{ maxWidth: "420px", margin: 16, padding: "24px" }} onClick={(e) => e.stopPropagation()}>
                <h2 id="edit-ph-title" style={{ margin: "0 0 12px", fontSize: "1.2rem" }}>Editar comunidad</h2>
                <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>Modifica los datos de la comunidad.</p>
                <div className="create-ph-form-fields" style={{ marginBottom: 16 }}>
                  <label className="create-ph-field">
                    <span className="create-ph-label">Nombre <span className="create-ph-required">*</span></span>
                    <input type="text" className="create-ph-input" value={editPhForm.name} onChange={(e) => setEditPhForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ej. Urban Tower" />
                  </label>
                  <label className="create-ph-field">
                    <span className="create-ph-label">Dirección</span>
                    <input type="text" className="create-ph-input" value={editPhForm.direccion} onChange={(e) => setEditPhForm((p) => ({ ...p, direccion: e.target.value }))} placeholder="Ej. Av. Principal 123" />
                  </label>
                  <div className="create-ph-field-row">
                    <label className="create-ph-field create-ph-field--narrow">
                      <span className="create-ph-label">Cantidad de residentes / propietarios</span>
                      <input type="number" min={1} className="create-ph-input" value={editPhForm.cantidadResidentes} onChange={(e) => setEditPhForm((p) => ({ ...p, cantidadResidentes: e.target.value }))} placeholder="Ej. 50" />
                    </label>
                    <label className="create-ph-field create-ph-field--narrow">
                      <span className="create-ph-label">Tipo de comunidad</span>
                      <select className="create-ph-input create-ph-select" value={editPhForm.tipoPh} onChange={(e) => setEditPhForm((p) => ({ ...p, tipoPh: e.target.value as TipoComunidad }))}>
                        {TIPO_OPCIONES.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-primary" onClick={handleSaveEditPh}>Guardar</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditPh(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {deletePh && (
            <div className="profile-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }} onClick={() => setDeletePh(null)} role="dialog" aria-modal="true" aria-labelledby="delete-ph-title">
              <div className="profile-modal-card" style={{ maxWidth: "420px", margin: 16, padding: "24px" }} onClick={(e) => e.stopPropagation()}>
                <h2 id="delete-ph-title" style={{ margin: "0 0 12px", fontSize: "1.2rem", color: "#f87171" }}>Eliminar comunidad</h2>
                <p className="muted" style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: 1.5 }}>
                  <strong>Advertencia:</strong> La comunidad &quot;{deletePh.name}&quot; se moverá al archivo temporal. Podrás restaurarla desde la sección &quot;Comunidades eliminadas&quot; si fue por error.
                </p>
                <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>
                  Escribe <strong>ELIMINAR</strong> para confirmar:
                </p>
                <input
                  type="text"
                  className="create-ph-input"
                  value={deletePhConfirm}
                  onChange={(e) => setDeletePhConfirm(e.target.value)}
                  placeholder="ELIMINAR"
                  style={{ marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn" style={{ background: "#dc2626", color: "white", border: "none" }} onClick={handleConfirmDeletePh} disabled={deletePhConfirm.trim().toUpperCase() !== "ELIMINAR"}>
                    Mover al archivo
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setDeletePh(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card dashboard-current-ph" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span className="muted">
                Comunidad actual: <strong>{PH_LIST.find((p) => p.id === selectedPhId)?.name ?? "Urban Tower"}</strong>
              </span>
              <div className="muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                Límites según tu plan: asambleas y lista de propietarios según suscripción (p. ej. pago único = 1 asamblea; Standard = 2/mes). <a href="/dashboard/admin-ph/subscription">Ver Suscripción</a>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("assembly_admin_selected_ph");
                  sessionStorage.removeItem("assembly_admin_selected_ph_name");
                  sessionStorage.setItem("assembly_admin_from_cambiar_ph", "1");
                  window.dispatchEvent(new CustomEvent("admin-ph-selected"));
                }
                setSelectedPhId(null);
              }}
            >
              Cambiar Comunidad
            </button>
          </div>
      {showBanner && !isDemo ? <UpgradeBanner limits={limits} /> : null}
      <Link
        href="/dashboard/admin-ph/proceso-asamblea"
        className="card dashboard-widget"
        scroll={true}
        style={{
          padding: "20px 24px",
          display: "block",
          textDecoration: "none",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#a5b4fc" }}>Proceso de Asamblea</h3>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
              Gestiona el ciclo completo paso a paso: residentes, crear, agendar, monitor y acta.
            </p>
          </div>
          <span className="btn btn-primary" style={{ borderRadius: "999px", padding: "12px 24px" }}>
            Iniciar proceso →
          </span>
        </div>
      </Link>
      {isDemo && (
        <div style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ border: "1px solid rgba(239, 68, 68, 0.35)", color: "#fca5a5", fontSize: "13px" }}
            onClick={() => setShowResetDemoModal(true)}
            title="Borra residentes y asambleas demo para que QA empiece desde cero"
          >
            Restablecer todo (demo)
          </button>
        </div>
      )}

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

      <div className="ph-dashboard-widgets-group">
        <div className="ph-widgets-grid">
          <div className="ph-widget-card">
            <span className="ph-widget-icon" aria-hidden><KpiIconUsers /></span>
            <p className="ph-widget-label">Propietarios</p>
            <h3 className="ph-widget-value">{KPIS[0]?.value}</h3>
            <p className="ph-widget-note">{KPIS[0]?.note}</p>
          </div>
          <div className="ph-widget-card">
            <span className="ph-widget-icon" aria-hidden><KpiIconAssembly /></span>
            <p className="ph-widget-label">Asambleas</p>
            <h3 className="ph-widget-value">{KPIS[1]?.value}</h3>
            <p className="ph-widget-note">{KPIS[1]?.note}</p>
          </div>
          <div className="ph-widget-card">
            <span className="ph-widget-icon" aria-hidden><KpiIconMora /></span>
            <p className="ph-widget-label">En mora</p>
            <h3 className="ph-widget-value">{KPIS[3]?.value}</h3>
            <p className="ph-widget-note">{KPIS[3]?.note}</p>
          </div>
          <div className="ph-widget-card ph-widget-card--proxima">
            <div className="ph-widget-header">
              <span className="ph-widget-icon" aria-hidden><KpiIconAssembly /></span>
              <h3 className="ph-widget-title">Próxima Asamblea</h3>
              {nextAssembly && countdownToNext && (
                <span className="ph-widget-countdown">{countdownToNext}</span>
              )}
            </div>
            {nextAssembly ? (
              <div className="ph-widget-proxima-content">
                <p className="ph-widget-proxima-title">{nextAssembly.title}</p>
                <div className="ph-widget-proxima-date">
                  {new Date(nextAssembly.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })} · {new Date(nextAssembly.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="ph-widget-indicators">
                  <div className="ph-widget-indicator">
                    <span className="ph-widget-indicator-label">Electores</span>
                    <span className="ph-widget-indicator-value">{nextAssemblyElectors}/{totalResidents || nextAssemblyElectors}</span>
                    <div className="ph-widget-progress">
                      <div className="ph-widget-progress-fill" style={{ width: `${totalResidents > 0 ? Math.min(100, (nextAssemblyElectors / totalResidents) * 100) : 100}%` }} />
                    </div>
                  </div>
                  <div className="ph-widget-indicator">
                    <span className="ph-widget-indicator-label">Face ID</span>
                    <span className="ph-widget-indicator-value">{nextAssemblyFaceId}/{totalResidents || nextAssemblyFaceId}</span>
                    <div className="ph-widget-progress">
                      <div className="ph-widget-progress-fill ph-widget-progress-fill--green" style={{ width: `${totalResidents > 0 ? Math.min(100, (nextAssemblyFaceId / totalResidents) * 100) : 70}%` }} />
                    </div>
                  </div>
                </div>
                <div className="ph-widget-location">
                  <span className="ph-widget-location-icon" aria-hidden><KpiIconLocation /></span>
                  <span>{nextAssembly.location || "Salón de eventos"}</span>
                </div>
                <Link className="ph-widget-cta btn btn-primary" href={`/dashboard/admin-ph/proceso-asamblea?assemblyId=${nextAssembly.id}&step=4`} scroll={true}>
                  Ir al Proceso →
                </Link>
              </div>
            ) : (
              <div className="ph-widget-proxima-content">
                <p className="ph-widget-proxima-empty">
                  {assemblies.length === 0 ? "Crear asamblea" : "Todas completadas"}
                </p>
                <Link className="ph-widget-cta btn btn-primary" href="/dashboard/admin-ph/proceso-asamblea" scroll={true}>
                  Abrir Proceso
                </Link>
              </div>
            )}
          </div>
        </div>

        <AssemblyCreditsDisplay organizationId={organizationId} />
      </div>


        </>
      )}
    </>
  );
}
