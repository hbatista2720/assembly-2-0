-- FASE 08: consumir creditos FIFO
CREATE OR REPLACE FUNCTION consume_assembly_credits(
  p_organization_id UUID,
  p_credits_needed INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_remaining INT := p_credits_needed;
  v_total_available INT;
  v_credits_consumed JSONB := '[]'::JSONB;
BEGIN
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_total_available
  FROM assembly_credits
  WHERE organization_id = p_organization_id
    AND is_expired = FALSE
    AND expires_at > NOW();

  IF v_total_available < p_credits_needed THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient credits',
      'available', v_total_available,
      'needed', p_credits_needed
    );
  END IF;

  FOR v_record IN
    SELECT id, earned_month, credits_remaining
    FROM assembly_credits
    WHERE organization_id = p_organization_id
      AND is_expired = FALSE
      AND expires_at > NOW()
      AND credits_remaining > 0
    ORDER BY earned_month ASC
  LOOP
    IF v_remaining <= 0 THEN
      EXIT;
    END IF;

    IF v_record.credits_remaining >= v_remaining THEN
      UPDATE assembly_credits
      SET credits_used = credits_used + v_remaining,
          updated_at = NOW()
      WHERE id = v_record.id;

      v_credits_consumed := v_credits_consumed || jsonb_build_object(
        'credit_id', v_record.id,
        'month', v_record.earned_month,
        'consumed', v_remaining
      );

      v_remaining := 0;
    ELSE
      UPDATE assembly_credits
      SET credits_used = credits_earned,
          updated_at = NOW()
      WHERE id = v_record.id;

      v_credits_consumed := v_credits_consumed || jsonb_build_object(
        'credit_id', v_record.id,
        'month', v_record.earned_month,
        'consumed', v_record.credits_remaining
      );

      v_remaining := v_remaining - v_record.credits_remaining;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'credits_consumed', v_credits_consumed,
    'total_consumed', p_credits_needed
  );
END;
$$ LANGUAGE plpgsql;
