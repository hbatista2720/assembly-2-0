import { sql } from "@/lib/db";

export type ActionType = "create_organization" | "create_assembly";

/**
 * Valida que la suscripción no exceda límites antes de crear recurso.
 * Si plan es ENTERPRISE o no hay tablas, permite. Si excede, lanza error.
 */
export async function validateSubscriptionLimits(
  subscriptionId: string,
  actionType: ActionType,
): Promise<void> {
  try {
    const isUnlimited = await sql<{ is_unlimited_plan: boolean }[]>`
      SELECT is_unlimited_plan(${subscriptionId}::uuid) AS is_unlimited_plan
    `;
    if (isUnlimited?.[0]?.is_unlimited_plan === true) return;

    const exceeded = await sql<{ check_plan_limits: boolean }[]>`
      SELECT check_plan_limits(${subscriptionId}::uuid) AS check_plan_limits
    `;
    if (exceeded?.[0]?.check_plan_limits === true) {
      const msg =
        actionType === "create_assembly"
          ? "Has alcanzado el límite de asambleas de tu plan este mes. Considera actualizar tu plan o espera al próximo mes."
          : "Has alcanzado el límite de tu plan.";
      throw new Error(msg);
    }
  } catch (err: any) {
    if (err?.message?.startsWith("Has alcanzado")) throw err;
    if (err?.code === "42P01" || err?.message?.includes("does not exist")) return;
    throw err;
  }
}
