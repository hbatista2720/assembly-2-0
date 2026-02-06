-- =====================================================================
-- Compatibilidad PgBouncer ↔ PostgreSQL (Database_DBA)
-- Ver: Database_DBA/INSTRUCCIONES_CODER_PGBOUNCER_AUTH.md
-- =====================================================================
-- PostgreSQL 15 usa scram-sha-256 por defecto; PgBouncer (edoburu)
-- puede usar md5 para la conexión al servidor. Este script deja al
-- usuario postgres con contraseña en md5 para que PgBouncer autentique.
-- IMPORTANTE: POSTGRES_PASSWORD en .env/docker-compose debe ser "postgres"
-- (o igual al valor usado abajo) para que coincida.
-- =====================================================================

ALTER SYSTEM SET password_encryption = 'md5';
SELECT pg_reload_conf();

ALTER USER postgres PASSWORD 'postgres';

ALTER SYSTEM SET password_encryption = 'scram-sha-256';
SELECT pg_reload_conf();
