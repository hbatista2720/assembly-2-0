-- Sesión única por residente: un solo canal activo (web o telegram) a la vez.
CREATE TABLE IF NOT EXISTS resident_sessions (
  email TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'telegram')),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resident_sessions_channel ON resident_sessions (channel);
CREATE INDEX IF NOT EXISTS idx_resident_sessions_activity ON resident_sessions (last_activity_at DESC);

COMMENT ON TABLE resident_sessions IS 'Registro de canal activo por residente (web o telegram) para sesión única';
