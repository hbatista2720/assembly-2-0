-- Asegura que el bot Telegram esté activo y configurado.
-- Ejecutar: psql -d assembly -f sql_snippets/chatbot_config_fix.sql

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ai_model TEXT DEFAULT 'gemini-1.5-flash',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 500,
  prompts JSONB DEFAULT '{}'::jsonb,
  total_conversations INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  avg_response_time_ms INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar o actualizar telegram para que esté activo
-- welcome_message: mensaje al usuario. landing: prompt para IA (no se muestra al usuario)
INSERT INTO chatbot_config (bot_name, is_active, prompts)
VALUES (
  'telegram',
  TRUE,
  '{
    "welcome_message": "¡Hola! 👋 Soy **Lex**, el asistente de Assembly 2.0.\n\nPara ayudarte mejor, ¿con quién estoy hablando?",
    "landing": "Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos."
  }'::jsonb
)
ON CONFLICT (bot_name) DO UPDATE SET
  is_active = TRUE,
  prompts = jsonb_set(
    COALESCE(chatbot_config.prompts, '{}'::jsonb),
    '{welcome_message}',
    '"¡Hola! 👋 Soy **Lex**, el asistente de Assembly 2.0.\n\nPara ayudarte mejor, ¿con quién estoy hablando?"'
  ),
  updated_at = NOW();

-- Verificar
SELECT bot_name, is_active, prompts->>'landing' as landing_prompt
FROM chatbot_config
WHERE bot_name = 'telegram';
