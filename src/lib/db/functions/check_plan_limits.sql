-- FASE 08: validar limites por regla "lo que ocurra primero"
CREATE OR REPLACE FUNCTION check_plan_limits(subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_sub RECORD;
  v_current_orgs INT;
  v_current_units INT;
  v_current_assemblies INT;
BEGIN
  SELECT * INTO v_sub FROM subscriptions WHERE id = subscription_id;

  SELECT
    COUNT(DISTINCT o.id),
    COALESCE(SUM(o.total_units), 0),
    COUNT(DISTINCT CASE
      WHEN EXTRACT(MONTH FROM a.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM a.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      THEN a.id
    END)
  INTO v_current_orgs, v_current_units, v_current_assemblies
  FROM organizations o
  LEFT JOIN assemblies a ON a.organization_id = o.id
  WHERE o.parent_subscription_id = subscription_id;

  RETURN (
    v_current_orgs > v_sub.max_organizations OR
    v_current_units > v_sub.max_units_total_all_orgs OR
    v_current_assemblies > v_sub.max_assemblies_per_month
  );
END;
$$ LANGUAGE plpgsql;
