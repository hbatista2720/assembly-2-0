"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/admin", label: "Resumen ejecutivo", icon: "📊" },
  { href: "/platform-admin/monitoring", label: "Monitor VPS", icon: "🖥️" },
  { href: "/platform-admin/clients", label: "Gestión de clientes", icon: "👥" },
  { href: "/platform-admin/business", label: "Métricas de negocio", icon: "💹" },
  { href: "/platform-admin/leads", label: "Funnel de leads", icon: "🎯" },
  { href: "/platform-admin/tickets", label: "Tickets inteligentes", icon: "🎫" },
  { href: "/platform-admin/crm", label: "CRM y campañas", icon: "📣" },
  { href: "/platform-admin/chatbot-config", label: "Configuración Chatbot", icon: "🤖" },
];

export default function PlatformAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <span className="pill">Assembly 2.0</span>
          <h3 style={{ margin: "12px 0 4px" }}>Admin Plataforma</h3>
          <p className="muted" style={{ margin: 0 }}>
            Panel maestro de la operación
          </p>
        </div>
        <nav style={{ display: "grid", gap: "10px" }}>
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: "10px" }}>
          <Link className="btn btn-ghost" href="/">
            Volver a landing
          </Link>
          <Link className="btn btn-primary" href="/demo">
            Crear demo
          </Link>
        </div>
      </aside>
      <section className="content-area">{children}</section>
    </div>
  );
}
