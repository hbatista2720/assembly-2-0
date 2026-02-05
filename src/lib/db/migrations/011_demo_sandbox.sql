-- FASE 10: Menú Demo (Sandbox). Suscripción DEMO y asamblea de prueba.

-- Asegurar columna en organizations (por si no existe)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS parent_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Suscripción DEMO para la org de prueba (id fijo)
INSERT INTO subscriptions (
  id,
  plan_tier,
  status,
  price_amount,
  billing_cycle,
  max_units_included,
  max_assemblies_per_month,
  max_organizations
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'DEMO',
  'ACTIVE',
  0,
  'monthly',
  250,
  2,
  1
) ON CONFLICT (id) DO NOTHING;

-- Vincular org demo a la suscripción DEMO
UPDATE organizations
SET parent_subscription_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND (parent_subscription_id IS NULL OR parent_subscription_id != 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Asamblea de prueba para la org demo (si la tabla assemblies existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assemblies') THEN
    INSERT INTO assemblies (organization_id, title, scheduled_at)
    SELECT
      '11111111-1111-1111-1111-111111111111'::uuid,
      'Asamblea Ordinaria Demo 2026',
      NOW() + INTERVAL '7 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM assemblies
      WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
      LIMIT 1
    );
  END IF;
EXCEPTION
  WHEN undefined_column OR undefined_table THEN NULL;
END $$;
