/**
 * Ejecuta las migraciones SQL necesarias para Assembly 2.0.
 * Uso: node scripts/run-migrations.cjs
 */

const { readFileSync } = require("fs");
const { join } = require("path");
const postgres = require("postgres");

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/assembly";

const MIGRATIONS_ORDER = [
  "sql_snippets/auth_otp_local.sql",
  "sql_snippets/schema_subscriptions_base.sql",
  "src/lib/db/migrations/010_payment_methods.sql",
  "src/lib/db/migrations/013_paypal_tilopay_panama.sql",
  "src/lib/db/migrations/018_payment_proof.sql",
];

async function main() {
  const sql = postgres(DATABASE_URL, { max: 1 });
  console.log("Conectando a la base de datos…");

  for (const relPath of MIGRATIONS_ORDER) {
    const fullPath = join(process.cwd(), relPath);
    try {
      const content = readFileSync(fullPath, "utf-8");
      console.log(`Ejecutando ${relPath}…`);
      await sql.unsafe(content);
      console.log(`  ✓ ${relPath}`);
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.log(`  (ya existe) ${relPath}`);
      } else {
        console.error(`  ✗ Error en ${relPath}:`, msg);
        process.exit(1);
      }
    }
  }

  await sql.end();
  console.log("\nMigraciones completadas.");
}

main().catch((e) => {
  console.error("Error:", e?.message);
  process.exit(1);
});
