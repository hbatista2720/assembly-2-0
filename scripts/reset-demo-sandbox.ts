/**
 * FASE 10: Reset del sandbox demo cada 24h (ejecutar por cron).
 * Uso: npx ts-node --transpile-only scripts/reset-demo-sandbox.ts
 * Requiere: DATABASE_URL en .env
 */

import postgres from "postgres";

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

async function main() {
  const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/assembly";
  const sql = postgres(url, { max: 1 });

  try {
    await sql`DELETE FROM assemblies WHERE organization_id = ${DEMO_ORG_ID}::uuid`;
    await sql`
      INSERT INTO assemblies (organization_id, title, scheduled_at)
      VALUES (${DEMO_ORG_ID}::uuid, 'Asamblea Ordinaria Demo 2026', NOW() + INTERVAL '7 days')
    `;
    console.log("Demo sandbox reset OK.");
  } catch (e) {
    console.error("Reset demo error:", e);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
