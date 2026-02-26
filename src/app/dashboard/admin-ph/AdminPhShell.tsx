"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getStoredTheme, setStoredTheme } from "../../ThemeInit";

const AdminSupportChatWidget = dynamic(
  () => import("../../../components/AdminSupportChatWidget"),
  { ssr: false, loading: () => null }
);

const iconStyle: React.CSSProperties = { width: 22, height: 22, minWidth: 22, minHeight: 22, color: "currentColor", flexShrink: 0, display: "block", objectFit: "contain" };

const NavIcons: Record<string, () => JSX.Element> = {
  dashboard: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
  ),
  document: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
  ),
  building: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
  ),
  calendar: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
  ),
  vote: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
  ),
  monitor: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2h2v-2h2v2h2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg>
  ),
  file: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
  ),
  chart: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
  ),
  team: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
  ),
  settings: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
  ),
  support: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
  ),
  add: () => (
    <svg viewBox="0 0 24 24" style={{ ...iconStyle, width: 20, height: 20 }} fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
  ),
  cart: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
};

function getInitials(email: string): string {
  const part = (email.split("@")[0] || "A").trim();
  if (part.length >= 2) return (part[0]! + part[1]!).toUpperCase().slice(0, 2);
  return (part[0] || "A").toUpperCase();
}

function DateTimeIndicator({ compact }: { compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (compact) {
    return (
      <span className="date-time-indicator date-time-compact" title={dateStr}>
        <span aria-hidden>📅</span> {dateStr} · {timeStr}
      </span>
    );
  }
  return (
    <div className="date-time-indicator" title="Fecha y hora actual">
      <span className="date-time-calendar" aria-hidden>📅</span>
      <div>
        <div className="date-time-date">{dateStr}</div>
        <div className="date-time-time">{timeStr}</div>
      </div>
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  iconKey: string;
  match: (pathname: string) => boolean;
  requiresManageTeam?: boolean;
  showWhenNoPh?: boolean;
  /** Mostrar también cuando estamos en una ruta de módulo PH (proceso-asamblea, owners, etc.) aunque no haya PH seleccionado, para poder navegar. */
  showWhenInPhRoute?: boolean;
};

const PH_MODULE_PATHS = [
  "/dashboard/admin-ph/proceso-asamblea",
  "/dashboard/admin-ph/owners",
  "/dashboard/admin-ph/assemblies",
  "/dashboard/admin-ph/monitor",
  "/dashboard/admin-ph/acts",
  "/dashboard/admin-ph/assembly",
  "/dashboard/admin-ph/reports",
  "/dashboard/admin-ph/team",
  "/dashboard/admin-ph/settings",
  "/dashboard/admin-ph/support",
] as const;

function isInPhModuleRoute(pathname: string): boolean {
  return PH_MODULE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/admin-ph", label: "Dashboard principal", iconKey: "dashboard", match: (p) => p === "/dashboard/admin-ph", showWhenInPhRoute: true },
  { href: "/dashboard/admin-ph", label: "Tus propiedades", iconKey: "building", match: (p) => p === "/dashboard/admin-ph", showWhenNoPh: true, showWhenInPhRoute: true },
  { href: "/dashboard/admin-ph/subscription", label: "Suscripciones", iconKey: "document", match: (p) => p.startsWith("/dashboard/admin-ph/subscription"), showWhenNoPh: true },
  { href: "/dashboard/admin-ph/reports", label: "Reportes", iconKey: "chart", match: (p) => p.startsWith("/dashboard/admin-ph/reports"), showWhenInPhRoute: true },
  { href: "/dashboard/admin-ph/team", label: "Equipo", iconKey: "team", match: (p) => p.startsWith("/dashboard/admin-ph/team"), requiresManageTeam: true, showWhenInPhRoute: true },
  { href: "/dashboard/admin-ph/settings", label: "Configuración", iconKey: "settings", match: (p) => p.startsWith("/dashboard/admin-ph/settings"), showWhenInPhRoute: true },
  { href: "/dashboard/admin-ph/support", label: "Soporte", iconKey: "support", match: (p) => p.startsWith("/dashboard/admin-ph/support"), showWhenInPhRoute: true },
];

/** Enlace(s) "Volver" según la ruta: primero al módulo, luego al Dashboard PH. En la base no se muestra enlace, sino título y subtítulo. */
function getBackLinks(pathname: string, searchParams?: URLSearchParams | null): { href: string; label: string }[] {
  const base = "/dashboard/admin-ph";
  if (pathname === base) {
    return [];
  }
  // Propietarios: si viene del wizard, ofrecer volver al Proceso de Asamblea
  if (pathname.startsWith(base + "/owners")) {
    const from = searchParams?.get("from");
    const assemblyId = searchParams?.get("assemblyId");
    if (from === "proceso-asamblea") {
      const wizardHref = assemblyId ? `${base}/proceso-asamblea?assemblyId=${assemblyId}` : base + "/proceso-asamblea";
      return [
        { href: wizardHref, label: "← Volver a Proceso de Asamblea" },
        { href: base, label: "Panel de la Comunidad" },
      ];
    }
    return [{ href: base, label: "← Volver al Panel de la Comunidad" }];
  }
  // Dentro del monitor de una asamblea (o abandonos / modificaciones) → listado Monitor (acción secundaria; la prioridad es "Volver al Monitor" en la página)
  if (pathname.startsWith(base + "/monitor/") && pathname !== base + "/monitor") {
    return [
      { href: base + "/monitor", label: "Listado Monitor" },
      { href: base, label: "Panel de la Comunidad" },
    ];
  }
  // Listado Monitor Back Office
  if (pathname === base + "/monitor") {
    return [{ href: base, label: "← Volver al Panel de la Comunidad" }];
  }
  // Proceso de Asamblea (wizard)
  if (pathname.startsWith(base + "/proceso-asamblea")) {
    if (pathname === base + "/proceso-asamblea") {
      return [{ href: base, label: "← Volver al Panel de la Comunidad" }];
    }
    return [
      { href: base, label: "← Volver al Panel de la Comunidad" },
      { href: base + "/proceso-asamblea", label: "Proceso de Asamblea" },
    ];
  }
  // Listado asambleas o detalle/voto de una asamblea → volver a Asambleas
  if (pathname.startsWith(base + "/assemblies")) {
    if (pathname === base + "/assemblies") {
      return [{ href: base, label: "← Volver al Panel de la Comunidad" }];
    }
    return [
      { href: base + "/assemblies", label: "← Volver a Asambleas" },
      { href: base, label: "Panel de la Comunidad" },
    ];
  }
  // Vista en vivo de una asamblea (Iniciar asamblea)
  if (pathname.startsWith(base + "/assembly/") && pathname.includes("/live")) {
    return [
      { href: base + "/assemblies", label: "← Volver a Asambleas" },
      { href: base, label: "Panel de la Comunidad" },
    ];
  }
  // Suscripción > units-addon
  if (pathname.startsWith(base + "/subscription/") && pathname !== base + "/subscription") {
    return [
      { href: base + "/subscription", label: "← Volver a Suscripción" },
      { href: base, label: "Panel de la Comunidad" },
    ];
  }
  // Raíz de otros módulos (monitor list, acts, reports, etc.) → volver al Panel de la Comunidad
  if (pathname.startsWith(base + "/")) {
    return [{ href: base, label: "← Volver al Panel de la Comunidad" }];
  }
  return [];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN_PRINCIPAL: "Admin Principal",
  ADMIN_ASISTENTE: "Admin Asistente",
  OPERADOR_ASAMBLEA: "Operador Asamblea",
  VIEWER: "Viewer",
  "admin-ph": "Admin PH",
};

const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN_PRINCIPAL: {
    manage_properties: true,
    manage_owners: true,
    create_assemblies: true,
    execute_assemblies: true,
    manual_voting: true,
    view_reports: true,
    export_acts: true,
    manage_billing: true,
    manage_team: true,
    delete_organization: true,
  },
  ADMIN_ASISTENTE: {
    manage_properties: true,
    manage_owners: true,
    create_assemblies: true,
    execute_assemblies: true,
    manual_voting: true,
    view_reports: true,
    export_acts: true,
    manage_billing: false,
    manage_team: false,
    delete_organization: false,
  },
  OPERADOR_ASAMBLEA: {
    manage_properties: false,
    manage_owners: false,
    create_assemblies: false,
    execute_assemblies: true,
    manual_voting: true,
    view_reports: true,
    export_acts: false,
    manage_billing: false,
    manage_team: false,
    delete_organization: false,
  },
  VIEWER: {
    manage_properties: false,
    manage_owners: false,
    create_assemblies: false,
    execute_assemblies: false,
    manual_voting: false,
    view_reports: true,
    export_acts: true,
    manage_billing: false,
    manage_team: false,
    delete_organization: false,
  },
};

function AdminPhShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Admin Principal");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(ROLE_PERMISSIONS.ADMIN_PRINCIPAL);
  const [selectedPhId, setSelectedPhId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [titleUpdateKey, setTitleUpdateKey] = useState(0);
  const [cursorTooltip, setCursorTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({ show: false, text: "", x: 0, y: 0 });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("👤");
  const [profileTheme, setProfileTheme] = useState<"dark" | "light">("dark");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const isDemo = searchParams.get("mode") === "demo" || (userEmail && userEmail.toLowerCase() === "demo@assembly2.com");
  const DEMO_WELCOME_KEY = "assembly_demo_welcome_seen";
  const [showDemoWelcome, setShowDemoWelcome] = useState(false);

  useEffect(() => {
    if (!isDemo || typeof window === "undefined") return;
    const seen = localStorage.getItem(DEMO_WELCOME_KEY);
    if (seen !== "1") setShowDemoWelcome(true);
  }, [isDemo]);

  const closeDemoWelcome = () => {
    setShowDemoWelcome(false);
    if (typeof window !== "undefined") localStorage.setItem(DEMO_WELCOME_KEY, "1");
  };

  const AVATAR_OPTIONS = [
    { id: "👤", label: "Usuario" },
    { id: "🧑", label: "Persona" },
    { id: "👩", label: "Persona" },
    { id: "👨", label: "Persona" },
    { id: "🧑‍💼", label: "Profesional" },
    { id: "👩‍💼", label: "Profesional" },
    { id: "👨‍💼", label: "Profesional" },
    { id: "👔", label: "Ejecutivo" },
    { id: "🤝", label: "Asamblea" },
    { id: "📋", label: "Admin" },
    { id: "🏢", label: "PH" },
  ];
  const AVATAR_KEY = "assembly_admin_ph_avatar";
  const PHOTO_KEY = "assembly_admin_ph_photo";
  const ORG_NAME_KEY = "assembly_admin_ph_organization_name";
  const MAX_PHOTO_SIZE = 1024 * 1024;

  const showTooltip = (text: string, e: React.MouseEvent) =>
    setCursorTooltip({ show: true, text, x: e.clientX, y: e.clientY });
  const moveTooltip = (e: React.MouseEvent) =>
    setCursorTooltip((prev) => (prev.show ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  const hideTooltip = () => setCursorTooltip((prev) => ({ ...prev, show: false }));

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("assembly_admin_ph_sidebar_collapsed") : null;
    if (stored !== null) setSidebarCollapsed(stored === "1");
  }, []);

  useEffect(() => {
    const root = typeof document !== "undefined" ? document.documentElement : null;
    if (root) {
      const theme = getStoredTheme();
      root.setAttribute("data-theme", theme);
      return () => { root.removeAttribute("data-theme"); };
    }
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    if (typeof window !== "undefined") localStorage.setItem("assembly_admin_ph_sidebar_collapsed", next ? "1" : "0");
  };

  useEffect(() => {
    const ph = typeof window !== "undefined" ? sessionStorage.getItem("assembly_admin_selected_ph") : null;
    setSelectedPhId(ph || null);
  }, [pathname]);

  useEffect(() => {
    if (searchParams.get("embed") !== "1" || typeof window === "undefined") return;
    const phIdFromUrl = searchParams.get("phId");
    if (phIdFromUrl) {
      sessionStorage.setItem("assembly_admin_selected_ph", phIdFromUrl);
      setSelectedPhId(phIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = () => setSelectedPhId(typeof window !== "undefined" ? sessionStorage.getItem("assembly_admin_selected_ph") : null);
    window.addEventListener("admin-ph-selected", handler);
    return () => window.removeEventListener("admin-ph-selected", handler);
  }, []);

  useEffect(() => {
    const handler = () => setTitleUpdateKey((k) => k + 1);
    window.addEventListener("admin-ph-title-update", handler);
    return () => window.removeEventListener("admin-ph-title-update", handler);
  }, []);

  useEffect(() => {
    if (selectedPhId !== null) return;
    const base = "/dashboard/admin-ph";
    if (pathname === base || pathname.startsWith(base + "/subscription")) return;
    if (pathname.startsWith(base + "/assemblies")) return;
    if (pathname.startsWith(base + "/proceso-asamblea")) return;  // wizard: usa PH por defecto si no hay selección
    if (pathname.startsWith(base + "/owners")) return;  // Propietarios: accesible desde wizard sin PH seleccionado
    if (pathname.startsWith(base + "/votations")) return;  // redirige a assemblies
    if (pathname.startsWith(base + "/assembly")) return;   // live: /assembly/[id]/live
    if (pathname.startsWith(base + "/monitor")) return;
    if (typeof window !== "undefined") window.location.href = base;
  }, [pathname, selectedPhId]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("assembly_email") || "";
    const storedRole = localStorage.getItem("assembly_admin_ph_role") || localStorage.getItem("assembly_role") || "";
    const storedPermissions = localStorage.getItem("assembly_admin_ph_permissions");
    setUserEmail(storedEmail);
    setUserRole(ROLE_LABELS[storedRole] || "Admin Principal");
    if (storedPermissions) {
      try {
        const parsed = JSON.parse(storedPermissions) as Record<string, boolean>;
        setPermissions(parsed);
      } catch {
        setPermissions(ROLE_PERMISSIONS[storedRole] || ROLE_PERMISSIONS.ADMIN_PRINCIPAL);
      }
    } else {
      setPermissions(ROLE_PERMISSIONS[storedRole] || ROLE_PERMISSIONS.ADMIN_PRINCIPAL);
    }
    const avatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_KEY) || "👤" : "👤";
    setProfileAvatar(avatar);
    setProfileTheme(getStoredTheme());
    const photo = typeof window !== "undefined" ? localStorage.getItem(PHOTO_KEY) : null;
    setProfilePhoto(photo);
    const org = typeof window !== "undefined" ? localStorage.getItem(ORG_NAME_KEY) || "" : "";
    setOrganizationName(org);
  }, []);

  const planInfo = useMemo(() => {
    if (isDemo) {
      return {
        label: "Plan Demo",
        detail: "2 asambleas activas · 1 crédito disponible · 50 propietarios",
        chips: ["2 asambleas", "1 crédito", "50 propietarios"],
        cta: "Actualizar a Standard",
      };
    }
    return {
      label: "Plan Standard",
      detail: "3/12 asambleas usadas · 200 propietarios",
      chips: ["3/12 asambleas", "200 propietarios"],
      cta: "Actualizar a Pro",
    };
  }, [isDemo, userEmail]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("assembly_role");
      localStorage.removeItem("assembly_email");
      localStorage.removeItem("assembly_user_id");
      localStorage.removeItem("assembly_admin_ph_role");
      document.cookie = "assembly_role=; path=/; max-age=0";
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  const openProfileModal = () => {
    setDisplayName(typeof window !== "undefined" ? localStorage.getItem("assembly_platform_admin_display_name") || localStorage.getItem("assembly_admin_ph_display_name") || "" : "");
    setProfileAvatar(typeof window !== "undefined" ? localStorage.getItem(AVATAR_KEY) || "👤" : "👤");
    setProfileTheme(getStoredTheme());
    setProfilePhoto(typeof window !== "undefined" ? localStorage.getItem(PHOTO_KEY) : null);
    setOrganizationName(typeof window !== "undefined" ? localStorage.getItem(ORG_NAME_KEY) || "" : "");
    setProfileModalOpen(true);
  };

  const saveProfile = () => {
    if (typeof window !== "undefined") {
      const trimmed = displayName.trim();
      if (trimmed) {
        localStorage.setItem("assembly_platform_admin_display_name", trimmed);
        localStorage.setItem("assembly_admin_ph_display_name", trimmed);
      } else {
        localStorage.removeItem("assembly_platform_admin_display_name");
        localStorage.removeItem("assembly_admin_ph_display_name");
      }
      localStorage.setItem(AVATAR_KEY, profileAvatar);
      setStoredTheme(profileTheme);
      if (profilePhoto) {
        localStorage.setItem(PHOTO_KEY, profilePhoto);
      } else {
        localStorage.removeItem(PHOTO_KEY);
      }
      const orgTrimmed = organizationName.trim();
      if (orgTrimmed) {
        localStorage.setItem(ORG_NAME_KEY, orgTrimmed);
      } else {
        localStorage.removeItem(ORG_NAME_KEY);
      }
    }
    setProfileModalOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
    if (!valid) {
      alert("Usa una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      alert("La imagen no debe superar 1 MB. Comprímela o elige otra.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = () => setProfilePhoto(null);

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.requiresManageTeam && !permissions.manage_team) return false;
    if (!selectedPhId) return !!(item.showWhenNoPh || (item.showWhenInPhRoute && isInPhModuleRoute(pathname)));
    return true;
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  const isEmbedded = searchParams.get("embed") === "1";
  const isProcesoWizard = pathname.startsWith("/dashboard/admin-ph/proceso-asamblea");
  const hideSidebar = isEmbedded || isProcesoWizard;

  if (hideSidebar) {
    return (
      <main className="container" style={{ maxWidth: "100%", padding: isProcesoWizard ? "24px" : "16px 20px" }}>
        <section className="content-area admin-ph-content admin-ph-embed" style={{ display: "block" }}>
          {children}
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <div className={`app-shell admin-ph-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <aside className={`sidebar admin-ph-sidebar ${sidebarCollapsed ? "collapsed" : ""}`} aria-label="Navegación">
          <div className="sidebar-header">
            <button
              type="button"
              onClick={toggleSidebar}
              className="sidebar-toggle"
              title={sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
              aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            >
              <span className="sidebar-toggle-icon" aria-hidden>
                {sidebarCollapsed ? "▶" : "◀"}
              </span>
              {!sidebarCollapsed && <span className="sidebar-toggle-text">Ocultar</span>}
            </button>
            {!sidebarCollapsed && (
              <div className="sidebar-brand">
                <span className="sidebar-pill">Assembly 2.0</span>
                <h3 className="sidebar-title">Admin de Comunidad</h3>
                <p className="sidebar-subtitle">Panel de administración</p>
              </div>
            )}
          </div>
          <nav className="sidebar-nav">
            {filteredNavItems.map((item) => {
              const Icon = NavIcons[item.iconKey as keyof typeof NavIcons];
              const isDashboardPrincipal = item.label === "Dashboard principal" && item.href === "/dashboard/admin-ph";
              const goToDashboardPrincipal = (e: React.MouseEvent) => {
                e.preventDefault();
                const target = "/dashboard/admin-ph";
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("assembly_admin_selected_ph");
                  sessionStorage.removeItem("assembly_admin_selected_ph_name");
                  sessionStorage.removeItem("assembly_admin_from_cambiar_ph");
                  window.dispatchEvent(new CustomEvent("admin-ph-selected"));
                }
                if (pathname === target) {
                  window.location.href = target;
                } else {
                  router.push(target);
                }
              };
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`sidebar-link ${item.match(pathname) ? "active" : ""}`}
                  title={item.label}
                  scroll={true}
                  onClick={isDashboardPrincipal ? goToDashboardPrincipal : undefined}
                  onMouseEnter={(e) => showTooltip(item.label, e)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <span className="sidebar-icon-wrap" aria-hidden>
                    {Icon ? <Icon /> : null}
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-tooltip sidebar-tooltip-static" role="tooltip" aria-hidden>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            {selectedPhId && (
              <Link
                className="btn btn-primary sidebar-cta"
                href="/dashboard/admin-ph/assemblies"
                title="Crear asamblea"
                scroll={true}
                onMouseEnter={(e) => showTooltip("Crear asamblea", e)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <span className="sidebar-tooltip sidebar-tooltip-static" role="tooltip" aria-hidden>Crear asamblea</span>
                <span className="sidebar-icon-wrap" aria-hidden><NavIcons.add /></span>
                <span className="sidebar-label">Crear asamblea</span>
              </Link>
            )}
          </div>
          {cursorTooltip.show && (
            <div
              className="sidebar-cursor-tooltip"
              style={{ left: cursorTooltip.x, top: cursorTooltip.y }}
              role="tooltip"
              aria-live="polite"
            >
              {cursorTooltip.text}
            </div>
          )}
        </aside>

        <section className="content-area admin-ph-content">
          <div className="admin-ph-top-bar">
            <span style={{ flex: 1 }} />
            <div className="user-menu-anchor" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu-trigger"
                onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Menú de cuenta"
              >
                <span className="user-menu-avatar" aria-hidden>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  ) : profileAvatar && profileAvatar !== "👤" ? (
                    <span style={{ fontSize: "18px" }}>{profileAvatar}</span>
                  ) : (
                    <span className="user-menu-initials">{getInitials(userEmail || "A")}</span>
                  )}
                </span>
                <span className="user-menu-label">{userEmail || "Cuenta"}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: userMenuOpen ? 1 : 0.7 }} aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-dropdown-section">
                    <span className="user-menu-dropdown-label">Plan actual</span>
                    <span className="user-menu-dropdown-plan">{planInfo.label}</span>
                    <div className="user-menu-dropdown-chips">
                      {planInfo.chips.map((c) => (
                        <span key={c} className="user-menu-chip">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="user-menu-dropdown-divider" />
                  <Link className="user-menu-dropdown-item" href="/dashboard/admin-ph/subscription" scroll={true} onClick={() => setUserMenuOpen(false)} role="menuitem">
                    <span aria-hidden>📋</span> Suscripción
                  </Link>
                  <button type="button" className="user-menu-dropdown-item" onClick={() => { setUserMenuOpen(false); openProfileModal(); }} role="menuitem">
                    <span aria-hidden>✏️</span> Perfil
                  </button>
                  <div className="user-menu-dropdown-divider" />
                  <button type="button" className="user-menu-dropdown-item user-menu-dropdown-item--logout" onClick={() => { setUserMenuOpen(false); handleLogout(); }} role="menuitem">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {isDemo && (pathname !== "/dashboard/admin-ph" || !!selectedPhId) && (
            <div
              className="admin-ph-demo-indicator"
              style={{
                marginBottom: "12px",
                padding: "10px 14px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
              role="status"
              aria-live="polite"
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "var(--color-text, #f1f5f9)",
                  padding: "2px 8px",
                  background: "rgba(99, 102, 241, 0.4)",
                  borderRadius: "6px",
                }}
              >
                Modo demo
              </span>
              <span className="muted" style={{ fontSize: "13px" }}>
                Estás viendo el panel en modo demostración. Los datos son de ejemplo.
              </span>
            </div>
          )}
          {pathname === "/dashboard/admin-ph" && (() => {
              void titleUpdateKey;
              const phName = selectedPhId && typeof window !== "undefined" ? sessionStorage.getItem("assembly_admin_selected_ph_name") : null;
              const fromCambiarPh = !selectedPhId && typeof window !== "undefined" && sessionStorage.getItem("assembly_admin_from_cambiar_ph") === "1";
              const title = selectedPhId ? (phName || "Comunidad") : (fromCambiarPh ? "Tus Comunidades" : "DASHBOARD PRINCIPAL");
              return (
                <div className="admin-ph-page-title-block">
                  <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-primary)", marginBottom: "6px", padding: "4px 10px", background: "rgba(99,102,241,0.15)", borderRadius: "6px" }}>Panel de la Comunidad</span>
                  <h1 className="admin-ph-page-title">{title}</h1>
                  <p className="admin-ph-page-subtitle">Dashboard principal de asambleas de residentes e inquilinos.</p>
                </div>
              );
            })()}
          {pathname !== "/dashboard/admin-ph" && (() => {
            const backLinks = getBackLinks(pathname, searchParams);
            if (backLinks.length === 0) return null;
            const isBack = (label: string) => label.startsWith("←") || label.toLowerCase().includes("volver");
            const isPrimaryBack = backLinks.length >= 1 && isBack(backLinks[0].label) && backLinks[0].label.toLowerCase().includes("dashboard");
            return (
              <div className={`admin-ph-back-nav ${isPrimaryBack ? "admin-ph-back-nav--prominent" : ""}`}>
                {backLinks.map((b, i) => (
                  <Link
                    key={i}
                    href={b.href}
                    className={`admin-ph-back-nav-link ${isBack(b.label) ? "admin-ph-back-nav-link--back" : "admin-ph-back-nav-link--dashboard"} ${i === 0 && isPrimaryBack ? "admin-ph-back-nav-link--primary" : ""}`}
                    scroll={true}
                  >
                    {isBack(b.label) ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                      </svg>
                    )}
                    <span>{b.label.replace(/^←\s*/, "")}</span>
                  </Link>
                ))}
                <style>{`
                  .admin-ph-back-nav {
                    margin-bottom: 14px;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px;
                  }
                  .admin-ph-back-nav--prominent {
                    margin-bottom: 18px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
                  }
                  .admin-ph-back-nav-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    color: #e2e8f0;
                    background: rgba(51, 65, 85, 0.5);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
                  }
                  .admin-ph-back-nav-link:hover {
                    background: rgba(71, 85, 105, 0.6);
                    border-color: rgba(148, 163, 184, 0.35);
                    color: #f1f5f9;
                    transform: translateY(-1px);
                  }
                  .admin-ph-back-nav-link--primary {
                    padding: 12px 20px;
                    font-size: 15px;
                    font-weight: 600;
                    background: rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.45);
                    color: #c7d2fe;
                  }
                  .admin-ph-back-nav-link--primary:hover {
                    background: rgba(99, 102, 241, 0.3);
                    border-color: rgba(99, 102, 241, 0.6);
                    color: #e0e7ff;
                  }
                  .admin-ph-back-nav-link--back {
                    color: #94a3b8;
                  }
                  .admin-ph-back-nav-link--dashboard {
                    background: rgba(99, 102, 241, 0.12);
                    border-color: rgba(99, 102, 241, 0.25);
                    color: #a5b4fc;
                  }
                  .admin-ph-back-nav-link--dashboard:hover {
                    background: rgba(99, 102, 241, 0.22);
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #c7d2fe;
                  }
                `}</style>
              </div>
            );
          })()}

          {showDemoWelcome && (
            <div
              className="profile-modal-overlay profile-modal--dark"
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-welcome-title"
              onClick={closeDemoWelcome}
              style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", padding: 16 }}
            >
              <div className="profile-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px", width: "100%" }}>
                <div className="profile-modal-header">
                  <h2 id="demo-welcome-title" style={{ margin: 0, fontSize: "1.2rem" }}>Bienvenido al demo</h2>
                  <button type="button" onClick={closeDemoWelcome} aria-label="Cerrar" style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: 1.6 }}>
                  Estás usando la <strong>versión demo</strong> de Assembly 2.0 con las siguientes condiciones:
                </p>
                <ul style={{ margin: "0 0 16px", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.7 }}>
                  <li><strong>50 residentes</strong> (propietarios/unidades)</li>
                  <li><strong>1 crédito</strong> de asamblea disponible</li>
                  <li><strong>15 días</strong> de prueba</li>
                  <li>PH de ejemplo: <strong>Urban Tower</strong></li>
                </ul>
                <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                  Los datos son de ejemplo. Para desbloquear más asambleas y funciones, actualiza el plan desde Suscripción.
                </p>
                <button type="button" className="btn btn-primary" style={{ marginTop: "20px" }} onClick={closeDemoWelcome}>
                  Entendido
                </button>
              </div>
            </div>
          )}

          {profileModalOpen && (
            <div
              className={`profile-modal-overlay profile-modal--${profileTheme}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-ph-profile-modal-title"
              onClick={() => setProfileModalOpen(false)}
            >
              <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal-header">
                  <h2 id="admin-ph-profile-modal-title">Editar perfil</h2>
                  <button
                    type="button"
                    className="profile-modal-close"
                    onClick={() => setProfileModalOpen(false)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
                <p className="profile-modal-desc">
                  Revisa tus datos de sesión y opcionalmente define un nombre para mostrar.
                </p>

                <div className="profile-modal-section">
                  <span className="profile-modal-section-label">Datos de sesión</span>
                  <span className="profile-modal-readonly-badge">Solo lectura</span>
                </div>
                <div className="profile-modal-readonly-fields">
                  <div className="profile-modal-field">
                    <span className="profile-modal-field-label">Correo</span>
                    <span className="profile-modal-field-value">{userEmail || "—"}</span>
                  </div>
                  <div className="profile-modal-field">
                    <span className="profile-modal-field-label">Rol</span>
                    <span className="profile-modal-field-value">{userRole}</span>
                  </div>
                </div>

                <div className="profile-modal-section" style={{ marginTop: "20px" }}>
                  <span className="profile-modal-section-label">Foto o avatar</span>
                  <span className="profile-modal-optional">JPG, PNG o WebP · máx. 1 MB</span>
                </div>
                <div className="profile-modal-photo-row">
                  <div
                    className="profile-modal-photo-preview profile-modal-photo-dropzone"
                    onClick={() => !profilePhoto && photoInputRef.current?.click()}
                    role={profilePhoto ? undefined : "button"}
                    tabIndex={profilePhoto ? undefined : 0}
                    onKeyDown={(e) => { if (!profilePhoto && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); photoInputRef.current?.click(); } }}
                    aria-label={profilePhoto ? undefined : "Haz clic o arrastra una imagen"}
                  >
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Tu foto" />
                    ) : (
                      <span className="profile-modal-photo-placeholder" style={{ fontSize: "36px" }}>{profileAvatar}</span>
                    )}
                  </div>
                  <div className="profile-modal-photo-actions">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="profile-modal-photo-input"
                      aria-label="Subir imagen"
                    />
                    <button type="button" className="btn btn-ghost profile-modal-photo-btn" onClick={() => photoInputRef.current?.click()}>
                      Subir imagen
                    </button>
                    {profilePhoto && (
                      <button type="button" className="btn btn-ghost profile-modal-photo-btn" onClick={removePhoto}>
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>
                <div className="profile-modal-section" style={{ marginTop: "16px" }}>
                  <span className="profile-modal-section-label">Avatares predeterminados</span>
                  <span className="profile-modal-optional">Si no usas foto</span>
                </div>
                <div className="profile-modal-avatar-row profile-modal-avatar-row--modern">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`profile-modal-avatar-option profile-modal-avatar-option--modern ${!profilePhoto && profileAvatar === opt.id ? "selected" : ""}`}
                      onClick={() => setProfileAvatar(opt.id)}
                      aria-label={`Avatar: ${opt.label}`}
                      aria-pressed={!profilePhoto && profileAvatar === opt.id}
                    >
                      <span style={{ fontSize: "22px" }}>{opt.id}</span>
                    </button>
                  ))}
                </div>

                <div className="profile-modal-section" style={{ marginTop: "16px" }}>
                  <span className="profile-modal-section-label">Organización o empresa</span>
                  <span className="profile-modal-optional">Administradora del PH</span>
                </div>
                <input
                  type="text"
                  className="profile-modal-input"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Ej. Administradora Costa del Este S.A."
                  aria-label="Nombre de la organización o empresa"
                />

                <div className="profile-modal-section" style={{ marginTop: "16px" }}>
                  <span className="profile-modal-section-label">Tema</span>
                </div>
                <div className="profile-modal-theme-row">
                  <button
                    type="button"
                    className={`profile-modal-theme-option ${profileTheme === "dark" ? "selected" : ""}`}
                    onClick={() => setProfileTheme("dark")}
                    aria-pressed={profileTheme === "dark"}
                  >
                    🌙 Oscuro
                  </button>
                  <button
                    type="button"
                    className={`profile-modal-theme-option ${profileTheme === "light" ? "selected" : ""}`}
                    onClick={() => setProfileTheme("light")}
                    aria-pressed={profileTheme === "light"}
                  >
                    ☀️ Claro
                  </button>
                </div>

                <div className="profile-modal-section" style={{ marginTop: "16px" }}>
                  <span className="profile-modal-section-label">Nombre para mostrar</span>
                  <span className="profile-modal-optional">Opcional</span>
                </div>
                <input
                  type="text"
                  className="profile-modal-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Henry"
                  aria-label="Nombre para mostrar"
                />

                <div className="profile-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={saveProfile}>
                    Guardar
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setProfileModalOpen(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDemoWelcome && isDemo && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-welcome-title"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.6)",
                padding: 16,
              }}
              onClick={closeDemoWelcome}
            >
              <div
                className="card"
                style={{
                  maxWidth: 440,
                  width: "100%",
                  padding: "24px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(99, 102, 241, 0.35)",
                  background: "linear-gradient(160deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <h2 id="demo-welcome-title" style={{ margin: 0, fontSize: "1.25rem" }}>Bienvenido al demo</h2>
                  <button type="button" onClick={closeDemoWelcome} aria-label="Cerrar" style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: 1.55 }}>
                  Estás en modo demostración con las siguientes condiciones:
                </p>
                <ul style={{ margin: "0 0 16px", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.7, color: "#e2e8f0" }}>
                  <li><strong>PH de ejemplo:</strong> Urban Tower (50 unidades)</li>
                  <li><strong>Límite:</strong> 50 residentes, 1 crédito de asamblea</li>
                  <li><strong>Prueba:</strong> 15 días</li>
                </ul>
                <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#94a3b8" }}>
                  Los datos son de ejemplo. Para desbloquear más asambleas y funciones, actualiza el plan desde Suscripción o el banner de demo.
                </p>
                <button type="button" className="btn btn-primary" onClick={closeDemoWelcome}>
                  Entendido
                </button>
              </div>
            </div>
          )}

          {pathname === "/dashboard/admin-ph" && !selectedPhId ? (
            <div className="dashboard-widgets-group">
              {isDemo && (
                <div className="card admin-ph-dashboard-header dashboard-demo-card">
                  <div className="dashboard-demo-strip">
                    <div className="dashboard-demo-strip-left">
                      <span className="dashboard-demo-badge">Demo</span>
                      <div className="dashboard-demo-message">
                        <span className="dashboard-demo-title">Versión demo · Plan 50 usuarios (1 crédito, expira en 15 días)</span>
                        <span className="dashboard-demo-sub">Los datos son de ejemplo. Actualiza el plan para desbloquear más asambleas y funciones.</span>
                      </div>
                    </div>
                    <Link className="dashboard-demo-cta btn btn-primary" href="/dashboard/admin-ph/subscription" scroll={true}>
                      Actualizar plan
                    </Link>
                  </div>
                </div>
              )}
              {children}
            </div>
          ) : (
            <>{children}</>
          )}
        </section>

        <AdminSupportChatWidget />
      </div>
    </main>
  );
}

export default function AdminPhShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="app-shell">
          <aside className="sidebar" />
          <section className="content-area"><p className="muted">Cargando…</p></section>
        </div>
      </main>
    }>
      <AdminPhShellContent>{children}</AdminPhShellContent>
    </Suspense>
  );
}
