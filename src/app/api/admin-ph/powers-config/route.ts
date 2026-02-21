/**
 * Configuración de poderes por organización (Admin PH).
 * GET ?organization_id=xxx → { powers_enabled: boolean }
 * PUT { organization_id, powers_enabled } → actualiza organizations.powers_enabled
 */
import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organization_id")?.trim();
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }
    let powersEnabled = false;
    try {
      const [row] = await sql<{ powers_enabled: boolean | null }[]>`
        SELECT powers_enabled FROM organizations WHERE id = ${organizationId}::uuid LIMIT 1
      `;
      powersEnabled = row?.powers_enabled === true;
    } catch {
      // Columna powers_enabled puede no existir (ejecutar sql_snippets/107_powers_enabled_organizations.sql)
    }
    return NextResponse.json({
      powers_enabled: powersEnabled,
    });
  } catch (e) {
    console.error("[admin-ph/powers-config GET]", e);
    return NextResponse.json({ error: "Error al consultar configuración" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const organizationId = body.organization_id?.trim();
    const powersEnabled = body.powers_enabled === true;
    if (!organizationId || !UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ error: "organization_id (UUID) requerido" }, { status: 400 });
    }
    await sql`
      UPDATE organizations SET powers_enabled = ${powersEnabled} WHERE id = ${organizationId}::uuid
    `;
    return NextResponse.json({
      success: true,
      powers_enabled: powersEnabled,
      message: powersEnabled ? "Botón de poderes activado para residentes." : "Botón de poderes desactivado.",
    });
  } catch (e) {
    console.error("[admin-ph/powers-config PUT]", e);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
