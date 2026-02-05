-- FASE 08: expirar creditos vencidos
CREATE OR REPLACE FUNCTION expire_old_credits()
RETURNS TABLE(
  expired_count INT,
  total_credits_lost INT
) AS $$
DECLARE
  v_expired_count INT;
  v_total_lost INT;
BEGIN
  UPDATE assembly_credits
  SET is_expired = TRUE,
      updated_at = NOW()
  WHERE is_expired = FALSE
    AND expires_at <= NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_total_lost
  FROM assembly_credits
  WHERE is_expired = TRUE
    AND updated_at >= NOW() - INTERVAL '1 minute';

  RETURN QUERY SELECT v_expired_count, v_total_lost;
END;
$$ LANGUAGE plpgsql;
