# ✅ VALIDACIÓN TÉCNICA: FASE 08 - PRECIOS V4.0
## Validación de Arquitecto para Marketing Go-Live

**Fecha:** 30 Enero 2026  
**Versión:** 1.0  
**Arquitecto:** Claude (Sonnet 4.5)  
**Solicitado por:** Contralor (orden de Henry)

---

## 📋 **CAMBIOS DE MARKETING A VALIDAR:**

### **Resumen de Actualización reportado por Marketing:**

```
✅ Matriz de Precios v4.0
✅ Nuevo Plan Multi-PH Lite ($399/mes)
✅ Redefinición de Límites: "lo que ocurra primero"
✅ Confirmación Enterprise ($2,499/mes) ILIMITADO
✅ Modelos Transaccionales actualizados
```

---

## ✅ **VALIDACIÓN 1: MATRIZ DE PRECIOS V4.0**

### **Planes Actualizados:**

```
┌──────────────────┬──────────┬───────────┬────────────┬─────────┐
│ Plan             │ Precio   │ Asambleas │ Residentes │ PHs     │
├──────────────────┼──────────┼───────────┼────────────┼─────────┤
│ Evento Único     │ $225     │ 1         │ 250        │ 1       │
│ Dúo Pack         │ $389     │ 2         │ 250        │ 1       │
│ Standard         │ $189/mes │ 2/mes     │ 250        │ 1       │
│ Multi-PH Lite    │ $399/mes │ 5/mes     │ 1,500      │ 10      │ ← NUEVO
│ Multi-PH Pro     │ $699/mes │ 15/mes    │ 5,000      │ 30      │
│ Enterprise       │ $2,499   │ ∞         │ ∞          │ ∞       │
└──────────────────┴──────────┴───────────┴────────────┴─────────┘
```

**Validación Técnica:**

✅ **Base de Datos:** La tabla `subscriptions` puede manejar los 6 planes mediante el enum:
```sql
plan_tier TEXT CHECK (plan_tier IN (
  'DEMO',
  'EVENTO_UNICO',
  'DUO_PACK',
  'STANDARD',
  'MULTI_PH_LITE',  -- ✅ NUEVO
  'MULTI_PH_PRO',
  'ENTERPRISE'
))
```

✅ **Límites por Plan:** Campos existentes soportan los límites:
```sql
-- Ya existen en la tabla subscriptions:
max_units_included INT DEFAULT 250,
max_assemblies_per_month INT DEFAULT 2,
max_organizations INT DEFAULT 1,  -- ✅ Para PHs

-- NUEVO campo necesario:
ALTER TABLE subscriptions ADD COLUMN max_units_total_all_orgs INT DEFAULT 250;
```

**RESULTADO:** ✅ **COMPATIBLE** - Solo necesita agregar 1 campo nuevo

---

## ✅ **VALIDACIÓN 2: MULTI-PH LITE ($399/mes)**

### **Especificaciones del Plan:**

```
Plan: Multi-PH Lite
Precio: $399/mes
Asambleas: 5/mes (acumulables)
Residentes: 1,500 (total cartera)
Edificios: 10 PHs
Target: Administradoras pequeñas/medianas
```

**Análisis Técnico:**

✅ **Problema resuelto:** 
- Antes: Salto de $189 (1 PH) → $699 (30 PHs) era muy grande
- Ahora: Escalón intermedio $399 (10 PHs)

✅ **Lógica de Control:**
```sql
-- Función para verificar límites de Multi-PH Lite
CREATE FUNCTION check_multi_ph_lite_limits(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_total_orgs INT;
  v_total_units INT;
  v_assemblies_this_month INT;
BEGIN
  -- Obtener suscripción
  SELECT * INTO v_subscription 
  FROM subscriptions 
  WHERE organization_id = org_id AND status = 'ACTIVE';
  
  IF v_subscription.plan_tier != 'MULTI_PH_LITE' THEN
    RETURN jsonb_build_object('error', 'Not Multi-PH Lite plan');
  END IF;
  
  -- Contar organizaciones (edificios)
  SELECT COUNT(*) INTO v_total_orgs
  FROM organizations
  WHERE parent_subscription_id = v_subscription.id;
  
  -- Sumar TODAS las unidades de TODOS los edificios
  SELECT SUM(total_units) INTO v_total_units
  FROM organizations
  WHERE parent_subscription_id = v_subscription.id;
  
  -- Contar asambleas del mes actual
  SELECT COUNT(*) INTO v_assemblies_this_month
  FROM assemblies a
  JOIN organizations o ON o.id = a.organization_id
  WHERE o.parent_subscription_id = v_subscription.id
    AND EXTRACT(MONTH FROM a.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM a.created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- ✅ REGLA: "LO QUE OCURRA PRIMERO"
  RETURN jsonb_build_object(
    'organizations', jsonb_build_object(
      'current', v_total_orgs,
      'limit', 10,
      'percentage', (v_total_orgs::NUMERIC / 10) * 100,
      'exceeded', v_total_orgs > 10
    ),
    'units', jsonb_build_object(
      'current', v_total_units,
      'limit', 1500,
      'percentage', (v_total_units::NUMERIC / 1500) * 100,
      'exceeded', v_total_units > 1500
    ),
    'assemblies', jsonb_build_object(
      'current', v_assemblies_this_month,
      'limit', 5,
      'percentage', (v_assemblies_this_month::NUMERIC / 5) * 100,
      'exceeded', v_assemblies_this_month > 5
    ),
    'needs_upgrade', (
      v_total_orgs > 10 OR 
      v_total_units > 1500 OR 
      v_assemblies_this_month > 5
    )
  );
END;
$$ LANGUAGE plpgsql;
```

**RESULTADO:** ✅ **VIABLE TÉCNICAMENTE**

---

## ✅ **VALIDACIÓN 3: REGLA "LO QUE OCURRA PRIMERO"**

### **Definición de Marketing:**

> "Se aplica el límite de lo que ocurra primero (PHs, Residentes o Asambleas)"

**Ejemplo Práctico:**

```
Cliente con Multi-PH Lite ($399/mes):

Límites:
├─ 10 PHs
├─ 1,500 residentes (total)
└─ 5 asambleas/mes

Escenario A: Excede por PHs
├─ Tiene 11 edificios ⚠️ (excede)
├─ Tiene 800 residentes ✅ (OK)
└─ Hizo 3 asambleas este mes ✅ (OK)
RESULTADO: 🚨 UPGRADE REQUERIDO (excedió PHs)

Escenario B: Excede por Residentes
├─ Tiene 8 edificios ✅ (OK)
├─ Tiene 1,600 residentes ⚠️ (excede)
└─ Hizo 4 asambleas este mes ✅ (OK)
RESULTADO: 🚨 UPGRADE REQUERIDO (excedió residentes)

Escenario C: Excede por Asambleas
├─ Tiene 7 edificios ✅ (OK)
├─ Tiene 1,200 residentes ✅ (OK)
└─ Hizo 6 asambleas este mes ⚠️ (excede)
RESULTADO: 🚨 UPGRADE REQUERIDO (excedió asambleas)
```

**Implementación Técnica:**

```sql
-- Función que verifica TRIPLE límite
CREATE FUNCTION check_plan_limits(sub_id UUID, limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_sub RECORD;
  v_current_orgs INT;
  v_current_units INT;
  v_current_assemblies INT;
BEGIN
  SELECT * INTO v_sub FROM subscriptions WHERE id = sub_id;
  
  -- Contar actuales
  SELECT 
    COUNT(DISTINCT o.id),
    SUM(o.total_units),
    COUNT(DISTINCT CASE 
      WHEN EXTRACT(MONTH FROM a.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      THEN a.id 
    END)
  INTO v_current_orgs, v_current_units, v_current_assemblies
  FROM organizations o
  LEFT JOIN assemblies a ON a.organization_id = o.id
  WHERE o.parent_subscription_id = sub_id;
  
  -- ✅ REGLA: "LO QUE OCURRA PRIMERO"
  -- Si CUALQUIERA excede, retorna TRUE (necesita upgrade)
  RETURN (
    v_current_orgs > v_sub.max_organizations OR
    v_current_units > v_sub.max_units_total_all_orgs OR
    v_current_assemblies > v_sub.max_assemblies_per_month
  );
END;
$$ LANGUAGE plpgsql;
```

**RESULTADO:** ✅ **IMPLEMENTABLE** - Lógica clara y viable

---

## ✅ **VALIDACIÓN 4: UPGRADE TRIGGER AL 90%**

### **Solicitud de Marketing:**

> "Al alcanzar el 90% de cualquier límite, el sistema habilitará automáticamente el banner de 'Upgrade Sugerido'."

**Implementación:**

```typescript
// Hook React para mostrar banner de upgrade
function useUpgradeBanner(subscriptionId: string) {
  const [showBanner, setShowBanner] = useState(false);
  const [limits, setLimits] = useState<any>(null);
  
  useEffect(() => {
    async function checkLimits() {
      const response = await fetch(`/api/subscription/${subscriptionId}/limits`);
      const data = await response.json();
      
      // ✅ TRIGGER AL 90% de CUALQUIER límite
      const needsUpgrade = (
        data.organizations.percentage >= 90 ||
        data.units.percentage >= 90 ||
        data.assemblies.percentage >= 90
      );
      
      setShowBanner(needsUpgrade);
      setLimits(data);
    }
    
    checkLimits();
    // Revisar cada 5 minutos
    const interval = setInterval(checkLimits, 300000);
    return () => clearInterval(interval);
  }, [subscriptionId]);
  
  return { showBanner, limits };
}

// Componente Banner
function UpgradeBanner({ limits }: { limits: any }) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          ⚠️
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Upgrade Sugerido:</strong> Estás cerca de alcanzar tus límites.
            {limits.organizations.percentage >= 90 && (
              <div>• Edificios: {limits.organizations.current}/{limits.organizations.limit}</div>
            )}
            {limits.units.percentage >= 90 && (
              <div>• Residentes: {limits.units.current}/{limits.units.limit}</div>
            )}
            {limits.assemblies.percentage >= 90 && (
              <div>• Asambleas: {limits.assemblies.current}/{limits.assemblies.limit}</div>
            )}
          </p>
          <button className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded">
            Ver Planes Superiores
          </button>
        </div>
      </div>
    </div>
  );
}
```

**RESULTADO:** ✅ **FÁCIL DE IMPLEMENTAR**

---

## ✅ **VALIDACIÓN 5: ENTERPRISE ILIMITADO**

### **Especificaciones:**

```
Plan: Enterprise
Precio: $2,499/mes
Asambleas: ILIMITADAS
Residentes: ILIMITADOS
Edificios: ILIMITADOS
Restricción: Misma razón social (uso justo)
```

**Validación Técnica:**

```sql
-- En la tabla subscriptions
plan_tier = 'ENTERPRISE'

-- Campos de límite con valores especiales:
max_organizations = NULL  -- NULL = ilimitado
max_units_total_all_orgs = NULL  -- NULL = ilimitado
max_assemblies_per_month = NULL  -- NULL = ilimitado

-- Función de verificación
CREATE FUNCTION is_unlimited_plan(sub_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE id = sub_id 
      AND plan_tier = 'ENTERPRISE'
      AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql;

-- Middleware para bypassear límites
IF is_unlimited_plan(subscription_id) THEN
  -- No validar límites
  RETURN TRUE;
ELSE
  -- Validar límites normalmente
  RETURN check_plan_limits(subscription_id);
END IF;
```

**Restricción "Uso Justo":**

```sql
-- Campo adicional para Enterprise
ALTER TABLE subscriptions ADD COLUMN company_tax_id TEXT;

-- Validación: Todas las orgs deben tener mismo tax_id
CREATE FUNCTION validate_enterprise_usage_fair(sub_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tax_id TEXT;
  v_different_tax_ids INT;
BEGIN
  SELECT company_tax_id INTO v_tax_id
  FROM subscriptions WHERE id = sub_id;
  
  SELECT COUNT(DISTINCT company_tax_id) INTO v_different_tax_ids
  FROM organizations
  WHERE parent_subscription_id = sub_id;
  
  -- Solo 1 tax_id permitido (misma razón social)
  RETURN v_different_tax_ids <= 1;
END;
$$ LANGUAGE plpgsql;
```

**RESULTADO:** ✅ **IMPLEMENTABLE CON VALIDACIÓN DE USO JUSTO**

---

## ✅ **VALIDACIÓN 6: UX SOLICITADA POR MARKETING**

### **1. Selector "Soy un PH" vs "Soy Administradora/Promotora"**

```typescript
// Componente PricingSelector
function PricingSelector() {
  const [userType, setUserType] = useState<'ph' | 'admin'>('ph');
  
  return (
    <div className="mb-8">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setUserType('ph')}
          className={`px-6 py-3 rounded-lg ${
            userType === 'ph' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200'
          }`}
        >
          🏢 Soy un PH
        </button>
        <button
          onClick={() => setUserType('admin')}
          className={`px-6 py-3 rounded-lg ${
            userType === 'admin' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200'
          }`}
        >
          🏛️ Soy Administradora/Promotora
        </button>
      </div>
      
      {/* Mostrar planes según el tipo */}
      {userType === 'ph' && (
        <PricingCardsPH />  // Evento Único, Dúo Pack, Standard
      )}
      {userType === 'admin' && (
        <PricingCardsAdmin />  // Multi-PH Lite, Pro, Enterprise
      )}
    </div>
  );
}
```

**RESULTADO:** ✅ **SIMPLE DE IMPLEMENTAR**

---

### **2. Calculadora Inteligente con "Lo que llegue primero"**

```typescript
function ROICalculator() {
  const [edificios, setEdificios] = useState(1);
  const [residentes, setResidentes] = useState(250);
  const [asambleas, setAsambleas] = useState(2);
  
  function getSuggestedPlan() {
    // ✅ REGLA: "LO QUE OCURRA PRIMERO"
    
    // Enterprise
    if (edificios > 30 || residentes > 5000 || asambleas > 15) {
      return 'ENTERPRISE';
    }
    
    // Multi-PH Pro
    if (edificios > 10 || residentes > 1500 || asambleas > 5) {
      return 'MULTI_PH_PRO';
    }
    
    // Multi-PH Lite
    if (edificios > 1 || residentes > 250 || asambleas > 2) {
      return 'MULTI_PH_LITE';
    }
    
    // Standard
    return 'STANDARD';
  }
  
  const suggestedPlan = getSuggestedPlan();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Calculadora Inteligente</h3>
      
      <div className="space-y-4">
        <div>
          <label>Edificios que administro:</label>
          <input
            type="number"
            value={edificios}
            onChange={(e) => setEdificios(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label>Residentes totales:</label>
          <input
            type="number"
            value={residentes}
            onChange={(e) => setResidentes(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label>Asambleas por mes:</label>
          <input
            type="number"
            value={asambleas}
            onChange={(e) => setAsambleas(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="font-bold text-blue-900">
          Plan recomendado: {PLAN_NAMES[suggestedPlan]}
        </p>
        <p className="text-sm text-blue-700 mt-2">
          {getUpgradeExplanation(suggestedPlan, edificios, residentes, asambleas)}
        </p>
      </div>
    </div>
  );
}
```

**RESULTADO:** ✅ **IMPLEMENTABLE CON LÓGICA CLARA**

---

### **3. Badge Gold/Premium para Enterprise**

```typescript
function EnterprisePlanCard() {
  return (
    <div className="relative border-4 border-yellow-400 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-white">
      {/* Badge Gold */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          ✨ PREMIUM
        </span>
      </div>
      
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
        <div className="text-4xl font-bold text-yellow-600 my-4">
          $2,499<span className="text-lg">/mes</span>
        </div>
        
        <div className="space-y-2 text-left">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">♾️</span>
            <span>Asambleas ILIMITADAS</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">♾️</span>
            <span>Residentes ILIMITADOS</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">♾️</span>
            <span>Edificios ILIMITADOS</span>
          </div>
          <div className="flex items-center border-t-2 border-yellow-200 pt-2 mt-2">
            <span className="text-yellow-500 mr-2">🤖</span>
            <span className="font-bold">CRM con IA de Sentimiento</span>
          </div>
        </div>
        
        <button className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition">
          Contactar Ventas
        </button>
      </div>
    </div>
  );
}
```

**RESULTADO:** ✅ **DISEÑO PREMIUM FÁCIL DE IMPLEMENTAR**

---

## 📊 **ACTUALIZACIONES NECESARIAS EN DOCUMENTACIÓN:**

### **1. Actualizar `LIMITES_UNIDADES_POR_PLAN.md`:**

```markdown
# TABLA ACTUALIZADA (v4.0):

┌─────────────────┬──────────┬──────────────┬──────────────┬─────────┐
│ PLAN            │ PRECIO   │ RESIDENTES   │ EDIFICIOS    │ ASAMB.  │
├─────────────────┼──────────┼──────────────┼──────────────┼─────────┤
│ DEMO            │ $0       │ 50           │ 1            │ 1       │
│ EVENTO ÚNICO    │ $225     │ 250          │ 1            │ 1       │
│ DÚO PACK        │ $389     │ 250          │ 1            │ 2       │
│ STANDARD        │ $189/mes │ 250          │ 1            │ 2/mes   │
│ MULTI-PH LITE   │ $399/mes │ 1,500 total  │ 10           │ 5/mes   │ ← NUEVO
│ MULTI-PH PRO    │ $699/mes │ 5,000 total  │ 30           │ 15/mes  │
│ ENTERPRISE      │ $2,499/m │ ∞            │ ∞            │ ∞       │
└─────────────────┴──────────┴──────────────┴──────────────┴─────────┘

REGLA: "LO QUE OCURRA PRIMERO"
- Si excedes CUALQUIER límite → Upgrade requerido
- Trigger al 90% de CUALQUIER límite → Banner "Upgrade Sugerido"
```

---

### **2. Actualizar `FASE 7` en instrucciones del Coder:**

```sql
-- Agregar nuevo plan
ALTER TABLE subscriptions MODIFY COLUMN plan_tier CHECK (plan_tier IN (
  'DEMO',
  'EVENTO_UNICO',
  'DUO_PACK',
  'STANDARD',
  'MULTI_PH_LITE',  -- ✅ NUEVO
  'MULTI_PH_PRO',
  'ENTERPRISE'
));

-- Agregar campo para suma total de unidades
ALTER TABLE subscriptions ADD COLUMN max_units_total_all_orgs INT;

-- Actualizar límites por plan
UPDATE subscriptions SET 
  max_units_total_all_orgs = 250, 
  max_organizations = 1,
  max_assemblies_per_month = 2
WHERE plan_tier = 'STANDARD';

UPDATE subscriptions SET 
  max_units_total_all_orgs = 1500,  -- ✅ NUEVO LÍMITE
  max_organizations = 10,
  max_assemblies_per_month = 5
WHERE plan_tier = 'MULTI_PH_LITE';

UPDATE subscriptions SET 
  max_units_total_all_orgs = 5000,
  max_organizations = 30,
  max_assemblies_per_month = 15
WHERE plan_tier = 'MULTI_PH_PRO';

UPDATE subscriptions SET 
  max_units_total_all_orgs = NULL,  -- NULL = ilimitado
  max_organizations = NULL,
  max_assemblies_per_month = NULL
WHERE plan_tier = 'ENTERPRISE';
```

---

## ✅ **VALIDACIÓN FINAL:**

```
VALIDACIÓN 1: Matriz de Precios v4.0           ✅ APROBADA
VALIDACIÓN 2: Multi-PH Lite ($399/mes)         ✅ APROBADA
VALIDACIÓN 3: Regla "Lo que ocurra primero"    ✅ APROBADA
VALIDACIÓN 4: Upgrade Trigger al 90%           ✅ APROBADA
VALIDACIÓN 5: Enterprise ILIMITADO             ✅ APROBADA
VALIDACIÓN 6: UX Solicitada (3 elementos)      ✅ APROBADA

═══════════════════════════════════════════════════════════
VEREDICTO ARQUITECTO:
═══════════════════════════════════════════════════════════

✅ FASE 8 VALIDADA TÉCNICAMENTE

Todos los cambios de Marketing son:
├─ ✅ Técnicamente viables
├─ ✅ Compatibles con BD actual
├─ ✅ Implementables en <2 días
└─ ✅ Sin bloqueadores

SIGUIENTE PASO:
➡️ Coder puede iniciar implementación de FASE 8
➡️ Documentación actualizada incluida
➡️ SQL y código de ejemplo proporcionado
```

---

## 📋 **CHECKLIST PARA EL CODER:**

```
Base de Datos:
[ ] ALTER TABLE subscriptions - agregar 'MULTI_PH_LITE' al enum
[ ] ALTER TABLE subscriptions - agregar campo max_units_total_all_orgs
[ ] ALTER TABLE subscriptions - agregar campo company_tax_id (Enterprise)
[ ] Crear función check_multi_ph_lite_limits()
[ ] Crear función check_plan_limits() con lógica triple
[ ] Crear función is_unlimited_plan()
[ ] Actualizar límites de planes existentes

Backend API:
[ ] GET /api/subscription/:id/limits (retorna límites actuales)
[ ] POST /api/subscription/upgrade (maneja upgrade de plan)
[ ] Middleware: validar límites antes de crear org/asamblea

Frontend:
[ ] Componente PricingSelector (PH vs Administradora)
[ ] Componente ROICalculator con "lo que ocurra primero"
[ ] Componente EnterprisePlanCard con badge Gold
[ ] Hook useUpgradeBanner (trigger al 90%)
[ ] Componente UpgradeBanner
[ ] Actualizar página /pricing con nuevo Multi-PH Lite

Testing:
[ ] Test: Multi-PH Lite con 10 edificios, 1,500 residentes, 5 asambleas
[ ] Test: Exceder por edificios → Upgrade requerido
[ ] Test: Exceder por residentes → Upgrade requerido
[ ] Test: Exceder por asambleas → Upgrade requerido
[ ] Test: Banner aparece al 90% de cualquier límite
[ ] Test: Enterprise permite ilimitado
[ ] Test: Calculadora sugiere plan correcto
```

---

**Fin de la Validación Técnica**

**APROBADO PARA IMPLEMENTACIÓN** ✅

**Fecha:** 30 Enero 2026  
**Arquitecto:** Claude (Sonnet 4.5)  
**Reportado a:** Contralor
