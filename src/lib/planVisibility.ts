/**
 * Visibilidad de planes en landing y dashboard PH.
 * Henry controla qué planes se muestran desde Planes y precios.
 * Por defecto todos están publicados (visibles).
 */

import type { Plan, PlanTier } from "./types/pricing";
import { PLAN_IDS } from "./types/pricing";

const STORAGE_KEY = "assembly_platform_admin_plan_visibility";

export function getPlanVisibility(): Record<PlanTier, boolean> {
  if (typeof window === "undefined") {
    return PLAN_IDS.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<PlanTier, boolean>);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PLAN_IDS.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<PlanTier, boolean>);
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    const out = PLAN_IDS.reduce((acc, id) => ({ ...acc, [id]: parsed[id] !== false }), {} as Record<PlanTier, boolean>);
    return out;
  } catch {
    return PLAN_IDS.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<PlanTier, boolean>);
  }
}

export function setPlanVisibility(planId: PlanTier, visible: boolean) {
  if (typeof window === "undefined") return;
  const current = getPlanVisibility();
  const next = { ...current, [planId]: visible };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getVisiblePlans(plans: Plan[]): Plan[] {
  const visibility = getPlanVisibility();
  return plans.filter((p) => visibility[p.id] !== false);
}
