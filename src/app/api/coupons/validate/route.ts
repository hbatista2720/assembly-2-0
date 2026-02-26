/**
 * Valida un cupón de descuento. Usado por el carrito.
 * Tabla discount_coupons: el administrador (Henry) puede crear cupones para clientes.
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body?.code ?? "").toString().trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ valid: false, message: "Código vacío" }, { status: 400 });
    }

    const rows = await sql<{
      discount_percent: number;
      valid_from: string | null;
      valid_until: string | null;
      max_uses: number | null;
      used_count: number;
    }[]>`
      SELECT discount_percent, valid_from, valid_until, max_uses, used_count
      FROM discount_coupons
      WHERE UPPER(TRIM(code)) = ${code}
      LIMIT 1
    `;

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({
        valid: false,
        message: "Cupón no encontrado o no válido",
      });
    }

    const now = new Date();
    if (row.valid_from && new Date(row.valid_from) > now) {
      return NextResponse.json({
        valid: false,
        message: "Este cupón aún no está vigente",
      });
    }
    if (row.valid_until && new Date(row.valid_until) < now) {
      return NextResponse.json({
        valid: false,
        message: "Este cupón ha expirado",
      });
    }
    if (row.max_uses != null && row.used_count >= row.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "Este cupón ya no tiene usos disponibles",
      });
    }

    const discountPercent = Number(row.discount_percent);
    if (discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json({ valid: false, message: "Cupón no válido" });
    }

    return NextResponse.json({
      valid: true,
      discount_percent: discountPercent,
      message: `${discountPercent}% de descuento`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { valid: false, message: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
