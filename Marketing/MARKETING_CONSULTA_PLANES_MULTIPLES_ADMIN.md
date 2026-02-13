# 📋 Consulta: ¿Un admin puede tener varios planes (un solo uso + suscripción)?

**Fecha:** Febrero 2026  
**Responsable:** Marketing B2B  
**Destinatarios:** Contralor, Arquitecto  
**Origen:** Henry

---

## 🎯 PREGUNTA DE NEGOCIO

**¿Un administrador PH puede tener simultáneamente:**

1. **Varios planes de un solo uso** (ej. 2× Evento Único comprados en momentos distintos)?
2. **Planes de un solo uso + planes de suscripción** (ej. Standard mensual + 1 Evento Único extra)?
3. **Solo un plan activo a la vez** (si compra Evento Único y luego Standard, el primero se reemplaza)?

---

## 📊 MODELO ACTUAL (según documentación)

- **Organización** → `parent_subscription_id` → **una** suscripción
- **assembly_credits** → créditos por organización, vinculados a `subscription_id`
- Planes transaccionales: Evento Único ($225, 1 crédito), Dúo Pack ($389, 2 créditos)
- Planes suscripción: Standard ($189/mes, 2/mes acumulables), Multi-PH, etc.

**Interpretación actual:** Cada organización está vinculada a **una suscripción**. No está definido explícitamente si:
- Se pueden tener **múltiples compras** de Evento Único acumuladas.
- Se pueden **combinar** créditos de Evento Único con créditos de Standard.

---

## 💡 OPCIONES PARA DEFINIR

| Opción | Descripción | Impacto técnico |
|--------|-------------|-----------------|
| **A** | Un solo plan activo por organización. Al cambiar de plan, el anterior se reemplaza. | Bajo. Ya parece ser el modelo implícito. |
| **B** | Créditos de planes de un solo uso se suman. Ej: Standard + compra de 1 Evento Único = 2/mes + 1 extra. | Medio. Requiere lógica para sumar créditos de múltiples orígenes (subscription_id). |
| **C** | Múltiples suscripciones por organización: ej. 1 Standard + 1 Evento Único activos a la vez. | Alto. Cambio de modelo: `parent_subscription_id` → relación 1:N (org tiene varias subscriptions). |

---

## 📌 SOLICITUD

**Marketing solicita al Arquitecto y al Contralor:**

1. **Definir la regla de negocio:** ¿El admin puede tener varios planes (un solo uso y/o suscripción) activos a la vez?
2. **Documentar** la decisión en un documento de Arquitecto (o actualizar VALIDACION_FASE08_PRECIOS_V4.md / MARKETING_PRECIOS_COMPLETO.md).
3. **Comunicar** al Coder si hay cambios en el modelo actual.

---

## 📋 CONSULTA ADICIONAL – Afiliación y carrito de compra (Henry)

**¿Cómo debe funcionar el flujo de afiliación/compra?**

1. **¿La afiliación debe ser tipo carrito de compra?**
   - ¿El usuario puede añadir al carrito: suscripción + residentes adicionales + planes de pago único, y pagar todo junto?

2. **¿Qué combinaciones se permiten?**
   | Combinación | ¿Permitido? | Notas |
   |-------------|-------------|-------|
   | Suscripción + residentes adicionales | ✅ Ya documentado | LIMITES_UNIDADES_POR_PLAN.md |
   | Varios pagos únicos (ej. 2× Evento Único) | ¿? | Pendiente definir |
   | Pago único + suscripción | ¿? | Ej: Standard mensual + 1 Evento Único extra |

3. **Solicitud:** Definir reglas para:
   - Flujo tipo carrito (checkout unificado) o flujos separados por tipo de plan
   - Combinaciones permitidas: solo suscripción, solo pagos únicos, o ambos simultáneos

---

---

## 📌 RESPUESTA DEL ARQUITECTO

**Revisión:** Arquitecto ha revisado esta consulta y documentado la respuesta en:

**Arquitecto/RESPUESTA_ARQUITECTO_PLANES_MULTIPLES_ADMIN.md**

Resumen: Recomendación **Opción A** (un plan activo por org) para MVP simple, o **Opción B** (suscripción base + créditos de pago único sumados) si el negocio requiere “Standard + Evento Único extra”. Carrito unificado apoyado por Arquitecto. Contralor/Henry deben decidir A o B; luego documentar y, si aplica, asignar al Coder.

---

**Referencias:**
- Marketing/MARKETING_PRECIOS_COMPLETO.md
- Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md
- Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md
- Arquitecto/RESPUESTA_ARQUITECTO_PLANES_MULTIPLES_ADMIN.md
- sql_snippets/schema_subscriptions_base.sql
