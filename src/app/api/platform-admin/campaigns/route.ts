/**
 * GET /api/platform-admin/campaigns – Lista campañas CRM.
 * PATCH no aplica a lista; usar PATCH por id. Ref: QA_REPORTE_DASHBOARD_HENRY §5 y §7.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, is_active, last_executed_at, created_at, updated_at
      FROM platform_campaigns
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (e: any) {
    if (e?.code === "42P01") return NextResponse.json([]);
    console.error("[platform-admin/campaigns GET]", e);
    return NextResponse.json({ error: "Error al listar campañas" }, { status: 500 });
  }
}
