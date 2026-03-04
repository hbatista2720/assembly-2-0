# Qué hace el Coder para deploy en Vultr VPS

Guía clara del **rol del Coder** y los **pasos concretos** para dejar Assembly 2.0 corriendo en un VPS (Vultr, Hetzner, DigitalOcean, etc.).

---

## Rol del Coder en el deploy

El Coder es quien:

1. **Prepara el proyecto** para que se pueda desplegar (Docker, variables de entorno, scripts).
2. **Sube el código** al servidor (git clone o rsync).
3. **Configura el servidor** una sola vez: instalar Docker, crear `.env`, levantar el stack.
4. **Deja documentado** cómo repetir el deploy y hacer backups.

El Coder **no** tiene que contratar el VPS ni pagar; eso lo hace Henry o el cliente. El Coder recibe: **IP del servidor, usuario SSH (ej. `root`) y (opcional) acceso al panel de Vultr**.

---

## Resumen en 4 pasos (Vultr u otro VPS)

| Paso | Quién | Qué hace |
|------|--------|----------|
| 1 | Henry / Cliente | Crear la VPS en Vultr (Ubuntu 22.04), anotar IP y contraseña root. |
| 2 | Coder | Conectarse por SSH, instalar Docker y Docker Compose. |
| 3 | Coder | Clonar el repo, copiar y rellenar `.env`, ejecutar `docker compose up -d`. |
| 4 | Coder (opcional) | Configurar Nginx como reverse proxy y SSL (Let's Encrypt) para el dominio. |

---

## Paso 1 – Crear la VPS (lo hace Henry; el Coder solo lo usa)

En [Vultr](https://www.vultr.com):

1. **Deploy New Server** → elegir **Cloud Compute**.
2. **Ubuntu 22.04 LTS**.
3. Región cercana a los usuarios (ej. Miami).
4. Plan: por ejemplo **$12–24/mes** (1–2 vCPU, 2–4 GB RAM) para empezar; luego se puede subir.
5. Añadir **SSH Key** (recomendado) o anotar la **contraseña root** que muestra Vultr.
6. Anotar la **IP** del servidor (ej. `45.76.123.45`).

---

## Paso 2 – Primera conexión e instalar Docker (Coder)

En tu máquina local:

```bash
# Conectar por SSH (sustituye la IP)
ssh root@45.76.123.45
```

En el servidor (ya conectado por SSH):

```bash
# Actualizar e instalar Docker
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 git

# Habilitar Docker al inicio
systemctl enable docker
systemctl start docker
```

Comprobar:

```bash
docker --version
docker compose version
```

---

## Paso 3 – Subir el proyecto y levantarlo (Coder)

**Opción A – Con Git (recomendado si el repo está en GitHub/GitLab):**

```bash
cd /opt
git clone https://github.com/TU-ORG/assembly-2-0.git
cd assembly-2-0
```

**Opción B – Subir desde tu PC con rsync:**

En tu PC (no en el servidor):

```bash
rsync -avz --exclude node_modules --exclude .next . usuario@45.76.123.45:/opt/assembly-2-0/
```

Luego en el servidor:

```bash
cd /opt/assembly-2-0
```

**Crear y rellenar `.env` en el servidor:**

```bash
cp deploy/.env.vps.example .env
nano .env   # o vi .env
```

Rellenar al menos:

- `POSTGRES_PASSWORD` – contraseña segura para PostgreSQL.
- `JWT_SECRET`, `OTP_SECRET`, `NEXTAUTH_SECRET` – generar con `openssl rand -hex 32`.
- `NEXTAUTH_URL` – URL pública (ej. `https://tudominio.com`).
- `SMTP_*` – datos del correo para OTPs.
- `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY` – para el chatbot.

Para producción, `DATABASE_URL` en el servidor debe usar el servicio interno (ej. `postgres` o `pgbouncer` según tu `docker-compose.yml`). En el `docker-compose` actual la app usa `postgres:5432` o `pgbouncer:5432` dentro de la red Docker; no hace falta poner `localhost`.

**Levantar el stack:**

```bash
chmod +x deploy/up.sh deploy/backup-db.sh
./deploy/up.sh
```

O directamente:

```bash
docker compose up -d
```

**Comprobar:**

```bash
docker compose ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Si devuelve 200, la app responde dentro del servidor.

---

## Paso 4 – Dominio y SSL (opcional, Coder)

Para que se acceda por `https://tudominio.com`:

1. En el panel de tu dominio (donde lo compraste), crear un **registro A** que apunte a la **IP del VPS**.
2. En el servidor, instalar Nginx y Certbot:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

3. Crear un sitio en Nginx que haga **proxy** a `http://localhost:3000` (y opcionalmente a los puertos de los bots si los expones).
4. Obtener certificado SSL:

```bash
certbot --nginx -d tudominio.com
```

5. En `.env`, poner `NEXTAUTH_URL=https://tudominio.com` y reiniciar la app:

```bash
docker compose restart app
```

---

## Resumen: qué hace el Coder

| Tarea | Dónde |
|-------|--------|
| Dejar listo `docker-compose.yml`, Dockerfiles y `deploy/` | En el repo (ya está). |
| Documentar variables en `.env.vps.example` | En `deploy/` (ya está). |
| Conectarse por SSH al VPS | Desde su PC al servidor que da Henry. |
| Instalar Docker en el VPS | Una vez por servidor. |
| Clonar o subir código y crear `.env` | En el VPS. |
| Ejecutar `docker compose up -d` (o `./deploy/up.sh`) | En el VPS. |
| (Opcional) Configurar Nginx + SSL | En el VPS. |
| (Opcional) Programar backups con `deploy/backup-db.sh` | Cron en el VPS. |

---

## Documentación de referencia

- **Instrucciones completas (Docker, Auth, Realtime, etc.):** [Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md](../Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md)
- **Arquitectura y decisión VPS:** [Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md](../Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md)
