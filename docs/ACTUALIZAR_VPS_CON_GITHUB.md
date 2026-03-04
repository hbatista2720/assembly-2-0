# Actualizar la VPS con los nuevos cambios (usando GitHub)

Repositorio: **https://github.com/hbatista2720/assembly-2-0**

Sigue los pasos en orden. Todo lo que diga "En la Mac" se hace en tu computadora; todo lo que diga "En la VPS" se hace después de conectarte por SSH al servidor.

---

## PARTE 1 – En la Mac (subir cambios a GitHub)

### Paso 1.1 – Abrir terminal en la Mac

Abre **Terminal** (o iTerm). No te conectes todavía a la VPS.

### Paso 1.2 – Ir a la carpeta del proyecto

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
```

### Paso 1.3 – Ver qué archivos cambiaron

```bash
git status
```

Deberías ver archivos modificados o nuevos (chatbot, API verify-user, config IA, etc.).

### Paso 1.4 – Añadir todo y hacer commit

```bash
git add -A
git commit -m "Chatbot: Groq, verificación por API, /start sin error, deploy VPS"
```

### Paso 1.5 – Subir a GitHub

```bash
git push origin main
```

Si pide usuario y contraseña, usa tu usuario de GitHub y un **Personal Access Token** (no la contraseña normal). Si ya tienes todo configurado, el push terminará sin errores.

**Cuando el `git push` termine, los últimos cambios ya están en GitHub.** Pasamos a la VPS.

---

## PARTE 2 – En la VPS (primera vez: dejar el proyecto como repo Git)

En la VPS, la carpeta `/opt/assembly-2-0` **no es un repositorio Git** (por eso `git pull` fallaba). Hay que dejarla como clone de GitHub. Puedes hacerlo de dos formas.

### Opción A – Empezar desde cero con clone (recomendado si no te importa perder lo que hay en /opt/assembly-2-0)

Conéctate a la VPS:

```bash
ssh root@45.63.104.7
```

Luego, **en la VPS**:

**Paso 2.A.1 – Guardar el .env si existe (tiene tus claves y config)**

```bash
cp /opt/assembly-2-0/.env /root/assembly-env-backup.txt 2>/dev/null || true
```

**Paso 2.A.2 – Parar contenedores y quitar la carpeta vieja**

```bash
cd /opt
docker compose -f assembly-2-0/docker-compose.yml down 2>/dev/null || true
mv assembly-2-0 assembly-2-0-old
```

**Paso 2.A.3 – Clonar el repo de GitHub**

```bash
git clone https://github.com/hbatista2720/assembly-2-0.git
```

**Paso 2.A.4 – Recuperar el .env si lo guardaste**

```bash
cp /root/assembly-env-backup.txt assembly-2-0/.env 2>/dev/null || true
```

**Paso 2.A.5 – Entrar al proyecto y construir/levantar**

```bash
cd /opt/assembly-2-0
docker compose build --no-cache app telegram-bot
docker compose up -d postgres pgbouncer redis app telegram-bot
```

**Paso 2.A.6 – Comprobar**

```bash
docker compose ps
```

Si no tenías `.env` en la VPS, créalo en `/opt/assembly-2-0/.env` con al menos: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY` o `GROQ_API_KEY`, etc. (puedes basarte en `.env.example` del repo).

---

### Opción B – Convertir la carpeta actual en repo Git (sin borrar /opt/assembly-2-0)

Si quieres **mantener** la carpeta actual y solo convertirla en repo para poder hacer `git pull` después:

Conéctate a la VPS:

```bash
ssh root@45.63.104.7
```

**Paso 2.B.1 – Guardar el .env**

```bash
cp /opt/assembly-2-0/.env /root/assembly-env-backup.txt 2>/dev/null || true
```

**Paso 2.B.2 – Entrar al proyecto**

```bash
cd /opt/assembly-2-0
```

**Paso 2.B.3 – Inicializar Git y conectar con GitHub**

```bash
git init
git remote add origin https://github.com/hbatista2720/assembly-2-0.git
git fetch origin main
git reset --hard origin/main
```

**Paso 2.B.4 – Recuperar el .env**

```bash
cp /root/assembly-env-backup.txt .env 2>/dev/null || true
```

**Paso 2.B.5 – Build y levantar servicios**

```bash
docker compose build --no-cache app telegram-bot
docker compose up -d postgres pgbouncer redis app telegram-bot
```

**Paso 2.B.6 – Comprobar**

```bash
docker compose ps
```

---

## PARTE 3 – En la VPS (próximas veces: solo actualizar)

Cuando `/opt/assembly-2-0` ya sea un repo Git (por Opción A o B), para **actualizar** con los nuevos cambios:

**En la VPS:**

```bash
ssh root@45.63.104.7
cd /opt/assembly-2-0
git pull origin main
docker compose build --no-cache app telegram-bot
docker compose up -d postgres pgbouncer redis app telegram-bot
docker compose ps
```

Siempre en la VPS usa **solo** la ruta `/opt/assembly-2-0`, nunca la ruta de tu Mac.

---

## Resumen rápido

| Dónde | Qué hacer |
|-------|-----------|
| **Mac** | `cd` a tu proyecto → `git add -A` → `git commit` → `git push origin main` |
| **VPS (primera vez)** | Opción A: clonar repo en `/opt/assembly-2-0` y hacer build/up. Opción B: `git init` + `remote` + `fetch` + `reset` en la carpeta actual y luego build/up. |
| **VPS (siguientes veces)** | `cd /opt/assembly-2-0` → `git pull origin main` → build → `docker compose up -d ...` |

Repo: **https://github.com/hbatista2720/assembly-2-0**
