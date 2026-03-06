# Correo para OTP: desde la VPS o Resend

La app envía OTP y notificaciones por correo usando **SMTP** (nodemailer). Puedes usar SMTP desde la VPS o el relay de **Resend**; en ambos casos se configuran variables de entorno.

---

## Opción A: Resend (recomendado para empezar)

**Ventajas:** Buena llegada a bandeja, plan gratuito (p. ej. 3.000 emails/mes), sin instalar nada en la VPS, dominio verificado opcional.

1. Regístrate en [resend.com](https://resend.com) y crea una **API Key**.
2. Resend ofrece **SMTP**: no hace falta cambiar código, solo el `.env` de la VPS.

En la VPS, en el `.env` del proyecto:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxx  # Tu API Key de Resend
SMTP_FROM=onboarding@resend.dev
```

Para enviar desde **tu dominio** (ej. `noreply@chatvote.click`): en el dashboard de Resend añades el dominio, configuras los DNS que te indiquen (SPF, DKIM) y luego pones:

```env
SMTP_FROM=noreply@chatvote.click
```

Reinicia la app tras cambiar `.env`:  
`docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app`

---

## Opción B: SMTP desde la VPS (Gmail, SendGrid, etc.)

El código ya está preparado: solo necesitas **cualquier** servidor SMTP con usuario y contraseña.

### Gmail (rápido para pruebas)

- Crea una “Contraseña de aplicación” en tu cuenta Google (seguridad → verificación en 2 pasos → contraseñas de aplicación).
- En `.env` de la VPS:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM=tu-email@gmail.com
```

Límites: ~500 correos/día; en producción suele ser mejor un servicio dedicado.

### SendGrid / Mailgun

- Creas una API Key en SendGrid o Mailgun y usas su SMTP (host, puerto, user, pass que te den).
- Ejemplo SendGrid (ya en `.env.example`):  
  `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`, `SMTP_USER=apikey`, `SMTP_PASS=SG.xxxx`.

### Postfix en la VPS

- Instalar y configurar Postfix en el servidor y usar `SMTP_HOST=localhost` (o `127.0.0.1`), con usuario/contraseña si lo tienes configurado.
- Desventaja: el IP de la VPS suele tener mala reputación; muchos proveedores bloquean o envían a spam si no configuras SPF/DKIM y un dominio propio.

---

## Resumen

| Opción        | Configuración      | Llegada a bandeja | Límites / costo   |
|---------------|--------------------|--------------------|--------------------|
| **Resend**    | API Key → SMTP en .env | Muy buena          | Plan gratis generoso |
| **Gmail**     | App password en .env   | Buena              | ~500/día           |
| **SendGrid**  | API Key → SMTP en .env | Muy buena          | Plan gratis limitado |
| **Postfix VPS** | Postfix + .env      | Variable (IP/dominio) | Sin costo extra   |

Recomendación: usar **Resend** con su SMTP (mismas variables `SMTP_*` que ya usa la app) y, cuando quieras, verificar el dominio `chatvote.click` para enviar desde `noreply@chatvote.click`.
