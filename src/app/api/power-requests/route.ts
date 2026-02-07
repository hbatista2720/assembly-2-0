/**
 * Solicitudes de poder desde chatbot (Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md, Marketing §G).
 * POST: crear solicitud PENDING. GET: listar por residente (para saber si hay pendiente).
 */
import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const APODERADO_TIPO = ["residente_ph", "titular_mayor_edad"] as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id")?.trim();
    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: "user_id (UUID) requerido" }, { status: 400 });
    }
    const rows = await sql<{ id: string; status: string }[]>`
      SELECT id, status FROM power_requests
      WHERE resident_user_id = ${userId}::uuid
      ORDER BY created_at DESC
    `;
    const pending = rows.find((r) => r.status === "PENDING");
    return NextResponse.json({
      requests: rows,
      has_pending: !!pending,
    });
  } catch (e) {
    console.error("[power-requests GET]", e);
    return NextResponse.json({ error: "Error al consultar solicitudes", has_pending: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const residentUserId = body.resident_user_id?.trim();
    const organizationId = body.organization_id?.trim();
    const apoderadoTipo = body.apoderado_tipo?.trim();
    const apoderadoEmail = body.apoderado_email?.trim()?.toLowerCase();
    const apoderadoNombre = body.apoderado_nombre?.trim();
    const apoderadoCedula = body.apoderado_cedula?.trim() || null;
    const apoderadoTelefono = body.apoderado_telefono?.trim() || null;
    const vigencia = body.vigencia?.trim() || null;

    if (!residentUserId || !UUID_REGEX.test(residentUserId)) {
      return NextResponse.json({ error: "resident_user_id (UUID) requerido" }, { status: 400 });
    }
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }
    if (!APODERADO_TIPO.includes(apoderadoTipo as (typeof APODERADO_TIPO)[number])) {
      return NextResponse.json({ error: "apoderado_tipo debe ser residente_ph o titular_mayor_edad" }, { status: 400 });
    }
    if (!apoderadoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(apoderadoEmail)) {
      return NextResponse.json({ error: "Correo del apoderado inválido" }, { status: 400 });
    }
    if (!apoderadoNombre) {
      return NextResponse.json({ error: "Nombre del apoderado requerido" }, { status: 400 });
    }

    if (apoderadoTipo === "residente_ph") {
      const [exists] = await sql<{ id: string }[]>`
        SELECT id FROM users
        WHERE email = ${apoderadoEmail} AND organization_id = ${organizationId}::uuid AND role = 'RESIDENTE'
        LIMIT 1
      `;
      if (!exists) {
        return NextResponse.json(
          { error: "El correo no corresponde a un residente del mismo PH. Verifica o elige 'Titular mayor de edad'." },
          { status: 400 }
        );
      }
    }

    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM power_requests
      WHERE resident_user_id = ${residentUserId}::uuid AND status = 'PENDING'
      LIMIT 1
    `;
    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes una solicitud de poder pendiente por aprobar." },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO power_requests (
        resident_user_id, organization_id, apoderado_tipo, apoderado_email, apoderado_nombre,
        apoderado_cedula, apoderado_telefono, vigencia, status, requested_via
      )
      VALUES (
        ${residentUserId}::uuid, ${organizationId}::uuid, ${apoderadoTipo}, ${apoderadoEmail}, ${apoderadoNombre},
        ${apoderadoCedula}, ${apoderadoTelefono}, ${vigencia}, 'PENDING', 'CHATBOT'
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada. Está pendiente por aprobar por el administrador de tu PH. Te confirmamos en minutos.",
    });
  } catch (e) {
    console.error("[power-requests POST]", e);
    return NextResponse.json({ error: "Error al crear la solicitud de poder" }, { status: 500 });
  }
}
