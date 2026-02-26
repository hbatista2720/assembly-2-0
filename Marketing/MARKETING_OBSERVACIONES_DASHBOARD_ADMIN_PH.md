# 📋 Observaciones Dashboard Admin PH – Parte visual y reglas

**Fecha:** Febrero 2026  
**Responsable:** Marketing B2B  
**Destinatario:** Contralor (para definir reglas y asignar al Coder)  
**Referencia:** Validación Henry – capturas dashboard Admin PH

---

## 🚨 OBSERVACIONES REPORTADAS

### 1. Suscripción confusa
- Al seleccionar "Suscripción" no queda claro el **plan actual** del admin PH.
- Se muestran los planes disponibles pero no hay bloque destacado "Tu plan actual".
- La opción para modificar suscripción no es evidente.

### 2. Opción para regresar al dashboard PH no visible
- En subpáginas (Planes, Configuración, etc.) no hay botón claro "Volver al Dashboard".
- El usuario depende del sidebar; si está colapsado o perdido, no sabe cómo volver.

### 3. Plan actual sin claridad
- El plan aparece en el área de perfil pero compite con banners (Modo demo, Upgrade sugerido).
- No hay un bloque fijo que indique: Plan actual + uso (asambleas, edificios).

### 4. Navegación del dashboard principal no es simple
- Muchos ítems en el sidebar (Dashboard, Propietarios, Asambleas, Votaciones, Monitor, Actas, Reportes, Equipo, Configuración, Soporte).
- Puede abrumar al usuario nuevo.

### 5. Falta lista de PHs
- Se muestra solo "Urban Tower PH" como PH activo.
- No hay vista de **lista de PHs** que administra el usuario.
- Al hacer clic en un PH debería mostrarse todo lo relacionado a ese PH.

### 6. Barra lateral siempre visible
- La sidebar ocupa espacio constante.
- **Henry:** La barra debe ocultarse para tener más espacio. Al ocultarse, liberar espacio en pantalla.

### 6b. Iconos de la barra lateral incorrectos
- Los iconos de la barra lateral están mal (como indica la imagen de referencia).
- Corregir iconos para que sean coherentes con la función de cada ítem.

### 7. Flujo de entrada no es simple
- **Henry:** Dashboard más simple al entrar. Debe mostrar solo:
  1. **Icono de Dashboard** – acceso rápido al panel principal.
  2. **Icono de Suscripción** – acceso a planes y modificar suscripción.
  3. **Lista de PHs** – los PHs que administra el usuario.
- Sin elementos extra que abrumen. En el perfil: plan actual visible y opción para modificar suscripción.

---

## 📐 REGLAS DEFINIDAS (Para Contralor y Coder)

| # | Regla | Descripción |
|---|-------|-------------|
| **R1** | **Plan actual visible** | Bloque o card fijo que muestre: "Plan actual: [nombre] · X/Y asambleas · Z edificios". Siempre visible en área de perfil o cabecera. |
| **R2** | **Modificar suscripción accesible** | Botón o enlace "Modificar suscripción" visible en perfil o bloque de plan actual. Lleva a página de planes con plan actual destacado. |
| **R3** | **Botón Volver al Dashboard** | En cada subpágina (Suscripción, Configuración, Asambleas, etc.): botón "← Volver al Dashboard" en la parte superior. |
| **R4** | **Lista de PHs al entrar** | Primera vista tras login Admin PH: lista de PHs que administra. Al hacer clic en un PH → dashboard de ese PH con todo lo relacionado. |
| **R4b** | **Dashboard simple al entrar** | Vista principal: solo icono Dashboard, icono Suscripción y lista de PHs. Sin más elementos que abrumen. |
| **R5** | **Selector de PH** | Si el admin tiene varios PHs, selector en cabecera o sidebar para cambiar de PH sin volver a la lista. |
| **R6** | **Sidebar colapsable** | La barra lateral se oculta para tener más espacio. Al pasar el mouse sobre el borde izquierdo → se expande. Por defecto puede estar oculta o solo con iconos mínimos. |
| **R6b** | **Iconos de la barra lateral correctos** | Los iconos de la barra lateral deben corresponder a cada ítem (Dashboard, Suscripción, PHs). Corregir iconos mal asignados. |
| **R7** | **Menú simplificado o agrupado** | Agrupar ítems del menú por contexto (Operación, Gestión, Resultados, Ajustes) o colapsar por categorías para reducir ruido visual. |
| **R8** | **Página Suscripción clara** | En "Planes y suscripciones": bloque "Tu plan actual" arriba con nombre, uso y botón "Modificar"; debajo, planes disponibles. |

---

## ✅ PRIORIDADES SUGERIDAS

| Prioridad | Regla | Esfuerzo estimado |
|-----------|-------|-------------------|
| **Alta** | R1, R2, R3 – Plan actual, Modificar suscripción, Volver al Dashboard | Medio |
| **Alta** | R4 – Lista de PHs al entrar | Medio-Alto |
| **Alta** | R4b – Dashboard simple (icono Dashboard, icono Suscripción, lista PHs) | Medio |
| **Alta** | R6 – Sidebar ocultable para más espacio | Medio |
| **Alta** | R6b – Iconos de la barra lateral correctos | Bajo |
| **Media** | R8 – Página Suscripción clara | Bajo |
| **Media** | R5 – Selector de PH | Medio |
| **Baja** | R7 – Menú agrupado | Bajo-Medio |

---

## 📊 Vista gráfica – Casilla Unidades (Monitor de votación)

**Contexto:** Pantalla Monitor (Vista Unidades) – grid de unidades A1–A50 con colores e iconos (Presente+Votó, Presente+No votó, Ausente, En mora, Votó SI, Votó NO, Abstención, Voto manual).

### Comentarios Henry / Marketing

1. **Leyenda incompleta**
   - El icono de **candado (padlock)** aparece en varias casillas pero no está explicado en la leyenda.
   - Definir qué significa el candado (unidad bloqueada, no puede votar, en mora, etc.) y añadirlo a la leyenda.

2. **Iconos combinados poco claros**
   - La mezcla de iconos (✓ + voto manual, X + voto manual, candado + voto manual) puede resultar confusa.
   - Definir reglas de combinación o simplificar.
   - Ej.: si una casilla muestra verde + ✓ + icono voto manual, ¿se considera "Presente + Votó SI (manual)"?

3. **Abstención vs leyenda**
   - En la leyenda, Abstención es un círculo gris con punto blanco.
   - En las casillas, unidades con abstención aparecen con fondo **verde** y punto blanco.
   - Aclarar en la leyenda: "Presente + Votó (Abstención)" para evitar dudas.

4. **Redundancia candado + En mora**
   - Si "En mora" (fondo gris oscuro) siempre lleva candado, valorar si el candado aporta o es redundante.
   - En caso de redundancia, mantener solo el color o solo el candado para simplificar.

5. **Interactividad**
   - El tooltip (ej. "A31 - Propietario A31") está bien.
   - Evaluar si el clic en una casilla abre un modal con más datos o acciones (modificar voto, historial, etc.).

6. **Vista Resumen vs Vista Unidades**
   - Verificar que las vistas Compacto y Normal reduzcan bien el ruido visual.
   - Asegurar que el cambio entre tamaños sea fluido y no se pierdan indicadores importantes.

### Reglas sugeridas (para Contralor/Coder)

| #  | Regla                               | Descripción                                                                 |
|----|-------------------------------------|-----------------------------------------------------------------------------|
| R9 | Leyenda completa                    | Incluir todos los iconos usados (incl. candado) y su significado.           |
| R10| Reglas de iconos combinados         | Documentar o simplificar cómo se combinan voto manual, SI/NO y abstención.  |
| R11| Clic en casilla → modal (opcional)  | Considerar modal con detalle y acciones al hacer clic en una unidad.        |

---

## 🎨 Voto por tema y chatbot – Lógica de colores y correcciones (Henry)

**Contexto:** Dashboard Admin PH – Monitor de votación. Dos vistas:
- **Vista Resumen:** tarjetas con Total, Presentes, Votaron, En mora, Face ID; resumen por estado y voto (Presente+Votó, Presente+No votó, Ausente, En mora, Votó SI/NO, Abstención, Voto manual); barras de porcentaje por tema (ej. Aprobación presupuesto 2026).
- **Vista Tablero:** grid de casillas por unidad (1–50), colores e iconos según estado y voto.

**Pantalla de referencia:** "Voto por tema y chatbot" – tema "Aprobación de presupuesto 2026". Incluye leyenda, grid de unidades, resumen por estado y voto, porcentajes.

### Entendimiento de la lógica de colores

| Color fondo | Significado | Iconos dentro |
|-------------|-------------|---------------|
| **Verde** | Presente + Votó | ✓ (SI), X (NO), círculo (Abstención), mano (Voto manual) |
| **Naranja/Amarillo** | Presente + No votó | Sin voto registrado; clic para voto manual |
| **Gris claro** | Ausente | No debería mostrar iconos de voto |
| **Gris oscuro** | En mora | No debería mostrar iconos de voto (Ley 284: en mora solo voz, no voto) |

### Inconsistencias detectadas (para que el Coder corrija)

| # | Problema | Recomendación |
|---|----------|---------------|
| 1 | **Grid y resumen no coinciden:** "Presente + Votó" = 25 pero en el grid hay menos casillas verdes. "Presente + No votó" = 16 pero hay más casillas naranjas. | Sincronizar datos: el grid debe reflejar exactamente los conteos del resumen. Una sola fuente de verdad. |
| 2 | **Ausente vs En mora mismo color:** Ambos usan gris oscuro. No se distingue quién está ausente de quién está en mora. | Usar **colores distintos**: ej. gris claro para Ausente, otro tono (o borde/icono) para En mora. |
| 3 | **Casilla naranja con icono de voto:** Si la unidad tiene Abstención o Voto manual, ya votó → debe ser **verde**, no naranja. Naranja = presente y **aún no ha votado**. | Regla: "Presente + No votó" = solo unidades presentes **sin** ningún voto (SI, NO, Abstención, Manual). Si tiene cualquier voto → verde. |
| 4 | **Casilla gris (Ausente/En mora) con icono de voto:** Unidades ausentes o en mora no deben mostrar ✓, X o abstención (Ley 284: en mora no vota). Si hay voto por representación, debe quedar explícito (ej. "Votó por poder"). | No mostrar iconos de voto en casillas Ausente/En mora, o etiquetar claramente "Voto por representación" si aplica. |
| 5 | **Cálculo "Presente + No votó":** Presentes (43) − Presente+Votó (25) = 18. En pantalla aparece 16. | Revisar fórmula: debe ser siempre Presentes − Votaron. |
| 6 | **Porcentajes de aprobación (52%, 10%, 38%) vs conteos (11 SI, 8 NO, 6 ABST):** 11/25 = 44%, 8/25 = 32%, 6/25 = 24%. No cuadran con 52%, 10%, 38%. | Definir **denominador claro**: ¿% sobre total unidades (50), sobre presentes (43) o sobre votaron (25)? Que los % y los números (SI, NO, ABST) sean coherentes. Añadir etiqueta: "X% sobre [presentes/votaron/total]". |
| 7 | **Voto manual:** No está claro si los 14 "Voto manual" están incluidos en Votó SI / NO / Abstención o son aparte. | Definir: voto manual es un **método** (SI, NO o ABST). Debe sumar a los totales SI, NO, ABST. No un cuarto tipo de voto. |
| 8 | **Tarjeta "En mora" en resumen:** Arriba tiene icono amarillo de advertencia; en el resumen tiene borde azul/gris. | Unificar: usar **amarillo/ámbar** para "En mora" en todo el flujo (icono y tarjeta). |
| 9 | **Leyenda:** Falta aclarar que los iconos (✓, X, círculo, mano) aparecen **solo en casillas verdes** (Presente + Votó). En naranja solo "Clic para voto manual" si aplica. | Ajustar leyenda: "En casillas verdes, el icono indica cómo votó (SI, NO, Abstención, Manual)." |
| 10 | **Tooltip / identificación:** Al pasar el mouse, mostrar más que "39 - Residente 39": nombre, unidad (ej. Apt 302), si es posible. | Incluir en tooltip: nombre, unidad o número de finca para que el Admin PH identifique rápido. |

### Ajustes visuales (Henry – revisión vista tablero)

| # | Observación | Recomendación para el Coder |
|---|-------------|-----------------------------|
| 11 | **Votó NO debería ser rojo (más visible en el tablero)** | En el **mismo tablero (grid)** el voto NO debe ser más visible. Opciones para el Coder: **(A)** Icono X en **rojo bien visible** (no blanco/gris); **(B)** dar a la **casilla** que votó NO un color distinto — p. ej. **tinte rojo** en la casilla o **borde rojo** en la celda, para que se distinga de un vistazo de las verdes (SI) y neutras (abstención). Puede aplicarse A, B o ambos. Además, la tarjeta/resumen "Votó NO" con fondo o borde rojo más visible. |
| 12 | **Iconos ✓, X, ○ no se aprecian bien** | Los iconos de gancho (✓), X (NO) y círculo (○ Abstención) dentro de las casillas son muy pequeños y poco visibles. **Aumentar tamaño** de los iconos en el grid, usar **colores** según leyenda (✓ verde, X rojo, ○ gris/neutro) y evitar que queden tapados por otros símbolos (ej. "D", mano). Que se distingan bien de un vistazo. |
| 13 | **Casilla: línea/borde de color + fondo blanco (en lugar de relleno sólido)** | En lugar de pintar toda la casilla de un color (verde, rojo, amarillo, gris, naranja), usar **fondo blanco** (o claro) en la casilla y el **estado indicado por una línea/borde** del color correspondiente (verde = Presente+Votó SI/Abstención, rojo = Votó NO, amarillo = Presente+No votó, gris = Ausente, naranja = En mora). Así los iconos ✓, X, ○ se leen mejor sobre blanco y el tablero se ve más limpio. El borde debe ser suficientemente grueso (ej. 2–3 px) para que el estado se distinga de un vistazo. |

### Resumen de prioridades para el Coder

| Prioridad | Corrección |
|-----------|------------|
| **Alta** | Sincronizar grid con resumen (1). Regla naranja = sin voto, verde = ya votó (3). Ausente/En mora sin icono de voto o con etiqueta "por poder" (4). Coherencia % y conteos SI/NO/ABST (6). **Votó NO en rojo (11).** **Iconos ✓, X, ○ más grandes y visibles (12).** |
| **Media** | Distinguir Ausente vs En mora con color (2). Cálculo Presente+No votó (5). Integración voto manual en SI/NO/ABST (7). **Ajustes visuales:** casilla con línea/borde de color + fondo blanco en lugar de relleno sólido (13). |
| **Baja** | Color único En mora (8). Leyenda más clara (9). Tooltip con más datos (10). |

**Nota para Contralor:** Los ítems de **Ajustes visuales** (en particular el 13: casilla con borde de color + fondo blanco) figuran como prioridad **Media** en la tabla anterior. El Contralor puede pasarlos al Coder cuando corresponda.

---

## 🚨 BUG: Botones sección Monitor de asamblea (Dashboard Admin PH)

**Reporte Henry / Marketing:** En el dashboard Admin PH (resumen), los botones de la sección de asamblea **no funcionan correctamente** — llevan al dashboard PH resumen en lugar del destino correcto.

| Botón | Comportamiento actual (incorrecto) | Comportamiento esperado |
|-------|-----------------------------------|--------------------------|
| **Ver detalle** | Lleva a dashboard resumen (o no va al detalle de la asamblea) | Debe llevar a la página de **detalle de la asamblea** (ej. `/dashboard/admin-ph/assemblies/[id]` con el id real de la asamblea). |
| **Iniciar asamblea** | Lleva a dashboard resumen o usa id fijo (123) | Debe llevar a la **vista live** de la asamblea (ej. `/dashboard/admin-ph/assembly/[id]/live` o la ruta correcta con el **id real** de la asamblea seleccionada/próxima). |
| **Monitor** | Lleva a dashboard PH resumen | Debe llevar al **Monitor de asamblea** (ej. `/dashboard/admin-ph/monitor/[assemblyId]`) para la asamblea en curso o seleccionada, no al resumen. |

**Causa posible:** Enlaces con `href` incorrectos, id de asamblea hardcodeado (123), o redirección que devuelve al resumen. **Coder:** corregir destinos de los botones y usar id de asamblea real (desde datos de "Próxima Asamblea" o lista de asambleas).

---

## ➕ AGREGAR: Planes de pago único en Dashboard Admin PH

- En el dashboard de Admin PH debe poder **ver y/o contratar planes de pago único** (Evento Único, Dúo Pack, etc.), además de los planes por suscripción (Demo, Standard, Multi-PH, Enterprise).
- Ubicación sugerida: página **Suscripción** (`/dashboard/admin-ph/subscription`) o sección dedicada, mostrando tanto planes recurrentes como planes de pago único (transaccionales).
- Referencia de precios y planes: Marketing/MARKETING_PRECIOS_COMPLETO.md.

---

## 👥 Listado Propietarios/Residentes – Instrucciones para el Coder

**Destinatario:** Coder  
**Objetivo:** Que el cliente Admin PH tenga información correcta y completa para gestionar residentes y asambleas.

**Contexto:** Pantalla Propietarios / Residentes – tabla con correo, unidad, cuota %, Face ID, etc. El Admin PH debe poder ver y actuar con datos precisos para convocatorias, quórum, votaciones y actas.

### Tareas para el Coder

| # | Mejora | Descripción |
|---|--------|-------------|
| 1 | **Estado de pago (Al Día / En Mora)** | La columna ESTATUS muestra guiones. Debe mostrar "Al Día" o "En Mora" según el estado de cuota. Solo los Al Día pueden votar (Ley 284). |
| 2 | **Nombre del residente** | No hay columna con el nombre. Agregar NOMBRE o NOMBRE/RESIDENTE para identificación rápida. |
| 2b | **Número de finca (folio real)** | Campo para identificación registral de la unidad (ej. 96051, 99749). Requerido para actas según referencia PH Quintas del Lago. |
| 2c | **Cédula de identidad** | Campo para cédula del titular. Requerido en actas de elección Junta Directiva, firma acta, identificación legal. |
| 3 | **REGISTRO, LOGIN CHATBOT, SESIÓN, CONECTADO** | Si siempre muestran guión, evaluar si aportan valor o simplificar. Alternativa: tooltip o submenú "Detalle" para no saturar la tabla. |
| 4 | **Filtros y búsqueda** | Permitir buscar por correo, unidad o nombre. Filtrar por: Al Día / En Mora, Face ID activo, Hab. asamblea. |
| 5 | **HAB. ASAMBLEA** | Aclarar qué significa: ¿residente habilitado para votar en la asamblea actual? ¿Debe activarse manualmente o por defecto? Incluir ayuda contextual. |
| 6 | **Botón + (agregar)** | Con límite alcanzado (50/50), el botón + debe deshabilitarse o mostrar mensaje: "Límite alcanzado. Actualice su plan para agregar más residentes." |
| 7 | **Orden del plan** | Mostrar límite antes del input: "Puede agregar hasta X residentes (plan actual)." Así el admin sabe si puede añadir más. |
| 8 | **Acciones consistentes** | Todas las filas deberían tener las mismas acciones (Ed. rápida, Plantilla, Eliminar, Soporte) o justificar por qué difieren. Unit 103 no muestra Plantilla ni Eliminar. |
| 9 | **Correo y unidad completos** | Si se truncan ("reside..."), permitir ver el texto completo (tooltip o expansión) o ajustar ancho de columna. |
| 10 | **Exportar/Importar con estado** | Al exportar CSV, incluir columnas: correo, unidad, nombre, estado (Al Día/Mora), Face ID, Hab. asamblea. Plantilla de importación alineada con esas columnas. |
| 11 | **Indicador de asamblea activa** | Si hay asamblea activa/programada, indicar cuántos residentes están habilitados para ella. |
| 12 | **Poderes de asamblea** | El tab "Poderes de asamblea" debe permitir ver y gestionar poderes/cédulas de representación. Verificar que esté conectado a la lógica de "Ceder poder". |

**Resumen para el Coder:** Implementar las mejoras anteriores para que el Admin PH disponga de información correcta para asambleas (quórum, convocatorias, actas), residentes (estado de pago, nombre, Face ID) y límites del plan. Prioridad: Estado Al Día/En Mora, Nombre, Filtros.

---

## 🖥️ Monitor de Quórum – Nombre de asamblea no visible (Henry) ✅ IMPLEMENTADO

**Observación:** Al hacer clic en Monitor de Quórum y abrir el tablero (ej. Demo), no se muestra el nombre de la asamblea asociada. Solo aparece "Monitor de Quórum" y "Urban Tower PH" (nombre del edificio), pero falta indicar claramente qué asamblea se está monitoreando (ej. "Demo", "Asamblea Ordinaria 2026").

**Recomendación para el Coder:** Mostrar el nombre de la asamblea en el encabezado del Monitor (Quórum y Votación). Ejemplo: "Monitor de Quórum · Demo" o "Monitor de Quórum · Asamblea Ordinaria 2026". Para `assemblyId === "demo"` usar "Demo"; para asambleas reales usar `assembly?.title`.

**Contralor informado.** Registro en Marketing con bloque "Para CODER" e instrucción asignada.

### Para CODER – Instrucción (IMPLEMENTADO)

| Campo | Valor |
|-------|--------|
| **Instrucción** | En el encabezado del Monitor Back Office (pantallas Monitor de Quórum y Monitor de Votación), mostrar el nombre de la asamblea junto al título. Formato: "Monitor de Quórum · Demo" o "Monitor de Quórum · [título de la asamblea]". Si `assemblyId === "demo"` → "Demo"; si hay asamblea cargada → `assembly.title`; si no → "Asamblea". |
| **Estado** | ✅ Implementado. Encabezado actual: `{Monitor de Quórum \| Monitor de Votación} · {Demo \| assembly.title \| Asamblea}`. |

---

## ✅ VALIDACIÓN PENDIENTE – Chatbot Online (20 Feb 2026)

**Coder implementó:** Columna "Activo/Online" en Propietarios (Dashboard Admin PH → Residentes).

**Para Marketing validar:**
1. **Columna:** Indica si el residente está conectado al chatbot. Valores: "Activo" (verde, con punto), "Inactivo" (gris), "—" (no registrado).
2. **Filtro:** "Chatbot: Activo/Online" / "Chatbot: Inactivo" para filtrar por estado.
3. **Prueba en demo:** Entrar como admin demo → Propietarios. En otra pestaña, ir a /residentes/chat con residente1@demo.assembly2.com. Validar correo → debe aparecer "Activo" en la fila de ese residente. Cerrar sesión en el chatbot → debe pasar a "Inactivo".
4. **UX y copy:** Verificar que la etiqueta "Activo/Online" y el filtro sean claros para el administrador. Informar al Contralor al finalizar.

**Contralor informado.** Registro en Contralor_Desarrollo/ESTATUS_AVANCE.md.

---

## 📂 REFERENCIAS

- **Contralor/ESTATUS_AVANCE.md** — Bloque "Para CODER – Dashboard Admin PH": instrucción al Coder, reglas R1–R8 y estado de implementación (qué está aplicado por el Coder).
- Marketing/MARKETING_VALIDACION_DASHBOARD_HENRY.md (Platform Admin)
- Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md
