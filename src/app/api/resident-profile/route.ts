/**
 * Perfil del residente para mostrar en chat (§C Marketing: tipo PH, unidad, usuario).
 * GET ?email= → { user_id, organization_id, organization_name, unit, resident_name, email }
 */

import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim()?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email requerido" }, { status: 400 });
    }

    type Row = {
      user_id: string;
      organization_id: string;
      organization_name: string;
      email: string;
    };
    const [row] = await sql<Row[]>`
      SELECT u.id AS user_id, u.organization_id, u.email, o.name AS organization_name
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = ${email} AND u.role = 'RESIDENTE'
      LIMIT 1
    `;
    if (!row) {
      return NextResponse.json({ error: "Residente no encontrado" }, { status: 404 });
    }

    const prefix = row.email.split("@")[0] || "";
    const numPart = prefix.replace(/^residente/i, "") || "1";
    const residentName =
      /^residente\d*$/i.test(prefix) ? `Residente ${numPart}` : prefix || row.email;
    const unit = /^residente\d*$/i.test(prefix) ? `Unidad ${numPart}` : null;

    return NextResponse.json({
      user_id: row.user_id,
      organization_id: row.organization_id,
      organization_name: row.organization_name || "PH",
      unit: unit,
      resident_name: residentName,
      email: row.email,
    });
  } catch (e) {
    console.error("[resident-profile]", e);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}
