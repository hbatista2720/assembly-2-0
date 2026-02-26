# Propuesta: Wizard visual para Suscripciones

**Origen:** Henry (Product Owner)  
**Fecha:** Febrero 2026  
**Objetivo:** Migrar la sección de suscripciones a un flujo tipo wizard más fácil para el administrador.

---

## Análisis de la situación actual

La pantalla actual de "Suscripciones y planes" muestra:

- **Barra superior:** 4 tarjetas (Plan actual, Unidades, Cuenta, Facturación) + toggle Planes pago único / Planes mensuales
- **Contenido:** Resumen de cuenta, historial, planes de pago único, planes mensuales, sección "¿Necesitas más unidades?"

**Problema:** El administrador ve todo a la vez. No hay un flujo guiado claro. Las opciones están dispersas.

---

## Propuesta: Wizard en 2 niveles

### Nivel 1 — Etapa inicial: "¿Qué deseas hacer?"

Mostrar **3 opciones grandes** (cards clicables) que guían al administrador:

| Opción | Descripción corta | Lleva a |
|--------|-------------------|---------|
| **1. Ver mi suscripción actual** | Plan, créditos, límites, historial | Resumen + historial de facturación |
| **2. Comprar crédito** | Pago único: Evento Único, Dúo Pack | Planes pago único + unidades opcionales |
| **3. Afiliación mensual** | Suscripción: Standard, Multi-PH Lite/Pro | Planes mensuales |

### Nivel 2 — Opciones de la etapa elegida

Al elegir una opción, se muestra debajo:

- **Indicador de etapa** en la parte superior (stepper: "Etapa 1 de 2" o similar)
- **Contenido de la etapa** con las opciones concretas (cards de planes, tabla, etc.)

### Diseño visual sugerido

```
┌─────────────────────────────────────────────────────────────────┐
│  SUSCRIPCIONES Y PLANES                                          │
│  Gestiona tu plan, compra crédito o afíliate mensualmente.       │
│  [Ver carrito (N) →]                                             │
├─────────────────────────────────────────────────────────────────┤
│  Etapa 1: ¿Qué deseas hacer?                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Ver mi       │  │ Comprar      │  │ Afiliación   │           │
│  │ suscripción  │  │ crédito      │  │ mensual      │           │
│  │ actual       │  │              │  │              │           │
│  │ [Seleccionar]│  │ [Seleccionar]│  │ [Seleccionar]│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  Etapa 2: Opciones                                               │
│  (según lo elegido arriba)                                       │
│  ┌────────────┐ ┌────────────┐  ...                             │
│  │ Evento     │ │ Dúo Pack   │                                  │
│  │ Único $225 │ │ $389       │                                  │
│  └────────────┘ └────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Impacto en precios y lógica de créditos

| Aspecto | ¿Se modifica? | Nota |
|---------|---------------|------|
| **Precios** | No | Mismos planes, mismos montos (Evento Único $225, Dúo $389, Standard $189/mes, etc.) |
| **Política de créditos** | No | Consumo al celebrar, vigencia, FIFO — sin cambios |
| **APIs** | No | GET assembly-credits, billing-history, addPlan, checkout — igual |
| **Estructura de datos** | No | organization_credits, purchase_orders — igual |
| **Carrito** | No | Misma lógica: addPlan, itemCount, Ver carrito → checkout |

**Conclusión:** Solo cambia la **presentación (UI/UX)**. No se toca la lógica de negocio ni los precios.

---

## Flujo detallado por opción

### Opción 1 — Ver mi suscripción actual

- Mostrar: Plan actual, créditos disponibles, límites de unidades
- Mostrar: Resumen de cuenta e historial de facturación
- Sin cards de planes; sin agregar al carrito en esta vista
- Enlace: "¿Necesitas más? [Comprar crédito] [Afiliación mensual]"

### Opción 2 — Comprar crédito (pago único)

- Mostrar: Cards Evento Único, Dúo Pack
- Mostrar: Sección "¿Necesitas más unidades?" con link a units-addon
- Botones: Agregar al carrito / Pagar directamente
- Carrito visible: "Ver carrito (N) →"

### Opción 3 — Afiliación mensual

- Mostrar: Cards Standard, Multi-PH Lite, Multi-PH Pro, Enterprise
- Misma lógica de agregar al carrito
- Carrito visible: "Ver carrito (N) →"

---

## Recomendación

1. **Implementar el wizard visual** manteniendo toda la lógica existente.
2. **Stepper visible** en la parte superior: "Etapa 1: ¿Qué deseas hacer?" → "Etapa 2: [Nombre de la opción]".
3. **Opciones en la parte inferior** según la elección del administrador.
4. **No modificar** precios, APIs ni política de créditos.
5. **Persistir la elección** en estado local (useState) o URL (ej. `?step=comprar-credito`) para poder volver atrás sin perder contexto.

---

## Referencias

- Coder: `INSTRUCCIONES_CODER_CREDITOS_ASAMBLEAS_Y_CARRITO_FASE1.md`
- Precios: `Marketing/MARKETING_PRECIOS_COMPLETO.md`
- Página actual: `src/app/dashboard/admin-ph/subscription/page.tsx`
