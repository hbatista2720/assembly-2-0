# Instrucciones Coder: Wizard Proceso de Asamblea y módulos del Dashboard

**Origen:** Marketing (análisis Henry)  
**Fecha:** Febrero 2026  
**Referencias:**
- `Marketing/MARKETING_RECOMENDACION_WIZARD_ASAMBLEAS_UN_MODULO.md`
- `Marketing/MARKETING_VALIDACION_SUSCRIPCION_POR_FASE_WIZARD.md` (validación suscripción/créditos por fase)

---

## Flujo de habilitación (Henry)

1. **Crear PH** con el formulario "Crear propiedad horizontal" (lista de PHs).
2. **Entrar al dashboard del PH** (clic en "Entrar al dashboard" o en la tarjeta del PH).
3. **Módulo "Proceso de Asamblea" se habilita** en el sidebar (solo cuando hay PH seleccionado). Usar `showWhenNoPh: false` en `NAV_ITEMS`.

---

## Módulos actuales visibles en el Dashboard Admin PH

### Sidebar (`AdminPhShell.tsx` – `NAV_ITEMS`)

| # | Ruta | Label | Notas |
|---|------|-------|-------|
| 1 | `/dashboard/admin-ph` | Dashboard principal | Resumen, KPIs, Próxima asamblea |
| 2 | `/dashboard/admin-ph` | Tus propiedades | Mismo destino que Dashboard (lista PHs) |
| 3 | `/dashboard/admin-ph/subscription` | Modificar suscripciones | Planes, pago |
| 4 | `/dashboard/admin-ph/owners` | Propietarios | Registro residentes |
| 5 | `/dashboard/admin-ph/assemblies` | Asambleas | Lista, crear, Kanban |
| 6 | `/dashboard/admin-ph/monitor` | Monitor Back Office | Quórum, votación |
| 7 | `/dashboard/admin-ph/acts` | Actas | Actas generadas |
| 8 | `/dashboard/admin-ph/reports` | Reportes | |
| 9 | `/dashboard/admin-ph/team` | Equipo | Condicional (`requiresManageTeam`) |
| 10 | `/dashboard/admin-ph/settings` | Configuración | |
| 11 | `/dashboard/admin-ph/support` | Soporte | |

### Accesos rápidos (dashboard principal, `page.tsx`)

- Asambleas → `/dashboard/admin-ph/assemblies`
- Crear asamblea → `/dashboard/admin-ph/assemblies`
- Propietarios → `/dashboard/admin-ph/owners`
- Monitor votación → `/dashboard/admin-ph/monitor/votacion/[id]` o `/monitor/votacion`
- Actas → `/dashboard/admin-ph/acts`

---

## Recomendación para implementar el cambio

### 1. Agregar nuevo módulo "Proceso de Asamblea" (Wizard)

**Acción:** Insertar un nuevo ítem en el sidebar entre "Modificar suscripciones" y "Propietarios" (o justo después de "Asambleas", según preferencia de agrupación).

| Ubicación sugerida | Ruta | Label |
|--------------------|------|-------|
| Nuevo ítem sidebar | `/dashboard/admin-ph/proceso-asamblea` | **Proceso de Asamblea** |

**Implementación:**

1. Crear ruta: `src/app/dashboard/admin-ph/proceso-asamblea/page.tsx` (o `proceso-asamblea/[[...slug]]/page.tsx` si se usa parámetro dinámico para `assemblyId`).
2. Agregar ítem en `NAV_ITEMS` en `AdminPhShell.tsx`:

```ts
{ href: "/dashboard/admin-ph/proceso-asamblea", label: "Proceso de Asamblea", iconKey: "vote", match: (p) => p.startsWith("/dashboard/admin-ph/proceso-asamblea"), showWhenNoPh: false },
```

3. Usar `iconKey: "vote"` (existe en `NavIcons`) u otro existente (`calendar`, `document`). Si se desea un icono de flujo/pasos, añadir uno nuevo en `NavIcons`.

### 2. Estructura de la página Proceso de Asamblea

**Vista inicial (sin `assemblyId`):**

- Título: "Proceso de Asamblea" o "Ciclo de Asamblea".
- Subtítulo: "Gestiona el ciclo completo de una asamblea, paso a paso."
- Lista de **asambleas pendientes** del PH actual (status distinto de "Completada").
- Cada fila muestra: nombre asamblea, estado, **fase guardada** (ej. "Paso 3: Agendar"), botón "Reanudar" o "Continuar".
- Botón "Nueva asamblea" para iniciar wizard desde paso 1.

**Vista wizard (con `assemblyId`):**

- Stepper horizontal: 1. Residentes → 2. Crear → 3. Agendar → 4. Monitor → 5. Finalizar.
- Contenido del paso actual (reutilizar o adaptar componentes existentes).
- Botones "← Anterior" y "Siguiente" / "Guardar y continuar".
- Guardar `wizard_step` al avanzar (en el objeto asamblea o en BD).

### 3. Módulos a mantener sin cambios

| Módulo | Acción |
|--------|--------|
| Dashboard principal | Mantener. Sigue siendo el resumen/KPIs. |
| Tus propiedades | Mantener (o consolidar con Dashboard si se simplifica). |
| Modificar suscripciones | Mantener. |
| Propietarios | Mantener. Los datos se reutilizan en el paso 1 del wizard. |
| Asambleas | Mantener. Acceso directo para usuarios avanzados (lista, Kanban, crear). |
| Monitor Back Office | Mantener. El paso 4 del wizard puede incrustar o enlazar aquí. |
| Actas | Mantener. El paso 5 del wizard genera/redirige a actas. |
| Reportes, Equipo, Configuración, Soporte | Mantener. |

### 4. Accesos rápidos – opción a actualizar

**Recomendación:** Añadir un botón "Proceso de Asamblea" en accesos rápidos (junto a "Crear asamblea") para destacar el flujo guiado.

| Botón actual | Acción |
|--------------|--------|
| Crear asamblea | Mantener → lleva a Asambleas (o se puede hacer que lleve al wizard; definir con Contralor). |
| **Nuevo (opcional)** | "Proceso guiado" → `/dashboard/admin-ph/proceso-asamblea` |

O bien: cambiar "Crear asamblea" para que lleve a `/proceso-asamblea` (inicio wizard) en lugar de `/assemblies`. **Decisión:** Contralor/Henry.

### 5. Validación de suscripción por fase

Ver **Marketing/MARKETING_VALIDACION_SUSCRIPCION_POR_FASE_WIZARD.md**.

- **Crear PH:** validar límite organizaciones (demo: 1 PH).
- **Fase 1 (Residentes):** validar límite unidades (demo: 50).
- **Fase 2 (Crear asamblea):** validar crédito disponible (`GET /api/assembly-credits`). Sin crédito → bloquear creación. Demo: 1 crédito, expira 15 días.
- Consumo de crédito en `POST /api/assemblies` al crear.

### 6. Persistencia de fase

- En el modelo de asamblea (o en una tabla/extensión): campo `wizard_step` (1–5).
- Al guardar cada paso: actualizar `wizard_step`.
- En la lista de asambleas pendientes: incluir `wizard_step` y mostrar etiqueta legible ("Paso 1: Residentes", "Paso 3: Agendar", etc.).
- Ruta: `/dashboard/admin-ph/proceso-asamblea?assemblyId=xxx` o `/proceso-asamblea/[assemblyId]` → cargar wizard en el paso guardado.

### 7. Enlaces "Volver" en `getBackLinks` (AdminPhShell)

Añadir caso para `proceso-asamblea`:

```ts
if (pathname.startsWith(base + "/proceso-asamblea")) {
  if (pathname === base + "/proceso-asamblea") {
    return [{ href: base, label: "← Volver al Dashboard principal" }];
  }
  return [
    { href: base + "/proceso-asamblea", label: "← Volver a Proceso de Asamblea" },
    { href: base, label: "Dashboard PH" },
  ];
}
```

---

## Resumen de archivos a tocar

| Archivo | Cambio |
|---------|--------|
| `src/app/dashboard/admin-ph/AdminPhShell.tsx` | Añadir ítem "Proceso de Asamblea" en `NAV_ITEMS`; añadir caso en `getBackLinks`. |
| `src/app/dashboard/admin-ph/proceso-asamblea/page.tsx` | **Nuevo.** Vista inicial: lista asambleas pendientes con fase guardada; botón "Nueva asamblea". |
| `src/app/dashboard/admin-ph/proceso-asamblea/[assemblyId]/page.tsx` | **Nuevo (opcional).** Wizard con stepper y contenido por paso. O usar query `?assemblyId=` en la misma página. |
| `src/app/dashboard/admin-ph/page.tsx` | Opcional: añadir botón "Proceso guiado" en accesos rápidos. |
| `assembliesStore` / BD | Añadir `wizard_step` por asamblea; persistir al avanzar. |

---

## Orden sugerido de implementación

1. Añadir campo `wizard_step` al modelo asamblea (o localStorage temporal si BD no está lista).
2. Crear ruta `/proceso-asamblea` con vista inicial (lista asambleas pendientes).
3. Crear vista wizard (stepper + contenido por paso), reutilizando componentes de Propietarios, Asambleas, Monitor, Actas.
4. Añadir ítem en sidebar y en `getBackLinks`.
5. Conectar persistencia de `wizard_step` con BD cuando corresponda.
6. (Opcional) Añadir "Proceso guiado" en accesos rápidos.

---

*Documento generado por Marketing. Contralor asigna prioridad. Coder implementa según especificación del Arquitecto si existe discrepancia.*
