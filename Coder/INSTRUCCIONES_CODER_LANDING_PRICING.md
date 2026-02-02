# 🎯 INSTRUCCIONES PARA AGENTE CODER: Landing Page de Precios

**Fecha:** 27 Enero 2026  
**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 4-6 horas  
**Estado:** LISTO PARA IMPLEMENTAR

---

## 📋 OBJETIVO

Crear la página de precios públicos de Assembly 2.0 con 5 paquetes definidos, tabla comparativa, calculadora interactiva y diseño premium.

---

## ✅ PASO 1: Crear estructura de tipos (15 min)

### 1.1 Crear archivo de tipos

**Crea:** `src/lib/types/pricing.ts`

```typescript
export type PlanTier = 'DEMO' | 'PAY_PER_EVENT' | 'STANDARD' | 'PRO' | 'ENTERPRISE'

export type BillingCycle = 'one-time' | 'monthly' | 'annual'

export interface PlanLimits {
  assembliesPerMonth: number | 'unlimited'
  maxPropertiesPerAssembly: number | 'unlimited'
  maxTopicsPerAssembly: number | 'unlimited'
  maxBuildings: number | 'unlimited'
  historyDays: number | 'unlimited'
}

export interface Plan {
  id: PlanTier
  name: string
  displayName: string
  tagline: string
  price: number
  priceAnnual?: number
  billing: BillingCycle
  limits: PlanLimits
  features: string[]
  restrictions?: string[]
  cta: string
  ctaVariant: 'primary' | 'secondary' | 'accent'
  popular?: boolean
  badge?: string
}

export const PLANS: Plan[] = [
  {
    id: 'DEMO',
    name: 'Demo',
    displayName: 'Prueba Gratis',
    tagline: 'Sin compromiso, sin tarjeta',
    price: 0,
    billing: 'one-time',
    limits: {
      assembliesPerMonth: 1,
      maxPropertiesPerAssembly: 50,
      maxTopicsPerAssembly: 5,
      maxBuildings: 1,
      historyDays: 7
    },
    features: [
      'Hasta 50 propietarios',
      'Face ID funcional',
      '5 temas para votar',
      'Acta digital en PDF',
      'Vista de presentación básica'
    ],
    restrictions: [
      'Marca de agua "Demo"',
      'Datos borrados en 7 días',
      'Sin soporte prioritario'
    ],
    cta: 'Probar Gratis',
    ctaVariant: 'secondary'
  },
  {
    id: 'PAY_PER_EVENT',
    name: 'PayPerEvent',
    displayName: 'Por Asamblea',
    tagline: 'Paga solo cuando uses',
    price: 150,
    billing: 'one-time',
    limits: {
      assembliesPerMonth: 1,
      maxPropertiesPerAssembly: 200,
      maxTopicsPerAssembly: 15,
      maxBuildings: 1,
      historyDays: 30
    },
    features: [
      'Hasta 200 propietarios',
      'Face ID ilimitado',
      '15 temas para votar',
      'Vista presentación profesional',
      'Soporte durante asamblea',
      'Histórico 30 días',
      'Exportar a Excel'
    ],
    cta: 'Comprar Asamblea',
    ctaVariant: 'secondary'
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    displayName: 'Standard',
    tagline: 'Para edificios activos',
    price: 99,
    priceAnnual: 990,
    billing: 'monthly',
    limits: {
      assembliesPerMonth: 3,
      maxPropertiesPerAssembly: 200,
      maxTopicsPerAssembly: 'unlimited',
      maxBuildings: 1,
      historyDays: 'unlimited'
    },
    features: [
      '3 asambleas/mes incluidas',
      'Dashboard siempre activo',
      'Histórico ilimitado',
      'Reportes y estadísticas',
      'Soporte 24/7 prioritario',
      'API básico',
      'Exportar todo a Excel',
      'Templates de convocatorias'
    ],
    cta: 'Empezar Standard',
    ctaVariant: 'accent',
    popular: true,
    badge: '⭐ MÁS POPULAR'
  },
  {
    id: 'PRO',
    name: 'Pro',
    displayName: 'Pro Multi-PH',
    tagline: 'Para administradoras',
    price: 499,
    priceAnnual: 4990,
    billing: 'monthly',
    limits: {
      assembliesPerMonth: 'unlimited',
      maxPropertiesPerAssembly: 5000,
      maxTopicsPerAssembly: 'unlimited',
      maxBuildings: 50,
      historyDays: 'unlimited'
    },
    features: [
      'Hasta 50 edificios',
      'Asambleas ilimitadas',
      'Panel multi-tenant',
      'Roles y permisos',
      'Reportes consolidados',
      'API completo',
      'White label (tu logo)',
      'Account manager',
      'Onboarding personalizado',
      'Capacitación inicial 2h'
    ],
    cta: 'Agendar Demo',
    ctaVariant: 'primary'
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    displayName: 'Enterprise + CRM',
    tagline: 'Para promotoras grandes',
    price: 1499,
    priceAnnual: 14990,
    billing: 'monthly',
    limits: {
      assembliesPerMonth: 'unlimited',
      maxPropertiesPerAssembly: 'unlimited',
      maxTopicsPerAssembly: 'unlimited',
      maxBuildings: 'unlimited',
      historyDays: 'unlimited'
    },
    features: [
      'Unidades ilimitadas',
      'CRM integrado (tickets)',
      'Separación propietarios/inquilinos',
      'Dashboard de satisfacción',
      'Integraciones ERP/CRM custom',
      'Consultoría legal 4h/mes',
      'Reportes personalizados',
      'Soporte dedicado',
      'SLA 99.9% garantizado',
      'Desarrollo de features a medida'
    ],
    cta: 'Consultoría Empresarial',
    ctaVariant: 'primary'
  }
]

// Función helper para obtener plan por ID
export function getPlanById(id: PlanTier): Plan | undefined {
  return PLANS.find(plan => plan.id === id)
}

// Función para calcular ahorro anual
export function calculateAnnualSavings(plan: Plan): number {
  if (!plan.priceAnnual) return 0
  return (plan.price * 12) - plan.priceAnnual
}
```

**Confirma:** "✅ Tipos creados en src/lib/types/pricing.ts"

---

## ✅ PASO 2: Crear componentes base (45 min)

### 2.1 Toggle Mensual/Anual

**Crea:** `src/components/pricing/BillingToggle.tsx`

```typescript
'use client'

import { useState } from 'react'

interface BillingToggleProps {
  value: 'monthly' | 'annual'
  onChange: (value: 'monthly' | 'annual') => void
}

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <button
        onClick={() => onChange('monthly')}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          value === 'monthly'
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        Mensual
      </button>
      <button
        onClick={() => onChange('annual')}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          value === 'annual'
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        Anual
        <span className="ml-2 text-xs bg-emerald-500 px-2 py-1 rounded-full text-white">
          Ahorra 20%
        </span>
      </button>
    </div>
  )
}
```

### 2.2 Card de Precio Individual

**Crea:** `src/components/pricing/PricingCard.tsx`

```typescript
'use client'

import { Plan } from '@/lib/types/pricing'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PricingCardProps {
  plan: Plan
  billingCycle: 'monthly' | 'annual'
  onSelect: () => void
}

export function PricingCard({ plan, billingCycle, onSelect }: PricingCardProps) {
  const displayPrice = billingCycle === 'annual' && plan.priceAnnual 
    ? Math.round(plan.priceAnnual / 12)
    : plan.price

  const isAnnual = billingCycle === 'annual' && plan.priceAnnual

  return (
    <div
      className={`relative rounded-2xl border p-8 transition-all hover:scale-105 ${
        plan.popular
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-slate-900 shadow-xl shadow-indigo-500/20'
          : 'border-slate-800 bg-slate-900/70'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold text-white">
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">{plan.displayName}</h3>
        <p className="text-sm text-slate-400 mt-1">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {plan.price === 0 ? (
          <div className="text-5xl font-black text-white">Gratis</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">${displayPrice}</span>
              {plan.billing !== 'one-time' && (
                <span className="text-slate-400">/mes</span>
              )}
            </div>
            {isAnnual && (
              <p className="text-sm text-emerald-400 mt-1">
                Pagas ${plan.priceAnnual}/año (ahorras ${(plan.price * 12) - plan.priceAnnual!})
              </p>
            )}
            {plan.billing === 'one-time' && (
              <p className="text-sm text-slate-400 mt-1">Pago único por evento</p>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-200">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Restrictions */}
      {plan.restrictions && plan.restrictions.length > 0 && (
        <ul className="space-y-2 mb-6 pt-6 border-t border-slate-800">
          {plan.restrictions.map((restriction, index) => (
            <li key={index} className="flex items-start gap-3">
              <XMarkIcon className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-400">{restriction}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <button
        onClick={onSelect}
        className={`w-full rounded-full py-3 px-6 font-semibold transition-all ${
          plan.ctaVariant === 'accent'
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/50'
            : plan.ctaVariant === 'primary'
            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
            : 'border-2 border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  )
}
```

### 2.3 Calculadora de Ahorro

**Crea:** `src/components/pricing/PricingCalculator.tsx`

```typescript
'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/types/pricing'

export function PricingCalculator() {
  const [assembliesPerYear, setAssembliesPerYear] = useState(2)

  const payPerEventCost = assembliesPerYear * 150
  const standardCost = 99 * 12
  const savings = payPerEventCost - standardCost

  const recommended = assembliesPerYear >= 2 ? 'Standard' : 'Por Asamblea'

  return (
    <div className="max-w-2xl mx-auto my-16 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-indigo-950/40 p-8">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        Calculadora de Ahorro
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          ¿Cuántas asambleas haces al año?
        </label>
        <input
          type="range"
          min="1"
          max="12"
          value={assembliesPerYear}
          onChange={(e) => setAssembliesPerYear(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-slate-400 mt-2">
          <span>1</span>
          <span className="text-2xl font-bold text-white">{assembliesPerYear}</span>
          <span>12</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">Pay-per-Event</p>
          <p className="text-2xl font-bold text-white">${payPerEventCost}/año</p>
        </div>
        <div className="rounded-lg bg-indigo-500/20 p-4 border border-indigo-500/50">
          <p className="text-sm text-indigo-300">Plan Standard</p>
          <p className="text-2xl font-bold text-white">${standardCost}/año</p>
        </div>
      </div>

      {savings > 0 ? (
        <div className="text-center p-6 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
          <p className="text-sm text-emerald-300 mb-2">Con plan Standard ahorras:</p>
          <p className="text-4xl font-black text-emerald-400">${savings}/año</p>
          <p className="text-sm text-slate-300 mt-4">
            Plan recomendado: <strong className="text-white">{recommended}</strong>
          </p>
        </div>
      ) : (
        <div className="text-center p-6 rounded-lg bg-slate-800/50">
          <p className="text-slate-300">
            Para {assembliesPerYear} asamblea{assembliesPerYear > 1 ? 's' : ''} al año, 
            te conviene más <strong className="text-white">Pay-per-Event</strong>
          </p>
        </div>
      )}
    </div>
  )
}
```

**Confirma:** "✅ Componentes base creados"

---

## ✅ PASO 3: Crear página de precios (30 min)

**Crea:** `src/app/(marketing)/pricing/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/types/pricing'
import { BillingToggle } from '@/components/pricing/BillingToggle'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PricingCalculator } from '@/components/pricing/PricingCalculator'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  function handleSelectPlan(planId: string) {
    // TODO: Redirigir a checkout o dashboard
    console.log('Plan seleccionado:', planId)
    alert(`Plan ${planId} seleccionado. Funcionalidad pendiente.`)
  }

  return (
    <div className="min-h-screen py-20 px-6">
      {/* Hero */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-400 mb-4">
          Precios
        </p>
        <h1 className="text-5xl font-bold text-white mb-6">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Desde pruebas gratuitas hasta soluciones enterprise.
          Todos los planes incluyen Face ID y cumplimiento legal.
        </p>
      </div>

      {/* Toggle */}
      <BillingToggle value={billingCycle} onChange={setBillingCycle} />

      {/* Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
      </div>

      {/* Calculator */}
      <PricingCalculator />

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-20">
        <h2 className="text-3xl font-bold text-white text-center mb-10">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-6">
          {[
            {
              q: '¿Puedo cambiar de plan en cualquier momento?',
              a: 'Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplican inmediatamente.'
            },
            {
              q: '¿Qué pasa si cancelo mi suscripción?',
              a: 'Puedes seguir usando el servicio hasta el final del período pagado. Tus datos se conservan por 90 días.'
            },
            {
              q: '¿Ofrecen reembolsos?',
              a: 'Sí, reembolso completo si cancelas dentro de los primeros 14 días y no has usado más de 1 asamblea.'
            },
            {
              q: '¿Cómo funciona la facturación?',
              a: 'Aceptamos tarjetas de crédito, débito y transferencias bancarias. Factura automática cada mes/año.'
            }
          ].map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border border-slate-800 bg-slate-900/70 p-6"
            >
              <summary className="cursor-pointer text-lg font-semibold text-white list-none">
                {faq.q}
              </summary>
              <p className="mt-4 text-slate-300">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-4xl mx-auto mt-20 text-center rounded-2xl border border-indigo-500 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          ¿Aún tienes dudas?
        </h2>
        <p className="text-lg text-slate-300 mb-8">
          Agenda una consulta gratuita de 30 minutos con nuestro equipo
        </p>
        <button className="rounded-full bg-indigo-500 px-8 py-4 text-lg font-semibold text-white hover:bg-indigo-600 transition">
          Agendar Consultoría Gratis
        </button>
      </div>
    </div>
  )
}
```

**Confirma:** "✅ Página de precios creada"

---

## ✅ PASO 4: Actualizar navegación (10 min)

### 4.1 Agregar link en la landing principal

**Actualiza:** `src/app/page.tsx`

Agrega en la sección de botones:

```typescript
<a
  href="/pricing"
  className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
>
  Ver Precios
</a>
```

### 4.2 Agregar en el layout de marketing (si existe)

**Si existe:** `src/app/(marketing)/layout.tsx`

Agrega navegación:

```typescript
<nav className="flex gap-6">
  <a href="/" className="text-slate-300 hover:text-white">Inicio</a>
  <a href="/pricing" className="text-slate-300 hover:text-white">Precios</a>
  <a href="/login" className="text-slate-300 hover:text-white">Iniciar Sesión</a>
</nav>
```

**Confirma:** "✅ Navegación actualizada"

---

## ✅ PASO 5: Instalar dependencias si faltan (5 min)

```bash
# Si no tienes @heroicons/react instalado:
npm install @heroicons/react

# Si quieres animaciones suaves:
npm install framer-motion
```

**Confirma:** "✅ Dependencias instaladas"

---

## ✅ PASO 6: Probar todo (15 min)

### 6.1 Iniciar servidor

```bash
npm run dev
# o si usas Docker:
docker-compose restart web
```

### 6.2 Abrir navegador

Ve a: **http://localhost:3001/pricing**

### 6.3 Verificar que funcione:

- [ ] Se ven las 5 cards de precios
- [ ] Toggle mensual/anual funciona
- [ ] Card "Standard" tiene badge "⭐ MÁS POPULAR"
- [ ] Calculadora muestra ahorro correctamente
- [ ] Al mover el slider, los números cambian
- [ ] FAQ se expande al hacer click
- [ ] Responsive: se ve bien en móvil

### 6.4 Tomar screenshots

Toma 3 screenshots:
1. Vista completa de las 5 cards
2. Calculadora funcionando
3. Vista móvil

**Envía screenshots a Henry para aprobación**

**Confirma:** "✅ Página probada y funcionando"

---

## 📸 RESULTADO ESPERADO

Deberías ver algo así:

```
┌────────────────────────────────────────────────────────┐
│              Elige el plan perfecto para ti            │
├────────────────────────────────────────────────────────┤
│                                                        │
│        [Mensual]  [Anual - Ahorra 20%]                │
│                                                        │
│  ┌────┐  ┌────┐  ┌──────────┐  ┌────┐  ┌────┐       │
│  │Demo│  │$150│  │ Standard │  │$499│  │$1499│      │
│  │    │  │    │  │⭐ POPULAR │  │    │  │     │      │
│  │    │  │    │  │          │  │    │  │     │      │
│  │Free│  │Pago│  │  $99/mes │  │Pro │  │Ent. │      │
│  └────┘  └────┘  └──────────┘  └────┘  └────┘       │
│                                                        │
│              [Calculadora de Ahorro]                   │
│                                                        │
│              [FAQ]                                     │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 CHECKLIST DE DISEÑO

- [ ] Fondo dark con gradientes sutiles
- [ ] Cards con hover effect (scale 1.05)
- [ ] Card "Standard" destacada con borde indigo
- [ ] Íconos checkmark (✅) en verde para features
- [ ] Íconos X en gris para restricciones
- [ ] Botones con colores según variante
- [ ] Animaciones suaves en transiciones
- [ ] Responsive: stack vertical en móvil
- [ ] Fuente Inter, tamaños consistentes
- [ ] Espaciado generoso (padding, gaps)

---

## ❓ SI ALGO FALLA

### Error: "@heroicons/react not found"
```bash
npm install @heroicons/react
```

### Error: "Cannot find module pricing"
Verifica que creaste: `src/lib/types/pricing.ts`

### Las cards se ven mal en móvil
Asegúrate de usar:
```typescript
className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
```

### Toggle no cambia precios
Verifica que `billingCycle` se pasa como prop a `PricingCard`

---

## 🚀 SIGUIENTES PASOS (Después de aprobar)

Una vez Henry apruebe el diseño:

1. **Integrar con Stripe** (checkout real)
2. **Crear página de registro** con selección de plan
3. **Dashboard de usuario** con upgrade/downgrade
4. **Agregar a base de datos** (tabla subscriptions)

---

## ✅ CONFIRMACIÓN FINAL

**Agente Coder, cuando termines TODOS los pasos:**

Envía este mensaje:

```
✅ LANDING PAGE DE PRECIOS COMPLETADA

Implementado:
- 5 paquetes (Demo, Pay-per-Event, Standard, Pro, Enterprise)
- Toggle mensual/anual funcional
- Calculadora de ahorro interactiva
- FAQ accordion
- Responsive design
- Screenshots adjuntos

URL: http://localhost:3001/pricing

Esperando aprobación de Henry para continuar.
```

---

**🎯 EMPIEZA CON PASO 1 AHORA**
