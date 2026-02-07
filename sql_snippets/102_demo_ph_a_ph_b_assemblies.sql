-- Demo PH A y PH B: 2 contextos de asamblea para pruebas
-- PH A: residentes + asamblea ACTIVA (en curso, se puede votar)
-- PH B: residentes + asamblea PROGRAMADA (agendada, no se puede votar aún)
-- Ref: QA plan pruebas, Marketing §F §H

-- === 1. Crear tabla assemblies si no existe ===
CREATE TABLE IF NOT EXISTS assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('active', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Para instancias donde assemblies ya existe sin status
ALTER TABLE assemblies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
UPDATE assemblies SET status = 'scheduled' WHERE status IS NULL;
ALTER TABLE assemblies DROP CONSTRAINT IF EXISTS assemblies_status_check;
ALTER TABLE assemblies ADD CONSTRAINT assemblies_status_check 
  CHECK (status IN ('active', 'scheduled', 'completed'));

CREATE INDEX IF NOT EXISTS idx_assemblies_org ON assemblies(organization_id);
CREATE INDEX IF NOT EXISTS idx_assemblies_status ON assemblies(organization_id, status) 
  WHERE status IN ('active', 'scheduled');

-- === 2. Asegurar org PH B (Torres) como demo ===
UPDATE organizations SET is_demo = TRUE 
WHERE id = '22222222-2222-2222-2222-222222222222';

-- === 3. Residentes PH B (P.H. Torres del Pacífico) ===
INSERT INTO users (id, organization_id, email, role, is_platform_owner) VALUES
  ('22222222-2222-2222-2222-222222222231', '22222222-2222-2222-2222-222222222222', 'residente1@torresdelpacifico.com', 'RESIDENTE', FALSE),
  ('22222222-2222-2222-2222-222222222232', '22222222-2222-2222-2222-222222222222', 'residente2@torresdelpacifico.com', 'RESIDENTE', FALSE),
  ('22222222-2222-2222-2222-222222222233', '22222222-2222-2222-2222-222222222222', 'residente3@torresdelpacifico.com', 'RESIDENTE', FALSE)
ON CONFLICT (email) DO NOTHING;

-- === 4. PH A: Asamblea ACTIVA (Demo - P.H. Urban Tower) ===
-- Eliminar asambleas previas (presenter_tokens puede tener FK)
DO $$ BEGIN
  DELETE FROM presenter_tokens WHERE assembly_id IN (SELECT id FROM assemblies WHERE organization_id = '11111111-1111-1111-1111-111111111111');
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DELETE FROM assemblies WHERE organization_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO assemblies (id, organization_id, title, scheduled_at, status) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Asamblea Ordinaria Demo 2026 (activa)', NOW() - INTERVAL '1 hour', 'active');

-- === 5. PH B: Asamblea PROGRAMADA (P.H. Torres del Pacífico) ===
DO $$ BEGIN
  DELETE FROM presenter_tokens WHERE assembly_id IN (SELECT id FROM assemblies WHERE organization_id = '22222222-2222-2222-2222-222222222222');
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DELETE FROM assemblies WHERE organization_id = '22222222-2222-2222-2222-222222222222';
INSERT INTO assemblies (id, organization_id, title, scheduled_at, status) VALUES
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Asamblea Ordinaria Torres 2026 (programada)', NOW() + INTERVAL '7 days', 'scheduled');

COMMENT ON COLUMN assemblies.status IS 'active=en curso (votación abierta); scheduled=agendada (aún no iniciada); completed=finalizada';
