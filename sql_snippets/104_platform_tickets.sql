-- Dashboard Henry: tabla de tickets (QA_REPORTE_DASHBOARD_HENRY.md §5 y §7).
-- Necesaria para GET/PATCH /api/platform-admin/tickets.

CREATE TABLE IF NOT EXISTS platform_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source TEXT NOT NULL DEFAULT 'chatbot',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  escalation_reason TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_tickets_number ON platform_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_platform_tickets_status ON platform_tickets(status);
CREATE INDEX IF NOT EXISTS idx_platform_tickets_priority ON platform_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_platform_tickets_created ON platform_tickets(created_at DESC);

-- Seeds: 3 tickets para Dashboard Henry (lista y detalle unificados).
INSERT INTO platform_tickets (ticket_number, subject, description, status, priority, source)
VALUES
  ('TKT-2026-021', 'Error de quórum en PH Costa', 'El sistema reporta error de quórum en asamblea del PH Costa. Revisar configuración y asistencia.', 'open', 'urgent', 'Chatbot'),
  ('TKT-2026-019', 'Facturación Pro Multi-PH', 'Consulta sobre facturación del plan Pro Multi-PH. Cliente solicita desglose.', 'open', 'high', 'Email'),
  ('TKT-2026-017', 'Acceso demo expira hoy', 'El acceso demo del cliente expira hoy. ¿Renovar o contactar para conversión?', 'open', 'high', 'Landing')
ON CONFLICT (ticket_number) DO NOTHING;
