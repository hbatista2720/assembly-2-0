/**
 * Listar residentes de una organización (Admin PH).
 * GET ?organization_id=xxx → lista de residentes con face_id_enabled.
 * Ref: Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
