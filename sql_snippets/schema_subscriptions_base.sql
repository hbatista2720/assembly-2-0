-- ============================================
-- TABLA SUBSCRIPTIONS (Base para check_plan_limits, is_unlimited_plan)
-- Ejecutar antes de 011_demo_sandbox y 106_usuarios_demo_por_plan
-- Referencia: Arquitecto/LIMITES_UNIDADES_POR_PLAN.md, src/lib/db/functions/
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan y estado (check_plan_limits, is_unlimited_plan)
  plan_tier TEXT NOT NULL CHECK (plan_tier IN (
    'DEMO', 'EVENTO_UNICO', 'DUO_PACK', 'STANDARD',
    'MULTI_PH_LITE', 'MULTI_PH_PRO', 'ENTERPRISE'
  )),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
    'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'PENDING_MANUAL'
  )),

  -- Límites (check_plan_limits usa estos)
  max_units_included INT DEFAULT 250,
  units_addon_purchased INT DEFAULT 0,
  max_units_total_all_orgs INT,           -- DEMO:50, STANDARD:250, MULTI_PH_LITE:1500, MULTI_PH_PRO:5000, ENTERPRISE:NULL
  max_assemblies_per_month INT DEFAULT 2,
  max_organizations INT DEFAULT 1,

  -- Facturación
  price_amount NUMERIC(10,2) DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subs_plan ON subscriptions(plan_tier);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);

-- Columna en organizations (por si no existe)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS parent_subscription_id UUID NULL;
