-- FASE 08: sistema de creditos acumulables
CREATE TABLE IF NOT EXISTS assembly_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  earned_month DATE NOT NULL,
  credits_earned INT NOT NULL DEFAULT 0,
  credits_used INT NOT NULL DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_earned - credits_used) STORED,
  expires_at TIMESTAMP NOT NULL,
  is_expired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT credits_positive CHECK (credits_earned >= 0),
  CONSTRAINT used_not_exceed_earned CHECK (credits_used <= credits_earned),
  CONSTRAINT unique_org_month UNIQUE (organization_id, earned_month)
);

CREATE INDEX IF NOT EXISTS idx_assembly_credits_org ON assembly_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_assembly_credits_expires ON assembly_credits(expires_at);
CREATE INDEX IF NOT EXISTS idx_assembly_credits_active
  ON assembly_credits(organization_id, is_expired)
  WHERE is_expired = FALSE;
