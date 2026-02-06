# Instrucciones de Base de Datos para el Coder – Autenticación PgBouncer↔PostgreSQL

**Origen:** Agente Base de Datos (DBA)  
**Para:** Coder  
**Fecha:** Febrero 2026  
**Contexto:** QA reporta error `wrong password type` (08P01) al conectar la app a PostgreSQL vía PgBouncer. La autenticación entre PgBouncer y PostgreSQL debe corregirse.

---

## 1. Problema

- **Error:** `PostgresError: server login failed: wrong password type` (código 08P01).
- **Dónde:** La app (contenedor `assembly-app`) usa `DATABASE_URL` apuntando a PgBouncer; PgBouncer conecta a PostgreSQL y el servidor rechaza el login.
- **Causa típica:** PostgreSQL 15 usa por defecto **scram-sha-256** para contraseñas; la imagen PgBouncer (`edoburu/pgbouncer`) puede estar usando **md5** para la conexión al servidor, y el servidor rechaza ese tipo de contraseña.

---

## 2. Objetivo

Que la conexión **PgBouncer → PostgreSQL** funcione para que la app pueda usar la BD vía PgBouncer (y el flujo OTP y el resto de la app funcionen en Docker).

---

## 3. Instrucciones para el Coder (opciones, aplicar una)

### Opción A – Compatibilidad md5 en PostgreSQL (recomendada para Docker local)

Hacer que el usuario `postgres` tenga contraseña en formato **md5** para que PgBouncer pueda autenticarse.

1. **Añadir un script de inicialización** que se ejecute después de crear la BD (por ejemplo en `sql_snippets/` o en un paso de `docker-entrypoint-initdb.d`):
   - Conectar como superuser y ejecutar:
     ```sql
     -- Compatibilidad con PgBouncer (auth md5)
     ALTER SYSTEM SET password_encryption = 'md5';
     SELECT pg_reload_conf();
     ALTER USER postgres PASSWORD 'postgres';  -- o la que uses en POSTGRES_PASSWORD
     ALTER SYSTEM SET password_encryption = 'scram-sha-256';
     SELECT pg_reload_conf();
     ```
   - Así el usuario `postgres` queda con contraseña en md5 y PgBouncer podrá conectarse.

2. **Asegurar** que `POSTGRES_PASSWORD` en `docker-compose` (o `.env`) sea la misma que la usada en el `ALTER USER` (ej. `postgres`).

3. **Recrear** el contenedor de Postgres (o volumen) para que el init se ejecute:
   ```bash
   docker compose down
   docker volume rm <nombre_volumen_postgres>  # si es necesario
   docker compose up -d
   ```

### Opción B – Forzar tipo de auth en PgBouncer (si la imagen lo soporta)

- Revisar la documentación de la imagen `edoburu/pgbouncer` por variables de entorno o configuración que permitan usar **scram-sha-256** para la conexión al servidor.
- Si existe (ej. `AUTH_TYPE=scram-sha-256` o similar), configurarla en `docker-compose` para el servicio `pgbouncer` y dejar que Postgres use scram-sha-256.

### Opción C – Conexión directa de la app a PostgreSQL (temporal)

- Para desbloquear QA mientras se resuelve A o B: en `docker-compose`, cambiar `DATABASE_URL` de los servicios que usan BD para que apunten a `postgres:5432` en lugar de `pgbouncer:5432`. Solo como medida temporal; el objetivo final es usar PgBouncer.

---

## 4. Verificación

Tras aplicar la corrección:

1. **Recrear** el contenedor y volumen de Postgres para que el init ejecute el nuevo script (si la BD ya existía):
   ```bash
   docker compose down
   docker volume rm liveassambly_version_2_0_postgres_data   # o el nombre que liste `docker volume ls`
   docker compose up -d
   ```
2. Si la BD es **nueva** (primera vez): solo `docker compose up -d`.
3. Comprobar que la app puede conectar:
   - Probar `POST /api/auth/request-otp` con un email de prueba (ej. `demo@assembly2.com`).
   - No debe aparecer `wrong password type`.
4. **QA** re-ejecuta la validación del flujo OTP según `Contralor/VALIDACION_DOCKER_Y_OTP.md`.

---

## 5. Aplicado por Coder (Opción A)

- **Script añadido:** `sql_snippets/99_pgbouncer_md5_compat.sql`
- Configura `password_encryption = 'md5'`, ejecuta `ALTER USER postgres PASSWORD 'postgres'`, y restaura `scram-sha-256`.
- Coincidencia: `POSTGRES_PASSWORD` en docker-compose por defecto es `postgres`; si se cambia en `.env`, hay que usar el mismo valor en el script o ejecutar el `ALTER USER` manualmente tras el primer init.

---

## 6. Referencias

- `QA/QA_FEEDBACK.md` – Error y contexto.
- `Contralor/ESTATUS_AVANCE.md` – Asignación Database (diagnóstico) / Coder (implementación).
- `Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md` – Configuración PgBouncer (auth_type, pool, etc.).
