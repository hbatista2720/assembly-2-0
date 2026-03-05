-- Buzón: historial de correos enviados por la plataforma (OTP, notificaciones).
-- Para dashboard Henry > Buzón correo. Ejecutar manualmente si la BD ya existía:
--   docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/108_email_log.sql
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT,
  email_type TEXT NOT NULL DEFAULT 'otp',
  body_preview TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_to_email ON email_log (to_email);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log (email_type);

COMMENT ON TABLE email_log IS 'Buzón: historial de correos enviados (OTP, poder, etc.) para consulta en dashboard';
