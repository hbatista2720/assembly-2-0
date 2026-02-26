/**
 * PATCH: Aprobar o rechazar orden de pago (Henry Admin).
 * Body: { action: "APPROVE" | "REJECT" }
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = (body?.action ?? "").toString().toUpperCase();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { error: "action debe ser APPROVE o REJECT" },
        { status: 400 }
      );
    }

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const [updated] = await sql`
      UPDATE manual_payment_requests
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}::uuid AND status = 'PENDING'
      RETURNING id, status
    `;

    if (!updated) {
      return NextResponse.json(
        { error: "Orden no encontrada o ya procesada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status,
      message: action === "APPROVE" ? "Orden aprobada" : "Orden rechazada",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error al procesar orden", details: e?.message },
      { status: 500 }
    );
  }
}
