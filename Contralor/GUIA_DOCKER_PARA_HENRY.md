# Guía Docker para Henry – Assembly 2.0

**Fecha:** Febrero 2026  
**Objetivo:** Que Henry conozca qué función tiene cada contenedor y cómo verificar que todo está correcto.

---

## Lista de contenedores (orden recomendado)

| # | Contenedor | Puerto | Función | ¿Qué hace? |
|---|------------|--------|---------|------------|
| 1 | **assembly-db** | 5433 | Base de datos | PostgreSQL 15. Guarda usuarios, organizaciones, asambleas, votaciones, OTP, leads, créditos, etc. Es el corazón de datos. |
| 2 | **assembly-pgbouncer** | 6432 | Pool de conexiones | Intermediario entre la app y PostgreSQL. Optimiza conexiones (limita cuántas conexiones simultáneas usa la app). |
| 3 | **assembly-redis** | 6379 | Cache y sesiones | Base de datos en memoria. Usada para cache, colas y sesiones. Más rápida que PostgreSQL para datos temporales. |
| 4 | **assembly-app** | **3000** | **Aplicación principal** | Next.js: landing, login, dashboard Admin PH, Platform Admin (Henry), APIs, chatbot residente en la web. **URL:** http://localhost:3000 |
| 5 | **assembly-telegram-bot** | 3001 | Chatbot Telegram | Bot que atiende a residentes por Telegram. Usa Gemini para respuestas inteligentes. Requiere `TELEGRAM_BOT_TOKEN`. |
| 6 | **assembly-whatsapp-bot** | 3002 | Chatbot WhatsApp | Bot para WhatsApp (fase posterior). Requiere `WHATSAPP_*` en .env. Puede estar activo aunque no configurado. |
| 7 | **assembly-web-chatbot** | 3003 | Chatbot web embebido | Servicio del chatbot Lex que se embebe en iframes o widgets externos. Usa Gemini. Requiere `GEMINI_API_KEY`. |

---

## Resumen rápido para Henry

| Contenedor | En una frase |
|------------|--------------|
| assembly-db | La base de datos donde se guarda todo |
| assembly-pgbouncer | Ayuda a la BD a manejar muchas conexiones |
| assembly-redis | Cache rápido (como memoria temporal) |
| **assembly-app** | **La app web que usas – landing, dashboards, login** |
| assembly-telegram-bot | Lex por Telegram |
| assembly-whatsapp-bot | Lex por WhatsApp (en preparación) |
| assembly-web-chatbot | Lex embebido en otras páginas web |

---

## URLs importantes

| Servicio | URL |
|----------|-----|
| App principal (landing, login, dashboards) | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Demo | http://localhost:3000/demo |
| Platform Admin (Henry) | http://localhost:3000/dashboard/platform-admin |
| Dashboard Admin PH | http://localhost:3000/dashboard/admin-ph |
| Chatbot residentes | http://localhost:3000/residentes/chat |

---

## Comandos útiles

```bash
# Ver estado de todos los contenedores
docker compose ps

# Levantar todo
docker compose up -d

# Ver logs de la app principal
docker compose logs -f app

# Reiniciar solo la app
docker compose restart app

# Parar todo
docker compose down
```

---

## Arranque automático de contenedores

Los contenedores tienen **restart: unless-stopped**: al iniciar Docker Desktop (o el PC), deberían arrancar solos.  
**Si no arrancaron solos** es porque fueron creados antes de tener esa política. Hay que **recrearlos una vez**:

```bash
# Desde la raíz del proyecto (donde está docker-compose.yml)
docker compose up -d --force-recreate
```

O ejecutar el script incluido en el proyecto:

```bash
chmod +x start-assembly.sh
./start-assembly.sh
```

Después de eso, al cerrar y volver a abrir Docker Desktop, los contenedores deberían levantarse automáticamente.

---

## Recomendación: Quitar assembly-web (no existe en el stack actual)

**assembly-web** NO está en el docker-compose del repo (GitHub). En el `docker-compose.yml` solo existen: assembly-app, assembly-web-chatbot, etc. — no hay servicio llamado "assembly-web".

- Si ves **assembly-web** en Docker Desktop, es un contenedor **local** (de una versión antigua o de otra prueba en tu máquina). **No tiene que ver con GitHub** ni con el código actual.
- **Se recomienda eliminarlo** en Docker Desktop para no confundir. No afecta la app actual (assembly-app).
- **Quién lo quita:** Tú (Henry), en tu máquina. Es un contenedor local; el Coder no puede borrarlo (no está en el código). En Docker Desktop: clic derecho en el contenedor "assembly-web" → Remove/Delete. O en terminal: `docker rm -f assembly-web` (si aparece al hacer `docker ps -a`).
- **No hace falta preguntar al Coder:** el archivo `docker-compose.yml` del proyecto ya lo confirma (no existe assembly-web).

---

**Referencia:** docker-compose.yml, Contralor/VALIDACION_DOCKER_Y_OTP.md
