-- FASE 08: agregar MULTI_PH_LITE al enum de planes
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_tier_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_tier_check CHECK (
    plan_tier IN (
      'DEMO',
      'EVENTO_UNICO',
      'DUO_PACK',
      'STANDARD',
      'MULTI_PH_LITE',
      'MULTI_PH_PRO',
      'ENTERPRISE'
    )
  );
