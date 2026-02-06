# Instrucciones Coder: API Registro de Abandono de Sala (§E)

**Fecha:** Febrero 2026  
**Database:** DBA  
**Referencia:** QA/QA_FEEDBACK.md "QA Validación · Registro de abandono de sala (§E)"

---

## Tabla creada

**Nombre:** `resident_abandon_events`  
**Script:** `sql_snippets/100_resident_abandon_events.sql`

### Columnas

| Columna | Tipo | NOT NULL | Descripción |
|---------|------|----------|-------------|
| `id` | UUID | PK | Auto-generado |
| `user_id` | UUID | Sí | FK users(id) – residente que abandonó |
| `assembly_id` | UUID | No | ID de asamblea/votación (si aplica) |
| `organization_id` | UUID | Sí | FK organizations(id) – org del residente |
| `abandoned_at` | TIMESTAMPTZ | Sí | Hora de abandono (DEFAULT NOW()) |
| `resident_name` | TEXT | No | Nombre para display ("Residente [nombre] abandonó") |
| `unit` | TEXT | No | Unidad/código (ej. "A-402") |
| `created_at` | TIMESTAMPTZ | No | DEFAULT NOW() |

### Índices

- `idx_resident_abandon_events_user` (user_id)
- `idx_resident_abandon_events_assembly` (assembly_id)
- `idx_resident_abandon_events_organization` (organization_id)
- `idx_resident_abandon_events_abandoned_at` (abandoned_at DESC)

---

## API a implementar

### `POST /api/resident-abandon`

**Body (JSON):**
```json
{
  "user_id": "uuid",
  "assembly_id": "uuid | null",
  "organization_id": "uuid",
  "resident_name": "string | null",
  "unit": "string | null"
}
```

**Comportamiento:**
- Inserta en `resident_abandon_events` con `abandoned_at = NOW()`
- `user_id`, `organization_id` obligatorios (del residente logueado)
- `assembly_id` opcional (si el residente está en una asamblea/votación específica)
- `resident_name`, `unit` opcionales (se pueden obtener de users o contexto)

**Respuesta 200:**
```json
{
  "success": true,
  "id": "uuid",
  "abandoned_at": "2026-02-06T12:00:00.000Z"
}
```

**Respuesta 400:** body inválido  
**Respuesta 401:** no autenticado  
**Respuesta 500:** error BD

---

## Flujo esperado (según QA)

1. Residente en chatbot/votación hace clic en **"Cerrar sesión"**
2. Alerta: "Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?"
3. Si confirma → llamar `POST /api/resident-abandon` con datos del residente
4. Limpiar sesión
5. Admin PH ve en monitor/vista asamblea: "Residente [nombre/unidad] abandonó la sala a las [hora]"

---

## Consulta para Admin PH (listar abandonos por asamblea)

```sql
SELECT rae.id, rae.user_id, rae.resident_name, rae.unit, rae.abandoned_at, u.email
FROM resident_abandon_events rae
JOIN users u ON u.id = rae.user_id
WHERE rae.assembly_id = $assemblyId
ORDER BY rae.abandoned_at DESC;
```

O por organización:
```sql
WHERE rae.organization_id = $organizationId
ORDER BY rae.abandoned_at DESC;
```

---

## Ejecutar script en BD existente

```bash
docker compose exec postgres psql -U postgres -d assembly -f /ruta/sql_snippets/100_resident_abandon_events.sql
```

O desde host (copiando contenido):
```bash
docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/100_resident_abandon_events.sql
```
