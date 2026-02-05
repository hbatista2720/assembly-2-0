/**
 * FASE 11: API de leads para Dashboard Henry (CRM).
 * GET: listar leads (filtro opcional por funnel_stage).
 * PATCH: calificar o activar demo (body: { id, action: 'qualify' | 'activate_demo' }).
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage") || undefined;

    const rows = stage
      ? await sql`
          SELECT id, email, phone, company_name, lead_source, funnel_stage, lead_score, lead_qualified, last_interaction_at, created_at
          FROM platform_leads
          WHERE funnel_stage = ${stage}
          ORDER BY updated_at DESC
        `
      : await sql`
          SELECT id, email, phone, company_name, lead_source, funnel_stage, lead_score, lead_qualified, last_interaction_at, created_at
          FROM platform_leads
          ORDER BY updated_at DESC
        `;

    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: "Error al listar leads", details: e?.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const action = body?.action;

    if (!id || !action) {
      return NextResponse.json({ error: "Se requiere id y action (qualify | activate_demo)" }, { status: 400 });
    }

    if (action === "qualify") {
      await sql`
        UPDATE platform_leads
        SET lead_qualified = TRUE, lead_score = GREATEST(COALESCE(lead_score, 0), 80), funnel_stage = 'qualified', updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
      return NextResponse.json({ ok: true, message: "Lead calificado." });
    }
    if (action === "activate_demo") {
      await sql`
        UPDATE platform_leads
        SET funnel_stage = 'demo_active', updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
      return NextResponse.json({ ok: true, message: "Demo activado." });
    }

    return NextResponse.json({ error: "action debe ser qualify o activate_demo" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: "Error al actualizar lead", details: e?.message }, { status: 500 });
  }
}
