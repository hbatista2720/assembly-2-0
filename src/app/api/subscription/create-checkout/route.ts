/**
 * FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH. Stripe fuera de alcance.
 * POST body: { plan_tier, payment_method, subscription_id?, organization_id?, customer_email? }
 * payment_method: PAYPAL | TILOPAY | MANUAL_ACH | MANUAL_YAPPY | MANUAL_TRANSFER
 * Ref: Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md, Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PLAN_AMOUNTS_CENTS } from "@/lib/payments";

const VALID_PLANS = [
  "EVENTO_UNICO",
  "DUO_PACK",
  "STANDARD",
  "MULTI_PH_LITE",
  "MULTI_PH_PRO",
  "ENTERPRISE",
];
const AUTOMATIC_METHODS = ["PAYPAL", "TILOPAY"];
const MANUAL_METHODS = ["MANUAL_ACH", "MANUAL_YAPPY", "MANUAL_TRANSFER"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const planTier = body?.plan_tier ?? "";
    const paymentMethod = body?.payment_method ?? "MANUAL_ACH";
    const subscriptionId = body?.subscription_id ?? null;
    const organizationId = body?.organization_id ?? null;
    const customerEmail = body?.customer_email ?? "cliente@assembly2.com";

    if (!VALID_PLANS.includes(planTier)) {
      return NextResponse.json(
        { error: "plan_tier inválido. Use uno de: " + VALID_PLANS.join(", ") },
        { status: 400 },
      );
    }

    let subId = subscriptionId;
    let orgId = organizationId;

    if (!subId && orgId) {
      const rows = await sql<{ parent_subscription_id: string }[]>`
        SELECT parent_subscription_id FROM organizations WHERE id = ${orgId}::uuid LIMIT 1
      `;
      subId = rows?.[0]?.parent_subscription_id ?? null;
    }

    if (!subId) {
      return NextResponse.json(
        { error: "Se requiere subscription_id o organization_id con suscripción asociada." },
        { status: 400 },
      );
    }

    const amountCents = PLAN_AMOUNTS_CENTS[planTier] ?? 0;
    const amountDollars = amountCents / 100;

    if (AUTOMATIC_METHODS.includes(paymentMethod)) {
      // PayPal / Tilopay: checkout en configuración (Tareas 7.2–7.4 del Coder doc)
      const provider = paymentMethod === "PAYPAL" ? "PayPal" : "Tilopay";
      return NextResponse.json({
        pending: true,
        checkout_available: false,
        message: `Checkout con ${provider} estará disponible cuando se configure (developer.paypal.com / tilopay.com). Por ahora usa ACH, Yappy o Transferencia.`,
        fallback_manual: true,
      });
    }

    if (MANUAL_METHODS.includes(paymentMethod)) {
      const manualMethod = paymentMethod.replace("MANUAL_", "") as "ACH" | "YAPPY" | "TRANSFER";
      const [inserted] = await sql`
        INSERT INTO manual_payment_requests (
          organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status
        )
        VALUES (
          ${orgId || null},
          ${subId}::uuid,
          ${planTier},
          ${amountDollars},
          ${manualMethod},
          ${customerEmail},
          'PENDING'
        )
        RETURNING id, status, amount, payment_method
      `;
      return NextResponse.json({
        pending: true,
        message: "Solicitud de pago manual registrada. Te contactaremos para completar el pago.",
        request_id: inserted?.id,
        amount: amountDollars,
        payment_method: manualMethod,
      });
    }

    return NextResponse.json(
      {
        error:
          "Método no válido. Use PAYPAL, TILOPAY (automáticos) o MANUAL_ACH, MANUAL_YAPPY, MANUAL_TRANSFER.",
      },
      { status: 400 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error al crear checkout.", details: e?.message },
      { status: 500 },
    );
  }
}
