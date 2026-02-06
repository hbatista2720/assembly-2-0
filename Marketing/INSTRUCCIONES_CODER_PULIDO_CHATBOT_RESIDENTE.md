# 🤖 INSTRUCCIONES PARA EL CODER: Pulido de Chatbot (Perfil Residente)
**Objetivo:** Adaptar la experiencia de Lex para residentes (sin tono de ventas), con acciones operativas reales, deep links funcionales y copy seguro/legal.

---

## 🏛️ REFERENCIA TÉCNICA
*   **Arquitectura Base:** `Arquitecto/ARQUITECTURA_CHATBOT_IA.md`
*   **Flujo de Identidad:** `Arquitecto/FLUJO_IDENTIFICACION_USUARIO.md`

---

## 🛠️ TAREAS DE IMPLEMENTACIÓN

### 1. Sistema de "Context Switching" (Detección de Rol)
El chatbot debe dejar de tratar a todos como "Leads de Venta".
*   **Lógica:** Si el usuario selecciona el botón "Residente" o si el sistema detecta una sesión activa de residente:
    *   **Título:** Cambiar "Lex · Asistente de Demo" ➡️ **"Lex · Asistente de Asamblea"**.
    *   **Subtítulo:** Cambiar "Ventas B2B · Assembly 2.0" ➡️ **"Soporte Residente · [Nombre del PH]"**.
    *   **Footer:** Ocultar el mensaje *"Te contactamos en menos de 24 horas..."*. Mostrar: *"Conectado a la red segura de tu PH"*.

### 2. Lógica de Validación de Correo (Residente) – CRÍTICO
**Problema actual:** Los botones de residente se muestran siempre tras ingresar email, aunque el correo NO esté validado.

**Lógica correcta:**
- **Si correo NO encontrado:** Mostrar mensaje *"No encuentro ese correo. Contacta al administrador de tu PH para validar."* y **NO mostrar** los botones Votación, Asambleas, etc. Permitir reintentar con otro correo.
- **Si correo SÍ encontrado:** Mostrar *"Correo reconocido. Te conecto con tu administrador."* y **SÍ mostrar** los botones.
- **Implementación:** Añadir estado `residentEmailValidated` (boolean). Mostrar botones solo cuando `chatRole === "residente" && residentEmailValidated === true`. No avanzar a `chatStep(8)` si el correo no fue validado.
- **Referencia detallada:** Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md

### 3. Deep Linking en Botones de Acción
Los botones actuales en la interfaz del chat (Imagen 2) deben tener rutas específicas:
*   **Botón "Votación":** 
    *   Si hay una asamblea activa: Redirigir a `/residentes/votacion`.
    *   Si no hay votación: Mostrar mensaje en chat: *"No hay votaciones activas en este momento. Te avisaré cuando inicie la próxima."*
*   **Botón "Asambleas":** Redirigir a `/residentes/asambleas`.
*   **Botón "Ceder Poder":** Redirigir a `/residentes/poder`.
*   **Botón "Calendario":** Redirigir a `/residentes/calendario`.

**Estado actual (implementado):**
*   ✅ Rutas residentes creadas:
    - `/residentes/votacion`
    - `/residentes/asambleas`
    - `/residentes/calendario`
    - `/residentes/tema-del-dia`
    - `/residentes/poder`
*   ✅ Botones de acciones rápidas ya navegan a estas rutas.
*   🔶 Pendiente: lógica de "asamblea activa" para habilitar/deshabilitar botones.

### 4. Flujo de Validación Biométrica (Marketing de Seguridad)
Para residentes, Lex debe ser el guardián de la seguridad.
*   **Interacción:** Al ingresar el correo, si Lex lo encuentra en la base de datos de `public.users`:
    *   **Respuesta:** *"Hola [Nombre], te he encontrado. Por seguridad legal (Ley 284), para habilitar tu voto necesito que valides tu identidad."*
    *   **Acción:** Mostrar botón **"Validar con Face ID / Touch ID"**.
    *   **Éxito:** Una vez validado, Lex debe decir: *"Identidad verificada. Tus votos ahora están firmados digitalmente."*

### 5. Mejora del Copy (Conversational UX)
*   **Lex Humano:** Eliminar frases robóticas. Lex debe sonar como un conserje digital de lujo.
*   **Base de Conocimiento:** Lex debe ser capaz de responder:
    *   *"¿Cuál es mi coeficiente?"* ➡️ Consultar tabla `residentes`.
    *   *"¿Estoy al día?"* ➡️ Consultar `payment_status`.

---

## 🎨 CHECKLIST VISUAL
- [ ] El avatar de Lex (esfera brillante) debe tener un pulso de color diferente para residentes (ej. Azul/Cian en lugar de Púrpura).
- [ ] Los botones del chat deben tener el mismo estilo que los del Dashboard de Residente (Glassmorphism).
- [ ] El scroll de la conversación debe ser automático hacia abajo cuando Lex responda.

---

## ✅ VALIDACIONES RECIENTES
- API `/api/chatbot/config` responde OK desde PostgreSQL.
- Prompt `landing` para bot web se puede actualizar y persistir en BD.

---
**Prioridad:** 🔴 ALTA (Es el punto de entrada principal del usuario)
**Autor:** Marketing B2B Specialist & Product Designer
