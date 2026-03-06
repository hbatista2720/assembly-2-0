# VPS: arrancar la app sin montar código (evitar 502 y required-server-files.json)

En la VPS, el build dentro del contenedor (`docker compose exec app npm run build`) puede fallar por webpack. La solución es **usar la imagen ya construida** y no montar el directorio del host, así el contenedor usa el `.next` que se generó al hacer `docker compose build`.

## Pasos en la VPS

### 1. Código actualizado

```bash
cd /opt/assembly-2-0
git pull origin main
```

### 2. Reconstruir la imagen de la app (aquí se hace el build de Next.js)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache app
```

Tarda varios minutos. Si falla por webpack, hay que corregir ese error en el código y volver a hacer commit/pull y build.

### 3. Levantar la app sin volúmenes (usa lo que hay en la imagen)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app
```

### 4. Comprobar

```bash
docker compose ps
curl -I http://127.0.0.1:3000/
```

Luego prueba **http://chatvote.click/login**.

---

## Resumen

- **Con volúmenes** (por defecto): el contenedor monta el código del host; si no hay `.next` válido o el build falla, sale 500/502.
- **Con docker-compose.prod.yml**: no se monta nada; el contenedor usa la imagen construida en el paso 2 y no depende del build dentro del contenedor.

Para otros servicios (postgres, redis, telegram-bot) sigue usando:

```bash
docker compose up -d postgres pgbouncer redis app telegram-bot
```

pero para **app** en producción usa los dos archivos:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app
```

Si quieres que siempre uses prod para app en la VPS, puedes crear un alias o script que incluya `-f docker-compose.prod.yml` al levantar la app.
