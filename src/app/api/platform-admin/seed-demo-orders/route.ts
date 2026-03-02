/**
 * Crea 2 órdenes demo PENDING para probar la Bandeja de aprobaciones.
 * POST /api/platform-admin/seed-demo-orders
 * Simula: cliente demo usa la app → compra suscripción/crédito → orden pendiente.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_EMAIL = "demo@assembly2.com";
const PROOF_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const DEMO_ORDERS = [
  { plan: "Evento Único", plan_tier: "EVENTO_UNICO", amount: 225, method: "ACH" },
  { plan: "Standard", plan_tier: "STANDARD", amount: 189, method: "YAPPY" },
] as const;

export async function POST() {
  try {
    const inserted: string[] = [];

    for (const ord of DEMO_ORDERS) {
      try {
        let row: { id: string } | undefined;
        try {
          [row] = await sql`
            INSERT INTO manual_payment_requests (
              organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status,
              proof_base64, proof_filename
            )
            VALUES (
              ${DEMO_ORG_ID}::uuid,
              NULL,
              ${ord.plan_tier},
              ${ord.amount},
              ${ord.method},
              ${DEMO_EMAIL},
              'PENDING',
              ${PROOF_PLACEHOLDER},
              'comprobante-demo.png'
            )
            RETURNING id
          `;
        } catch (fkErr: unknown) {
          const msg = String((fkErr as Error)?.message || "").toLowerCase();
          if (msg.includes("violates foreign key") || msg.includes("organization")) {
            [row] = await sql`
              INSERT INTO manual_payment_requests (
                organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status,
                proof_base64, proof_filename
              )
              VALUES (
                NULL,
                NULL,
                ${ord.plan_tier},
                ${ord.amount},
                ${ord.method},
                ${DEMO_EMAIL},
                'PENDING',
                ${PROOF_PLACEHOLDER},
                'comprobante-demo.png'
              )
              RETURNING id
            `;
          } else throw fkErr;
        }
        if (row?.id) inserted.push(row.id);
      } catch (colErr: unknown) {
        const msg = String((colErr as Error)?.message || "").toLowerCase();
        if (msg.includes("proof") || (msg.includes("column") && msg.includes("does not exist"))) {
          const [row] = await sql`
            INSERT INTO manual_payment_requests (
              organization_id, subscription_id, plan_tier, amount, payment_method, contact_email, status
            )
            VALUES (
              NULL,
              NULL,
              ${ord.plan_tier},
              ${ord.amount},
              ${ord.method},
              ${DEMO_EMAIL},
              'PENDING'
            )
            RETURNING id
          `;
          if (row?.id) inserted.push(row.id);
        } else throw colErr;
      }
    }

    return NextResponse.json({
      success: true,
      message: "2 órdenes demo creadas. Refresca la Bandeja de aprobaciones.",
      count: inserted.length,
      ids: inserted,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Error al crear órdenes demo", details: (e as Error)?.message },
      { status: 500 },
    );
  }
}
