# Cómo ejecutar la app y ver el PIN en pruebas

**Uso: Docker como si fuera un VPS** — todo corre en contenedores (app + Postgres + Redis). No hace falta instalar Node ni Postgres en tu máquina.

---

## Levantar el “VPS” (Docker)

```bash
docker compose up -d
```

Luego abre **http://localhost:3000** (o la IP de tu máquina si accedes desde otra).

---

## Dónde ver el PIN cuando usas Docker (como VPS)

### 1. En el chat (lo más fácil)

Con **OTP_DEBUG=true** (ya configurado en `docker-compose` para el servicio `app`):

1. Entra a **http://localhost:3000** (o a **/residentes/chat**).
2. Elige **Residente** y escribe un correo de prueba (ej. `residente1@demo.assembly2.com`).
3. El bot responde que te envió un PIN y, **en la siguiente burbuja del chat**, muestra:  
   **"Código de prueba (modo local): 123456"**  
   Ese número es el PIN; cópialo y escríbelo en el chat para continuar.

Si no ves esa segunda burbuja con el código, revisa que en el contenedor `app` esté `OTP_DEBUG=true` (por defecto en `docker-compose` ya lo está).

**"Demasiados intentos. Intenta más tarde."**  
No es normal verlo la primera vez que escribes el correo. Aparece cuando ese correo ya ha pedido PIN 5+ veces en la última hora (límite anti-abuso). Con **OTP_DEBUG=true** el límite se relaja (50/hora) para que las pruebas no queden bloqueadas. Si lo ves sin estar en debug, espera una hora o usa otro correo de prueba (ej. `residente2@demo.assembly2.com`).

---

### 2. En los logs del contenedor de la app

Cada vez que se pide un PIN, la API escribe una línea en la salida del proceso. Para verla:

```bash
docker compose logs -f app
```

(o `npm run docker:logs`)

Pedir un código desde el navegador y en la terminal aparecerá algo como:

```text
[OTP] Email=residente1@demo.assembly2.com OTP=482917
```

El número después de `OTP=` es el PIN.

---

### 3. En la base de datos (Postgres dentro de Docker)

Para ver los últimos PINs generados:

```bash
docker compose exec postgres psql -U postgres -d assembly -c "
  SELECT ap.pin, u.email, ap.expires_at
  FROM auth_pins ap
  JOIN users u ON u.id = ap.user_id
  ORDER BY ap.created_at DESC
  LIMIT 5;
"
```

La columna **`pin`** es el código que debe escribir el usuario.

---

## Resumen rápido (Docker = VPS)

| Dónde ver el PIN | Comando / Dónde |
|------------------|------------------|
| **En el chat** | Segunda burbuja del bot: *"Código de prueba (modo local): XXXXXX"* |
| **Logs del contenedor app** | `docker compose logs -f app` → buscar `[OTP] ... OTP=XXXXXX` |
| **Base de datos** | `docker compose exec postgres psql -U postgres -d assembly -c "SELECT pin, ... FROM auth_pins ..."` |

---

## Opción alternativa: Sin Docker (Node local + Postgres)

Si quieres correr solo la app en tu máquina:

1. **Tener Postgres corriendo** (en tu PC o solo el contenedor de BD):
   ```bash
   docker compose up -d postgres
   ```

2. **Crear `.env`** (puedes copiar de `.env.example`):
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/assembly
   OTP_DEBUG=true
   ```
   (Puerto 5433 si Postgres está en Docker; 5432 si está instalado local.)

3. **Instalar dependencias y levantar la app:**
   ```bash
   npm install
   npm run dev
   ```

4. **Abrir:** http://localhost:3000  
   El PIN en pruebas se ve igual: en el chat como "Código de prueba (modo local): XXXXXX" cuando `OTP_DEBUG=true`.

---

## Validar que el PIN esté visible en Docker

1. **Comprobar que `OTP_DEBUG` está activo en el contenedor `app`:**
   ```bash
   docker compose exec app printenv OTP_DEBUG
   ```
   Debe salir `true`. Si sale vacío o `false`, en `.env` pon `OTP_DEBUG=true` y reinicia: `docker compose restart app`.

2. **Comprobar que la API devuelve el PIN:**
   ```bash
   curl -s -X POST http://localhost:3000/api/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"residente1@demo.assembly2.com"}' | cat
   ```
   En la respuesta JSON debe aparecer el campo `"otp": "123456"` (número de 6 dígitos). Si está, el chat mostrará ese mismo código en la burbuja "Código de prueba (modo local): XXXXXX".

3. **Probar en el navegador:**  
   http://localhost:3000/residentes/chat → Residente → correo `residente1@demo.assembly2.com` → debe aparecer la segunda burbuja del bot con el código.

---

## Dónde debe salir el PIN para validar que funciona

1. **En el chat (pantalla de la app)**  
   - Entra a **http://localhost:3000** o **http://localhost:3000/residentes/chat**.  
   - Elige **Residente** → escribe el correo (ej. `residente1@demo.assembly2.com`).  
   - El bot debe mostrar **dos mensajes**:  
     - *"Te enviamos un PIN a ... Revisa tu bandeja (y spam) e ingrésalo aquí."*  
     - **"Código de prueba (modo local): 123456"** ← aquí debe salir el PIN.  
   - Escribe ese número en el chat y pulsa Enviar.  
   - Si todo va bien: mensaje de bienvenida y botones (Votación, Asambleas, etc.). Así validas que el PIN está funcionando.

2. **En los logs del contenedor `assembly-app`** (no en `assembly-db`):  
   En Docker Desktop → contenedor **assembly-app** → pestaña **Logs**. Ahí verás líneas `[OTP] Email=... OTP=XXXXXX` cada vez que se pida un PIN.

**Nota:** Si ves "PIN incorrecto o vencido" con un código que acabas de copiar, puede ser por el error de `res`/`data` (ya corregido) o porque la BD no tenía la columna `face_id_enabled` y fallaba después. Esa columna ya no rompe el flujo: la API de perfil sigue funcionando aunque no exista. Para tener Face ID configurable, ejecuta:  
`docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/101_face_id_enabled_users.sql`

**Si algo no levanta:** revisa que el puerto 3000 esté libre y que Postgres haya terminado de iniciar (`docker compose ps`).
