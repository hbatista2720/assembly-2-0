-- Leads demo para Funnel (Dashboard Henry).
-- Referencia: QA/QA_FEEDBACK.md, Contralor/ESTATUS_AVANCE.md.
--
-- PRERREQUISITO: Tabla platform_leads debe existir (97_platform_leads.sql).
--
-- EJECUCIÓN MANUAL (BD ya existente):
--   docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_leads_demo.sql
--   o: docker compose exec postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/seeds_leads_demo.sql

INSERT INTO platform_leads (email, phone, company_name, lead_source, funnel_stage, lead_score, lead_qualified, last_interaction_at, created_at, updated_at) VALUES
  ('lead1@empresa-a.com', '+507 6000-0001', 'Administradora Empresa A', 'chatbot', 'new', 45, FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 day', NOW()),
  ('lead2@ph-costablanca.com', '+507 6000-0002', 'PH Costa Blanca', 'landing', 'qualified', 82, TRUE, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 days', NOW()),
  ('lead3@torresdelmar.pa', '+507 6000-0003', 'Torres del Mar', 'chatbot', 'demo_active', 90, TRUE, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '5 days', NOW()),
  ('lead4@admin-panama.com', '+507 6000-0004', 'Administradora Panamá', 'manual', 'converted', 100, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '14 days', NOW()),
  ('lead5@demo-contacto.com', NULL, 'Contacto demo', 'demo', 'new', 30, FALSE, NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
