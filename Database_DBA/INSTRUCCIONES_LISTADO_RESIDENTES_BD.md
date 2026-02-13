# Instrucciones: Listado de residentes y coincidencia con BD

**Fecha:** Febrero 2026  
**Contexto:** Dashboard Admin PH → Propietarios/Residentes (listado). Demo usa localStorage; producción usa API/BD.

---

## 1. Reseteo del listado demo (sin tocar la BD)

El **listado en modo demo** se guarda solo en el navegador:

- **Clave:** `assembly_demo_residents` (localStorage).
- **Reseteo:** En la página Propietarios/Residentes (como Admin PH demo), botón **«Restablecer listado demo»**. Borra esa clave y vuelve a cargar los 50 residentes por defecto (seed en front).
- **No hace falta** ninguna instrucción para el agente de BD: la base de datos **no** guarda esos datos en modo demo (nombre, unidad, Nº finca, ID identidad, estatus Al Día/Mora, Hab. asamblea, etc.). Todo es local.

Si se quiere “empezar de cero” en demo: usar ese botón. No hay script SQL ni migración asociada al reseteo del listado demo.

---

## 2. Estado actual de la BD para residentes

La API que usa el listado cuando **no** es demo es:

- **GET** `/api/admin-ph/residents?organization_id=xxx`
- **Origen:** tabla `users`.
- **Columnas usadas hoy:** `id`, `email`, `face_id_enabled` (y filtro `organization_id`, `role = 'RESIDENTE'`).

Es decir, la BD **no** tiene hoy columnas para:

- nombre, numero_finca, cedula_identidad  
- unit (unidad), cuota_pct  
- payment_status (Al Día / Mora)  
- habilitado_para_asamblea  
- titular_orden, etc.

Por eso el listado “completo” (con esas columnas) solo existe en **demo** (localStorage). En producción, el listado real solo muestra lo que devuelve la API (user_id, email, face_id_enabled).

---

## 3. Si se quiere que la BD coincida con el listado (instrucción para agente de BD)

Para que el listado de residentes en producción tenga los mismos datos que el demo (y que lo editado en el Admin PH quede persistido en BD), hace falta:

1. **Migración:** añadir en `users` (o en una tabla vinculada por `user_id`) columnas como:

   - `nombre` (texto, opcional)
   - `numero_finca` (texto, opcional)
   - `cedula_identidad` (texto, opcional)
   - `unit` (texto, opcional) — número de unidad
   - `cuota_pct` (numeric, opcional)
   - `payment_status` (texto: `'al_dia' | 'mora'`, opcional)
   - `habilitado_para_asamblea` (boolean, opcional)
   - `titular_orden` (integer 1 o 2, opcional)

2. **API:**  
   - **GET** `/api/admin-ph/residents`: devolver además estas columnas cuando existan.  
   - **PATCH/PUT** (o endpoints específicos) para que el Admin PH pueda actualizar estos campos al editar un residente.

3. **Seeds:**  
   - Los scripts que crean residentes demo en BD (`auth_otp_local.sql`, `seeds_residentes_demo.sql`) pueden seguir como están (solo crean usuarios con email/rol).  
   - Opcional: si se quiere que la org demo en BD también tenga datos “ricos” en esas columnas, el agente de BD puede añadir un script que actualice esos usuarios con nombre, unidad, payment_status, etc., para alinear con el comportamiento del listado demo.

**Resumen para el agente de BD:**  
- **Solo reseteo del listado demo:** no hay cambio en BD; el usuario usa el botón «Restablecer listado demo» en la UI.  
- **Que la BD coincida con el listado (producción):** hace falta migración con las columnas anteriores en `users` (o tabla asociada), actualización del GET/PATCH de residentes y, opcionalmente, seed para la org demo.

---

## 4. Migración aplicada (Database)

**Scripts creados:**

| Script | Descripción |
|--------|-------------|
| `sql_snippets/107_residents_listado_columns.sql` | Añade columnas: nombre, numero_finca, cedula_identidad, unit, cuota_pct, payment_status, habilitado_para_asamblea, titular_orden |
| `sql_snippets/seeds_residentes_listado_demo.sql` | Opcional: actualiza los 5 residentes demo con datos ricos |
| `Database_DBA/INSTRUCCIONES_CODER_RESIDENTES_LISTADO.md` | Instrucciones para Coder: GET ampliado + PATCH |

**Ejecución (BD existente):**
```bash
docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/107_residents_listado_columns.sql
docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_residentes_listado_demo.sql
```

**Orden:** 107 primero; seeds después. Coder implementa GET/PATCH según INSTRUCCIONES_CODER_RESIDENTES_LISTADO.md.
