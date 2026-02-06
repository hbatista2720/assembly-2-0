import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { validateSubscriptionLimits } from "../../../lib/middleware/validateSubscriptionLimits";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const organizationId = payload?.organization_id ?? null;
    const title = payload?.title ?? "Nueva asamblea";
    const scheduledAt = payload?.scheduled_at ?? null;

    if (!organizationId) {
      return NextResponse.json({ error: "organization_id requerido." }, { status: 400 });
    }

    try {
      const orgRows = await sql<{ parent_subscription_id: string }[]>`
        SELECT parent_subscription_id FROM organizations WHERE id = ${organizationId}::uuid LIMIT 1
      `;
      const subscriptionId = orgRows?.[0]?.parent_subscription_id;
      if (subscriptionId) {
        await validateSubscriptionLimits(subscriptionId, "create_assembly");
      }
    } catch (limitErr: any) {
      if (limitErr?.message?.startsWith("Has alcanzado")) {
        return NextResponse.json(
          { error: limitErr.message },
          { status: 403 },
        );
      }
    }

    const result = await sql.begin(async (tx) => {
      const consumeRows = await tx<{ result: any }[]>`
        SELECT consume_assembly_credits(${organizationId}, 1) AS result
      `;

      const consumeResult = consumeRows?.[0]?.result;
      if (!consumeResult?.success) {
        return {
          status: 403,
          body: {
            error: "No tienes creditos disponibles",
            details: consumeResult,
          },
        };
      }

      const inserted = await tx`
        INSERT INTO assemblies (organization_id, title, scheduled_at)
        VALUES (${organizationId}, ${title}, ${scheduledAt})
        RETURNING *
      `;

      return { status: 200, body: inserted[0] };
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "No se pudo crear la asamblea.", details: error?.message },
      { status: 500 },
    );
  }
}
