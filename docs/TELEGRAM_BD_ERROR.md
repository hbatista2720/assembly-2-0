# Solucionar: "Error de BD (¿PostgreSQL activo?)"

El bot responde pero necesita la base de datos. Sigue estos pasos:

---

## Opción A: Usar Docker (recomendado)

### 1. Iniciar PostgreSQL

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
docker compose up -d postgres
```

### 2. Ajustar DATABASE_URL en .env

Con Docker, PostgreSQL queda en el puerto **5433**:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5433/assembly
```

### 3. Ejecutar el fix del chatbot

```bash
npm run db:chatbot-fix
```

### 4. Reiniciar el chatbot

```bash
npm run chatbot
```

---

## Opción B: PostgreSQL instalado localmente

### 1. Iniciar PostgreSQL

```bash
brew services start postgresql
```

### 2. Crear la base de datos (si no existe)

```bash
createdb assembly
```

### 3. Ejecutar el SQL

```bash
psql -d assembly -f sql_snippets/chatbot_config_fix.sql
```

### 4. .env debe tener

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/assembly
```

### 5. Reiniciar el chatbot

```bash
npm run chatbot
```

---

## Verificar

Después de reiniciar, envía `/start` a @AssemblyPH_bot en Telegram. Deberías recibir el mensaje de bienvenida sin el error de BD.
