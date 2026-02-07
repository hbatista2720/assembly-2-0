# 📋 Sugerencia: Chatbot más inteligente con razonamiento y Gemini

**Fecha:** 07 Febrero 2026  
**Responsable:** Marketing B2B  
**Referencia:** Validación captura – residente con asamblea activa  

---

## 🚨 PROBLEMA DETECTADO (Validación Henry – Captura 07 Feb 2026)

**Escenario:** Residente 2 validado, asamblea activa "Aprobación de presupuesto 2026". El residente pregunta:
- *"que mas brindar hay otro tema?"* (¿Qué más hay, hay otro tema?)
- *"ya toy registrado"* (Ya estoy registrado – aclarando que no está pidiendo validar correo)

**Comportamiento actual:**
- El chatbot responde: *"No encuentro ese correo. Contacta al administrador de tu PH para validar. Puedes escribir otro correo para reintentar."*
- Ante la aclaración del usuario, **repite el mismo mensaje** – no razona ni entiende el contexto.

**Causa raíz:**
- El chatbot trata **todo mensaje de texto** como si fuera un intento de validar correo electrónico.
- No existe rama para "residente ya validado que escribe preguntas libres".
- **No está conectado a Gemini** ni a una base de conocimiento para razonar y responder en contexto.

---

## 🎯 OBJETIVO

1. **Razonar más:** El chatbot debe interpretar la intención del usuario (pregunta sobre temas, aclaración de estado, etc.), no solo buscar un correo.
2. **Conectar con Gemini:** Cuando el residente ya está validado y envía texto libre, usar un modelo de lenguaje (Gemini) para generar respuestas contextuales.
3. **Actualizar base de conocimiento:** Incluir contexto de residente validado, asamblea activa, temas del día, votación, etc.
4. **Validar conexión Gemini:** Comprobar que la API de Gemini está configurada y responde correctamente.

---

## 📐 RECOMENDACIONES TÉCNICAS

### 1. Ramificar lógica por estado del residente

| Estado | Mensaje del usuario | Acción |
|--------|---------------------|--------|
| **Residente NO validado** (chatStep 3) | Texto que parece email | Validar correo (flujo actual) |
| **Residente pendiente PIN** (chatStep 4) | Código 6 dígitos o "Reenviar PIN" | Verificar OTP |
| **Residente VALIDADO** (chatStep ≥ 8, residentEmailValidated) | **Cualquier texto libre** | **Llamar a Gemini** (o API de chat) con contexto |

### 2. Crear API de chat para residente validado

- **Ruta sugerida:** `POST /api/chat/resident` (o similar)
- **Entrada:** `{ message: string, context: { email, organizationId, assemblyContext, temaActivo, ... } }`
- **Proceso:**
  1. Construir prompt con contexto (residente, asamblea activa, tema del día, etc.)
  2. Incluir base de conocimiento filtrada para residentes (Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md – PERFIL 5)
  3. Llamar a **Gemini API** (Google AI) con el mensaje y el historial reciente
  4. Devolver respuesta generada

### 3. Contexto mínimo a enviar a Gemini

```yaml
Contexto residente:
  - email: string
  - nombre: string (o "Residente N")
  - unidad: string
  - organization_name: string
  - assemblyContext: "activa" | "programada" | "sin_asambleas"
  - temaActivo: { titulo, descripcion } (si hay asamblea activa)

Instrucción al modelo:
  - Eres Lex, asistente de Assembly 2.0 para residentes.
  - El usuario ya está validado. NO pedir correo ni validación.
  - Si pregunta por "otro tema", "qué más hay", etc., responde según el tema activo y las opciones (Votación, Asambleas, Calendario, Tema del día, Ceder poder).
  - Usa la base de conocimiento para residentes (cómo votar, qué es quórum, etc.).
  - Responde en español, de forma breve y amigable.
```

### 4. Actualizar base de conocimiento

- Añadir **bloque "Residente validado – preguntas en contexto de asamblea"** en `BASE_CONOCIMIENTO_CHATBOT_LEX.md`:
  - Preguntas tipo: "¿Qué más hay?", "¿Hay otro tema?", "Ya estoy registrado", "¿Cómo voto?", "¿Cuál es el tema?"
  - Respuestas que usen el contexto (tema activo, asamblea, etc.)

### 5. Verificar conexión Gemini

- Comprobar variable de entorno `GEMINI_API_KEY` o equivalente.
- Endpoint/configuración de Google AI (Gemini) en el proyecto.
- Test simple: enviar mensaje de prueba y validar que la API responde.

---

## 📂 ARCHIVOS RELACIONADOS

| Archivo | Uso |
|---------|-----|
| `src/app/chat/page.tsx` | Agregar rama: si `residentEmailValidated && chatStep >= 8`, llamar API chat en lugar de validar correo |
| `src/app/page.tsx` | Igual si el chatbot está en la landing |
| `Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md` | Añadir sección "Residente validado – contexto asamblea" |
| Nuevo: `src/app/api/chat/resident/route.ts` | API que llama a Gemini con contexto residente |

---

## ✅ CHECKLIST PARA EL CODER

- [ ] Crear `POST /api/chat/resident` que reciba mensaje + contexto y llame a Gemini
- [ ] En `handleChatSubmit` (chat/page.tsx y page.tsx): si `residentEmailValidated && chatRole === "residente" && chatStep >= 8`, **no** tratar el texto como email; en su lugar, llamar a la API de chat
- [ ] Configurar/verificar `GEMINI_API_KEY` (o equivalente) en variables de entorno
- [ ] Incluir en el prompt: base de conocimiento para residentes + contexto de asamblea y tema activo
- [ ] Probar: residente validado escribe "¿Qué más hay?" o "ya estoy registrado" → respuesta coherente (no "No encuentro ese correo")

---

**Referencia:** Contralor/ESTATUS_AVANCE.md. Esta sugerencia se asigna al **Coder** vía Contralor.
