# Instrucciones Coder: assembly-context desde BD

**Fecha:** Febrero 2026  
**Referencia:** Script 102_demo_ph_a_ph_b_assemblies.sql

---

## Datos en BD

Tras ejecutar `sql_snippets/102_demo_ph_a_ph_b_assemblies.sql`:

| PH | Org | Residentes | Asamblea | status | Votación |
|----|-----|------------|----------|--------|----------|
| **PH A** | Demo - P.H. Urban Tower (11111111...) | residente1-5@demo.assembly2.com | Asamblea Ordinaria Demo 2026 | `active` | ✅ Abierta |
| **PH B** | P.H. Torres del Pacífico (22222222...) | residente1-3@torresdelpacifico.com | Asamblea Ordinaria Torres 2026 | `scheduled` | ❌ Solo programada |

---

## API a actualizar

**Archivo:** `src/app/api/assembly-context/route.ts`

**Comportamiento deseado:**

1. Si existe `?profile=activa|programada|sin_asambleas` → usar ese valor (override demo).
2. Si existe `?organization_id=xxx` (sin profile) → consultar BD:
   - `SELECT status FROM assemblies WHERE organization_id = $1 AND status IN ('active','scheduled') ORDER BY scheduled_at DESC LIMIT 1`
   - `active` → `{ context: "activa" }`
   - `scheduled` → `{ context: "programada" }`
   - Sin filas → `{ context: "sin_asambleas" }`
3. Sin params → default `"activa"` (comportamiento actual).

**Query ejemplo:**
```sql
SELECT status FROM assemblies 
WHERE organization_id = $1::uuid 
  AND status IN ('active', 'scheduled')
ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, scheduled_at DESC 
LIMIT 1;
```

---

## Emails de prueba

| PH | Admin | Residentes |
|----|-------|------------|
| PH A | demo@assembly2.com | residente1@demo.assembly2.com … residente5@demo.assembly2.com |
| PH B | admin@torresdelpacifico.com | residente1@torresdelpacifico.com … residente3@torresdelpacifico.com |

---

## Validación: usuarios existen y están asociados

| Usuario | Script donde se crea | Organización (PH) | Rol |
|--------|----------------------|-------------------|-----|
| residente1@demo.assembly2.com | `auth_otp_local.sql`, `seeds_residentes_demo.sql` | 11111111-1111-1111-1111-111111111111 (PH A – Demo) | RESIDENTE |
| residente2@demo.assembly2.com | idem | PH A | RESIDENTE |
| residente3@demo.assembly2.com | idem | PH A | RESIDENTE |
| residente4@demo.assembly2.com | idem | PH A | RESIDENTE |
| residente5@demo.assembly2.com | idem | PH A | RESIDENTE |
| residente1@torresdelpacifico.com | `102_demo_ph_a_ph_b_assemblies.sql` | 22222222-2222-2222-2222-222222222222 (PH B – Torres) | RESIDENTE |
| residente2@torresdelpacifico.com | idem | PH B | RESIDENTE |
| residente3@torresdelpacifico.com | idem | PH B | RESIDENTE |

- **PH A (residente1-5@demo.assembly2.com):** creados en `auth_otp_local.sql` (init Docker) y/o `seeds_residentes_demo.sql`. Asociados a org Demo - P.H. Urban Tower.
- **PH B (residente1-3@torresdelpacifico.com):** creados en `102_demo_ph_a_ph_b_assemblies.sql`. Ejecutar ese script para que existan en BD; asociados a org P.H. Torres del Pacífico.

Lista completa de usuarios demo (admins + residentes): **docs/USUARIOS_DEMO_BD.md**.

---

## Ejecutar script

```bash
docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/102_demo_ph_a_ph_b_assemblies.sql
```
