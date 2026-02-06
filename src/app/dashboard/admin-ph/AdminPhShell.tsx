"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  requiresManageTeam?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard/admin-ph",
    label: "📊 Dashboard",
    match: (pathname) => pathname === "/dashboard/admin-ph",
  },
  {
    href: "/dashboard/admin-ph/owners",
    label: "👥 Propietarios",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/owners"),
  },
  {
    href: "/dashboard/admin-ph/assemblies",
    label: "📋 Asambleas",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/assemblies"),
  },
  {
    href: "/dashboard/admin-ph/votations",
    label: "🗳️ Votaciones",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/votations"),
  },
  {
    href: "/dashboard/admin-ph/monitor/demo",
    label: "🖥️ Monitor",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/monitor"),
  },
  {
    href: "/dashboard/admin-ph/acts",
    label: "📄 Actas",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/acts"),
  },
  {
    href: "/dashboard/admin-ph/reports",
    label: "📈 Reportes",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/reports"),
  },
  {
    href: "/dashboard/admin-ph/team",
    label: "👨‍💼 Equipo",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/team"),
    requiresManageTeam: true,
  },
  {
    href: "/dashboard/admin-ph/settings",
    label: "⚙️ Configuración",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/settings"),
  },
  {
    href: "/dashboard/admin-ph/support",
    label: "💬 Soporte",
    match: (pathname) => pathname.startsWith("/dashboard/admin-ph/support"),
  },
];

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
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Admin Principal");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(ROLE_PERMISSIONS.ADMIN_PRINCIPAL);
  const isDemo = searchParams.get("mode") === "demo";

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
  }, []);

  const planInfo = useMemo(() => {
    if (isDemo) {
      return {
        label: "Plan Demo",
        detail: "12 días restantes · 1 asamblea disponible",
        cta: "Actualizar a Standard",
      };
    }
    return {
      label: "Plan Standard",
      detail: "3/12 asambleas usadas · 200 propietarios",
      cta: "Actualizar a Pro",
    };
  }, [isDemo]);

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

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.requiresManageTeam) {
      return true;
    }
    return permissions.manage_team === true;
  });

  return (
    <main className="container">
      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <span className="pill">Assembly 2.0</span>
            <h3 style={{ margin: "12px 0 4px" }}>Urban Tower PH</h3>
            <p className="muted" style={{ margin: 0 }}>
              Panel de administracion PH
            </p>
          </div>
          <nav style={{ display: "grid", gap: "10px" }}>
            {filteredNavItems.map((item) => (
              <a
                key={item.href}
                className={`sidebar-link ${item.match(pathname) ? "active" : ""}`}
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: "auto", display: "grid", gap: "10px" }}>
            <a className="btn btn-ghost" href="/">
              Volver a landing
            </a>
            <a className="btn btn-primary" href="/dashboard/admin-ph/assemblies">
              Crear asamblea
            </a>
          </div>
        </aside>

        <section className="content-area">
          {isDemo && (
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <span className="pill">Demo activa</span>
                <div style={{ flex: 1 }}>
                  <strong>Tu demo expira pronto.</strong>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    Quedan 12 dias. Actualiza para desbloquear mas asambleas.
                  </p>
                </div>
                <button className="btn btn-primary">Actualizar Plan</button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div
                className="icon-badge"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.8), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95))",
                  border: "1px solid rgba(56, 189, 248, 0.7)",
                  boxShadow: "0 10px 24px rgba(56, 189, 248, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "18px" }}>👤</span>
              </div>
              <div style={{ flex: 1 }}>
                <strong>{userEmail || "admin@assembly2.com"}</strong>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {userRole} · {planInfo.label}
                </div>
                <div className="muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                  {planInfo.detail}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="btn btn-ghost">Editar perfil</button>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Cerrar sesion
                </button>
              </div>
            </div>
          </div>

          {children}
        </section>
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
