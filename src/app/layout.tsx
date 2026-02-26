import type { ReactNode } from "react";
import AppToaster from "./toaster";
import ThemeInit from "./ThemeInit";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "Assembly 2.0",
  description: "Governanza digital para PH",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('assembly_theme');
    document.documentElement.dataset.theme = (t === 'light' ? 'light' : 'dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeInit />
        <CartProvider>{children}</CartProvider>
        <AppToaster />
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
            background:
              radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.25), transparent 45%),
              radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.2), transparent 40%),
              #0b1020;
            color: #e2e8f0;
          }

          html[data-theme="light"] body {
            background: #f0f4f8;
            color: #1e293b;
          }
          /* Landing page: mantener aspecto oscuro aunque el usuario tenga tema claro */
          html[data-theme="light"] body:has(.landing-root) {
            background: radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.25), transparent 45%),
              radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.2), transparent 40%),
              #0b1020;
            color: #e2e8f0;
          }
          html[data-theme="light"] .landing-root .card,
          html[data-theme="light"] .landing-root .card.glass {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5)) !important;
            border: 1px solid rgba(148, 163, 184, 0.12) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
            color: #e2e8f0 !important;
          }
          html[data-theme="light"] .landing-root .muted {
            color: #94a3b8 !important;
          }
          html[data-theme="light"] .landing-root .btn-ghost {
            background: rgba(30, 41, 59, 0.5) !important;
            border: 1px solid rgba(148, 163, 184, 0.25) !important;
            color: #e2e8f0 !important;
          }
          html[data-theme="light"] .landing-root .btn-ghost:hover {
            background: rgba(51, 65, 85, 0.6) !important;
            border-color: rgba(148, 163, 184, 0.35) !important;
            color: #f1f5f9 !important;
          }
          html[data-theme="light"] .landing-root .list-item {
            background: rgba(30, 41, 59, 0.4) !important;
            border: 1px solid rgba(148, 163, 184, 0.15) !important;
            color: #e2e8f0 !important;
          }
          html[data-theme="light"] .landing-root .section-title,
          html[data-theme="light"] .landing-root .hero-title,
          html[data-theme="light"] .landing-root h1,
          html[data-theme="light"] .landing-root h2 {
            color: #f1f5f9 !important;
          }
          html[data-theme="light"] .landing-root .section-subtitle,
          html[data-theme="light"] .landing-root .hero-subtitle {
            color: #94a3b8 !important;
          }
          html[data-theme="light"] .landing-root .navbar.glass {
            background: rgba(15, 23, 42, 0.7) !important;
            border-color: rgba(148, 163, 184, 0.15) !important;
          }
          .landing-root .nav-icon-link {
            isolation: isolate;
          }
          .landing-root .nav-icon-link:hover {
            z-index: 5;
          }
          /* Sin efecto ratón en el enlace: solo el icono interior tiene hover */
          .landing-root .nav-icon-link.btn,
          .landing-root .nav-icon-link.btn-access {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .landing-root .nav-icon-link.btn:hover,
          .landing-root .nav-icon-link.btn:focus,
          .landing-root .nav-icon-link.btn-access:hover,
          .landing-root .nav-icon-link.btn-access:focus {
            transform: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
          }

          /* Login y Chat residentes: mantener tema oscuro (igual que landing) */
          html[data-theme="light"] body:has(.auth-root) {
            background: radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.25), transparent 45%),
              radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.2), transparent 40%),
              #0b1020;
            color: #e2e8f0;
          }
          html[data-theme="light"] .auth-root .card,
          html[data-theme="light"] .auth-root .card.glass {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5)) !important;
            border: 1px solid rgba(148, 163, 184, 0.12) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
            color: #e2e8f0 !important;
          }
          html[data-theme="light"] .auth-root .muted {
            color: #94a3b8 !important;
          }
          html[data-theme="light"] .auth-root .btn-ghost,
          html[data-theme="light"] .auth-root .btn-home {
            background: rgba(30, 41, 59, 0.5) !important;
            border: 1px solid rgba(148, 163, 184, 0.25) !important;
            color: #e2e8f0 !important;
          }
          html[data-theme="light"] .auth-root .btn-ghost:hover,
          html[data-theme="light"] .auth-root .btn-home:hover {
            background: rgba(51, 65, 85, 0.6) !important;
            border-color: rgba(148, 163, 184, 0.35) !important;
            color: #f1f5f9 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content {
            background: #f8fafc;
          }

          html[data-theme="light"] .muted,
          html[data-theme="light"] .profile-modal-desc {
            color: #374151 !important;
          }

          html[data-theme="light"] .card,
          html[data-theme="light"] .admin-ph-profile-card,
          html[data-theme="light"] .profile-modal-card,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-widget {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 14px rgba(0, 0, 0, 0.06) !important;
            color: #1e293b !important;
          }
          html[data-theme="light"] .admin-ph-dashboard-header.dashboard-demo-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset !important;
          }
          html[data-theme="light"] .dashboard-widgets-group {
            background: linear-gradient(160deg, #f8fafc, #f1f5f9) !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06) !important;
          }
          html[data-theme="light"] .user-menu-trigger {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }
          html[data-theme="light"] .user-menu-trigger:hover {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
            color: #1e293b !important;
          }
          html[data-theme="light"] .user-menu-dropdown {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12) !important;
          }
          html[data-theme="light"] .user-menu-dropdown-plan,
          html[data-theme="light"] .user-menu-dropdown-item {
            color: #334155 !important;
          }
          html[data-theme="light"] .user-menu-dropdown-item:hover {
            background: #f1f5f9 !important;
          }
          html[data-theme="light"] .user-menu-dropdown-label {
            color: #64748b !important;
          }
          html[data-theme="light"] .user-menu-chip {
            background: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-back-nav-link {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-back-nav-link:hover {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
            color: #1e293b !important;
          }
          html[data-theme="light"] .admin-ph-back-nav-link--dashboard {
            background: #eef2ff !important;
            border-color: #c7d2fe !important;
            color: #4338ca !important;
          }
          html[data-theme="light"] .admin-ph-back-nav-link--dashboard:hover {
            background: #e0e7ff !important;
            color: #3730a3 !important;
          }
          html[data-theme="light"] .admin-ph-demo-indicator {
            background: #eef2ff !important;
            border-color: #c7d2fe !important;
          }

          html[data-theme="light"] .profile-modal-field-value,
          html[data-theme="light"] .profile-modal-input {
            background: #f8fafc !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .profile-modal-overlay {
            background: rgba(0, 0, 0, 0.45) !important;
          }

          html[data-theme="light"] .btn-ghost,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-ghost {
            background: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .btn-ghost:hover,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-ghost:hover {
            background: #e2e8f0 !important;
            border-color: #94a3b8 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn {
            color: #334155 !important;
            border: 1px solid #cbd5e1 !important;
            background: #f1f5f9 !important;
          }

          html[data-theme="light"] .admin-ph-sidebar {
            background: #e0f2ff !important;
            border-right: 1px solid rgba(14, 165, 233, 0.2) !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-header {
            border-bottom-color: rgba(14, 165, 233, 0.25) !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-toggle {
            background: rgba(255, 255, 255, 0.9) !important;
            border-color: rgba(14, 165, 233, 0.3) !important;
            color: #0c4a6e !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-toggle:hover {
            background: #fff !important;
            border-color: #38bdf8 !important;
            color: #0369a1 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-pill {
            background: rgba(255, 255, 255, 0.8) !important;
            border-color: rgba(14, 165, 233, 0.4) !important;
            color: #0369a1 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-title {
            color: #0c4a6e !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-subtitle {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link {
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link .sidebar-icon-wrap {
            background: transparent !important;
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link .sidebar-icon-wrap svg {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.6) !important;
            color: #0c4a6e !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link:hover .sidebar-icon-wrap {
            background: rgba(255, 255, 255, 0.5) !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link:hover .sidebar-icon-wrap svg {
            color: #0369a1 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link.active {
            background: rgba(255, 255, 255, 0.95) !important;
            color: #0369a1 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link.active .sidebar-icon-wrap {
            background: rgba(56, 189, 248, 0.15) !important;
            color: #0284c7 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-link.active .sidebar-icon-wrap svg {
            color: #0284c7 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-cta {
            background: rgba(255, 255, 255, 0.9) !important;
            border-color: rgba(14, 165, 233, 0.35) !important;
            color: #0369a1 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-cta:hover {
            background: #fff !important;
            border-color: #38bdf8 !important;
          }
          html[data-theme="light"] .admin-ph-sidebar .sidebar-cursor-tooltip {
            background: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #334155 !important;
          }

          /* Platform Admin: tema claro (mismo estilo que Admin PH) */
          html[data-theme="light"] .platform-admin-shell .platform-admin-content {
            background: #f8fafc;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
            color: #1e293b !important;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .btn-ghost {
            background: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            color: #334155 !important;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .btn-ghost:hover {
            background: #e2e8f0 !important;
            border-color: #94a3b8 !important;
            color: #0f172a !important;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .btn-primary {
            background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
            color: #fff !important;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .muted {
            color: #64748b !important;
          }
          html[data-theme="light"] .platform-admin-shell .platform-admin-content .pill {
            color: #4338ca !important;
            border-color: rgba(99, 102, 241, 0.4) !important;
            background: rgba(99, 102, 241, 0.12) !important;
          }

          html[data-theme="light"] .profile-modal-avatar-option {
            background: #f1f5f9 !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
          }

          html[data-theme="light"] .profile-modal-avatar-option.selected {
            border-color: #6366f1 !important;
            background: rgba(99, 102, 241, 0.15) !important;
          }

          html[data-theme="light"] .profile-modal-theme-option {
            background: #f1f5f9 !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
            color: #1e293b !important;
          }

          html[data-theme="light"] .profile-modal-theme-option.selected {
            border-color: #6366f1 !important;
            background: rgba(99, 102, 241, 0.15) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pill {
            color: #4338ca !important;
            border-color: rgba(99, 102, 241, 0.4) !important;
            background: rgba(99, 102, 241, 0.12) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-widget h1,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-widget h2 {
            color: #1e293b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-widget .muted,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card .muted {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-create-ph-trigger {
            background: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-create-ph-trigger:hover {
            background: #e0e7ff !important;
            border-color: #c7d2fe !important;
            color: #4338ca !important;
          }
          html[data-theme="light"] .user-menu-avatar {
            background: linear-gradient(145deg, #e0e7ff, #c7d2fe) !important;
            border-color: #a5b4fc !important;
          }
          html[data-theme="light"] .user-menu-initials {
            color: #4338ca !important;
          }

          html[data-theme="light"] .admin-ph-profile-card .profile-email {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-profile-card .profile-role,
          html[data-theme="light"] .admin-ph-profile-card .profile-organization {
            color: #374151 !important;
          }

          html[data-theme="light"] .admin-ph-profile-card .profile-plan {
            background: #eef2ff !important;
            border: 1px solid #c7d2fe !important;
            color: #4338ca !important;
          }

          html[data-theme="light"] .admin-ph-profile-card .profile-plan .muted {
            color: #4f46e5 !important;
          }

          html[data-theme="light"] .admin-ph-profile-card .profile-plan strong {
            color: #312e81 !important;
          }
          html[data-theme="light"] .dashboard-demo-badge {
            background: #e0e7ff !important;
            border-color: #a5b4fc !important;
            color: #4338ca !important;
          }
          html[data-theme="light"] .dashboard-demo-title {
            color: #1e293b !important;
          }
          html[data-theme="light"] .dashboard-demo-sub {
            color: #64748b !important;
          }
          html[data-theme="light"] .dashboard-demo-progress-wrap {
            background: #e2e8f0 !important;
            border-color: #cbd5e1 !important;
          }
          html[data-theme="light"] .dashboard-demo-progress-bar {
            background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
          }
          html[data-theme="light"] .dashboard-demo-days {
            color: #475569 !important;
          }
          html[data-theme="light"] .dashboard-demo-cta {
            background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
            border: none !important;
            color: #fff !important;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35) !important;
          }
          html[data-theme="light"] .dashboard-demo-cta:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4) !important;
          }
          html[data-theme="light"] .profile-plan-chip {
            background: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
          }
          html[data-theme="light"] .profile-plan-chip.plan-name {
            background: #eef2ff !important;
            border-color: #c7d2fe !important;
            color: #4338ca !important;
          }
          html[data-theme="light"] .admin-ph-profile-card .profile-avatar-initials {
            color: #4338ca !important;
            background: linear-gradient(145deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1)) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-label,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-card .muted {
            color: #374151 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-value,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-note {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-note {
            color: #4338ca !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-card h3 {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-card .chart-graph-wrap {
            background: #f8fafc !important;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin: 12px 0;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-vote-row {
            color: #1e293b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-vote-row .muted {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .list-item {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #1e293b !important;
            border-radius: 12px !important;
            padding: 12px 14px !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .list-item .muted {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .list-item .btn-ghost {
            background: #ffffff !important;
            border-color: #cbd5e1 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .list-item .btn-ghost:hover {
            background: #e2e8f0 !important;
            border-color: #94a3b8 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card-list .list-item:last-child {
            border-bottom: 1px solid #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-item {
            border-bottom-color: #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-item:hover {
            background: #f8fafc !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--al-dia {
            background: rgba(34, 197, 94, 0.2) !important;
            border: 1px solid #22c55e !important;
            color: #15803d !important;
            padding: 4px 8px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--al-dia span {
            color: #15803d !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--al-dia option {
            background: #fff;
            color: #0f172a;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--mora {
            background: rgba(239, 68, 68, 0.2) !important;
            border: 1px solid #ef4444 !important;
            color: #b91c1c !important;
            padding: 4px 8px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--mora span {
            color: #b91c1c !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--mora span[style*="background"] {
            background: #dc2626 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .resident-status--mora option {
            background: #fff;
            color: #0f172a;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-email {
            color: #1e293b !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-unit {
            background: rgba(99, 102, 241, 0.12) !important;
            border-color: rgba(99, 102, 241, 0.3) !important;
            color: #4338ca !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-meta {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-wrap {
            border-color: #e2e8f0 !important;
            background: #ffffff !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-header {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
            border-bottom-color: #e2e8f0 !important;
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-list-item {
            background: #ffffff !important;
            color: #334155 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card input[type="text"],
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card input[type="email"],
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card input[type="search"] {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card input::placeholder {
            color: #94a3b8 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card select {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card [role="tablist"] {
            border-color: #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card [role="tab"][aria-selected="false"] {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card [role="tab"][aria-selected="true"] {
            color: #4338ca !important;
            background: #eef2ff !important;
            border-bottom-color: #6366f1 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-toolbar .btn-ghost {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-toolbar .btn-ghost:hover {
            background: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-powers-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .owners-powers-card .muted {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-widget {
            background: linear-gradient(145deg, #e0f2ff, #f0f9ff) !important;
            border: 1px solid #bae6fd !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 14px rgba(14, 165, 233, 0.1) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-widget:hover {
            background: linear-gradient(145deg, #bae6fd, #e0f2ff) !important;
            border-color: #7dd3fc !important;
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-widget,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-widget strong {
            color: #0c4a6e !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-widget .muted {
            color: #0369a1 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-primary {
            background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
            color: #fff !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3) !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .btn-primary:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4) !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card .btn-primary {
            background: linear-gradient(135deg, #5b21b6, #7c3aed) !important;
            color: #fff !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35) !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card .btn-primary:hover {
            background: linear-gradient(135deg, #4c1d95, #6d28d9) !important;
            box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45) !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-form {
            background: linear-gradient(160deg, rgba(248, 250, 252, 0.95), #ffffff);
            border-color: #e2e8f0;
          }
          html[data-theme="light"] .edit-resident-modal.create-ph-form {
            background: linear-gradient(160deg, rgba(248, 250, 252, 0.98), #ffffff);
            border-color: #e2e8f0;
            box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-form-title {
            color: #0f172a;
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-form-desc {
            color: #64748b;
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-label {
            color: #334155;
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-input,
          html[data-theme="light"] .edit-resident-modal .create-ph-select {
            background: #f8fafc;
            border-color: #e2e8f0;
            color: #0f172a;
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-input:focus,
          html[data-theme="light"] .edit-resident-modal .create-ph-select:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          }
          html[data-theme="light"] .edit-resident-modal .create-ph-form-actions {
            border-top-color: #e2e8f0;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-form-title {
            color: #0f172a;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-form-desc {
            color: #64748b;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-label {
            color: #334155;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-input,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-select {
            background: #f8fafc;
            border-color: #e2e8f0;
            color: #0f172a;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-input:focus,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-select:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-plan-suggestion {
            background: rgba(99, 102, 241, 0.06);
            border-color: rgba(99, 102, 241, 0.2);
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-plan-suggestion-title {
            color: #334155;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .dashboard-create-ph-wrap {
            border-top-color: #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-form-actions {
            border-top-color: #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-cancel {
            color: #64748b !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .create-ph-cancel:hover {
            background: #f1f5f9 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .ph-card-icon {
            background: rgba(14, 165, 233, 0.2) !important;
            border: 1px solid #7dd3fc !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-bar {
            background: #e2e8f0 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .chart-bar > span {
            background: linear-gradient(90deg, #6366f1, #818cf8) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .upgrade-banner {
            background: #fffbeb !important;
            border: 1px solid #fde68a !important;
            border-left: 4px solid #f59e0b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .upgrade-banner .muted {
            color: #92400e !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .upgrade-banner strong {
            color: #78350f !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .upgrade-banner .list-item {
            color: #78350f !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .demo-banner {
            background: #e8e0ff !important;
            border: 1px solid #c4b5fd !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .demo-banner .muted {
            color: #5b21b6 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .demo-banner strong {
            color: #4c1d95 !important;
          }

          html[data-theme="light"] .admin-ph-dashboard-header .dashboard-header-demo {
            border-bottom-color: #e2e8f0 !important;
          }
          html[data-theme="light"] .admin-ph-dashboard-header .dashboard-header-demo .muted {
            color: #4338ca !important;
          }
          html[data-theme="light"] .admin-ph-dashboard-header .dashboard-header-demo strong {
            color: #312e81 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card:hover {
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card.highlight {
            border-color: rgba(99, 102, 241, 0.5) !important;
            background: linear-gradient(135deg, #eef2ff, #e0e7ff) !important;
            box-shadow: 0 8px 28px rgba(99, 102, 241, 0.15) !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card h3 {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card-tagline {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card-price {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card-price-suffix {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card .list-item {
            background: rgba(255, 255, 255, 0.7) !important;
            color: #334155 !important;
            border-color: #e2e8f0 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .pricing-card .list-item span {
            color: inherit !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .table-row {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .table-header {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .table-row .muted,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .table-row .badge {
            color: inherit !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .surface {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .surface strong {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .surface .muted {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .surface .btn:not(.btn-primary) {
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .surface .btn:not(.btn-primary):hover {
            background: #e2e8f0 !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-container {
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-container .unit-cell {
            color: #0f172a !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-page-title {
            color: #0f172a !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .zoom-controls-label,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-topic-filter .muted {
            color: #475569 !important;
          }
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .units-grid-container {
            background: transparent !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-container .btn-ghost,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-actions .btn-ghost,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-export .btn-ghost,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .btn-ghost {
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-container .btn-ghost:hover,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-actions .btn-ghost:hover,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-export .btn-ghost:hover,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .btn-ghost:hover {
            background: #e2e8f0 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .view-toggle button {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .view-toggle button.active {
            background: #eef2ff !important;
            border-color: rgba(99, 102, 241, 0.5) !important;
            color: #4338ca !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .tower-filter {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-header .zoom-controls button {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card .summary-value {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card .summary-label {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card .summary-title {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card .vote-bar-label {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-card .summary-foot {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .units-grid-container .legend,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .legend-modern,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .legend-modern .legend-item span:not(.legend-icon-wrap) {
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .legend-note {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .legend-cta {
            background: #eef2ff !important;
            border-color: rgba(99, 102, 241, 0.4) !important;
            color: #4338ca !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-detail-counts {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-detail-counts-title {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-detail-stat {
            background: #ffffff !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-detail-stat strong {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-detail-stat-label {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-detail-card {
            background: #ffffff !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-detail-card strong {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-detail-label {
            color: #64748b !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-detail-row {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .summary-detail-title {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .grid-stats {
            color: #475569 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .grid-stats strong {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-grid-stats {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            color: #334155 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .monitor-grid-stats .stat {
            color: #475569 !important;
          }

          html[data-theme="light"] .monitor-vote-modal-overlay {
            background: rgba(15, 23, 42, 0.4) !important;
          }

          html[data-theme="light"] .monitor-vote-modal {
            background: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #e2e8f0 !important;
          }

          html[data-theme="light"] .monitor-vote-modal h3 {
            color: #0f172a !important;
          }

          html[data-theme="light"] .monitor-vote-modal .muted {
            color: #64748b !important;
          }

          html[data-theme="light"] .monitor-vote-modal label {
            color: #334155 !important;
          }

          html[data-theme="light"] .monitor-vote-modal textarea {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
            color: #0f172a !important;
          }

          html[data-theme="light"] .profile-modal-section-label {
            color: #374151 !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content h2,
          html[data-theme="light"] .admin-ph-shell .admin-ph-content h3 {
            color: #0f172a !important;
          }

          html[data-theme="light"] .admin-ph-shell .admin-ph-content .card a[href]:not(.btn):not(.btn-ghost):not(.btn-primary),
          html[data-theme="light"] .admin-ph-shell .admin-ph-content .muted a {
            color: #4338ca !important;
          }

          html[data-theme="light"] .profile-modal-header h2 {
            color: #0f172a !important;
          }

          html[data-theme="light"] .profile-modal-section-label {
            color: #475569 !important;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .container:has(.admin-ph-shell) {
            max-width: 100%;
            padding-left: 24px;
            padding-right: 24px;
          }
          .container.platform-admin-container,
          .container:has(.platform-admin-shell) {
            max-width: 100%;
            padding-left: 24px;
            padding-right: 24px;
          }
          .platform-admin-shell {
            grid-template-columns: 260px 1fr;
          }
          .platform-admin-content {
            min-width: 0;
            max-width: 100%;
          }
          @media (min-width: 1280px) {
            .platform-admin-content {
              max-width: min(1400px, 94vw);
            }
          }
          @media (min-width: 1600px) {
            .platform-admin-content {
              max-width: min(1600px, 92vw);
            }
          }
          /* Platform Admin: mismo estilo que Admin PH (Dashboard asambleas demo) */
          .platform-admin-sidebar {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .platform-admin-sidebar .sidebar-header {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex-shrink: 0;
            min-width: 0;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12);
            margin-bottom: 4px;
          }
          .platform-admin-sidebar .sidebar-footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .platform-admin-shell .platform-admin-content .card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            padding: 20px 22px;
            margin-bottom: 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .platform-admin-shell .platform-admin-content .pill {
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 10px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: #a5b4fc;
            background: rgba(99, 102, 241, 0.1);
          }
          .platform-admin-shell .platform-admin-content .btn {
            border-radius: 10px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background: rgba(30, 41, 59, 0.6);
            color: #e2e8f0;
          }
          .platform-admin-shell .platform-admin-content .btn-primary {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border: none;
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
          }
          .platform-admin-shell .platform-admin-content .btn-ghost {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.25);
          }
          .platform-admin-shell .platform-admin-content .btn-ghost:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: rgba(148, 163, 184, 0.35);
          }
          .platform-admin-shell .platform-admin-content .muted {
            color: #94a3b8;
            font-size: 14px;
          }
          .platform-admin-shell .platform-admin-content .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 8px;
          }
          .platform-admin-shell .platform-admin-content .plans-edit-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
          }
          .platform-admin-shell .platform-admin-content .plans-edit-btn:hover {
            border-color: rgba(99, 102, 241, 0.5);
            color: #a5b4fc;
          }
          .platform-admin-shell .platform-admin-content .plans-table-row {
            transition: background 0.2s ease;
          }
          .platform-admin-shell .platform-admin-content .plans-table-row:hover {
            background: rgba(99, 102, 241, 0.04);
          }
          .platform-admin-shell .platform-admin-content .page-back-link {
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
          .platform-admin-shell .platform-admin-content .page-back-link:hover {
            background: rgba(71, 85, 105, 0.6);
            border-color: rgba(148, 163, 184, 0.35);
            color: #f1f5f9;
            transform: translateY(-1px);
          }
          .platform-admin-shell .platform-admin-content table {
            width: 100%;
            border-collapse: collapse;
          }
          .platform-admin-shell .platform-admin-content table thead th {
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          }
          .platform-admin-shell .platform-admin-content table tbody tr {
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            transition: background 0.15s ease;
          }
          .platform-admin-shell .platform-admin-content table tbody tr:hover {
            background: rgba(99, 102, 241, 0.06);
          }
          .platform-admin-shell .platform-admin-content table tbody td {
            padding: 14px 16px;
            vertical-align: middle;
          }
          .platform-admin-shell .platform-admin-content .btn-ghost.btn-sm:hover {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.3);
            color: #c7d2fe;
          }
          .container.landing-root {
            max-width: 100%;
            width: 100%;
            padding-left: clamp(16px, 5vw, 48px);
            padding-right: clamp(16px, 5vw, 48px);
            padding-top: 24px;
            padding-bottom: 48px;
            box-sizing: border-box;
          }

          .card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.4);
          }

          .glass {
            background: rgba(10, 15, 30, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.2);
            box-shadow: 0 20px 60px rgba(2, 6, 23, 0.6);
            backdrop-filter: blur(14px);
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 18px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            background: rgba(30, 41, 59, 0.8);
            color: #e2e8f0;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
          }

          .btn-primary {
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            border: none;
            color: white;
          }

          .btn-ghost {
            background: transparent;
            border: 1px solid rgba(148, 163, 184, 0.35);
          }

          .btn-access {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.35);
            color: #e2e8f0;
          }

          .btn-demo {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(236, 72, 153, 0.9));
            border: 1px solid rgba(147, 197, 253, 0.4);
            box-shadow: 0 16px 40px rgba(99, 102, 241, 0.4);
          }

          .btn-home {
            background: transparent;
            border: none;
            color: #e2e8f0;
            padding: 0;
            box-shadow: none;
          }

          .btn-icon {
            background: transparent;
            border: none;
            padding: 0;
            box-shadow: none;
            cursor: pointer;
          }

          .grid {
            display: grid;
            gap: 20px;
          }

          .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }

          .section {
            margin-top: 56px;
          }

          .section-title {
            margin: 0 0 12px;
            font-size: 28px;
          }

          .section-subtitle {
            margin: 0 0 24px;
            color: #cbd5f5;
          }

          .pill {
            display: inline-flex;
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            color: #a5b4fc;
            font-size: 12px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .card-list {
            display: grid;
            gap: 12px;
          }

          .table {
            display: grid;
            gap: 8px;
            --table-columns: 1fr 1.4fr 1fr 1fr 1fr 1.2fr;
          }

          .input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            background: rgba(15, 23, 42, 0.6);
            color: #e2e8f0;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            background: rgba(30, 41, 59, 0.6);
            color: #e2e8f0;
          }

          .badge-success {
            border-color: rgba(16, 185, 129, 0.6);
            color: #34d399;
          }

          .badge-warning {
            border-color: rgba(245, 158, 11, 0.6);
            color: #fbbf24;
          }

          .badge-muted {
            border-color: rgba(148, 163, 184, 0.5);
            color: #94a3b8;
          }

          .list-item {
            display: flex;
            gap: 12px;
            padding: 16px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: rgba(30, 41, 59, 0.6);
          }

          .table-row {
            display: grid;
            grid-template-columns: var(--table-columns);
            gap: 12px;
            align-items: center;
            padding: 14px 12px;
            border-radius: 14px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: rgba(15, 23, 42, 0.6);
          }

          .table-header {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #94a3b8;
            background: rgba(15, 23, 42, 0.8);
          }

          .two-col {
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }

          .cta-banner {
            margin-top: 32px;
            padding: 28px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(15, 23, 42, 0.9));
            border: 1px solid rgba(148, 163, 184, 0.2);
          }

          .hero-grid {
            display: grid;
            gap: 32px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            align-items: center;
          }
          .landing-root .hero-grid {
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          }
          @media (min-width: 900px) {
            .landing-root .hero-grid {
              grid-template-columns: 1fr minmax(320px, 0.45fr);
            }
          }

          .mockup {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 24px;
            padding: 20px;
          }

          .tag-row {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 16px;
          }

          .stat {
            display: grid;
            gap: 4px;
            padding: 12px 14px;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.15);
          }

          .footer {
            margin-top: 64px;
            padding: 32px 0 48px;
            color: #94a3b8;
            font-size: 14px;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
          }

          .logo-mark {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.8), transparent 55%),
              linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.8));
            border: 1px solid rgba(148, 163, 184, 0.35);
            color: white;
            font-weight: 700;
            letter-spacing: 0.03em;
            overflow: hidden;
          }

          .logo-mark img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .navbar {
            display: grid;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 999px;
            margin-bottom: 24px;
            border: 1px solid rgba(148, 163, 184, 0.2);
          }

          .nav-primary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .nav-links {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            color: #cbd5f5;
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 0.02em;
          }

          .nav-links a {
            padding: 6px 10px;
            border-radius: 999px;
          }

          .nav-links a:hover {
            background: rgba(79, 70, 229, 0.2);
          }

          .nav-links a:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
          }

          .nav-secondary {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .menu-pill {
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            color: #cbd5f5;
            border: 1px solid rgba(148, 163, 184, 0.2);
            background: rgba(15, 23, 42, 0.7);
            letter-spacing: 0.02em;
          }

          .pricing-grid {
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }
          .pricing-grid--pago-unico {
            grid-template-columns: repeat(2, minmax(240px, 320px));
            justify-content: flex-start;
            max-width: 680px;
            gap: 16px;
          }
          @media (max-width: 720px) {
            .pricing-grid--pago-unico {
              grid-template-columns: 1fr;
              max-width: none;
            }
          }

          .pricing-card {
            position: relative;
            border-radius: 24px;
            padding: 24px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }

          .pricing-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.4);
          }

          .pricing-card.highlight {
            border-color: rgba(99, 102, 241, 0.6);
            box-shadow: 0 20px 60px rgba(79, 70, 229, 0.3);
          }

          .pricing-card-tagline {
            color: #cbd5e1;
            font-size: 14px;
            margin: 4px 0 8px;
          }

          .pricing-card-price {
            font-size: 22px;
            margin: 8px 0 12px;
            font-weight: 700;
          }

          .pricing-card-price-suffix {
            font-size: 12px;
            color: #94a3b8;
            font-weight: 400;
          }

          .hero {
            position: relative;
            overflow: hidden;
          }

          .hero::after {
            content: "";
            position: absolute;
            inset: auto -20% -40% -20%;
            height: 200px;
            background: radial-gradient(circle, rgba(56, 189, 248, 0.2), transparent 70%);
          }

          .hero-title {
            font-size: 52px;
            margin: 18px 0;
            letter-spacing: -0.03em;
            line-height: 1.05;
            font-weight: 700;
          }

          .hero-subtitle {
            color: #cbd5f5;
            max-width: 620px;
            font-size: 17px;
            line-height: 1.65;
          }

          .hero-cta {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 24px;
          }

          .hero-eyebrow {
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.18em;
            color: #c7d2fe;
          }

          .logo-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 20px;
            color: #94a3b8;
            font-size: 14px;
          }

          .split {
            display: grid;
            gap: 24px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            align-items: center;
          }

          .surface {
            border-radius: 24px;
            padding: 24px;
            background: rgba(15, 23, 42, 0.75);
            border: 1px solid rgba(148, 163, 184, 0.16);
          }

          .icon-badge {
            width: 40px;
            height: 40px;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.5), transparent 55%),
              linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(236, 72, 153, 0.7));
            border: 1px solid rgba(129, 140, 248, 0.7);
            color: #e0e7ff;
            box-shadow: 0 12px 30px rgba(79, 70, 229, 0.35);
          }

          .kpi-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }

          .kpi-card {
            padding: 16px;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.16);
          }

          .app-shell {
            display: grid;
            grid-template-columns: 240px 1fr;
            min-height: 100vh;
            gap: 24px;
          }

          .admin-ph-shell:not(.sidebar-collapsed) {
            grid-template-columns: 260px 1fr;
          }

          .sidebar {
            position: sticky;
            top: 24px;
            align-self: start;
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.92) 100%);
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 20px;
            padding: 20px;
            height: calc(100vh - 48px);
            display: grid;
            gap: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid transparent;
            color: #e2e8f0;
            background: rgba(30, 41, 59, 0.5);
            transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
            text-decoration: none;
          }

          .sidebar-link:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: rgba(148, 163, 184, 0.2);
          }

          .sidebar-link.active {
            border-color: rgba(99, 102, 241, 0.5);
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(99, 102, 241, 0.15));
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
          }

          .admin-ph-shell.sidebar-collapsed {
            grid-template-columns: 72px 1fr;
          }

          .admin-ph-sidebar {
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: width 0.2s ease, padding 0.2s ease;
          }

          .admin-ph-sidebar.collapsed {
            padding: 14px 10px;
            min-width: 72px;
          }

          .admin-ph-sidebar:not(.collapsed) {
            width: 260px;
            min-width: 260px;
          }

          .admin-ph-sidebar .sidebar-header {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex-shrink: 0;
            min-width: 0;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12);
            margin-bottom: 4px;
          }

          .admin-ph-sidebar .sidebar-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            padding: 10px 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 12px;
            background: rgba(30, 41, 59, 0.7);
            color: #e2e8f0;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
          }

          .admin-ph-sidebar.collapsed .sidebar-toggle {
            padding: 10px;
            min-width: 44px;
          }

          .admin-ph-sidebar.collapsed .sidebar-toggle .sidebar-toggle-text {
            display: none;
          }

          .admin-ph-sidebar .sidebar-toggle:hover {
            background: rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.4);
            color: #c7d2fe;
          }

          .admin-ph-sidebar .sidebar-toggle-icon {
            display: inline-block;
            transition: transform 0.2s ease;
          }

          .admin-ph-sidebar .sidebar-brand {
            overflow: hidden;
            min-width: 0;
            word-break: break-word;
          }

          .admin-ph-sidebar .sidebar-pill {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.03em;
            color: #a5b4fc;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.25);
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .admin-ph-sidebar .sidebar-title {
            margin: 8px 0 2px;
            font-size: 0.95rem;
            font-weight: 700;
            color: #f1f5f9;
            letter-spacing: -0.01em;
            line-height: 1.2;
          }

          .admin-ph-sidebar .sidebar-subtitle {
            margin: 0;
            font-size: 11px;
            color: #94a3b8;
          }

          .admin-ph-sidebar.collapsed .sidebar-brand {
            display: none;
          }

          .admin-ph-sidebar .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
          }

          .admin-ph-sidebar .sidebar-link {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-shrink: 0;
            height: 48px;
            min-height: 48px;
            padding: 0 12px;
            gap: 12px;
            position: relative;
            border-radius: 14px;
            box-sizing: border-box;
            text-decoration: none;
          }

          .admin-ph-sidebar.collapsed .sidebar-link {
            justify-content: center;
            padding: 0 10px;
          }

          .admin-ph-sidebar .sidebar-icon-wrap {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
            max-width: 40px;
            max-height: 40px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            aspect-ratio: 1;
          }

          .admin-ph-sidebar .sidebar-icon-wrap svg {
            width: 22px !important;
            height: 22px !important;
            min-width: 22px !important;
            min-height: 22px !important;
            max-width: 22px !important;
            max-height: 22px !important;
            flex-shrink: 0;
            object-fit: contain;
          }

          .admin-ph-sidebar .sidebar-icon {
            flex-shrink: 0;
            font-size: 1.2rem;
          }

          .admin-ph-sidebar .sidebar-tooltip-static {
            position: absolute;
            left: -9999px;
            opacity: 0;
            pointer-events: none;
          }

          .admin-ph-sidebar .sidebar-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            font-weight: 500;
            color: inherit;
          }

          .admin-ph-sidebar.collapsed .sidebar-label {
            display: none;
          }

          .admin-ph-sidebar .sidebar-cursor-tooltip {
            position: fixed;
            transform: translate(14px, -50%);
            background: rgba(30, 41, 59, 0.98);
            color: #e2e8f0;
            padding: 8px 12px;
            border-radius: 10px;
            white-space: nowrap;
            font-size: 13px;
            pointer-events: none;
            border: 1px solid rgba(148, 163, 184, 0.25);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
          }

          .admin-ph-sidebar .sidebar-footer {
            margin-top: auto;
          }

          .admin-ph-sidebar .sidebar-cta {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
            height: 48px;
            min-height: 48px;
            padding: 0 12px;
            border-radius: 14px;
            position: relative;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
          }

          .admin-ph-sidebar.collapsed .sidebar-cta {
            justify-content: center;
            padding: 0 10px;
          }

          .admin-ph-sidebar.collapsed .sidebar-cta .sidebar-label {
            display: none;
          }

          .admin-ph-sidebar.collapsed .sidebar-cta .sidebar-icon-wrap {
            width: 40px;
            height: 40px;
          }

          .admin-ph-shell .admin-ph-content .card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            padding: 20px 22px;
            margin-bottom: 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .admin-ph-shell .admin-ph-content .dashboard-widget {
            padding: 22px 24px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .admin-ph-shell .admin-ph-content .pill {
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 10px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: #a5b4fc;
            background: rgba(99, 102, 241, 0.1);
          }

          .admin-ph-shell .admin-ph-content .dashboard-widget h1,
          .admin-ph-shell .admin-ph-content .dashboard-widget h2 {
            margin: 12px 0 8px;
            font-weight: 700;
            font-size: 1.35rem;
            color: #f1f5f9;
            letter-spacing: -0.02em;
          }

          .admin-ph-shell .admin-ph-content .dashboard-widget .muted,
          .admin-ph-shell .admin-ph-content .card .muted {
            color: #94a3b8;
            font-size: 14px;
          }

          .admin-ph-shell .admin-ph-content .btn {
            border-radius: 10px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid rgba(148, 163, 184, 0.35);
            background: rgba(30, 41, 59, 0.6);
            color: #e2e8f0;
          }

          .admin-ph-shell .admin-ph-content .btn-primary {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            border: none;
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
          }

          .admin-ph-shell .admin-ph-content .btn-ghost {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.25);
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget,
          .admin-ph-shell .admin-ph-content .chart-card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
            padding: 20px 22px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget h3,
          .admin-ph-shell .admin-ph-content .chart-card h3 {
            margin: 0 0 10px;
            font-size: 1.1rem;
            font-weight: 600;
            color: #f1f5f9;
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget p:first-of-type,
          .admin-ph-shell .admin-ph-content .chart-card .muted {
            color: #94a3b8;
            font-size: 13px;
            margin: 0 0 6px;
          }

          .admin-ph-shell .admin-ph-content .ph-card-widget {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
            padding: 20px 22px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .admin-ph-shell .admin-ph-content .ph-card-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            border-radius: 14px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-label {
            margin: 0;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-value {
            margin: 10px 0 4px;
            font-size: 1.75rem;
            font-weight: 700;
            color: #f1f5f9;
          }

          .admin-ph-shell .admin-ph-content .dashboard-kpi-widget .kpi-note {
            margin: 0;
            color: #a5b4fc;
            font-size: 13px;
          }

          .ph-card-widget:hover {
            border-color: rgba(99, 102, 241, 0.35) !important;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
          }

          .dashboard-ph-header {
            margin-bottom: 20px;
          }
          .dashboard-ph-header h2 {
            margin: 0 0 4px;
            font-size: 1.35rem;
          }
          .dashboard-ph-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
          }
          .ph-card-modern {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.7));
            padding: 20px;
            cursor: pointer;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          }
          .ph-card-modern:hover {
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 0 8px 28px rgba(99, 102, 241, 0.12);
            transform: translateY(-2px);
          }
          .ph-card-modern-header {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 16px;
          }
          .ph-card-modern-icon {
            width: 52px;
            height: 52px;
            min-width: 52px;
            border-radius: 14px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
          }
          .ph-card-modern-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #f1f5f9;
            flex: 1;
          }
          .ph-card-modern-badge {
            font-size: 12px;
            color: #94a3b8;
          }
          .ph-card-assembly-alert {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px 12px;
            margin-bottom: 14px;
            background: rgba(251, 191, 36, 0.12);
            border: 1px solid rgba(251, 191, 36, 0.35);
            border-radius: 10px;
          }
          .ph-card-assembly-alert-icon {
            font-size: 14px;
            flex-shrink: 0;
          }
          .ph-card-assembly-alert-content {
            font-size: 12px;
            color: #fef3c7;
            line-height: 1.4;
          }
          .ph-card-assembly-alert-content strong {
            color: #fcd34d;
          }
          .ph-card-assembly-alert-date {
            color: #a5b4fc;
          }
          .ph-card-assembly-alert-pending {
            color: #fca5a5;
          }
          .ph-card-modern-indicators {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }
          @media (max-width: 400px) {
            .ph-card-modern-indicators {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          .ph-card-indicator {
            text-align: center;
            padding: 10px 8px;
            background: rgba(15, 23, 42, 0.5);
            border-radius: 10px;
            border: 1px solid rgba(148, 163, 184, 0.15);
          }
          .ph-card-indicator-label {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 4px;
          }
          .ph-card-indicator-value {
            font-size: 15px;
            font-weight: 700;
            color: #e2e8f0;
          }
          .ph-card-modern-footer {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .ph-card-actions-secondary {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          .ph-card-action-btn {
            color: #94a3b8;
            font-size: 13px;
          }
          .ph-card-action-btn:hover {
            color: #e2e8f0;
          }
          .ph-card-delete-btn {
            color: #f87171;
          }
          .ph-card-delete-btn:hover {
            color: #fca5a5;
          }
          .ph-quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 10px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(148, 163, 184, 0.15);
          }
          .ph-quick-action {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
            padding: 10px 14px;
            min-width: 0;
            border-radius: 12px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            text-decoration: none;
            color: #e2e8f0;
            font-size: 13px;
            font-weight: 500;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
          }
          .ph-quick-action:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: rgba(148, 163, 184, 0.35);
            color: #f1f5f9;
          }
          .ph-quick-action-icon-wrap {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(51, 65, 85, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.15);
          }
          .ph-quick-action:hover .ph-quick-action-icon-wrap {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.3);
          }
          .ph-quick-action-icon-wrap svg {
            width: 22px;
            height: 22px;
            color: currentColor;
          }
          .ph-quick-action-label {
            line-height: 1.25;
            white-space: normal;
            overflow: visible;
            flex: 1;
            min-width: 0;
          }
          .ph-quick-action--primary {
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(99, 102, 241, 0.15));
            border-color: rgba(99, 102, 241, 0.45);
            color: #c7d2fe;
          }
          .ph-quick-action--primary .ph-quick-action-icon-wrap {
            background: rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.35);
          }
          .ph-quick-action--primary:hover {
            background: rgba(99, 102, 241, 0.25);
            border-color: rgba(99, 102, 241, 0.5);
          }
          @media (max-width: 600px) {
            .ph-quick-actions {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          .ph-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }
          .ph-kpi-card {
            display: block;
            padding: 20px 22px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            text-decoration: none;
            color: inherit;
            position: relative;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          }
          .ph-kpi-card:hover {
            border-color: rgba(99, 102, 241, 0.35);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
            transform: translateY(-2px);
          }
          .ph-kpi-card .kpi-label { margin: 0; color: #94a3b8; font-size: 13px; }
          .ph-kpi-card .kpi-value { margin: 10px 0 4px; font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
          .ph-kpi-card .kpi-note { margin: 0; color: #a5b4fc; font-size: 13px; }
          .ph-kpi-card .ph-kpi-link {
            display: block;
            margin-top: 10px;
            font-size: 12px;
            color: #818cf8;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .ph-kpi-card:hover .ph-kpi-link { opacity: 1; }

          .ph-dashboard-widgets-group {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 24px;
            border-radius: 20px;
            border: 1px solid rgba(148, 163, 184, 0.15);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.45), rgba(15, 23, 42, 0.4));
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          }
          .ph-widgets-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          @media (max-width: 960px) {
            .ph-widgets-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 520px) {
            .ph-widgets-grid { grid-template-columns: 1fr; }
          }
          .ph-widget-card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-left: 4px solid rgba(99, 102, 241, 0.5);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            padding: 18px 20px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
            min-height: 0;
          }
          .ph-widget-card .ph-widget-icon {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            color: #94a3b8;
          }
          .ph-widget-card .ph-widget-label {
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .ph-widget-card .ph-widget-value {
            margin: 8px 0 4px;
            font-size: 1.5rem;
            font-weight: 700;
            color: #f1f5f9;
          }
          .ph-widget-card .ph-widget-note {
            margin: 0;
            font-size: 12px;
            color: #a5b4fc;
          }
          .ph-widget-card--proxima {
            padding: 18px 20px;
          }
          .ph-widget-card--proxima .ph-widget-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }
          .ph-widget-card--proxima .ph-widget-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            flex: 1;
          }
          .ph-widget-countdown {
            font-size: 11px;
            font-weight: 600;
            color: #6366f1;
            background: rgba(99, 102, 241, 0.2);
            padding: 3px 8px;
            border-radius: 999px;
          }
          .ph-widget-proxima-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 0;
          }
          .ph-widget-proxima-title {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #e2e8f0;
            line-height: 1.3;
          }
          .ph-widget-proxima-date {
            font-size: 12px;
            color: #94a3b8;
          }
          .ph-widget-indicators {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .ph-widget-indicator {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ph-widget-indicator-label,
          .ph-widget-indicator-value {
            font-size: 11px;
            color: #94a3b8;
          }
          .ph-widget-indicator-value {
            font-weight: 600;
            color: #e2e8f0;
          }
          .ph-widget-progress {
            height: 6px;
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.2);
            overflow: hidden;
          }
          .ph-widget-progress-fill {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.8));
            transition: width 0.3s ease;
          }
          .ph-widget-progress-fill--green {
            background: linear-gradient(90deg, rgba(74, 222, 128, 0.5), rgba(34, 197, 94, 0.7));
          }
          .ph-widget-location {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #94a3b8;
          }
          .ph-widget-location-icon {
            display: flex;
            flex-shrink: 0;
          }
          .ph-widget-cta {
            margin-top: auto;
            width: 100%;
            justify-content: center;
            border-radius: 10px;
            padding: 10px 16px;
            font-size: 13px;
            text-decoration: none;
          }
          .ph-widget-proxima-empty {
            margin: 0;
            font-size: 13px;
            color: #94a3b8;
          }

          .ph-card-btn {
            font-size: 13px;
          }

          .dashboard-widgets-group {
            display: flex;
            flex-direction: column;
            gap: 0;
            padding: 20px 24px;
            border-radius: 20px;
            border: 1px solid rgba(148, 163, 184, 0.15);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.35));
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          }
          .dashboard-widgets-group .dashboard-demo-card {
            margin-bottom: 16px;
          }
          .dashboard-widgets-group .dashboard-widgets-row {
            margin-top: 0;
          }
          .dashboard-widgets-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
            margin-top: 24px;
          }
          .dashboard-widget-card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            padding: 20px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          }
          .dashboard-widget-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
          }
          .dashboard-widget-header h3 {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 600;
          }
          .dashboard-widget-icon {
            font-size: 20px;
          }
          .dashboard-widget-today {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 10px;
          }
          .dashboard-widget-upcoming {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 13px;
          }
          .dashboard-widget-upcoming strong {
            color: #e2e8f0;
          }
          .dashboard-widget-notes-body,
          .dashboard-widget-notifications-body {
            font-size: 13px;
          }
          .dashboard-notification-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          }
          .dashboard-notification-item:last-child {
            border-bottom: none;
          }
          .dashboard-notification-dot {
            width: 6px;
            height: 6px;
            min-width: 6px;
            margin-top: 6px;
            border-radius: 50%;
            background: #6366f1;
          }

          .reminder-checklist-item--checked span {
            text-decoration: line-through;
            opacity: 0.65;
          }
          .reminder-checkbox {
            width: 18px;
            height: 18px;
            accent-color: #6366f1;
            flex-shrink: 0;
          }
          .reminder-delete-btn {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            padding: 0;
            border: none;
            background: transparent;
            color: #94a3b8;
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s, background 0.2s;
          }
          .reminder-delete-btn:hover {
            color: #f87171;
            background: rgba(248, 113, 113, 0.15);
          }

          .dashboard-widget-upcoming-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .dashboard-widget-event {
            display: flex;
            gap: 14px;
            padding: 12px 14px;
            background: rgba(15, 23, 42, 0.4);
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-left: 3px solid rgba(99, 102, 241, 0.6);
            transition: background 0.2s, border-color 0.2s;
          }
          .dashboard-widget-event:hover {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.2);
          }
          .dashboard-widget-event-date {
            font-size: 12px;
            color: #94a3b8;
            white-space: nowrap;
            display: flex;
            flex-direction: column;
          }
          .dashboard-widget-event-time {
            font-size: 11px;
            opacity: 0.85;
          }
          .dashboard-widget-event-content {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .dashboard-widget-event-content strong {
            font-size: 13px;
            color: #e2e8f0;
          }
          .dashboard-widget-event-countdown {
            font-size: 11px;
            color: #6366f1;
            font-weight: 500;
          }
          .dashboard-widget-calendar-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 500;
            color: #a5b4fc;
            text-decoration: none;
            border-radius: 10px;
            transition: color 0.2s, background 0.2s;
          }
          .dashboard-widget-calendar-link:hover {
            color: #c7d2fe;
            background: rgba(99, 102, 241, 0.12);
          }

          .dashboard-create-ph-wrap {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
          }
          .admin-ph-shell .admin-ph-content .btn-create-ph-trigger {
            padding: 10px 18px;
            border-radius: 12px;
            font-weight: 500;
            transition: background 0.2s, border-color 0.2s, transform 0.15s;
          }
          .admin-ph-shell .admin-ph-content .btn-create-ph-trigger:hover {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.4);
          }
          .admin-ph-shell .admin-ph-content .create-ph-form {
            padding: 28px 26px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.15);
            background: linear-gradient(160deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.6));
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          .create-ph-form-header {
            margin-bottom: 24px;
          }
          .create-ph-form-title {
            margin: 0 0 6px;
            font-size: 1.25rem;
            font-weight: 700;
            color: #f1f5f9;
            letter-spacing: -0.02em;
          }
          .create-ph-form-desc {
            margin: 0;
            font-size: 14px;
            color: #94a3b8;
          }
          .create-ph-form-fields {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .create-ph-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .create-ph-field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          @media (max-width: 560px) {
            .create-ph-field-row {
              grid-template-columns: 1fr;
            }
          }
          .create-ph-label {
            font-size: 13px;
            font-weight: 600;
            color: #e2e8f0;
          }
          .create-ph-required {
            color: var(--color-error, #ef4444);
            font-weight: 600;
          }
          .create-ph-input,
          .create-ph-select {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            background: rgba(15, 23, 42, 0.6);
            color: #f1f5f9;
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          }
          .create-ph-input::placeholder {
            color: #64748b;
          }
          .create-ph-input:hover,
          .create-ph-select:hover {
            border-color: rgba(148, 163, 184, 0.4);
          }
          .create-ph-input:focus,
          .create-ph-select:focus {
            outline: none;
            border-color: rgba(99, 102, 241, 0.6);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          }
          .create-ph-select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
          }
          .create-ph-form-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 28px;
            padding-top: 24px;
            border-top: 1px solid rgba(148, 163, 184, 0.12);
          }
          .create-ph-form-actions .btn-primary {
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
          }
          .edit-resident-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .edit-resident-modal {
            max-width: 420px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 20px 22px;
            margin: 12px;
          }
          .edit-resident-modal .create-ph-form-header {
            margin-bottom: 16px;
          }
          .edit-resident-modal .create-ph-form-title {
            font-size: 1.1rem;
            margin: 0 0 4px;
          }
          .edit-resident-modal .create-ph-form-desc {
            font-size: 13px;
          }
          .edit-resident-modal .create-ph-form-fields {
            gap: 14px;
          }
          .edit-resident-modal .create-ph-form-actions {
            margin-top: 20px;
            padding-top: 18px;
          }
          .admin-ph-shell .admin-ph-content .create-ph-cancel {
            border-color: rgba(148, 163, 184, 0.3);
            color: #94a3b8;
          }
          .admin-ph-shell .admin-ph-content .create-ph-cancel:hover {
            background: rgba(148, 163, 184, 0.1);
            color: #e2e8f0;
          }
          .create-ph-plan-suggestion {
            margin-top: 24px;
            padding: 20px;
            border-radius: 14px;
            background: rgba(99, 102, 241, 0.08);
            border: 1px solid rgba(99, 102, 241, 0.25);
          }
          .create-ph-plan-suggestion-title {
            margin: 0 0 8px;
            font-size: 14px;
            font-weight: 600;
            color: #e2e8f0;
          }
          .create-ph-plan-suggestion-desc {
            font-size: 13px;
            margin: 0 0 14px;
          }
          .create-ph-plan-suggestion-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            margin-top: 8px;
          }
          .create-ph-plan-suggestion-actions:first-of-type {
            margin-top: 0;
          }
          .create-ph-plan-suggestion-note {
            font-size: 12px;
            margin: 12px 0 0;
          }
          .admin-ph-shell .admin-ph-content .btn-sm {
            padding: 8px 14px;
            font-size: 13px;
            border-radius: 10px;
          }

          .admin-ph-shell .admin-ph-content .two-col {
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }

          .admin-ph-shell .admin-ph-content .card-list .list-item {
            padding: 10px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.08);
            color: #e2e8f0;
            font-size: 14px;
          }

          .admin-ph-shell .admin-ph-content .card-list .list-item:last-child {
            border-bottom: none;
          }

          .owners-list {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .owners-list-item {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12);
            transition: background 0.15s;
          }
          .owners-list-item:last-child {
            border-bottom: none;
          }
          .owners-list-item:hover {
            background: rgba(148, 163, 184, 0.06);
          }
          .owners-list-main {
            flex: 1;
            min-width: 0;
          }
          .owners-list-primary {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .owners-list-email {
            font-size: 14px;
            font-weight: 600;
            color: #f1f5f9;
          }
          .owners-list-unit {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.35);
            color: #a5b4fc;
          }
          .owners-list-meta {
            font-size: 12px;
            margin-top: 4px;
            color: #94a3b8;
          }
          .owners-list-actions {
            display: flex;
            align-items: center;
            flex-shrink: 0;
          }
          .owners-list-remove {
            font-size: 13px;
            color: var(--color-error, #ef4444) !important;
          }
          .owners-list-remove:hover {
            background: rgba(239, 68, 68, 0.1) !important;
          }

          .admin-ph-shell .admin-ph-content h2 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #f1f5f9;
            margin: 0 0 8px;
          }

          .admin-ph-shell .admin-ph-content h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #f1f5f9;
            margin: 0 0 10px;
          }

          .admin-ph-top-bar {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 14px;
            min-height: 44px;
          }
          .user-menu-anchor {
            position: relative;
          }
          .user-menu-trigger {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 8px 14px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            background: rgba(30, 41, 59, 0.5);
            color: #e2e8f0;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          }
          .user-menu-trigger:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: rgba(148, 163, 184, 0.35);
          }
          .user-menu-trigger:focus-visible {
            outline: 2px solid rgba(99, 102, 241, 0.6);
            outline-offset: 2px;
          }
          .user-menu-avatar {
            width: 32px;
            height: 32px;
            min-width: 32px;
            border-radius: 50%;
            background: linear-gradient(145deg, rgba(99, 102, 241, 0.35), rgba(56, 189, 248, 0.2));
            border: 1px solid rgba(99, 102, 241, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .user-menu-initials {
            font-size: 12px;
            font-weight: 600;
            color: #e2e8f0;
            letter-spacing: -0.02em;
          }
          .user-menu-label {
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .user-menu-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 260px;
            padding: 12px 0;
            background: rgba(30, 41, 59, 0.98);
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 14px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            z-index: 100;
          }
          .user-menu-dropdown-section {
            padding: 0 16px 12px;
          }
          .user-menu-dropdown-label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #94a3b8;
            margin-bottom: 6px;
          }
          .user-menu-dropdown-plan {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 8px;
          }
          .user-menu-dropdown-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .user-menu-chip {
            display: inline-flex;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            color: #94a3b8;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.15);
          }
          .user-menu-dropdown-divider {
            height: 1px;
            background: rgba(148, 163, 184, 0.15);
            margin: 8px 0;
          }
          .user-menu-dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px 16px;
            border: none;
            background: transparent;
            color: #e2e8f0;
            font-size: 14px;
            text-align: left;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.15s;
          }
          .user-menu-dropdown-item:hover {
            background: rgba(99, 102, 241, 0.12);
          }
          .user-menu-dropdown-item--logout {
            color: #f87171;
            font-weight: 600;
          }
          .user-menu-dropdown-item--logout:hover {
            background: rgba(248, 113, 113, 0.12);
          }

          .admin-ph-profile-card {
            padding: 18px 22px;
            margin-bottom: 18px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.5));
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 20px;
          }

          .admin-ph-profile-card .profile-avatar {
            width: 48px;
            height: 48px;
            min-width: 48px;
            border-radius: 14px;
            background: linear-gradient(145deg, rgba(99, 102, 241, 0.25), rgba(56, 189, 248, 0.15));
            border: 1px solid rgba(99, 102, 241, 0.35);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            overflow: hidden;
          }

          .admin-ph-profile-card .profile-avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .admin-ph-profile-card .profile-organization {
            display: block;
            font-size: 13px;
            color: #94a3b8;
            margin-top: 2px;
          }

          .admin-ph-profile-card .profile-info {
            flex: 1;
            min-width: 0;
          }

          .admin-ph-profile-card .profile-email {
            font-size: 15px;
            font-weight: 600;
            color: #f1f5f9;
            letter-spacing: -0.01em;
            display: block;
          }

          .admin-ph-profile-card .profile-role {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
          }

          .admin-ph-profile-card .profile-plan {
            margin-top: 10px;
            padding: 8px 12px;
            border-radius: 10px;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.15);
            font-size: 12px;
            color: #94a3b8;
          }

          .admin-ph-profile-card .profile-plan strong {
            color: #e2e8f0;
            font-weight: 600;
          }

          .admin-ph-profile-card .profile-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
          }

          .admin-ph-profile-card .profile-actions .btn-ghost {
            padding: 8px 14px;
            font-size: 13px;
            border-radius: 10px;
          }

          .admin-ph-profile-card .profile-actions .btn-primary {
            padding: 8px 16px;
            font-size: 13px;
            border-radius: 10px;
            font-weight: 600;
          }

          .admin-ph-dashboard-header.dashboard-demo-card {
            padding: 20px 24px;
            margin-bottom: 20px;
            border-radius: 16px;
            border: 1px solid rgba(99, 102, 241, 0.25);
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.06));
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
          }
          .dashboard-demo-strip {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 16px 24px;
            width: 100%;
          }
          .dashboard-demo-strip-left {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px 20px;
            flex: 1;
            min-width: 0;
          }
          .dashboard-demo-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.02em;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.4);
            color: #c7d2fe;
          }
          .dashboard-demo-message {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .dashboard-demo-title {
            font-size: 15px;
            font-weight: 600;
            color: #f1f5f9;
          }
          .dashboard-demo-sub {
            font-size: 12px;
            color: #94a3b8;
          }
          .dashboard-demo-time-block {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
            flex-shrink: 0;
          }
          .dashboard-demo-days {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            font-variant-numeric: tabular-nums;
          }
          .dashboard-demo-progress-wrap {
            width: 120px;
            height: 10px;
            border-radius: 5px;
            background: rgba(15, 23, 42, 0.7);
            overflow: hidden;
            border: 1px solid rgba(148, 163, 184, 0.15);
          }
          .dashboard-demo-progress-bar {
            height: 100%;
            border-radius: 4px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            transition: width 0.3s ease;
          }
          .dashboard-demo-cta {
            flex-shrink: 0;
            padding: 11px 20px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .dashboard-demo-cta:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          }
          .profile-card-row {
            display: flex;
            flex-wrap: wrap;
            gap: 16px 20px;
            align-items: center;
          }
          .admin-ph-profile-card .profile-avatar-initials {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #e2e8f0;
            background: linear-gradient(145deg, rgba(99, 102, 241, 0.4), rgba(56, 189, 248, 0.25));
          }
          .admin-ph-profile-card .profile-avatar-emoji {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 22px;
          }
          .profile-plan-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
          }
          .profile-plan-chip {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            color: #94a3b8;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.15);
          }
          .profile-plan-chip.plan-name {
            font-weight: 600;
            color: #e2e8f0;
            background: rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.35);
          }
          .admin-ph-profile-card .profile-actions .btn-icon-label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .admin-ph-profile-card .profile-actions .btn-icon {
            font-size: 14px;
            opacity: 0.9;
          }
          .admin-ph-profile-card .profile-actions .btn-logout {
            font-weight: 600;
          }

          .date-time-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 10px;
            background: rgba(148, 163, 184, 0.15);
            border: 1px solid rgba(148, 163, 184, 0.2);
            font-size: 13px;
            color: #e2e8f0;
          }
          .date-time-indicator .date-time-calendar {
            font-size: 16px;
          }
          .date-time-indicator .date-time-date {
            font-weight: 500;
            line-height: 1.2;
          }
          .date-time-indicator .date-time-time {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .date-time-indicator.date-time-compact {
            padding: 6px 10px;
            font-size: 12px;
            white-space: nowrap;
          }
          html[data-theme="light"] .date-time-indicator {
            background: #f1f5f9;
            border-color: #e2e8f0;
            color: #334155;
          }
          html[data-theme="light"] .date-time-indicator .date-time-time {
            color: #64748b;
          }

          .profile-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 16px;
          }

          .profile-modal-card {
            max-width: 420px;
            width: 100%;
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
          }

          .profile-modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
          }

          .profile-modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
          }

          .profile-modal-close {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 10px;
            background: rgba(148, 163, 184, 0.15);
            color: #94a3b8;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
          }

          .profile-modal-close:hover {
            background: rgba(148, 163, 184, 0.25);
            color: #e2e8f0;
          }

          .profile-modal-desc {
            margin: 0 0 20px;
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.45;
          }

          .profile-modal-section {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .profile-modal-section-label {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .profile-modal-readonly-badge,
          .profile-modal-optional {
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 6px;
            color: #64748b;
            background: rgba(148, 163, 184, 0.12);
          }

          .profile-modal-readonly-fields {
            display: grid;
            gap: 12px;
          }

          .profile-modal-field {
            display: grid;
            gap: 4px;
          }

          .profile-modal-field-label {
            font-size: 12px;
            color: #64748b;
          }

          .profile-modal-field-value {
            font-size: 14px;
            color: #e2e8f0;
            padding: 10px 12px;
            border-radius: 10px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.12);
          }

          .profile-modal-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(148, 163, 184, 0.3);
            background: rgba(15, 23, 42, 0.6);
            color: #e2e8f0;
            font-size: 14px;
            box-sizing: border-box;
          }

          .profile-modal-input::placeholder {
            color: #64748b;
          }

          .profile-modal-input:focus {
            outline: none;
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
          }

          .profile-modal-avatar-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .profile-modal-avatar-option {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            border: 2px solid rgba(148, 163, 184, 0.2);
            background: rgba(15, 23, 42, 0.5);
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s, transform 0.15s;
          }

          .profile-modal-avatar-option:hover {
            border-color: rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.1);
          }

          .profile-modal-avatar-option.selected {
            border-color: #6366f1;
            background: rgba(99, 102, 241, 0.2);
          }

          .profile-modal-photo-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }

          .profile-modal-photo-preview {
            width: 72px;
            height: 72px;
            min-width: 72px;
            border-radius: 14px;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .profile-modal-photo-preview.profile-modal-photo-dropzone {
            width: 88px;
            height: 88px;
            min-width: 88px;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s;
          }

          .profile-modal-photo-preview.profile-modal-photo-dropzone:hover {
            border-color: rgba(99, 102, 241, 0.5);
            background: rgba(99, 102, 241, 0.08);
          }

          .profile-modal-avatar-row--modern {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
          }

          .profile-modal-avatar-option--modern {
            width: 44px;
            height: 44px;
            min-width: 44px;
            border-radius: 12px;
            padding: 0;
          }

          .profile-modal-photo-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .profile-modal-photo-placeholder {
            font-size: 32px;
          }

          .profile-modal-photo-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .profile-modal-photo-input {
            position: absolute;
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            z-index: -1;
          }

          .profile-modal-photo-btn {
            align-self: flex-start;
          }

          .profile-modal-theme-row {
            display: flex;
            gap: 10px;
          }

          .profile-modal-theme-option {
            flex: 1;
            padding: 12px 16px;
            border-radius: 12px;
            border: 2px solid rgba(148, 163, 184, 0.2);
            background: rgba(15, 23, 42, 0.5);
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s;
          }

          .profile-modal-theme-option:hover {
            border-color: rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.1);
          }

          .profile-modal-theme-option.selected {
            border-color: #6366f1;
            background: rgba(99, 102, 241, 0.2);
          }

          .profile-modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 24px;
          }

          .profile-modal-overlay.profile-modal--light .profile-modal-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 14px rgba(0, 0, 0, 0.06) !important;
            color: #1e293b !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-header h2 {
            color: #0f172a !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-desc {
            color: #374151 !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-section-label {
            color: #475569 !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-field-value,
          .profile-modal-overlay.profile-modal--light .profile-modal-input {
            background: #f8fafc !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
            color: #0f172a !important;
          }
          .profile-modal-overlay.profile-modal--light {
            background: rgba(0, 0, 0, 0.45) !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-avatar-option {
            background: #f1f5f9 !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-avatar-option.selected {
            border-color: #6366f1 !important;
            background: rgba(99, 102, 241, 0.15) !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-theme-option {
            background: #f1f5f9 !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
            color: #1e293b !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-theme-option.selected {
            border-color: #6366f1 !important;
            background: rgba(99, 102, 241, 0.15) !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-close {
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            color: #475569 !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-close:hover {
            background: #e2e8f0 !important;
            color: #0f172a !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-photo-preview {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-photo-preview.profile-modal-photo-dropzone:hover {
            background: rgba(99, 102, 241, 0.06) !important;
            border-color: rgba(99, 102, 241, 0.4) !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-readonly-badge,
          .profile-modal-overlay.profile-modal--light .profile-modal-optional {
            color: #64748b !important;
            background: #f1f5f9 !important;
          }
          .profile-modal-overlay.profile-modal--light .profile-modal-field-label {
            color: #64748b !important;
          }
          .profile-modal-overlay.profile-modal--light .btn-ghost.profile-modal-photo-btn {
            background: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #334155 !important;
          }
          .profile-modal-overlay.profile-modal--light .btn-ghost.profile-modal-photo-btn:hover {
            background: #e2e8f0 !important;
            color: #0f172a !important;
          }

          .content-area {
            display: grid;
            gap: 24px;
          }

          .admin-ph-shell .admin-ph-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding-left: 20px;
            padding-right: 20px;
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }
          .admin-ph-page-title-block {
            width: 100%;
            margin-bottom: 6px;
          }
          .admin-ph-page-title {
            margin: 0 0 4px;
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }
          .admin-ph-page-subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: #64748b;
            line-height: 1.4;
          }
          html:not([data-theme="light"]) .admin-ph-page-title {
            color: #f1f5f9;
          }
          html:not([data-theme="light"]) .admin-ph-page-subtitle {
            color: #94a3b8;
          }

          .admin-ph-shell .admin-ph-content > * {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }
          /* Móvil: contenido a ancho completo */
          @media (max-width: 767px) {
            .admin-ph-shell .admin-ph-content {
              padding-left: 14px;
              padding-right: 14px;
            }
            .admin-ph-shell .admin-ph-content > * {
              max-width: 100%;
            }
          }
          /* Tablet: limitar ancho para legibilidad */
          @media (min-width: 768px) and (max-width: 1023px) {
            .admin-ph-shell .admin-ph-content > * {
              max-width: min(900px, 100%);
            }
          }
          /* PC: ancho contenido cómodo (reducido respecto a antes) */
          @media (min-width: 1024px) {
            .admin-ph-shell .admin-ph-content > * {
              max-width: min(1200px, 96vw);
            }
          }
          @media (min-width: 1280px) {
            .admin-ph-shell .admin-ph-content > * {
              max-width: min(1360px, 92vw);
            }
          }
          @media (min-width: 1600px) {
            .admin-ph-shell .admin-ph-content > * {
              max-width: min(1440px, 90vw);
            }
          }

          .chart-card {
            background: rgba(15, 23, 42, 0.75);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 20px;
            padding: 20px;
          }

          .chart-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }

          .chart-bar {
            height: 10px;
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.2);
            overflow: hidden;
          }

          .chart-bar > span {
            display: block;
            height: 100%;
            background: linear-gradient(135deg, #38bdf8, #6366f1);
          }

          .admin-ph-shell .admin-ph-content .chart-bar > span {
            background: linear-gradient(90deg, #6366f1, #818cf8);
          }

          .chip {
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            letter-spacing: 0.04em;
            color: #c7d2fe;
            border: 1px solid rgba(129, 140, 248, 0.5);
            background: rgba(30, 41, 59, 0.6);
          }

          .muted {
            color: #94a3b8;
          }

          @media (max-width: 1200px) {
            .container {
              max-width: 1000px;
            }
            .container.landing-root {
              max-width: 100%;
            }
          }

          @media (max-width: 960px) {
            .container {
              padding: 36px 20px;
            }
            .container.landing-root {
              padding-left: clamp(16px, 4vw, 24px);
              padding-right: clamp(16px, 4vw, 24px);
            }

            .hero-title {
              font-size: 42px;
            }

            .navbar {
              border-radius: 24px;
              padding: 16px;
            }

            .nav-primary {
              flex-wrap: wrap;
              gap: 12px;
            }

            .app-shell {
              grid-template-columns: 1fr;
            }

            .sidebar {
              position: relative;
              height: auto;
            }

            .table-row {
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            }
          }

          @media (max-width: 720px) {
            .container {
              padding: 28px 18px;
            }
            .container.landing-root {
              padding-left: 16px;
              padding-right: 16px;
            }

            .hero-title {
              font-size: 34px;
              line-height: 1.12;
            }

            .hero-subtitle {
              font-size: 15px;
            }

            .nav-links,
            .nav-secondary {
              width: 100%;
              justify-content: flex-start;
            }

            .pricing-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 520px) {
            .container {
              padding: 22px 16px;
            }
            .container.landing-root {
              padding-left: 12px;
              padding-right: 12px;
            }

            .hero-title {
              font-size: 30px;
            }

            .logo-mark {
              width: 40px;
              height: 40px;
            }

            .btn {
              padding: 10px 14px;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
