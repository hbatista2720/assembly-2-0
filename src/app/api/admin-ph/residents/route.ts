/**
 * Listar y crear residentes de una organización (Admin PH).
 * GET ?organization_id=xxx → lista de residentes con face_id_enabled.
 * POST { organization_id, email } → crea residente (chatbot lo reconocerá automáticamente).
 * Ref: Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const organizationId = body.organization_id?.trim();
    const email = body.email?.trim()?.toLowerCase();
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existing) {
      return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
    }
    const [org] = await sql<{ id: string }[]>`
      SELECT id FROM organizations WHERE id = ${organizationId}::uuid LIMIT 1
    `;
    if (!org) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }
    const [inserted] = await sql<{ id: string }[]>`
      INSERT INTO users (organization_id, email, role, is_platform_owner)
      VALUES (${organizationId}::uuid, ${email}, 'RESIDENTE', FALSE)
      RETURNING id
    `;
    return NextResponse.json({
      success: true,
      user_id: inserted?.id,
      email,
      organization_id: organizationId,
      message: "Residente creado. El chatbot lo reconocerá automáticamente.",
    });
  } catch (e) {
    console.error("[admin-ph/residents POST]", e);
    return NextResponse.json({ error: "Error al crear residente" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organization_id")?.trim();
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }

    type Row = { id: string; email: string; face_id_enabled: boolean | null };
    const rows = await sql<Row[]>`
      SELECT id, email, face_id_enabled
      FROM users
      WHERE organization_id = ${organizationId}::uuid AND role = 'RESIDENTE'
      ORDER BY email
    `;

    return NextResponse.json({
      residents: rows.map((r) => ({
        user_id: r.id,
        email: r.email,
        face_id_enabled: r.face_id_enabled !== false,
      })),
    });
  } catch (e) {
    console.error("[admin-ph/residents]", e);
    return NextResponse.json({ error: "Error al listar residentes" }, { status: 500 });
  }
}
