# Despliegue en la VPS – Paso a paso

Guía para subir el proyecto a la VPS y tener app + bot de Telegram funcionando. Sin pasos de más y sin rutas equivocadas.

---

## Qué se hizo mal antes (para no repetirlo)

1. **Ruta de Mac en la VPS**  
   Se ejecutó `cd "/Users/henrybatista/LiveAssambly version 2.0"` **dentro del servidor**. Esa ruta solo existe en tu Mac. En la VPS la carpeta del proyecto es **siempre** `/opt/assembly-2-0`.

2. **Mezclar órdenes**  
   Primero hay que tener el código actualizado en la VPS; después hacer build y levantar contenedores. Si el código en la VPS es viejo, el build no incluye los últimos cambios.

3. **Dónde se ejecuta cada cosa**  
   - En la **Mac**: git, editar código, y (opcional) subir archivos a la VPS.  
   - En la **VPS** (por SSH): solo comandos dentro de `/opt/assembly-2-0` (cd, git pull, docker compose).

---

## Paso 1: En tu Mac – Tener el código actualizado y subirlo

Abre una terminal **en tu Mac** (no en la VPS).

### 1.1 Ir a la carpeta del proyecto (ruta de Mac)

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
```

### 1.2 Subir cambios al repositorio (si usas Git)

```bash
git status
git add -A
git commit -m "Actualizar chatbot, Groq, verificación por API"
git push origin main
```

Si no usas Git, en el **Paso 2** usarás `rsync` para copiar archivos desde la Mac a la VPS.

---

## Paso 2: Llevar el código a la VPS

Tienes que conseguir que la carpeta **en la VPS** en `/opt/assembly-2-0` tenga los archivos actuales.

### Opción A – Con Git (recomendado)

1. Conéctate a la VPS:

   ```bash
   ssh root@45.63.104.7
   ```

2. Entra al proyecto (solo esta ruta en el servidor):

   ```bash
   cd /opt/assembly-2-0
   ```

3. Actualiza el código:

   ```bash
   git pull origin main
   ```

4. Si `git pull` pide usuario/contraseña o falla, configura el repo en la VPS o usa la Opción B.

### Opción B – Sin Git (copiar desde la Mac)

En una terminal **en tu Mac** (no dentro de SSH):

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
rsync -avz --exclude node_modules --exclude .next --exclude .git . root@45.63.104.7:/opt/assembly-2-0/
```

Eso copia todo el proyecto al servidor (excepto node_modules, .next, .git). Ajusta `root@45.63.104.7` si usas otro usuario o IP.

---

## Paso 3: En la VPS – Build y arranque de contenedores

Todo lo que sigue se ejecuta **dentro de la VPS**, después de `ssh root@45.63.104.7`.

### 3.1 Entrar al proyecto (ruta del servidor)

```bash
cd /opt/assembly-2-0
```

No uses aquí la ruta de tu Mac. En la VPS solo existe `/opt/assembly-2-0`.

### 3.2 (Opcional) Parar lo que esté corriendo

Si ya tenías contenedores y quieres empezar limpio:

```bash
docker compose down
```

### 3.3 Construir las imágenes (app y telegram-bot)

```bash
docker compose build --no-cache app telegram-bot
```

Espera a que termine (pueden salir avisos `npm warn deprecated`; no son errores). Al final debe aparecer algo como “Successfully built” o “Successfully tagged”.

### 3.4 Levantar los servicios

```bash
docker compose up -d postgres pgbouncer redis app telegram-bot
```

Deberías ver algo como:

- `✔ Container assembly-redis ...`
- `✔ Container assembly-db ...`
- `✔ Container assembly-pgbouncer ...`
- `✔ Container assembly-telegram-bot ...`
- `✔ Container assembly-app ...`

### 3.5 Comprobar que todo está arriba

```bash
docker compose ps
```

Todos los servicios listados deberían estar en estado “Up” o “running”.

---

## Paso 4: Comprobar que funciona

- **App:** en el navegador abre `http://45.63.104.7:3000` (o el dominio que tengas apuntando a esa IP).
- **Telegram:** escribe al bot, envía `/start` y luego tu correo (ej. `residente2@demo.assembly2.com`).

---

## Resumen rápido (solo comandos)

**En la Mac (una sola vez, para actualizar y subir código):**

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
git add -A && git commit -m "Actualizar" && git push origin main
```

**En la VPS (por SSH):**

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
git pull origin main
docker compose build --no-cache app telegram-bot
docker compose up -d postgres pgbouncer redis app telegram-bot
docker compose ps
```

**Regla:** En la VPS nunca uses la ruta `/Users/henrybatista/...`. En la VPS el proyecto está siempre en `/opt/assembly-2-0`.
