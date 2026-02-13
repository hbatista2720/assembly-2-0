/**
 * DELETE residente de una organización (Admin PH).
 * Body: { organization_id: string }
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
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
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido en el body" }, { status: 400 });
    }

    const [resident] = await sql<{ id: string }[]>`
      SELECT id FROM users
      WHERE id = ${userId}::uuid AND organization_id = ${organizationId}::uuid AND role = 'RESIDENTE'
      LIMIT 1
    `;
    if (!resident) {
      return NextResponse.json({ error: "Residente no encontrado en esta organización" }, { status: 404 });
    }

    await sql`DELETE FROM users WHERE id = ${userId}::uuid`;

    return NextResponse.json({ success: true, message: "Residente eliminado" });
  } catch (e) {
    console.error("[admin-ph/residents DELETE]", e);
    return NextResponse.json({ error: "Error al eliminar residente" }, { status: 500 });
  }
}
