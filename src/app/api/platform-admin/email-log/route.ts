/**
 * GET /api/platform-admin/email-log
 * Lista el historial de correos enviados por la plataforma (buzón dashboard Henry).
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, to_email, subject, email_type, body_preview, success, created_at
      FROM email_log
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ entries: rows });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "42P01") {
      return NextResponse.json({ entries: [], tableMissing: true });
    }
    console.error("[email-log] Error:", err);
    return NextResponse.json({ error: "Error al cargar historial", entries: [] }, { status: 500 });
  }
}
