-- FASE 08: detectar plan ilimitado
CREATE OR REPLACE FUNCTION is_unlimited_plan(subscription_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE id = subscription_id
      AND plan_tier = 'ENTERPRISE'
      AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql;
