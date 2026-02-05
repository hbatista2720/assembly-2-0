-- FASE 08: maximo total de unidades en toda la cartera
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS max_units_total_all_orgs INT;

UPDATE subscriptions
SET max_units_total_all_orgs = 250
WHERE plan_tier = 'STANDARD';

UPDATE subscriptions
SET max_units_total_all_orgs = 1500
WHERE plan_tier = 'MULTI_PH_LITE';

UPDATE subscriptions
SET max_units_total_all_orgs = 5000
WHERE plan_tier = 'MULTI_PH_PRO';

UPDATE subscriptions
SET max_units_total_all_orgs = NULL
WHERE plan_tier = 'ENTERPRISE';
