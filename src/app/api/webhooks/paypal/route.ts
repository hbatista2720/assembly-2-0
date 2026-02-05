/**
 * FASE 09 (alcance Arquitecto): Webhook PayPal.
 * Configurar en developer.paypal.com → Webhooks. Eventos: BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED, etc.
 * Ref: Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (Tarea 7.4)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Placeholder: validar firma con PAYPAL_WEBHOOK_ID y actualizar subscriptions/invoices (paypal_subscription_id, paypal_payer_id)
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ received: true, provider: "paypal", note: "Implementar validación y actualización BD" });
}
