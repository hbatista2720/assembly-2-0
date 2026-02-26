# Validación de suscripción por fase (Wizard Proceso de Asamblea)

**Origen:** Henry (Product Owner)  
**Fecha:** Febrero 2026  
**Pregunta:** ¿En qué fase se valida la suscripción? El demo solo debe permitir 1 PH con 50 residentes y 1 crédito para asamblea de prueba (expira 15 días). ¿Cuándo se detecta la suscripción? Para crear asambleas debe tener crédito disponible según la suscripción.

---

## Resumen

| Momento | Qué se valida | Demo |
|---------|---------------|------|
| **Crear PH** (formulario) | Límite de organizaciones/PHs | Máx. 1 PH |
| **Fase 1: Residentes** | Límite de unidades/residentes | Máx. 50 |
| **Fase 2: Crear asamblea** | **Crédito disponible** para asamblea | Máx. 1 crédito |
| **Fase 2: Crear asamblea** | Crédito no expirado | Expira en 15 días |

---

## Flujo propuesto

```
1. Crear PH (formulario)
   └─ Validar: ¿Puede crear más PHs? (demo: no, ya tiene 1)
   
2. Dashboard PH habilitado → Módulo Proceso de Asamblea visible

3. Proceso de Asamblea – Fase 1: Residentes
   └─ Validar: ¿Puede agregar más residentes? (demo: máx. 50)
   
4. Proceso de Asamblea – Fase 2: Crear asamblea  ← CLAVE
   └─ Validar: ¿Tiene crédito disponible? (demo: 1 crédito, expira 15 días)
   └─ Si no tiene crédito: bloquear botón "Crear" y mostrar "Subir a plan real" o "Sin créditos"
   
5. Fases 3, 4, 5: Agendar, Monitor, Finalizar
   └─ No validan suscripción adicional (la asamblea ya fue creada con crédito consumido)
```

---

## Fase donde se detecta la suscripción

**La suscripción se detecta desde el login** (organización → `subscription_id`). En el dashboard y en el wizard se usa:

- `subscriptionId` (desde `localStorage` o contexto) → para `GET /api/subscription/:id/limits`
- `organizationId` → para `GET /api/assembly-credits/:orgId` (créditos disponibles)

**La validación de créditos se ejecuta en la Fase 2 (Crear asamblea):**

- Antes de permitir "Guardar asamblea" o "Siguiente" hacia Fase 3: consultar créditos disponibles.
- Si `total_available < 1` → bloquear creación y mostrar mensaje: "No tienes créditos disponibles. [Subir a plan real]".
- En demo: 1 crédito disponible; al crear la asamblea se consume; no puede crear otra hasta subir de plan.

---

## Reglas demo (Henry)

| Concepto | Valor |
|----------|-------|
| PHs permitidos | 1 |
| Residentes máximos | 50 |
| Créditos para asamblea | 1 |
| Vigencia del crédito | 15 días |

**Nota:** El `DEMO_LIMITS` actual en `src/app/api/subscription/[subscriptionId]/limits/route.ts` tiene `assemblies: { current: 2, limit: 2 }`. Para cumplir la regla de Henry debería ser `limit: 1` (1 crédito = 1 asamblea de prueba). **Coder:** corregir si el demo debe tener solo 1 asamblea/crédito.

---

## Implementación sugerida (para Coder)

### En Crear PH (formulario)

- Antes de guardar: llamar `GET /api/subscription/:subscriptionId/limits`.
- Si `organizations.exceeded` o `organizations.current >= organizations.limit` → bloquear "Guardar propiedad" y mostrar "Límite de PHs alcanzado. [Modificar suscripción]".
- Demo: `organizations.limit = 1` → si ya tiene 1 PH, no puede crear más.

### En Fase 1: Residentes (wizard)

- Al agregar residente: validar `units.current < units.limit` (demo: 50).
- Si se supera: bloquear "+ Agregar" y mostrar mensaje de límite.

### En Fase 2: Crear asamblea (wizard) – OBLIGATORIO

- Al cargar el paso o al hacer clic en "Guardar y continuar":
  - Llamar `GET /api/assembly-credits/:organizationId`.
  - Si `total_available < 1` → bloquear el botón de crear/continuar.
  - Mostrar: "No tienes créditos disponibles para crear una asamblea. [Ver suscripción]".
- Al crear la asamblea (submit): el backend `POST /api/assemblies` debe consumir 1 crédito (FIFO) y validar que exista antes de insertar.
- Demo: 1 crédito disponible; al crear la primera asamblea se consume; la segunda creación debe fallar hasta "subir a plan real".

### En Módulo Asambleas (acceso directo, sin wizard)

- Igual lógica: antes de abrir el formulario "Crear asamblea", validar créditos. Si no hay, deshabilitar el botón y mostrar mensaje.

---

## Resumen para el Coder

| Ubicación | Validación |
|-----------|------------|
| Formulario Crear PH | Límite organizaciones (`limits.organizations`) |
| Wizard Fase 1 (Residentes) | Límite unidades (`limits.units`) |
| **Wizard Fase 2 (Crear asamblea)** | **Créditos disponibles** (`GET /api/assembly-credits`) + consumo en `POST /api/assemblies` |
| Módulo Asambleas (Crear asamblea) | Idem Fase 2 |

---

## Corrección demo

- Demo: `assemblies.limit = 1` (1 crédito).
- Crédito demo: expira en 15 días (definir en `organization_credits` o en la lógica de seeds para org demo).
- Si el usuario demo ya creó 1 asamblea (crédito consumido): no puede crear otra; debe ver "Subir a plan real".

---

*Marketing documenta; Contralor prioriza; Coder implementa. Referencia: Coder/INSTRUCCIONES_CODER_WIZARD_PROCESO_ASAMBLEA.md, docs/LOGICA_DEMO_CLIENTE_NUEVO_CHATBOT.md.*
