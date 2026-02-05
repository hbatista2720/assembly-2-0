/**
 * FASE 09 (alcance Arquitecto): Stripe fuera de alcance.
 * No retiros en Panamá. Usar PayPal / Tilopay.
 * Ref: Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe fuera de alcance. Pasarelas con retiro en Panamá: PayPal, Tilopay, Yappy, ACH." },
    { status: 410 },
  );
}
