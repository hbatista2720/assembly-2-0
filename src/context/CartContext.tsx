"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PlanTier } from "../lib/types/pricing";
import {
  CART_STORAGE_KEY,
  cartItemCount,
  cartSubtotal,
  cartDiscount,
  cartTotal,
  defaultCart,
  loadCart,
  saveCart,
  type CartState,
  type CartPlanItem,
  type CartUnitsAddonItem,
  type CartCoupon,
} from "../lib/cartStore";

type CartContextValue = {
  cart: CartState;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  addPlan: (planId: PlanTier, displayName: string, price: number, billing: "one-time" | "monthly") => void;
  addUnitsAddon: (units: number, price: number, label: string, planType?: "PH" | "MULTI_LITE" | "MULTI_PRO") => void;
  removePlan: () => void;
  removeUnitAddon: (id: string) => void;
  setCoupon: (coupon: CartCoupon | null) => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCart(cart);
  }, [cart, hydrated]);

  const addPlan = useCallback((planId: PlanTier, displayName: string, price: number, billing: "one-time" | "monthly") => {
    const item: CartPlanItem = { type: "plan", planId, displayName, price, billing };
    setCart((prev) => ({ ...prev, plan: item }));
  }, []);

  const addUnitsAddon = useCallback((units: number, price: number, label: string, planType?: "PH" | "MULTI_LITE" | "MULTI_PRO") => {
    const id = `addon-${planType ?? "PH"}-${units}-${Date.now()}`;
    const item: CartUnitsAddonItem = { type: "units_addon", id, units, price, label, planType };
    setCart((prev) => ({ ...prev, unitAddons: [...prev.unitAddons, item] }));
  }, []);

  const removePlan = useCallback(() => {
    setCart((prev) => ({ ...prev, plan: null }));
  }, []);

  const removeUnitAddon = useCallback((id: string) => {
    setCart((prev) => ({ ...prev, unitAddons: prev.unitAddons.filter((i) => i.id !== id) }));
  }, []);

  const setCoupon = useCallback((coupon: CartCoupon | null) => {
    setCart((prev) => ({ ...prev, coupon }));
  }, []);

  const applyCouponCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCart((prev) => ({ ...prev, coupon: null }));
      return { success: false, message: "Ingresa un código" };
    }
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (data.valid && typeof data.discount_percent === "number") {
        setCart((prev) => ({ ...prev, coupon: { code: trimmed, discountPercent: data.discount_percent } }));
        return { success: true, message: `Cupón aplicado: ${data.discount_percent}% de descuento` };
      }
      setCart((prev) => ({ ...prev, coupon: null }));
      return { success: false, message: data.message || "Cupón no válido o expirado" };
    } catch {
      setCart((prev) => ({ ...prev, coupon: null }));
      return { success: false, message: "Error al validar el cupón" };
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart(defaultCart);
  }, []);

  const value: CartContextValue = {
    cart,
    itemCount: cartItemCount(cart),
    subtotal: cartSubtotal(cart),
    discount: cartDiscount(cart),
    total: cartTotal(cart),
    addPlan,
    addUnitsAddon,
    removePlan,
    removeUnitAddon,
    setCoupon,
    applyCouponCode,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCartOptional(): CartContextValue | null {
  return useContext(CartContext);
}
