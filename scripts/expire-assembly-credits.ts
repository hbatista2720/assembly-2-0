import { sql } from "../src/lib/db";

async function expireOldCredits() {
  console.log("[CRON] Expiring old assembly credits...");

  try {
    const result = await sql<{ expired_count: number; total_credits_lost: number }[]>`
      SELECT * FROM expire_old_credits()
    `;

    const summary = result?.[0];
    console.log(`[SUCCESS] Expired ${summary?.expired_count ?? 0} credit records`);
    console.log(`[INFO] Total credits lost: ${summary?.total_credits_lost ?? 0}`);
  } catch (error) {
    console.error("[ERROR] Failed to expire credits:", error);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

expireOldCredits()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
