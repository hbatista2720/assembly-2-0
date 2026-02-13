/**
 * GET /api/platform-admin/tickets – Lista tickets (Dashboard Henry).
 * Ref: QA_REPORTE_DASHBOARD_HENRY.md §5 y §7.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const PRIORITY_SLA: Record<string, string> = {
  urgent: "1h",
  high: "4h",
  medium: "6h",
  low: "24h",
};

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, ticket_number, subject, status, priority, source, created_at
      FROM platform_tickets
      ORDER BY created_at DESC
    `;
    const tickets = (rows as any[]).map((r) => ({
      id: r.id,
      ticket_number: r.ticket_number,
      subject: r.subject,
      status: r.status,
      priority: r.priority,
      source: r.source,
      sla: PRIORITY_SLA[r.priority] || "6h",
      created_at: r.created_at,
    }));
    return NextResponse.json(tickets);
  } catch (e: any) {
    if (e?.code === "42P01") {
      return NextResponse.json([], { status: 200 });
    }
    console.error("[platform-admin/tickets GET]", e);
    return NextResponse.json({ error: "Error al listar tickets" }, { status: 500 });
  }
}
