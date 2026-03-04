# Chatbot, Gemini y Telegram en el VPS

## Cómo validar que el chatbot está conectado

1. **Landing (Lex en la web)**  
   - Entra a `http://TU_IP:3000`, abre el chatbot (botón "Agendar demo con Lex").  
   - Si ves el saludo de Lex y puedes elegir perfil (Administrador PH, Junta, demo), el chatbot de la landing está conectado.

2. **Dashboard Henry (Panel Admin)**  
   - Entra a `http://TU_IP:3000/login` con tu correo admin (ej. henry.batista27@gmail.com).  
   - Ve a **Chatbot** (menú Henry).  
   - En la pestaña **Tokens**: si ves "Telegram: configurado" y "Gemini: configurado", la app está leyendo los tokens (desde `.env` o desde la tabla `platform_secrets`).

3. **Telegram**  
   - Abre Telegram y escribe a tu bot (el @ que configuraste en BotFather).  
   - Envía "Hola" o /start. Si el bot responde, el contenedor `assembly-telegram-bot` está conectado y usando el token.

---

## Por qué el dashboard no reconoce la configuración o los tokens

La app (Next.js) y el bot de Telegram leen los tokens así:

- **Primero** desde la base de datos: tabla `platform_secrets` (si Henry guarda tokens desde el panel).  
- **Si no hay nada en la BD**, desde las variables de entorno del contenedor.

En el **VPS** los contenedores solo ven las variables que declara el `docker-compose`. Si no se pasan `TELEGRAM_BOT_TOKEN` y `GEMINI_API_KEY` al servicio **app**, el dashboard y las APIs (estado de Telegram, validación de Gemini) no verán los tokens aunque estén en el `.env` del servidor.

**Qué se hizo en el proyecto**

- En `docker-compose.yml` el servicio **app** ahora incluye:
  - `TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}`
  - `GEMINI_API_KEY: ${GEMINI_API_KEY}`
  - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: ${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:-}`

Así, el mismo `.env` que usa el bot de Telegram (y que ya tenías en el VPS) lo usa también la app: el dashboard puede mostrar "configurado" y las APIs de chatbot funcionan igual que en local.

**Qué revisar en el VPS**

1. En el servidor, en `/opt/assembly-2-0/.env`, que existan:
   - `TELEGRAM_BOT_TOKEN=...` (token de BotFather)
   - `GEMINI_API_KEY=...` (API key de Google AI)
   - (Opcional) `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=TuBot` (sin @)

2. Subir el `docker-compose.yml` actualizado y reiniciar la app (y si quieres el bot también):
   ```bash
   # En la Mac
   scp docker-compose.yml root@TU_IP:/opt/assembly-2-0/
   ssh root@TU_IP "cd /opt/assembly-2-0 && docker compose up -d app"
   # Opcional: reiniciar también el bot para que cargue el mismo .env
   ssh root@TU_IP "cd /opt/assembly-2-0 && docker compose restart telegram-bot"
   ```

3. Volver a abrir el dashboard Henry → Chatbot → Tokens y comprobar que aparezca Telegram y Gemini como configurados.

---

## Resumen: qué cambiar entre Docker local y VPS

| Dónde        | Qué hacer |
|-------------|-----------|
| **Local**   | `.env` con `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`; `docker compose up`. La app y el bot leen ese `.env`. |
| **VPS**     | Mismo `.env` en `/opt/assembly-2-0/.env` (o el que use tu deploy). El `docker-compose.yml` debe pasar esas variables al servicio **app** y al **telegram-bot** (ya está así en el repo). Tras cambiar `.env` o el compose: `docker compose up -d` (o al menos `restart app` y `restart telegram-bot`). |

No hace falta otra configuración específica para Gemini o Telegram en el VPS: mismos nombres de variable que en local, mismo flujo (BD opcional + env).
