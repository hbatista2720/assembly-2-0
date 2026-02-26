/**
 * Verifica si las tablas necesarias para suscripciones/facturación existen.
 * Uso: node scripts/check-db-tables.cjs
 */

const postgres = require("postgres");

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/assembly";

const TABLES = [
  "organizations",
  "users",
  "subscriptions",
  "invoices",
  "manual_payment_requests",
  "organization_credits",
  "discount_coupons",
];

async function main() {
  const sql = postgres(DATABASE_URL, { max: 1 });

  console.log("Verificando tablas en la base de datos…\n");

  for (const table of TABLES) {
    try {
      const rows = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ${table}
        ) as exists
      `;
      const exists = rows[0]?.exists ?? false;
      console.log(`  ${exists ? "✓" : "✗"} ${table}`);
    } catch (e) {
      console.log(`  ? ${table} (error: ${e?.message})`);
    }
  }

  await sql.end();
  console.log("\nSi hay ✗, ejecuta: npm run db:migrate");
}

main().catch((e) => {
  console.error("Error de conexión:", e?.message);
  process.exit(1);
});
