-- Demo por correo del cliente: expiración 15 días (Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md)

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN organizations.demo_expires_at IS 'Para orgs con is_demo=true: fecha límite del trial (15 días desde creación).';

CREATE INDEX IF NOT EXISTS idx_organizations_demo_expires
  ON organizations(demo_expires_at) WHERE is_demo = TRUE;
