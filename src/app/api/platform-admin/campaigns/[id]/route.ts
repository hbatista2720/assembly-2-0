/**
 * PATCH /api/platform-admin/campaigns/[id] – Activar/desactivar campaña.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const is_active = body?.is_active;

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active (boolean) requerido" }, { status: 400 });
    }

    const [row] = await sql`
      UPDATE platform_campaigns
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, name, is_active, last_executed_at, updated_at
    `;
    if (!row) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (e: any) {
    if (e?.code === "42P01") return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    console.error("[platform-admin/campaigns PATCH]", e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
