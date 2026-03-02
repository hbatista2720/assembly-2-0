/**
 * POST /api/platform-admin/campaigns/seed
 * Crea la tabla platform_campaigns si no existe e inserta 3 campañas de ejemplo.
 */

import { NextResponse } from "next/server";
import { sql } from "../../../../../lib/db";

const DEMO_CAMPAIGNS = [
  { name: "Onboarding Demo", is_active: true },
  { name: "Seguimiento Post-Demo", is_active: false },
  { name: "Reactivación de Leads", is_active: true },
];

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS platform_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_executed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_platform_campaigns_active
      ON platform_campaigns(is_active) WHERE is_active = true
    `;

    try {
      await sql`
        ALTER TABLE platform_campaigns
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS target_stage TEXT,
        ADD COLUMN IF NOT EXISTS frequency TEXT,
        ADD COLUMN IF NOT EXISTS email_subject TEXT,
        ADD COLUMN IF NOT EXISTS email_body TEXT
      `;
    } catch (_) {}

    let inserted = 0;
    for (const c of DEMO_CAMPAIGNS) {
      try {
        await sql`
          INSERT INTO platform_campaigns (name, is_active)
          VALUES (${c.name}, ${c.is_active})
          ON CONFLICT (name) DO NOTHING
        `;
        const [r] = await sql`SELECT 1 FROM platform_campaigns WHERE name = ${c.name}`;
        if (r) inserted++;
      } catch (_) {}
    }

    const [count] = await sql`SELECT COUNT(*)::int as n FROM platform_campaigns`;
    const total = (count as { n: number })?.n ?? 0;

    return NextResponse.json({
      success: true,
      message: total > 0 ? `${total} campaña(s) disponibles. Recarga la página.` : "Campañas de ejemplo creadas.",
      count: total,
    });
  } catch (e: unknown) {
    console.error("[campaigns/seed]", e);
    return NextResponse.json(
      { error: "Error al crear campañas", details: (e as Error)?.message },
      { status: 500 }
    );
  }
}
