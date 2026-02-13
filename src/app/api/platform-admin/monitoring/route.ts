/**
 * GET /api/platform-admin/monitoring – Métricas Monitor VPS (placeholder).
 * Ref: QA_REPORTE_DASHBOARD_HENRY §5 y §7. En producción leería Docker/stats, pg_stat_activity, etc.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const placeholder = {
    source: "placeholder",
    note: "En producción: API leería métricas reales (Docker, pg_stat_activity, sistema).",
    metrics: [
      { label: "RAM", used: 6.7, total: 16, unit: "GB" },
      { label: "CPU", used: 2.8, total: 8, unit: "vCPU" },
      { label: "Disco", used: 217, total: 320, unit: "GB" },
      { label: "Conexiones DB", used: 2200, total: 10000, unit: "" },
    ],
    active_assemblies: 8,
    reserved_today: 12,
    max_reserved_week: 28,
  };
  return NextResponse.json(placeholder);
}
