-- FASE 08: uso justo Enterprise (misma razon social)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS company_tax_id TEXT;
