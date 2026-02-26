-- Fase 1: Comprobante de pago para órdenes manuales (ACH, Yappy)
-- Ver INSTRUCCIONES_CODER_CREDITOS_ASAMBLEAS_Y_CARRITO_FASE1.md
--
-- Ejecutar: psql $DATABASE_URL -f src/lib/db/migrations/018_payment_proof.sql
-- O desde pgAdmin / cliente SQL: copiar y ejecutar el contenido.

ALTER TABLE manual_payment_requests
  ADD COLUMN IF NOT EXISTS proof_base64 TEXT,
  ADD COLUMN IF NOT EXISTS proof_filename TEXT;

COMMENT ON COLUMN manual_payment_requests.proof_base64 IS 'Base64 o data URL del comprobante (PDF/JPG/PNG) para Fase 1';
COMMENT ON COLUMN manual_payment_requests.proof_filename IS 'Nombre original del archivo subido';
