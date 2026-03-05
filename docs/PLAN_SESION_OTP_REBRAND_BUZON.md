# Plan: Sesión única, OTP por correo, Rebrand Chat Vote, Buzón correo

Resumen de lo acordado y estado de implementación.

---

## 1. Sesión única (un dispositivo por residente)

**Objetivo:** Si el residente tiene sesión abierta en web o en Telegram, no puede tener las dos a la vez. Al abrir en el otro canal, se debe consultar/cerrar la sesión anterior.

**Estado:** Pendiente.

**Enfoque sugerido:**
- Tabla `resident_sessions`: `user_id`, `channel` (web | telegram), `token_or_chat_id`, `last_activity_at`.
- Al validar por correo en web: registrar sesión `channel=web`; si ya existía `channel=telegram`, invalidar esa (el bot puede comprobar contra API y pedir "Cierra la sesión en Telegram para continuar aquí" o viceversa).
- Al validar en Telegram: registrar `channel=telegram`; si ya existía `channel=web`, la app web al hacer la siguiente petición puede devolver "Sesión cerrada: iniciaste sesión en Telegram" y forzar re-login.
- API: `GET/POST /api/chatbot/resident-session` para consultar/actualizar/cerrar sesión por email o user_id.

---

## 2. Rebrand: Assembly → Chat Vote (chatvote.click)

**Objetivo:** Dominio chatvote.click; nombre "Chat Vote" en landing y en todo el sitio; logo nuevo en landing.

**Estado:** Pendiente.

**Tareas:**
- Sustituir "Assembly 2.0" / "Assembly" por "Chat Vote" en textos de landing, chat, dashboard (manteniendo lógica interna si hace falta).
- Actualizar meta titles, descripciones y referencias al dominio chatvote.click.
- Añadir/sustituir logo en landing (asset nuevo y referencia en `page.tsx`).

---

## 3. Buzón de correo en dashboard (historial de emails)

**Objetivo:** En el dashboard (Henry / platform-admin) tener un módulo "Buzón" o "Historial de correo" para ver los correos que envía la plataforma (OTP, notificaciones, etc.).

**Estado:** Pendiente.

**Enfoque:**
- Tabla `email_log`: `id`, `to_email`, `subject`, `body_preview`, `type` (otp | power_notify | etc.), `sent_at`, `success`.
- En cada envío (OTP, poder, etc.) insertar registro.
- Nueva ruta en platform-admin: `/platform-admin/buzon` o `/platform-admin/email-log` que liste los últimos envíos con filtros.

---

## 4. OTP: modo prueba vs producción

**Objetivo:**
- **Modo prueba:** El PIN se muestra en el chat (comportamiento actual).
- **Modo producción:** El PIN de 6 dígitos se envía por correo al residente; el residente lo ingresa en el chat (web o Telegram).

**Estado:** Parcial. Hoy `OTP_DEBUG=true` hace que el PIN se devuelva en la respuesta y se muestre en chat; no se envía correo real.

**Tareas:**
1. **Enviar OTP por correo en producción:** En `request-otp`, si `OTP_DEBUG !== true` y SMTP está configurado, enviar email con el PIN de 6 dígitos (y opcionalmente registrar en `email_log`).
2. **Dashboard Henry – toggle OTP:** Módulo o página en platform-admin para activar "OTP modo prueba" (PIN en chat) vs "OTP modo producción" (PIN por correo). Puede ser:
   - Variable en `platform_secrets`: `otp_mode` = "test" | "production", y la API la lee además de `OTP_DEBUG`; o
   - Dejar solo `OTP_DEBUG` en `.env` y documentar en el dashboard que en producción pongan `OTP_DEBUG=false` y configuren SMTP.
   - Opción recomendada para no tocar .env desde UI: tabla `platform_config` o clave en `platform_secrets` (ej. `otp_mode`) leída por `request-otp` y `verify-otp`.

---

## Orden sugerido de implementación

1. OTP por correo (nodemailer + SMTP en request-otp) y registro en `email_log` si existe la tabla.
2. Crear tabla `email_log` y pantalla Buzón en platform-admin.
3. Dashboard Henry: configuración OTP prueba/producción (clave en BD).
4. Sesión única: tabla `resident_sessions` + API + lógica en chat web y bot Telegram.
5. Rebrand Chat Vote + logo landing.
