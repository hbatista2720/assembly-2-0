-- Sesión única: un solo canal activo (web o telegram) por residente.
-- Ejecutar en la VPS si la BD ya existía:
--   docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/109_resident_sessions.sql
CREATE TABLE IF NOT EXISTS resident_sessions (
  email TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'telegram')),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resident_sessions_channel ON resident_sessions (channel);
CREATE INDEX IF NOT EXISTS idx_resident_sessions_activity ON resident_sessions (last_activity_at DESC);

COMMENT ON TABLE resident_sessions IS 'Canal activo por residente (web o telegram) para sesión única';
