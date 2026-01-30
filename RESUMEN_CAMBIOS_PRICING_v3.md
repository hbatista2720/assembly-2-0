# 📊 RESUMEN DE CAMBIOS: Precios v3.0 Premium
**Para: Coder**  
**De: Henry + Arquitecto + Agente de Marketing**  
**Fecha:** 28 Enero 2026 ✅ APROBADO  
**Prioridad:** 🔴 ALTA - Implementar antes de lanzar landing page

---

## 🎯 QUÉ CAMBIÓ

### **ANTES (v2.0 - Anti-Abuso):**
- Pay-per-Event: $175
- Standard: $129/mes (2 meses compromiso)
- Multi-PH: $499/mes
- Enterprise: $1,499/mes

### **AHORA (v3.0 - Premium):**
- **Evento Único:** $225 (+$50)
- **Dúo Pack:** $389 🆕 (nuevo plan)
- **Standard:** $189/mes (+$60)
- **Multi-PH:** $699/mes (+$200)
- **Enterprise:** $2,499/mes (+$1,000)

**Razón del cambio:** Posicionamiento premium + ROI demostrable

---

## 📂 DOCUMENTOS ACTUALIZADOS

### ✅ **CONSOLIDADOS (Leer estos)**

#### 1. **MARKETING.md** (PRINCIPAL) 📢
- **Lectura obligatoria:** 30 minutos
- **Contiene TODO:**
  - Precios v3.0 completos
  - Análisis de ROI ($3k-$6k ahorro)
  - Argumentos de venta por perfil
  - Estrategia anti-abuso
  - **Instrucciones completas para Coder**
  - Componentes a crear
  - Schema SQL a actualizar
  - Checklist completo

**Este es tu documento principal. Lee esto primero.**

---

#### 2. **LANDING_PAGE_ESTRATEGIA.md** (Actualizado)
- **Actualizado con:** Precios v3.0 en sección de pricing
- **Contenido:** Navegación adaptativa por perfil (admin, junta, residente)
- **CTAs:** Actualizados con nuevos precios

---

#### 3. **PAQUETES_Y_PRECIOS.md** (Referencia rápida)
- **Uso:** Solo como referencia rápida
- **Para detalles:** Ver `MARKETING.md`

---

### ⚠️ **ARCHIVOS DE REFERENCIA (No leer a menos que necesites contexto)**

- `ESTRATEGIA_B2B.md` → Creado por agente de marketing (ya consolidado en MARKETING.md)
- `ESTRATEGIA_PRECIOS_ANTI_ABUSO.md` → Precios v2.0 (supersedido por v3.0)

---

## 🛠️ QUÉ DEBES HACER

### **FASE 1: Actualizar Base de Datos** (1 día)

#### **1. Actualizar `schema.sql`:**

```sql
-- Agregar al final de schema.sql

-- ============================================
-- PRECIOS v3.0 PREMIUM
-- ============================================

-- Agregar nuevo plan DÚO PACK
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'DUO_PACK';

-- Tabla de créditos (para Standard y Dúo Pack)
CREATE TABLE IF NOT EXISTS organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  credits_available INT DEFAULT 0,
  credits_used_this_month INT DEFAULT 0,
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columnas de compromiso
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS commitment_months INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS commitment_ends_at TIMESTAMPTZ;

-- Columnas anti-abuso
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS abuse_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspect_abuse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reactivation_blocked_until TIMESTAMPTZ;

-- Índices
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON organizations(plan);
CREATE INDEX IF NOT EXISTS idx_credits_org ON organization_credits(organization_id);
```

**Ejecutar en Supabase:**
1. Abre Supabase Studio
2. SQL Editor → New Query
3. Copia el SQL de arriba
4. Run

---

### **FASE 2: Actualizar Tipos TypeScript** (1 día)

#### **2. Actualizar `src/lib/types/pricing.ts`:**

```typescript
// REEMPLAZAR archivo completo

export type PlanTier = 
  | 'EVENTO_UNICO'
  | 'DUO_PACK'        // 🆕 NUEVO
  | 'STANDARD'
  | 'MULTI_PH'
  | 'ENTERPRISE'

export interface Plan {
  id: PlanTier
  name: string
  displayName: string
  price: number
  billing: 'one-time' | 'monthly'
  commitment?: number // Meses de compromiso mínimo
  limits: {
    assemblies: number | 'unlimited'
    maxProperties: number | 'unlimited'
    maxBuildings?: number | 'unlimited'
    validityMonths?: number
    creditsPerMonth?: number
    extraCreditPrice?: number
  }
  features: string[]
  cta: string
  popular?: boolean
  recommended?: 'admin' | 'junta' | 'residente'
}

export const PLANS: Plan[] = [
  {
    id: 'EVENTO_UNICO',
    name: 'Evento Único',
    displayName: 'Evento Único',
    price: 225, // ⬆️ ACTUALIZADO de 175
    billing: 'one-time',
    limits: {
      assemblies: 1,
      maxProperties: 250,
      validityMonths: 12
    },
    features: [
      '✅ Chatbot Lex de soporte',
      '✅ Validación Face ID para votar',
      '✅ Voto manual alternativo',
      '✅ Pre-registro de residentes',
      '✅ Asistencia en tiempo real',
      '✅ Quórum calculado automático',
      '✅ Gráficas de resultados por tema',
      '✅ Acta digital con participación + quórum + asistencia',
      'Hasta 250 unidades',
      'Histórico 30 días',
      'Crédito válido 12 meses'
    ],
    cta: 'Comprar Ahora',
    recommended: 'junta'
  },
  {
    id: 'DUO_PACK',
    name: 'Dúo Pack',
    displayName: 'Dúo Pack',
    price: 389, // 🆕 NUEVO
    billing: 'one-time',
    limits: {
      assemblies: 2,
      maxProperties: 250,
      validityMonths: 12
    },
    features: [
      '✅ Todo de Evento Único +',
      '✅ Chatbot Lex personalizado',
      '✅ Dashboard activo 12 meses',
      '✅ 2 actas digitales completas',
      '✅ Exportar a Excel',
      '2 créditos de asamblea',
      'Hasta 250 unidades por asamblea',
      'Histórico 12 meses',
      'Ahorra 15% vs 2x Evento Único'
    ],
    cta: 'Comprar Pack',
    recommended: 'junta'
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    displayName: 'Standard',
    price: 189, // ⬆️ ACTUALIZADO de 129
    billing: 'monthly',
    commitment: 2, // 2 meses mínimo
    limits: {
      assemblies: 2, // Por mes
      maxProperties: 250,
      creditsPerMonth: 2,
      extraCreditPrice: 75 // 3ra asamblea
    },
    features: [
      '✅ Chatbot Lex inteligente',
      '✅ Validación Face ID',
      '✅ Voto manual con verificación',
      '✅ Pre-registro masivo con Face ID',
      '✅ Asistencia en tiempo real',
      '✅ Quórum dinámico automático',
      '✅ Gráficas de resultados live',
      '✅ Actas ilimitadas con firma digital certificada',
      '✅ Dashboard análisis histórico',
      '✅ Reportes avanzados (participación, tendencias)',
      '2 asambleas/mes incluidas',
      '3ra asamblea: +$75',
      'Créditos acumulables 6 meses',
      'Soporte 24/7',
      'API básico',
      'Compromiso 2 meses'
    ],
    cta: 'Empezar Standard',
    popular: true,
    recommended: 'admin'
  },
  {
    id: 'MULTI_PH',
    name: 'Multi-PH',
    displayName: 'Multi-PH',
    price: 699, // ⬆️ ACTUALIZADO de 499
    billing: 'monthly',
    limits: {
      assemblies: 'unlimited',
      maxBuildings: 30,
      maxProperties: 5000
    },
    features: [
      '✅ Todo de Standard por cada edificio +',
      '✅ Chatbot Lex multi-idioma',
      '✅ Pre-registro masivo con Excel',
      '✅ Quórum dinámico multi-edificio',
      '✅ Gráficas comparativas entre edificios',
      '✅ Actas con white label (tu logo)',
      '✅ CRM básico (historial residentes)',
      '✅ Panel multi-tenant (cambiar edificios 1 click)',
      '✅ Reportes consolidados (todos los edificios)',
      'Hasta 30 edificios',
      'Asambleas ilimitadas',
      'Hasta 5,000 unidades totales',
      'Roles y permisos por edificio',
      'API completo',
      'Account manager asignado'
    ],
    cta: 'Agendar Demo',
    recommended: 'admin'
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    displayName: 'Enterprise',
    price: 2499, // ⬆️ ACTUALIZADO de 1499
    billing: 'monthly',
    limits: {
      assemblies: 'unlimited',
      maxBuildings: 'unlimited',
      maxProperties: 'unlimited'
    },
    features: [
      '✅ Todo de Multi-PH + Premium',
      '✅ Chatbot Lex con IA avanzada',
      '✅ Validación Face ID + reconocimiento facial',
      '✅ Voto manual con OCR de cédula',
      '✅ Pre-registro automático desde CRM/ERP',
      '✅ Asistencia predictiva (quién asistirá)',
      '✅ Quórum predictivo con alertas',
      '✅ Gráficas con análisis de sentimiento',
      '✅ Actas certificadas con blockchain',
      '✅ CRM avanzado: Voto negativo → Ticket <5min',
      '✅ Análisis de sentimiento (IA detecta insatisfacción)',
      '✅ Dashboard de satisfacción en tiempo real',
      'Todo ilimitado',
      'API premium sin límites',
      'Integración ERP/CRM/Salesforce',
      'Consultoría legal 4h/mes',
      'Soporte dedicado WhatsApp',
      'SLA 99.9% uptime',
      'Features a medida (1/trimestre)'
    ],
    cta: 'Contactar Ventas',
    recommended: 'admin'
  }
]

// Helper: Obtener plan por ID
export function getPlan(id: PlanTier): Plan | undefined {
  return PLANS.find(p => p.id === id)
}

// Helper: Calcular precio con extras
export function calculatePrice(
  planId: PlanTier, 
  properties: number, 
  extraAssemblies: number = 0
): number {
  const plan = getPlan(planId)
  if (!plan) return 0
  
  let total = plan.price
  
  // Agregar costo por unidades adicionales
  if (plan.limits.maxProperties !== 'unlimited' && properties > plan.limits.maxProperties) {
    const extraBlocks = Math.ceil((properties - plan.limits.maxProperties) / 100)
    total += extraBlocks * 50
  }
  
  // Agregar costo por asambleas adicionales
  if (plan.limits.extraCreditPrice && extraAssemblies > 0) {
    total += extraAssemblies * plan.limits.extraCreditPrice
  }
  
  return total
}
```

---

### **FASE 3: Actualizar Landing Page** (3 días)

#### **3. Actualizar componentes de pricing:**

```typescript
// src/components/pricing/PricingCard.tsx

interface PricingCardProps {
  plan: Plan
  userType?: 'admin' | 'junta' | 'residente'
}

export function PricingCard({ plan, userType }: PricingCardProps) {
  const isRecommended = plan.recommended === userType
  
  return (
    <div className={cn(
      "pricing-card",
      plan.popular && "popular",
      isRecommended && "recommended"
    )}>
      {plan.popular && <Badge>⭐ MÁS POPULAR</Badge>}
      {isRecommended && <Badge>Recomendado para ti</Badge>}
      
      <h3>{plan.displayName}</h3>
      
      <div className="price">
        <span className="amount">${plan.price}</span>
        <span className="period">/{plan.billing === 'monthly' ? 'mes' : 'evento'}</span>
      </div>
      
      {plan.commitment && (
        <Alert variant="warning">
          ⚠️ Compromiso mínimo {plan.commitment} meses
        </Alert>
      )}
      
      <ul className="features">
        {plan.features.map(feature => (
          <li key={feature}>✅ {feature}</li>
        ))}
      </ul>
      
      <Button size="lg">{plan.cta}</Button>
      
      {plan.id === 'STANDARD' && (
        <p className="fine-print">
          Ahorra $3,132/año vs Evento Único
        </p>
      )}
    </div>
  )
}
```

---

#### **4. Crear ROI Calculator:**

Ver ejemplo completo en `MARKETING.md` → Sección "INSTRUCCIONES PARA EL CODER" → "PRIORIDAD 4"

---

### **FASE 4: Testing** (1 día)

#### **Checklist de testing:**

- [ ] Precios correctos en todas las páginas
- [ ] Selector de perfil funciona (admin/junta/residente)
- [ ] Planes recomendados se muestran según perfil
- [ ] Compromiso de 2 meses visible en Standard
- [ ] Cálculo de extras funciona (250+ unidades)
- [ ] ROI Calculator funciona correctamente
- [ ] Responsive en mobile
- [ ] Checkout funcional con nuevos precios

---

## 📋 CHECKLIST COMPLETO

### **Base de Datos:**
- [ ] Ejecutar SQL en Supabase (agregar DUO_PACK, créditos, abuse)
- [ ] Verificar que enum `plan_tier` tiene 5 valores
- [ ] Verificar que tabla `organization_credits` existe

### **Código:**
- [ ] Actualizar `pricing.ts` con nuevos precios
- [ ] Crear/actualizar `PricingCard.tsx`
- [ ] Crear/actualizar `PricingTable.tsx`
- [ ] Crear `ROICalculator.tsx`
- [ ] Actualizar landing page con selector de perfil

### **UI/UX:**
- [ ] Precios visibles en landing
- [ ] Badge "MÁS POPULAR" en Standard
- [ ] Badge "Recomendado para ti" según perfil
- [ ] Compromiso 2 meses visible en Standard
- [ ] Responsive mobile

### **Testing:**
- [ ] Todos los planes se muestran correctamente
- [ ] Cálculo de extras funciona
- [ ] ROI Calculator funciona
- [ ] Checkout funcional

---

## 🎯 PRIORIDAD DE LECTURA

### **1. LEER PRIMERO (Obligatorio):**
✅ `MARKETING_PRECIOS_COMPLETO.md` (30 min) - **Único documento con TODO**

### **2. LEER SEGUNDO (Si implementas landing):**
✅ `LANDING_PAGE_ESTRATEGIA.md` (20 min) - Navegación adaptativa

### **3. NO NECESITAS LEER:**
❌ `ESTRATEGIA_B2B.md` (ya consolidado)
❌ `ESTRATEGIA_PRECIOS_ANTI_ABUSO.md` (precios v2.0, supersedido)
❌ `PAQUETES_Y_PRECIOS.md` (ELIMINADO - era redundante)

---

## 💬 PREGUNTAS FRECUENTES

### **P: ¿Por qué subieron tanto los precios?**
R: Posicionamiento premium + ROI demostrable. Ahorramos $3k-$6k en costos legales por asamblea. Los clientes pagan por el **valor**, no por el **precio**.

### **P: ¿Qué pasa con clientes actuales con precios v2.0?**
R: Los clientes existentes **mantienen su precio actual** (grandfather clause). Solo nuevos clientes pagan v3.0.

### **P: ¿El compromiso de 2 meses en Standard es obligatorio?**
R: Sí, para todos los nuevos clientes. Evita abuso del sistema.

### **P: ¿Dúo Pack es mejor que Standard?**
R: Depende:
- **Dúo Pack:** Para juntas que hacen 2 asambleas/año → $389 total
- **Standard:** Para edificios activos 2+ asambleas/año → $189/mes

### **P: ¿Dónde está el plan Demo gratis?**
R: El plan Demo sigue existiendo pero **no aparece en la tabla de precios** de la landing. Solo se ofrece como "Prueba 30 días gratis" (CTA).

### **P: ¿Dónde quedó PAQUETES_Y_PRECIOS.md?**
R: Lo **eliminamos** porque era redundante. TODO está ahora en `MARKETING_PRECIOS_COMPLETO.md`.

---

## 📞 SI TIENES DUDAS

**Leer primero:** `MARKETING_PRECIOS_COMPLETO.md` (tiene todas las respuestas)

**Si aún tienes dudas:**
1. Busca en `LANDING_PAGE_ESTRATEGIA.md`
2. Busca en `CONFIRMACION_PARA_CODER.md`
3. Pregunta a Henry

---

## ✅ ENTREGABLES

Cuando termines:

1. ✅ Base de datos actualizada (Supabase)
2. ✅ Tipos actualizados (`pricing.ts`)
3. ✅ Componentes creados (`PricingCard`, `ROICalculator`)
4. ✅ Landing page funcionando con nuevos precios
5. ✅ Screenshots de la landing funcionando
6. ✅ Notificar a QA para revisar

---

**Última actualización:** 28 Enero 2026 ✅ APROBADO  
**Autor:** Arquitecto  
**Para:** Coder  
**Prioridad:** 🔴 ALTA

---

## ✅ APROBACIÓN DE HENRY

**Status:** APROBADO para implementación  
**Fecha:** 28 Enero 2026  

**El Coder debe implementar:**
1. ✅ Precios v3.0 en landing page
2. ✅ Chatbot con información actualizada
3. ✅ Testimonios de clientes
4. ✅ Comparativas "Antes vs Ahora"
5. ✅ Funcionalidades completas por plan

**¿Listo para empezar? Lee `MARKETING_PRECIOS_COMPLETO.md` primero.** 🚀

**Nota:** Eliminamos `PAQUETES_Y_PRECIOS.md` (era redundante).  
Ahora TODO está en `MARKETING_PRECIOS_COMPLETO.md` - único documento de precios.
