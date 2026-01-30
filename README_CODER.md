# 📖 GUÍA RÁPIDA PARA EL CODER
## Assembly 2.0 - Instrucciones de Implementación

**Estado Actual:** ⏳ TAREA 2 en progreso (90% completada)  
**Siguiente:** Completar tests → Notificar QA → TAREA 3 (Dashboard Admin Plataforma)

---

## 📊 PROGRESO RÁPIDO

```
✅ TAREA 1: Supabase          [████████████] 100%
⏳ TAREA 2: Chatbot IA        [███████████░] 90%
📋 TAREA 3: Dashboard Henry   [░░░░░░░░░░░░] 0%
📋 TAREA 4: Dashboard PH      [░░░░░░░░░░░░] 0%

Total del proyecto: 45% completado
```

---

## 🎯 ¿POR DÓNDE EMPIEZO?

### **PASO 0: REGLAS BÁSICAS** ⭐⭐⭐ **MUY IMPORTANTE**

🚫 **ANTES QUE NADA, LEE ESTO:**

**`REGLAS_CODER.md`** (5 min) 🔴 **OBLIGATORIO**
- ❌ NO crear archivos `.md` nuevos
- ❌ NO crear carpetas en la raíz
- ✅ ACTUALIZAR archivos existentes
- ✅ TRABAJAR solo en `src/`
- 📋 Cómo usar TAREA + CHECKLIST
- 🎯 Casos de uso rápidos

**Guía corta y directa. Léela primero para evitar errores.**

---

### **PASO 1: Lee estos documentos PRIMERO** (30 minutos)

En este orden:

1. **`INDICE.md`** (10 min)
   - Mapa completo del proyecto
   - Índice de todos los documentos
   - Tiempos de lectura

2. **`ESTRUCTURA_TAREAS_Y_PERFILES.md`** (20 min) ⭐ **CRÍTICO**
   - Entender los 4 perfiles de usuario
   - Qué dashboard tiene cada uno
   - Orden de las 4 tareas
   - Aclaración completa del proyecto

3. **`README.md`** (5 min)
   - Overview general del proyecto

---

## 🚀 PASO 2: IMPLEMENTA TAREA 2 (8-11 horas)

### **A. Lectura Previa OBLIGATORIA** (80 minutos)

Lee estos documentos ANTES de escribir código:

1. **`SISTEMA_IDENTIFICACION_CHATBOT.md`** (35 min) ⭐⭐⭐
   - Sistema de IDs formales (Assembly ID, Unit ID, Codes)
   - 4 flujos de registro completos
   - Reduce 70% de carga del chatbot

2. **`BASE_CONOCIMIENTO_CHATBOT_LEX.md`** (30 min) ⭐⭐⭐
   - 100+ preguntas frecuentes con respuestas
   - 6 perfiles de usuario
   - Reglas de escalación a humano

3. **`FLUJO_IDENTIFICACION_USUARIO.md`** (15 min) ⭐⭐
   - Flujo visual del chatbot
   - Por qué identificar PRIMERO es crítico

### **B. Implementación Paso a Paso**

Sigue este documento:

- **`TAREA_2_CHATBOT_GEMINI_TELEGRAM.md`** (guía completa)
  - 5 pasos con código incluido
  - SQL para tablas
  - Código TypeScript completo
  - Escenarios de testing

### **C. Validación Continua**

Mientras implementas, marca los checkboxes:

- **`CHECKLIST_CODER_TAREA_2.md`** (ir marcando ✅)
  - 8 secciones de validación
  - 100+ checkboxes
  - Tests funcionales

### **D. Notificar cuando termines**

Al completar TODO:
1. Marca `CHECKLIST_CODER_TAREA_2.md` como **COMPLETA**
2. Notifica a QA: "TAREA 2 lista para auditoría"
3. QA ejecutará `CHECKLIST_QA_TAREA_2.md`

---

## ⏳ PASO 3: ESPERA APROBACIÓN DE QA

QA validará:
- ✅ Todo funciona
- ✅ Código de calidad
- ✅ Sin errores críticos

**Posibles resultados:**
- ✅ **APROBADO** → Pasa a TAREA 3 o 4
- ⚠️ **APROBADO CON OBSERVACIONES** → Corrige en paralelo con siguiente tarea
- ❌ **RECHAZADO** → Corrige antes de continuar

---

## 🎯 PASO 4: IMPLEMENTA TAREA 3 O 4

(Henry decidirá cuál primero)

### **TAREA 3: Dashboard Admin Plataforma** (para Henry)
- **Lectura:** `ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md` (45 min)
- **Implementación:** `TAREA_3_DASHBOARD_ADMIN_INTELIGENTE.md`
- **Tiempo:** 2-3 semanas

### **TAREA 4: Dashboard Admin PH** (para clientes)
- **Lectura:** `ARQUITECTURA_DASHBOARD_ADMIN_PH.md` (60 min)
- **Implementación:** *TAREA_4_DASHBOARD_ADMIN_PH.md* (pendiente crear)
- **Tiempo:** 3-4 semanas

---

## 📂 ¿QUÉ ARCHIVOS DEBO LEER?

### **🏗️ Arquitectura (Solo lectura, para contexto)**

Estos archivos explican CÓMO debe funcionar. **No los implementes literalmente**, solo úsalos para entender el diseño:

| Archivo | Cuándo leer | Propósito |
|---------|-------------|-----------|
| `ARQUITECTURA_ASSEMBLY_2.0.md` | Inicio | Visión general del proyecto |
| `ARQUITECTURA_CHATBOT_IA.md` | Antes de TAREA 2 | Especificación del chatbot |
| `ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md` | Antes de TAREA 3 | Dashboard para Henry |
| `ARQUITECTURA_DASHBOARD_ADMIN_PH.md` | Antes de TAREA 4 | Dashboard para clientes |
| `SISTEMA_IDENTIFICACION_CHATBOT.md` | Antes de TAREA 2 | Sistema de IDs ⭐ |
| `BASE_CONOCIMIENTO_CHATBOT_LEX.md` | Antes de TAREA 2 | Knowledge base ⭐ |
| `FLUJO_IDENTIFICACION_USUARIO.md` | Antes de TAREA 2 | Flujo lógico ⭐ |
| `DIAGRAMA_ERD.md` | Cuando necesites | Diagrama de BD |
| `DIAGRAMA_RELACIONES.md` | Cuando necesites | Diagramas visuales |
| `VISTA_PRESENTACION_TIEMPO_REAL.md` | Fase avanzada | Vista de presentación |

### **📋 Tareas (Implementar paso a paso)**

Estos archivos **SÍ debes seguir** e implementar:

| Archivo | Estado | Acción |
|---------|--------|--------|
| `TAREA_1_DOCKER_LOCAL.md` | ✅ Completa | Solo referencia |
| `TAREA_2_CHATBOT_GEMINI_TELEGRAM.md` | ⏳ En progreso | **Implementar AHORA** ⭐ |
| `TAREA_3_DASHBOARD_ADMIN_INTELIGENTE.md` | 📋 Pendiente | Después de QA |
| ~~`TAREA_4_DASHBOARD_ADMIN_PH.md`~~ | ❌ No existe aún | Crear después |

### **✅ Checklists (Marcar mientras trabajas)**

| Archivo | Cuándo usar |
|---------|-------------|
| `CHECKLIST_CODER_TAREA_2.md` | Durante TAREA 2 ⭐ |
| `CHECKLIST_QA_TAREA_2.md` | QA lo usa (tú esperas) |
| ~~`CHECKLIST_QA.md`~~ | ❌ No usar (genérico, obsoleto) |

### **🎨 Marketing/Landing (Solo si implementas landing)**

| Archivo | Propósito |
|---------|-----------|
| `MARKETING_PRECIOS_COMPLETO.md` ⭐ | **Único doc con TODO** (precios, funcionalidades, testimonios) |
| `LANDING_PAGE_ESTRATEGIA.md` | Estrategia de landing page |
| `INSTRUCCIONES_CODER_LANDING_PRICING.md` | Implementar landing |

**Nota:** Eliminamos `PAQUETES_Y_PRECIOS.md` (era redundante).  
TODO está en `MARKETING_PRECIOS_COMPLETO.md`.

### **🗄️ Base de Datos**

| Archivo | Propósito |
|---------|-----------|
| `schema.sql` | Estructura completa de BD ⭐ |

---

## 🚫 ¿QUÉ ARCHIVOS NO DEBO LEER?

Estos archivos **NO son para ti** (son para marketing, stakeholders, etc.):

- ❌ `RESUMEN_MARKETING_B2B.md` (para marketing)
- ❌ `RESUMEN_EJECUTIVO_MEJORAS.md` (para stakeholders)
- ❌ `CHECKLIST_MEJORAS_UI_UX.md` (fase 2, no ahora)
- ❌ `ROADMAP_IMPLEMENTACION.md` (opcional, plan general)
- ❌ `CHECKLIST_QA.md` (obsoleto, usa los específicos)

---

## 💡 TIPS IMPORTANTES

### **1. Siempre identifica al usuario PRIMERO**
```typescript
// ✅ CORRECTO (paso 1: identificar)
const userIdentity = await identifyUser(telegramId);

// ✅ CORRECTO (paso 2: escalar considerando tipo)
const { shouldEscalate } = requiresEscalation(
  message, 
  userIdentity.identityType, 
  context
);

// ❌ INCORRECTO (escala sin saber quién es)
const { shouldEscalate } = requiresEscalation(message);
```

### **2. Usa Knowledge Base antes de Gemini**
```typescript
// ✅ CORRECTO (buscar en KB primero)
const knowledgeEntry = searchKnowledge(message, userType);
if (knowledgeEntry) {
  return knowledgeEntry.answer; // Respuesta instantánea
}
// Si no está en KB, entonces usar Gemini
const response = await generateResponse(...);
```

### **3. Adapta respuestas según tipo de usuario**
```typescript
// ✅ CORRECTO
const answer = adaptResponseToUser(response, userType);
// Propietario: lenguaje simple
// Admin: lenguaje técnico + tips
```

---

## 🐛 ¿TIENES DUDAS O PROBLEMAS?

### **Antes de preguntar:**

1. ✅ **Revisa `INDICE.md`** - tiene TODO indexado
2. ✅ **Busca en el CHECKLIST_CODER** de tu tarea
3. ✅ **Lee la sección de Troubleshooting** en la TAREA
4. ✅ **Verifica logs de consola** para errores

### **Si aún tienes dudas:**

Consulta con:
- 🏗️ **Arquitecto (Henry)** - para dudas de diseño
- 🔍 **QA** - para dudas de testing
- 📖 **Documentación** - para referencia técnica

---

## 📊 ESTADO DEL PROYECTO

```
✅ TAREA 1: Configuración Supabase → COMPLETA
⏳ TAREA 2: Chatbot IA → EN PROGRESO (80%)
📋 TAREA 3: Dashboard Admin Plataforma → PENDIENTE
📋 TAREA 4: Dashboard Admin PH → PENDIENTE
```

---

## 🎯 TU MISIÓN ACTUAL

**COMPLETAR TAREA 2:**
1. ✅ Leer 3 documentos (80 min)
2. ✅ Implementar chatbot (8-11 horas)
3. ✅ Marcar CHECKLIST_CODER_TAREA_2.md
4. ✅ Notificar a QA

**Tiempo estimado total:** 1-2 días

---

## 🚀 ¡ÉXITO!

Recuerda:
- 📖 **Lee antes de codear** (evita errores)
- ✅ **Marca checkboxes** (no olvides nada)
- 🧪 **Prueba mientras implementas** (no dejes testing para el final)
- 💬 **Pregunta si tienes dudas** (mejor preguntar que asumir)

---

**Última actualización:** 2026-01-27  
**Autor:** Arquitecto Assembly 2.0
