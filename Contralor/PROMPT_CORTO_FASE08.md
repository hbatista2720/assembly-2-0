# 🚀 PROMPT CORTO - FASE 08: PRECIOS V4.0

**Para:** Coder  
**Tiempo estimado:** 1-2 días

---

## 📋 INSTRUCCIÓN ÚNICA:

```
Implementa el sistema de precios v4.0 con el NUEVO plan Multi-PH Lite y la regla de 
límites "lo que ocurra primero".

CAMBIOS PRINCIPALES:
1. Nuevo plan: Multi-PH Lite ($399/mes) - 10 edificios, 1,500 residentes, 5 asambleas/mes
2. Lógica triple: Si excede CUALQUIER límite (edificios, residentes o asambleas) → Upgrade requerido
3. Banner al 90%: Mostrar alerta cuando alcance 90% de cualquier límite
4. Enterprise ilimitado: NULL en límites = sin restricciones

REFERENCIA COMPLETA:
Lee: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md (tiene TODO el código SQL y TypeScript)
```

---

## ✅ TAREAS (EN ORDEN):

### **1. BASE DE DATOS:**
```sql
-- Agrega plan Multi-PH Lite al enum
ALTER TYPE plan_tier ADD VALUE 'MULTI_PH_LITE';

-- Agrega campo para suma total de residentes
ALTER TABLE subscriptions ADD COLUMN max_units_total_all_orgs INT;

-- Crea función para verificar límites con regla "lo que ocurra primero"
-- Código completo en: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 212-245
```

### **2. BACKEND:**
```typescript
// Crea endpoint: GET /api/subscription/:id/limits
// Retorna: { organizations: {current, limit, percentage}, units: {...}, assemblies: {...} }

// Crea middleware: validateSubscriptionLimits()
// Bloquea creación de orgs/asambleas si excede límites

// Actualiza: POST /api/organizations y POST /api/assemblies
// Agrega validación de límites ANTES de insertar
```

### **3. FRONTEND:**
```typescript
// Componente: <PricingSelector /> - Toggle "PH" vs "Administradora"
// Componente: <ROICalculator /> - Sugiere plan basado en inputs
// Componente: <EnterprisePlanCard /> - Badge gold premium
// Hook: useUpgradeBanner() - Detecta 90% de cualquier límite
// Componente: <UpgradeBanner /> - Alerta amarilla en dashboard

// Actualiza: /pricing con nuevo plan Multi-PH Lite
// Integra: UpgradeBanner en dashboard admin-ph
```

### **4. TESTING:**
```
[ ] Test: Multi-PH Lite con 11 edificios → Bloqueado
[ ] Test: Banner aparece al 90% de cualquier límite
[ ] Test: Enterprise permite ilimitado
[ ] Test: Calculadora sugiere plan correcto
```

---

## 📊 NUEVOS LÍMITES:

```
STANDARD:       250 residentes, 1 PH,  2 asambleas/mes
MULTI-PH LITE:  1,500 residentes, 10 PHs, 5 asambleas/mes  ← NUEVO
MULTI-PH PRO:   5,000 residentes, 30 PHs, 15 asambleas/mes
ENTERPRISE:     ∞ ILIMITADO
```

---

## 🎯 REGLA CLAVE: "LO QUE OCURRA PRIMERO"

```javascript
// Si excede CUALQUIERA → Upgrade requerido
function needsUpgrade(current, limits) {
  return (
    current.edificios > limits.edificios ||
    current.residentes > limits.residentes ||
    current.asambleas > limits.asambleas
  );
}
```

---

## 📚 CÓDIGO COMPLETO:

**TODO el código SQL, TypeScript y React está en:**  
`Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md`

Lee ese documento primero, tiene todos los ejemplos copy-paste listos.

---

**TIEMPO:** 1-2 días | **BLOQUEADORES:** Ninguno | **PRIORIDAD:** Alta 🚀
