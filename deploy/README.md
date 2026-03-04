# Deploy / VPS – Assembly 2.0

Punto de entrada para despliegue local (Docker) y en VPS.

---

## Qué hace el Coder para deploy en Vultr VPS

**[deploy/CODER_DEPLOY_VULTR_VPS.md](CODER_DEPLOY_VULTR_VPS.md)** – Rol del Coder y pasos concretos (crear VPS, SSH, Docker, clonar repo, `.env`, levantar stack, Nginx + SSL). Válido para Vultr, Hetzner, DigitalOcean, etc.

---

## Documentación principal

| Documento | Descripción |
|-----------|-------------|
| **[Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md](../Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md)** | Instrucciones completas VPS All-in-One (Docker, Auth, Realtime, Chatbots, checklist) |
| [Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md](../Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md) | Arquitectura Docker y VPS |
| [Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md](../Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md) | Aprobación DBA y mejoras (PgBouncer, parámetros PG) |

---

## Stack

- **PostgreSQL 15** (+ PgBouncer en el doc)
- **Redis 7**
- **Next.js** (app + API)
- **Auth:** Email + OTP + JWT (self-hosted)
- **Chatbots:** Telegram, WhatsApp (opcional), Web

---

## Quick start (Docker local)

```bash
# Desde la raíz del proyecto
cp .env.example .env   # si no existe .env
# Editar .env con POSTGRES_PASSWORD, JWT_SECRET, SMTP, TELEGRAM_BOT_TOKEN, GEMINI_API_KEY

docker compose up -d postgres redis   # solo BD y Redis
# o
docker compose up -d                  # stack completo (si existen Dockerfile y servicios app/telegram)
```

**App en local (sin Docker):**

```bash
# PostgreSQL en Docker (puerto 5433), app en host
export DATABASE_URL=postgres://postgres:postgres@localhost:5433/assembly
npm run db:migrate
npm run dev
# En otra terminal: npm run chatbot
```

---

## Archivos relevantes para deploy

| Archivo | Uso |
|---------|-----|
| `docker-compose.yml` | Servicios: postgres, pgbouncer, redis, app, telegram-bot, etc. |
| `Dockerfile` | Build de la app Next.js |
| `Dockerfile.telegram` | Build del bot de Telegram |
| `.env` / `.env.example` | Variables de entorno (no subir .env a git) |
| `sql_snippets/*.sql` | Migraciones e init de BD |

---

## Variables de entorno mínimas

- `POSTGRES_USER` – Usuario de PostgreSQL (por defecto **henry**). Debe coincidir con el usuario con el que se creó la BD.
- `POSTGRES_PASSWORD`, `DATABASE_URL` – En Docker la URL usa `postgres://henry:PASSWORD@postgres:5432/assembly` (o pgbouncer según doc).
- `JWT_SECRET`, `OTP_SECRET`, `NEXTAUTH_SECRET`
- `SMTP_*` – envío de OTP
- `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY` – chatbot

**Si el VPS ya tenía el volumen de Postgres creado con usuario `postgres`:** pon en `.env` `POSTGRES_USER=postgres` y `DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/assembly`. Si quieres pasar a `henry`, haz `docker compose down -v` (borra datos), añade `POSTGRES_USER=henry` y la URL con `henry`, y `docker compose up -d` para que el init cree la BD con ese usuario.

Detalle completo en **[INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md](../Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md)** (§ Tarea 1.2).

---

## Scripts en `deploy/`

| Script | Uso |
|--------|-----|
| `deploy/up.sh` | Levanta el stack: `./deploy/up.sh` (todo) o `./deploy/up.sh postgres redis` (solo BD y Redis). |
| `deploy/backup-db.sh` | Crea un dump de PostgreSQL en `backups/assembly_YYYYMMDD_HHMMSS.sql`. |
| `deploy/.env.vps.example` | Plantilla de variables para VPS; copiar a la raíz como `.env` y rellenar. |

**Paso 3 automático (desde tu Mac, después de haber subido el proyecto con rsync):**

```bash
chmod +x deploy/paso3-deploy-vps.sh
./deploy/paso3-deploy-vps.sh
```

El script usa tu `.env` local, lo adapta para el VPS (NEXTAUTH_URL, DATABASE_URL) y sube y levanta el stack. Te pedirá la contraseña SSH del VPS.

---

Ejecutables (primera vez):

```bash
chmod +x deploy/up.sh deploy/backup-db.sh
```
