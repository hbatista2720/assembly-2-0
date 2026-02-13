# Informe al Contralor – Últimos cambios (Febrero 2026)

**Fecha:** 26 Febrero 2026  
**Destinatario:** Contralor  
**Objetivo:** Resumen ejecutivo de los cambios recientes en el Dashboard Admin PH y flujos relacionados para control y trazabilidad.

---

## 1. Monitor y asambleas

| Cambio | Descripción |
|--------|-------------|
| **Monitor – 50 unidades en demo** | Con usuario demo, el Monitor muestra 50 unidades (Urban Tower PH). APIs `/api/monitor/summary` y `/api/monitor/units` aceptan `demo=1`; la página Monitor lo envía cuando el correo es demo@assembly2.com. |
| **Monitor – Filtro por tema** | En Monitor se cargan los temas de votación de la asamblea. Selector "Tema" en el encabezado; resultados (SI/NO/ABST) por tema. API acepta `topicId` y `topicTitle`. |
| **Asambleas sin crear** | En Lista y Kanban, cuando no hay asambleas: estado vacío con "Crear asamblea" y "Abrir Monitor demo". |
| **Ver asambleas – Navegación** | "Ver asambleas" usa `Link` (Next.js); existe `loading.tsx` en la ruta asambleas ("Cargando asambleas…") para evitar parpadeos. |

---

## 2. Zona de cuenta y perfil (dashboard principal)

- Strip demo: badge "Demo", "Tu demo expira en 12 días", barra de progreso, "Actualizar plan".
- Perfil: avatar (iniciales o emoji), email, rol "Admin PH" en demo, chips de plan (Plan Demo · 2 asambleas · 1 crédito · 50 propietarios).
- Acciones: Suscripción, Perfil, Cerrar sesión (unificado con iconos donde aplica).

---

## 3. Marketing – Ley 284 (Mejoras creación asambleas)

- **Documento:** `Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md` actualizado con **T6 – Acta inmediata y acta legal** (texto explícito para Coder).
- **Implementación Coder (Ley 284):**
  - **T1:** Validación plazos: Extraordinaria ≥3 días, Ordinaria ≥10 días (mensaje y `min` en fecha).
  - **T2:** Campo obligatorio "Orden del día (agenda)" en crear y editar asamblea.
  - **T3:** Checkbox "Advertencia segundo llamado" (Ley 284), por defecto marcado.
  - **T4:** Formato fecha (dd/mm/aaaa, 24h) indicado; sugerencias de fechas en el formulario de crear.
  - **T5:** Modo Presencial/Virtual/Mixta y enlace de reunión si aplica.
  - **T6:** Al mover asamblea a "Completada" se muestra modal "Acta inmediata" con mensaje: *"El acta legal formal se enviará en el plazo que indica la Ley 284 (máx. 10 días calendario desde la asamblea)."*
- **Store:** Tipo `Assembly` ampliado con `orderOfDay`, `secondCallWarning`, `mode`, `meetingLink`.

---

## 4. Unificación de botones y vistas

- **Mismo criterio en todas las vistas:** Orden: Ver detalles → Editar → Iniciar asamblea → Monitor → Eliminar. Mismas etiquetas (p. ej. "Iniciar asamblea" en Lista y Kanban).
- **Ver detalles / Editar:** En Lista y Kanban llevan a la página de detalle `/dashboard/admin-ph/assemblies/[id]` (ya no solo modal).
- **Página de detalle:** Formulario "Editar asamblea" con orden del día, modo, enlace, advertencia segundo llamado; tipo en pill (ORDINARIA/EXTRAORDINARIA); botón "Monitor" (antes "Abrir Monitor").
- **Dashboard principal:** Botón "Iniciar asamblea" quitado del panel principal (solo "Ver asambleas"). "Iniciar asamblea" sigue en Próxima Asamblea y en la página de asambleas (por asamblea).

---

## 5. Vista "Ver asamblea" y datos Ley 284

- Sección **"Datos de la convocatoria (Ley 284)"** en la página de detalle de asamblea con: Tipo, Título, Fecha y hora, Ubicación, Orden del día, Advertencia segundo llamado, Modo, Enlace reunión (si aplica).
- Texto orientado al usuario: *"Información oficial de la convocatoria según la normativa vigente."* (sin referencias internas a Marketing).

---

## 6. Demo – 2 asambleas de ejemplo

- **Seed demo** (`assembliesStore`): `DEMO_SEED_VERSION = 2`. Si la versión guardada es menor, se reemplazan las asambleas demo por **2 asambleas de ejemplo** con todos los campos Ley 284 (orden del día, advertencia segundo llamado, modo, enlace en la Extraordinaria).
- Las dos asambleas de ejemplo son: "Asamblea Ordinaria 2026" (Presencial) y "Asamblea Extraordinaria - Piscina" (Mixta, con enlace).

---

## 7. Pantalla "Iniciar asamblea" (live)

- **Eliminado:** Panel "Residentes con voto manual" y botones "Registrar voto". Los votos manuales se aplican solo en la pantalla **Monitor**.
- **Añadido:** Guía de fase ("Fase: Asamblea en vivo") y aviso: los votos se aplican en el Monitor; enlace destacado "Abrir Monitor (aplicar voto manual)".
- **Directorio de residentes (lista):** Tabla con Unidad, Tipo registro, Correo, Cuota mant., %, Titular principal, Titular secundario, Estatus unidad (Ocupada/Alquilada/Sin inquilino), Política. Filtro por estatus.
- **Tabla resumen:** Indicadores (Total unidades, Ocupadas, Alquiladas, Sin inquilino, Con Face ID, Manual, Pendiente, Cuota total). Estilo planilla simple.

---

## 8. Crear propiedad horizontal (dashboard principal)

- En **"Tus propiedades horizontales"** (cuando no hay PH seleccionado): botón **"+ Crear propiedad"** que abre formulario.
- **Campos:** Nombre del PH (obligatorio), Dirección, Cantidad de residentes/propietarios, Tipo de PH (Edificio / Complejo de casas cerrado / Otro).
- Las propiedades creadas se guardan en `localStorage` (`assembly_admin_ph_custom_properties`) y se listan con las existentes; icono según tipo (edificio/complejo).

---

## 9. Archivos principales tocados

- `src/app/dashboard/admin-ph/page.tsx` – Dashboard principal: zona cuenta, PH list, crear propiedad, botón Iniciar asamblea solo en Ver asambleas / Próxima Asamblea.
- `src/app/dashboard/admin-ph/assemblies/page.tsx` – Form crear asamblea (Ley 284), estado vacío, fechas sugeridas, Link Ver detalles/Editar, modal Acta inmediata (T6).
- `src/app/dashboard/admin-ph/assemblies/[id]/page.tsx` – Detalle asamblea: datos convocatoria Ley 284, editar con todos los campos.
- `src/app/dashboard/admin-ph/assembly/[id]/live/page.tsx` – Rediseño: guía de fase, directorio residentes, tabla indicadores, voto manual solo en Monitor.
- `src/lib/assembliesStore.ts` – Tipo Assembly ampliado, seed demo v2 con 2 asambleas completas, re-seed por versión.
- `src/lib/monitoringMock.ts` – `generateUnits` con `forceDemoUnits`; `buildSummary` con `topicTitle`/`topicId` para resultados por tema.
- `src/app/api/monitor/summary/route.ts` y `units/route.ts` – Parámetro `demo` y tema.
- `Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md` – T6 explícito y texto para usuario final en vista asamblea.

---

## 10. Sugerencia para el Contralor

- **Validación:** Revisar con usuario demo (demo@assembly2.com) el flujo: lista de PH → Crear propiedad → Asambleas (lista/Kanban) → Ver asamblea (datos Ley 284) → Iniciar asamblea (directorio + indicadores, sin registrar voto aquí) → Monitor (voto manual y filtro por tema).
- **Backup:** Si se autoriza, ejecutar commit y push según protocolo de backup (ESTATUS_AVANCE.md).

---

## 11. Últimos cambios – Sugerencia de plan al crear PH y Chat de soporte (Feb 2026)

**Destinatarios:** Contralor y Arquitecto. **Origen:** Coder.

### 11.1 Sugerencia de plan al crear propiedad horizontal

- **Dónde:** Dashboard Admin PH → Tus propiedades horizontales → formulario «Crear propiedad horizontal».
- **Comportamiento:** Cuando el administrador escribe el **nombre del PH** o la **cantidad de residentes/propietarios**, aparece un bloque **«Sugerencia de plan»** que orienta el tipo de suscripción:
  - **Pago único:** enlace a `/dashboard/admin-ph/subscription#pago-unico` (ideal para 1 o 2 asambleas al año, sin cuota mensual).
  - **Plan mensual:** enlace a `/dashboard/admin-ph/subscription#suscripcion` (varias asambleas, histórico ilimitado, soporte prioritario).
  - Si la cantidad de residentes es **> 250**, se muestra un aviso para revisar planes **Multi-PH** en Suscripción.
- **Lógica:** Se usa `PLANS` de `src/lib/types/pricing.ts`; se calcula `planSuggestion` (hasResidents, n, needsMultiPh) en función de `newPhForm.cantidadResidentes` para mostrar el bloque y los enlaces correctos.
- **Archivos:** `src/app/dashboard/admin-ph/page.tsx` (import `PLANS`, `useMemo` planSuggestion, bloque de sugerencia en el formulario de crear PH).

### 11.2 Chat de soporte como zona estratégica

- **Dónde:** Shell del Dashboard Admin PH (todas las vistas). Botón flotante **«Soporte»** (icono 💬) en la esquina inferior derecha.
- **Comportamiento:** Al hacer clic se abre un panel con:
  - Enlace **«Ver mis tickets»** → `/dashboard/admin-ph/support`.
  - Enlace **«Nuevo ticket»** → `/dashboard/admin-ph/support?open=new`.
  - Campo de texto «Escribe tu consulta» y botón **«Enviar e ir a Soporte»** que redirige a la página Soporte con `?open=chat&message=...` para precargar el mensaje en el chat.
- **Componente:** `src/components/AdminSupportChatWidget.tsx`. Renderizado en `src/app/dashboard/admin-ph/AdminPhShell.tsx` (zona estratégica visible en todo el dashboard).

### 11.3 Página Soporte mejorada

- **Ruta:** `/dashboard/admin-ph/support`.
- **Contenido:**
  - **Chat de ayuda:** Zona de mensajes (persistencia en `localStorage`, clave `assembly_admin_support_chat`). Respuesta automática de soporte al enviar mensaje. Si se llega con `?open=chat&message=...` (desde el widget), el mensaje se añade al chat.
  - **Nuevo ticket:** Formulario (asunto + mensaje) que crea un ticket de ejemplo en la lista (estado demo).
  - **Mis tickets:** Listado de tickets con id, asunto, estado, SLA y botón «Ver ticket».
- **Archivos:** `src/app/dashboard/admin-ph/support/page.tsx` (Suspense, SupportContent con chat, formulario nuevo ticket, lista de tickets).

### 11.4 Archivos tocados en esta entrega

- `src/app/dashboard/admin-ph/page.tsx` – Sugerencia de plan en formulario crear PH.
- `src/components/AdminSupportChatWidget.tsx` – Widget flotante Soporte (nuevo).
- `src/app/dashboard/admin-ph/AdminPhShell.tsx` – Import y render de `AdminSupportChatWidget`.
- `src/app/dashboard/admin-ph/support/page.tsx` – Chat de ayuda, nuevo ticket, lista tickets.
- `src/lib/types/pricing.ts` – Referenciado (PLANS) para la sugerencia de plan.

### 11.5 Sugerencia para Contralor y Arquitecto

- **Contralor:** Incluir en la validación: flujo Crear propiedad → ver bloque «Sugerencia de plan»; botón flotante Soporte → panel → Enviar mensaje → redirección a Soporte con mensaje en chat; página Soporte: chat, nuevo ticket, lista tickets.
- **Arquitecto:** Tener en cuenta la zona estratégica «Soporte» en el shell y la orientación a suscripción (pago único / mensual) en el flujo de alta de PH para futuras extensiones (p. ej. API de tickets, integración con backend de soporte).

---

## 12. Listado Propietarios/Residentes – Sincronización, reseteo demo e instrucciones BD (Feb 2026)

**Zona:** Dashboard Admin PH → Propietarios/Residentes. **Origen:** Coder (Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md y peticiones de usuario).

### 12.1 Columna «Hab. asamblea (voto)»

- **Significado:** La columna indica si el residente está **habilitado para votar** en la asamblea. Solo un titular por unidad puede estar en «Sí»; «No» = no vota en esta asamblea.
- **Encabezado:** Renombrado a **«Hab. asamblea (voto)»** con tooltip: *"Habilitado para votar en la asamblea. Solo un titular por unidad en Sí; No = no vota."*
- **Texto de ayuda** bajo los filtros se mantiene para reforzar la regla y la sincronización con el Monitor de votación.

### 12.2 Sincronización Estatus (Al Día / En Mora) → Hab. asamblea

- **Regla de negocio:** En mora no vota (solo asistencia); Al día puede votar. Al cambiar un residente a **En Mora**, el campo **Hab. asamblea (voto)** debe pasar automáticamente a **No**.
- **Implementación:**
  - **Store (`demoResidentsStore.ts`):** `updateDemoResident` fuerza `habilitado_para_asamblea = false` cuando `payment_status === "mora"`. En `fillSimulatedFields`, si `payment_status === "mora"` se devuelve siempre `habilitado_para_asamblea: false` para que la UI no muestre valores desactualizados.
  - **UI (`owners/page.tsx`):** Al cambiar el dropdown de Estatus a «En Mora» se llama a `updateDemoResident`, `setDemoResidentHabilitadoParaAsamblea(..., false)` y se refresca la lista con `setResidents(() => [...getDemoResidents()])` para que la columna «Hab. asamblea (voto)» se actualice de inmediato.
- **Monitor:** El Monitor de votación (back office) usa el mismo `payment_status` desde el store demo (`getDemoResidents`) para determinar quién puede votar (Al Día) y quién solo asistencia (Mora).

### 12.3 Textos simplificados en la UI

- **Listado:** Opciones del dropdown de Estatus solo **«Al día»** y **«En Mora»** (sin «puede votar» ni «solo asistencia»).
- **Modal Editar residente:** Select Estatus solo **«Al Día»** y **«En Mora»**; texto de ayuda debajo: *"Ley 284."* (en mora no vota, solo asistencia).
- **Acciones:** Botón de edición rápida con icono de lápiz (tooltip «Edición rápida»); Plantilla con icono de documento.

### 12.4 Reseteo del listado demo

- **Función:** `resetDemoResidents()` en `demoResidentsStore.ts`: borra la clave `assembly_demo_residents` del `localStorage`. La próxima lectura (`getDemoResidents`) carga los 50 residentes por defecto (seed).
- **UI:** Botón **«Restablecer listado demo»** en la barra de herramientas del listado (solo en modo demo). Al pulsar se muestra confirmación: *"¿Restablecer el listado demo? Se borrarán sus cambios y se cargarán de nuevo los 50 residentes por defecto."* Si el usuario acepta, se ejecuta el reseteo y se refresca la tabla.
- **No requiere BD:** Los datos del listado demo viven solo en el navegador; no hay script SQL ni migración asociada al reseteo.

### 12.5 Instrucciones para agente de BD

- **Documento creado:** `Database_DBA/INSTRUCCIONES_LISTADO_RESIDENTES_BD.md`.
- **Contenido resumido:**
  - Reseteo demo: no hace falta ninguna instrucción para la BD; el usuario usa el botón en la UI.
  - Estado actual: la API GET `/api/admin-ph/residents` solo devuelve `id`, `email`, `face_id_enabled` desde `users`; el listado «rico» (nombre, Nº finca, ID identidad, Al Día/Mora, Hab. asamblea, etc.) existe solo en modo demo (localStorage).
  - Si se quiere que la BD coincida con el listado: se indica la migración necesaria (columnas en `users` o tabla asociada: `nombre`, `numero_finca`, `cedula_identidad`, `unit`, `cuota_pct`, `payment_status`, `habilitado_para_asamblea`, `titular_orden`) y que el GET/PATCH de residentes debe exponerlas; opcionalmente seeds para la org demo.

### 12.6 Corrección de build

- **Problema:** Declaración duplicada de `resetDemoResidents` en `src/lib/demoResidentsStore.ts` provocaba error de compilación: *"Identifier 'resetDemoResidents' has already been declared"*.
- **Solución:** Se dejó una única función `resetDemoResidents` que solo elimina la clave de `localStorage`; la JSDoc unifica el texto: *"Restablece el listado demo: borra los datos guardados en localStorage. La próxima lectura (getDemoResidents) cargará los 50 residentes por defecto."*

### 12.7 Archivos tocados en esta entrega

- `src/lib/demoResidentsStore.ts` – `resetDemoResidents`, regla mora → `habilitado_para_asamblea: false` en `updateDemoResident`, `fillSimulatedFields` con lógica defensiva para mora.
- `src/app/dashboard/admin-ph/owners/page.tsx` – Columna «Hab. asamblea (voto)», dropdown Estatus solo «Al día»/«En Mora», refresco de lista al cambiar estatus, botón «Restablecer listado demo» con confirmación, iconos de edición/plantilla.
- `src/app/dashboard/admin-ph/monitor/[assemblyId]/page.tsx` – Merge de `payment_status` desde `getDemoResidents()` en demo para sincronizar con el listado.
- `Database_DBA/INSTRUCCIONES_LISTADO_RESIDENTES_BD.md` – Instrucciones para el agente de BD (reseteo, estado actual, migración opcional).

### 12.8 Sugerencia para el Contralor

- **Validación:** Con usuario demo, en Propietarios/Residentes: (1) Cambiar un residente a «En Mora» y comprobar que «Hab. asamblea (voto)» pasa a «No» al instante. (2) Pulsar «Restablecer listado demo», aceptar el confirm, y comprobar que la tabla vuelve a 50 residentes por defecto. (3) Revisar que el Monitor de votación refleja Al Día/Mora según el listado.

---

## 13. Backup autorizado – Febrero 2026

**Autorización:** Henry (Product Owner) autoriza backup.  
**Ejecución:** Contralor ejecuta commit. Push a GitHub lo ejecuta Henry en su terminal.

**Contenido de este backup (resumen):**
- Informe Contralor: **Contralor/INFORME_ULTIMOS_CAMBIOS_FEB2026.md** (este documento).
- Validación respuesta Marketing (Ley 284, T6): **Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md** y bloque "Para CODER" en ESTATUS_AVANCE con T6.
- docs/RESUMEN_DASHBOARD_ADMIN_PH.md: estado validación (reporte Coder, espera Marketing, instrucción Arquitecto).
- ESTATUS_AVANCE: bloque "Para ARQUITECTO" (validar proceso dashboard; espera respuesta Marketing primero), historial con validación Marketing T6 y reporte Coder + Arquitecto.

**Formato commit:** Backup Feb 2026: INFORME_ULTIMOS_CAMBIOS_FEB2026 + validación Marketing Ley 284 (T6) + RESUMEN_DASHBOARD_ADMIN_PH + ESTATUS_AVANCE.

**Tras el commit:** Henry ejecuta `git push origin main` para completar el backup.

---

*Informe generado a partir de los cambios aplicados en el Dashboard Admin PH y documentos de Marketing/Contralor.*
