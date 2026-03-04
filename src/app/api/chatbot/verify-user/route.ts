/**
 * POST /api/chatbot/verify-user
 * Verifica un usuario por correo (para el bot de Telegram).
 * Body: { email: string, roleFilter?: "RESIDENTE" } - si roleFilter es "RESIDENTE", solo devuelve si el usuario es residente.
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const roleFilter = body.roleFilter === "RESIDENTE" ? "RESIDENTE" : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
    }

    if (roleFilter === "RESIDENTE") {
      const [user] = await sql<{ id: string; email: string; role: string }[]>`
        SELECT id, email, role
        FROM users
        WHERE LOWER(email) = ${email} AND role = 'RESIDENTE'
        LIMIT 1
      `;
      if (!user) {
        return NextResponse.json({ ok: false });
      }
      return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
    }

    const [user] = await sql<{ id: string; email: string; role: string }[]>`
      SELECT id, email, role
      FROM users
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;
    if (!user) {
      return NextResponse.json({ ok: false });
    }
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("[chatbot/verify-user]", err);
    return NextResponse.json({ ok: false, error: "Error al consultar usuario" }, { status: 500 });
  }
}
