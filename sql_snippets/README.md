# Scripts SQL – init Docker y ejecución manual

Esta carpeta se monta en el contenedor Postgres como **`/docker-entrypoint-initdb.d`**. Todos los `.sql` se ejecutan **en el primer arranque** del contenedor (cuando el volumen de datos está vacío), en orden alfabético.

## Scripts que se ejecutan en el init

| Archivo | Descripción |
|---------|-------------|
| `97_platform_leads.sql` | Tabla `platform_leads` (leads del chatbot / CRM). |
| `99_pgbouncer_md5_compat.sql` | Compatibilidad md5 PgBouncer↔PostgreSQL. |
| `auth_otp_local.sql` | Tablas `organizations`, `users`, `auth_pins`; seed OTP y org demo. |
| `chatbot_config.sql` | Tabla `chatbot_config` y seed bots (web, telegram, whatsapp). |
| `login_otp_setup.sql` | Setup adicional login OTP. |
| `presenter_tokens.sql` | Tokens para vista presentación. |
| `rls_multi_tenant_setup.sql` | RLS multi-tenant. |
| `schema_auth_improved.sql` | Schema auth mejorado. |
| **`seeds_residentes_demo.sql`** | **Usuarios residentes demo** (residente1@…residente5@demo.assembly2.com, org demo). Entregado por Database. |

## Ejecución manual (instancia ya creada)

Si el volumen de Postgres ya existía antes de añadir un script, el init **no** se vuelve a ejecutar. En ese caso hay que aplicar el script a mano:

### Usuarios residentes demo (`seeds_residentes_demo.sql`)

- **Opción A** (desde la raíz del proyecto):  
  `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_residentes_demo.sql`
- **Opción B** (ruta dentro del contenedor):  
  `docker compose exec postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/seeds_residentes_demo.sql`

Referencia: **Contralor/ESTATUS_AVANCE.md** (tarea “Usuarios residentes demo”), **QA/QA_FEEDBACK.md**.

### Otros scripts

Para cualquier otro `.sql` de esta carpeta, usar el mismo patrón:

- `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/NOMBRE.sql`
- o `docker compose exec postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/NOMBRE.sql`
