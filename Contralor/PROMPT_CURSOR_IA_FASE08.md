# 🤖 PROMPT PARA CURSOR IA - FASE 08: PRECIOS V4.0

**Agente:** Coder (Cursor IA)  
**Tarea:** Implementar sistema de precios v4.0  
**Tiempo estimado:** 1-2 días  
**Prioridad:** Alta

---

## 📋 CONTEXTO:

Marketing actualizó los precios a v4.0 con estos cambios principales:

1. **NUEVO PLAN:** Multi-PH Lite ($399/mes) - Plan intermedio entre Standard y Pro
2. **NUEVA REGLA:** "Lo que ocurra primero" - Si excede CUALQUIER límite (edificios, residentes o asambleas) → Upgrade requerido
3. **TRIGGER AL 90%:** Banner automático cuando alcance 90% de cualquier límite
4. **ENTERPRISE ILIMITADO:** Plan sin restricciones con validación de uso justo
5. **CRÉDITOS ACUMULABLES:** Sistema FIFO para asambleas no usadas (vencen a los 6 meses)

El Arquitecto ya validó técnicamente TODO. No hay bloqueadores.

---

## 📚 ARCHIVOS QUE DEBES LEER PRIMERO:

```
OBLIGATORIO LEER ANTES DE EMPEZAR:
├─ @Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md
│  (Código para FASE A, B, C)
└─ @Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md
   (Código para FASE D - Créditos)

REFERENCIAS SECUNDARIAS:
├─ @Marketing/MARKETING_PRECIOS_COMPLETO.md (Especificaciones v4.0)
├─ @Arquitecto/LIMITES_UNIDADES_POR_PLAN.md (Sistema de límites)
└─ @Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (Arquitectura actual)
```

---

## 🎯 TU TAREA:

Implementa el sistema de precios v4.0 en 5 fases:

### **FASE A: BASE DE DATOS**

```sql
-- 1. Agrega el nuevo plan al enum
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'MULTI_PH_LITE';

-- 2. Agrega campo para límite total de residentes (suma de todos los edificios)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS max_units_total_all_orgs INT;

-- 3. Agrega campo para validar uso justo en Enterprise
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS company_tax_id TEXT;

-- 4. Actualiza límites de planes existentes
UPDATE subscriptions SET max_units_total_all_orgs = 250 WHERE plan_tier = 'STANDARD';
UPDATE subscriptions SET max_units_total_all_orgs = 1500 WHERE plan_tier = 'MULTI_PH_LITE';
UPDATE subscriptions SET max_units_total_all_orgs = 5000 WHERE plan_tier = 'MULTI_PH_PRO';
UPDATE subscriptions SET max_units_total_all_orgs = NULL WHERE plan_tier = 'ENTERPRISE';

-- 5. Crea 3 funciones SQL:
--    a) check_multi_ph_lite_limits(subscription_id UUID) RETURNS JSONB
--    b) check_plan_limits(subscription_id UUID) RETURNS BOOLEAN
--    c) is_unlimited_plan(subscription_id UUID) RETURNS BOOLEAN
--
-- CÓDIGO COMPLETO: Ver @Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 95-245
```

**Archivos a crear:**
- `src/lib/db/migrations/008_add_multi_ph_lite_plan.sql`
- `src/lib/db/functions/check_multi_ph_lite_limits.sql`
- `src/lib/db/functions/check_plan_limits.sql`
- `src/lib/db/functions/is_unlimited_plan.sql`

---

### **FASE B: BACKEND API**

```typescript
// 1. Endpoint para obtener límites actuales
// GET /api/subscription/:subscriptionId/limits
// RETORNA: { organizations: {...}, units: {...}, assemblies: {...}, needs_upgrade: bool, show_banner: bool }

// 2. Middleware para validar límites antes de crear recursos
// validateSubscriptionLimits(userId, subscriptionId, actionType)
// LANZA ERROR 403 si excede límites

// 3. Actualiza endpoints existentes:
//    - POST /api/organizations → Agrega validación de límites ANTES de insertar
//    - POST /api/assemblies → Agrega validación de límites ANTES de insertar

// CÓDIGO COMPLETO: Ver @Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md
```

**Archivos a crear:**
- `src/app/api/subscription/[subscriptionId]/limits/route.ts`
- `src/lib/middleware/validateSubscriptionLimits.ts`

**Archivos a modificar:**
- `src/app/api/organizations/route.ts` (agregar validación)
- `src/app/api/assemblies/route.ts` (agregar validación)

---

### **FASE C: FRONTEND**

```typescript
// 1. PricingSelector - Toggle "Soy un PH" vs "Soy Administradora/Promotora"
// 2. ROICalculator - Sugiere plan basado en inputs (edificios, residentes, asambleas)
// 3. EnterprisePlanCard - Tarjeta premium con badge dorado
// 4. useUpgradeBanner - Hook que detecta 90% de cualquier límite
// 5. UpgradeBanner - Componente de alerta amarilla
// 6. Actualiza /pricing con nuevo plan Multi-PH Lite
// 7. Integra UpgradeBanner en dashboard admin-ph

// CÓDIGO COMPLETO Y DISEÑO: Ver @Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 391-551
```

**Archivos a crear:**
- `src/components/pricing/PricingSelector.tsx`
- `src/components/pricing/ROICalculator.tsx`
- `src/components/pricing/EnterprisePlanCard.tsx`
- `src/hooks/useUpgradeBanner.ts`
- `src/components/UpgradeBanner.tsx`

**Archivos a modificar:**
- `src/app/pricing/page.tsx` (agregar nuevo plan y componentes)
- `src/app/dashboard/admin-ph/page.tsx` (integrar UpgradeBanner)

---

### **FASE D: CRÉDITOS ACUMULABLES**

```sql
-- 1. Crear tabla de créditos
CREATE TABLE assembly_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  earned_month DATE NOT NULL,  -- Primer día del mes
  credits_earned INT NOT NULL,
  credits_used INT NOT NULL DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_earned - credits_used) STORED,
  expires_at TIMESTAMP NOT NULL,  -- 6 meses después
  is_expired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Función para consumir créditos (FIFO)
CREATE FUNCTION consume_assembly_credits(p_organization_id UUID, p_credits_needed INT)
RETURNS JSONB;
-- Consume créditos más viejos primero

-- 3. Función para expirar créditos
CREATE FUNCTION expire_old_credits()
RETURNS TABLE(expired_count INT, total_credits_lost INT);

-- 4. Scripts cron:
--    - grant-monthly-credits.ts (ejecutar día 1 de cada mes)
--    - expire-assembly-credits.ts (ejecutar diario)

-- 5. Endpoint API:
--    GET /api/assembly-credits/[orgId]
--    Retorna: { total_available, expiring_soon, all_credits }

-- 6. UI:
--    - Hook: useAssemblyCredits()
--    - Componente: AssemblyCreditsDisplay
--    - Mostrar: "Tienes 5 créditos (2 vencen en 15 días)"
--    - Alerta: 30 días antes de expirar

-- 7. Modificar POST /api/assemblies:
--    - Consumir créditos antes de crear asamblea
--    - Rollback si falla la creación

// CÓDIGO COMPLETO: Ver @Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md
```

**Archivos a crear:**
- `src/lib/db/migrations/009_assembly_credits.sql`
- `src/lib/db/functions/consume_assembly_credits.sql`
- `src/lib/db/functions/expire_old_credits.sql`
- `scripts/grant-monthly-credits.ts`
- `scripts/expire-assembly-credits.ts`
- `src/app/api/assembly-credits/[organizationId]/route.ts`
- `src/hooks/useAssemblyCredits.ts`
- `src/components/AssemblyCreditsDisplay.tsx`

**Archivos a modificar:**
- `src/app/api/assemblies/route.ts` (consumir créditos + rollback)

**Cron jobs a configurar:**
```bash
# Otorgar créditos mensuales (día 1 de cada mes)
0 1 1 * * cd /var/www/assembly && node scripts/grant-monthly-credits.js

# Expirar créditos viejos (diario 2 AM)
0 2 * * * cd /var/www/assembly && node scripts/expire-assembly-credits.js
```

---

### **FASE E: TESTING**

```typescript
// Crea tests para:
// 1. Función check_plan_limits() - Valida regla "lo que ocurra primero"
// 2. Endpoint GET /api/subscription/:id/limits
// 3. Bloqueo al exceder límites (POST /api/organizations y /api/assemblies)
// 4. Componente UpgradeBanner
// 5. Sistema de créditos FIFO - Consume más viejos primero
// 6. Expiración automática de créditos a los 6 meses
// 7. Alerta de UI 30 días antes de expirar
// 8. Test manual end-to-end del flujo completo
```

**Archivos a crear:**
- `tests/db/check_plan_limits.test.ts`
- `tests/db/consume_assembly_credits.test.ts`
- `tests/api/subscription-limits.test.ts`
- `tests/api/assembly-credits.test.ts`
- `tests/integration/subscription-limits.test.ts`
- `tests/integration/assembly-credits-fifo.test.ts`
- `tests/components/UpgradeBanner.test.tsx`
- `tests/components/AssemblyCreditsDisplay.test.tsx`

---

## 📊 NUEVOS LÍMITES POR PLAN:

```
┌──────────────────┬──────────┬───────────┬────────────┬─────────┐
│ PLAN             │ PRECIO   │ ASAMBLEAS │ RESIDENTES │ PHs     │
├──────────────────┼──────────┼───────────┼────────────┼─────────┤
│ EVENTO ÚNICO     │ $225     │ 1         │ 250        │ 1       │
│ DÚO PACK         │ $389     │ 2         │ 250        │ 1       │
│ STANDARD         │ $189/mes │ 2/mes     │ 250        │ 1       │
│ MULTI-PH LITE    │ $399/mes │ 5/mes     │ 1,500      │ 10      │ ← NUEVO
│ MULTI-PH PRO     │ $699/mes │ 15/mes    │ 5,000      │ 30      │
│ ENTERPRISE       │ $2,499   │ ∞         │ ∞          │ ∞       │
└──────────────────┴──────────┴───────────┴────────────┴─────────┘

REGLA CLAVE: "LO QUE OCURRA PRIMERO"
→ Si excede CUALQUIER límite (PHs, residentes o asambleas) = Upgrade requerido
```

---

## 🔑 LÓGICA PRINCIPAL:

### **Regla "Lo que ocurra primero":**

```typescript
// Ejemplo de validación
function needsUpgrade(current, limits): boolean {
  return (
    current.organizations > limits.organizations ||
    current.units > limits.units ||
    current.assemblies > limits.assemblies
  );
}

// Ejemplo: Cliente con Multi-PH Lite
// Límites: 10 PHs, 1,500 residentes, 5 asambleas/mes

// Caso A: 11 PHs, 800 residentes, 3 asambleas
// → UPGRADE (excedió PHs)

// Caso B: 8 PHs, 1,600 residentes, 4 asambleas
// → UPGRADE (excedió residentes)

// Caso C: 7 PHs, 1,200 residentes, 6 asambleas
// → UPGRADE (excedió asambleas)
```

### **Trigger al 90%:**

```typescript
// Mostrar banner cuando CUALQUIER límite alcance 90%
const showBanner = (
  (current.organizations / limits.organizations) >= 0.90 ||
  (current.units / limits.units) >= 0.90 ||
  (current.assemblies / limits.assemblies) >= 0.90
);
```

---

## ✅ CHECKLIST DE VALIDACIÓN:

Marca cada item al completarlo:

```
FASE A - BASE DE DATOS:
[ ] Enum plan_tier incluye 'MULTI_PH_LITE'
[ ] Campo max_units_total_all_orgs agregado
[ ] Campo company_tax_id agregado
[ ] Función check_multi_ph_lite_limits() creada
[ ] Función check_plan_limits() creada
[ ] Función is_unlimited_plan() creada
[ ] Límites de planes actualizados

FASE B - BACKEND:
[ ] GET /api/subscription/:id/limits funcional
[ ] Middleware validateSubscriptionLimits creado
[ ] POST /api/organizations valida límites
[ ] POST /api/assemblies valida límites
[ ] Errores 403 con mensajes claros

FASE C - FRONTEND:
[ ] PricingSelector funcional
[ ] ROICalculator sugiere plan correcto
[ ] EnterprisePlanCard con diseño gold
[ ] useUpgradeBanner detecta 90%
[ ] UpgradeBanner se muestra correctamente
[ ] /pricing actualizado con Multi-PH Lite
[ ] Dashboard admin-ph muestra banner

FASE D - CRÉDITOS ACUMULABLES:
[ ] Tabla assembly_credits creada
[ ] Función consume_assembly_credits() (FIFO)
[ ] Función expire_old_credits()
[ ] Script grant-monthly-credits.ts
[ ] Script expire-assembly-credits.ts
[ ] GET /api/assembly-credits/[orgId]
[ ] Hook useAssemblyCredits()
[ ] Componente AssemblyCreditsDisplay
[ ] POST /api/assemblies consume créditos
[ ] Rollback de créditos si falla creación
[ ] Cron jobs configurados

FASE E - TESTING:
[ ] Tests unitarios de funciones SQL
[ ] Tests de FIFO (consume más viejos primero)
[ ] Tests de expiración (6 meses)
[ ] Tests de endpoints API
[ ] Tests de integración
[ ] Tests de componentes React
[ ] Test: Alerta aparece 30 días antes de expirar
[ ] Test manual end-to-end

VALIDACIÓN FINAL:
[ ] Cliente Standard NO puede crear 2do edificio
[ ] Cliente Multi-PH Lite puede crear hasta 10 edificios
[ ] Banner aparece al 90% de cualquier límite
[ ] Enterprise permite crear recursos ilimitados
[ ] Créditos no usados se acumulan correctamente
[ ] FIFO: Consume créditos más viejos primero
[ ] Créditos expiran a los 6 meses automáticamente
[ ] UI muestra alerta 30 días antes de expirar
[ ] No hay errores en consola
[ ] No hay warnings de TypeScript
```

---

## 🚨 IMPORTANTE:

1. **LEE PRIMERO:** `@Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md` - Tiene TODO el código
2. **NO INVENTES CÓDIGO:** Usa los ejemplos del documento del Arquitecto
3. **EJECUTA EN ORDEN:** FASE A → B → C → D (no saltes pasos)
4. **TESTA CADA FASE:** Valida que funciona antes de continuar
5. **REPORTA AL CONTRALOR:** Actualiza `@Contralor/ESTATUS_AVANCE.md` al terminar cada fase

---

## 📝 FORMATO DE REPORTE:

Al completar cada FASE, actualiza el Contralor con:

```markdown
FASE [A/B/C/D/E] COMPLETADA:
✅ [Lista de tareas completadas]
⚠️ [Problemas encontrados, si hay]
📊 [Tests ejecutados y resultados]
⏭️ [Siguiente paso]
```

---

## 🎯 OBJETIVO FINAL:

Sistema de precios v4.0 funcional con:
- ✅ Plan Multi-PH Lite disponible
- ✅ Validación triple de límites
- ✅ Banner al 90%
- ✅ Bloqueo al 100%
- ✅ Enterprise ilimitado
- ✅ UX clara para el usuario

---

## 📦 **ADICIÓN: SISTEMA DE CRÉDITOS ACUMULABLES**

**Nuevo requerimiento de Marketing:** Las asambleas mensuales deben ser acumulables con expiración a 6 meses (FIFO).

### **Resumen:**
- Tabla `assembly_credits` para gestionar créditos por mes
- Lógica FIFO: Consumir créditos más viejos primero
- Expiración automática a los 6 meses (cron job)
- UI: "Tienes 5 créditos (2 vencen en 15 días)"

### **Documentación completa:**
```
@Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md
```

### **Tareas adicionales:**
```
BASE DE DATOS:
[ ] Tabla assembly_credits
[ ] Función consume_assembly_credits() (FIFO)
[ ] Función expire_old_credits()

BACKEND:
[ ] Script grant-monthly-credits.ts (cron día 1)
[ ] Script expire-assembly-credits.ts (cron diario)
[ ] GET /api/assembly-credits/[orgId]
[ ] Modificar POST /api/assemblies (consumir créditos)

FRONTEND:
[ ] Hook useAssemblyCredits()
[ ] Componente AssemblyCreditsDisplay
[ ] Integrar en dashboard admin-ph

CÓDIGO COMPLETO: Ver @Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md
```

**TIEMPO ADICIONAL:** +4-6 horas

---

**TIEMPO ESTIMADO TOTAL:** 1.5-2 días  
**BLOQUEADORES:** Ninguno  
**TODO EL CÓDIGO ESTÁ LISTO EN:**
- `@Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md`
- `@Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md`

🚀 **PUEDES INICIAR INMEDIATAMENTE**
