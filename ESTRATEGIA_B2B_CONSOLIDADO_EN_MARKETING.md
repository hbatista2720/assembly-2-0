# 💎 ESTRATEGIA B2B Y PRECIOS PREMIUM (2026)
**Assembly 2.0 - Seguridad Jurídica y Posicionamiento de Valor**

---

## 🏛️ ZONA DEL ARQUITECTO (Para Actualización de Lógica)
*Arquitecto: Por favor, integra estas nuevas tarifas y reglas de negocio en la lógica de suscripciones y el sistema anti-abuso.*

### **1. Modelos Transaccionales (Pago por Uso)**
Ideal para PHs independientes o autogestionados.

1. **Evento Único:** **$225**
   - **Base:** 1 crédito de asamblea (válido 12 meses).
   - **Residentes:** Hasta 250 unidades (+$50 por cada 100 adicionales).
   - **CRM:** No incluido.
2. **Dúo Pack:** **$389**
   - **Base:** 2 créditos de asamblea (válidos 12 meses).
   - **Residentes:** Hasta 250 unidades por asamblea (+$50 por cada 100 adicionales).
   - **Ahorro:** ~15% vs Evento Único.

### **2. Modelos de Suscripción (Recurrente)**
Ideal para Administradoras y Promotoras.

3. **Plan Standard:** **$189/mes** (Base)
   - **Base de Residentes:** Hasta 250 unidades incluidas (+$50 por bloque de 100 adicionales).
   - **Sistema de Créditos:** 2 créditos/asamblea al mes (acumulables por 6 meses).
   - **Compromiso Mínimo:** 2 meses obligatorios.
4. **Plan Multi-PH:** **$699/mes**
   - **Propiedades:** Hasta 30 edificios gestionados.
   - **Asambleas:** ILIMITADAS (No aplica sistema de créditos).
   - **Tope de Residentes:** Hasta 5,000 unidades totales en la cartera.
   - **CRM Básico:** Historial de residentes y trazabilidad.
5. **Plan Enterprise:** **$2,499/mes**
   - **Proyectos:** Unidades y propiedades ilimitadas.
   - **CRM Avanzado:** Sistema de Tickets automático por voto negativo + Análisis de Sentimiento.
   - **Integración:** API abierta para conexión con ERP/CRM de la promotora.

---

### **Tabla de Límites y Jerarquía:**

| Plan | Inversión | Residentes (Tope) | CRM | Modelo |
|------|-----------|-------------------|-----|--------|
| **Evento Único** | $225 | 250 x Asamblea | ❌ | Transaccional |
| **Dúo Pack** | $389 | 250 x Asamblea | ❌ | Transaccional |
| **Standard** | $189/mes | 250 x Propiedad | ❌ | Suscripción |
| **Multi-PH** | $699/mes | 5,000 (Cartera) | 🟢 Básico | Gestión |
| **Enterprise** | $2,499/mes | Ilimitado | 💎 Full | Estratégico |

---

## 🚨 ESTRATEGIA ANTI-ABUSO (Refinada)

### **Problema de Abuso "Standard":**
Evitar que el cliente use el valor de $450 (3 asambleas) pagando solo $99 (antiguo precio).

### **Solución Implementada:**
- **Compromiso Mínimo:** 2 meses obligatorios para el Plan Standard ($378 total).
- **Control de Volumen:** Solo 2 asambleas incluidas en Standard. La 3ra se cobra como crédito extra ($75).
- **Anclaje:** El **Evento Único a $225** hace que la suscripción de $189 sea la opción lógica para cualquiera que necesite más de una reunión.

---

## 📊 ANÁLISIS DE VALOR Y ROI (Marketing de Landing Page)
*Instrucción para el Coder: Implementar una sección de "Calculadora de Retorno de Inversión" o "Tabla de Ahorro Real" con estos puntos clave:*

### **1. Ahorro de Tiempo (Eficacia Operativa)**
- **Toma de Voto Manual:** 45-60 min por punto de agenda → **Assembly 2.0:** 30 segundos (Voto Digital).
- **Cálculo de Quórum:** 30 min de espera y errores → **Assembly 2.0:** Tiempo Real (Automático).
- **Redacción de Acta:** 3-5 días hábiles → **Assembly 2.0:** Instantánea al finalizar la sesión.
- **ROI:** Ahorro estimado de **40-60 horas hombre** por asamblea.

### **2. Prevención de Costos Legales (Seguridad Jurídica)**
- **Evita Impugnaciones:** Una asamblea impugnada por errores de quórum o identidad cuesta entre **$2,500 y $5,000** en honorarios legales y repetición del evento.
- **Firma Biométrica:** Elimina el riesgo de "suplantación de identidad" que es la causa #1 de nulidad en Panamá (Ley 284).
- **Valor percibido:** "Nuestra plataforma es tu seguro contra nulidades legales".

### **3. Reducción de Costos de Cancelación**
- **Flexibilidad de Créditos:** Si la asamblea se cancela por falta de quórum físico, el crédito no se pierde (Plan Standard/Packs). 
- **Recuperación de Quórum:** Al permitir el voto remoto legal, se reduce en un **85% el riesgo de cancelar** una asamblea por falta de quórum, evitando el gasto de comida, alquiler de salón y logística desperdiciada.

### **4. Costo-Beneficio por Residente**
- **Cálculo de Anclaje:** En una barriada de 250 casas, el plan Standard cuesta **$0.75 por casa al mes**. 
- **Argumento:** "Por menos de lo que cuesta un café, tu comunidad tiene seguridad jurídica total y transparencia absoluta".

---

## 🛠️ INSTRUCCIONES PARA EL CODER (UI/UX)

1. **Dashboard de Precios y Créditos:**
   - Actualizar etiquetas de precios en `PricingCard.tsx`.
   - Implementar selector de perfil: **"Soy PH Independiente"** vs **"Soy Administradora/Promotora"**.
   - **Sección de ROI:** Crear un componente interactivo que muestre: "Antes vs Después" con Assembly 2.0.
   - Mostrar el concepto de **"Créditos Acumulables"** en el Plan Standard y Packs.
   - Indicar claramente los **Topes de Residentes** y el costo de escalabilidad (+$50 x 100 unidades).

2. **Flujo de Suscripción:**
   - Añadir aviso de *"Compromiso de 2 meses"* en el checkout del plan Standard.
   - Integrar la animación de "Face ID Scan" al confirmar la suscripción para reforzar la percepción de seguridad.

3. **Restricción de Reactivación:**
   - Si un usuario cancela el plan Standard en menos de 3 meses, bloquear la reactivación por 6 meses (obligatorio uso de Pay-per-Event).

---

## 📊 RESUMEN DE ARGUMENTOS DE VENTA (Landing B2B)
- **"Cero Impugnaciones":** Tu asamblea blindada legalmente.
- **"Tiempo es Dinero":** Reduce el 80% de la carga administrativa.
- **"Transparencia Total":** Los propietarios confían cuando ven resultados en tiempo real.
- **"Soporte Multi-Dispositivo":** Vota desde el celular o tablet con Face ID.

---
**Última actualización:** 27 Enero 2026
**Autor:** Product Designer & Marketing Lead
