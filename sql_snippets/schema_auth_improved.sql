-- === MEJORAS DE SEGURIDAD AGREGADAS POR DBA ===

-- Tabla de intentos de auth (rate limiting, prevenir brute force)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- 'otp_request', 'otp_verify'
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para rate limiting (última hora)
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_recent
ON auth_attempts (email, created_at)
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Índice para análisis de seguridad
CREATE INDEX IF NOT EXISTS idx_auth_attempts_failed
ON auth_attempts (email, success, created_at)
WHERE success = false;

-- Función de rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email TEXT,
  p_attempt_type TEXT,
  p_max_attempts INT DEFAULT 5,
  p_window_minutes INT DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth_attempts
  WHERE email = p_email
    AND attempt_type = p_attempt_type
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  RETURN v_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup automático de intentos viejos (>7 días)
CREATE OR REPLACE FUNCTION cleanup_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE auth_attempts IS 'Registro de intentos de autenticación para rate limiting y auditoría';
COMMENT ON FUNCTION check_rate_limit IS 'Verifica si un email ha excedido el límite de intentos';
