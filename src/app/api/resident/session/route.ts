/**
 * POST /api/resident/session  { email, channel: 'web' | 'telegram' }
 * Registra el canal activo del residente (sesión única).
 * GET /api/resident/session?email=...  Devuelve { channel, conflictWithOther } si otro canal está activo recientemente.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const SESSION_STALE_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const channel = body.channel === "telegram" ? "telegram" : body.channel === "web" ? "web" : null;
    if (!email || !channel) {
      return NextResponse.json({ error: "email y channel (web|telegram) requeridos" }, { status: 400 });
    }
    await sql`
      INSERT INTO resident_sessions (email, channel, last_activity_at)
      VALUES (${email}, ${channel}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        channel = EXCLUDED.channel,
        last_activity_at = NOW()
    `;
    return NextResponse.json({ ok: true, channel });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "42P01") {
      return NextResponse.json({ error: "Tabla resident_sessions no existe. Ejecuta la migración 020." }, { status: 503 });
    }
    console.error("[resident/session] POST:", err);
    return NextResponse.json({ error: "Error al registrar sesión" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase() || "";
  if (!email) {
    return NextResponse.json({ error: "email requerido" }, { status: 400 });
  }
  try {
    const rows = await sql<{ channel: string; last_activity_at: string }[]>`
      SELECT channel, last_activity_at FROM resident_sessions WHERE email = ${email}
    `;
    if (!rows?.length) {
      return NextResponse.json({ channel: null, conflictWithOther: false });
    }
    const row = rows[0];
    const last = new Date(row.last_activity_at).getTime();
    const stale = Date.now() - last > SESSION_STALE_MINUTES * 60 * 1000;
    if (stale) {
      return NextResponse.json({ channel: row.channel, conflictWithOther: false, stale: true });
    }
    return NextResponse.json({
      channel: row.channel,
      conflictWithOther: false,
      last_activity_at: row.last_activity_at,
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "42P01") {
      return NextResponse.json({ channel: null, conflictWithOther: false });
    }
    console.error("[resident/session] GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
