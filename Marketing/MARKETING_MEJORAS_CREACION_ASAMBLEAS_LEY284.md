# 📋 Mejoras en creación de asambleas – Cumplimiento Ley 284 (Panamá)

**Fecha:** Febrero 2026  
**Responsable:** Marketing B2B  
**Destinatario:** Contralor (asignar al Coder)  
**Objetivo:** Que los administradores vean una herramienta completa, conforme a la Ley 284 de Panamá.

> **Incluye T6 – Acta inmediata y acta legal:** al finalizar las votaciones se emite un acta resumen de inmediato; se indica que el acta legal formal se enviará en el plazo Ley 284 (máx. 10 días). Ver sección Tarea 6 y flujo en §4.

---

## 🎯 CONTEXTO

Assembly 2.0 se enfoca en Panamá (Ley 284). El formulario actual de "Nueva asamblea" tiene: Título, Tipo, Fecha y hora, Ubicación. Faltan campos obligatorios y validaciones según la normativa vigente.

---

## 📐 REQUISITOS SEGÚN LEY 284 (Art. 63, 68)

### 1. Restricciones de tiempo (plazos de convocatoria)

| Tipo de asamblea | Plazo mínimo de anticipación |
|------------------|------------------------------|
| **Extraordinaria** | **3 a 5 días calendario** antes de la fecha de la asamblea |
| **Ordinaria**      | **10 a 20 días calendario** antes de la fecha de la asamblea |

### 2. Información obligatoria de la convocatoria

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Tipo de asamblea | ✅ | Ordinaria o Extraordinaria |
| Título | ✅ | Ej: "Asamblea Ordinaria 2026" |
| Fecha y hora | ✅ | Formato dd/mm/aaaa, HH:mm |
| Ubicación | ✅ | Lugar físico o enlace si es virtual/mixta |
| Orden del día (agenda) | ✅ | Temas específicos; no usar "temas varios" para votación |
| Advertencia segundo llamado | ✅ | Indicar que si no hay quórum, habrá segundo llamado 1h después (válido con presentes al día) |

### 3. Formato de fecha

- Fecha: dd/mm/aaaa  
- Hora: formato 24h (HH:mm)

### 4. Acta – Contenido según referencia (Ley 284 y acta PH Quintas del Lago)

El acta es el respaldo jurídico de la asamblea. Basado en un acta de referencia real (P.H. Quintas del Lago, nov 2024), el contenido debe incluir:

#### 4.1 Identificación del PH y convocatoria

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Lugar, fecha y hora exacta | ✅ | Dónde y cuándo se celebró (presencial, virtual o mixta) |
| Nombre del PH | ✅ | Ej. P.H. Quintas del Lago |
| Folio real / código ubicación | ✅ | Identificación registral del PH (ej. Folio Real 96050, código 8715) |
| Texto de convocatoria | ✅ | Fecha de convocatoria, quién convocó, orden del día |
| Nombre presidente y secretario | ✅ | Quien presidió y quien actuó como secretario |
| Cédula presidente y secretario | ✅ | Para firma del acta definitiva |

#### 4.2 Lista de presentes (propietarios y representados)

| Campo por propietario | Obligatorio | Descripción |
|-----------------------|-------------|-------------|
| No. | ✅ | Número ordinal |
| **Unidad** | ✅ | Ej. LOTE 165, Unidad 101 |
| **Número de finca** (folio real) | ✅ | Ej. 96051, 99749. Identificación registral de la unidad |
| **Propietario** | ✅ | Nombre completo del titular |
| **Representado por** | Si aplica | Si vino por poder, nombre del mandatario |
| **% (coeficiente)** | ✅ | Porcentaje de participación (ej. 0.32 %) |

#### 4.3 Cédula de identidad de titulares

- **Importante:** En actas de elección de Junta Directiva y en decisiones que requieren mayorías calificadas, se incluye la **cédula de identidad personal** de los candidatos elegidos y de los titulares cuando se citan.
- Ejemplo (acta referencia): "HUGO ALBERTO HEART MEDINA, CON CÉDULA DE IDENTIDAD PERSONAL No. 8-274-796, COPROPIETARIO DE LA UNIDAD INMOBILIARIA LOTE 216, LA CUAL CORRESPONDE AL FOLIO REAL 99749."
- **Para el sistema:** Permitir capturar cédula de cada residente/titular para que el acta legal incluya estos datos cuando sea necesario.

#### 4.4 Otros campos del acta

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Constancia total unidades | ✅ | Ej. "311 unidades inmobiliarias" |
| Constancia unidades al día | ✅ | Unidades al día en obligaciones financieras |
| Transcripción decisiones | ✅ | Votos a favor, en contra, abstenciones por tema |
| Coeficientes por votación | ✅ | En temas que modifiquen Reglamento o mayorías calificadas |
| Firma presidente y secretario | ✅ | Con cédula, al aprobar acta definitiva |

#### 4.5 Datos que el Admin PH debe poder gestionar (Listado Residentes)

Para que el acta sea completa, el listado de residentes debe permitir:

| Campo | Importancia | Uso en acta |
|-------|-------------|-------------|
| **Número de finca** (folio real) | Alta | Lista de presentes, elecciones |
| **Cédula de identidad** | Alta | Candidatos Junta Directiva, firma acta, identificación legal |
| Nombre completo | Alta | Lista de presentes, votaciones |
| Unidad | Alta | Lista de presentes |
| Coeficiente % | Alta | Quórum, votaciones ponderadas |
| Estado Al Día / En Mora | Alta | Constancia "unidades al día" |
| Representado por (poder) | Media | Si vino por mandatario |

**Plazos (Ley 284):**
- Acta emitida en un plazo no mayor a **10 días calendario** desde la asamblea.
- Resumen del acta circulado a propietarios en un máximo de **3 días calendario**.

**Flujo propuesto:**

1. **Acta inmediata (al finalizar las votaciones)** – El sistema emite de inmediato un acta resumen con:
   - Resultados de la votación por tema
   - Resumen de unidades y su voto (SI, NO, ABST) por cada propietario/unidad
   - Mensaje claro: "El acta legal formal se enviará en el plazo que indica la Ley 284 (máx. 10 días calendario desde la asamblea)."

2. **Acta legal** – Se genera y envía dentro del plazo legal (≤ 10 días calendario), con todos los mínimos Ley 284, revisión legal y firma de presidente y secretario.

---

## ✅ TAREAS PARA EL CODER

### Tarea 1: Validación de plazos según tipo (prioridad alta)

- Si **Extraordinaria**: la fecha de la asamblea debe ser ≥ 3 días calendario después de la fecha de convocatoria (o de creación de la asamblea).
- Si **Ordinaria**: la fecha debe ser ≥ 10 días calendario después.
- Mostrar mensaje claro si no cumple: "Para asamblea [tipo], la convocatoria debe realizarse con al menos [X] días de anticipación (Ley 284)."
- Sugerir la fecha mínima válida según el tipo seleccionado.

### Tarea 2: Agregar campo Orden del día (agenda) (prioridad alta)

- Campo obligatorio para crear la asamblea.
- Lista de temas o texto con puntos específicos.
- Ayuda contextual: "Solo pueden votarse temas incluidos en el orden del día (Ley 284). Evitar 'temas varios' para decisiones."
- UI: textarea o lista editable de ítems.

### Tarea 3: Agregar advertencia segundo llamado (prioridad alta)

- Checkbox o texto fijo: "Advertencia: Si no se alcanza el quórum en el primer llamado, se realizará un segundo llamado una hora después, válido con los propietarios al día presentes."
- Opción A: Checkbox "Incluir advertencia segundo llamado" (obligatorio, pre-marcado).
- Opción B: Texto fijo visible en la vista previa de la convocatoria.

### Tarea 4: Formato de fecha consistente (prioridad media)

- Usar dd/mm/aaaa y hora 24h en todo el flujo.
- Validar que el input sea fecha futura y cumpla plazos según tipo.

### Tarea 5: Modo de asamblea (prioridad media)

- Campo opcional: Presencial, Virtual o Mixta.
- Si Virtual/Mixta: campo para enlace de reunión (Zoom, Meet, etc.).

### Tarea 6: Acta inmediata y acta legal (prioridad alta)

**Objetivo:** Cumplir Ley 284 en plazos y dar transparencia al administrador: acta resumen al instante y compromiso explícito de acta legal en plazo.

- **Acta inmediata (al finalizar las votaciones):**
  - El sistema emite **de inmediato** un acta resumen con:
    - Resultados de la votación por tema (SI / NO / ABST por tema)
    - Resumen de unidades y su voto (SI, NO, ABST) por cada propietario/unidad
  - Incluir en el mismo documento o pantalla el mensaje al usuario:
    - *"El acta legal formal se enviará en el plazo que indica la Ley 284 (máx. 10 días calendario desde la asamblea)."*
  - Objetivo: que el administrador y los propietarios tengan constancia inmediata de los resultados, sin esperar el acta legal definitiva.
- **Acta legal:**
  - Generar y enviar dentro del plazo legal (**≤ 10 días calendario** desde la asamblea).
  - Contenido según Ley 284 Art. 68 y referencia acta PH Quintas del Lago: lugar, fecha, hora, folio real PH, presidente, secretario (con cédula), lista de presentes con **unidad, número de finca, propietario, representado por, coeficiente %**, decisiones, coeficientes por votación, firma.
  - Tras revisión legal y firma de presidente y secretario.
  - **Datos requeridos en residentes:** Número de finca, Cédula de identidad (para actas completas).

### Tarea 7: Monitor Back Office – Orden de botones (prioridad alta) ✅ Implementado

- En la pantalla "Monitor Back Office", colocar **Monitor de Quórum** primero (arriba) y **Monitor de Votación** segundo.
- Motivo: el flujo real es validar quórum antes de votar.
- **Implementado:** Quórum es el primer botón (principal); Votación el segundo (secundario). Texto descriptivo ajustado: "Primero valide el quórum (asistencia); luego abra el monitor de votación por temas."

### Tarea 8: Cronograma de asamblea (prioridad media)

- Mostrar cronograma visual del flujo: Quórum → (opc.) Aprobar orden del día → Explicación y votación por tema.
- "Aprobar orden del día" como tema **opcional** configurable.
- Modalidades para "Aprobar orden del día": Votación formal | Pregunta general | Aprobación tácita (si nadie objeta, se aprueba sin votación).

### Tarea 9: Botones convocatoria – NO usar "aprobada" (prioridad alta) ✅ Implementado

- Cambiar "Primera Convocatoria aprobada" y "Segunda Convocatoria aprobada" por texto que indique la acción.
- Ejemplo: "Registrar primera convocatoria" / "Registrar segunda convocatoria".
- Objetivo: que el botón indique registrar/usar, no un estado de aprobación.
- **Implementado:** Botones y estado muestran solo "Primera convocatoria" / "Segunda convocatoria" (sin "aprobada"). Etiqueta de etapa: "Quórum · Convocatoria".

### Tarea 10: Al abrir Monitor Quórum – Activar asistencia en chatbot (prioridad alta)

- Cuando el Admin abre Monitor de Quórum para una asamblea, activar el registro de asistencia en el chatbot de residentes.
- Residente entra a la sala: escaneo de QR o link único → se registra la asistencia.
- La asistencia se refleja de inmediato en el tablero de quórum (verde = presente, gris = no presente).
- Integración: chatbot + Monitor deben sincronizarse.

### Tarea 11: Apertura de sala configurable (prioridad media)

- Permitir configurar apertura de sala: **30 minutos** o **1 hora** antes de la primera convocatoria.
- A la hora de apertura: habilitar registro de asistencia (chatbot + QR).
- A la hora de la primera convocatoria: validar quórum.
- Campo en creación/edición de asamblea: "Apertura de sala: 30 min antes / 1 hora antes".

### Tarea 12: Abandono de sala – Integrar con quórum (prioridad alta) ✅ Implementado

- El abandono de sala genera confusión si no se considera en el quórum.
- **Regla:** Quien abandona la sala deja de contar como "presente". El quórum debe recalcularse con los presentes actuales.
- Si tras abandonos el quórum ya no se alcanza, mostrar alerta o cambio de estado ("Quórum perdido").
- El tablero y "Quórum alcanzado" deben reflejar la realidad: presentes = en sala, excluyendo abandonos.
- **Implementado:** (1) Los presentes del quórum se recalculan excluyendo a las unidades con abandono registrado. (2) En el tablero, las unidades que abandonaron se muestran en gris y no cuentan como presentes. (3) Si tras abandonos el quórum deja de alcanzarse, se muestra el estado "Quórum perdido" (badge rojo). (4) Export Excel/PDF usan el mismo conteo (presentes excl. abandonos). (5) En Monitor de Quórum se muestra el indicador "Chatbot · Asistencia activa" cuando la asistencia está activa.

---

## 🖥️ MONITOR BACK OFFICE – Orden y cronograma de asamblea

### Orden de botones ✅ Implementado (T7)

- **Correcto (Henry):** El **Monitor de Quórum** se muestra **primero** (botón principal), **Monitor de Votación** segundo (secundario). Flujo real: 1) validar quórum, 2) luego votar.
- **Implementado en código:** Pantalla "Monitor Back Office" con Quórum primero y Votación segundo; texto descriptivo: "Primero valide el quórum (asistencia); luego abra el monitor de votación por temas."

### Cronograma de la asamblea (flujo recomendado)

| Fase | Descripción |
|------|-------------|
| **1. Quórum** | Validar quórum (primer llamado o segundo llamado). Sin quórum, no se puede votar. |
| **2. Aprobar orden del día** | **(Opcional)** En muchos casos el abogado no hace votación: menciona el orden del día, detalla la asamblea y si nadie objeta se da por aprobado. Opciones: (a) votación formal, (b) pregunta general, (c) aprobación tácita (si nadie dice nada). |
| **3. Explicación y votación por tema** | Para cada tema del orden del día: explicación → votación (SI/NO/ABST). |

**Sugerencia para el sistema:**
- Mostrar cronograma visual al abrir Monitor Back Office o al iniciar asamblea.
- "Aprobar orden del día" como tema **opcional** configurable: si está marcado, se muestra en el flujo; si no, se salta.
- Modalidades para "Aprobar orden del día": Votación | Pregunta general | Aprobación tácita (sin votación).

---

## 🖥️ MONITOR DE QUÓRUM – Botones, apertura de sala y registro de asistencia

### 1. Botones de convocatoria – NO usar "aprobado" ✅ Implementado

**Problema:** Los botones actuales ("Primera Convocatoria aprobada", "Segunda Convocatoria aprobada") usan la palabra "aprobada", que no refleja bien la acción.

**Sugerencia:** Cambiar el texto de los botones. Opciones:
- "Registrar primera convocatoria" / "Registrar segunda convocatoria"
- "Primera convocatoria – Registrar" / "Segunda convocatoria – Registrar"
- "Usar primera convocatoria" / "Usar segunda convocatoria"

**Objetivo:** Que el botón indique la **acción** (registrar, usar) y no un estado de aprobación.

**Implementado:** En el cronograma del Monitor de Quórum, la etapa "Quórum · Convocatoria" muestra botones "Primera convocatoria" y "Segunda convocatoria"; el estado guardado se muestra como "Primera convocatoria" o "Segunda convocatoria" (sin "aprobada").

### 2. Al abrir Monitor de Quórum – Activar asistencia en chatbot

**Flujo propuesto:**
1. El Admin PH abre el **Monitor de Quórum** (o hace clic en "Monitor de Quórum" para una asamblea).
2. El sistema **activa el registro de asistencia** en el chatbot de residentes.
3. Los residentes, al entrar a la sala:
   - **Escaneo de QR** (o link único de la asamblea)
   - Se registra la asistencia automáticamente
4. La asistencia se refleja **de inmediato en el tablero de quórum** (casillas verde = presente, gris = no presente).

**Integración:** El chatbot debe permitir al residente "registrarme en la sala" cuando la asistencia está activa. Ese registro debe sincronizarse con el Monitor de Quórum.

### 3. Apertura de la sala – Antes de la primera convocatoria

**Regla:** La sala puede abrirse **antes** de la hora pactada de la primera convocatoria.

**Opciones configurables:**
- **30 minutos antes** de la primera convocatoria
- **1 hora antes** de la primera convocatoria

**Ejemplo:** Si la primera convocatoria está pactada a las 19:00:
- Con apertura 30 min antes: la sala abre a las 18:30. Los residentes pueden entrar y registrar asistencia desde 18:30 hasta 19:00 (o después).
- Con apertura 1 hora antes: la sala abre a las 18:00.

**Flujo:**
1. Admin configura apertura (30 min o 1 hora antes) al crear o editar la asamblea.
2. A la hora de apertura: se habilita el registro de asistencia (chatbot + QR).
3. A la hora de la primera convocatoria: se valida el quórum.

### 4. Abandono de sala – Debe considerarse en el quórum ✅ Implementado (T12)

**Problema:** El "Abandono de sala" genera confusión. Si un residente abandona la sala, debe reflejarse en el quórum correcto.

**Regla:** El quórum debe calcularse solo con los **presentes actuales**. Si un residente abandona la sala:
- Deja de contar como "presente" en el tablero.
- El resultado de quórum (X/Y presentes) debe **recalcularse** y excluir al que abandonó.
- Si tras abandonos el quórum ya no se alcanza, el sistema debe indicarlo (ej. alerta o cambio de estado "Quórum perdido").

**Objetivo:** Que el tablero de quórum y el botón "Quórum alcanzado" reflejen la realidad: presentes = los que están en sala, no los que entraron y luego abandonaron.

**Implementado (T12):** Integración abandono–quórum en `src/app/dashboard/admin-ph/monitor/[assemblyId]/page.tsx`: presentes excluyen abandonos; badge "Quórum perdido" si tras abandonos ya no se alcanza; cuadrícula muestra en gris a quien abandonó; indicador "Chatbot · Asistencia activa" en Monitor de Quórum.

**Implementado:** Integración abandono–quórum en el Monitor: presentes excluyen abandonos, tablero en gris para quienes abandonaron, estado "Quórum perdido" cuando aplica, export con mismo criterio. Indicador "Chatbot · Asistencia activa" visible en Monitor de Quórum.

---

## 📋 RESUMEN PARA EL CODER

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | Validar plazos: Extraordinaria ≥3 días, Ordinaria ≥10 días | Alta |
| 2 | Campo obligatorio Orden del día (agenda) | Alta |
| 3 | Incluir advertencia segundo llamado | Alta |
| 4 | Formato dd/mm/aaaa, hora 24h, validaciones | Media |
| 5 | Campo Modo (Presencial/Virtual/Mixta) y enlace si aplica | Media |
| 6 | Acta inmediata al finalizar votaciones (resumen resultados + unidades y voto); indicar que acta legal se enviará en plazo Ley 284 | Alta |
| 7 | Monitor Back Office: botón Quórum primero, Votación segundo | Alta |
| 8 | Cronograma asamblea: Quórum → (opc.) Aprobar orden día → Explicación + votación temas. "Aprobar orden día" opcional (votación / pregunta general / aprobación tácita) | Media |
| 9 | Botones convocatoria: NO usar "aprobada". Usar "Primera convocatoria" / "Segunda convocatoria" (o similar) | Alta ✅ |
| 10 | Al abrir Monitor Quórum: activar asistencia en chatbot. Residente entra (QR o link) → registrar asistencia → reflejar en tablero | Alta |
| 11 | Apertura de sala: configurable 30 min o 1 hora antes de la primera convocatoria. A la hora de apertura habilitar registro asistencia | Media |
| 12 | Abandono de sala: integrar con quórum. Quien abandona deja de contar como presente; recalcular quórum; alertar si se pierde. Indicador "Chatbot · Asistencia activa" en Monitor Quórum | Alta ✅ |
| 13 | Listado residentes: agregar Número de finca y Cédula. Requerido para actas completas (ref. acta PH Quintas del Lago) | Alta |

---

## 📂 REFERENCIAS

- Ley 284 de 2022 (Panamá) – Régimen de Propiedad Horizontal
- Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md – Wizard Crear Asamblea
- Arquitecto/ARQUITECTURA_ASSEMBLY_2.0.md – Cumplimiento Ley 284
