# Validación: qué está pendiente

**Fecha:** Enero 2026  
**Contexto:** Tras integrar Groq y ajustes de build.

---

## 1. Integración Groq / IA – Nada crítico pendiente

| Ítem | Estado |
|------|--------|
| Groq en `/api/chat/resident` | ✅ Hecho (prioridad Groq, fallback Gemini) |
| Groq en `/api/chat/telegram` | ✅ Hecho |
| Validación Groq en panel (`/api/chatbot/validate-groq`) | ✅ Hecho |
| Clave Groq en `platform_secrets` y PUT secrets | ✅ Hecho |
| `GROQ_API_KEY` en docker-compose (app, telegram-bot, web-chatbot) | ✅ Hecho |
| `.env.example` y `deploy/.env.vps.example` | ✅ Hecho |
| Comentarios "// fallback a Gemini" en resident/telegram | Opcional: son solo documentación; el fallback real ocurre en el bloque `if (!reply && geminiKey)` siguiente. No afecta comportamiento. |

---

## 2. Build

| Ítem | Estado |
|------|--------|
| Script `package.json`: se quitó `--tsconfig` inválido; queda `next build` | ✅ Hecho |
| Ejecutar `npm run build` en local para confirmar que compila | Pendiente que lo ejecutes tú en tu Mac |

---

## 3. Pendientes de proyecto (Contralor / ESTATUS_AVANCE)

| Fase / Área | Estado | Nota |
|-------------|--------|------|
| **FASE 12** – Docker local | 40% en progreso | Completar y validar |
| **FASE 13** – Deploy VPS | 0% pendiente | Tras FASE 12 |
| **QA** – verify-otp en navegador | Pendiente | Re-validar |
| **QA** – Dashboard Henry y Admin PH (5 usuarios) | Pendiente | Tests según plan |
| **QA** – Ceder poder (§G) en navegador | Pendiente | Formulario → "Pendiente por aprobar" → botón "en proceso..." |
| **Coder** – §K y mejoras Admin PH (R1–R8) | Pendiente | Según Contralor |
| **Opcional** – Email al residente tras "Ceder poder" | Pendiente | Confirmación por correo cuando se crea solicitud |
| **Henry** – Wizard "Proceso de Asamblea" (5 pasos) | Pendiente | Módulo /dashboard/admin-ph/proceso-asamblea |

---

## 4. Próximos pasos sugeridos (orden práctico)

1. En tu Mac: `npm run build` y, si pasa, `npm run start` o `npm run dev` y probar chat con Groq.
2. En el VPS: añadir `GROQ_API_KEY` al `.env` (o desde el panel Tokens), subir código y hacer build/up de `app` y `telegram-bot`.
3. Que QA ejecute las pruebas pendientes (verify-otp, Dashboard Henry, Ceder poder §G).
4. Avanzar FASE 12 (Docker local) y luego FASE 13 (Deploy VPS) según ESTATUS_AVANCE.

---

*Documento generado para validar estado actual; actualizar según se cierren ítems.*
