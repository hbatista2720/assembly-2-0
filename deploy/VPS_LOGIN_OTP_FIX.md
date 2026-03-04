# Corregir login (henry.batista27@gmail.com) en el VPS

Si al entrar en **http://TU_IP:3000/login** con **henry.batista27@gmail.com** sale **"Error al generar OTP"**, haz lo siguiente.

## 1. Usuario de la BD = postgres

En el proyecto el usuario de PostgreSQL es **postgres** (no henry). En el VPS el `.env` no debe definir `POSTGRES_USER=henry`; si lo tiene, cámbialo o bórralo para usar el valor por defecto `postgres`.

En el VPS:

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
grep POSTGRES .env
```

- Si ves `POSTGRES_USER=henry`, edita: `nano .env` y pon `POSTGRES_USER=postgres` o borra esa línea.
- Asegúrate de tener `POSTGRES_PASSWORD=...` con la misma contraseña que usas en `DATABASE_URL`.

## 2. Subir el docker-compose actualizado y reiniciar

Desde tu **Mac** (en la carpeta del proyecto):

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
scp docker-compose.yml root@45.63.104.7:/opt/assembly-2-0/
ssh root@45.63.104.7 "cd /opt/assembly-2-0 && docker compose down && docker compose up -d"
```

## 3. Comprobar que el usuario de la app existe en la BD

En el VPS, si el login sigue fallando, comprueba si el usuario **henry.batista27@gmail.com** está en la base:

```bash
ssh root@45.63.104.7 "cd /opt/assembly-2-0 && docker compose exec postgres psql -U postgres -d assembly -c \"SELECT id, email, role FROM users WHERE email = 'henry.batista27@gmail.com';\""
```

- Si **no sale ninguna fila**: la base se creó sin los datos de prueba. Tienes dos opciones:
  - **Opción A – Borrar datos y recrear todo** (solo si no te importa perder lo que haya en la BD):
    ```bash
    ssh root@45.63.104.7 "cd /opt/assembly-2-0 && docker compose down -v && docker compose up -d"
    ```
    Espera 1–2 minutos y vuelve a probar el login.
  - **Opción B – Insertar solo el usuario admin** (si ya tienes otras tablas y datos):
    ```bash
    ssh root@45.63.104.7 "cd /opt/assembly-2-0 && docker compose exec -T postgres psql -U postgres -d assembly" < sql_snippets/auth_otp_local.sql
    ```
    (Ejecuta esto desde la Mac, en la raíz del proyecto, para que encuentre `sql_snippets/auth_otp_local.sql`.)

## 4. Ver el error real del OTP (por si sigue fallando)

En el VPS, con la app en marcha, pide el código OTP desde la web y justo después ejecuta:

```bash
ssh root@45.63.104.7 "cd /opt/assembly-2-0 && docker compose logs app --tail 30"
```

Ahí debería salir el mensaje de error real (por ejemplo "connection refused", "relation \"users\" does not exist", etc.) y con eso se puede afinar el arreglo.

---

**Resumen:** Usuario de la BD = **postgres**. Usuario admin de la aplicación = **henry.batista27@gmail.com** (debe existir en la tabla `users`; se crea con los scripts de init o con `auth_otp_local.sql`).
