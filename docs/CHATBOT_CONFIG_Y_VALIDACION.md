# Configuración y validación del chatbot (Web y Telegram)

**Referencia:** Panel `/platform-admin/chatbot-config` (Dashboard Henry).

---

## 1. Dónde se configura

- **Panel:** Entra como Admin Plataforma (Henry) → **Configuración Chatbot** (`/platform-admin/chatbot-config`).
- **Base de datos:** La configuración se guarda en la tabla `chatbot_config` (prompts, modelo IA, temperatura, max_tokens, activo/pausado por cada bot: `web`, `telegram`, `whatsapp`).
- **Variables de entorno:**
  - `TELEGRAM_BOT_TOKEN`: token del bot de Telegram (obligatorio para que el bot Telegram funcione).
  - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`: usuario del bot (ej. `Assembly2Bot`) para mostrar el enlace **t.me/Usuario** en el panel y compartirlo.
  - `NEXT_PUBLIC_APP_VERSION`: texto visible en el panel (ej. `0.1.0-test`, `production`).
  - `GEMINI_API_KEY`: para respuestas con IA (si aplica).

---

## 2. Cómo validar la configuración

### Chatbot Web
1. En el panel, en **Enlaces para compartir y validar**, usa **Abrir** o **Copiar** del enlace "Chatbot Web (landing)".
2. Abre la URL en el navegador (ej. `http://localhost:3000/`).
3. Abre el chatbot (botón/flotante Lex) y comprueba que el mensaje inicial y los botones de navegación coinciden con lo configurado en el panel (prompt **landing** del bot **web**).

### Chatbot Telegram
1. Configura `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` en `.env` (ej. `Assembly2Bot`).
2. En el panel, usa el enlace **Telegram** (Abrir o Copiar) → `https://t.me/TuBotUsuario`.
3. Abre Telegram, inicia conversación con el bot y envía `/start`. Debe responder con el mensaje del prompt **landing** del bot **telegram** (y estar **Activo** en el panel).

---

## 3. Enlaces para compartir

Los enlaces se muestran y copian desde el propio panel:

| Canal   | Dónde se usa | Enlace |
|--------|----------------|--------|
| **Web** | Landing donde está el widget del chatbot | `{ORIGEN}/` (ej. `https://tudominio.com/`) |
| **Telegram** | Bot de Telegram | `https://t.me/{NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}` |

- **ORIGEN** en Web es la URL actual del sitio (en local: `http://localhost:3000`, en producción: tu dominio).
- Para Telegram, el usuario del bot se obtiene en [@BotFather](https://t.me/BotFather) al crear el bot o en la configuración; debe coincidir con `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`.

---

## 4. Versión test visible en configuraciones

En la página **Configuración de Chatbots** se muestra un badge **Versión: {valor}**.

- El valor sale de la variable de entorno **`NEXT_PUBLIC_APP_VERSION`**.
- Ejemplos: `0.1.0-test`, `development`, `production`.
- Si no está definida, se muestra **test** por defecto.

Configura en `.env` o `.env.local`:

```bash
NEXT_PUBLIC_APP_VERSION=0.1.0-test
```

Tras cambiar variables `NEXT_PUBLIC_*`, hay que volver a construir/arrancar la app para que se actualicen en el navegador.
