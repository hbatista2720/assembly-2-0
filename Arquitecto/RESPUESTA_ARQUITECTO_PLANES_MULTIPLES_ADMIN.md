# Revisión Arquitecto: Consulta planes múltiples (Admin PH)

**Fecha:** Febrero 2026  
**Documento revisado:** Marketing/MARKETING_CONSULTA_PLANES_MULTIPLES_ADMIN.md  
**Destinatarios:** Contralor, Marketing, Coder (si aplican cambios)

---

## 1. Resumen de la consulta Marketing

Marketing (vía Henry) solicita definir la **regla de negocio**:

1. ¿Un admin PH puede tener **varios planes de un solo uso** a la vez (ej. 2× Evento Único)?
2. ¿Puede tener **planes de un solo uso + suscripción** (ej. Standard mensual + 1 Evento Único extra)?
3. ¿O **solo un plan activo a la vez** (cambio de plan reemplaza al anterior)?

Además: flujo de afiliación/compra (carrito unificado vs flujos separados) y combinaciones permitidas.

---

## 2. Modelo actual (recordatorio)

- **Organización** → `parent_subscription_id` → **una** suscripción (relación 1:1).
- **assembly_credits** (o equivalente) → créditos por organización, vinculados a `subscription_id`.
- Planes transaccionales: Evento Único ($225, 1 crédito), Dúo Pack ($389, 2 créditos).
- Planes suscripción: Standard, Multi-PH, Enterprise (créditos por mes, acumulables según VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md).

---

## 3. Revisión del Arquitecto – Opciones

| Opción | Descripción | Impacto técnico | Recomendación |
|--------|-------------|-----------------|---------------|
| **A** | Un solo plan activo por organización. Al cambiar de plan, el anterior se reemplaza. | Bajo. Coherente con `parent_subscription_id` 1:1. | ✅ **Recomendado para MVP** si se prioriza simplicidad y tiempo al mercado. |
| **B** | Créditos de planes de un solo uso se **suman** al plan base. Ej: Standard (2/mes) + compra 1 Evento Único = 2/mes + 1 extra. | Medio. Requiere: (1) conservar una suscripción “base” por org; (2) tabla o mecanismo para **compras puntuales** (Evento Único, Dúo Pack) que aporten créditos a la misma org; (3) lógica de consumo que sume créditos de suscripción + créditos puntuales (FIFO o regla explícita). | ✅ **Recomendado si el negocio requiere** “Standard + Evento Único extra” desde el lanzamiento. |
| **C** | Múltiples suscripciones por organización (1:N). | Alto. Implica cambiar `parent_subscription_id` por relación 1:N (ej. tabla `organization_subscriptions`), refactor de `check_plan_limits`, facturación y UI. | ❌ No recomendado para MVP; valorar en fase posterior. |

---

## 4. Decisión recomendada (Arquitecto)

### Para MVP / primera versión

- **Regla de negocio recomendada:** **Opción A** (un solo plan activo por organización) **o** **Opción B** (un plan base + créditos de pago único sumados), según decisión de Product Owner (Henry).

- **Si se elige Opción A:**  
  - No hay cambios de modelo.  
  - Comunicar a Marketing: “Un plan activo por organización; al contratar otro plan se reemplaza el actual (o se define migración explícita).”  
  - Carrito/checkout: un solo tipo de compra por flujo (suscripción **o** pago único), sin mezcla en una misma transacción si se desea mantener A estricto.

- **Si se elige Opción B:**  
  - **Regla:** Una organización tiene **una suscripción base** (recurrente: Standard, Multi-PH, etc.) y puede **comprar planes de pago único** (Evento Único, Dúo Pack) que **suman créditos** al pool de la organización.  
  - **Modelo técnico sugerido:**  
    - Mantener `organizations.parent_subscription_id` para la suscripción base.  
    - Añadir tabla **one_time_credits** (o equivalente): `organization_id`, `credits`, `plan_type` (EVENTO_UNICO | DUO_PACK), `purchased_at`, `expires_at` (opcional).  
    - Al consumir asamblea: restar primero de créditos de suscripción (FIFO por mes según assembly_credits) y luego de one_time_credits (FIFO por fecha).  
  - Carrito: permitir “suscripción + N Evento Único” en la misma compra; backend crea/actualiza suscripción base y filas en one_time_credits.

### Afiliación y carrito (consulta adicional)

- **Carrito tipo unificado:** El Arquitecto **apoya** que el usuario pueda añadir en una sola compra: suscripción + residentes adicionales + planes de pago único (Evento Único, Dúo Pack), y pagar todo junto. Facilita conversión y reduce fricción.  
- **Combinaciones:**  
  - Suscripción + residentes adicionales: ya contemplado (LIMITES_UNIDADES_POR_PLAN.md).  
  - Varios pagos únicos (ej. 2× Evento Único): **permitido** si se adopta Opción B (se registran 2 filas en one_time_credits o se suma créditos).  
  - Pago único + suscripción: **permitido** con Opción B (suscripción base + créditos extra por Evento Único/Dúo).

---

## 5. Documentación a actualizar (según decisión)

- **Si Opción A:** Actualizar Marketing/MARKETING_PRECIOS_COMPLETO.md (o doc de reglas de negocio) indicando “Un plan activo por organización; al cambiar, se reemplaza”. Opcional: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md.
- **Si Opción B:** Actualizar:
  - Arquitecto (este documento o VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md) con el diseño de one_time_credits y regla de consumo.
  - MARKETING_PRECIOS_COMPLETO.md (o equivalente) con la regla “Suscripción base + compras Evento Único/Dúo Pack suman créditos”.
  - Contralor: asignar al Coder tareas de BD (tabla one_time_credits), API de compra y lógica de consumo de créditos.

---

## 6. Próximos pasos

1. **Contralor / Henry:** Decidir Opción A u Opción B para MVP.  
2. **Contralor:** Comunicar la decisión a Marketing y, si aplica, al Coder (con referencia a este documento y a MARKETING_CONSULTA_PLANES_MULTIPLES_ADMIN.md).  
3. **Arquitecto:** Si se aprueba Opción B, detallar en un anexo o documento técnico el esquema de `one_time_credits` y la lógica de consumo (FIFO suscripción + puntuales).

---

**Referencias:**  
- Marketing/MARKETING_CONSULTA_PLANES_MULTIPLES_ADMIN.md  
- Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md  
- Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md  
- Arquitecto/LIMITES_UNIDADES_POR_PLAN.md  
- sql_snippets/schema_subscriptions_base.sql
