/**
 * Perfil del residente para mostrar en chat (§C Marketing: tipo PH, unidad, usuario).
 * GET ?email= → { user_id, organization_id, organization_name, unit, resident_name, email }
 *
 * Lógica: El chatbot usa la misma BD que todos los PH (demo y reales). Cualquier residente
 * agregado por cualquier Admin PH (en cualquier organización) está en la tabla users con
 * role = 'RESIDENTE' y organization_id = su PH. No hay proceso de sincronización aparte:
 * una sola fuente de verdad (la BD). Al crear un PH o agregar residentes, el chatbot
 * los reconoce automáticamente porque consulta la misma tabla users.
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

    let faceIdEnabled = true;
    try {
      const [row2] = await sql<{ face_id_enabled: boolean | null }[]>`
        SELECT face_id_enabled FROM users WHERE id = ${row.user_id} LIMIT 1
      `;
      if (row2 && typeof row2.face_id_enabled === "boolean") faceIdEnabled = row2.face_id_enabled !== false;
    } catch {
      // Columna face_id_enabled puede no existir si no se ejecutó 101_face_id_enabled_users.sql
    }

    const prefix = row.email.split("@")[0] || "";
    const numPart = prefix.replace(/^residente/i, "") || "1";
    const residentName =
      /^residente\d*$/i.test(prefix) ? `Residente ${numPart}` : prefix || row.email;
    const unit = /^residente\d*$/i.test(prefix) ? `Unidad ${numPart}` : null;
    const unit_code = /^residente\d*$/i.test(prefix) ? numPart : null;

    return NextResponse.json({
      user_id: row.user_id,
      organization_id: row.organization_id,
      organization_name: row.organization_name || "PH",
      unit: unit,
      unit_code,
      resident_name: residentName,
      email: row.email,
      face_id_enabled: faceIdEnabled,
    });
  } catch (e) {
    console.error("[resident-profile]", e);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}
