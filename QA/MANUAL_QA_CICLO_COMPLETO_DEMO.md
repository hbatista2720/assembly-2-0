# Manual QA: Ciclo completo demo (residentes, asambleas, celebrar)

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Creado por:** QA (guía para validación)  
**Objetivo:** Guía paso a paso para probar el flujo completo: partir de data limpia, registrar residentes, crear 2 asambleas y ejecutar el ciclo hasta celebrar (completar) asamblea, validando sincronización y Vista Tablero.

---

## 1. Prerrequisitos

- **Usuario:** demo@assembly2.com (Admin PH demo).
- **Entorno:** App en marcha (p. ej. `npm run dev`, `http://localhost:3000`).
- **Login:** Ir a `/login`, ingresar **demo@assembly2.com**, solicitar código OTP y completar acceso (o usar el código que muestre la API en modo local).

---

## 2. Partir de data limpia (borrar todo)

Para que la prueba sea reproducible, empezar sin residentes ni asambleas creadas:

1. Ir a **Dashboard Admin PH** (inicio del dashboard: `/dashboard/admin-ph`).
2. Seleccionar el PH si aparece el selector (ej. Urban Tower PH).
3. Bajar hasta la tarjeta **«Para QA: estado limpio»**.
4. Pulsar **«Restablecer todo (demo)»**.
5. Confirmar en el diálogo. La página se recargará.
6. **Resultado esperado:** Listado de residentes vacío o por cargar; sin asambleas (o solo las que se carguen tras el reseteo según implementación).  
   **Alternativa:** Si no usó el botón global, puede ir a **Propietarios/Residentes** → «Restablecer listado demo» y a **Asambleas** → «Restablecer asambleas demo» por separado.

---

## 3. Registrar usuarios (residentes)

Objetivo: tener un listado de residentes con unidades asignadas para que el Monitor muestre unidades en la Vista Tablero.

1. Ir a **Propietarios/Residentes** (sidebar o `/dashboard/admin-ph/owners`).
2. **Opción A – Rápida:** Pulsar **«Restablecer listado demo»** para cargar 50 residentes con Unidades 1–50 (residente1@demo.assembly2.com … residente50@demo.assembly2.com).
3. **Opción B – Manual:** Agregar residentes uno a uno con **Agregar residente** (correo, luego editar para asignar Unidad, nombre, Estatus Al Día/Mora, Hab. asamblea si aplica). Hasta 50 residentes en demo.
4. **Validar:** La tabla muestra columnas Unidad, Estatus, Hab. asamblea (voto), etc. Cambiar un residente a «En Mora» y comprobar que «Hab. asamblea (voto)» pasa a No.

---

## 4. Crear 2 asambleas

Objetivo: tener 2 asambleas para abrir el Monitor de cada una y validar el ciclo.

1. Ir a **Asambleas** (`/dashboard/admin-ph/assemblies`).
2. Pulsar **«Crear asamblea»**.
3. **Primera asamblea (ej. Ordinaria):**
   - Título: p. ej. «Asamblea Ordinaria 2026».
   - Tipo: Ordinaria (o Extraordinaria).
   - Fecha y hora: una fecha futura (respetar mínimos Ley 284: 10 días Ordinaria, 3 días Extraordinaria).
   - Ubicación, **Orden del día** (obligatorio, al menos un tema), advertencia segundo llamado, modo (Presencial/Virtual/Mixta), enlace si aplica.
   - Guardar.
4. **Segunda asamblea:** Repetir con otro título (ej. «Asamblea Extraordinaria - Piscina») y tipo/fecha distintos.
5. **Validar:** En lista o Kanban aparecen las 2 asambleas en estado «Programada» (o el que corresponda).

---

## 5. Ciclo completo por asamblea (Quórum → Votación → Celebrar)

Ejecutar para **cada una de las 2 asambleas** (o al menos para una, y verificar la segunda en Monitor).

### 5.1 Monitor de Quórum

1. Ir a **Monitor Back Office** → **Monitor de Quórum** (o desde la tarjeta de la asamblea, enlace al Monitor de Quórum).
2. Elegir la asamblea en la lista (o el enlace directo a esa asamblea).
3. **Validar:** Se muestra la Vista Tablero con **unidades en cuadrícula** (1, 2, 3 … hasta las que tengan residente en Propietarios). Números de unidad coinciden con el listado de residentes.
4. Revisar indicadores de quórum (presentes / no presentes, resultado de quórum).

### 5.2 Monitor de Votación

1. Ir a **Monitor de Votación** (o enlace desde la asamblea).
2. Abrir la **misma asamblea** (o la segunda).
3. **Validar:** Vista Tablero por defecto con la **cuadrícula de unidades**. Datos (nombre/propietario, Al Día/Mora) coinciden con Propietarios/Residentes.
4. Opcional: simular voto manual en una unidad (clic en celda, elegir SI/NO/Abstención) y comprobar que se refleja.
5. Opcional: filtrar por tema de votación si la asamblea tiene temas.

### 5.3 Completar asamblea (celebrar)

1. Volver a **Asambleas** (lista o Kanban).
2. Localizar la asamblea que se usó en el Monitor.
3. Pasar su estado a **«Completada»** (acción «Completar» / «Mover a Completada» según la UI).
4. **Validar:** Aparece el modal de acta inmediata (Ley 284) si está implementado; la asamblea queda en estado «Completada» y ya no se puede eliminar (crédito consumido).
5. Repetir para la segunda asamblea si se desea.

---

## 6. Validaciones de sincronización (resumen)

- **Propietarios ↔ Monitor:** Unidades y datos (Al Día/Mora, nombre) en el tablero coinciden con el listado de Propietarios/Residentes.
- **Sin asambleas:** En Monitor de Quórum y Monitor de Votación no debe mostrarse un tablero con unidades; solo el mensaje «No hay asambleas» y enlace a Asambleas.
- **Vista Tablero:** Siempre que se abra el Monitor de una asamblea, la vista por defecto debe ser el tablero (cuadrícula de unidades), no solo resumen.
- **Celebrar:** Asambleas en «Completada» no se pueden eliminar; el flujo de acta inmediata (si aplica) se muestra al completar.

---

## 7. Registro de resultados (para QA)

Al finalizar la ejecución, documentar en **QA_FEEDBACK.md** o en el reporte acordado:

| Prueba | ¿OK? | Notas |
|--------|------|-------|
| Restablecer todo (demo) | | Página recarga; residentes y asambleas en estado inicial. |
| Registrar residentes (listado / restablecer) | | 50 unidades o las agregadas; Hab. asamblea y Mora sincronizan. |
| Crear 2 asambleas | | Ambas visibles en lista/Kanban, estado Programada. |
| Monitor Quórum – Vista Tablero unidades | | Cuadrícula con unidades 1–50 (o las que tengan residente). |
| Monitor Votación – Vista Tablero unidades | | Misma numeración; datos alineados con Propietarios. |
| Completar asamblea (celebrar) | | Estado Completada; no se puede eliminar; acta si aplica. |
| Sin asambleas → Monitor vacío | | Solo mensaje «No hay asambleas», sin tablero. |

Indicar incidencias, capturas o comportamientos no esperados para que Coder/Contralor den seguimiento.

---

## 8. Referencias rápidas

- **Dashboard Admin PH:** `/dashboard/admin-ph`
- **Propietarios/Residentes:** `/dashboard/admin-ph/owners`
- **Asambleas:** `/dashboard/admin-ph/assemblies`
- **Monitor Back Office (inicio):** `/dashboard/admin-ph/monitor`
- **Monitor Quórum (lista):** `/dashboard/admin-ph/monitor/quorum`
- **Monitor Votación (lista):** `/dashboard/admin-ph/monitor/votacion`
- **Plan sincronización:** `QA/PLAN_PRUEBAS_RESIDENTES_MONITOR_SINCRONIZACION.md`

---

*Manual creado para QA como guía del ciclo completo demo. Actualizar según cambios de producto o flujos.*
