-- Reemplazar Assembly 2.0 por ChatVote.click en prompts ya guardados (BD existente).
-- Ejecutar en la VPS si ya tenías chatbot_config con Assembly 2.0:
--   docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/110_chatbot_config_rebrand_chatvote.sql
UPDATE chatbot_config
SET
  landing_prompt = REPLACE(landing_prompt, 'Assembly 2.0', 'ChatVote.click'),
  demo_prompt = REPLACE(demo_prompt, 'Assembly 2.0', 'ChatVote.click'),
  soporte_prompt = REPLACE(soporte_prompt, 'Assembly 2.0', 'ChatVote.click'),
  residente_prompt = REPLACE(residente_prompt, 'Assembly 2.0', 'ChatVote.click')
WHERE landing_prompt ILIKE '%Assembly 2.0%' OR demo_prompt ILIKE '%Assembly 2.0%' OR soporte_prompt ILIKE '%Assembly 2.0%' OR residente_prompt ILIKE '%Assembly 2.0%';
