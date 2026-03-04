# Troubleshooting – Deploy VPS Assembly 2.0

## OTP: "Error al generar OTP"

Si en el login (acceso estratégico) aparece **"Error al generar OTP"**, la API está devolviendo 500. Causas habituales:

1. **Usuario no existe en la BD**  
   El correo debe estar en la tabla `users`. El script `sql_snippets/auth_otp_local.sql` inserta por defecto `henry.batista27@gmail.com` y `demo@assembly2.com`. Si la BD se creó sin ese init (p. ej. primer arranque de Postgres fallido), no existirán.

2. **Tablas `users`, `auth_pins` o `auth_attempts` no existen**  
   Se crean con `auth_otp_local.sql` en el primer arranque de Postgres. Si el contenedor `assembly-db` arrancó mal la primera vez, el volumen puede haber quedado vacío o a medias.

3. **Conexión a la BD desde la app**  
   Revisa que en el VPS el `.env` tenga `DATABASE_URL` correcto (usuario, contraseña, host `postgres`).

### Qué hacer

- **Ver el error real:** En el VPS, en el `.env` pon `OTP_DEBUG=true`, reinicia la app (`docker compose up -d app`) y vuelve a pedir el OTP. La respuesta mostrará el mensaje de error (p. ej. "relation \"users\" does not exist" o "connection refused").
- **Logs de la app:**  
  `ssh root@TU_IP "cd /opt/assembly-2-0 && docker compose logs app --tail 100"`  
  Busca la línea `Error request OTP:` y el mensaje siguiente.
- **Recrear la BD desde cero (solo si puedes perder datos):**  
  En el VPS: `docker compose down -v` (elimina volúmenes), luego `docker compose up -d`. Postgres ejecutará de nuevo todos los `sql_snippets` y creará usuarios de prueba.

---

## Telegram: bot no responde en la nube

- **Tarea pendiente:** Revisar y documentar **Telegram config en VPS** (token en `.env`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, logs del contenedor `assembly-telegram-bot`).
- El bot usa **polling**; no hace falta abrir puertos ni webhook. Basta con `TELEGRAM_BOT_TOKEN` en el `.env` del servidor.
- Si no responde:  
  `docker compose logs telegram-bot --tail 80` en el VPS y comprobar que no aparezca "TELEGRAM_BOT_TOKEN no configurado" o errores de red.
