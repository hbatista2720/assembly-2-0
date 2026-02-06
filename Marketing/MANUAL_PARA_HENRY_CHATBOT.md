# Manual para Henry: Conectar y activar los chatbots (Web y Telegram)

**Dónde hacer todo:** Dashboard Admin Plataforma → **Configuración de Chatbots** (`/platform-admin/chatbot-config`).

---

## Cómo activar o probar el chatbot Web

1. Entra a **Configuración de Chatbots** (sidebar: 🤖 Configuración Chatbot).
2. En la sección **Enlaces para compartir y validar**, busca **Chatbot Web (landing)**.
3. Pulsa **«Probar ahora (abre ventana del chatbot)»**  
   → Se abre una **nueva pestaña** con la landing y el **chatbot ya abierto** para que puedas probar sin dar clic al botón Lex.
4. Si quieres solo la landing (y abrir el chatbot tú mismo), usa **«Solo landing»**.
5. Para compartir el enlace con alguien, usa **«Copiar»** y pega la URL donde quieras.

**Activar/desactivar el chatbot web:** En la misma página, en la lista de chatbots, elige **web** y usa el botón **Desactivar web** / **Activar web**. Los cambios se guardan en la base de datos.

---

## Cómo conectar el chatbot de Telegram

Para que el enlace de Telegram aparezca y funcione:

1. **Crea o usa un bot en Telegram**  
   - Abre [@BotFather](https://t.me/BotFather) en Telegram.  
   - Crea un bot nuevo con `/newbot` o usa uno que ya tengas.  
   - Anota el **token** que te da BotFather y el **usuario del bot** (ej. `Assembly2Bot`).

2. **Configura las variables en el servidor**  
   En el archivo `.env` o `.env.local` del proyecto (el Coder o quien tenga acceso al servidor debe añadirlas):

   ```bash
   TELEGRAM_BOT_TOKEN=el_token_que_te_dio_BotFather
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Assembly2Bot
   ```

   Sustituye `Assembly2Bot` por el usuario real de tu bot (sin `@`).

3. **Reinicia la aplicación**  
   Para que el bot de Telegram use el token y la web muestre el enlace, hay que reiniciar la app (o volver a desplegar).

4. **En Configuración de Chatbots**  
   - Deberías ver el enlace **Telegram** con `https://t.me/TuBotUsuario`.  
   - Usa **Abrir** para ir a Telegram y probar el bot, o **Copiar** para compartir el enlace.

**Activar/desactivar el bot Telegram:** En la lista de chatbots, elige **telegram** y **Activar telegram** / **Desactivar telegram**. El bot solo responde cuando está activo en el panel.

---

## Versión test en configuraciones

En la parte superior de **Configuración de Chatbots** verás una etiqueta tipo **«Versión: test»** (o el valor que esté configurado).

- **No es un botón:** es un indicador de versión o entorno (test, producción, etc.).
- El valor se define en el servidor con la variable `NEXT_PUBLIC_APP_VERSION` (ej. `0.1.0-test`). Si no está definida, se muestra **test**.
- Sirve para saber en qué entorno estás (pruebas vs producción).

---

## Cómo hacer pruebas

| Qué quieres probar | Qué hacer |
|--------------------|-----------|
| **Chatbot web**    | En Configuración de Chatbots → **«Probar ahora (abre ventana del chatbot)»**. Se abre una pestaña con la landing y el chatbot ya abierto. |
| **Solo ver la landing** | Usa **«Solo landing»** y, en la página, haz clic en el botón de Lex para abrir el chatbot. |
| **Chatbot Telegram** | Conecta el bot (pasos de arriba), luego en el panel usa **Abrir** en el enlace Telegram y en la app de Telegram envía `/start` a tu bot. |

Si algo no funciona (web o Telegram), revisa que en el panel el chatbot esté **Activo** y que los cambios estén **Guardados** (botón «Guardar cambios» al editar prompts o parámetros).

---

## Resumen rápido

- **Web:** Entra a Configuración Chatbot → **«Probar ahora (abre ventana del chatbot)»** para abrir la ventana del chatbot y hacer pruebas.
- **Telegram:** Pon `TELEGRAM_BOT_TOKEN` y `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` en `.env`, reinicia la app, y en el panel usa el enlace Telegram para abrir o copiar.
- **Versión test:** Es la etiqueta «Versión: test» (o similar) arriba; no es un botón, solo indica el entorno.

Más detalle técnico: `docs/CHATBOT_CONFIG_Y_VALIDACION.md`.
