-- FASE 08: limites Multi-PH Lite
CREATE OR REPLACE FUNCTION check_multi_ph_lite_limits(subscription_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_total_orgs INT;
  v_total_units INT;
  v_assemblies_this_month INT;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE id = subscription_id
    AND status = 'ACTIVE';

  IF v_subscription.plan_tier != 'MULTI_PH_LITE' THEN
    RETURN jsonb_build_object('error', 'Not Multi-PH Lite plan');
  END IF;

  SELECT COUNT(*) INTO v_total_orgs
  FROM organizations
  WHERE parent_subscription_id = v_subscription.id;

  SELECT COALESCE(SUM(total_units), 0) INTO v_total_units
  FROM organizations
  WHERE parent_subscription_id = v_subscription.id;

  SELECT COUNT(*) INTO v_assemblies_this_month
  FROM assemblies a
  JOIN organizations o ON o.id = a.organization_id
  WHERE o.parent_subscription_id = v_subscription.id
    AND EXTRACT(MONTH FROM a.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM a.created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  RETURN jsonb_build_object(
    'organizations', jsonb_build_object(
      'current', v_total_orgs,
      'limit', 10,
      'percentage', (v_total_orgs::NUMERIC / 10) * 100,
      'exceeded', v_total_orgs > 10
    ),
    'units', jsonb_build_object(
      'current', v_total_units,
      'limit', 1500,
      'percentage', (v_total_units::NUMERIC / 1500) * 100,
      'exceeded', v_total_units > 1500
    ),
    'assemblies', jsonb_build_object(
      'current', v_assemblies_this_month,
      'limit', 5,
      'percentage', (v_assemblies_this_month::NUMERIC / 5) * 100,
      'exceeded', v_assemblies_this_month > 5
    ),
    'needs_upgrade', (
      v_total_orgs > 10 OR
      v_total_units > 1500 OR
      v_assemblies_this_month > 5
    )
  );
END;
$$ LANGUAGE plpgsql;
