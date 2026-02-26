# Migraciones para demo por correo en el chatbot

Si el demo **no carga** en el chatbot (error 500 o "No pudimos preparar tu demo ahora"), aplica estas migraciones en la base de datos.

## Migraciones requeridas

1. **015** – columna `demo_expires_at` en `organizations`
2. **016** – columna `ip_address` en `auth_attempts` (si la tabla ya existe)
3. **017** – crear tabla `auth_attempts` si no existe

## Cómo aplicarlas

### Con Docker

Desde la raíz del proyecto:

```bash
docker exec -i assembly-db psql -U postgres -d assembly -f - < src/lib/db/migrations/015_demo_expires_at.sql
docker exec -i assembly-db psql -U postgres -d assembly -f - < src/lib/db/migrations/016_auth_attempts_ip.sql
docker exec -i assembly-db psql -U postgres -d assembly -f - < src/lib/db/migrations/017_auth_attempts_create.sql
```

### Con conexión directa a PostgreSQL

```bash
psql -U postgres -d assembly -f src/lib/db/migrations/015_demo_expires_at.sql
psql -U postgres -d assembly -f src/lib/db/migrations/016_auth_attempts_ip.sql
psql -U postgres -d assembly -f src/lib/db/migrations/017_auth_attempts_create.sql
```

## Verificación

1. Entra al chatbot en `/` o `/chat`
2. Elige **Administrador PH** o **Solo demo**
3. Escribe tu correo (ej. `tu@correo.com`)
4. Deberías ver "Tu demo está listo" y el enlace "Entrar al demo →"
