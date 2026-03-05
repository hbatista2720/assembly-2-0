# Crear la tabla chatbot_config en la VPS

Si en la pantalla **Configuración del Chatbot** ves:

> La tabla chatbot_config no existe. Ejecuta sql_snippets/chatbot_config.sql en la base de datos.

y el botón **"Inicializar canales (Telegram y Web)"** no funciona, hay que crear esa tabla en la base de datos del servidor.

---

## Qué hace esta tabla

La tabla `chatbot_config` guarda la configuración de cada canal (Telegram, Web): modelo de IA, temperatura, prompts por contexto (landing, demo, soporte, residente). Sin ella, la sección **"Modelo y prompts por canal"** no puede cargar ni inicializar los canales.

---

## Cómo ejecutar el SQL en la VPS

Conéctate por SSH a la VPS y ejecuta **desde la carpeta del proyecto**:

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
docker exec -i assembly-db psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/chatbot_config.sql
```

El contenedor `assembly-db` tiene montada la carpeta `sql_snippets` del proyecto en `/docker-entrypoint-initdb.d`, así que el script `chatbot_config.sql` está disponible dentro del contenedor.

Si tu usuario de Postgres no es `postgres`, cambia `-U postgres` por el usuario que uses (por ejemplo el de tu `.env`: `POSTGRES_USER`).

---

## Después de ejecutarlo

1. Refresca la página de configuración del chatbot (F5 o recargar).
2. Deberías ver los canales **Telegram** y **Web** en la columna izquierda de "Modelo y prompts por canal".
3. Si aún dice "Aún no hay canales configurados", pulsa **"Inicializar canales (Telegram y Web)"** una vez; eso inserta los registros por defecto si no existen.

Si algo falla, copia el mensaje que salga en la terminal al ejecutar el `docker exec ...` y revísalo.
