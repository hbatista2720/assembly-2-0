-- === Configuración de Chatbots ===
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

INSERT INTO chatbot_config (bot_name, is_active, prompts)
VALUES
  (
    'telegram',
    TRUE,
    '{
      "landing": "Eres Lex, asistente de Assembly 2.0.",
      "demo": "Eres tutor de Assembly 2.0. Guia al usuario en el demo paso a paso.",
      "soporte": "Eres soporte tecnico de Assembly 2.0. Resuelve dudas rapidamente.",
      "residente": "Ayudas a residentes a votar y ver informacion de asambleas."
    }'::jsonb
  ),
  (
    'whatsapp',
    FALSE,
    '{
      "landing": "Eres Lex, asistente de Assembly 2.0.",
      "soporte": "Eres soporte tecnico de Assembly 2.0. Resuelve dudas rapidamente.",
      "residente": "Ayudas a residentes a votar y ver informacion de asambleas."
    }'::jsonb
  ),
  (
    'web',
    TRUE,
    '{
      "landing": "Eres Lex, asistente de Assembly 2.0.",
      "demo": "Eres tutor de Assembly 2.0. Guia al usuario en el demo paso a paso.",
      "soporte": "Eres soporte tecnico de Assembly 2.0. Resuelve dudas rapidamente.",
      "residente": "Ayudas a residentes a votar y ver informacion de asambleas."
    }'::jsonb
  )
ON CONFLICT (bot_name) DO NOTHING;

-- Actualizar landing a "Eres Lex, asistente de Assembly 2.0." si tenía la frase de leads/demos
UPDATE chatbot_config
SET prompts = jsonb_set(prompts, '{landing}', '"Eres Lex, asistente de Assembly 2.0."')
WHERE prompts->>'landing' = 'Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos.';

CREATE INDEX IF NOT EXISTS idx_chatbot_config_active ON chatbot_config(is_active);
