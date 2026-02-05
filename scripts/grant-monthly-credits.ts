import { sql } from "../src/lib/db";

const toMonthStart = (date: Date) => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

async function grantMonthlyCredits() {
  console.log("[CRON] Granting monthly assembly credits...");
  const monthStart = toMonthStart(new Date());
  const expiresAt = addMonths(monthStart, 6);

  try {
    const subscriptions = await sql<{
      id: string;
      organization_id: string;
      max_assemblies_per_month: number | null;
    }[]>`
      SELECT id, organization_id, max_assemblies_per_month
      FROM subscriptions
      WHERE status = 'ACTIVE'
    `;

    for (const sub of subscriptions) {
      const credits = sub.max_assemblies_per_month ?? 0;
      if (credits <= 0) continue;

      await sql`
        INSERT INTO assembly_credits (
          organization_id,
          subscription_id,
          earned_month,
          credits_earned,
          credits_used,
          expires_at
        )
        VALUES (
          ${sub.organization_id},
          ${sub.id},
          ${monthStart.toISOString().split("T")[0]},
          ${credits},
          0,
          ${expiresAt.toISOString()}
        )
        ON CONFLICT (organization_id, earned_month) DO NOTHING
      `;

      console.log(`✅ Granted ${credits} credits to org ${sub.organization_id}`);
    }

    console.log("[SUCCESS] Monthly credits granted");
  } catch (error) {
    console.error("[ERROR] Failed to grant credits:", error);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

grantMonthlyCredits()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
