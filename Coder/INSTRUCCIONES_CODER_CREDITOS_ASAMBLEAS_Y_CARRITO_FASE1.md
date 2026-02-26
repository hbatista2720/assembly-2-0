# Créditos para asambleas, wizard de suscripciones y advertencia sin crédito (Fase 1)

**Origen:** Henry (Product Owner) / Marketing  
**Fecha:** Febrero 2026

---

## Política de créditos de Assembly 2.0 (ya definida)

| Regla | Descripción |
|-------|-------------|
| **Consumo** | El crédito se **consume cuando la asamblea se CELEBRA** (estado "Completada"). |
| **Vigencia** | Si la asamblea **no se celebra**, el crédito tiene vigencia y expira según el plan. |
| **1 crédito = 1 asamblea** | Cada asamblea celebrada consume 1 crédito. |

### Dos modelos de pago

| Modelo | Créditos | Vigencia si no se usa |
|--------|----------|------------------------|
| **Pago único** | Evento Único (1), Dúo Pack (2). | Según plan (ver Marketing/MARKETING_PRECIOS_COMPLETO.md). |
| **Suscripción** | Mensuales acumulables (Standard: 2/mes, Multi-PH: 5–15/mes). | 6 meses FIFO. |

Validar que se contemplen **ambos** modelos.

---

## Pasarela de pago: Modo Fase 1 y Modo Fase 2

La pasarela de pago opera en dos modos configurables. **Henry (administrador principal)** elige el modo y activa/desactiva métodos desde su panel.

| Aspecto | Modo Fase 1 | Modo Fase 2 |
|---------|-------------|-------------|
| **Preset por defecto** | Solo ACH y Yappy activos | Todos los métodos activos |
| **Métodos ocultos** | PayPal, Tilopay, Transferencia, etc. | Ninguno (todos disponibles) |
| **Henry puede** | Activar más métodos si lo desea | Desactivar cualquier método |
| **Uso típico** | Lanzamiento inicial, aprobación manual | Producción, pagos automáticos |

**Regla clave:** No eliminar métodos del código. **Ocultar** cuando están desactivados. Henry los muestra/oculta desde "Configuración de pagos".

---

## Páginas del Dashboard de Henry (Admin Plataforma)

Henry modifica **planes** y **pasarela de pago** desde su panel **Admin Plataforma** (`/platform-admin/*` o `/dashboard/admin`). Añadir al sidebar de `PlatformAdminShell.tsx`:

| Ruta | Página | Función |
|------|--------|---------|
| `/platform-admin/plans` | **Planes y precios** | Modificar planes (Evento Único, Dúo Pack, Standard, Multi-PH Lite/Pro), precios, créditos por plan. |
| `/platform-admin/payment-config` | **Configuración de pagos** | Modo Fase 1 / Fase 2, activar/desactivar métodos (ACH, Yappy, PayPal, Tilopay, Transferencia). Órdenes pendientes de aprobación. |

### Navegación sugerida (sidebar Henry)

```
Admin Plataforma
├── Resumen ejecutivo      (/dashboard/admin)
├── Monitor VPS            (/platform-admin/monitoring)
├── Gestión de clientes    (/platform-admin/clients)
├── Planes y precios       (/platform-admin/plans)         ← NUEVO
├── Configuración de pagos (/platform-admin/payment-config) ← NUEVO
├── Métricas de negocio    (/platform-admin/business)
├── Funnel de leads        (/platform-admin/leads)
├── Tickets inteligentes   (/platform-admin/tickets)
├── CRM y campañas         (/platform-admin/crm)
└── Configuración Chatbot  (/platform-admin/chatbot-config)
```

### Contenido de cada página

- **Planes y precios:** Tabla o cards de planes con: nombre, precio, créditos, vigencia. Editar. (Fase 1 puede ser solo lectura si los planes vienen de Marketing.)
- **Configuración de pagos:** Selector Modo Fase 1 / Fase 2. Lista de métodos con toggle activo/inactivo. Lista de órdenes pendientes de aprobación con comprobante y botones Aprobar/Rechazar.

---

## Resumen de requisitos

1. **Wizard de Suscripciones:** flujo guiado para seleccionar plan, unidades y efectuar pago.
2. **Advertencia sin crédito:** pantalla clara cuando no hay crédito; bloquear creación de asamblea.
3. **Carrito de compra:** unificar flujo; carrito visible al agregar ítems.
4. **Fase 1 pago:** Por defecto solo ACH y Yappy visibles. Henry (administrador principal) puede **activar/desactivar** métodos desde su panel. Modo Fase 1 y Modo Fase 2 de pagos. No eliminar métodos: **ocultar** cuando están desactivados.

---

## 1. Advertencia sin crédito (diseño e implementación)

### Comportamiento

Cuando el usuario **no tiene créditos disponibles** para crear asambleas:

- **Bloquear** el botón "Crear asamblea" o "Guardar y continuar" (Fase 2 del wizard).
- Mostrar una **pantalla o card clara** con:
  - Icono de advertencia (ej. triángulo o círculo informativo).
  - Título: **"Sin créditos disponibles"** o **"Sin saldo disponible"**.
  - Mensaje: "No tiene créditos disponibles para crear asambleas. Debe comprar crédito primero."
  - Botón principal: **"Ir a Comprar Créditos"** o **"Ir a Suscripciones"** → lleva a la sección Suscripciones / carrito.

### Diseño sugerido

- Card o sección con fondo diferenciado (ej. suave para destacar el mensaje).
- Icono visible (advertencia o info).
- Texto breve y directo.
- Un solo CTA claro hacia la compra de créditos.

### Ubicación

- **Dashboard / Panel de la Comunidad:** card "Créditos disponibles: X". Si 0, mostrar advertencia.
- **Fase 2 (Crear asamblea) del wizard:** si no hay crédito, mostrar esta pantalla en lugar del formulario.
- **Módulo Asambleas (Crear asamblea):** misma validación.

---

## 2. Bloquear creación de asamblea sin crédito

- Antes de permitir "Crear asamblea" o "Guardar y continuar" (Fase 2): consultar `GET /api/assembly-credits/:organizationId`.
- Si `total_available < 1` → deshabilitar botón y mostrar: "Sin créditos disponibles. [Ir a Comprar Créditos]".
- No permitir crear asamblea hasta que haya crédito aprobado.

---

## 3. Unificar sidebar: un solo botón Suscripciones (eliminar Carrito separado)

### Problema actual

En la barra lateral del dashboard hay **2 botones** que confunden:
1. **Suscripción** (icono documento)
2. **Carrito de compra** (icono carrito) – ítem separado que lleva a `/cart`

### Solución

- **Un solo ítem** en el sidebar: **"Suscripciones"** o **"Suscripción y planes"**.
- **Eliminar** el ítem separado "Carrito" / SidebarCartLink del sidebar.
- El carrito se accede **dentro** de la página de Suscripciones:
  - Al agregar plan/unidades, mostrar "Ver carrito (N) →" en el contenido de la página.
  - La ruta `/cart` puede ser sub-ruta de suscripciones (ej. `/dashboard/admin-ph/subscription/cart`) o la misma página con paso activo "carrito".

### Implementación (AdminPhShell.tsx)

- Eliminar o no renderizar `SidebarCartLink` como ítem independiente en el sidebar.
- Mantener un solo ítem de navegación: Suscripción (href: `/dashboard/admin-ph/subscription`).
- El flujo del carrito vive dentro del wizard de suscripciones (ver abajo).

---

## 4. Wizard de Suscripciones y carrito de compra

### Objetivo

- **Flujo guiado tipo wizard** para el administrador: etapa 1 = elegir qué hacer; etapa 2 = ver opciones concretas.
- Carrito integrado en la página de Suscripciones (no como sidebar aparte).
- Al agregar plan o unidades → mostrar **carrito visible** (ej. "Ver carrito (N) →" en el contenido de la página).

### Estructura del wizard visual (2 niveles)

**Etapa 1 — "¿Qué deseas hacer?"** (3 opciones grandes, cards clicables):

| Opción | Descripción | Contenido de Etapa 2 |
|--------|-------------|----------------------|
| **Ver mi suscripción actual** | Plan, créditos, límites, historial | Resumen de cuenta + historial de facturación. Sin cards de planes. |
| **Comprar crédito** | Pago único | Evento Único, Dúo Pack + sección "Más unidades". |
| **Afiliación mensual** | Suscripción mensual | Standard, Multi-PH Lite, Multi-PH Pro, Enterprise. |

**Etapa 2 — Opciones** (parte inferior):
- Mostrar el contenido correspondiente a la opción elegida.
- Stepper visible: "Etapa 1: ¿Qué deseas hacer?" → "Etapa 2: [nombre de la opción]".

**Referencia:** `Marketing/MARKETING_PROPUESTA_WIZARD_SUSCRIPCIONES_VISUAL.md`

### Regla: no afectar precios ni lógica de créditos

- Mismos planes, mismos precios.
- Misma política de créditos (consumo al celebrar, vigencia, FIFO).
- Mismas APIs y estructura de datos.
- **Solo cambia la presentación (UI).**

### Pasos del flujo (después de elegir opción)

1. **Seleccionar plan** (según opción: pago único o suscripción).
2. **Agregar al carrito** (plan + unidades adicionales si aplica).
3. **Ver carrito** – resumen de ítems.
4. **Efectuar pago** – ACH/Yappy, comprobante, enviar orden.

### Elementos del carrito (sin cambios)

- **Planes – Pago único:** Evento Único, Dúo Pack.
- **Planes – Suscripción:** Standard, Multi-PH Lite, Multi-PH Pro.
- **Unidades adicionales** (+100, +200, +500, etc.) según plan.
- **Cupón de descuento** (código, botón Aplicar).
- **Resumen:** Subtotal, ITBMS, Total a pagar.
- **Acciones:** Vaciar carrito, Efectuar pago.

### Diseño del flujo

- Stepper en parte superior mostrando etapa actual.
- Opciones grandes en Etapa 1; cards de planes/opciones en Etapa 2 (parte inferior).
- Carrito visible al agregar (ej. "Ver carrito (N) →" en header).
- Página de pago con resumen del carrito y métodos de pago (sin cambios).

---

## 5. Modos de pago: Fase 1 y Fase 2 (activar/desactivar por Henry)

### Cambio requerido

**Situación actual (app de asambleas, fondo oscuro):** La pantalla "Completar pago" muestra PayPal, Tilopay, Yappy, ACH, Transferencia.

**NO eliminar métodos.** Ocultarlos cuando estén desactivados. Henry (administrador principal) los **activa y desactiva** desde su panel.

### Modo Fase 1 vs Modo Fase 2

| Modo      | Métodos visibles por defecto                         | Henry puede activar más en su panel |
|-----------|------------------------------------------------------|-------------------------------------|
| **Fase 1**  | Solo ACH y Yappy (PayPal, Tilopay, etc. ocultos)     | Sí                                  |
| **Fase 2**  | ACH, Yappy, PayPal, Tilopay y otros (todos disponibles) | Sí, puede desactivar cualquiera      |

### Panel Henry (administrador principal)

**Ruta:** `/platform-admin/payment-config` (ver sección "Páginas del Dashboard de Henry" más arriba).

- Sección **"Configuración de pagos"** o **"Métodos de pago"**.
- **Selector de modo:** "Modo Fase 1" / "Modo Fase 2". Al cambiar, se aplica el preset (Fase 1: solo ACH+Yappy; Fase 2: todos).
- Lista de métodos: ACH, Yappy, PayPal, Tilopay, Transferencia, etc.
- Toggle o switch para **activar / desactivar** cada uno.
- Los métodos desactivados **no se muestran** en la pantalla "Completar pago" del usuario final.
- Por defecto en **Modo Fase 1:** ACH y Yappy activos; resto desactivados.

### Diseño de referencia (imágenes fondo blanco)

Tomar como **referencia de diseño** la pantalla de pago que muestra:
- **Transferencia ACH:** Banco General - Cuenta Corriente, número de cuenta, "A nombre de [empresa]", botón copiar.
- **Yappy:** "Buscar en directorio [nombre empresa]", botón copiar.
- **Monto a pagar:** total en destacado.
- **Comprobante de pago (obligatorio):** área de subida "Click para subir archivo PDF, JPG o PNG".
- **Botón:** "Enviar Orden de Compra" (o "Enviar solicitud").

Adaptar ese layout al tema oscuro de la app de asambleas.

### Flujo de pago (modo Fase 1 por defecto)

1. Usuario selecciona plan/unidades en carrito → "Efectuar pago".
2. Pantalla **"Completar pago"** o **"Realiza tu pago"** con:
   - Resumen del carrito (ítems, subtotal, ITBMS, total).
   - **Solo métodos activos** (por defecto ACH y Yappy en Fase 1).
   - Monto a pagar en destacado.
3. **Comprobante de pago (obligatorio):** subir archivo PDF, JPG o PNG.
4. Botón **"Enviar Orden de Compra"** o **"Enviar solicitud"**.
5. Orden en estado **pendiente de aprobación** (Henry).

### Aprobación por Henry (administrador)

- Henry (Admin Plataforma) recibe notificación de orden pendiente.
- En panel de administración: lista de órdenes pendientes con comprobante adjunto.
- Henry revisa y **aprueba** o **rechaza**.
- Al aprobar: se acreditan los créditos a la organización del comprador.

### Email al comprador

- **Cuando Henry aprueba:** enviar correo al comprador con:
  - "Su pago ha sido aprobado."
  - "Créditos disponibles para asambleas: [cantidad]."
  - "Ya puede crear asambleas desde [link al Proceso de Asamblea o Asambleas]."

---

## 6. Estructura de datos sugerida (para Coder/Arquitecto)

- **Órdenes de compra:** tabla `purchase_orders` o similar con: usuario, organización, ítems (plan, unidades), monto, método (ACH/YAPPY/PayPal/etc.), comprobante_archivo_url, estado (PENDING, APPROVED, REJECTED), aprobado_por, aprobado_at.
- **Créditos:** tabla `organization_credits` (ya referenciada) con vigencia y consumo.
- **Métodos de pago (configuración):** tabla `payment_method_config` o similar: método (ACH, YAPPY, PAYPAL, TILOPAY, TRANSFERENCIA), activo (boolean), orden. Henry los activa/desactiva desde su panel. Por defecto: ACH y Yappy activos (Modo Fase 1).
- **Modo de pagos:** campo o config `payment_mode` (FASE_1 | FASE_2) para preset; en Fase 1 los demás métodos vienen desactivados. Henry puede cambiar el modo desde su panel (ej. toggle "Usar Modo Fase 1" que aplica el preset).
- **Notificaciones:** email al aprobar; posible notificación in-app para Henry.

---

## 7. Resumen de cambios para el Coder

| Área | Cambio |
|------|--------|
| **Sidebar** | **Un solo botón:** "Suscripciones". Eliminar ítem separado "Carrito" (SidebarCartLink). Carrito dentro del wizard de Suscripciones. |
| **Advertencia sin crédito** | Pantalla/card con icono, "Sin créditos disponibles", mensaje y botón "Ir a Comprar Créditos". Bloquear creación de asamblea. |
| **Wizard de Suscripciones** | Wizard visual 2 niveles: Etapa 1 = "¿Qué deseas hacer?" (Ver suscripción / Comprar crédito / Afiliación mensual); Etapa 2 = opciones. Stepper visible. "Ver carrito (N) →" en header. No afectar precios ni lógica. Ver Marketing/MARKETING_PROPUESTA_WIZARD_SUSCRIPCIONES_VISUAL.md. |
| **Carrito** | Integrado en Suscripciones. Agregar plan + unidades, cupón, resumen, Vaciar, Efectuar pago. |
| **Pago Fase 1/2** | **Modo Fase 1:** solo ACH y Yappy visibles (resto ocultos). **Modo Fase 2:** todos disponibles. Henry activa/desactiva métodos en `/platform-admin/payment-config`. No eliminar: ocultar. Comprobante, "Enviar solicitud", aprobación Henry, email. |
| **Dashboard Henry** | Añadir en sidebar: **Planes y precios** (`/platform-admin/plans`), **Configuración de pagos** (`/platform-admin/payment-config`). Ver sección "Páginas del Dashboard de Henry". |

---

## 8. Prioridad

- **Alta:** Wizard de suscripciones, advertencia sin crédito (diseño claro), carrito unificado.
- **Alta:** Flujo pago ACH/Yappy + comprobante + aprobación Henry + email.

---

## 9. Migración BD para suscripciones y facturación

**Verificar si las tablas existen:**
```bash
npm run db:check
```

**Crear tablas faltantes** (organizations, subscriptions, invoices, manual_payment_requests):
```bash
npm run db:migrate
```

O manualmente con psql:
```bash
psql -U postgres -d assembly -f sql_snippets/auth_otp_local.sql
psql -U postgres -d assembly -f sql_snippets/schema_subscriptions_base.sql
psql -U postgres -d assembly -f src/lib/db/migrations/010_payment_methods.sql
psql -U postgres -d assembly -f src/lib/db/migrations/018_payment_proof.sql
```

La migración 018 añade `proof_base64` y `proof_filename` a `manual_payment_requests`. Si no se ejecuta, el flujo funciona pero sin guardar el comprobante (fallback sin columnas).

---

## 10. Checklist de validación (Coder)

| Validación | Descripción |
|------------|-------------|
| **Ambos modelos contemplados** | Verificar que se contemplen **ambos** modelos: **Pago único** (Evento Único, Dúo Pack) y **Suscripción** (Standard, Multi-PH Lite, Multi-PH Pro). Carrito, wizard y flujo de pago deben soportar los dos. |
| **App de certificados** | La app de certificados se usa **solo como referencia de UI** (diseño, layout, patrones visuales). No reutilizar lógica ni estructura de datos; Assembly 2.0 tiene su propio modelo de créditos y órdenes. |
| **Sidebar unificado** | Un solo ítem "Suscripciones". Sin ítem separado "Carrito" en la barra lateral. |
| **Política de créditos** | Crédito se consume al **celebrar** asamblea (no al crear). Si no se celebra, crédito tiene vigencia y expira. |
| **Pago único** | Planes Evento Único, Dúo Pack. Carrito y flujo deben soportarlos. |
| **Suscripción** | Planes Standard, Multi-PH Lite, Multi-PH Pro. Créditos mensuales acumulables, vigencia 6 meses FIFO. |
| **Advertencia sin crédito** | Pantalla clara con icono, mensaje y CTA "Ir a Comprar Créditos". Bloquear creación sin crédito. |
| **Wizard de suscripciones** | Wizard visual: Etapa 1 (Ver suscripción / Comprar crédito / Afiliación mensual), Etapa 2 (opciones). Stepper visible. No afectar precios ni lógica. Ver MARKETING_PROPUESTA_WIZARD_SUSCRIPCIONES_VISUAL.md. |
| **Pasarela de pago** | Implementar **Modo Fase 1** (solo ACH + Yappy por defecto) y **Modo Fase 2** (todos). Henry cambia modo y activa/desactiva métodos en `/platform-admin/payment-config`. Ocultar métodos desactivados (no eliminar). |
| **Páginas Henry** | Crear `/platform-admin/plans` (Planes y precios) y `/platform-admin/payment-config` (Configuración de pagos + órdenes pendientes). Añadir ambas al sidebar de `PlatformAdminShell.tsx`. |

---

## 11. Nota sobre la app de certificados

La **app de certificados** (si existe en el ecosistema del proyecto) debe usarse únicamente como **referencia de UI** para inspiración visual (cards, wizards, formularios de pago). No copiar lógica, APIs ni estructura de datos. Assembly 2.0 define su propio modelo de créditos, órdenes y flujo según este documento y las referencias de Marketing/Arquitecto.

---

*Marketing documenta; Contralor prioriza; Coder implementa. Referencias: Marketing/MARKETING_VALIDACION_SUSCRIPCION_POR_FASE_WIZARD.md, Marketing/MARKETING_PRECIOS_COMPLETO.md, Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md.*
