# 📋 Reporte: Usuarios Demo para Dashboard Admin PH (por Plan)

**Fecha:** 26 Enero 2026  
**Para:** Contralor, Henry (Product Owner), QA  
**Objetivo:** Validar que tengamos **un usuario Admin PH por cada plan** para probar funcionalidad y límites en el Dashboard Admin PH.

**Estado:** Los usuarios demo están listos para validar funcionalidad y límites del Dashboard Admin PH. **QA** ejecuta las pruebas según **QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md** (navegación 2.1–2.9 por usuario, validación de límites por plan, botones principales). Reportar resultado en QA/QA_FEEDBACK.md e informar al Contralor.

---

## 1. Estado actual (BD verificada)

### Organizaciones existentes

| ID | Nombre | is_demo |
|----|--------|---------|
| `11111111-...` | Demo - P.H. Urban Tower | true |
| `22222222-...` | P.H. Torres del Pacífico | true |

### Usuarios Admin PH existentes

| Email | Organización | Plan asignado |
|-------|--------------|---------------|
| demo@assembly2.com | Demo - P.H. Urban Tower | **ninguno** (falta `subscriptions`) |
| admin@torresdelpacifico.com | P.H. Torres del Pacífico | **ninguno** (falta `subscriptions`) |

### ⚠️ Hallazgo

- **No existe la tabla `subscriptions`** en la BD actual.
- Las funciones `check_plan_limits()`, `is_unlimited_plan()` referencian esa tabla.
- Las migraciones 009–011 (credits, payment, demo sandbox) no se han ejecutado o fallan porque dependen de `subscriptions`.

---

## 2. Planes a probar (según LIMITES_UNIDADES_POR_PLAN)

| Plan | Unidades incluidas | Usuario demo necesario |
|------|--------------------|------------------------|
| **DEMO** | 50 | demo@assembly2.com |
| **STANDARD** | 250 | admin@torresdelpacifico.com (reutilizar) |
| **MULTI_PH_LITE** | 1.500 (cartera) | **CREAR** multilite@demo.assembly2.com |
| **MULTI_PH_PRO** | 5.000 (cartera) | **CREAR** multipro@demo.assembly2.com |
| **ENTERPRISE** | Ilimitado | **CREAR** enterprise@demo.assembly2.com |

---

## 3. Usuarios que necesitamos

| # | Plan | Email | Organización | Estado |
|---|------|-------|--------------|--------|
| 1 | DEMO | demo@assembly2.com | Demo - P.H. Urban Tower | ✅ Existe |
| 2 | STANDARD | admin@torresdelpacifico.com | P.H. Torres del Pacífico | ✅ Existe |
| 3 | MULTI_PH_LITE | multilite@demo.assembly2.com | P.H. Multi-Lite Demo | ❌ Crear |
| 4 | MULTI_PH_PRO | multipro@demo.assembly2.com | P.H. Multi-Pro Demo | ❌ Crear |
| 5 | ENTERPRISE | enterprise@demo.assembly2.com | P.H. Enterprise Demo | ❌ Crear |

**Total:** 2 existentes + 3 a crear = **5 usuarios Admin PH** (uno por plan).

---

## 4. Casos de prueba por plan

| Plan | Prueba | Resultado esperado |
|------|--------|--------------------|
| DEMO | Agregar >50 unidades o >2 asambleas/mes | Bloqueado con mensaje de límite |
| STANDARD | Agregar >250 unidades | Bloqueado o modal de compra adicional |
| MULTI_PH_LITE | Suma cartera >1.500 unidades | Bloqueado |
| MULTI_PH_PRO | Suma cartera >5.000 unidades | Bloqueado |
| ENTERPRISE | Agregar muchas unidades | Sin límite (permite) |

---

## 5. Tareas asignadas

### Database

1. Ejecutar `sql_snippets/schema_subscriptions_base.sql` (crear tabla `subscriptions` si no existe).
2. Ejecutar `sql_snippets/106_usuarios_demo_por_plan.sql` para:
   - Crear suscripciones demo por plan.
   - Vincular PH A y PH B a sus suscripciones.
   - Crear 3 orgs nuevas (PH C, D, E) y 3 usuarios Admin PH (multilite@, multipro@, enterprise@).

### QA

- **Plan de pruebas:** QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md (indicaciones completas).
- Tras aplicar los scripts por Database, validar login con cada uno de los 5 correos y redirección a `/dashboard/admin-ph`.
- Fase 1: Navegación 2.1–2.9 (Resumen, Propietarios, Asambleas, Votaciones, Actas, Reportes, Equipo, Configuración, Soporte) por cada usuario.
- Fase 2: Validación de límites por plan (DEMO 50, STANDARD 250, MULTI_PH_LITE 1.500, MULTI_PH_PRO 5.000, ENTERPRISE ilimitado).
- Fase 3: Botones principales (Agregar propietario, Nueva asamblea, Generar acta, Exportar).
- Reportar en QA/QA_FEEDBACK.md § "Pruebas Dashboard Admin PH – usuarios demo por plan". Informar al Contralor al finalizar.

### Contralor

- Validar que este reporte se cumpla tras la ejecución de Database.
- Autorizar backup si procede.

---

## 6. Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `sql_snippets/schema_subscriptions_base.sql` | Crea tabla `subscriptions` con columnas mínimas para check_plan_limits, is_unlimited_plan. |
| `sql_snippets/106_usuarios_demo_por_plan.sql` | Seeds: suscripciones + orgs + usuarios Admin PH por plan. |

**Orden de ejecución:** `schema_subscriptions_base.sql` → `106_usuarios_demo_por_plan.sql`.

---

**Fin del reporte**
