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
        SELECT m.id, m.organization_id, m.plan_tier, m.amount, m.payment_method,
               m.contact_email, m.contact_phone, m.notes, m.proof_base64, m.proof_filename, m.created_at,
               o.name AS organization_name
        FROM manual_payment_requests m
        LEFT JOIN organizations o ON o.id = m.organization_id
        WHERE m.status = 'PENDING'
        ORDER BY m.created_at DESC
        LIMIT 100
      `;
    } catch (colErr: any) {
      const msg = String(colErr?.message || "").toLowerCase();
      if (msg.includes("proof") || msg.includes("column") && msg.includes("does not exist")) {
        rows = await sql<any[]>`
          SELECT m.id, m.organization_id, m.plan_tier, m.amount, m.payment_method,
                 m.contact_email, m.contact_phone, m.notes, m.created_at, o.name AS organization_name
          FROM manual_payment_requests m
          LEFT JOIN organizations o ON o.id = m.organization_id
          WHERE m.status = 'PENDING'
          ORDER BY m.created_at DESC
          LIMIT 100
        `;
      } else throw colErr;
    }

    const PLAN_DISPLAY: Record<string, string> = {
      EVENTO_UNICO: "Evento Único",
      DUO_PACK: "Dúo Pack",
      STANDARD: "Standard",
      MULTI_PH_LITE: "Multi-PH Lite",
      MULTI_PH_PRO: "Multi-PH Pro",
      ENTERPRISE: "Enterprise",
      DEMO: "Demo",
    };
    const orders = (rows || []).map((r: any) => ({
      id: r.id,
      customer_email: r.contact_email,
      contact_phone: r.contact_phone ?? null,
      organization_name: r.organization_name ?? null,
      notes: r.notes ?? null,
      plan_name: PLAN_DISPLAY[r.plan_tier] || r.plan_tier,
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
