/**
 * GET /api/platform-admin/tickets/[id] – Detalle de un ticket (id o ticket_number).
 * PATCH – Resolver o escalar. Ref: QA_REPORTE_DASHBOARD_HENRY.md §5 y §7.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = isUuid(id)
      ? await sql`
          SELECT id, ticket_number, subject, description, status, priority, source,
                 resolution_notes, resolved_at, resolved_by, escalation_reason, messages, created_at, updated_at
          FROM platform_tickets WHERE id = ${id}::uuid LIMIT 1
        `
      : await sql`
          SELECT id, ticket_number, subject, description, status, priority, source,
                 resolution_notes, resolved_at, resolved_by, escalation_reason, messages, created_at, updated_at
          FROM platform_tickets WHERE ticket_number = ${id} LIMIT 1
        `;
    if (!row) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (e: any) {
    if (e?.code === "42P01") {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    console.error("[platform-admin/tickets/[id] GET]", e);
    return NextResponse.json({ error: "Error al obtener ticket" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const resolution_notes = body?.resolution_notes?.trim() || null;

    const [existing] = isUuid(id)
      ? await sql`SELECT id, messages FROM platform_tickets WHERE id = ${id}::uuid LIMIT 1`
      : await sql`SELECT id, messages FROM platform_tickets WHERE ticket_number = ${id} LIMIT 1`;
    if (!existing) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    const ticketId = (existing as any).id;

    if (action === "resolve") {
      const messages = Array.isArray((existing as any).messages) ? (existing as any).messages : [];
      const newMessages = [...messages, { role: "admin", content: resolution_notes || "Resuelto.", timestamp: new Date().toISOString() }];
      await sql`
        UPDATE platform_tickets
        SET status = 'resolved', resolution_notes = ${resolution_notes}, resolved_at = NOW(), resolved_by = 'admin_henry',
            messages = ${JSON.stringify(newMessages)}::jsonb, updated_at = NOW()
        WHERE id = ${ticketId}::uuid
      `;
      return NextResponse.json({ ok: true, message: "Ticket resuelto." });
    }

    if (action === "escalate") {
      await sql`
        UPDATE platform_tickets
        SET status = 'escalated', priority = 'urgent', escalation_reason = ${body?.escalation_reason || "Escalado manualmente por admin"}, updated_at = NOW()
        WHERE id = ${ticketId}::uuid
      `;
      return NextResponse.json({ ok: true, message: "Ticket escalado." });
    }

    return NextResponse.json({ error: "action debe ser resolve o escalate" }, { status: 400 });
  } catch (e: any) {
    if (e?.code === "42P01") {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }
    console.error("[platform-admin/tickets/[id] PATCH]", e);
    return NextResponse.json({ error: "Error al actualizar ticket" }, { status: 500 });
  }
}
