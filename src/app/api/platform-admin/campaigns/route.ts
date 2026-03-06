/**
 * GET /api/platform-admin/campaigns – Lista campañas CRM.
 * POST – Crear nueva campaña.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, is_active, last_executed_at, created_at, updated_at,
             description, target_stage, frequency, email_subject, email_body
      FROM platform_campaigns
      ORDER BY created_at ASC
    `;
    return NextResponse.json(
      rows.map((r: any) => ({
        ...r,
        description: r.description ?? null,
        target_stage: r.target_stage ?? null,
        frequency: r.frequency ?? null,
        email_subject: r.email_subject ?? null,
        email_body: r.email_body ?? null,
      }))
    );
  } catch (e: any) {
    if (e?.code === "42P01") return NextResponse.json([]);
    if (e?.code === "42703") {
      try {
        const rows = await sql`
          SELECT id, name, is_active, last_executed_at, created_at, updated_at
          FROM platform_campaigns
          ORDER BY created_at ASC
        `;
        return NextResponse.json(
          rows.map((r: any) => ({
            ...r,
            description: null,
            target_stage: null,
            frequency: null,
            email_subject: null,
            email_body: null,
          }))
        );
      } catch (_) {}
    }
    console.error("[platform-admin/campaigns GET]", e);
    return NextResponse.json({ error: "Error al listar campañas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "name es requerido" }, { status: 400 });
    }
    const [row] = await sql`
      INSERT INTO platform_campaigns (name, description, target_stage, frequency, email_subject, email_body, is_active)
      VALUES (
        ${name},
        ${body?.description || null},
        ${body?.target_stage || null},
        ${body?.frequency || null},
        ${body?.email_subject || null},
        ${body?.email_body || null},
        ${body?.is_active !== false}
      )
      RETURNING id, name, is_active, last_executed_at, created_at, updated_at, description, target_stage, frequency, email_subject, email_body
    `;
    return NextResponse.json(row);
  } catch (e: any) {
    if (e?.code === "23505") return NextResponse.json({ error: "Ya existe una campaña con ese nombre" }, { status: 409 });
    if (e?.code === "42P01") return NextResponse.json({ error: "Tabla platform_campaigns no existe" }, { status: 500 });
    if (e?.code === "42703") {
      try {
        const campaignName = String(name ?? "");
        const isActive = body?.is_active !== false;
        const [row] = await sql`
          INSERT INTO platform_campaigns (name, is_active)
          VALUES (${campaignName}, ${isActive})
          RETURNING id, name, is_active, last_executed_at, created_at, updated_at
        `;
        return NextResponse.json({ ...row, description: null, target_stage: null, frequency: null, email_subject: null, email_body: null });
      } catch (_) {}
    }
    console.error("[platform-admin/campaigns POST]", e);
    return NextResponse.json({ error: "Error al crear campaña" }, { status: 500 });
  }
}
