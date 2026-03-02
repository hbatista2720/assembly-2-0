-- Añade configuración de Telegram al chatbot (username editable desde el panel).
ALTER TABLE chatbot_config
  ADD COLUMN IF NOT EXISTS telegram_bot_username TEXT;
