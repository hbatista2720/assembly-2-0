-- Dashboard Henry: campañas CRM (QA_REPORTE_DASHBOARD_HENRY.md §5 y §7).

CREATE TABLE IF NOT EXISTS platform_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_campaigns_active ON platform_campaigns(is_active) WHERE is_active = true;

INSERT INTO platform_campaigns (name, is_active)
VALUES
  ('Onboarding Demo', true),
  ('Seguimiento Post-Demo', false),
  ('Reactivación de Leads', true)
ON CONFLICT (name) DO NOTHING;
