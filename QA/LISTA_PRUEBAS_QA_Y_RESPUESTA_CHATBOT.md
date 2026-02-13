# Lista de pruebas por QA + Revisión respuesta del chatbot

**Fecha:** Febrero 2026  
**Referencia:** Contralor/ESTATUS_AVANCE.md, QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md

---

## 1. Lista de pruebas por QA (actual)

| # | Prueba | Prioridad | Dónde | Estado |
|---|--------|-----------|-------|--------|
| 1 | **Revisar avances Dashboard Henry** | Alta | ESTATUS_AVANCE § "Para QA – Revisar avances Dashboard Henry"; QA_REPORTE_DASHBOARD_HENRY §5 y §7 | Pendiente |
| 2 | **Re-validar bug verify-otp (PIN chatbot)** | Alta | Chatbot residente: con PIN correcto no debe mostrar "Error al verificar"; residente debe pasar al chat validado | Pendiente |
| 3 | **Chatbot Gemini (texto libre)** | Alta | PLAN_PRUEBAS § "Prueba sugerida: Chatbot Gemini" | Pendiente |
| 4 | **§J + Recomendación #14** (residente con asamblea activa) | Media | Mensaje bienvenida, correo en chat, card Votación, badge "Asamblea activa" | Opcional |
| 5 | **§K** – Mensaje y botones /residentes/chat | Media | Tras cerrar sesión: mensaje "chatbot para asambleas de PH"; solo flujo residente (no 4 perfiles) | Opcional |
| 6 | **Validación demo por perfil** | Media | Botones según contexto; mensaje "No hay asambleas programadas" cuando aplique | Opcional |
| 7 | **PH A y PH B assembly-context** | Media | GET /api/assembly-context → context activa/programada/sin_asambleas | Opcional |
| 8 | **Revalidación §E** (abandono de sala) | Baja | Tabla resident_abandon_events; API y flujo | Opcional |
| 9 | **Test Dashboard Admin PH con usuarios demo** | Alta | Navegación 2.1–2.9 por cada uno de los 5 usuarios (demo@, admin@torres, multilite@, multipro@, enterprise@); validación límites por plan; botones principales. Ver **QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md** y Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md. | Pendiente |

**Reportar cada resultado en:** QA/QA_FEEDBACK.md. **Informar al Contralor** al finalizar las pruebas 1, 2, 3 y 9.

---

## 2. Revisión: respuesta del chatbot (POST /api/chat/resident)

**Código:** `src/app/api/chat/resident/route.ts`

### Flujo actual de la respuesta

| Paso | Condición | Respuesta |
|------|-----------|-----------|
| 1 | Mensaje vacío | 400 – "message es requerido" |
| 2 | **Pregunta por nombre/identidad del bot** ("¿cómo te llamas?", "tu nombre", "quién eres", etc.) | Respuesta fija **sin llamar a Gemini**: "Me llamo Lex. Soy el asistente de Assembly 2.0 para votaciones, asambleas y gestión de tu PH. ¿En qué puedo ayudarte? Puedes usar los botones: Votación, Asambleas, Calendario, Tema del día o Ceder poder." |
| 3 | GEMINI_API_KEY no configurada | 503 – "Chat con Gemini no configurado (GEMINI_API_KEY)." |
| 4 | Cualquier otro mensaje | Se construye un **system prompt** con: contexto del usuario (correo, nombre, unidad, PH, estado asamblea, tema activo), **base de conocimiento** desde `docs/chatbot-knowledge-resident.md` (cómo votar, quórum, Ley 284), y **reglas**: identidad, saludos, "¿qué más hay?" / "ya estoy registrado" → ofrecer opciones y NUNCA "No encuentro ese correo"; "¿Cómo voto?" / "¿Cuál es el tema?" → instrucciones o tema activo. |
| 5 | Llamada a **Gemini** con ese prompt + historial (últimos 8 mensajes) + mensaje actual | Gemini devuelve texto → se devuelve como `reply`. |
| 6 | Gemini falla o devuelve vacío | **Fallback:** "Soy Lex, el asistente de Assembly 2.0 para tu PH. ¿En qué puedo ayudarte? Puedes usar los botones: Votación, Asambleas, Calendario, Tema del día o Ceder poder. O escríbeme tu consulta." |
| 7 | Cualquier excepción en POST | Mismo **fallback** anterior. |

### Reglas en el prompt (qué debe cumplir Lex)

- **NUNCA** pedir correo ni validación de email (el usuario ya está validado).
- **NUNCA** responder "No encuentro ese correo" a ningún mensaje.
- Identidad: "¿cómo te llamas?" etc. → respuesta fija Lex (además del paso 2, el prompt lo refuerza).
- "¿Qué más hay?" / "ya estoy registrado" → ofrecer opciones (Votación, Asambleas, Calendario, Tema del día, Ceder poder).
- "¿Cómo voto?" → instrucciones breves (link, Face ID, Sí/No/Abstención).
- "¿Cuál es el tema?" → indicar tema activo y ofrecer participar.

### Base de conocimiento cargada

- Archivo: `docs/chatbot-knowledge-resident.md` (hasta ~3500 caracteres).
- Incluye: cómo votar (pasos), quórum, Ley 284, Al Día vs En Mora, opciones del residente, reglas de no pedir correo ni "No encuentro ese correo".

### Qué debe validar QA (respuesta del chatbot)

| Caso de prueba | Acción | Resultado esperado |
|----------------|--------|---------------------|
| "¿Cómo te llamas?" | Enviar en chat (residente validado) | Respuesta fija: "Me llamo Lex. Soy el asistente de Assembly 2.0 para votaciones, asambleas y gestión de tu PH..." (sin llamar a Gemini). |
| "¿Qué más hay?" | Enviar en chat (residente validado) | Respuesta con opciones (Votación, Asambleas, Calendario, Tema del día, Ceder poder). **NO** "No encuentro ese correo". |
| "ya estoy registrado" | Enviar en chat (residente validado) | Confirmación y oferta de ayuda/opciones. **NO** pedir correo ni "No encuentro ese correo". |
| "¿Cómo voto?" | Enviar en chat (residente validado) | Respuesta coherente con instrucciones (link, Face ID, botones). Puede venir de Gemini o del conocimiento; si Gemini falla, al menos fallback amigable. |
| "¿Cuál es el tema?" | Enviar en chat (residente validado) | Indicar tema activo si hay, o ofrecer participar. |
| Sin GEMINI_API_KEY | Llamar POST /api/chat/resident con message | 503 o en UI mensaje tipo "Chat con Gemini no configurado". |
| Gemini falla o vacío | (simular o en entorno sin clave) | Respuesta de fallback: "Soy Lex, el asistente de Assembly 2.0 para tu PH..." con opciones. |

**Criterio de aprobación (Chatbot):** Con residente validado, el bot **nunca** responde "No encuentro ese correo" a texto libre; siempre ofrece opciones o instrucciones según el prompt y la base de conocimiento.

---

**Reportar en:** QA/QA_FEEDBACK.md (sección Chatbot Gemini o "Revisión respuesta del chatbot"). Informar al Contralor al finalizar.
