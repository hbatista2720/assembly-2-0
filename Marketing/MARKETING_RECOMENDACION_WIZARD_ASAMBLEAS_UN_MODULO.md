# Recomendación Marketing: Proceso de Asambleas en un Solo Módulo (Wizard tipo Factura)

**Origen:** Henry (Product Owner) / Marketing  
**Fecha:** Febrero 2026  
**Contexto:** Análisis de la imagen de creación de factura (stepper multi-paso) vs Dashboard Admin PH actual. Propuesta: adaptar esa experiencia al proceso de asambleas y que todo se vea en un solo módulo.

---

## Análisis: Imagen Factura vs Dashboard Actual

### Imagen de creación de factura (referencia)

| Elemento | Descripción |
|----------|-------------|
| **Stepper horizontal** | 5 pasos: 1. Cliente → 2. Detalles → 3. Items → 4. Notas → 5. Revisar. Cada paso con número y breve descripción. |
| **Progreso visible** | Paso activo resaltado (azul); pasos inactivos en gris. El usuario sabe dónde está y cuánto falta. |
| **Un solo módulo** | Todo el flujo en una misma pantalla: título "Nueva Factura", subtítulo explicativo y contenido del paso actual. |
| **Información modular** | Secciones bien separadas (Emisor vs Receptor); campos requeridos marcados con `*`. |
| **Experiencia guiada** | El usuario avanza paso a paso sin perderse entre rutas ni menús. |

### Dashboard Admin PH actual

| Aspecto | Situación actual |
|---------|------------------|
| **Navegación** | Sidebar con muchos ítems (Dashboard, Propietarios, Asambleas, Monitor, Actas, etc.). Flujo disperso. |
| **Accesos rápidos** | Botones: Asambleas, Crear asamblea, Propietarios, Monitor votación, Actas. Cada uno lleva a una ruta distinta. |
| **Proceso de asamblea** | No hay un flujo lineal guiado. El usuario debe saber ir a: Propietarios → Asambleas → Crear → Monitor → Actas. |
| **KPIs y Próxima Asamblea** | Útil como resumen, pero no guía el proceso paso a paso. |
| **Problema** | El administrador PH nuevo no tiene una "ruta clara" de principio a fin. Todo está fragmentado. |

---

## Proceso de asambleas (Henry)

Henry definió estos pasos:

1. **Registro de residentes**
2. **Crear asambleas**
3. **Agendar asambleas**
4. **Celebrar asambleas**
5. **Vista monitor back office**
6. **Finalización**
7. **Crear acta**

---

## Recomendación Marketing: Wizard en un solo módulo

### Idea principal

Crear un **módulo único "Proceso de Asamblea"** (o "Ciclo de Asamblea") con un **stepper horizontal** como el de la factura, que guíe al administrador PH de principio a fin. Todo visible en una misma vista, sin dispersarse por el sidebar.

### Propuesta de pasos del stepper (consolidados)

| # | Paso | Descripción breve | Contenido sugerido |
|---|------|-------------------|--------------------|
| 1 | **Residentes** | "Registro de propietarios y residentes" | Lista/alta de residentes, estado (al día/mora), Face ID. Puede enlazar a la vista actual de Propietarios o ser una vista simplificada integrada. |
| 2 | **Crear asamblea** | "Crear y configurar asamblea" | Formulario: tipo (Ordinaria/Extraordinaria), título, orden del día, temas, mayorías (Ley 284). |
| 3 | **Agendar** | "Fecha, hora y lugar" | Fecha, hora, lugar, modo (Presencial/Virtual/Mixta), link de reunión si aplica. Advertencia segundo llamado. |
| 4 | **Monitor** | "Celebrar y monitor en vivo" | Vista del Monitor Back Office (quórum, votación por tema). Botón "Iniciar asamblea" o acceso directo al Monitor. |
| 5 | **Finalizar** | "Cerrar asamblea y acta" | Confirmar cierre, generar acta (resumen resultados + unidades y voto). Opción "Crear acta" con vista previa. |

**Nota:** Se consolidaron "Celebrar asambleas" + "Vista monitor back office" en un solo paso (Monitor) y "Finalización" + "Crear acta" en el paso 5 (Finalizar), para no tener demasiados pasos y mantener coherencia con el modelo de factura (5 pasos).

**Alternativa 6 pasos** (si se prefiere más granularidad):

1. Residentes  
2. Crear asamblea (datos + temas)  
3. Agendar (fecha, lugar, modo)  
4. Celebrar (iniciar, quórum)  
5. Monitor (votación en vivo)  
6. Finalizar y acta  

### Estructura visual sugerida (como la factura)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Proceso de Asamblea                                                        │
│  Gestiona el ciclo completo de una asamblea, paso a paso                    │
│                                                                             │
│  ● 1. Residentes ──○ 2. Crear ──○ 3. Agendar ──○ 4. Monitor ──○ 5. Finalizar│
│     Registro         Configurar    Fecha y lugar   En vivo       Acta       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  [ Contenido del paso actual: formulario, lista, Monitor embed, etc.] │  │
│  │                                                                       │  │
│  │                                              [ ← Anterior ] [ Siguiente / Guardar ]  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Paso activo: círculo relleno + texto en color primario (p. ej. púrpura).
- Pasos inactivos: círculo vacío + texto gris.
- Botones de navegación: "Anterior" y "Siguiente" (o "Guardar y continuar") en la parte inferior del contenido.
- Opcional: permitir clic en pasos ya completados para volver atrás y editar.

### Dónde ubicar el módulo

| Opción | Descripción |
|--------|-------------|
| **A** | Nueva ruta `/dashboard/admin-ph/proceso-asamblea` (o `ciclo-asamblea`). Un solo ítem en sidebar: "Proceso de Asamblea" o "Ciclo de Asamblea". |
| **B** | Reemplazar o complementar "Crear asamblea" actual: al hacer clic en "Crear asamblea" se abre el wizard en vez del formulario actual. |
| **C** | Vista principal del dashboard: al entrar al PH, el contenido principal es el stepper (si hay asamblea en curso) o el resumen/KPIs con CTA "Iniciar proceso de asamblea". |

**Recomendación Marketing:** Opción **A** como módulo independiente, manteniendo el dashboard actual como "resumen" y los accesos rápidos. El wizard es para quien quiere guía paso a paso. Opción **B** también viable si se prioriza simplificar la creación.

### Ventajas esperadas

- **Claridad:** El admin PH ve todo el ciclo en un solo lugar.
- **Reducción de errores:** No se salta pasos (ej. crear asamblea sin residentes).
- **Onboarding:** Usuario nuevo sigue el flujo sin perderse.
- **Coherencia:** Experiencia similar a sistemas de facturación u otros wizards que el usuario ya conoce.
- **Responsive:** El stepper puede colapsar en móvil (solo número de paso + título).

### Persistencia de la fase del wizard (Henry)

**Requisito:** La fase donde quedó el usuario debe guardarse. Al volver, debe poder retomar exactamente donde estaba.

**Flujo esperado:**

1. Usuario selecciona **PH** → ve lista de **asambleas pendientes** (o en curso).
2. Para cada asamblea, se muestra la **fase donde quedó** (ej. "Paso 3: Agendar", "Quedó en: Monitor").
3. Usuario hace clic en la asamblea → se abre el wizard **directamente en esa fase**, con los datos ya guardados.

**Ejemplo visual en lista de asambleas pendientes:**

| Asamblea | Estado | Fase guardada | Acción |
|----------|--------|---------------|--------|
| Ordinaria 2026 | En curso | Paso 4: Monitor | Reanudar |
| Extraordinaria Presupuesto | Pendiente | Paso 2: Crear | Continuar |

**Implementación sugerida (para Coder/Arquitecto):**

- Guardar `wizard_step` (1–5) y datos del paso por cada asamblea (en BD o en el objeto asamblea).
- Al listar asambleas pendientes del PH: incluir el campo `wizard_step` y una etiqueta legible ("Paso 1: Residentes", "Paso 3: Agendar", etc.).
- Ruta con parámetro: `/dashboard/admin-ph/proceso-asamblea?assemblyId=xxx` o `/proceso-asamblea/xxx` → carga el wizard en el paso guardado.

### Consideraciones para Contralor / Arquitecto / Coder

1. **Estado del wizard:** **Sí, guardar el progreso.** Ver sección "Persistencia de la fase del wizard" arriba. Por PH y por asamblea.
2. **Contexto de asamblea:** El wizard gestiona una asamblea concreta (nueva o existente). Al seleccionar PH, se listan asambleas pendientes y se muestra la fase donde quedó cada una.
3. **Flujo alternativo:** Usuarios avanzados podrán seguir usando Asambleas, Propietarios, Monitor por separado; el wizard es para el flujo guiado.
4. **Ley 284:** En los pasos 2 y 3, incluir validaciones y textos de la Ley 284 (plazos, orden del día, segundo llamado, etc.) según documentos existentes.

---

## Resumen para el Coder

| Elemento | Acción sugerida |
|----------|------------------|
| **Componente** | Crear página o vista con stepper horizontal (5 pasos: Residentes, Crear, Agendar, Monitor, Finalizar). |
| **Ruta** | `/dashboard/admin-ph/proceso-asamblea` o integrar en flujo "Crear asamblea". |
| **Contenido por paso** | Reutilizar o adaptar componentes existentes (lista residentes, formulario asamblea, Monitor, acta). |
| **Navegación** | Botones Anterior / Siguiente; opcional: clic en pasos completados para editar. |
| **Estilo** | Seguir el diseño de la factura: paso activo resaltado, inactivos en gris, contenido modular. |
| **Persistencia de fase** | Guardar `wizard_step` (1–5) por asamblea. Lista de asambleas pendientes del PH debe mostrar "Fase donde quedó" (ej. "Paso 3: Agendar"). Al abrir asamblea, cargar wizard en ese paso. |

---

## Prioridad sugerida

**Media-Alta** – Mejora significativa de UX y percepción de producto. Requiere diseño de flujo (Arquitecto) y desarrollo (Coder). Marketing recomienda priorizarlo tras las correcciones críticas del dashboard (botones, lista PHs, plan visible).

---

*Marketing documenta y recomienda; Contralor prioriza; Arquitecto diseña el flujo; Coder implementa.*
