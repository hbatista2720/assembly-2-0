# Validación Docker y Login OTP – Para Base de Datos y QA

**Fecha:** Febrero 2026  
**Objetivo:** Confirmar que Docker está activo para probar todas las fases y validar dónde se guarda el OTP y cómo visualizarlo.

---

## 0. Corrección PgBouncer aplicada (Coder)

Se aplicó **Database_DBA/INSTRUCCIONES_CODER_PGBOUNCER_AUTH.md** (Opción A): script `sql_snippets/99_pgbouncer_md5_compat.sql` para compatibilidad md5 PgBouncer↔PostgreSQL.  
**Si la BD ya existía**, antes de validar hay que recrear el volumen de Postgres para que el init ejecute el script (ver sección 4 del documento DBA). Luego **QA re-ejecuta** la validación del flujo OTP que se describe abajo.

---

## 1. Levantar Docker

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
docker compose up -d
```

**Servicios:**

| Servicio       | Contenedor        | Puerto | Uso                    |
|----------------|-------------------|--------|------------------------|
| postgres       | assembly-db      | 5433   | BD (PostgreSQL 15)     |
| pgbouncer      | assembly-pgbouncer | 6432 | Pool de conexiones     |
| redis          | assembly-redis   | 6379   | Cache/sesiones         |
| app            | assembly-app     | 3000   | Next.js (login, APIs)  |
| telegram-bot   | assembly-telegram-bot | -  | Chatbot Telegram       |
| web-chatbot    | assembly-web-chatbot  | 3003 | Chatbot web            |

**Verificar que estén activos:**

```bash
docker compose ps
```

Todos deben estar `Up` (o `running`). La app se prueba en **http://localhost:3000**.

---

## 2. Dónde se guarda el OTP

El OTP se **guarda en la base de datos** dentro del contenedor PostgreSQL.

- **Tabla:** `auth_pins`
- **Script que crea la tabla:** `sql_snippets/auth_otp_local.sql` (se ejecuta al iniciar el contenedor por primera vez, vía `docker-entrypoint-initdb.d`).

**Estructura relevante:**

```sql
auth_pins (
  id UUID,
  user_id UUID,        -- referencia a users(id)
  pin VARCHAR(6),      -- el código OTP de 6 dígitos
  used BOOLEAN,        -- true después de verificar
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

**Flujo:**

1. Usuario pide código en `/login` → `POST /api/auth/request-otp` con `{ "email": "..." }`.
2. La API genera un OTP de 6 dígitos, hace `INSERT` en `auth_pins` y (si SMTP está configurado) puede enviarlo por correo.
3. Usuario ingresa el código → `POST /api/auth/verify-otp` con `{ "email", "code" }`.
4. La API busca en `auth_pins` un registro con ese `pin`, no usado y no expirado; si existe, marca `used = TRUE` y devuelve el usuario.

**Mensaje para agente Base de Datos:** La tabla `auth_pins` en PostgreSQL (contenedor `assembly-db`) es la única persistencia del OTP. No se guarda en Redis ni en archivos. El esquema y seed inicial vienen de `sql_snippets/auth_otp_local.sql`. Todo OK para validar que el login OTP depende solo de esta BD.

---

## 3. Cómo ver el OTP en Docker (tres formas)

### Opción A – En la respuesta de la API (recomendado para pruebas)

Con **OTP_DEBUG=true** (ya configurado por defecto en `docker-compose` para el servicio `app`):

- La API **devuelve** el OTP en el JSON: `{ "success": true, "otp": "123456", "message": "Código enviado" }`.
- La página de login **muestra** ese código en pantalla (texto “Código enviado (modo local): **123456**”).

Pasos:

1. Ir a http://localhost:3000/login
2. Ingresar un email de prueba (ej. `demo@assembly2.com` o `henry.batista27@gmail.com`).
3. Enviar código.
4. El código aparece debajo del campo del OTP (solo si el backend envía `otp` en la respuesta, es decir con `OTP_DEBUG=true`).

### Opción B – En los logs del contenedor de la app

Cada vez que se genera un OTP, la API hace:

`console.log(\`[OTP] Email=... OTP=...\`)`

Para verlo:

```bash
docker compose logs -f app
```

Pedir un código desde el navegador y en la salida aparecerá algo como:

`[OTP] Email=demo@assembly2.com OTP=482917`

### Opción C – Consultando la base de datos (PostgreSQL)

Entrar al contenedor de Postgres y listar los últimos códigos (sin necesidad de ver logs ni respuesta de la API):

```bash
docker compose exec postgres psql -U postgres -d assembly -c "
  SELECT ap.pin, ap.used, ap.expires_at, u.email
  FROM auth_pins ap
  JOIN users u ON u.id = ap.user_id
  ORDER BY ap.created_at DESC
  LIMIT 10;
"
```

Ahí se ve el `pin` (OTP), si ya fue usado (`used`), hasta cuándo vale (`expires_at`) y el email del usuario.

---

## 4. Resumen para el agente Base de Datos

| Punto                         | Estado |
|------------------------------|--------|
| OTP se persiste en BD        | Sí, tabla `auth_pins` en PostgreSQL (contenedor `assembly-db`) |
| Esquema y seed                | Definidos en `sql_snippets/auth_otp_local.sql` (init DB) |
| Visualización del OTP en Docker | (1) Respuesta API con `OTP_DEBUG=true`, (2) logs de `app`, (3) consulta SQL a `auth_pins` |
| Login listo para pruebas     | Sí; con Docker arriba y `OTP_DEBUG=true` se puede validar todo el flujo |

**Conclusión:** Docker está listo para probar todas las fases. El login OTP se guarda y se valida únicamente en PostgreSQL; se puede confirmar tanto por API, como por logs del contenedor `app` o consultando `auth_pins` en el contenedor `postgres`.
