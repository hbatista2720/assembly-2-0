/**
 * Registro de abandono de sala por residente (§E)
 * Ref: QA/QA_FEEDBACK.md, Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md
 */

import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

type PostBody = {
  user_id?: string;
  email?: string;
  organization_id?: string;
  assembly_id?: string | null;
  resident_name?: string | null;
  unit?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const organizationId = body.organization_id?.trim() || null;
    const assemblyId = body.assembly_id?.trim() || null;
    const residentName = body.resident_name?.trim() || null;
    const unit = body.unit?.trim() || null;

    let userId: string | null = body.user_id?.trim() || null;

    if (!userId && body.email) {
      const email = String(body.email).trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ error: "user_id o email requerido" }, { status: 400 });
      }
      const [user] = await sql<{ id: string; organization_id: string }[]>`
        SELECT id, organization_id FROM users WHERE email = ${email} LIMIT 1
      `;
      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      userId = user.id;
      if (!organizationId) {
        // use org from user if not sent
        const orgId = user.organization_id;
        if (!orgId) {
          return NextResponse.json({ error: "organization_id requerido" }, { status: 400 });
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "user_id o email requerido" }, { status: 400 });
    }

    const orgId = organizationId || (await sql<{ organization_id: string }[]>`SELECT organization_id FROM users WHERE id = ${userId} LIMIT 1`)[0]?.organization_id;
    if (!orgId) {
      return NextResponse.json({ error: "organization_id no determinado" }, { status: 400 });
    }

    const [row] = await sql<{ id: string; abandoned_at: string }[]>`
      INSERT INTO resident_abandon_events (user_id, organization_id, assembly_id, resident_name, unit)
      VALUES (${userId}, ${orgId}, ${assemblyId || null}, ${residentName}, ${unit})
      RETURNING id, abandoned_at
    `;

    if (!row) {
      return NextResponse.json({ error: "Error al registrar abandono" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: row.id,
      abandoned_at: row.abandoned_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar abandono";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET: listar abandonos por assembly_id o organization_id (Admin PH) */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assemblyIdParam = searchParams.get("assemblyId")?.trim() || null;
    const organizationId = searchParams.get("organizationId")?.trim() || null;

    if (!assemblyIdParam && !organizationId) {
      return NextResponse.json({ error: "assemblyId o organizationId requerido" }, { status: 400 });
    }

    const assemblyId = assemblyIdParam && UUID_REGEX.test(assemblyIdParam) ? assemblyIdParam : null;

    type Row = { id: string; resident_name: string | null; unit: string | null; abandoned_at: string; email: string };
    let rows: Row[];

    if (assemblyId) {
      rows = await sql<Row[]>`
        SELECT rae.id, rae.resident_name, rae.unit, rae.abandoned_at, u.email
        FROM resident_abandon_events rae
        JOIN users u ON u.id = rae.user_id
        WHERE rae.assembly_id = ${assemblyId}
        ORDER BY rae.abandoned_at DESC
        LIMIT 200
      `;
    } else if (organizationId && UUID_REGEX.test(organizationId)) {
      rows = await sql<Row[]>`
        SELECT rae.id, rae.resident_name, rae.unit, rae.abandoned_at, u.email
        FROM resident_abandon_events rae
        JOIN users u ON u.id = rae.user_id
        WHERE rae.organization_id = ${organizationId}
        ORDER BY rae.abandoned_at DESC
        LIMIT 200
      `;
    } else {
      rows = [];
    }

    const events = rows.map((r) => ({
      id: r.id,
      resident_name: r.resident_name,
      unit: r.unit,
      email: r.email,
      abandoned_at: r.abandoned_at,
      display: `Residente ${[r.resident_name, r.unit, r.email].filter(Boolean).join(" · ") || "N/A"} abandonó la sala a las ${formatAbandonedAt(r.abandoned_at)}`,
    }));

    return NextResponse.json({ events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al listar abandonos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatAbandonedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}
