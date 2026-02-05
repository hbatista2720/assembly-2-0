# ✅ VALIDACIÓN: PASARELAS DE PAGO CON RETIRO EN PANAMÁ
## FASE 09 - Métodos de Pago (Actualización Feb 2026)

**Fecha:** Febrero 2026  
**Motivo:** Stripe **no permite retiros (payouts) en Panamá**. El negocio opera en Panamá; Henry debe poder retirar fondos a cuenta local.

---

## 🚨 STRIPE: NO USAR PARA ASSEMBLY 2.0

| Criterio | Stripe |
|----------|--------|
| **Cobro (checkout)** | ✅ Sí, acepta tarjetas |
| **Retiro / Payout en Panamá** | ❌ **NO** – Panamá no está en la lista de países soportados para recibir pagos como merchant |
| **Conclusión** | **QUITAR** de la pasarela principal. No usar para FASE 09. |

**Fuente:** Documentación Stripe (Cross-border payouts, Global Payouts). Panamá no figura como país soportado para recibir liquidaciones.

---

## ✅ PASARELAS QUE SÍ PERMITEN RETIRO EN PANAMÁ

### 1. **PayPal**

| Criterio | PayPal |
|----------|--------|
| **Cobro** | ✅ Tarjetas, PayPal balance |
| **Retiro en Panamá** | ✅ **SÍ** – Transferencia a bancos locales (MetroBank, etc.), cuentas US, Nequi |
| **API** | ✅ REST, SDK (Node.js) |
| **Suscripciones** | ✅ Billing Plans / Subscriptions |
| **Recomendación** | **PRINCIPAL** para pago automático con tarjeta (reemplazo de Stripe) |

---

### 2. **Tilopay**

| Criterio | Tilopay |
|----------|--------|
| **Cobro** | ✅ Tarjetas, débito, transferencias, pagos móviles |
| **Retiro en Panamá** | ✅ **SÍ** – Opera en Panamá; liquidaciones en moneda local |
| **API** | ✅ API, SDK, sandbox para pruebas |
| **Suscripciones** | ✅ Cobros recurrentes |
| **Recomendación** | **PRINCIPAL** para tarjetas locales y Centroamérica |

---

### 3. **Yappy (Banco General)**

| Criterio | Yappy |
|----------|--------|
| **Cobro** | ✅ Botón de Pago, API (Node, PHP, .NET) |
| **Retiro en Panamá** | ✅ **SÍ** – Solución local; fondos a cuenta Banco General |
| **API** | ✅ Portal desarrolladores, credenciales comercio |
| **Suscripciones** | ⚠️ Más orientado a pagos únicos; recurrentes vía integración |
| **Recomendación** | **Mantener** para pago manual / Yappy (ya contemplado) |

---

### 4. **Manual (ACH / Transferencia bancaria)**

| Criterio | Manual |
|----------|--------|
| **Cobro** | Cliente paga fuera de plataforma |
| **Retiro** | ✅ Henry recibe directo en su cuenta en Panamá |
| **Recomendación** | **Mantener** para ACH y transferencia (flujo manual). |

---

## 📋 MATRIZ FINAL RECOMENDADA (FASE 09)

| Método | Retiro en Panamá | Uso en Assembly 2.0 |
|--------|-------------------|----------------------|
| **PayPal** | ✅ Sí | ✅ Principal – TC y suscripciones automáticas |
| **Tilopay** | ✅ Sí | ✅ Principal – TC y suscripciones (local/CA) |
| **Yappy** | ✅ Sí | ✅ Manual / botón Yappy |
| **ACH / Transferencia** | ✅ Sí | ✅ Manual (flujo actual) |
| **Stripe** | ❌ No | ❌ **QUITAR** – no retiros en Panamá |

---

## 🛠️ CAMBIOS EN IMPLEMENTACIÓN

1. **Quitar Stripe** de FASE 7/9: no código nuevo ni webhooks de Stripe.
2. **Principal automático:** PayPal y/o Tilopay (checkout + suscripciones).
3. **Mantener:** Yappy (manual/API), ACH, transferencia bancaria.
4. **BD:** Reemplazar campos `stripe_*` por `paypal_*` y `tilopay_*` (o tablas neutras `payment_provider`, `external_subscription_id`, etc.).
5. **Docs y Contralor:** Referencias a “Stripe” sustituidas por PayPal/Tilopay según lo anterior.

---

## 📚 REFERENCIAS

- Stripe: [Cross-border payouts - Supported countries](https://docs.stripe.com/connect/cross-border-payouts#supported-countries)
- PayPal: [Withdrawal options Panama](https://www.paypal.com/pa/webapps/mpp/withdrawal-options), [Country feature support (Payouts)](https://developer.paypal.com/docs/payouts/standard/reference/country-feature/)
- Tilopay: [tilopay.com](https://tilopay.com), documentación API
- Yappy: [yappy.com.pa/comercial/desarrolladores](https://yappy.com.pa/comercial/desarrolladores)

---

**Resumen:** Stripe se quita; pasarelas con retiro en Panamá para FASE 09: **PayPal**, **Tilopay**, **Yappy** y **manual (ACH/transferencia)**.
