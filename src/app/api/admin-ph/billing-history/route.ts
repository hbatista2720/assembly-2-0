/**
 * GET ?organization_id=xxx → resumen de cuenta e historial de facturación.
 * Devuelve: invoices (facturas pagadas/registradas) y manual_payment_requests (solicitudes de pago: recurrentes y compras).
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InvoiceRow = {
  id: string;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
};

type PaymentRequestRow = {
  id: string;
  plan_tier: string;
  amount: number;
  payment_method: string;
  contact_email: string;
  status: string;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.searchParams.get("organization_id")?.trim();
    if (!organizationId) {
      return NextResponse.json({ error: "organization_id requerido", history: [], invoices: [], payment_requests: [] }, { status: 400 });
    }
    if (!UUID_REGEX.test(organizationId)) {
      return NextResponse.json({ history: [], invoices: [], payment_requests: [] });
    }

    let invoices: InvoiceRow[] = [];
    let paymentRequests: PaymentRequestRow[] = [];
    try {
      [invoices, paymentRequests] = await Promise.all([
      sql<InvoiceRow[]>`
        SELECT id, amount, currency, status, payment_method, paid_at, created_at
        FROM invoices
        WHERE organization_id = ${organizationId}::uuid
        ORDER BY created_at DESC
        LIMIT 50
      `,
      sql<PaymentRequestRow[]>`
        SELECT id, plan_tier, amount, payment_method, contact_email, status, created_at
        FROM manual_payment_requests
        WHERE organization_id = ${organizationId}::uuid
        ORDER BY created_at DESC
        LIMIT 50
      `,
    ]);
    } catch (dbErr: unknown) {
      const msg = String((dbErr as Error)?.message || "").toLowerCase();
      if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("column")) {
        return NextResponse.json({ invoices: [], payment_requests: [], history: [] });
      }
      throw dbErr;
    }

    const history = [
      ...(invoices || []).map((i) => ({
        id: i.id,
        type: "factura" as const,
        description: `Factura ${i.status === "PAID" ? "pagada" : i.status.toLowerCase()}`,
        plan_tier: null as string | null,
        amount: Number(i.amount),
        currency: i.currency || "USD",
        payment_method: i.payment_method,
        status: i.status,
        contact_email: null as string | null,
        created_at: i.created_at,
        paid_at: i.paid_at,
      })),
      ...(paymentRequests || []).map((r) => ({
        id: r.id,
        type: "solicitud_pago" as const,
        description: `Plan ${r.plan_tier} — ${r.payment_method}`,
        plan_tier: r.plan_tier,
        amount: Number(r.amount),
        currency: "USD" as const,
        payment_method: r.payment_method,
        status: r.status,
        contact_email: r.contact_email,
        created_at: r.created_at,
        paid_at: null as string | null,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      invoices: invoices || [],
      payment_requests: paymentRequests || [],
      history: history.slice(0, 50),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Error al cargar historial de facturación", details: (e as Error)?.message, history: [], invoices: [], payment_requests: [] },
      { status: 500 }
    );
  }
}
