# 📊 LÍMITES DE UNIDADES POR PLAN
## Sistema de Validación y Cargos Adicionales

**Fecha:** 30 Enero 2026  
**Versión:** 1.0  
**Autor:** Arquitecto

---

## 🎯 **OBJETIVO:**

**Asegurar que cada cliente solo pueda registrar unidades según su plan contratado, con opción de comprar paquetes adicionales.**

---

## 📋 **TABLA DE LÍMITES POR PLAN:**

| Plan | Precio Base | Unidades Incluidas | Cargo Adicional | Escalado |
|------|-------------|-------------------|-----------------|----------|
| **DEMO** | $0 (14 días) | 50 unidades | ❌ No permite adicionales | Máx 50 |
| **EVENTO ÚNICO** | $225 | 250 unidades | +$50 por cada 100 unidades | Máx 500 |
| **DÚO PACK** | $389 | 250 unidades | +$50 por cada 100 unidades | Máx 500 |
| **STANDARD** | $189/mes | 250 unidades | +$50 por cada 100 unidades | Máx 500 |
| **MULTI-PH LITE** | $399/mes | 1,500 unidades (total cartera) | +$50 por cada 500 adicionales | Máx 3,000 |
| **MULTI-PH PRO** | $699/mes | 5,000 unidades (total cartera) | +$100 por cada 1,000 adicionales | Máx 10,000 |
| **ENTERPRISE** | $2,499/mes | ♾️ **ILIMITADO** | N/A | Sin límite |

---

## 💡 **EJEMPLOS PRÁCTICOS:**

### **Ejemplo 1: Cliente con Evento Único + 311 unidades**

```
Plan contratado: Evento Único ($225)
Unidades incluidas: 250
Unidades reales: 311

Cálculo:
311 - 250 = 61 unidades extra
61 ÷ 100 = 0.61 → se redondea a 1 paquete de 100

Cargo adicional: 1 x $50 = $50
Total a pagar: $225 + $50 = $275
```

**Validación del sistema:**
```typescript
❌ "Has excedido tu límite de 250 unidades"
❌ "Tienes 311 unidades registradas"
✅ "Compra 1 paquete adicional (+100 unidades) por $50"
```

---

### **Ejemplo 2: Cliente con Standard + 400 unidades**

```
Plan contratado: Standard ($189/mes)
Unidades incluidas: 250
Unidades reales: 400

Cálculo:
400 - 250 = 150 unidades extra
150 ÷ 100 = 1.5 → se redondea a 2 paquetes de 100

Cargo adicional: 2 x $50 = $100 (pago único)
Total mensual: $189/mes + $100 (único)
```

**Flujo:**
1. Cliente intenta subir Excel con 400 unidades
2. Sistema detecta: "Excedes tu límite de 250"
3. Modal: "¿Deseas comprar 2 paquetes adicionales (+200 unidades) por $100?"
4. Cliente paga → Límite se actualiza a 450 unidades
5. Upload exitoso

---

### **Ejemplo 3: Administradora Multi-PH Lite con 3 torres (600 unidades)**

```
Plan contratado: Multi-PH Lite ($399/mes)
Unidades incluidas: 1,500 (total cartera)
Torre A: 200 unidades
Torre B: 200 unidades
Torre C: 200 unidades
Total: 600 unidades

Validación: ✅ OK (600 < 1,500)
Cargo adicional: $0
```

---

### **Ejemplo 4: Promotora con 6,000 unidades (excede Multi-PH Pro)**

```
Plan contratado: Multi-PH Pro ($699/mes)
Unidades incluidas: 5,000
Unidades reales: 6,000

Cálculo:
6,000 - 5,000 = 1,000 unidades extra
1,000 ÷ 1,000 = 1 paquete

Cargo adicional: 1 x $100 = $100 (pago único)

Alternativa sugerida:
💡 "Considera upgrade a Enterprise ($2,499/mes) para ilimitado"
```

---

## 🔐 **VALIDACIÓN EN EL SISTEMA:**

### **1. Al subir Excel de propietarios:**

```typescript
POST /api/owners/import

// Backend valida:
const unitsCount = excelData.length; // 311 unidades
const limit = await checkUnitsLimit(organizationId, unitsCount);

if (!limit.allowed) {
  return res.status(403).json({
    error: 'Unit limit exceeded',
    max_units: limit.max_units,
    units_count: unitsCount,
    overage: limit.overage,
    addon_required: limit.addon_required, // Cuántos paquetes necesita
    addon_price: limit.addon_required * 50, // Precio total
    checkout_url: '/dashboard/admin-ph/subscription/buy-units-addon'
  });
}

// Si está OK, procede con el import
```

---

### **2. Modal de compra de paquetes adicionales:**

```
┌────────────────────────────────────────────────┐
│ ⚠️ Límite de Unidades Excedido                │
├────────────────────────────────────────────────┤
│                                                │
│ Tu plan: Standard ($189/mes)                   │
│ Unidades incluidas: 250                        │
│ Unidades en Excel: 311                         │
│                                                │
│ ❌ Excedes el límite por: 61 unidades          │
│                                                │
│ 💡 SOLUCIÓN:                                   │
│ Compra 1 paquete adicional (+100 unidades)    │
│                                                │
│ Precio: $50 (pago único)                       │
│                                                │
│ ✅ Después de la compra:                       │
│ • Límite nuevo: 350 unidades                   │
│ • Válido para todas las asambleas              │
│                                                │
│ [Cancelar] [💳 Pagar $50 con Stripe]          │
└────────────────────────────────────────────────┘
```

---

### **3. API para comprar paquetes adicionales:**

```typescript
POST /api/subscription/buy-units-addon

{
  "addon_units": 100,  // o 200, 300, etc.
  "payment_method": "STRIPE_CARD"
}

// Backend:
1. Calcula precio: addon_units / 100 * $50
2. Crea Stripe Payment Intent
3. Cobra al cliente
4. Actualiza BD: subscription.units_addon_purchased += addon_units
5. Registra en units_addon_charges
```

---

## 📊 **ESQUEMA DE BD (Actualizado):**

```sql
-- Tabla subscriptions (con límites)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  organization_id UUID,
  plan_tier TEXT,
  
  -- 🆕 LÍMITES DE UNIDADES
  max_units_included INT DEFAULT 250,     -- Incluidas en el plan base
  units_addon_purchased INT DEFAULT 0,    -- Paquetes adicionales comprados
  max_units_total INT GENERATED ALWAYS AS (max_units_included + units_addon_purchased) STORED,
  
  -- Resto de campos...
);

-- Tabla de tracking de compras adicionales
CREATE TABLE units_addon_charges (
  id UUID PRIMARY KEY,
  organization_id UUID,
  subscription_id UUID,
  units_addon INT,                  -- 100, 200, 300, etc.
  price_per_100_units NUMERIC(10,2), -- $50, $100, etc.
  total_amount NUMERIC(10,2),
  status TEXT,                      -- PENDING, PAID, FAILED
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Función de validación
CREATE FUNCTION check_units_limit(org_id UUID, units_count INT) 
RETURNS JSONB;
```

---

## 🔄 **FLUJO COMPLETO:**

```
1. Cliente sube Excel con propietarios
   └─> Sistema cuenta: 311 unidades

2. Sistema valida contra suscripción:
   └─> Plan Standard: máx 250
   └─> Necesita: +100 unidades ($50)

3. Sistema muestra modal con opciones:
   ├─> Comprar paquete adicional ($50)
   ├─> Upgrade a plan superior
   └─> Reducir unidades en Excel

4. Cliente elige "Comprar paquete":
   └─> Stripe cobra $50
   └─> BD actualiza: max_units_total = 350
   └─> Import continúa exitosamente

5. Próximas asambleas:
   └─> Cliente puede usar hasta 350 unidades sin cargo extra
```

---

## ⚠️ **RESTRICCIONES IMPORTANTES:**

1. **DEMO**: Límite fijo de 50 unidades, no se pueden comprar adicionales
2. **Paquetes adicionales**: Son **permanentes** mientras la suscripción esté activa
3. **Si downgrade**: Se pierden los paquetes adicionales (ej: Multi-PH → Standard)
4. **Si cancela**: Paquetes adicionales expiran junto con la suscripción
5. **Multi-PH**: Límite es **total de cartera** (suma de todos los edificios)

---

## 🎯 **VENTAJAS DE ESTE SISTEMA:**

✅ **Para el cliente:**
- Solo paga por lo que necesita
- No tiene que cambiar de plan completo
- Compra adicional es 1 vez (no mensual)

✅ **Para Assembly 2.0:**
- Monetiza clientes grandes sin forzar upgrade
- Stripe cobra automáticamente
- Sistema valida y bloquea si excede

✅ **Para el sistema:**
- Validación automática en backend
- No permite registrar más unidades de las permitidas
- Vista de monitor se adapta automáticamente

---

## 📝 **TAREAS PARA EL CODER:**

```
Backend:
[ ] Agregar campos max_units_included, units_addon_purchased en tabla subscriptions
[ ] Crear tabla units_addon_charges
[ ] Implementar función check_units_limit()
[ ] API POST /api/subscription/buy-units-addon
[ ] Validación en POST /api/owners/import

Frontend:
[ ] Modal "Límite Excedido" con opción de compra
[ ] Página /dashboard/admin-ph/subscription/units-addon
[ ] Mostrar límite actual en dashboard: "250 / 350 unidades usadas"
[ ] Warning cuando se acerca al límite (90%)

Stripe:
[ ] Crear producto "Unidades Adicionales (+100)"
[ ] Price: $50 (one-time payment)
```

---

**Fin de especificación de Límites de Unidades**
