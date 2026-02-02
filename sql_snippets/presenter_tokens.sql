-- Vista de presentación: tokens para compartir enlace
CREATE TABLE IF NOT EXISTS presenter_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presenter_tokens_assembly ON presenter_tokens(assembly_id);
CREATE INDEX IF NOT EXISTS idx_presenter_tokens_token ON presenter_tokens(token);
