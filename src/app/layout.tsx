import type { ReactNode } from "react";

export const metadata = {
  title: "Assembly 2.0",
  description: "Governanza digital para PH",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
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

          a {
            color: inherit;
            text-decoration: none;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 48px 24px;
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

          .list-item {
            display: flex;
            gap: 12px;
            padding: 16px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: rgba(30, 41, 59, 0.6);
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

          .sidebar {
            position: sticky;
            top: 24px;
            align-self: start;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.16);
            border-radius: 20px;
            padding: 20px;
            height: calc(100vh - 48px);
            display: grid;
            gap: 16px;
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid transparent;
            color: #e2e8f0;
            background: rgba(30, 41, 59, 0.5);
          }

          .sidebar-link.active {
            border-color: rgba(99, 102, 241, 0.6);
            background: rgba(79, 70, 229, 0.2);
          }

          .content-area {
            display: grid;
            gap: 24px;
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
          }

          @media (max-width: 960px) {
            .container {
              padding: 36px 20px;
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
          }

          @media (max-width: 720px) {
            .container {
              padding: 28px 18px;
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
