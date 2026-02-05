import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { validateSubscriptionLimits } from "@/lib/middleware/validateSubscriptionLimits";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const subscriptionId = payload?.subscription_id ?? null;
    const name = payload?.name ?? "Nueva organización";
    const totalUnits = payload?.total_units ?? 0;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscription_id requerido." },
        { status: 400 },
      );
    }

    try {
      await validateSubscriptionLimits(subscriptionId, "create_organization");
    } catch (limitErr: any) {
      if (limitErr?.message?.startsWith("Has alcanzado")) {
        return NextResponse.json(
          { error: limitErr.message },
          { status: 403 },
        );
      }
    }

    const inserted = await sql`
      INSERT INTO organizations (parent_subscription_id, name, total_units)
      VALUES (${subscriptionId}::uuid, ${name}, ${totalUnits})
      RETURNING *
    `;

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: "No se pudo crear la organización.", details: error?.message },
      { status: 500 },
    );
  }
}
