# Reporte Coder al Arquitecto – Soporte y sugerencia de plan (Feb 2026)

**Fecha:** 26 Febrero 2026  
**Destinatario:** Arquitecto  
**Origen:** Coder  
**Objetivo:** Dejar constancia de los últimos cambios que afectan al diseño del Dashboard Admin PH (sugerencia de plan al crear PH, chat de soporte como zona estratégica, página Soporte) para alineación arquitectónica y futuras extensiones.

---

## 1. Resumen ejecutivo

Se implementaron tres bloques funcionales solicitados:

1. **Sugerencia de plan al crear PH:** El dashboard detecta/brinda orientación sobre tipo de suscripción (pago único o plan mensual) cuando el administrador está creando una propiedad horizontal.
2. **Chat de soporte como zona estratégica:** Widget flotante visible en todo el dashboard para que el admin pueda atender tickets o pedir ayuda (acceso rápido a Soporte).
3. **Página Soporte mejorada:** Chat de ayuda, formulario de nuevo ticket y listado de tickets en `/dashboard/admin-ph/support`.

---

## 2. Cambios que impactan la arquitectura

### 2.1 Flujo «Crear propiedad horizontal»

- **Ubicación:** Dashboard principal Admin PH → Tus propiedades horizontales → formulario «Crear propiedad horizontal».
- **Nuevo comportamiento:** En función de **nombre del PH** y **cantidad de residentes** se muestra un bloque **«Sugerencia de plan»** con:
  - Enlace a planes de **pago único** (`/dashboard/admin-ph/subscription#pago-unico`).
  - Enlace a planes **mensuales** (`/dashboard/admin-ph/subscription#suscripcion`).
  - Si residentes > 250: aviso para revisar planes Multi-PH.
- **Fuente de verdad de planes:** `src/lib/types/pricing.ts` (`PLANS`). La lógica es solo de presentación (no se asigna plan automáticamente).
- **Implicación para arquitectura:** El flujo de alta de PH queda orientado a conversión/elección de tipo de suscripción; si en el futuro se integra backend de suscripciones, este punto es el lugar natural para enlazar «PH recién creado» con «selección/confirmación de plan».

### 2.2 Zona estratégica «Soporte» en el shell

- **Componente:** `AdminSupportChatWidget` en `src/components/AdminSupportChatWidget.tsx`.
- **Renderizado:** Dentro de `AdminPhShell` (`src/app/dashboard/admin-ph/AdminPhShell.tsx`), por tanto visible en **todas** las rutas bajo `/dashboard/admin-ph/*`.
- **Comportamiento:** Botón flotante (esquina inferior derecha) «Soporte» (💬). Al abrir: panel con enlaces «Ver mis tickets», «Nuevo ticket» y campo para escribir consulta que redirige a la página Soporte con el mensaje precargado en el chat.
- **Implicación para arquitectura:** La «zona estratégica» de soporte queda fijada en el shell del dashboard Admin PH. Cualquier evolución (API de tickets, integración con sistema externo de soporte, notificaciones de tickets) debe considerar este punto de entrada único para el admin.

### 2.3 Página Soporte (`/dashboard/admin-ph/support`)

- **Contenido actual:**
  - **Chat de ayuda:** Mensajes en `localStorage` (`assembly_admin_support_chat`), respuesta automática de soporte (mensaje fijo). Parámetro `?open=chat&message=...` precarga el mensaje (uso desde el widget).
  - **Nuevo ticket:** Formulario asunto + mensaje; crea entrada en lista (estado demo, sin backend).
  - **Mis tickets:** Lista estática/demo con id, asunto, estado, SLA y botón «Ver ticket».
- **Implicación para arquitectura:** La página está preparada como «centro de soporte» del admin. Persistencia real de tickets y chat deberá sustituir/ampliar `localStorage` y conectar con API/BD cuando se definan en arquitectura.

---

## 3. Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `src/app/dashboard/admin-ph/page.tsx` | Bloque «Sugerencia de plan» en formulario crear PH; uso de `PLANS` (pricing). |
| `src/components/AdminSupportChatWidget.tsx` | **Nuevo.** Widget flotante Soporte. |
| `src/app/dashboard/admin-ph/AdminPhShell.tsx` | Import y render de `AdminSupportChatWidget`. |
| `src/app/dashboard/admin-ph/support/page.tsx` | Chat de ayuda, nuevo ticket, lista de tickets (y lectura de `?open=chat&message=...`). |
| `src/lib/types/pricing.ts` | Sin cambios; referenciado para sugerencia de plan. |

---

## 4. Referencia cruzada Contralor

El detalle de estos mismos cambios está registrado en **`Contralor/INFORME_ULTIMOS_CAMBIOS_FEB2026.md`**, sección **11**. El Contralor tiene allí el resumen para validación y trazabilidad.

---

## 5. Sugerencias para el Arquitecto

- **Suscripción y alta de PH:** Tener en cuenta el bloque «Sugerencia de plan» como punto de enlace entre «crear PH» y «elegir/migrar plan» (pago único vs mensual / Multi-PH) en futuros flujos o documentos de arquitectura.
- **Soporte y tickets:** Definir si los tickets y el historial de chat de soporte serán solo front (demo) o si se prevé API/BD; el shell ya expone la zona estratégica y la página Soporte está lista para conectar backend cuando se decida.
- **Navegación:** El ítem «Soporte» ya existía en el sidebar del Admin PH; se añade el **acceso rápido flotante** sin cambiar la ruta ni la estructura de navegación.

---

*Reporte generado por Coder para conocimiento del Contralor y del Arquitecto.*
