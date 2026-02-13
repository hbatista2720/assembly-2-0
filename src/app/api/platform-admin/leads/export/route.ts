/**
 * GET /api/platform-admin/leads/export?format=csv – Descarga CSV de leads (Dashboard Henry).
 * Ref: QA_REPORTE_DASHBOARD_HENRY §5 y §7.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    if (format !== "csv") {
      return NextResponse.json({ error: "Solo format=csv soportado" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, email, phone, company_name, lead_source, funnel_stage, lead_score, lead_qualified, created_at
      FROM platform_leads
      ORDER BY created_at DESC
    `;
    const headers = ["email", "phone", "company_name", "lead_source", "funnel_stage", "lead_score", "lead_qualified", "created_at"];
    const lines = [headers.join(",")];
    for (const r of rows as any[]) {
      const values = headers.map((h) => escapeCsv(r[h] != null ? String(r[h]) : ""));
      lines.push(values.join(","));
    }
    const csv = "\uFEFF" + lines.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e: any) {
    if (e?.code === "42P01") {
      return new NextResponse("\uFEFFemail,phone,company_name,lead_source,funnel_stage,lead_score,lead_qualified,created_at\n", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }
    console.error("[platform-admin/leads/export]", e);
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}
