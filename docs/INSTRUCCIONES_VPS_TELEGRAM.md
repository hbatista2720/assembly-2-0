# Instrucciones VPS – Telegram y chatbot

Resumen de los pasos recientes para que no se borren.

---

## 1. Crear la tabla `chatbot_config` (si falta)

Si en **Configuración del Chatbot** sale: *"La tabla chatbot_config no existe"* y el botón **Inicializar canales** no funciona:

En la VPS, por SSH:

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/chatbot_config.sql
```

(Usa `-U postgres`; en esa BD el usuario es `postgres`, no `henry`.)

Luego en el navegador recarga la página de configuración del chatbot (**⌘ + R** en Mac).

---

## 2. Si al dar /start en Telegram sale "Error de conexión"

Ese mensaje aparece cuando el bot no puede enviar el mensaje de bienvenida. Revisa:

1. **Token**  
   En la VPS, en `.env`: `TELEGRAM_BOT_TOKEN` debe ser el del mismo bot que abres en Telegram (el de @BotFather).

2. **Reiniciar el bot después de cambiar .env**  
   ```bash
   cd /opt/assembly-2-0
   docker compose restart telegram-bot
   ```

3. **Ver el error real en los logs**  
   ```bash
   docker logs assembly-telegram-bot --tail 50
   ```  
   Busca: `[Telegram] Error enviando mensaje /start:` o `Fallback también falló:`.

4. **Red**  
   La VPS debe poder conectar a `api.telegram.org` (puerto 443). Si hay firewall, permitir salida HTTPS.

---

## 3. Actualizar el código en la VPS

Desde tu Mac (o donde tengas el repo):

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
git add .
git commit -m "Actualizar chatbot y docs"
git push origin main
```

En la VPS:

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
git pull origin main
docker compose build --no-cache app telegram-bot
docker compose up -d postgres pgbouncer redis app telegram-bot
```

(Si el build de `app` falla por memoria, en el Dockerfile ya está `NODE_OPTIONS=--max-old-space-size=4096`; si sigue fallando, revisa los logs del build.)

---

## 4. Recargar la página en Mac

Para recargar la página en el navegador: **⌘ + R** (Command + R). No se usa F5 en Mac.

---

## 5. Si el bot falla con "Cannot find module '@lib/db'"

Ese error sale cuando el contenedor del bot corre con `ts-node` y no resuelve el alias `@lib`. En el código ya está corregido: el chatbot usa la ruta relativa `../lib/db` en lugar de `@lib/db`.

Tras hacer **git pull** en la VPS, hay que **reconstruir** la imagen del bot y volver a levantarlo:

```bash
cd /opt/assembly-2-0
git pull origin main
docker compose build --no-cache telegram-bot
docker compose up -d telegram-bot
```

Comprobar que arrancó bien:

```bash
docker logs assembly-telegram-bot --tail 15
```

Deberías ver: `Chatbot Assembly 2.0 iniciado con éxito!` (y no el error de módulo).
