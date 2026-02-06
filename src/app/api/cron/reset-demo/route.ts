/**
 * FASE 10: Endpoint para cron que resetea el sandbox demo (cada 24h).
 * Protegido por CRON_RESET_SECRET. Ejemplo cron: 0 4 * * * curl -X POST -H "X-Cron-Secret: $CRON_RESET_SECRET" https://tu-dominio/api/cron/reset-demo
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_RESET_SECRET;
  const headerSecret = request.headers.get("x-cron-secret");

  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sql`
      DELETE FROM assemblies
      WHERE organization_id = ${DEMO_ORG_ID}::uuid
      AND created_at < NOW() - INTERVAL '1 hour'
    `;

    const [count] = await sql<{ c: number }[]>`
      SELECT COUNT(*)::int AS c FROM assemblies WHERE organization_id = ${DEMO_ORG_ID}::uuid
    `;

    if ((count?.c ?? 0) === 0) {
      await sql`
        INSERT INTO assemblies (organization_id, title, scheduled_at)
        VALUES (${DEMO_ORG_ID}::uuid, 'Asamblea Ordinaria Demo 2026', NOW() + INTERVAL '7 days')
      `;
    }

    return NextResponse.json({ ok: true, message: "Demo sandbox reset" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
