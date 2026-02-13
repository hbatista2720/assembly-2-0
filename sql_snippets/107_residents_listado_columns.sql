-- Listado de residentes – columnas para coincidir con demo (INSTRUCCIONES_LISTADO_RESIDENTES_BD §3)
-- Permite que producción muestre nombre, unidad, Nº finca, estado pago, etc. como en demo.
-- Ejecutar antes de ampliar GET/PATCH de /api/admin-ph/residents.
--
-- EJECUCIÓN:
--   docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/107_residents_listado_columns.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS numero_finca TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cedula_identidad TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cuota_pct NUMERIC(5,2) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IS NULL OR payment_status IN ('al_dia', 'mora'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS habilitado_para_asamblea BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS titular_orden SMALLINT CHECK (titular_orden IS NULL OR titular_orden IN (1, 2));

COMMENT ON COLUMN users.nombre IS 'Nombre del residente/propietario. Listado Admin PH.';
COMMENT ON COLUMN users.numero_finca IS 'Número de finca registral. Listado Admin PH.';
COMMENT ON COLUMN users.cedula_identidad IS 'Cédula o documento de identidad. Listado Admin PH.';
COMMENT ON COLUMN users.unit IS 'Número de unidad (ej. 101, A-2). Listado Admin PH.';
COMMENT ON COLUMN users.cuota_pct IS 'Porcentaje de cuota de copropiedad. Listado Admin PH.';
COMMENT ON COLUMN users.payment_status IS 'al_dia | mora. Mora implica no habilitado para asamblea.';
COMMENT ON COLUMN users.habilitado_para_asamblea IS 'Si TRUE puede votar en asamblea. Mora fuerza FALSE.';
COMMENT ON COLUMN users.titular_orden IS 'Titular 1 o 2 en la unidad. Para plantilla Admin PH.';
