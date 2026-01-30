# ✅ CHECKLIST DE IMPLEMENTACIÓN - TAREA 2
## Para el Agente Coder - Chatbot IA con Gemini + Telegram

---

## 🎯 OBJETIVO

Verificar que **TAREA 2: CHATBOT IA CON GEMINI + TELEGRAM** está **100% implementada** antes de pasar a TAREA 3.

**Responsable:** Agente Coder  
**Revisor:** Agente QA  
**Tiempo estimado de implementación:** 8-11 horas (1-2 días)

---

## 📋 PREREQUISITOS COMPLETADOS

### **PASO 0: Lectura de Documentación**

- [ ] **Leí `SISTEMA_IDENTIFICACION_CHATBOT.md`** (35 min) ⭐ CRÍTICO
  - Entiendo los 3 tipos de IDs (Assembly ID, Unit ID, Invitation Code)
  - Conozco los 4 flujos de registro
  - Sé cómo funciona la identificación

- [ ] **Leí `BASE_CONOCIMIENTO_CHATBOT_LEX.md`** (30 min)
  - Conozco los 6 perfiles de usuario
  - Tengo las 100+ preguntas frecuentes
  - Entiendo las reglas de escalación

- [ ] **Leí `FLUJO_IDENTIFICACION_USUARIO.md`** (15 min)
  - Entiendo el orden: identificar → escalar → buscar KB → Gemini

---

## 🔑 PASO 1: API KEYS OBTENIDAS

### **1.1 Telegram Bot**
- [ ] Creé el bot en @BotFather
- [ ] Obtuve el token del bot
- [ ] Token guardado en `.env.local` como `TELEGRAM_BOT_TOKEN`
- [ ] Comandos configurados en @BotFather:
  - [ ] `/start` - Iniciar conversación
  - [ ] `/demo` - Activar Demo GRATIS
  - [ ] `/ayuda` - Obtener ayuda
  - [ ] `/soporte` - Contactar soporte humano

### **1.2 Google Gemini API**
- [ ] Creé cuenta en Google AI Studio
- [ ] Obtuve API key de Gemini
- [ ] API key guardada en `.env.local` como `GEMINI_API_KEY`
- [ ] Probé la API key (funciona)

### **1.3 Variables de Entorno**
- [ ] Archivo `.env.local` creado con:
  ```
  TELEGRAM_BOT_TOKEN=123456789:ABC...
  GEMINI_API_KEY=AIza...
  NEXT_PUBLIC_SUPABASE_URL=https://...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_KEY=eyJ...
  NODE_ENV=development
  ```
- [ ] Archivo `.env.local` agregado a `.gitignore`

---

## 📦 PASO 2: DEPENDENCIAS INSTALADAS

### **2.1 NPM Packages**
- [ ] Instalé `node-telegram-bot-api`
- [ ] Instalé `@google/generative-ai`
- [ ] Instalé `@types/node-telegram-bot-api` (dev)
- [ ] Instalé `nodemon` (dev, opcional)
- [ ] Instalé `ts-node` (dev, opcional)

### **2.2 Scripts en package.json**
- [ ] Agregué script `"chatbot": "ts-node src/chatbot/index.ts"`
- [ ] Agregué script `"chatbot:dev": "nodemon --watch src/chatbot --exec ts-node src/chatbot/index.ts"`

### **2.3 Verificación**
- [ ] Ejecuté `npm install` sin errores
- [ ] Verifiqué que `node_modules` tiene los paquetes

---

## 🗄️ PASO 3: TABLAS EN SUPABASE CREADAS

### **3.1 Tablas del Chatbot**
- [ ] Tabla `chatbot_conversations` creada
- [ ] Tabla `chatbot_actions` creada
- [ ] Tabla `chatbot_metrics` creada

### **3.2 Tablas de Identificación (NUEVO)**
- [ ] Tabla `user_identities` creada
- [ ] Tabla `invitation_codes` creada
- [ ] Columna `assembly_id` agregada a tabla `users`
- [ ] Columnas de identificación agregadas a `chatbot_conversations`:
  - [ ] `identity_code`
  - [ ] `identity_type`
  - [ ] `organization_id`
  - [ ] `unit_id`

### **3.3 Funciones SQL**
- [ ] Función `validate_invitation_code()` creada
- [ ] Función `increment_invitation_uses()` creada
- [ ] Función `calculate_chatbot_daily_metrics()` creada

### **3.4 Vistas SQL**
- [ ] Vista `chatbot_active_conversations` creada
- [ ] Vista `chatbot_identity_metrics` creada (opcional)

### **3.5 Índices**
- [ ] Todos los índices creados (verificar en Supabase)

### **3.6 Verificación**
- [ ] Ejecuté el SQL completo sin errores
- [ ] Verifiqué que las tablas existen en Supabase UI
- [ ] Probé insertar un registro de prueba en `chatbot_conversations`

---

## 💻 PASO 4: CÓDIGO IMPLEMENTADO

### **4.1 Estructura de Carpetas**
- [ ] Carpeta `src/chatbot/` creada
- [ ] Carpeta `src/chatbot/utils/` creada
- [ ] Carpeta `src/chatbot/contexts/` creada (opcional)
- [ ] Carpeta `src/chatbot/handlers/` creada (opcional)

### **4.2 Archivo: `src/chatbot/knowledge-base.ts`** ⭐ NUEVO
- [ ] Archivo creado
- [ ] Type `UserType` definido
- [ ] Interface `KnowledgeEntry` definida
- [ ] Array `KNOWLEDGE_BASE` con al menos 10 entradas
- [ ] Función `identifyUserType()` implementada
- [ ] Función `searchKnowledge()` implementada
- [ ] Función `adaptResponseToUser()` implementada
- [ ] Función `requiresEscalation()` implementada (acepta userType y context)

### **4.3 Archivo: `src/chatbot/utils/identification.ts`** ⭐ NUEVO
- [ ] Archivo creado
- [ ] Interface `UserIdentity` definida
- [ ] Función `identifyUser()` implementada (busca por identity_code y telegram_id)
- [ ] Función `generateAssemblyId()` implementada
- [ ] Función `generateUnitId()` implementada
- [ ] Función `validateInvitationCode()` implementada
- [ ] Función `registerAdmin()` implementada
- [ ] Función `registerOwner()` implementada

### **4.4 Archivo: `src/chatbot/config.ts`**
- [ ] Archivo creado
- [ ] Constantes de configuración definidas
- [ ] Prompts por contexto definidos (landing, demo, customer, support)
- [ ] Quick replies definidos

### **4.5 Archivo: `src/chatbot/utils/supabase.ts`**
- [ ] Archivo creado
- [ ] Cliente de Supabase inicializado
- [ ] Función `getUserContext()` implementada
- [ ] Función `saveMessage()` implementada
- [ ] Función `upsertLeadFromConversation()` implementada
- [ ] Función `logAction()` implementada
- [ ] Función `createTicketAndEscalate()` implementada ⭐ NUEVO
- [ ] Función `getConversationHistory()` implementada

### **4.6 Archivo: `src/chatbot/utils/gemini.ts`**
- [ ] Archivo creado
- [ ] Cliente de Gemini inicializado
- [ ] Función `generateResponse()` implementada
- [ ] Manejo de errores implementado

### **4.7 Archivo: `src/chatbot/index.ts`** (BOT PRINCIPAL)
- [ ] Archivo creado
- [ ] Bot de Telegram inicializado
- [ ] Comando `/start` implementado
- [ ] Comando `/demo` implementado
- [ ] Comando `/ayuda` implementado
- [ ] Comando `/soporte` implementado

#### **Handler de Mensajes (INTEGRACIÓN COMPLETA)**
- [ ] **PASO 1:** Identificación de usuario implementada
  - [ ] Llama a `identifyUser()` primero
  - [ ] Si no identificado, solicita identity_code
  - [ ] Detecta códigos de invitación (INV-XXXX-XXX)
  - [ ] Detecta Assembly/Unit IDs (ASM-XXXX-XXX o XXXX-XXX)

- [ ] **PASO 2:** Verificación de escalación implementada
  - [ ] Llama a `requiresEscalation()` con userType y context
  - [ ] Escala según prioridad (urgent, high, medium, low)
  - [ ] Crea ticket con `createTicketAndEscalate()`

- [ ] **PASO 3:** Búsqueda en Knowledge Base implementada
  - [ ] Llama a `searchKnowledge()` filtrado por userType
  - [ ] Adapta respuesta con `adaptResponseToUser()`
  - [ ] Personaliza con datos del usuario (nombre, unidad, estado)

- [ ] **PASO 4:** Fallback a Gemini implementado
  - [ ] Construye prompt contextual con datos del usuario
  - [ ] Llama a `generateResponse()` con historial
  - [ ] Guarda conversación en BD

### **4.8 Archivo: `src/chatbot/handlers/invitation.ts`** (OPCIONAL)
- [ ] Handler para códigos de invitación implementado
- [ ] Flujo de auto-registro completado

---

## 🧪 PASO 5: TESTING FUNCIONAL

### **5.1 Test Básico: Bot Inicia**
- [ ] Ejecuté `npm run chatbot`
- [ ] Vi mensaje: "🤖 Chatbot Assembly 2.0 iniciado con éxito!"
- [ ] Bot responde a mensajes en Telegram
- [ ] No hay errores en consola

### **5.2 Test: Comandos**
- [ ] `/start` → Bot saluda y explica qué puede hacer
- [ ] `/demo` → Bot ofrece activar demo
- [ ] `/ayuda` → Bot muestra ayuda
- [ ] `/soporte` → Bot ofrece contacto con humano

### **5.3 Test: Identificación de Usuario Nuevo (Admin)**
- [ ] Usuario nuevo envía "Soy administrador"
- [ ] Bot pregunta cantidad de edificios
- [ ] Bot califica lead
- [ ] Bot ofrece demo
- [ ] Usuario acepta demo
- [ ] Bot solicita nombre, email, nombre del PH
- [ ] Sistema crea organización en BD
- [ ] Sistema crea usuario con rol 'admin'
- [ ] Sistema genera Assembly ID (ASM-XXXX-001)
- [ ] Bot responde con el Assembly ID
- [ ] Registro se guarda en `user_identities`
- [ ] Lead se guarda en `platform_leads`

### **5.4 Test: Identificación de Usuario Existente (Admin)**
- [ ] Usuario registrado envía su Assembly ID (ASM-URBA-001)
- [ ] Bot identifica al usuario en <1 segundo
- [ ] Bot saluda por nombre
- [ ] Bot muestra información de su organización
- [ ] Bot NO pregunta email ni datos ya conocidos
- [ ] `last_interaction_at` se actualiza en BD
- [ ] `conversation_count` se incrementa

### **5.5 Test: Código de Invitación (Propietario Nuevo)**
- [ ] Usuario envía código de invitación (INV-URBA-XJ2K9L)
- [ ] Bot valida el código
- [ ] Bot muestra nombre de la organización
- [ ] Bot solicita nombre, email, número de unidad
- [ ] Sistema crea usuario con rol 'owner'
- [ ] Sistema crea unidad (status: pending_validation)
- [ ] Sistema genera Unit ID (URBA-10A)
- [ ] Bot responde con el Unit ID
- [ ] Registro se guarda en `user_identities` (pending_validation)
- [ ] `current_uses` del código se incrementa

### **5.6 Test: Propietario Registrado**
- [ ] Usuario envía su Unit ID (URBA-10A)
- [ ] Bot identifica al propietario en <1 segundo
- [ ] Bot saluda por nombre
- [ ] Bot muestra: unidad, estado de pago, coeficiente
- [ ] Bot NO pregunta datos ya conocidos

### **5.7 Test: Base de Conocimiento**
- [ ] Usuario pregunta "¿Qué es Assembly 2.0?"
- [ ] Bot responde de knowledge base (SIN llamar a Gemini)
- [ ] Respuesta es rápida (<1 segundo)
- [ ] Respuesta está adaptada al tipo de usuario

### **5.8 Test: Escalación Automática**
- [ ] Usuario dice "Necesito un abogado"
- [ ] Bot detecta tema legal
- [ ] Bot escala según tipo de usuario (cliente=urgent, visitante=high)
- [ ] Ticket se crea en `platform_tickets`
- [ ] Bot responde que se creó ticket
- [ ] Conversación continúa disponible

### **5.9 Test: Adaptación de Respuestas**
- [ ] Propietario pregunta "¿Cómo funciona el quórum?"
- [ ] Bot responde con lenguaje simple (sin términos técnicos)
- [ ] Admin pregunta lo mismo
- [ ] Bot responde con lenguaje técnico + tip de configuración

### **5.10 Test: Gemini Fallback**
- [ ] Usuario hace pregunta NO en knowledge base
- [ ] Bot llama a Gemini API
- [ ] Bot incluye contexto del usuario en el prompt
- [ ] Respuesta es coherente y contextual
- [ ] Conversación se guarda en BD

### **5.11 Test: Persistencia**
- [ ] Usuario conversa 5 mensajes
- [ ] Cierro el bot
- [ ] Reinicio el bot
- [ ] Usuario regresa (envía su ID)
- [ ] Bot recuerda el historial
- [ ] Conversación continúa naturalmente

---

## 📊 PASO 6: VERIFICACIÓN EN BASE DE DATOS

### **6.1 Tabla `chatbot_conversations`**
- [ ] Al menos 1 conversación registrada
- [ ] Campo `messages` contiene array de mensajes
- [ ] Campo `stage` está correcto (landing, demo, customer, support)
- [ ] Campo `identity_code` se llena correctamente
- [ ] Campo `identity_type` está correcto (admin, owner, visitor)
- [ ] Campo `last_message_at` se actualiza

### **6.2 Tabla `user_identities`**
- [ ] Al menos 1 admin registrado
- [ ] Al menos 1 propietario registrado (si probaste auto-registro)
- [ ] Campo `identity_code` es único
- [ ] Campo `telegram_id` está vinculado
- [ ] Campo `conversation_count` se incrementa
- [ ] Campo `last_interaction_at` se actualiza

### **6.3 Tabla `invitation_codes`**
- [ ] Código de prueba existe (si lo creaste manualmente)
- [ ] Campo `current_uses` se incrementa al usar
- [ ] Campo `status` cambia a 'exhausted' cuando se agota

### **6.4 Tabla `chatbot_actions`**
- [ ] Acciones se registran (demo_created, escalated_to_human, etc.)
- [ ] Campo `action_type` está correcto
- [ ] Campo `conversation_id` vincula correctamente

### **6.5 Tabla `platform_leads`**
- [ ] Lead se crea cuando admin nuevo registra demo
- [ ] Campos `name`, `email`, `telegram_id` están completos
- [ ] Campo `funnel_stage` está correcto

### **6.6 Tabla `platform_tickets`** (si probaste escalación)
- [ ] Ticket se crea al escalar
- [ ] Campo `priority` está correcto según tipo de usuario
- [ ] Campo `category` está correcto (legal, technical, billing, etc.)
- [ ] Campo `assigned_to_admin` = true

---

## 🔒 PASO 7: SEGURIDAD Y VALIDACIONES

### **7.1 Variables de Entorno**
- [ ] `.env.local` NO está en Git (verificar `.gitignore`)
- [ ] API keys NO están hardcodeadas en el código
- [ ] Supabase Service Key se usa solo en backend

### **7.2 Validaciones de Input**
- [ ] Bot valida formato de Assembly ID (ASM-XXXX-XXX)
- [ ] Bot valida formato de Unit ID (XXXX-XXX)
- [ ] Bot valida formato de código de invitación (INV-XXXX-XXX)
- [ ] Bot valida email con regex básico
- [ ] Bot maneja inputs vacíos sin crashear

### **7.3 Manejo de Errores**
- [ ] Bot no crashea si Supabase está caído
- [ ] Bot no crashea si Gemini API falla
- [ ] Bot muestra mensaje amigable al usuario si hay error
- [ ] Errores se loggean en consola para debugging

### **7.4 Rate Limiting**
- [ ] Implementé rate limiting básico (opcional pero recomendado)
- [ ] Bot previene spam de mensajes

---

## 📝 PASO 8: DOCUMENTACIÓN Y COMENTARIOS

### **8.1 Comentarios en el Código**
- [ ] Funciones principales tienen comentarios explicativos
- [ ] Lógica compleja tiene comentarios inline
- [ ] TODOs están marcados si hay algo pendiente

### **8.2 README del Chatbot** (Opcional)
- [ ] Creé `src/chatbot/README.md` con instrucciones
- [ ] Documenté cómo iniciar el bot
- [ ] Documenté comandos disponibles
- [ ] Documenté estructura de archivos

---

## ✅ CHECKLIST FINAL DE ENTREGA

### **Funcionalidades Core**
- [ ] ✅ Bot responde a mensajes en Telegram
- [ ] ✅ Sistema de identificación funciona (Assembly ID, Unit ID, Codes)
- [ ] ✅ Base de conocimiento responde instantáneamente
- [ ] ✅ Escalación automática a humano funciona
- [ ] ✅ Adaptación de respuestas según tipo de usuario
- [ ] ✅ Gemini API funciona como fallback
- [ ] ✅ Conversaciones se guardan en BD
- [ ] ✅ Historial persiste entre sesiones

### **Calidad de Código**
- [ ] ✅ Sin errores de TypeScript
- [ ] ✅ Sin errores en consola al iniciar
- [ ] ✅ Código sigue estructura modular
- [ ] ✅ Funciones están separadas por responsabilidad

### **Testing**
- [ ] ✅ Probé los 11 escenarios de testing
- [ ] ✅ Verifiqué datos en Supabase
- [ ] ✅ Bot no crashea con inputs inesperados

### **Documentación**
- [ ] ✅ Leí los 3 documentos principales
- [ ] ✅ Entiendo cómo funciona cada componente
- [ ] ✅ Puedo explicar el flujo completo

---

## 🚦 ESTADO DE LA TAREA

**Marcar UNO:**

- [ ] ✅ **COMPLETA** - Todos los checkboxes marcados, listo para QA
- [ ] ⚠️ **EN PROGRESO** - Falta implementar: ___________________
- [ ] ❌ **BLOQUEADA** - Tengo problema con: ___________________

---

## 📅 INFORMACIÓN DE ENTREGA

**Fecha de inicio:** ___________  
**Fecha de finalización:** ___________  
**Tiempo total invertido:** ___________ horas

**Comentarios adicionales:**
```
[Agrega aquí cualquier observación, problema encontrado, 
o sugerencia de mejora]
```

---

## 🔄 PRÓXIMO PASO

Una vez COMPLETA esta tarea:
1. ✅ Marca "COMPLETA" arriba
2. ✅ Notifica al Agente QA para auditoría
3. ✅ QA usa `CHECKLIST_QA_TAREA_2.md` para validar
4. ✅ Si QA aprueba → Pasar a **TAREA 3: DASHBOARD ADMIN PLATAFORMA**

---

**Firma del Coder:** ___________  
**Fecha:** ___________
