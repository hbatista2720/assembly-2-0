# Estatus y avances

Fecha: 2026-01-26

## Avances recientes
- VPS Docker activo en local con `http://localhost:3000` para landing.
- Landing mantiene un solo flujo de chatbot (Lex) sin duplicados.
- Chatbot agrega acciones rápidas específicas para residentes (votación, asambleas, calendario, tema del día, enviar poder).
- Acciones rápidas conectadas a rutas reales de residentes.
- Rutas nuevas: `/residentes/votacion`, `/residentes/asambleas`, `/residentes/calendario`, `/residentes/tema-del-dia`, `/residentes/poder`.
- Implementada página `platform-admin/chatbot-config` basada en BD.
- API `/api/chatbot/config` (GET/PUT) conectada a PostgreSQL.
- Chatbot Telegram y chatbot web leen prompts desde `chatbot_config`.
- SQL de `chatbot_config` agregado en `sql_snippets/chatbot_config.sql`.
- Postgres expuesto en `localhost:5433` para evitar conflicto con el Postgres local.
- Testing OK: `/`, `/residentes/votacion`, `/platform-admin/chatbot-config`, `/api/chatbot/config`.
- Supabase removido del runtime; login queda en modo demo OTP para fase inicial.

## Notas para Contraloría/QA
- El stack se alinea a VPS Docker (PostgreSQL + PgBouncer + Redis + App + Telegram + Web Chatbot).
- WhatsApp queda como pendiente de fase posterior.
- QA puede validar landing y chatbot en `http://localhost:3000`.
- Validación rápida: `curl` responde 200 en `/` y `/residentes/votacion`.
- Para evitar errores de `EMFILE`, se inició dev con polling (`WATCHPACK_POLLING=true`).
- Para entorno local: `DATABASE_URL=postgres://postgres:postgres@localhost:5433/assembly`.
