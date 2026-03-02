-- Tokens y API keys editables desde el panel de Henry.
-- Ejecutar: psql -d assembly -f sql_snippets/platform_secrets.sql
CREATE TABLE IF NOT EXISTS platform_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE platform_secrets IS 'Tokens y API keys (Telegram, Gemini) editables desde Configuración Chatbot. Henry puede actualizar y validar.';
