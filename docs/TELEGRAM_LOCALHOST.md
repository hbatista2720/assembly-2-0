# Conectar Telegram en localhost

Sí se puede. El bot usa **polling** (no webhooks), así que tu máquina se conecta a Telegram y no necesitas URL pública.

---

## Pasos

### 1. Obtener el token del bot

Tu bot es **@AssemblyPH_bot**. Si ya lo creaste en [@BotFather](https://t.me/BotFather):

1. Abre Telegram y busca `@BotFather`
2. Envía `/mybots`
3. Selecciona **Assembly 2.0** (o el bot que creaste)
4. **API Token** → copia el token (ej. `123456789:ABCdefGHI...`)

Si no tienes token, en BotFather envía `/newbot` y sigue los pasos.

---

### 2. Configurar `.env`

Crea o edita `.env` en la raíz del proyecto:

```env
# Token del bot (obligatorio para que responda)
TELEGRAM_BOT_TOKEN=123456789:ABCdef...tu-token-de-BotFather

# Usuario del bot (sin @) para el enlace t.me/AssemblyPH_bot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=AssemblyPH_bot

# Base de datos (el bot lee chatbot_config)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/assembly
```

---

### 3. Base de datos

**Si el bot no responde a /start**, ejecuta:

```bash
psql -d assembly -f sql_snippets/chatbot_config_fix.sql
```

O si usas otra base/puerto (revisa tu `DATABASE_URL` en .env):

```bash
psql postgres://postgres:postgres@localhost:5432/assembly -f sql_snippets/chatbot_config_fix.sql
```

Esto crea la tabla `chatbot_config` si no existe y activa el bot `telegram`. **PostgreSQL debe estar corriendo** (Docker, Homebrew, etc.).

---

### 4. Ejecutar en localhost

Necesitas **dos terminales**:

**Terminal 1 – App web:**
```bash
npm run dev
```

**Terminal 2 – Bot de Telegram:**
```bash
npm run chatbot
```

O en modo desarrollo (reinicia al cambiar código):
```bash
npm run chatbot:dev
```

Si todo está bien verás:
```
🤖 Chatbot Assembly 2.0 iniciado con éxito!
```

---

### 5. Probar

1. Abre Telegram
2. Busca **@AssemblyPH_bot** (o tu bot)
3. Envía `/start`
4. El bot debería responder con el mensaje de bienvenida

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "Chatbot temporalmente desactivado" | Ejecuta `sql_snippets/chatbot_config_fix.sql` |
| El bot no responde a /start | 1) PostgreSQL debe estar activo. 2) Ejecuta `chatbot_config_fix.sql`. 3) Reinicia `npm run chatbot` |
| Connection refused (psql) | Inicia PostgreSQL (ej. `brew services start postgresql` o `docker start` si usas Docker) |
| Validar token | En `/platform-admin/chatbot-config`, sección Telegram: badge "✓ @AssemblyPH_bot" = válido. Botón "Verificar" revalida. API `GET /api/chatbot/telegram-status` llama a Telegram getMe. |
| Error de conexión a BD | Comprueba `DATABASE_URL` y que PostgreSQL esté corriendo |
| Token inválido | Genera uno nuevo en @BotFather con `/token` |

---

## Resumen

- **Polling:** el bot hace peticiones a Telegram cada cierto tiempo → funciona en localhost.
- **Webhooks:** Telegram haría peticiones a tu servidor → no sirve en localhost sin ngrok u otra herramienta.

Este proyecto usa polling, por eso funciona en localhost.
