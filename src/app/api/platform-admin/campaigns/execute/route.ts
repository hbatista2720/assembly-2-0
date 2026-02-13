/**
 * POST /api/platform-admin/campaigns/execute – Ejecutar campañas activas (placeholder).
 * Ref: QA_REPORTE_DASHBOARD_HENRY §7. En producción dispararía envío de emails/flujos.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

export async function POST() {
  try {
    await sql`
      UPDATE platform_campaigns
      SET last_executed_at = NOW(), updated_at = NOW()
      WHERE is_active = true
    `;
    return NextResponse.json({ ok: true, message: "Campañas ejecutadas (placeholder: en producción enviaría emails)." });
  } catch (e: any) {
    if (e?.code === "42P01") return NextResponse.json({ ok: true, message: "Campañas ejecutadas (sin BD)." });
    console.error("[platform-admin/campaigns/execute POST]", e);
    return NextResponse.json({ error: "Error al ejecutar" }, { status: 500 });
  }
}
