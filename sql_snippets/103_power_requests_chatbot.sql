-- Solicitudes de poder desde chatbot (Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md, Marketing §G)
-- Estado PENDING → Admin PH aprueba/rechaza. Frontend: botón "Poder en proceso de validación y aprobación" cuando hay PENDING.

CREATE TABLE IF NOT EXISTS power_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  apoderado_tipo TEXT NOT NULL CHECK (apoderado_tipo IN ('residente_ph', 'titular_mayor_edad')),
  apoderado_email TEXT NOT NULL,
  apoderado_nombre TEXT NOT NULL,
  apoderado_cedula TEXT,
  apoderado_telefono TEXT,
  vigencia TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requested_via TEXT DEFAULT 'CHATBOT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_power_requests_resident ON power_requests(resident_user_id);
CREATE INDEX IF NOT EXISTS idx_power_requests_status ON power_requests(resident_user_id, status) WHERE status = 'PENDING';

COMMENT ON TABLE power_requests IS 'Solicitudes de ceder poder desde chatbot; estado pendiente por aprobar hasta que Admin PH apruebe o rechace.';
