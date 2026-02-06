-- Registro de abandono de sala por residente (§E)
-- Referencia: QA/QA_FEEDBACK.md "QA Validación · Registro de abandono de sala (§E)"
-- Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §E

-- Requiere: tablas users, organizations (auth_otp_local.sql)
-- assembly_id es UUID sin FK para compatibilidad con init (assemblies puede crearse por migraciones app).

CREATE TABLE IF NOT EXISTS resident_abandon_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assembly_id UUID,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  abandoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resident_name TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resident_abandon_events_user ON resident_abandon_events(user_id);
CREATE INDEX IF NOT EXISTS idx_resident_abandon_events_assembly ON resident_abandon_events(assembly_id);
CREATE INDEX IF NOT EXISTS idx_resident_abandon_events_organization ON resident_abandon_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_resident_abandon_events_abandoned_at ON resident_abandon_events(abandoned_at DESC);

COMMENT ON TABLE resident_abandon_events IS 'Eventos de abandono de sala/votación por residentes. Admin PH ve "Residente [nombre/unidad] abandonó a las [hora]".';
COMMENT ON COLUMN resident_abandon_events.user_id IS 'Residente que abandonó (FK users)';
COMMENT ON COLUMN resident_abandon_events.assembly_id IS 'Asamblea/votación que abandonó (nullable si sale sin asamblea específica)';
COMMENT ON COLUMN resident_abandon_events.organization_id IS 'Org del residente (para RLS y filtros)';
COMMENT ON COLUMN resident_abandon_events.abandoned_at IS 'Hora en que el residente abandonó la sala';
COMMENT ON COLUMN resident_abandon_events.resident_name IS 'Nombre para display (ej. "Juan Pérez"). Opcional, se puede obtener por JOIN users';
COMMENT ON COLUMN resident_abandon_events.unit IS 'Unidad/código (ej. "A-402"). Opcional';
