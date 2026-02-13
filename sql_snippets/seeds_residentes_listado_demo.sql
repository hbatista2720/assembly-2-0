-- Seeds opcionales: residentes demo con datos "ricos" (nombre, unidad, payment_status, etc.)
-- Ref: INSTRUCCIONES_LISTADO_RESIDENTES_BD §3 – alinear BD con listado demo.
-- Requiere: 107_residents_listado_columns.sql ejecutado antes.
--
-- EJECUCIÓN (después de 107):
--   docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_residentes_listado_demo.sql

UPDATE users SET
  nombre = 'Residente Urban 1',
  numero_finca = '96001',
  unit = '101',
  cuota_pct = 2.5,
  payment_status = 'al_dia',
  habilitado_para_asamblea = TRUE,
  titular_orden = 1
WHERE email = 'residente1@demo.assembly2.com';

UPDATE users SET
  nombre = 'Residente Urban 2',
  numero_finca = '96002',
  unit = '102',
  cuota_pct = 2.5,
  payment_status = 'al_dia',
  habilitado_para_asamblea = TRUE,
  titular_orden = 1
WHERE email = 'residente2@demo.assembly2.com';

UPDATE users SET
  nombre = 'Residente Urban 3',
  numero_finca = '96003',
  unit = '103',
  cuota_pct = 2.5,
  payment_status = 'al_dia',
  habilitado_para_asamblea = FALSE,
  titular_orden = 1
WHERE email = 'residente3@demo.assembly2.com';

UPDATE users SET
  nombre = 'Residente Urban 4',
  numero_finca = '96004',
  unit = '104',
  cuota_pct = 2.5,
  payment_status = 'mora',
  habilitado_para_asamblea = FALSE,
  titular_orden = 1
WHERE email = 'residente4@demo.assembly2.com';

UPDATE users SET
  nombre = 'Residente Urban 5',
  numero_finca = '96005',
  unit = '105',
  cuota_pct = 2.5,
  payment_status = 'al_dia',
  habilitado_para_asamblea = TRUE,
  titular_orden = 1
WHERE email = 'residente5@demo.assembly2.com';
