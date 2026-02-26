/**
 * Órdenes pendientes de aprobación (Henry Admin).
 * Consulta manual_payment_requests WHERE status = 'PENDING'.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

type PendingRowBase = {
  id: string;
  plan_tier: string;
  amount: number;
  payment_method: string;
  contact_email: string;
  created_at: string;
};

export async function GET() {
  try {
    let rows: (PendingRowBase & { proof_base64?: string | null; proof_filename?: string | null })[];
    try {
      rows = await sql`
        SELECT id, organization_id, plan_tier, amount, payment_method, contact_email,
               proof_base64, proof_filename, created_at
        FROM manual_payment_requests
        WHERE status = 'PENDING'
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } catch (colErr: any) {
      const msg = String(colErr?.message || "").toLowerCase();
      if (msg.includes("proof") || msg.includes("column") && msg.includes("does not exist")) {
        rows = await sql<PendingRowBase[]>`
          SELECT id, organization_id, plan_tier, amount, payment_method, contact_email, created_at
          FROM manual_payment_requests
          WHERE status = 'PENDING'
          ORDER BY created_at DESC
          LIMIT 100
        `;
      } else throw colErr;
    }

    const orders = (rows || []).map((r: any) => ({
      id: r.id,
      customer_email: r.contact_email,
      plan_name: r.plan_tier,
      amount: Number(r.amount),
      payment_method: r.payment_method,
      status: "PENDING" as const,
      created_at: r.created_at,
      has_proof: !!(r.proof_base64 && r.proof_base64.length > 50),
      proof_base64: r.proof_base64 ?? null,
      proof_filename: r.proof_filename ?? null,
    }));

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error al cargar órdenes", details: e?.message, orders: [] },
      { status: 500 },
    );
  }
}
