# Si el build de la app falla en la VPS

Cuando aparece `target app: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1`, hace falta ver **el mensaje completo** del build.

---

## 1. Ver el error completo en la VPS

En la VPS, en `/opt/assembly-2-0`, ejecuta:

```bash
cd /opt/assembly-2-0
docker compose build --no-cache --progress=plain app 2>&1 | tee build.log
```

Al final del archivo `build.log` (o en la pantalla) suele salir la causa, por ejemplo:

- **TypeScript/type error** → algo como `Type error: ...` o `TS2307`
- **Falta memoria (OOM)** → `JavaScript heap out of memory` o `FATAL ERROR: Reached heap limit`
- **Módulo no encontrado** → `Module not found: Can't resolve ...`
- **ESLint** → `Error: ESLint: ...`

Para ver solo el final del log:

```bash
tail -100 build.log
```

---

## 2. Cambio aplicado en el Dockerfile (más memoria)

En el Dockerfile se añadió `NODE_OPTIONS=--max-old-space-size=4096` antes de `npm run build` para dar más memoria al proceso de Next.js y evitar fallos por OOM en servidores con poca RAM.

Para que la VPS use ese cambio:

1. En tu Mac (o donde tengas el repo), haz commit y push del Dockerfile actualizado.
2. En la VPS: `cd /opt/assembly-2-0`, `git pull origin main`, y vuelve a lanzar el build.

---

## 3. Mientras tanto: qué está corriendo

Aunque el **build** de la imagen `app` falle, `docker compose up` puede haber levantado contenedores con **imágenes anteriores** (por ejemplo de `assembly-2-0-old` o de una build previa). Por eso `docker compose ps` muestra todo "Up".

- **app**: puede estar usando una imagen vieja; la app puede funcionar o dar errores según cómo esté esa imagen.
- **telegram-bot**: se construye aparte; si ese build sí terminó, el bot usa código nuevo.

Para forzar que la app use una imagen recién construida, el build de la app tiene que terminar bien. Mientras tanto puedes probar la app en `http://45.63.104.7:3000` y el bot en Telegram; si algo falla, el siguiente paso es revisar el `build.log` como en el punto 1.
