/**
 * Identidad para el chatbot: reconoce residente o apoderado por correo.
 * GET ?email= →
 *   - Si es RESIDENTE: { type: 'resident', user_id, organization_id, organization_name, unit, unit_code, resident_name, email }
 *   - Si es apoderado (poder aprobado): { type: 'apoderado', organization_id, organization_name, email, powers: [{ unit_code, resident_email }] }
 *   - Si no: 404
 *
 * Lógica de voto:
 * - Residente: 1 voto (su unidad). unit_code es el código para POST order-of-day-vote.
 * - Apoderado: N votos (uno por cada poder aprobado). Cada poder tiene unit_code del residente que cedió.
 *   Al votar, se envía el mismo valor para cada unit_code de sus poderes.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

function inferUnitCodeFromEmail(email: string): string | null {
  const prefix = (email || "").split("@")[0] || "";
  const numPart = prefix.replace(/^residente/i, "").trim();
  if (/^residente\d*$/i.test(prefix) && numPart !== "") return numPart;
  if (/^\d+$/.test(numPart)) return numPart;
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim()?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email requerido" }, { status: 400 });
    }

    type ResidentRow = {
      user_id: string;
      organization_id: string;
      organization_name: string;
      email: string;
    };
    const [resident] = await sql<ResidentRow[]>`
      SELECT u.id AS user_id, u.organization_id, u.email, o.name AS organization_name
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = ${email} AND u.role = 'RESIDENTE'
      LIMIT 1
    `;

    if (resident) {
      const prefix = resident.email.split("@")[0] || "";
      const numPart = prefix.replace(/^residente/i, "") || "1";
      const residentName = /^residente\d*$/i.test(prefix) ? `Residente ${numPart}` : prefix || resident.email;
      const unit = /^residente\d*$/i.test(prefix) ? `Unidad ${numPart}` : null;
      const unit_code = inferUnitCodeFromEmail(resident.email);

      return NextResponse.json({
        type: "resident",
        user_id: resident.user_id,
        organization_id: resident.organization_id,
        organization_name: resident.organization_name || "PH",
        unit,
        unit_code,
        resident_name: residentName,
        email: resident.email,
      });
    }

    type PowerRow = {
      resident_email: string;
      organization_id: string;
      organization_name: string;
    };
    const powerRows = await sql<PowerRow[]>`
      SELECT u_res.email AS resident_email, pr.organization_id, o.name AS organization_name
      FROM power_requests pr
      JOIN users u_res ON u_res.id = pr.resident_user_id
      JOIN organizations o ON o.id = pr.organization_id
      WHERE LOWER(TRIM(pr.apoderado_email)) = ${email} AND pr.status = 'APPROVED'
      ORDER BY pr.created_at ASC
    `;

    if (powerRows.length > 0) {
      const orgId = powerRows[0].organization_id;
      const orgName = powerRows[0].organization_name || "PH";
      const powers = powerRows.map((r) => ({
        unit_code: inferUnitCodeFromEmail(r.resident_email) || "",
        resident_email: r.resident_email,
      })).filter((p) => p.unit_code !== "");

      if (powers.length === 0) {
        return NextResponse.json({ error: "Apoderado sin unidades asignadas" }, { status: 404 });
      }

      return NextResponse.json({
        type: "apoderado",
        organization_id: orgId,
        organization_name: orgName,
        email,
        powers,
      });
    }

    return NextResponse.json({ error: "Correo no reconocido como residente ni como apoderado" }, { status: 404 });
  } catch (e) {
    console.error("[chat-identity]", e);
    return NextResponse.json({ error: "Error al obtener identidad" }, { status: 500 });
  }
}
