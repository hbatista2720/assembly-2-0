/**
 * @deprecated FASE 09 alcance Arquitecto: Stripe fuera de alcance (no retiros en Panamá).
 * Usar PayPal, Tilopay, Yappy, ACH. Ver src/lib/payments.ts y Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md
 */

import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
export const stripe =
  typeof secret === "string" && secret.length > 0
    ? new Stripe(secret, { apiVersion: "2026-01-28.clover" })
    : null;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/** Price IDs de Stripe (crear en Dashboard). En test pueden estar vacíos. */
export const STRIPE_PRICES: Record<string, string> = {
  EVENTO_UNICO: process.env.STRIPE_PRICE_EVENTO_UNICO || "",
  DUO_PACK: process.env.STRIPE_PRICE_DUO_PACK || "",
  STANDARD: process.env.STRIPE_PRICE_STANDARD || "",
  MULTI_PH_LITE: process.env.STRIPE_PRICE_MULTI_PH_LITE || "",
  MULTI_PH_PRO: process.env.STRIPE_PRICE_MULTI_PH_PRO || "",
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || "",
};

/** Monto en centavos por plan (fallback si no hay Price IDs). */
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

export function isStripeConfigured(): boolean {
  return !!stripe && !!process.env.STRIPE_SECRET_KEY;
}
