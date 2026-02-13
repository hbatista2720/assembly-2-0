# Instrucciones Coder: Listado de residentes – GET ampliado y PATCH

**Fecha:** Febrero 2026  
**Contexto:** Migración 107_residents_listado_columns.sql añade columnas en `users` para que producción tenga los mismos campos que el listado demo. El Coder debe actualizar la API.

**Referencia:** Database_DBA/INSTRUCCIONES_LISTADO_RESIDENTES_BD.md §3

---

## 1. GET `/api/admin-ph/residents`

**Actual:** devuelve `user_id`, `email`, `face_id_enabled`.

**Ampliar:** incluir las nuevas columnas cuando existan:

```ts
// Columnas a añadir en el SELECT y en el mapeo de respuesta:
nombre, numero_finca, cedula_identidad, unit, cuota_pct,
payment_status, habilitado_para_asamblea, titular_orden
```

**Respuesta esperada (ejemplo):**
```json
{
  "residents": [
    {
      "user_id": "uuid",
      "email": "residente1@demo.assembly2.com",
      "face_id_enabled": true,
      "nombre": "Residente Urban 1",
      "numero_finca": "96001",
      "cedula_identidad": null,
      "unit": "101",
      "cuota_pct": 2.5,
      "payment_status": "al_dia",
      "habilitado_para_asamblea": true,
      "titular_orden": 1
    }
  ]
}
```

---

## 2. PATCH `/api/admin-ph/residents/[userId]` (nuevo endpoint)

Crear ruta para que el Admin PH pueda editar los campos del residente.

**Método:** `PATCH`  
**Path:** `/api/admin-ph/residents/[userId]/route.ts` (o equivalente)

**Body (todos opcionales):**
```json
{
  "nombre": "string",
  "numero_finca": "string",
  "cedula_identidad": "string",
  "unit": "string",
  "cuota_pct": number | null,
  "payment_status": "al_dia" | "mora",
  "habilitado_para_asamblea": boolean,
  "titular_orden": 1 | 2 | null
}
```

**Reglas:**
- Si `payment_status === "mora"` → forzar `habilitado_para_asamblea = false`.
- Solo actualizar columnas presentes en el body (no sobrescribir con null salvo que se envíe explícitamente).
- Validar que el usuario pertenezca a la org del Admin PH (autorización).

**Respuesta:** `{ "success": true }` o error 4xx/5xx.

---

## 3. Integración con owners/page.tsx

La UI de Propietarios ya maneja estos campos en modo demo (localStorage). Tras estas APIs:

- Si `isDemoResidentsContext()` → seguir usando localStorage (comportamiento actual).
- Si no es demo → consumir GET con todos los campos y usar PATCH al editar (modal de edición).

El Coder debe conectar el flujo de edición en producción a `PATCH /api/admin-ph/residents/[userId]`.

---

## Orden de implementación

1. Database ejecuta `107_residents_listado_columns.sql`.
2. Coder amplía GET `/api/admin-ph/residents`.
3. Coder crea PATCH `/api/admin-ph/residents/[userId]`.
4. Coder conecta UI de edición en owners/page.tsx para producción.
