-- Estado de cliente (Activo/Suspendido/Cancelado) para platform-admin.
-- Referencia: Marketing/MARKETING_VALIDACION_DASHBOARD_HENRY.md (persistencia Clients).
CREATE TABLE IF NOT EXISTS platform_client_status (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Suspendido', 'Cancelado')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_client_status_updated ON platform_client_status(updated_at);
