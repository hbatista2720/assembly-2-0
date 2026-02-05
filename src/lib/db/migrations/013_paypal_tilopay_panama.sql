-- FASE 09 (alcance Arquitecto): Solo PayPal, Tilopay, Yappy, ACH. Stripe fuera de alcance.
-- Referencia: Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md, Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md

-- PayPal (pagos automáticos; retiros en Panamá)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT;

-- Tilopay (pagos automáticos local/CA)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS tilopay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS tilopay_customer_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_paypal_sub ON subscriptions(paypal_subscription_id) WHERE paypal_subscription_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_tilopay_sub ON subscriptions(tilopay_subscription_id) WHERE tilopay_subscription_id IS NOT NULL;

-- Facturas: PayPal/Tilopay (no Stripe)
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS paypal_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS tilopay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_paypal ON invoices(paypal_invoice_id) WHERE paypal_invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_tilopay ON invoices(tilopay_payment_id) WHERE tilopay_payment_id IS NOT NULL;

-- payment_method en subscriptions: solo métodos con retiro en Panamá (quitar STRIPE_CARD)
UPDATE subscriptions SET payment_method = NULL WHERE payment_method = 'STRIPE_CARD' OR payment_method NOT IN ('PAYPAL', 'TILOPAY', 'MANUAL_ACH', 'MANUAL_YAPPY', 'MANUAL_TRANSFER');
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_payment_method_check;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN (
    'PAYPAL', 'TILOPAY', 'MANUAL_ACH', 'MANUAL_YAPPY', 'MANUAL_TRANSFER'
  ));
