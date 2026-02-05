-- FASE 09: Métodos de pago - columnas Stripe y tablas auxiliares
-- Ejecutar después de tener tabla subscriptions (FASE 08)

-- Columnas de pago en subscriptions (si no existen)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_latest_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Permitir métodos: STRIPE_CARD, MANUAL_ACH, MANUAL_YAPPY, MANUAL_TRANSFER, PAYPAL, TILOPAY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_payment_method_check'
  ) THEN
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_payment_method_check
      CHECK (payment_method IS NULL OR payment_method IN (
        'STRIPE_CARD', 'MANUAL_ACH', 'MANUAL_YAPPY', 'MANUAL_TRANSFER', 'PAYPAL', 'TILOPAY'
      ));
  END IF;
END $$;

-- Solicitudes de pago manual (ACH, Yappy, transferencia)
CREATE TABLE IF NOT EXISTS manual_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_tier TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ACH', 'YAPPY', 'TRANSFER')),
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manual_payment_requests_status ON manual_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_manual_payment_requests_org ON manual_payment_requests(organization_id);

-- Facturas (registro de pagos)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  payment_method TEXT,
  stripe_invoice_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
