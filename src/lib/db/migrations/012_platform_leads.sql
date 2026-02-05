-- FASE 11: Lead Validation. Tabla de leads desde chatbot y otras fuentes.

CREATE TABLE IF NOT EXISTS platform_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company_name TEXT,
  lead_source TEXT NOT NULL DEFAULT 'chatbot' CHECK (lead_source IN ('chatbot', 'landing', 'manual', 'demo')),
  funnel_stage TEXT NOT NULL DEFAULT 'new' CHECK (funnel_stage IN ('new', 'qualified', 'demo_requested', 'demo_active', 'converted', 'lost')),
  lead_score INT DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_qualified BOOLEAN DEFAULT FALSE,
  qualification_data JSONB DEFAULT '{}',
  telegram_id TEXT,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  total_interactions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_leads_email ON platform_leads(email);
CREATE INDEX IF NOT EXISTS idx_platform_leads_funnel ON platform_leads(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_platform_leads_qualified ON platform_leads(lead_qualified) WHERE lead_qualified = TRUE;
CREATE INDEX IF NOT EXISTS idx_platform_leads_updated ON platform_leads(updated_at DESC);
