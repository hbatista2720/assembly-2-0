"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const iconStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  minWidth: 22,
  minHeight: 22,
  color: "currentColor",
  flexShrink: 0,
};

const NavIcons: Record<string, () => JSX.Element> = {
  chart: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
    </svg>
  ),
  monitor: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2h2v-2h2v2h2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  money: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </svg>
  ),
  card: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </svg>
  ),
  trending: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
    </svg>
  ),
  target: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  ticket: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
    </svg>
  ),
  campaign: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  ),
  robot: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  ),
  home: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  add: () => (
    <svg viewBox="0 0 24 24" style={{ ...iconStyle, width: 20, height: 20 }} fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  ),
  approve: () => (
    <svg viewBox="0 0 24 24" style={iconStyle} fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard/admin", label: "Resumen ejecutivo", iconKey: "chart" },
  { href: "/platform-admin/approvals", label: "Bandeja de aprobaciones", iconKey: "approve", badge: true },
  { href: "/platform-admin/monitoring", label: "Monitor VPS", iconKey: "monitor" },
  { href: "/platform-admin/clients", label: "Gestión de comunidades", iconKey: "users" },
  { href: "/platform-admin/plans", label: "Planes y precios", iconKey: "money" },
  { href: "/platform-admin/payment-config", label: "Configuración de pagos", iconKey: "card" },
  { href: "/platform-admin/business", label: "Métricas de negocio", iconKey: "trending" },
  { href: "/platform-admin/leads", label: "Funnel de leads", iconKey: "target" },
  { href: "/platform-admin/tickets", label: "Tickets inteligentes", iconKey: "ticket" },
  { href: "/platform-admin/crm", label: "CRM y campañas", iconKey: "campaign" },
  { href: "/platform-admin/chatbot-config", label: "Configuración Chatbot", iconKey: "robot" },
];

export default function PlatformAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/platform-admin/pending-orders")
      .then((res) => res.json())
      .then((data) => {
        const orders = data?.orders || [];
        setPendingCount(Array.isArray(orders) ? orders.length : 0);
      })
      .catch(() => setPendingCount(null));
    const t = setInterval(() => {
      fetch("/api/platform-admin/pending-orders")
        .then((res) => res.json())
        .then((data) => {
          const orders = data?.orders || [];
          setPendingCount(Array.isArray(orders) ? orders.length : 0);
        })
        .catch(() => {});
    }, 45000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="app-shell platform-admin-shell">
      <aside className="sidebar platform-admin-sidebar admin-ph-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-pill">Assembly 2.0</span>
            <h3 className="sidebar-title">Admin Plataforma</h3>
            <p className="sidebar-subtitle">Panel maestro de la operación</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
            const Icon = NavIcons[item.iconKey as keyof typeof NavIcons];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                style={item.badge && pendingCount !== null && pendingCount > 0 ? { position: "relative" } : undefined}
              >
                <span className="sidebar-icon-wrap" aria-hidden>
                  {Icon ? <Icon /> : null}
                </span>
                <span className="sidebar-label">{item.label}</span>
                {item.badge && pendingCount !== null && pendingCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                    }}
                    aria-label={`${pendingCount} órdenes pendientes`}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <Link className="btn btn-ghost sidebar-link" href="/">
            <span className="sidebar-icon-wrap" aria-hidden>
              <NavIcons.home />
            </span>
            <span className="sidebar-label">Volver a landing</span>
          </Link>
          <Link className="btn btn-primary sidebar-cta" href="/demo">
            <span className="sidebar-icon-wrap" aria-hidden>
              <NavIcons.add />
            </span>
            <span className="sidebar-label">Crear demo</span>
          </Link>
        </div>
      </aside>
      <section className="content-area platform-admin-content admin-ph-content">{children}</section>
    </div>
  );
}
