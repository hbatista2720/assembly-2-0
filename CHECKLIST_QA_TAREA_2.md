# 🔍 CHECKLIST DE CALIDAD (QA) - TAREA 2
## Auditoría de Implementación del Chatbot IA

---

## 🎯 OBJETIVO

Validar que el **Chatbot IA con Gemini + Telegram** (TAREA 2) cumple con:
- ✅ Todos los requisitos funcionales
- ✅ Estándares de calidad de código
- ✅ Performance aceptable
- ✅ Seguridad básica
- ✅ Integración correcta con BD

**Responsable:** Agente QA  
**Prerequisito:** Coder marcó `CHECKLIST_CODER_TAREA_2.md` como COMPLETA  
**Tiempo estimado de auditoría:** 2-3 horas

---

## 📋 INSTRUCCIONES PARA QA

1. **Leer primero:**
   - `SISTEMA_IDENTIFICACION_CHATBOT.md`
   - `BASE_CONOCIMIENTO_CHATBOT_LEX.md`
   - `TAREA_2_CHATBOT_GEMINI_TELEGRAM.md`

2. **Revisar el checklist del Coder:**
   - Verificar que `CHECKLIST_CODER_TAREA_2.md` está 100% marcado

3. **Ejecutar esta auditoría:**
   - Marcar cada checkbox según validación
   - Anotar problemas encontrados en "ISSUES"
   - Asignar estado final: APROBADO / CON OBSERVACIONES / RECHAZADO

---

## 🔧 AUDITORÍA 1: CONFIGURACIÓN INICIAL

### **1.1 Variables de Entorno**
- [ ] Archivo `.env.local` existe
- [ ] Contiene `TELEGRAM_BOT_TOKEN`
- [ ] Contiene `GEMINI_API_KEY`
- [ ] Contiene variables de Supabase
- [ ] `.env.local` está en `.gitignore` (SEGURIDAD)

**Test:**
```bash
# Verificar que existe
ls -la .env.local

# Verificar que está en .gitignore
grep ".env.local" .gitignore
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **1.2 Dependencias NPM**
- [ ] `package.json` contiene `node-telegram-bot-api`
- [ ] `package.json` contiene `@google/generative-ai`
- [ ] Scripts `chatbot` y `chatbot:dev` están configurados
- [ ] `npm install` ejecuta sin errores

**Test:**
```bash
# Verificar package.json
cat package.json | grep telegram
cat package.json | grep generative-ai

# Probar instalación
npm install
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 🗄️ AUDITORÍA 2: BASE DE DATOS

### **2.1 Tablas Existentes**
- [ ] Tabla `chatbot_conversations` existe
- [ ] Tabla `chatbot_actions` existe
- [ ] Tabla `chatbot_metrics` existe
- [ ] Tabla `user_identities` existe ⭐
- [ ] Tabla `invitation_codes` existe ⭐
- [ ] Columna `assembly_id` en `users` existe ⭐

**Test:**
```sql
-- En Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'chatbot_conversations',
    'chatbot_actions',
    'chatbot_metrics',
    'user_identities',
    'invitation_codes'
  );
-- Debe retornar 5 filas

-- Verificar columna assembly_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'assembly_id';
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **2.2 Funciones SQL**
- [ ] Función `validate_invitation_code()` existe
- [ ] Función `increment_invitation_uses()` existe
- [ ] Función `calculate_chatbot_daily_metrics()` existe

**Test:**
```sql
-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'validate_invitation_code',
    'increment_invitation_uses',
    'calculate_chatbot_daily_metrics'
  );
-- Debe retornar 3 filas
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **2.3 Índices**
- [ ] Índice en `chatbot_conversations(session_id)`
- [ ] Índice en `chatbot_conversations(telegram_id)`
- [ ] Índice en `user_identities(identity_code)`
- [ ] Índice en `user_identities(telegram_id)`
- [ ] Índice en `invitation_codes(code)`

**Test:**
```sql
-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'chatbot_conversations', 
    'user_identities', 
    'invitation_codes'
  )
ORDER BY tablename, indexname;
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 💻 AUDITORÍA 3: ESTRUCTURA DE CÓDIGO

### **3.1 Archivos Requeridos Existen**
- [ ] `src/chatbot/index.ts` existe
- [ ] `src/chatbot/config.ts` existe
- [ ] `src/chatbot/knowledge-base.ts` existe ⭐
- [ ] `src/chatbot/utils/supabase.ts` existe
- [ ] `src/chatbot/utils/gemini.ts` existe
- [ ] `src/chatbot/utils/identification.ts` existe ⭐

**Test:**
```bash
# Verificar archivos
ls -la src/chatbot/
ls -la src/chatbot/utils/
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **3.2 Código Compila sin Errores**
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos
- [ ] Todas las importaciones se resuelven

**Test:**
```bash
# Compilar
npx tsc --noEmit

# Verificar imports
grep -r "import.*from" src/chatbot/
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **3.3 Funciones Críticas Implementadas**

#### **En `knowledge-base.ts`:**
- [ ] `identifyUserType()` existe y exporta
- [ ] `searchKnowledge()` existe y exporta
- [ ] `adaptResponseToUser()` existe y exporta
- [ ] `requiresEscalation()` existe y exporta
- [ ] `requiresEscalation()` acepta 3 parámetros (message, userType, context)
- [ ] `KNOWLEDGE_BASE` tiene al menos 5 entradas

**Test (abrir archivo y verificar):**
```typescript
// Verificar signatures
export function identifyUserType(message: string, context: any): UserType
export function searchKnowledge(userMessage: string, userType: UserType): KnowledgeEntry | null
export function adaptResponseToUser(response: string, userType: UserType): string
export function requiresEscalation(message: string, userType: UserType, context?: any): {...}
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

#### **En `utils/identification.ts`:**
- [ ] `identifyUser()` existe y exporta
- [ ] `generateAssemblyId()` existe y exporta
- [ ] `generateUnitId()` existe y exporta
- [ ] `validateInvitationCode()` existe y exporta
- [ ] `registerAdmin()` existe y exporta
- [ ] `registerOwner()` existe y exporta

**Test (verificar exports):**
```bash
grep "export function" src/chatbot/utils/identification.ts
# Debe mostrar las 6 funciones
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

#### **En `utils/supabase.ts`:**
- [ ] `createTicketAndEscalate()` existe y exporta ⭐
- [ ] `saveMessage()` existe y exporta
- [ ] `getUserContext()` existe y exporta

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

#### **En `index.ts` (Bot Principal):**
- [ ] Bot se inicializa correctamente
- [ ] Comando `/start` implementado
- [ ] Comando `/demo` implementado
- [ ] Handler de mensajes implementado
- [ ] **PASO 1:** Identificación de usuario implementada (llama a `identifyUser()`)
- [ ] **PASO 2:** Escalación implementada (llama a `requiresEscalation()`)
- [ ] **PASO 3:** KB implementada (llama a `searchKnowledge()`)
- [ ] **PASO 4:** Gemini fallback implementado

**Test (revisar flujo en código):**
```typescript
// Verificar orden de ejecución
bot.on('message', async (msg) => {
  // 1. Identificar
  const userIdentity = await identifyUser(...);
  
  // 2. Escalar
  const { shouldEscalate } = requiresEscalation(msg, userType, context);
  
  // 3. KB
  const knowledgeEntry = searchKnowledge(msg, userType);
  
  // 4. Gemini
  const response = await generateResponse(...);
});
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 🧪 AUDITORÍA 4: TESTING FUNCIONAL

### **4.1 Bot Inicia Correctamente**
- [ ] Ejecuté `npm run chatbot`
- [ ] Vi mensaje de inicio exitoso
- [ ] No hay errores en consola
- [ ] Bot responde a `/start` en Telegram

**Test:**
```bash
# Terminal 1: Iniciar bot
npm run chatbot

# Terminal 2 / Telegram: Probar
/start
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.2 Flujo: Admin Nuevo Registra Demo**

**Pasos:**
1. Usuario nuevo envía "Quiero probar demo"
2. Bot pregunta datos (nombre, email, nombre del PH)
3. Usuario responde
4. Bot crea organización
5. Bot genera Assembly ID (ASM-XXXX-001)
6. Bot responde con el ID

**Validaciones:**
- [ ] Bot responde correctamente en cada paso
- [ ] Assembly ID se genera con formato correcto
- [ ] Registro se crea en `user_identities`
- [ ] Lead se crea en `platform_leads`
- [ ] Organización se crea en `organizations`
- [ ] Usuario se crea en `users` con rol 'admin'

**Test SQL (después de completar flujo):**
```sql
-- Verificar registro en user_identities
SELECT * FROM user_identities 
WHERE identity_type = 'admin' 
ORDER BY created_at DESC 
LIMIT 1;
-- Debe mostrar el registro recién creado

-- Verificar Assembly ID
SELECT assembly_id FROM users 
WHERE email = '[email del test]';
-- Debe mostrar ASM-XXXX-XXX
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.3 Flujo: Admin Existente Regresa**

**Pasos:**
1. Usuario envía su Assembly ID (del test anterior)
2. Bot lo identifica en <1 segundo
3. Bot saluda por nombre
4. Bot NO pregunta datos

**Validaciones:**
- [ ] Bot identifica correctamente
- [ ] Saluda con el nombre correcto
- [ ] Muestra información de la organización
- [ ] No pide email ni datos ya conocidos
- [ ] `last_interaction_at` se actualiza en BD
- [ ] `conversation_count` se incrementa

**Test SQL:**
```sql
-- Verificar actualización
SELECT 
  identity_code,
  conversation_count,
  last_interaction_at
FROM user_identities 
WHERE identity_code = '[Assembly ID del test]';
-- conversation_count debe ser > 1
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.4 Flujo: Código de Invitación**

**Setup (crear código manualmente en BD):**
```sql
-- Crear código de prueba
INSERT INTO invitation_codes (code, organization_id, max_uses, expires_at, created_by)
SELECT 
  'INV-TEST-QA2024',
  id,
  5,
  NOW() + INTERVAL '30 days',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
FROM organizations LIMIT 1;
```

**Pasos:**
1. Usuario nuevo envía "INV-TEST-QA2024"
2. Bot valida el código
3. Bot pide nombre, email, número de unidad
4. Usuario responde
5. Bot crea registro (pending_validation)
6. Bot responde con Unit ID

**Validaciones:**
- [ ] Bot valida código correctamente
- [ ] Bot muestra nombre de la organización
- [ ] Unit ID se genera con formato correcto (XXXX-XXX)
- [ ] Registro se crea en `user_identities` con status 'pending_validation'
- [ ] `current_uses` del código se incrementa
- [ ] Unidad se crea en `units`

**Test SQL:**
```sql
-- Verificar código se incrementó
SELECT code, current_uses, max_uses 
FROM invitation_codes 
WHERE code = 'INV-TEST-QA2024';
-- current_uses debe ser 1

-- Verificar Unit ID
SELECT * FROM user_identities 
WHERE identity_type = 'owner' 
  AND status = 'pending_validation'
ORDER BY created_at DESC LIMIT 1;
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.5 Flujo: Base de Conocimiento**

**Pasos:**
1. Usuario identificado pregunta "¿Qué es Assembly 2.0?"
2. Bot responde INMEDIATAMENTE (sin esperar Gemini)
3. Respuesta viene de knowledge base

**Validaciones:**
- [ ] Respuesta es instantánea (<1 segundo)
- [ ] Respuesta coincide con entry en `KNOWLEDGE_BASE`
- [ ] No hay llamada a Gemini API (verificar logs)
- [ ] Acción `answered_from_kb` se registra en `chatbot_actions`

**Test (verificar en logs):**
```
# En consola del bot, NO debe aparecer:
"Llamando a Gemini API..."

# Debe aparecer:
"Respuesta de Knowledge Base"
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.6 Flujo: Escalación Automática**

**Test 1: Visitante dice "Necesito un abogado"**
- [ ] Bot escala con prioridad 'high' (no urgent)
- [ ] Ticket se crea en `platform_tickets`
- [ ] `priority` = 'high'
- [ ] Bot responde que se creó ticket

**Test 2: Cliente dice "Necesito un abogado"**
- [ ] Bot escala con prioridad 'urgent' 🚨
- [ ] Ticket se crea con prioridad 'urgent'
- [ ] Bot responde más rápido

**Test SQL:**
```sql
-- Verificar tickets
SELECT 
  ticket_number,
  priority,
  category,
  description
FROM platform_tickets 
ORDER BY created_at DESC 
LIMIT 2;
-- Debe mostrar los 2 tickets con prioridades correctas
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.7 Flujo: Adaptación de Respuestas**

**Test 1: Propietario pregunta sobre quórum**
- [ ] Respuesta usa lenguaje simple
- [ ] No usa términos técnicos
- [ ] Fácil de entender

**Test 2: Admin pregunta sobre quórum**
- [ ] Respuesta usa lenguaje técnico
- [ ] Incluye tip de configuración
- [ ] Menciona "Panel de Admin"

**Validación:**
Comparar ambas respuestas → deben ser DIFERENTES

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **4.8 Flujo: Gemini Fallback**

**Pasos:**
1. Usuario hace pregunta NO en knowledge base
2. Bot llama a Gemini API
3. Bot incluye contexto del usuario
4. Bot responde

**Validaciones:**
- [ ] Gemini API es llamada (verificar logs)
- [ ] Respuesta es coherente
- [ ] Respuesta menciona datos del usuario (nombre, unidad, etc.)
- [ ] Conversación se guarda en BD

**Test (verificar logs):**
```
# En consola del bot debe aparecer:
"Llamando a Gemini API..."
"Contexto: {userName, organizationName, ...}"
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 🔒 AUDITORÍA 5: SEGURIDAD

### **5.1 Variables Sensibles**
- [ ] API keys NO están hardcodeadas en el código
- [ ] `.env.local` está en `.gitignore`
- [ ] Supabase Service Key se usa solo en backend (no en frontend)

**Test:**
```bash
# Buscar strings sospechosas
grep -r "AIza" src/chatbot/
grep -r "eyJ" src/chatbot/
# NO debe encontrar nada
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **5.2 Validación de Inputs**
- [ ] Bot valida formato de Assembly ID
- [ ] Bot valida formato de Unit ID
- [ ] Bot valida formato de código de invitación
- [ ] Bot valida email con regex

**Test (enviar inputs inválidos):**
- "ASM123" (formato incorrecto) → Bot debe rechazar
- "test@" (email inválido) → Bot debe rechazar

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **5.3 Manejo de Errores**
- [ ] Bot no crashea si Supabase está caído
- [ ] Bot no crashea si Gemini API falla
- [ ] Bot muestra mensaje amigable al usuario

**Test (simular error):**
```typescript
// Temporalmente cambiar SUPABASE_URL a URL inválida
// Enviar mensaje al bot
// Bot debe responder: "Disculpa, tuve un problema..."
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## ⚡ AUDITORÍA 6: PERFORMANCE

### **6.1 Tiempo de Respuesta**
- [ ] Respuesta de KB: <1 segundo
- [ ] Identificación de usuario: <1 segundo
- [ ] Respuesta de Gemini: <3 segundos
- [ ] Bot no se cuelga con mensajes largos

**Test (medir tiempos):**
```bash
# Usar Date.now() en el código para medir
console.time('identificacion');
await identifyUser(...);
console.timeEnd('identificacion');
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **6.2 Queries a BD**
- [ ] No hay N+1 queries
- [ ] Se usan índices correctamente
- [ ] Queries complejas tardan <500ms

**Test (verificar en Supabase logs):**
```sql
-- Ver queries lentas
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 500
ORDER BY mean_exec_time DESC;
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 📊 AUDITORÍA 7: DATOS EN BD

### **7.1 Integridad de Datos**
- [ ] No hay registros huérfanos
- [ ] Foreign keys están correctas
- [ ] No hay datos NULL donde no deberían estar

**Test SQL:**
```sql
-- Verificar integridad
SELECT COUNT(*) FROM user_identities 
WHERE user_id IS NULL OR organization_id IS NULL;
-- Debe ser 0

SELECT COUNT(*) FROM chatbot_conversations 
WHERE messages IS NULL;
-- Debe ser 0
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **7.2 Timestamps**
- [ ] `created_at` se setea automáticamente
- [ ] `updated_at` se actualiza con trigger
- [ ] `last_interaction_at` se actualiza correctamente

**Test SQL:**
```sql
-- Verificar timestamps
SELECT 
  identity_code,
  created_at,
  updated_at,
  last_interaction_at
FROM user_identities 
ORDER BY created_at DESC 
LIMIT 5;
-- updated_at debe ser >= created_at
-- last_interaction_at debe ser >= created_at
```

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 📝 AUDITORÍA 8: CALIDAD DE CÓDIGO

### **8.1 Estructura y Organización**
- [ ] Código está modularizado
- [ ] Funciones tienen responsabilidad única
- [ ] No hay código duplicado
- [ ] Archivos no son excesivamente largos (>500 líneas)

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **8.2 Nomenclatura**
- [ ] Variables tienen nombres descriptivos
- [ ] Funciones tienen nombres claros
- [ ] No hay variables con nombres como `temp`, `x`, `data1`

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

### **8.3 Comentarios**
- [ ] Funciones principales tienen comentarios
- [ ] Lógica compleja está comentada
- [ ] No hay comentarios obsoletos

**Issues encontrados:**
```
[Anotar aquí si hay problemas]
```

---

## 🐛 ISSUES ENCONTRADOS (RESUMEN)

| # | Severidad | Descripción | Ubicación | Estado |
|---|-----------|-------------|-----------|--------|
| 1 | 🔴 Crítico |  |  | ⏳ Pendiente |
| 2 | 🟡 Media |  |  | ⏳ Pendiente |
| 3 | 🟢 Menor |  |  | ⏳ Pendiente |

**Severidades:**
- 🔴 **Crítico:** Bloquea la funcionalidad principal, debe corregirse antes de aprobar
- 🟡 **Media:** Funcionalidad afectada pero tiene workaround, debe corregirse pronto
- 🟢 **Menor:** Mejora o detalle estético, puede corregirse después

---

## ✅ DECISIÓN FINAL

**Marcar UNO:**

- [ ] ✅ **APROBADO** - Cumple todos los requisitos, listo para producción
- [ ] ⚠️ **APROBADO CON OBSERVACIONES** - Funciona pero tiene issues menores (listar arriba)
- [ ] ❌ **RECHAZADO** - Tiene issues críticos, debe corregirse (listar arriba)

---

## 📊 MÉTRICAS DE CALIDAD

**Cobertura de Testing:**
- Tests ejecutados: _____ / 11
- Tests exitosos: _____
- Tests fallidos: _____

**Calidad de Código:**
- Errores de TypeScript: _____
- Warnings: _____
- Code smells: _____

**Performance:**
- Tiempo promedio de respuesta KB: _____ ms
- Tiempo promedio de identificación: _____ ms
- Tiempo promedio de respuesta Gemini: _____ ms

---

## 📅 INFORMACIÓN DE AUDITORÍA

**Fecha de auditoría:** ___________  
**Tiempo invertido:** ___________ horas  
**Auditor:** ___________

**Comentarios adicionales del QA:**
```
[Agrega aquí observaciones generales, sugerencias de mejora,
o cualquier comentario relevante]
```

---

## 🔄 PRÓXIMOS PASOS

### **Si APROBADO:**
1. ✅ Notificar al Arquitecto
2. ✅ Notificar al Coder que puede pasar a **TAREA 3**
3. ✅ Archivar esta auditoría como referencia

### **Si APROBADO CON OBSERVACIONES:**
1. ⚠️ Crear lista de issues menores
2. ⚠️ Coder corrige en paralelo con TAREA 3
3. ⚠️ Seguimiento en próxima auditoría

### **Si RECHAZADO:**
1. ❌ Notificar al Coder con lista de issues críticos
2. ❌ Coder corrige antes de continuar
3. ❌ Re-auditar cuando Coder notifique correcciones

---

**Firma del QA:** ___________  
**Fecha:** ___________
