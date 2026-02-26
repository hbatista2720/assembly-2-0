/**
 * Tipos y persistencia del carrito (plan + paquetes de unidades).
 * Persistido en localStorage para que el checkout pueda leerlo.
 */

import type { PlanTier } from "./types/pricing";

export const CART_STORAGE_KEY = "assembly_cart";

export interface CartPlanItem {
  type: "plan";
  planId: PlanTier;
  displayName: string;
  price: number;
  billing: "one-time" | "monthly";
}

export interface CartUnitsAddonItem {
  type: "units_addon";
  id: string;
  units: number;
  price: number;
  label: string;
  /** Para saber qué tipo de plan aplica (PH, LITE, PRO) */
  planType?: "PH" | "MULTI_LITE" | "MULTI_PRO";
}

export interface CartCoupon {
  code: string;
  discountPercent: number;
}

export interface CartState {
  plan: CartPlanItem | null;
  unitAddons: CartUnitsAddonItem[];
  coupon: CartCoupon | null;
}

export const defaultCart: CartState = {
  plan: null,
  unitAddons: [],
  coupon: null,
};

export function loadCart(): CartState {
  if (typeof window === "undefined") return defaultCart;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return defaultCart;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      plan: parsed.plan ?? null,
      unitAddons: Array.isArray(parsed.unitAddons) ? parsed.unitAddons : [],
      coupon: parsed.coupon ?? null,
    };
  } catch {
    return defaultCart;
  }
}

export function saveCart(state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function cartSubtotal(state: CartState): number {
  let sum = 0;
  if (state.plan) sum += state.plan.price;
  sum += state.unitAddons.reduce((a, i) => a + i.price, 0);
  return sum;
}

export function cartDiscount(state: CartState): number {
  if (!state.coupon) return 0;
  const sub = cartSubtotal(state);
  return Math.round(sub * (state.coupon.discountPercent / 100) * 100) / 100;
}

export function cartTotal(state: CartState): number {
  return Math.max(0, cartSubtotal(state) - cartDiscount(state));
}

export function cartItemCount(state: CartState): number {
  let n = state.plan ? 1 : 0;
  n += state.unitAddons.length;
  return n;
}
