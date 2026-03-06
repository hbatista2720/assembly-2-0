# Depurar "Internal Server Error" en chatvote.click/login

Cuando **http://chatvote.click/login** muestra "Internal Server Error", el fallo está en el servidor. Sigue estos pasos en la **VPS** para ver la causa.

## 1. Ver logs del contenedor de la app

En la VPS (SSH):

```bash
cd /opt/assembly-2-0
docker logs assembly-app --tail 150
```

Busca líneas con `Error`, `error:`, `Exception` o el stack trace justo después de que alguien entre a `/login`.

## 2. Reproducir el error y mirar logs en vivo

En la VPS, en una terminal:

```bash
docker logs -f assembly-app
```

En el navegador entra a **http://chatvote.click/login**. En la terminal deberían salir nuevas líneas; si hay 500, suele aparecer el error ahí.

## 3. Comprobar que la app responde

En la VPS:

```bash
curl -I http://127.0.0.1:3000/login
```

- Si devuelve `200` o `302`: la app responde; el fallo puede ser por Nginx (headers, proxy) o por algo que solo falle con ciertas peticiones.
- Si devuelve `500`: el error está en la app; el detalle estará en `docker logs assembly-app`.

## 4. Causas habituales

| Causa | Qué hacer |
|-------|-----------|
| **Variable de entorno faltante** | Revisar `.env` en la VPS y que `docker compose` la use. Comprobar `DATABASE_URL`, `OTP_SECRET`, `NEXTAUTH_SECRET`, etc. |
| **Base de datos caída o inaccesible** | `docker compose ps` y `docker logs assembly-db --tail 30`. Que el contenedor `assembly-db` esté Up y que la app pueda conectar (mismo network). |
| **Build viejo o corrupto** | `docker compose build --no-cache app` y luego `docker compose up -d app`. |
| **Memoria insuficiente** | En VPS con poca RAM, el proceso puede morir al compilar o al arrancar. Revisar `dmesg` o logs del host. |

## 5. Probar solo la app (sin Nginx)

En la VPS:

```bash
curl -I http://127.0.0.1:3000/login
```

Si desde tu Mac navegas a **http://45.63.104.7:3000/login** (puerto 3000 directo) y ahí **no** sale 500, el problema puede ser la configuración de Nginx (proxy, headers, timeouts). Si también da 500, el fallo está en la app o en el entorno (env, BD).

---

Cuando tengas el mensaje de error exacto de `docker logs assembly-app`, se puede afinar la solución (por ejemplo, falta de env, tabla de BD, o excepción en un import).
