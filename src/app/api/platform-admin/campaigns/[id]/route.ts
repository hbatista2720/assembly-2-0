/**
 * PATCH /api/platform-admin/campaigns/[id] – Activar/desactivar campaña.
 * PUT – Actualizar campaña completa (nombre, descripción, plantilla, etc.).
 * DELETE – Eliminar campaña.
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
      RETURNING id, name, is_active, last_executed_at, created_at, updated_at, description, target_stage, frequency, email_subject, email_body
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "name es requerido" }, { status: 400 });
    }

    const [row] = await sql`
      UPDATE platform_campaigns
      SET
        name = ${name},
        description = ${body?.description ?? null},
        target_stage = ${body?.target_stage ?? null},
        frequency = ${body?.frequency ?? null},
        email_subject = ${body?.email_subject ?? null},
        email_body = ${body?.email_body ?? null},
        is_active = ${body?.is_active !== false},
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, name, is_active, last_executed_at, created_at, updated_at, description, target_stage, frequency, email_subject, email_body
    `;
    if (!row) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (e: any) {
    if (e?.code === "23505") return NextResponse.json({ error: "Ya existe una campaña con ese nombre" }, { status: 409 });
    if (e?.code === "42P01") return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    console.error("[platform-admin/campaigns PUT]", e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = await sql`
      DELETE FROM platform_campaigns WHERE id = ${id}::uuid RETURNING id
    `;
    if (!row) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "42P01") return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    console.error("[platform-admin/campaigns DELETE]", e);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
