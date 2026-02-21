/**
 * Aprobar o rechazar una solicitud de poder (Admin PH).
 * PATCH { status: 'APPROVED' | 'REJECTED', organization_id: string }
 */
import { NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";
import { notifyPowerStatus } from "../../../../../lib/notifyPowerEmail";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "id (UUID) inválido" }, { status: 400 });
    }
    const body = await req.json();
    const status = body.status?.toUpperCase();
    const organizationId = body.organization_id?.trim();
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "status debe ser APPROVED o REJECTED" }, { status: 400 });
    }
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }
    const [updated] = await sql<{ id: string; resident_user_id: string }[]>`
      UPDATE power_requests
      SET status = ${status}
      WHERE id = ${id}::uuid AND organization_id = ${organizationId}::uuid AND status = 'PENDING'
      RETURNING id, resident_user_id
    `;
    if (!updated) {
      return NextResponse.json(
        { error: "Solicitud no encontrada o ya fue procesada" },
        { status: 404 }
      );
    }
    const [resident] = await sql<{ email: string }[]>`
      SELECT email FROM users WHERE id = ${updated.resident_user_id}::uuid LIMIT 1
    `;
    if (resident?.email) {
      notifyPowerStatus(resident.email, status).catch((err) =>
        console.error("[admin-ph power-requests PATCH] notifyPowerStatus:", err)
      );
    }
    return NextResponse.json({
      success: true,
      status,
      message: status === "APPROVED" ? "Solicitud de poder aprobada." : "Solicitud de poder rechazada.",
    });
  } catch (e) {
    console.error("[admin-ph/power-requests PATCH]", e);
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 });
  }
}
