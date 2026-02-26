-- Demo por correo: asegurar que auth_attempts existe (API demo/request la usa para rate limit).
-- Si la BD se inicializó solo con migraciones (sin auth_otp_local.sql), esta tabla puede faltar.

CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_recent
  ON auth_attempts (email, created_at);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_demo_request
  ON auth_attempts (attempt_type, created_at) WHERE attempt_type = 'demo_request';

COMMENT ON TABLE auth_attempts IS 'Registro de intentos de autenticación y demo_request para rate limiting';
