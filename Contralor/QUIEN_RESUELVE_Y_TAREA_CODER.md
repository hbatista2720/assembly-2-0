# Quién resuelve qué + Tarea para Coder

**Fecha:** Febrero 2026  
**Referencia:** Contralor/ESTATUS_AVANCE.md

---

## 1. Quién lo debe resolver (por agente)

| Agente | Qué resuelve | Dónde está la instrucción |
|--------|----------------|---------------------------|
| **Database** | Ejecutar **97_platform_leads.sql** en la BD para que GET /api/leads no devuelva 500 (habilitar funnel/leads desde BD). | ESTATUS_AVANCE § "Para Database"; QA reportó bloqueador. Comando: `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/97_platform_leads.sql` |
| **Database** | (Si aplica) Ejecutar script Face ID 101 si la columna `face_id_enabled` no existe. | ESTATUS_AVANCE § coordinación próxima tarea. |
| **QA** | Revisar avances Dashboard Henry (APIs, resumen ejecutivo, tickets, CRM, export CSV, navegación). | ESTATUS_AVANCE § "Para QA – Revisar avances Dashboard Henry"; QA_REPORTE_DASHBOARD_HENRY. |
| **QA** | Re-validar bug verify-otp: con PIN correcto no debe aparecer "Error al verificar"; residente debe entrar al chat validado. | ESTATUS_AVANCE § "Para QA" (re-validación verify-otp). La corrección ya está en código. |
| **QA** | Validar Chatbot Gemini (texto libre: "¿Qué más hay?", "ya estoy registrado" → respuestas coherentes, nunca "No encuentro ese correo"). | QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § "Prueba sugerida: Chatbot Gemini"; LISTA_PRUEBAS_QA_Y_RESPUESTA_CHATBOT.md. |
| **QA** | (Opcional) §J/rec 14, §K, validación demo por perfil, assembly-context, §E. | QA/LISTA_PRUEBAS_QA_Y_RESPUESTA_CHATBOT.md. |
| **Coder** | **§K – Mensaje y botones en /residentes/chat** (ver abajo). | ESTATUS_AVANCE § "Para CODER – §K Mensaje y botones en página chatbot residentes". |
| **Coder** | **Dashboard Admin PH – mejoras visuales y reglas (R1–R8)** | Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. ESTATUS_AVANCE § "Para CODER – Dashboard Admin PH: mejoras visuales y reglas". Prioridad: R1, R2, R3, R4, R8; opcional R5, R6, R7. |
| **Henry** | Autorizar backup cuando corresponda; ejecutar `git push origin main` (credenciales locales). | ESTATUS_AVANCE § protocolo backup. |
| **Contralor** | Asignar tareas, registrar historial, coordinar siguiente paso. | ESTATUS_AVANCE. |

---

## 2. Tarea para Coder (pendiente)

**Única tarea de código pendiente asignada al Coder:**

### Tarea 2 para Coder: Dashboard Admin PH – mejoras visuales y reglas (orden Marketing Feb 2026)

**Documento:** Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md

**Reglas prioritarias:** R1 Plan actual visible · R2 Modificar suscripción accesible · R3 Botón "← Volver al Dashboard" en subpáginas · R4 Lista de PHs al entrar · R8 Página Suscripción clara ("Tu plan actual" arriba). Opcional: R5 Selector de PH, R6 Sidebar colapsable, R7 Menú agrupado. **Agregar:** Planes de pago único (Evento Único, Dúo Pack, etc.) visibles/accesibles en el dashboard Admin PH (ej. en Suscripción). Referencia: MARKETING_PRECIOS_COMPLETO.md. Al finalizar, informar al Contralor.

---

### §K – Mensaje y botones en página chatbot residentes (orden Marketing 07 Feb 2026)

**Problema:** En `/residentes/chat`, tras cerrar sesión (o al cargar sin validar), el residente ve:
- Mensaje incorrecto: "Eres Lex, asistente de Assembly 2.0. **Califica leads y ofrece demos.**" (es copy para B2B, no para residentes).
- Los **4 botones de perfil** (Administrador PH, Junta Directiva, Residente, Solo demo) visibles; en esa página solo debe estar el flujo residente.

**Tareas para el Coder:**

1. **En /residentes/chat:** Cambiar el mensaje inicial/bienvenida a algo como: *"Soy Lex, chatbot para asambleas de PH (propiedades horizontales)."* **No** usar "Califica leads y ofrece demos". Ese mensaje al cargar la página de residentes o al mostrar estado no validado.
2. **En /residentes/chat:** **No** mostrar los 4 botones de perfil (Admin, Junta, Residente, Demo). Solo el flujo residente: validar correo si no está validado, o pills (Votación, Asambleas, etc.) si ya está validado.
3. Los 4 perfiles (Admin, Junta, Residente, Demo) solo en la **landing** (`/`).

**Referencia:** Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §K y recomendación 14.  
**Al finalizar:** Confirmar al Contralor.  
**Bloque en ESTATUS_AVANCE:** "Para CODER – §K Mensaje y botones en página chatbot residentes (orden Marketing 07 Feb 2026)".

---

## 3. Resumen rápido

| Responsable | Acción |
|-------------|--------|
| **Database** | Ejecutar 97_platform_leads.sql en la BD. |
| **QA** | Revisar Dashboard Henry, re-validar PIN chatbot, validar Chatbot Gemini (y opcionales). |
| **Coder** | Implementar §K: mensaje y botones en /residentes/chat (mensaje para residentes; sin 4 perfiles en esa página). |
| **Henry** | Autorizar backup y hacer push cuando corresponda. |
