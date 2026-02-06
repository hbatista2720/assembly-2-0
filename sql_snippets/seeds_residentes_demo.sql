-- Residentes para org demo (script entregado por Database)
-- Referencia: QA/QA_FEEDBACK.md, Contralor/ESTATUS_AVANCE.md – "Recomendación: Asamblea demo con admin y residentes"
-- Org: Demo - P.H. Urban Tower (11111111-1111-1111-1111-111111111111)
--
-- INTEGRACIÓN DOCKER: Este archivo está en sql_snippets/, montado en /docker-entrypoint-initdb.d.
-- Se ejecuta automáticamente en el primer arranque del contenedor Postgres (init).
--
-- EJECUCIÓN MANUAL (BD ya existente, sin recrear volumen):
--   Opción A – desde la raíz del proyecto (redirigir archivo):
--     docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_residentes_demo.sql
--   Opción B – ruta montada dentro del contenedor (sql_snippets = /docker-entrypoint-initdb.d):
--     docker compose exec postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/seeds_residentes_demo.sql

INSERT INTO users (id, organization_id, email, role, is_platform_owner) VALUES
  ('11111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111111', 'residente1@demo.assembly2.com', 'RESIDENTE', FALSE),
  ('11111111-1111-1111-1111-111111111122', '11111111-1111-1111-1111-111111111111', 'residente2@demo.assembly2.com', 'RESIDENTE', FALSE),
  ('11111111-1111-1111-1111-111111111123', '11111111-1111-1111-1111-111111111111', 'residente3@demo.assembly2.com', 'RESIDENTE', FALSE),
  ('11111111-1111-1111-1111-111111111124', '11111111-1111-1111-1111-111111111111', 'residente4@demo.assembly2.com', 'RESIDENTE', FALSE),
  ('11111111-1111-1111-1111-111111111125', '11111111-1111-1111-1111-111111111111', 'residente5@demo.assembly2.com', 'RESIDENTE', FALSE)
ON CONFLICT (email) DO NOTHING;
