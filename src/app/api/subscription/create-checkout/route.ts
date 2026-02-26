/**
 * FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH. Stripe fuera de alcance.
 * POST body: { plan_tier, payment_method, subscription_id?, organization_id?, customer_email?, units_addon_total?, coupon_code? }
 * payment_method: PAYPAL | TILOPAY | MANUAL_ACH | MANUAL_YAPPY | MANUAL_TRANSFER
 * Ref: Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md, Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { PLAN_AMOUNTS_CENTS } from "../../../../lib/payments";

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
    const unitsAddonTotal = typeof body?.units_addon_total === "number" ? Math.max(0, body.units_addon_total) : 0;
    const couponCode = (body?.coupon_code ?? "").toString().trim().toUpperCase() || null;
    const proofBase64 = (body?.proof_base64 ?? "").toString().trim() || null;
    const proofFileName = (body?.proof_file_name ?? "comprobante").toString().trim() || "comprobante";

    if (!VALID_PLANS.includes(planTier)) {
      return NextResponse.json(
        { error: "plan_tier inválido. Use uno de: " + VALID_PLANS.join(", ") },
        { status: 400 },
      );
    }

    let subId = subscriptionId;
    let orgId = organizationId;

    if (!subId && orgId) {
      try {
        const rows = await sql<{ parent_subscription_id: string | null }[]>`
          SELECT parent_subscription_id FROM organizations WHERE id = ${orgId}::uuid LIMIT 1
        `;
        subId = rows?.[0]?.parent_subscription_id ?? null;
      } catch {
        subId = null;
      }
    }

    const isManual = MANUAL_METHODS.includes(paymentMethod);
    if (!isManual && !subId) {
      return NextResponse.json(
        { error: "Se requiere subscription_id o organization_id con suscripción asociada." },
        { status: 400 },
      );
    }

    const planCents = PLAN_AMOUNTS_CENTS[planTier] ?? 0;
    let amountDollars = planCents / 100 + unitsAddonTotal;

    if (couponCode) {
      const couponRows = await sql<{ discount_percent: number; max_uses: number | null; used_count: number }[]>`
        SELECT discount_percent, max_uses, used_count FROM discount_coupons
        WHERE UPPER(TRIM(code)) = ${couponCode}
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
        LIMIT 1
      `;
      const coupon = couponRows?.[0];
      if (coupon && (coupon.max_uses == null || coupon.used_count < coupon.max_uses)) {
        const pct = Number(coupon.discount_percent);
        amountDollars = Math.max(0, amountDollars * (1 - pct / 100));
      }
    }

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
      // Fase 1: comprobante obligatorio para ACH/Yappy/Transferencia
      if (!proofBase64 || proofBase64.length < 100) {
        return NextResponse.json(
          { error: "Debes adjuntar el comprobante de pago (PDF, JPG o PNG) para enviar la orden." },
          { status: 400 },
        );
      }
      const proofData = proofBase64.startsWith("data:")
        ? proofBase64
        : `data:application/octet-stream;base64,${proofBase64}`;

      let inserted: { id: string; status: string; amount: number; payment_method: string } | undefined;
      try {
        [inserted] = await sql`
          INSERT INTO manual_payment_requests (
            organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status,
            proof_base64, proof_filename
          )
          VALUES (
            ${orgId || null},
            ${subId ?? null},
            ${planTier},
            ${amountDollars},
            ${manualMethod},
            ${customerEmail},
            'PENDING',
            ${proofData},
            ${proofFileName}
          )
          RETURNING id, status, amount, payment_method
        `;
      } catch (colErr: any) {
        const msg = String(colErr?.message || "").toLowerCase();
        if (msg.includes("proof") || (msg.includes("column") && msg.includes("does not exist"))) {
          [inserted] = await sql`
            INSERT INTO manual_payment_requests (
              organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status
            )
            VALUES (
              ${orgId || null},
              ${subId ?? null},
              ${planTier},
              ${amountDollars},
              ${manualMethod},
              ${customerEmail},
              'PENDING'
            )
            RETURNING id, status, amount, payment_method
          `;
        } else throw colErr;
      }
      return NextResponse.json({
        pending: true,
        message: "Orden de compra enviada. Revisaremos tu comprobante y te contactaremos pronto.",
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
