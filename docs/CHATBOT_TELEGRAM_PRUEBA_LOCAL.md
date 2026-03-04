# Probar el bot de Telegram en local (Docker + terminal)

Cuando ves **"Error de conexión"** o **"Error al verificar"** después de `/start` o al enviar tu correo, suele ser porque el bot no alcanza la base de datos o la app. Sigue estos pasos.

---

## Opción A: Todo en terminal (sin Docker para el bot)

1. **Base de datos**  
   Sube solo Postgres (o usa tu Postgres local):
   ```bash
   docker compose up -d postgres
   # o: docker compose up -d postgres pgbouncer
   ```

2. **Variables de entorno**  
   En la raíz del proyecto, archivo `.env`:
   ```env
   DATABASE_URL=postgres://henry:postgres@localhost:5433/assembly
   TELEGRAM_BOT_TOKEN=tu_token_de_BotFather
   GEMINI_API_KEY=o
   GROQ_API_KEY=tu_clave_groq
   CHATBOT_API_URL=http://localhost:3000
   ```
   (Ajusta `DATABASE_URL` si tu Postgres usa otro puerto o usuario.)

3. **Terminal 1 – App**  
   ```bash
   npm run dev
   ```
   Debe quedar en `http://localhost:3000`.

4. **Terminal 2 – Bot**  
   ```bash
   npm run chatbot
   ```
   Debe aparecer algo como: `Chatbot Assembly 2.0 iniciado con éxito!`

5. **Probar en Telegram**  
   - Envía `/start`.  
   - Deberías ver el mensaje de Lex pidiendo tu correo.  
   - Envía `residente2@demo.assembly2.com` (o un usuario que exista en `users`).  
   - La verificación se hace contra la app (`CHATBOT_API_URL`), así que la app debe estar levantada.

---

## Opción B: Todo con Docker (app + bot en contenedores)

1. **Variables**  
   En `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=...
   GEMINI_API_KEY=...
   GROQ_API_KEY=...
   # Opcional; por defecto el bot usa http://app:3000
   # CHATBOT_API_URL=http://app:3000
   ```

2. **Levantar servicios**  
   ```bash
   docker compose up -d postgres pgbouncer redis app telegram-bot
   ```

3. **Comprobar**  
   - App: `http://localhost:3000`  
   - El bot usa `CHATBOT_API_URL=http://app:3000` (valor por defecto en `docker-compose`) para verificar usuario e IA.

4. **Usuario de prueba**  
   El usuario `residente2@demo.assembly2.com` debe existir en la tabla `users` de la BD que usa la app (misma que usa el contenedor `app`).

---

## Resumen

| Dónde corre el bot | Qué necesita |
|--------------------|-------------|
| **Terminal** (`npm run chatbot`) | App corriendo (`npm run dev`), mismo `.env` con `DATABASE_URL` y `CHATBOT_API_URL=http://localhost:3000`. |
| **Docker** (`telegram-bot`) | Servicio `app` levantado; por defecto usa `http://app:3000`. Misma BD para app y migraciones. |

Tras los cambios recientes, si el bot no puede conectar a la BD en `/start`, **aun así** te mostrará el mensaje de Lex pidiendo tu correo. Al enviar el correo, la verificación la hace la **app** vía API; si la app tiene BD correcta y el usuario existe, debería identificarte sin "Error al verificar".
