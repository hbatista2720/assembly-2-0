-- Demo por correo: rate limit por IP en auth_attempts (Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md §5.2)

-- Asegurar que auth_attempts existe (puede estar creada por otro módulo)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auth_attempts') THEN
    ALTER TABLE auth_attempts ADD COLUMN IF NOT EXISTS ip_address INET NULL;
    COMMENT ON COLUMN auth_attempts.ip_address IS 'IP del cliente para rate limit en demo_request.';
  END IF;
END $$;
