-- === OTP Local (Docker) ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN_PH',
  is_platform_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pin VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_pins_user ON auth_pins(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_pins_pin ON auth_pins(pin, used);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_recent
ON auth_attempts (email, created_at);

-- Seed básico (opcional para pruebas)
INSERT INTO organizations (id, name, is_demo) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo - P.H. Urban Tower', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'P.H. Torres del Pacífico', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, organization_id, email, role, is_platform_owner) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'henry.batista27@gmail.com', 'ADMIN_PLATAFORMA', TRUE),
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'demo@assembly2.com', 'ADMIN_PH', FALSE),
  ('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'admin@torresdelpacifico.com', 'ADMIN_PH', FALSE)
ON CONFLICT (id) DO NOTHING;
