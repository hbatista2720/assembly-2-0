# Resumen del Dashboard Admin PH — Estado actual y últimos cambios

**Documento para:** Contralor, Arquitecto, Marketing  
**Fecha de referencia:** Enero 2026 (actualizado Febrero 2026)  
**Producto:** LiveAssembly v2 — Panel de administración para Propiedades Horizontales (PH)

---

## Estado de validación (Contralor)

- **Reporte Coder:** Las mejoras R1–R4, R8 (plan visible, Modificar suscripción, Volver al Dashboard, lista PHs, página Suscripción) fueron aplicadas por el Coder (26 Ene 2026). Pendiente por Coder: bug botones **Ver detalle / Iniciar asamblea / Monitor** (llevan al resumen; deben llevar a detalle, live y monitor con id real), planes de pago único en Suscripción, y reglas R6/R6b/R9–R11 según Marketing. Ver Contralor/ESTATUS_AVANCE.md § "Para CODER – Dashboard Admin PH".
- **Arquitecto:** Debe **validar el proceso del dashboard** (flujos, rutas, coherencia con arquitectura) usando este documento. **Se espera respuesta de Marketing primero** para validar el flujo correcto; una vez Marketing confirme el flujo, el Arquitecto valida y reporta al Contralor.
- **Marketing:** Pendiente confirmar flujo correcto del Dashboard Admin PH (navegación, botones asamblea, monitor, suscripción) para que el Arquitecto pueda cerrar la validación.

---

## 1. Visión general del dashboard actual

El **Dashboard Admin PH** es el panel principal para administradores de propiedades horizontales. Permite:

- Gestionar **una o más PH** (selección de PH actual).
- Ver **métricas** (propietarios activos, asambleas del año, Face ID, alertas).
- Acceder a **asambleas** (crear, programar, listar, Kanban), **Monitor en vivo**, **propietarios**, **actas**, **reportes**, **suscripción**, **equipo** y **soporte**.

**Rutas principales:**

| Ruta | Descripción |
|------|-------------|
| `/dashboard/admin-ph` | Dashboard principal (KPIs, próxima asamblea, alertas) |
| `/dashboard/admin-ph/assemblies` | Lista/Kanban de asambleas, crear, editar, Monitor |
| `/dashboard/admin-ph/monitor/[assemblyId]` | Monitor en vivo por asamblea, filtro por tema, resultados de votación |
| `/dashboard/admin-ph/owners` | Gestión de propietarios (demo: 50, store local) |
| `/dashboard/admin-ph/subscription` | Plan y suscripción |
| `/dashboard/admin-ph/acts` | Actas |
| `/dashboard/admin-ph/reports` | Reportes |

**Modo demo:** Usuario `demo@assembly2.com`, plan Demo, **50 propietarios**, 2 asambleas de ejemplo (Ordinaria 2026, Extraordinaria Piscina), 1 crédito. Datos en localStorage (clave `assembly_admin_ph_assemblies_demo`).

**Diseño unificado:** Todas las vistas del Dashboard Admin PH (principal, Propietarios, Asambleas, Monitor, Actas, **Modificar suscripciones**, Configuración, Soporte) comparten el mismo layout (AdminPhShell), sidebar, clases CSS (`.card`, `.muted`, `.btn`, `.pricing-grid`, `.pricing-card`) y tema claro/oscuro. **Lo que varía entre vistas es solo el contenido:** en Suscripción, lo que cambia es el **plan** (Plan Demo vs planes de pago único o mensuales), no el diseño.

**Nombre del PH demo:** En todo el producto el PH de ejemplo se denomina **Urban Tower PH** (dashboard, Monitor, Actas, Configuración, store de residentes, platform-admin).

---

## 2. Últimos cambios realizados (para contralor y arquitecto)

### 2.1 Monitor: asamblea correcta y 50 unidades en demo

- **Problema:** El botón Monitor (desde Lista o Kanban de asambleas) llevaba a una vista con **311 unidades** en lugar de la asamblea asociada (50 en demo).
- **Solución:**  
  - APIs `/api/monitor/summary` y `/api/monitor/units` aceptan `demo=1` cuando el usuario es demo.  
  - Con `demo=1` el mock usa **50 unidades** (Urban Tower PH).  
  - La página Monitor detecta usuario demo y envía `demo=1` en las peticiones.  
- **Resultado:** Al hacer clic en Monitor desde una asamblea de la lista, se muestra la **asamblea correspondiente con 50 unidades** en entorno demo.

### 2.2 Monitor: filtro por tema y resultados por tema

- **Problema:** El Monitor no estaba alineado con los **temas de la asamblea** ni mostraba resultados de votación por tema.
- **Solución:**  
  - La asamblea tiene `topics[]` (ej. “Aprobación de presupuesto 2026”, “Mantenimiento de piscina”).  
  - En Monitor se cargan solo temas de **votación** (`votacion_simple`, `votacion_calificada`).  
  - Selector **“Tema: [dropdown]”** en el Monitor; por defecto el primer tema de votación.  
  - API de resumen acepta `topicId` y `topicTitle` y devuelve **tema + resultados (SI/NO/ABST)** coherentes con ese tema.  
- **Resultado:** Al abrir Monitor de una asamblea se **filtra por tema** y se **muestran los resultados de votación de ese tema**.

### 2.3 Asambleas: estado vacío y acceso al Monitor sin asambleas

- **Problema:** Con **cero asambleas creadas** no había guía clara y el acceso al Monitor podía resultar confuso.
- **Solución:**  
  - En Lista y Kanban, cuando no hay asambleas se muestra un **estado vacío**: “Aún no hay asambleas creadas” con botones **“Crear asamblea”** y **“Abrir Monitor demo”**.  
  - “Abrir Monitor demo” enlaza a `/dashboard/admin-ph/monitor/demo` (50 unidades).  
- **Resultado:** Sin asambleas, el usuario puede **crear una** o **probar el Monitor en demo** desde el mismo módulo.

### 2.4 Navegación “Ver asambleas” y carga

- **Problema:** Al hacer clic en **“Ver asambleas”** se veía brevemente la pantalla anterior y luego cambiaba.
- **Solución:**  
  - “Ver asambleas” pasó de `<a href>` a **`<Link>`** de Next.js (navegación en cliente).  
  - Se añadió **`loading.tsx`** en la ruta de asambleas con el mensaje “Cargando asambleas…”.  
- **Resultado:** Transición directa a la página de asambleas, **sin parpadeo** de la vista anterior.

### 2.5 Zona de cuenta / perfil (dashboard principal)

- **Problema:** La zona de cuenta/demo en el dashboard principal necesitaba una presentación más clara y actual.
- **Solución:**  
  - **Strip demo:** badge “Demo”, mensaje “Tu demo expira en 12 días”, barra de progreso, botón “Actualizar plan”.  
  - **Perfil:** avatar (iniciales o emoji), email, rol único “Admin PH” en demo, **chips de plan** (Plan Demo · 2 asambleas · 1 crédito · 50 propietarios).  
  - **Acciones:** Suscripción, Perfil (con iconos), Cerrar sesión destacado.  
- **Resultado:** Información de cuenta y plan más **legible y ordenada** para el administrador.

---

## 3. Métricas y datos de referencia (Contralor / Marketing)

| Concepto | Modo demo | Notas |
|----------|-----------|--------|
| Propietarios activos | **50** | Coherente en dashboard, propietarios, Monitor y asambleas |
| Asambleas 2026 | 1 (o 2 en lista según seed) | Store demo con 2 asambleas de ejemplo |
| Face ID activo | 33 (≈65% de 50) | Solo indicativo en demo |
| Plan | Plan Demo | 2 asambleas activas, 1 crédito, 50 propietarios |
| Unidades en Monitor | **50** | Cuando usuario es demo o se usa “Abrir Monitor demo” |

Estos números son los que debe usar **marketing** y **contralor** para comunicados, demos y validación de límites del plan demo.

---

## 4. Flujos validados (Arquitecto)

1. **Entrar al dashboard** → Seleccionar PH (o tener una ya elegida) → Ver KPIs y próxima asamblea.  
2. **Ver asambleas** → Navegación en cliente → “Cargando asambleas…” → Lista o Kanban (o estado vacío con “Crear asamblea” / “Abrir Monitor demo”).  
3. **Monitor desde una asamblea** → URL `/dashboard/admin-ph/monitor/[assemblyId]` → Carga temas de esa asamblea → Selector “Tema” → Resumen y resultados de votación del tema seleccionado (demo: 50 unidades).  
4. **Monitor sin asambleas** → Desde estado vacío, “Abrir Monitor demo” → `/dashboard/admin-ph/monitor/demo` → 50 unidades, tema por defecto.

---

## 5. Próximos pasos sugeridos (opcional)

- Definir **fecha real de expiración** de la demo y conectarla al strip “Tu demo expira en X días”.  
- Si se añaden más planes o límites, mantener **50** como tope explícito del demo en todas las vistas.  
- Documentar para **marketing** la frase: “Demo con 50 propietarios y 2 asambleas de ejemplo”.

---

## 6. Validación Arquitecto (proceso del dashboard)

**Instrucción Contralor:** El **Arquitecto** debe validar el proceso del dashboard Admin PH (flujos, rutas, coherencia con Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md) usando este documento (**docs/RESUMEN_DASHBOARD_ADMIN_PH.md**).

**Orden:** Se espera **respuesta de Marketing primero** para validar el flujo correcto (navegación, botones Ver detalle / Iniciar asamblea / Monitor, suscripción, planes de pago único). Cuando Marketing confirme el flujo, el Arquitecto valida y reporta al Contralor. Referencia: Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md, Contralor/ESTATUS_AVANCE.md.

---

*Documento generado a partir del estado actual del código y los últimos cambios aplicados al Dashboard Admin PH. Actualizado para coordinación Contralor–Arquitecto–Marketing.*
