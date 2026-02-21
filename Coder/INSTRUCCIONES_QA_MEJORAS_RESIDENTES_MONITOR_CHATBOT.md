# Instrucciones Coder: Mejoras Residentes ↔ Monitor y Chatbot (QA)

**Fecha:** 13 Febrero 2026  
**Origen:** QA ejecutó plan QA/PLAN_PRUEBAS_RESIDENTES_MONITOR_SINCRONIZACION.md  
**Ref:** QA/QA_FEEDBACK.md § "QA Ejecución · Sincronización Residentes ↔ Monitor y Chatbot"

---

## Resumen QA

- **Sincronización Propietarios ↔ Monitor:** ✅ OK – Unidades 1–50, estatus Al Día/Mora, nombres. Misma fuente (localStorage assembly_demo_residents).
- **Chatbot residentes demo:** ❌ GAP – Solo reconoce residente1@…residente5@ (DEMO_RESIDENT_EMAILS). Residentes agregados en Propietarios demo no son reconocidos.

---

## Mejora 1: Chatbot reconozca residentes de Propietarios demo (PRIORIDAD ALTA)

**Problema:** El Admin PH agrega residentes en Propietarios (modo demo). Esos residentes están en `assembly_demo_residents` (localStorage). El chatbot valida contra `DEMO_RESIDENT_EMAILS` (hardcoded 1–5) y `assembly_users`. No consulta `assembly_demo_residents`.

**Solución:** En contexto demo (demo@assembly2.com u org demo), además de DEMO_RESIDENT_EMAILS y assembly_users, validar contra los correos de `getDemoResidents()`.

**Archivos afectados:**
- `src/app/page.tsx` – flujo residente en landing/chatbot
- `src/app/chat/page.tsx` – flujo residente en chat full-screen

**Implementación sugerida:**
1. Importar `getDemoResidents` y `isDemoResidentsContext` desde `lib/demoResidentsStore`.
2. Cuando `isDemoResidentsContext()` sea true, obtener `getDemoResidents().map(r => r.email)`.
3. Si el email introducido por el usuario está en esa lista (o en DEMO_RESIDENT_EMAILS o assembly_users), considerarlo reconocido.

```ts
// Ejemplo (pseudocódigo)
const demoEmails = isDemoResidentsContext()
  ? getDemoResidents().map(r => r.email?.toLowerCase()).filter(Boolean)
  : [];
const recognized = 
  DEMO_RESIDENT_EMAILS.includes(emailLower) ||
  existingUsers.some(u => u.email?.toLowerCase() === emailLower) ||
  demoEmails.includes(emailLower);
```

---

## Mejora 2 (opcional): Unidades vacías en Monitor

**Comportamiento actual:** Si se elimina un residente en Propietarios (ej. Unidad 10), la unidad 10 sigue visible en el Monitor con "Residente 10" por defecto (API siempre devuelve 50 unidades).

**Posible mejora:** Si se desea que unidades sin residente no aparezcan o se marquen como "Vacía", habría que:
- O bien filtrar en el Monitor las unidades que no tienen residente en getDemoResidents().
- O bien que la API /api/monitor/units acepte una lista de unidades activas (más complejo).

**Prioridad:** Baja. Documentar decisión de producto.

---

## Orden de implementación

1. **Mejora 1** – Chatbot reconozca residentes demo de Propietarios. Coder informa al Contralor al finalizar.
2. **Mejora 2** – Pendiente de decisión Contralor/Henry.
