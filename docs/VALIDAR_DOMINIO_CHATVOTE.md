# Validar que todo apunte al dominio chatvote.click

Checklist para que la plataforma use el dominio nuevo **chatvote.click** en lugar de la IP.

---

## 1. DNS (ya lo tienes)

- Registro **A** `@` → IP del VPS (ej. 45.63.104.7).
- Opcional: **CNAME** `www` → `chatvote.click`.

Comprobar desde tu Mac:

```bash
ping chatvote.click
# debe responder la IP del VPS
```

---

## 2. Servidor web (Nginx) en la VPS

- Nginx escuchando en 80 (y 443 con SSL) con `server_name chatvote.click www.chatvote.click`.
- `proxy_pass` a `http://127.0.0.1:3000` (donde corre la app con Docker).

Ver guía en la conversación anterior (Nginx + opcional Certbot para HTTPS).

---

## 3. Variables de entorno en la VPS (`/opt/assembly-2-0/.env`)

Deben usar el dominio, no la IP:

```env
NEXT_PUBLIC_APP_URL=https://chatvote.click
NEXTAUTH_URL=https://chatvote.click
CHATBOT_API_URL=http://app:3000
```

- Si aún no tienes HTTPS: `http://chatvote.click` (sin :3000 si Nginx hace proxy en 80).
- Tras cambiar `.env`: `docker compose restart app telegram-bot`.

---

## 4. Enlaces y correos

- La app usa `NEXT_PUBLIC_APP_URL` para enlaces en correos OTP y notificaciones.
- `sendEmail` y el bot usan el nombre **Chat Vote** (NEXT_PUBLIC_APP_NAME si lo defines).

---

## 5. Comprobar en el navegador

- Abrir `https://chatvote.click` (o `http://chatvote.click` si no hay SSL aún).
- Login con OTP y resident chat deben cargar sin redirigir a la IP.
- Si NextAuth redirige a la IP, revisa que `NEXTAUTH_URL` sea exactamente `https://chatvote.click` (mismo protocolo y host).
