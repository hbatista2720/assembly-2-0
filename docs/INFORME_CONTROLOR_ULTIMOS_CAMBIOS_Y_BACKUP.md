# Informe al Contralor – Últimos cambios y solicitud de backup

**Fecha:** 5 de marzo de 2026  
**Destinatario:** Contralor  
**Asunto:** Resumen de cambios recientes y solicitud de backup

---

## 1. Resumen de los últimos cambios

### Rebrand Assembly 2.0 → ChatVote
- **Landing y dominio:** Textos y títulos actualizados a **ChatVote.click** y **ChatVote · Ley 284** en:
  - Header y footer de la landing (`src/app/page.tsx`)
  - Título y descripción del sitio (`src/app/layout.tsx`)
  - Páginas de login y demo
  - Calculadora de ahorro, testimonios, precios, FAQ
- **Dashboards:** Sidebar y mensajes en Admin PH y Platform Admin (Dashboard Henry) cambiados de "Assembly 2.0" a **ChatVote**.
- **APIs y configuración:** Prompts por defecto del chatbot, checkout, CRM, pasarelas y monitor de asamblea actualizados a **ChatVote**.

### Infraestructura y despliegue (VPS)
- **Nginx** configurado en la VPS para que **http://chatvote.click** (puerto 80) redirija al puerto 3000 de la app.
- **Dominio:** chatvote.click resuelve a la IP de la VPS (45.63.104.7); el sitio responde en http://chatvote.click/.
- **Contenedores esenciales en VPS:** postgres, pgbouncer, redis, app, telegram-bot.

### Acceso y documentación
- **Dashboard Henry (platform admin):** Documentado en `docs/ACCESO_DASHBOARD_HENRY.md`. Acceso con `henry.batista27@gmail.com` vía login OTP (usuario debe existir en BD con rol `ADMIN_PLATAFORMA`).
- **Login:** Al iniciar sesión como platform admin se guarda `assembly_platform_admin` en localStorage para que la ruta `/dashboard` redirija correctamente al dashboard Henry.

### Logo e iconos
- El **texto** del header (nombre y tagline) está en código y ya muestra ChatVote.click / ChatVote · Ley 284.
- La **imagen** del logo (`/brand/logo.v5.png`) sigue siendo el archivo actual; si en la imagen aparece “Assembly 2.0”, debe sustituirse por un nuevo asset de ChatVote cuando se disponga de él.

---

## 2. Archivos y rutas relevantes modificados

- `src/app/page.tsx` – Landing (header, footer, textos)
- `src/app/layout.tsx` – Metadata del sitio
- `src/app/login/page.tsx` – Redirección platform admin y localStorage
- `src/app/dashboard/admin-ph/AdminPhShell.tsx` – Sidebar y mensaje demo
- `src/app/platform-admin/PlatformAdminShell.tsx` – Sidebar
- `src/app/api/chatbot/config/route.ts` – Prompts por defecto
- `src/app/checkout/page.tsx`, `src/app/platform-admin/crm/page.tsx`, `src/app/platform-admin/payment-config/page.tsx`, `src/app/dashboard/admin-ph/monitor/[assemblyId]/page.tsx` – Textos ChatVote
- `docs/ACCESO_DASHBOARD_HENRY.md` – Guía de acceso al dashboard Henry
- Configuración Nginx en VPS: `/etc/nginx/sites-available/chatvote` (proxy a puerto 3000)

---

## 3. Solicitud de backup

Se solicita al **Contralor** que se realice un **backup** del estado actual del proyecto, incluyendo:

1. **Código:** Commit (o tag) en el repositorio Git con los últimos cambios (rebrand ChatVote, Nginx, docs) y, si aplica, copia/archivo del repositorio.
2. **Base de datos (VPS):** Volcado de la base de datos de producción (por ejemplo `pg_dump`) y almacenamiento en lugar seguro.
3. **Configuración VPS:** Copia de seguridad de archivos críticos (p. ej. `/etc/nginx/sites-available/chatvote`, variables de entorno usadas en producción, si están en archivos).

Indicar fecha del backup y dónde queda almacenado para futuras referencias o restauraciones.

---

## 4. Contacto y siguientes pasos

- Para desplegar los últimos cambios de código en la VPS: en el servidor, `git pull origin main`, luego `docker compose build --no-cache app telegram-bot` y `docker compose up -d postgres pgbouncer redis app telegram-bot`.
- Para dudas sobre acceso al dashboard Henry o flujo OTP, ver `docs/ACCESO_DASHBOARD_HENRY.md`.

---

*Documento generado para registro del Contralor. Favor confirmar recepción y ejecución del backup.*
