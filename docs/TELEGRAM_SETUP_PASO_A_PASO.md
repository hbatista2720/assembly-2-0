# Telegram Bot: Pasos 1-2 (PostgreSQL + SQL)

**Importante:** El chatbot lee `DATABASE_URL` de tu `.env`. Si Postgres está en Docker, usa puerto **5433**. Si está instalado local, usa **5432**.

---

## Punto 1: Verificar que PostgreSQL esté corriendo

### Opción A – Con Docker (recomendado en este proyecto)

```bash
cd "/Users/henrybatista/LiveAssambly version 2.0"
docker compose up -d postgres
```

Verifica que esté activo:

```bash
docker compose ps postgres
```

Debe mostrar `running`. El puerto expuesto es **5433** (no 5432).

### Opción B – PostgreSQL instalado localmente (Homebrew, etc.)

```bash
brew services start postgresql@15
# o
brew services start postgresql
```

Puerto por defecto: **5432**.

---

## Punto 2: Ejecutar el script SQL

### Si usas Docker (Opción A)

1. Tu `.env` debe tener:
   ```env
   DATABASE_URL=postgres://postgres:postgres@localhost:5433/assembly
   ```

2. Ejecuta:
   ```bash
   npm run db:chatbot-fix
   ```

   O directamente:
   ```bash
   docker compose exec -T postgres psql -U postgres -d assembly -f /docker-entrypoint-initdb.d/chatbot_config_fix.sql
   ```

### Si usas PostgreSQL local (Opción B)

1. Tu `.env` debe tener:
   ```env
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/assembly
   ```

2. Asegúrate de tener la base de datos `assembly`:
   ```bash
   createdb assembly
   ```

3. Ejecuta:
   ```bash
   psql -U postgres -d assembly -f sql_snippets/chatbot_config_fix.sql
   ```

---

## Verificación

Deberías ver algo como:

```
CREATE TABLE
INSERT 0 1
 bot_name | is_active | landing_prompt
----------+-----------+------------------------------------------
 telegram | t         | Eres Lex, asistente de Assembly 2.0...
```

Luego reinicia el chatbot: `npm run chatbot`.
