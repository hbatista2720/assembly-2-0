/**
 * Lectura y actualización de configuración de residente (Face ID) por Admin PH.
 * GET → { face_id_enabled }
 * PUT body: { organization_id: string, face_id_enabled: boolean }
 * Ref: Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: "userId (UUID) inválido" }, { status: 400 });
    }

    const [row] = await sql<{ face_id_enabled: boolean | null; role: string }[]>`
      SELECT face_id_enabled, role FROM users WHERE id = ${userId}::uuid LIMIT 1
    `;
    if (!row || row.role !== "RESIDENTE") {
      return NextResponse.json({ error: "Residente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      face_id_enabled: row.face_id_enabled !== false,
    });
  } catch (e) {
    console.error("[admin-ph/residents/settings GET]", e);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: "userId (UUID) inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const organizationId = body?.organization_id?.trim();
    const faceIdEnabled = typeof body?.face_id_enabled === "boolean" ? body.face_id_enabled : undefined;

    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido en el body" }, { status: 400 });
    }
    if (faceIdEnabled === undefined) {
      return NextResponse.json({ error: "face_id_enabled (boolean) requerido en el body" }, { status: 400 });
    }

    const [resident] = await sql<{ id: string }[]>`
      SELECT id FROM users
      WHERE id = ${userId}::uuid AND organization_id = ${organizationId}::uuid AND role = 'RESIDENTE'
      LIMIT 1
    `;
    if (!resident) {
      return NextResponse.json({ error: "Residente no encontrado en esta organización" }, { status: 404 });
    }

    await sql`
      UPDATE users SET face_id_enabled = ${faceIdEnabled} WHERE id = ${userId}::uuid
    `;

    return NextResponse.json({ face_id_enabled: faceIdEnabled });
  } catch (e) {
    console.error("[admin-ph/residents/settings PUT]", e);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
