# Terminología unificada: Comunidad (PH / Plaza / Propiedad)

**Origen:** Henry (Product Owner) / Marketing  
**Fecha:** Febrero 2026  
**Objetivo:** Unificar términos en la app para que funcione tanto para asambleas de PH (Propiedad Horizontal residencial, Ley 284) como para asambleas de dueños de locales comerciales (plazas, centros comerciales).

---

## Término principal: "Comunidad"

Usar **"Comunidad"** como término genérico que abarca:

- **PH** (Propiedad Horizontal residencial) – Ley 284
- **Plaza** / centro comercial (dueños de locales comerciales)
- **Complejo de condominio** (residencial o mixto)

---

## Mapeo de términos en la UI

| Contexto | Antes (solo PH) | Después (unificado) |
|----------|-----------------|---------------------|
| Panel principal | Panel del PH / Dashboard PH | **Panel de la Comunidad** |
| Título con nombre | Urban Tower PH | **Urban Tower** (nombre) + tipo: PH / Plaza / Complejo |
| Lista de propiedades | Tus PHs / Propiedades horizontales | **Tus Comunidades** o **Tus Propiedades** |
| Crear | Crear PH / Crear propiedad | **Crear Comunidad** o **Crear Propiedad** |
| Proceso de asamblea | Proceso de Asamblea (PH) | **Proceso de Asamblea** (sin cambio; ya es neutro) |
| Asamblea | Asamblea de PH | **Asamblea de propietarios** |
| Admin | Admin PH | **Admin de Comunidad** o **Administrador** (según contexto) |
| Residentes / Propietarios | Propietarios (PH) | **Propietarios** (ya neutro; aplica a ambos) |
| Límites / Plan | Plan PH | **Plan de la Comunidad** / **Tu plan** |

---

## Tipo de comunidad (campo en BD / modelo)

Añadir o usar campo **`tipo_comunidad`** (o `organization_type`) con valores:

### Opciones del dropdown "Tipo de comunidad"

| Valor (BD) | Etiqueta en UI | Uso |
|------------|----------------|-----|
| `EDIFICIO_PH` | **Edificio (PH)** | Propiedad Horizontal residencial – edificio de apartamentos (Ley 284) |
| `PLAZA` | **Plaza comercial** | Locales comerciales – dueños de tiendas, oficinas en plaza |
| `COMPLEJO_CASAS` | **Complejo de casas cerrado** | Residencial – casas en conjunto cerrado |
| `CENTRO_COMERCIAL` | **Centro comercial** | Mall o centro comercial – dueños de locales |
| `OTRO` | **Otro** | Otros casos (mixto, industrial, etc.) |

**Orden sugerido en el dropdown:** Edificio (PH) → Plaza comercial → Complejo de casas cerrado → Centro comercial → Otro.

### Resumen valores BD

| Valor | Uso |
|-------|-----|
| `EDIFICIO_PH` | Propiedad Horizontal residencial (Ley 284) |
| `PLAZA` | Plaza comercial (locales pequeños) |
| `COMPLEJO_CASAS` | Complejo de casas cerrado (residencial) |
| `CENTRO_COMERCIAL` | Centro comercial / mall |
| `OTRO` | Otros |

En la UI, mostrar el tipo junto al nombre cuando sea útil, ej.:

- "Urban Tower (Edificio PH)"
- "Plaza Central (Plaza comercial)"
- "Los Andes (Complejo casas)"

---

## Textos sugeridos por contexto

### Dashboard / Panel

- **Título:** "Panel de la Comunidad" o "Dashboard principal"
- **Subtítulo con nombre:** "[Nombre] · [Tipo]" → "Urban Tower · PH"
- **Selector:** "Cambiar Comunidad" o "Cambiar Propiedad"

### Sidebar / Navegación

- "Tus comunidades" (lista de PHs/Plazas)
- "Modificar suscripciones" (sin cambio)
- "Proceso de Asamblea" (sin cambio)
- "Propietarios" (sin cambio)
- "Monitor Back Office" (sin cambio)
- "Actas" (sin cambio)

### Formularios

- "Crear comunidad" o "Crear propiedad"
- "Nombre de la comunidad" / "Nombre de la propiedad"
- "Tipo de comunidad": dropdown según tabla "Opciones del dropdown" arriba (Edificio PH, Plaza comercial, Complejo casas, Centro comercial, Otro)

### Mensajes y ayuda

- "Límites según tu plan: asambleas y lista de propietarios según suscripción."
- "Gestiona el ciclo completo: residentes, crear, agendar, monitor y acta."

---

## Regla para "Propiedad Horizontal"

- **Usar "Propiedad Horizontal"** o **"PH"** solo cuando el tipo sea `EDIFICIO_PH` (residencial, Ley 284).
- En textos genéricos (ej. "Panel de la Comunidad"), evitar asumir siempre PH.
- Si el tipo es `PLAZA`, `COMPLEJO_CASAS` o `CENTRO_COMERCIAL`, no mostrar "PH" en etiquetas genéricas.

---

## Resumen para implementación

| Acción | Detalle |
|--------|---------|
| Término principal | Usar "Comunidad" o "Propiedad" como genérico. |
| Campo tipo | `tipo_comunidad`: EDIFICIO_PH \| PLAZA \| COMPLEJO_CASAS \| CENTRO_COMERCIAL \| OTRO. |
| UI | Reemplazar "PH" genérico por "Comunidad" donde aplique; mantener "PH" solo cuando el tipo sea PH. |
| Migración | Los PH existentes se mapean a `tipo_comunidad = EDIFICIO_PH`. Nuevos registros permiten elegir tipo. |
| Backward compatibility | Si no existe `tipo_comunidad`, asumir `EDIFICIO_PH` por defecto. |

---

## Archivos a revisar (sugerencia)

- `src/app/dashboard/admin-ph/` – textos de cabecera, títulos, breadcrumbs
- `AdminPhShell.tsx` – labels del sidebar
- `page.tsx` (dashboard) – "Panel del PH", "PH actual", "Tus propiedades horizontales"
- Formularios de crear PH/propiedad – labels y placeholders
- Componentes que muestran "PH" de forma genérica

---

*Marketing documenta; Contralor prioriza; Coder implementa. Aplicar de forma gradual para no romper flujos existentes.*
