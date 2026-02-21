# Plan de pruebas: Sincronización Residentes ↔ Monitor Back Office y Chatbot

**Fecha:** Febrero 2026  
**Origen:** Contralor (validación con Henry)  
**Objetivo:** Validar que la información de residentes esté sincronizada entre listado de Propietarios, Monitor Back Office y asambleas; unificación de nombres de unidades (1 a 50); y flujo chatbot.

---

## 1. Contexto

- **Unidades demo unificadas:** En todo el dashboard Admin PH (listado Propietarios y Monitor Back Office) las unidades de prueba son **1 a 50** (Unidad 1, Unidad 2, … Unidad 50). Misma numeración en ambos lados.
- **Sincronización:** El Monitor usa los mismos residentes que el listado de Propietarios (store demo): estatus Al Día/En Mora, nombre, habilitado para votar. Si se agrega, edita o borra un residente en Propietarios, debe reflejarse en el Monitor (y en asambleas que usen ese listado).
- **Chatbot:** Los residentes registrados por el Admin PH deben ser reconocidos por el chatbot (validación de correo, contexto de asamblea).

---

## 2. Prerrequisitos

- Usuario **demo@assembly2.com** (plan Demo, 50 unidades).
- Opcional: **Restablecer listado demo** en Propietarios para partir de 50 residentes con unidades 1–50 (residente1@demo.assembly2.com … residente50@demo.assembly2.com).

---

## 3. Pruebas de sincronización Listado Residentes ↔ Monitor

### 3.1 Numeración unificada (1 a 50)

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Login demo@assembly2.com → Dashboard Admin PH → Propietarios | Listado con 50 residentes; columna **Unidad** muestra **Unidad 1**, **Unidad 2**, … **Unidad 50**. |
| 2 | Sidebar → Monitor Back Office → abrir asamblea demo (o /dashboard/admin-ph/monitor/demo) | Vista con **50 unidades**; códigos/números **1** a **50** (misma numeración que en Propietarios). |
| 3 | Comparar nombres | En Monitor, el “propietario” de la unidad N debe coincidir con el residente de **Unidad N** en Propietarios (ej. Residente 1 en unidad 1). |

### 3.2 Estatus Al Día / En Mora y Hab. asamblea

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | En Propietarios, cambiar un residente (ej. Unidad 5) a **En Mora** | Columna Hab. asamblea (voto) pasa a **No** automáticamente. |
| 2 | Ir al Monitor (misma asamblea/demo) y refrescar si aplica | La unidad 5 debe reflejar estado **Mora** (no puede votar). |
| 3 | Volver a Propietarios y cambiar el mismo residente a **Al Día** | Hab. asamblea puede quedar en **Sí** (un titular por unidad). |
| 4 | Verificar en Monitor | Unidad 5 refleja **Al Día**. |

### 3.3 Borrar y crear residentes 1 x 1 (sincronización)

Objetivo: validar que al borrar o crear residentes de forma individual, el Monitor y el listado siguen sincronizados.

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | En Propietarios, usar **Restablecer listado demo** para tener 50 residentes (Unidad 1–50). | Listado con 50 filas; unidades 1 a 50. |
| 2 | **Eliminar** un residente (ej. el de Unidad 10). | Listado pasa a 49 residentes; ya no existe Unidad 10 en el listado. |
| 3 | Ir al Monitor (demo) y revisar si la unidad 10 sigue apareciendo. | Según implementación: la unidad 10 puede seguir en el Monitor con datos por defecto, o no aparecer. Documentar comportamiento actual y reportar si se espera otro. |
| 4 | En Propietarios, **agregar** un nuevo residente (correo único, ej. nuevo10@demo.assembly2.com) y asignar **Unidad 10** al editar. | El residente aparece con Unidad 10. |
| 5 | Ir al Monitor y refrescar. | La unidad 10 debe mostrar el nombre/correo del nuevo residente si la sincronización es por unidad. |
| 6 | Repetir pasos 2–5 con otra unidad (ej. 20) para asegurar que el flujo borrar → crear 1 x 1 sincroniza correctamente. | Misma lógica; reportar en QA_FEEDBACK.md. |

### 3.4 Crear residentes uno por uno (límite 50)

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Restablecer listado demo. Borrar todos los residentes posibles (o partir de lista vacía si la UX lo permite). | Lista vacía o mínima. |
| 2 | Agregar residentes **uno por uno** (correo + asignar unidad 1, 2, 3…) hasta completar 50. | Cada nuevo residente aparece en el listado y, en el Monitor, la unidad correspondiente refleja ese residente. |
| 3 | Al intentar agregar el residente 51 | Mensaje de límite alcanzado (50) o deshabilitación del botón. |

---

## 4. Pruebas de asambleas

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Desde Dashboard Admin PH → Asambleas → abrir una asamblea (lista o Kanban) → **Monitor**. | El Monitor muestra las mismas 50 unidades (1–50) y residentes alineados con Propietarios. |
| 2 | Cambiar en Propietarios el estatus de un residente (Al Día ↔ En Mora). | En el Monitor de la asamblea, esa unidad refleja el cambio (Al Día puede votar; Mora no). |

---

## 5. Pruebas de chatbot

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con un correo de residente existente en el listado (ej. residente1@demo.assembly2.com), abrir el **chatbot** (residentes). | El chatbot reconoce el correo (validación OTP o mensaje de bienvenida para residente). |
| 2 | Consultar asamblea activa, tema del día o cómo votar. | Respuestas coherentes (asamblea activa/programada, tema, instrucciones de voto). |
| 3 | Probar con un correo **no** registrado en Propietarios. | Mensaje tipo “No encuentro ese correo” o indicación de registro. |
| 4 | Después de agregar un nuevo residente en Propietarios (ej. nuevo10@demo.assembly2.com), probar ese correo en el chatbot. | Si la sincronización con el chatbot es en tiempo real o tras recarga, el chatbot debería reconocer el correo. Documentar comportamiento. |

---

## 6. Otras pruebas sugeridas

- **Exportar CSV** desde Propietarios: columnas unidad, nombre, estado (Al Día/Mora), hab_asamblea; unidades 1–50.
- **Importar CSV** con unidades 1–50 y validar que el Monitor refleje los mismos datos.
- **Plantilla de unidad:** Editar Titular 1 / Titular 2 y Hab. asamblea para una unidad; verificar en Monitor que solo el habilitado cuenta para voto.
- **Face ID:** Toggle Face ID en un residente; en Monitor, comprobar si la unidad muestra Face ID activo (si aplica).

---

## 7. Reporte

- Registrar resultados en **QA_FEEDBACK.md** (sección “Sincronización Residentes ↔ Monitor y Chatbot” o similar).
- Indicar: qué pruebas pasaron, qué falló, comportamiento observado en “borrar/crear 1 x 1” y en el chatbot.
- Contralor revisa el reporte y asigna siguientes pasos (Coder, Database o nueva ronda QA).

---

## 8. Ejecución del plan y correcciones Coder

**Estado:** Ejecutado. Correcciones aplicadas según QA.

- **QA ejecución (13 Feb 2026):** Ver **QA_FEEDBACK.md** § "QA Ejecución · Sincronización Residentes ↔ Monitor y Chatbot". Veredicto inicial: PARCIAL (sincronización OK; chatbot solo 1–5; unidades borradas seguían en Monitor).
- **Correcciones Coder (26 Feb 2026):** Ver **QA_FEEDBACK.md** § "Correcciones Coder · Plan Residentes ↔ Monitor (post-QA)".
  - **Mejora 1:** Chatbot valida también contra `getDemoResidents()` (listado Propietarios demo). residente1@…residente50@ y correos agregados en Propietarios son reconocidos (`page.tsx`, `chat/page.tsx`).
  - **Mejora 2:** En demo, el Monitor filtra unidades sin residente en el listado; al eliminar el residente de una unidad, esa unidad deja de mostrarse hasta que se asigne de nuevo (`monitor/[assemblyId]/page.tsx`).
- **Re-ejecución sugerida:** §3.3 paso 3 (unidad eliminada no aparece en Monitor), §5 (residente6@… o nuevo agregado reconocido en chatbot). Ref. Coder/INSTRUCCIONES_QA_MEJORAS_RESIDENTES_MONITOR_CHATBOT.md.

---

## 9. Instrucciones QA: Asambleas demo y validación Vista Tablero

**Objetivo:** Poder borrar las asambleas demo creadas, simular 2 asambleas y validar que la sincronización de residentes se refleje en el Monitor y que la **Vista Tablero** muestre las unidades en la cuadrícula.

### 9.1 Restablecer asambleas demo (opcional)

- En **Dashboard Admin PH → Asambleas**, con usuario **demo@assembly2.com**, está disponible el botón **«Restablecer asambleas demo»**.
- Al pulsarlo (y confirmar), se borran las asambleas guardadas y se cargan de nuevo **2 asambleas por defecto** (Ordinaria 2026 y Extraordinaria Piscina). Sirve para partir de un estado conocido.
- Opcional: en **Propietarios/Residentes** usar **«Restablecer listado demo»** para tener 50 residentes (Unidades 1–50).

### 9.2 Simular 2 asambleas

- **Opción A:** Tras **Restablecer asambleas demo**, ya hay 2 asambleas; usarlas para la validación.
- **Opción B:** Sin restablecer: eliminar las asambleas actuales (botón **Eliminar** en cada una, escribir **eliminar** para confirmar; solo se pueden eliminar si no están en estado «Completada»). Luego **Crear asamblea** dos veces (título, tipo, fecha, orden del día, etc.) para tener 2 asambleas nuevas.

### 9.3 Validar sincronización y Vista Tablero

Para **cada una de las 2 asambleas**:

1. Abrir el **Monitor** (desde la tarjeta de la asamblea: Monitor de Quórum o Monitor de Votación, o ir a `/dashboard/admin-ph/monitor/votacion/{id}` o `/dashboard/admin-ph/monitor/quorum/{id}`).
2. Comprobar que la **Vista Tablero** (vista por defecto) muestra la **cuadrícula de unidades** (celdas 1, 2, 3 … hasta 50), con la misma numeración que en Propietarios.
3. Verificar que los datos (nombre/propietario por unidad, Al Día/Mora) coinciden con el listado de **Propietarios/Residentes** (sincronización).
4. Si en Propietarios se cambia un residente a En Mora o se elimina un residente de una unidad, refrescar o reabrir el Monitor y comprobar que el tablero refleja el cambio (unidad en Mora o unidad sin residente no aparece / datos actualizados).

**Criterio de éxito:** En las 2 asambleas, el Monitor muestra la Vista Tablero con las unidades en cuadrícula y los datos alineados con el listado de residentes.

---

**Referencias:**  
- Listado residentes: `/dashboard/admin-ph/owners`  
- Monitor: `/dashboard/admin-ph/monitor` o `/dashboard/admin-ph/monitor/demo`  
- Chatbot residentes: según flujo (web/Telegram); correos en Propietarios deben estar sincronizados con el contexto de asamblea.
