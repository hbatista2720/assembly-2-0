# 📖 REGLAS PARA EL CODER
**Lectura: 5 minutos | Obligatorio antes de empezar**

---

## 🚫 REGLA #1: NO CREAR ARCHIVOS NUEVOS

❌ **NUNCA crear:**
- Archivos `.md` de documentación (salvo versiones de backup)
- Carpetas en la raíz del proyecto
- Scripts personales o notas

## 📦 EXCEPCIÓN: SISTEMA DE VERSIONADO

**Solo para `LANDING_PAGE_ESTRATEGIA.md` mantener 2 versiones:**

Cuando actualices:
```bash
# 1. Eliminar v1 vieja
rm LANDING_PAGE_ESTRATEGIA_v1_*

# 2. Respaldar actual
cp LANDING_PAGE_ESTRATEGIA.md "LANDING_PAGE_ESTRATEGIA_v1_$(date +%Y-%m-%d).md"

# 3. Editar versión actual
```

Resultado:
- ✅ `LANDING_PAGE_ESTRATEGIA.md` (actual)
- ✅ `LANDING_PAGE_ESTRATEGIA_v1_FECHA.md` (backup)

✅ **SÍ actualizar:**
- Archivos en `src/` (tu zona de trabajo)
- `schema.sql` (agregar al final)
- `package.json` (vía `npm install`)
- `.env.local` (agregar variables)

---

## 📂 DÓNDE TRABAJAR

```
✅ SOLO TRABAJAR AQUÍ:

src/
├── app/         → Páginas y rutas Next.js
├── components/  → Componentes React
├── lib/         → Lógica de negocio
└── chatbot/     → Código del chatbot

✅ ACTUALIZAR:

schema.sql       → Agregar tablas al final
package.json     → npm install paquete
.env.local       → Agregar API keys

❌ NO TOCAR:

*.md             → Docs del arquitecto (solo lectura)
Raíz del proyecto → No crear carpetas aquí
```

---

## 📋 CÓMO USAR LOS DOCUMENTOS

### **TAREA_X** (ej: TAREA_2_CHATBOT_GEMINI_TELEGRAM.md)
- **Qué es:** Tutorial paso a paso con código
- **Cuándo usar:** Mientras implementas
- **Acción:** Leer y seguir instrucciones

### **CHECKLIST_CODER_TAREA_X**
- **Qué es:** Lista de verificación
- **Cuándo usar:** En paralelo con TAREA_X
- **Acción:** Marcar ✅ mientras implementas

### **CHECKLIST_QA_TAREA_X**
- **Qué es:** Auditoría de QA
- **Cuándo usar:** Después de terminar
- **Acción:** Esperar a que QA lo use (tú NO)

**Flujo:**
```
Lee TAREA_X → Implementa → Marca CHECKLIST_CODER → Notifica QA
```

---

## 🎯 CASOS DE USO RÁPIDOS

### Necesito crear una función nueva
```typescript
// ❌ NO: Crear src/utils/mi-funcion.ts
// ✅ SÍ: Agregar a archivo existente

// src/lib/quorum.ts (si es de quorum)
export function nuevaFuncion(...) { }
```

### Necesito un componente nuevo
```typescript
// ✅ Crear: src/components/MiComponente.tsx
export function MiComponente() {
  return <div>...</div>
}
```

### Necesito agregar tabla a BD
```sql
-- ✅ Actualizar: schema.sql (al final)

-- ============================================
-- TAREA 2: Chatbot IA
-- ============================================
CREATE TABLE nueva_tabla (...);
```

### Necesito instalar dependencia
```bash
# ✅ Usar npm install
npm install nombre-paquete

# ❌ NO editar package.json manualmente
```

---

## 📊 MAPA RÁPIDO

| Tipo de código | Dónde va | Ejemplo |
|----------------|----------|---------|
| Página | `src/app/` | `page.tsx` |
| API | `src/app/api/` | `route.ts` |
| Componente | `src/components/` | `Button.tsx` |
| Lógica | `src/lib/` | `quorum.ts` |
| Chatbot | `src/chatbot/` | `index.ts` |
| BD | `schema.sql` | Agregar al final |

---

## 🏗️ ARQUITECTURA DEL PROYECTO

**3 capas complementarias:**

1. **ARQUITECTURA_ASSEMBLY_2.0.md** = Backend + BD (fundación)
2. **ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md** = Frontend para Henry
3. **ARQUITECTURA_DASHBOARD_ADMIN_PH.md** = Frontend para clientes

Los dashboards USAN el backend de ASSEMBLY_2.0 y agregan tablas nuevas. No hay conflicto.

---

## ✅ ORDEN DE LECTURA

### Al inicio (1 vez):
1. `README_CODER.md` - Guía rápida (10 min)
2. `INDICE.md` - Mapa completo (10 min)
3. `ESTRUCTURA_TAREAS_Y_PERFILES.md` - Roles y tareas (20 min)
4. `ARQUITECTURA_ASSEMBLY_2.0.md` - Entender backend (45 min)

### Antes de cada tarea:
- **TAREA 2:** Lee `SISTEMA_IDENTIFICACION_CHATBOT.md`, `BASE_CONOCIMIENTO_CHATBOT_LEX.md`
- **TAREA 3:** Lee `ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md`
- **TAREA 4:** Lee `ARQUITECTURA_DASHBOARD_ADMIN_PH.md`

---

## 💡 TIPS IMPORTANTES

### Identificación de usuario PRIMERO
```typescript
// ✅ CORRECTO
const userIdentity = await identifyUser(telegramId);
const { shouldEscalate } = requiresEscalation(message, userIdentity.type, context);

// ❌ INCORRECTO
const { shouldEscalate } = requiresEscalation(message); // Sin tipo de usuario
```

### Knowledge Base antes de Gemini
```typescript
// ✅ CORRECTO (buscar en KB primero)
const answer = searchKnowledge(message, userType);
if (answer) return answer; // Respuesta instantánea

// Luego Gemini si no hay respuesta
const response = await generateResponse(...);
```

---

## 📞 CUÁNDO CONSULTAR

**Consulta antes de:**
- ✅ Crear carpeta nueva
- ✅ Crear archivo `.md`
- ✅ Instalar dependencia > 100kb
- ✅ Cambiar estructura del proyecto

**NO necesitas consultar:**
- ✅ Agregar funciones a archivos existentes
- ✅ Crear componentes en `src/components/`
- ✅ Actualizar `schema.sql`
- ✅ Crear rutas API en `src/app/api/`

---

## 🎯 CHECKLIST ANTES DE CREAR ARCHIVO

- [ ] ¿Ya existe archivo similar?
- [ ] ¿Puedo agregar a uno existente?
- [ ] ¿Va en `src/` o estoy creando basura?
- [ ] ¿He leído esta guía?

Si las 4 son ✅, entonces consulta al arquitecto.

---

## 🎉 MANTRA

```
🚫 "¿Puedo crear este archivo?"
   → Respuesta: Probablemente NO

✅ "¿Dónde actualizo esto?"
   → Busca archivo existente primero
```

---

**Objetivo:** Proyecto limpio, código organizado, menos archivos innecesarios.

**Última actualización:** 2026-01-27
