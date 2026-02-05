/**
 * FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH.
 * Stripe fuera de alcance (retiros en Panamá).
 * Ref: Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md
 */

export const PLAN_AMOUNTS_CENTS: Record<string, number> = {
  EVENTO_UNICO: 22500,
  DUO_PACK: 38900,
  STANDARD: 18900,
  MULTI_PH_LITE: 39900,
  MULTI_PH_PRO: 69900,
  ENTERPRISE: 249900,
};

export function getBillingMode(planTier: string): "payment" | "subscription" {
  if (planTier === "EVENTO_UNICO" || planTier === "DUO_PACK") return "payment";
  return "subscription";
}

export const PAYMENT_METHODS_SCOPE = ["PAYPAL", "TILOPAY", "MANUAL_ACH", "MANUAL_YAPPY", "MANUAL_TRANSFER"] as const;
