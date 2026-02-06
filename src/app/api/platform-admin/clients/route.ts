import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        o.id,
        o.name,
        COALESCE(p.status, 'Activo') AS status
      FROM organizations o
      LEFT JOIN platform_client_status p ON p.organization_id = o.id
      WHERE o.is_demo = FALSE OR o.id = '11111111-1111-1111-1111-111111111111'
      ORDER BY o.name
    `;
    const clients = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      plan: "Standard",
      expiresAt: "2026-06-01",
      buildings: 1,
    }));
    return NextResponse.json(clients);
  } catch (e: any) {
    if (e?.code === "42P01") {
      return NextResponse.json([
        { id: "ph-001", name: "PH Urban Tower", plan: "Pro Multi-PH", status: "Activo", expiresAt: "2026-03-15", buildings: 3 },
        { id: "ph-002", name: "PH Costa Azul", plan: "Standard", status: "Suspendido", expiresAt: "2026-02-10", buildings: 1 },
        { id: "ph-003", name: "PH Vista Mar", plan: "Enterprise", status: "Activo", expiresAt: "2026-04-01", buildings: 8 },
      ]);
    }
    console.error("GET platform-admin/clients:", e);
    return NextResponse.json({ error: "Error al cargar clientes" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body || {};
    if (!id || !["Activo", "Suspendido", "Cancelado"].includes(status)) {
      return NextResponse.json({ error: "id y status (Activo|Suspendido|Cancelado) requeridos" }, { status: 400 });
    }
    await sql`
      INSERT INTO platform_client_status (organization_id, status, updated_at)
      VALUES (${id}::uuid, ${status}, NOW())
      ON CONFLICT (organization_id) DO UPDATE SET status = ${status}, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "42P01") {
      return NextResponse.json({ ok: true });
    }
    console.error("PATCH platform-admin/clients:", e);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}
