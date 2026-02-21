/**
 * Listar solicitudes de poder de una organización (Admin PH).
 * GET ?organization_id=xxx → lista de power_requests (PENDING primero, luego por fecha).
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
    const rows = await sql<{
      id: string;
      resident_user_id: string;
      resident_email: string;
      apoderado_tipo: string;
      apoderado_email: string;
      apoderado_nombre: string;
      apoderado_cedula: string | null;
      apoderado_telefono: string | null;
      vigencia: string | null;
      status: string;
      created_at: string;
    }[]>`
      SELECT pr.id, pr.resident_user_id, u.email AS resident_email,
             pr.apoderado_tipo, pr.apoderado_email, pr.apoderado_nombre,
             pr.apoderado_cedula, pr.apoderado_telefono, pr.vigencia,
             pr.status, pr.created_at
      FROM power_requests pr
      JOIN users u ON u.id = pr.resident_user_id
      WHERE pr.organization_id = ${organizationId}::uuid
      ORDER BY CASE pr.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END, pr.created_at DESC
    `;
    return NextResponse.json({
      requests: rows.map((r) => ({
        id: r.id,
        resident_user_id: r.resident_user_id,
        resident_email: r.resident_email,
        apoderado_tipo: r.apoderado_tipo,
        apoderado_email: r.apoderado_email,
        apoderado_nombre: r.apoderado_nombre,
        apoderado_cedula: r.apoderado_cedula ?? undefined,
        apoderado_telefono: r.apoderado_telefono ?? undefined,
        vigencia: r.vigencia ?? undefined,
        status: r.status,
        created_at: r.created_at,
      })),
    });
  } catch (e) {
    console.error("[admin-ph/power-requests GET]", e);
    return NextResponse.json({ error: "Error al listar solicitudes" }, { status: 500 });
  }
}
