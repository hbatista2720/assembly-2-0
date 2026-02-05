/**
 * FASE 09 (alcance Arquitecto): Webhook Tilopay.
 * Configurar en tilopay.com. Actualizar subscriptions/invoices (tilopay_subscription_id, tilopay_customer_id).
 * Ref: Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (Tarea 7.4)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Placeholder: validar y actualizar BD según documentación Tilopay
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ received: true, provider: "tilopay", note: "Implementar validación y actualización BD" });
}
