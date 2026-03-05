# Crear tablas de chatbot en la VPS (quitar error "La tabla chatbot_config no existe")

Cuando en **Configuración del Chatbot** ves el mensaje en rojo **"La tabla chatbot_config no existe"** y la zona **"Modelo y prompts por canal"** pide **"Inicializar canales"**, en la base de datos de la VPS faltan tablas. Créalas ejecutando estos SQL.

---

## Qué hace cada tabla

| Tabla | Para qué |
|-------|----------|
| **platform_secrets** | Guardar API keys (Groq, Gemini) y token de Telegram desde el panel. |
| **chatbot_config** | Configuración por canal (Telegram, Web): modelo, temperatura, prompts. Sin ella no puedes usar "Inicializar canales" ni editar modelo y prompts. |

---

## Pasos en la VPS (por SSH)

Conéctate a la VPS y entra al proyecto:

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
```

El usuario de PostgreSQL puede ser **postgres** o **henry** según tu `.env` (`POSTGRES_USER`). Si no lo recuerdas, prueba primero con `postgres`.

### 1. Crear tabla `platform_secrets`

```bash
docker compose exec -T postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/platform_secrets.sql
```

Si da error de usuario/permiso, prueba con `henry`:

```bash
docker compose exec -T postgres psql -U henry -d assembly -f /docker-entrypoint-initdb.d/platform_secrets.sql
```

### 2. Crear tabla `chatbot_config` e insertar canales (Telegram, Web)

```bash
docker compose exec -T postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/chatbot_config.sql
```

(O con `-U henry` si usas ese usuario.)

### 3. (Opcional) Añadir columna `telegram_bot_username` si la app la usa

```bash
docker compose exec -T postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/chatbot_config_telegram.sql
```

(O con `-U henry`.)

---

## Después de ejecutar los SQL

1. Refresca la página de **Configuración del Chatbot** en el navegador (F5 o recargar).
2. El aviso rojo **"La tabla chatbot_config no existe"** debería desaparecer.
3. En **"Modelo y prompts por canal"** ya no debería salir solo el botón **"Inicializar canales"** como única opción; si los canales aún no están creados, pulsa **"Inicializar canales (Telegram y Web)"** una vez. A partir de ahí podrás elegir Telegram/Web y editar modelo y prompts.

---

## Si no tienes los archivos en el contenedor

Los scripts están en el repo en `sql_snippets/`. El `docker-compose` monta esa carpeta en el contenedor de Postgres en `/docker-entrypoint-initdb.d`. Si por algún motivo no están ahí, puedes ejecutar el SQL pasándolo por stdin:

```bash
docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/chatbot_config.sql
```

(Asegúrate de estar en `/opt/assembly-2-0` al ejecutarlo.)
