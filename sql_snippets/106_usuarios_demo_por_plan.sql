-- ============================================
-- USUARIOS DEMO POR PLAN - Dashboard Admin PH
-- Referencia: Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md
-- Requiere: schema_subscriptions_base.sql ejecutado
-- ============================================

-- 1. Suscripciones por plan (IDs fijos para referencia)
INSERT INTO subscriptions (
  id, plan_tier, status, price_amount, billing_cycle,
  max_units_included, max_units_total_all_orgs, max_assemblies_per_month, max_organizations
) VALUES
  -- DEMO: 50 unidades (PH A)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DEMO', 'ACTIVE', 0, 'monthly', 50, 50, 2, 1),
  -- STANDARD: 250 unidades (PH B)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'STANDARD', 'ACTIVE', 189, 'monthly', 250, 250, 4, 1),
  -- MULTI_PH_LITE: 1500 (PH C)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MULTI_PH_LITE', 'ACTIVE', 399, 'monthly', 1500, 1500, 10, 10),
  -- MULTI_PH_PRO: 5000 (PH D)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'MULTI_PH_PRO', 'ACTIVE', 699, 'monthly', 5000, 5000, 30, 30),
  -- ENTERPRISE: ilimitado (PH E)
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ENTERPRISE', 'ACTIVE', 2499, 'monthly', 99999, NULL, 999, 999)
ON CONFLICT (id) DO NOTHING;

-- 2. Vincular orgs existentes (PH A, PH B)
UPDATE organizations SET parent_subscription_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE organizations SET parent_subscription_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- 3. Nuevas organizaciones (PH C, D, E)
INSERT INTO organizations (id, name, is_demo, parent_subscription_id) VALUES
  ('33333333-3333-3333-3333-333333333333', 'P.H. Multi-Lite Demo', TRUE, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('44444444-4444-4444-4444-444444444444', 'P.H. Multi-Pro Demo', TRUE, 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('55555555-5555-5555-5555-555555555555', 'P.H. Enterprise Demo', TRUE, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
ON CONFLICT (id) DO UPDATE SET
  parent_subscription_id = EXCLUDED.parent_subscription_id;

-- 4. Nuevos usuarios Admin PH (multilite, multipro, enterprise)
INSERT INTO users (id, organization_id, email, role, is_platform_owner) VALUES
  ('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'multilite@demo.assembly2.com', 'ADMIN_PH', FALSE),
  ('44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'multipro@demo.assembly2.com', 'ADMIN_PH', FALSE),
  ('55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'enterprise@demo.assembly2.com', 'ADMIN_PH', FALSE)
ON CONFLICT (email) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  role = EXCLUDED.role;
