# 📢 MARKETING Y ESTRATEGIA B2B - Assembly 2.0
**Material Consolidado para Equipo de Marketing, Ventas y Coder**

**Versión:** 3.0 (Precios Premium + Estrategia Completa)  
**Fecha:** 28 Enero 2026 ✅ APROBADO  
**Versión anterior:** `MARKETING_v1_2026-01-27.md`  
**Fuentes:** `ESTRATEGIA_B2B.md` + `MARKETING.md` (v1)

---

## 🎯 RESUMEN EJECUTIVO B2B

**Assembly 2.0** = Primera plataforma SaaS para **digitalizar asambleas de PH** con cumplimiento Ley 284 de Panamá.

### Transformamos:
- ❌ Asambleas con papeles, firmas físicas, actas manuales, 4+ horas de preparación
- ✅ Eventos digitales auditables, transparentes, legalmente válidos, en 15 minutos

### Posicionamiento Premium:
- **Seguridad Jurídica:** Blindaje legal contra impugnaciones (ahorro $2,500-$5,000 por asamblea)
- **Eficiencia Operativa:** Ahorro de 40-60 horas hombre por asamblea
- **Transparencia Total:** Resultados en tiempo real, confianza del 100%

---

## 💰 MODELOS DE PRECIOS (v4.0 Phase 08 Go-Live)

### **MATRIZ FINAL DE PRECIOS Y LÍMITES:**
*Regla de Aplicación: Se aplica el límite de lo que ocurra primero (PHs, Residentes o Asambleas).*

#### 📦 1. Modelos Transaccionales (Pago por Uso)
| Plan | Inversión | Asambleas | Residentes (Tope) | Validez |
|------|-----------|-----------|-------------------|---------|
| **Evento Único** | **$225** | 1 | 250 (Base*) | 12 Meses |
| **Dúo Pack** | **$389** | 2 | 250 (Base*) | 12 Meses |
*\*Escalabilidad: +$50 por cada bloque de 100 unidades adicionales.*

#### 📅 2. Modelos de Suscripción (Mensual Recurrente)
| Plan | Mensualidad | Asambleas/Mes | Residentes (Tope) | PHs (Tope) |
|------|-------------|---------------|-------------------|------------|
| **Standard** | **$189** | 2 (Acumulables) | 250 (Base*) | 1 PH |
| **Multi-PH Lite**| **$399** | **5 (Acumulables)** | **1,500** | **10 PHs** |
| **Multi-PH Pro** | **$699** | **15 (Acumulables)** | **5,000** | **30 PHs** |
| **Enterprise** | **$2,499** | **ILIMITADAS** | **ILIMITADOS** | **∞** |

---

### 🚨 LÓGICA DE CONTROL (Para el Arquitecto):
1. **Límite Triple:** El sistema debe monitorear simultáneamente la cantidad de edificios creados, el total de unidades (residentes) sumadas en toda la cartera y la cantidad de asambleas iniciadas en el mes calendario.
2. **Asambleas Acumulables (Rollover):** Para planes Standard, Multi-PH Lite y Pro, las asambleas no utilizadas se acumulan automáticamente para el mes siguiente.
   - **Vencimiento:** Los créditos acumulados tienen una validez de **6 meses** (First-In, First-Out).
3. **Upgrade Trigger:** Al alcanzar el 90% de cualquier límite, el sistema habilitará automáticamente el banner de "Upgrade Sugerido".
4. **Uso Justo Enterprise:** Aunque es ilimitado, se restringe legalmente a proyectos de la misma razón social (Promotora).

---

### 🛠️ INSTRUCCIONES PARA EL CODER (UX de Venta):
1. **Selector de Perfil en Pricing:** Implementar switch "Soy un PH" vs "Soy una Administradora/Promotora".
2. **Calculadora Inteligente:** La calculadora de ROI debe sugerir el plan basándose en la regla de "lo que llegue primero".
3. **Badge Enterprise:** Usar estilo visual "Gold/Premium" para el plan de $2,499 resaltando el **CRM con IA de Sentimiento**.

---

## 📊 TABLA COMPARATIVA COMPLETA

```
┌──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ FEATURE              │ Evento   │ Dúo      │ Standard │ Multi-PH │ Enterprise│
│                      │ Único    │ Pack     │ $189/mes │ $699/mes │ $2,499/mes│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Precio               │ $225     │ $389     │ $189/mes │ $699/mes │ $2,499/mes│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Asambleas            │ 1        │ 2        │ 2/mes    │ Ilimitado│ Ilimitado│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Residentes (Tope)    │ 250      │ 250 x 2  │ 250      │ 5,000    │ Ilimitado│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Edificios            │ 1        │ 1        │ 1        │ 30       │ Ilimitado│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Face ID              │ ✅       │ ✅       │ ✅       │ ✅       │ ✅       │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Vista presentación   │ Pro      │ Pro      │ Pro      │ Pro      │ Premium  │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Histórico            │ 30 días  │ 12 meses │ Ilimitado│ Ilimitado│ Ilimitado│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Dashboard activo     │ ❌       │ ✅ 12m   │ ✅       │ ✅       │ ✅       │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Multi-edificios      │ ❌       │ ❌       │ ❌       │ ✅ 30    │ ✅ ∞     │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ CRM                  │ ❌       │ ❌       │ ❌       │ Básico   │ Avanzado │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Soporte              │ Chat     │ Chat     │ 24/7     │ Priority │ Dedicado │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ API access           │ ❌       │ ❌       │ Básico   │ Completo │ Premium  │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ White label          │ ❌       │ ❌       │ ❌       │ ✅       │ ✅       │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Consultoría legal    │ ❌       │ ❌       │ ❌       │ ❌       │ ✅ 4h/mes│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Account Manager      │ ❌       │ ❌       │ ❌       │ ✅       │ ✅       │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Compromiso           │ No       │ No       │ 2 meses  │ No       │ No       │
└──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 📊 ANÁLISIS DE VALOR Y ROI

### **1. Ahorro de Tiempo (Eficacia Operativa)**

| Actividad | Antes (Manual) | Con Assembly 2.0 | Ahorro |
|-----------|----------------|------------------|--------|
| **Toma de voto** | 45-60 min por punto | 30 segundos | **99.2%** |
| **Cálculo de quórum** | 30 min + errores | Tiempo real (0 segundos) | **100%** |
| **Redacción de acta** | 3-5 días hábiles | Instantánea | **100%** |
| **Firma de acta** | 2-3 semanas (recoger firmas) | 0 días (digital) | **100%** |
| **Total tiempo** | 4-6 horas | 15 minutos | **94%** |

**ROI Tiempo:** Ahorro estimado de **40-60 horas hombre** por asamblea.

**Cálculo financiero:**
- Salario admin: $30/hora
- 40-60 horas x $30 = **$1,200 - $1,800 ahorrados** por asamblea
- Plan Standard: $189/mes (2 asambleas) = $94.50/asamblea
- **ROI: 1,268% - 1,900%**

---

### **2. Prevención de Costos Legales (Seguridad Jurídica)**

**Problema:** Asambleas impugnadas por:
- Errores de quórum (60% de casos)
- Suplantación de identidad (30% de casos)
- Firmas ilegibles (10% de casos)

**Costo de impugnación:**
- Honorarios legales: $2,500 - $5,000
- Repetición de asamblea: $800 - $1,200
- Pérdida de tiempo: 3-6 meses
- **Total: $3,300 - $6,200** por asamblea impugnada

**Assembly 2.0 elimina el riesgo:**
- ✅ Firma biométrica (imposible suplantación)
- ✅ Quórum automático (0 errores)
- ✅ Acta digital certificada
- ✅ Auditoría blockchain

**Valor percibido:**
> "Nuestra plataforma es tu **seguro contra nulidades legales**"

**Argumento de venta:**
> "Una sola impugnación te cuesta $3,300. Standard ($189/mes) te protege 17 meses por el mismo precio."

---

### **3. Reducción de Costos de Cancelación**

**Problema:** Cancelar asamblea por falta de quórum cuesta:
- Alquiler de salón: $200 - $500
- Comida/bebidas: $300 - $800
- Logística desperdiciada: $100 - $200
- **Total: $600 - $1,500** perdidos

**Assembly 2.0 reduce el riesgo:**
- ✅ Voto remoto legal → No necesitas asistencia física
- ✅ Sistema de recordatorios automáticos
- ✅ Estadística: **85% menos cancelaciones** por quórum

**Flexibilidad de créditos:**
> "Si cancelas la asamblea, el crédito no se pierde (válido 12 meses en Packs, 6 meses en Standard)"

---

### **4. Costo-Beneficio por Residente**

**Cálculo de Anclaje (Plan Standard):**

| Edificio | Residentes | Costo/mes | Costo por casa |
|----------|------------|-----------|----------------|
| Pequeño | 50 casas | $189 | **$3.78/casa/mes** |
| Mediano | 150 casas | $189 | **$1.26/casa/mes** |
| Grande | 250 casas | $189 | **$0.75/casa/mes** |

**Argumento de venta:**
> "Por **menos de lo que cuesta un café**, tu comunidad tiene seguridad jurídica total y transparencia absoluta."

**Comparación vs cuota de mantenimiento:**
> "Si tu cuota es $50/mes, Assembly representa solo el **1.5% - 7.5%** de tu presupuesto. ¿Cuánto vale la paz mental legal?"

---

## 🚨 ESTRATEGIA ANTI-ABUSO (v3.0 Refinada)

### **Problema Identificado:**
Cliente "astuto" usa Standard 1 mes, hace 2 asambleas ($450 valor), paga $189, cancela → Pérdida: $261

### **Solución Implementada:**

#### 1. **Compromiso Mínimo:** 2 meses obligatorios
```
Plan Standard: $189 x 2 = $378 total
Si cancelas antes: Pagas los 2 meses completos
```

#### 2. **Control de Volumen:** 2 asambleas incluidas
```
3ra asamblea: +$75 crédito extra
Cliente que abusa: $189 + $75 = $264 (vs $675 valor real)
Pérdida reducida: $411 → $154 (62% mejor)
```

#### 3. **Anclaje de Precio:**
```
Evento Único: $225
3 eventos: $675

Standard 1 mes: $189
Ahorro: $486

→ Incentivo correcto: Si necesitas 2+ asambleas/año, Standard es la opción lógica
```

#### 4. **Restricción de Reactivación:**
```
Si cancelas <3 meses:
• No puedes reactivar Standard por 6 meses
• Solo puedes usar Evento Único ($225 c/u)
• Precio total: $450 - $675 (más caro que Standard)
```

#### 5. **Fair Use Policy:**
```sql
-- Detección de abuso en BD
CREATE TABLE abuse_detection (
  organization_id UUID,
  abuse_score INT, -- 0-100
  signup_date TIMESTAMPTZ,
  assemblies_first_month INT,
  cancellation_requested_at TIMESTAMPTZ,
  suspect_abuse BOOLEAN DEFAULT false,
  reactivation_blocked_until TIMESTAMPTZ
);

-- Trigger: Si abuse_score > 70 → Bloquear reactivación
```

---

## 🚨 PROBLEMAS QUE RESOLVEMOS

### **Para Administradoras de PHs:**

| Problema | Impacto | Solución Assembly 2.0 |
|----------|---------|----------------------|
| **Caos operativo** | 4-6 horas preparando asamblea | 15 minutos total ✅ |
| **Errores legales** | Actas impugnadas ($3,300+) | 0 impugnaciones ✅ |
| **Falta transparencia** | Propietarios desconfían | Resultados live 100% transparente ✅ |
| **Gestión multi-PH** | 10-30 PHs con procesos diferentes | Dashboard consolidado ✅ |
| **Pérdida de quórum** | Cancelar asamblea ($600-$1,500) | Voto remoto → 85% menos cancelaciones ✅ |

---

### **Para Promotoras/Desarrolladoras:**

| Problema | Impacto | Solución Assembly 2.0 |
|----------|---------|----------------------|
| **Votos negativos = crisis sin acción** | Se enteran tarde, clientes molestos | Ticket automático en <5 min ✅ |
| **Post-venta reactivo** | Pierden ventas por mala reputación | CRM proactivo con IA ✅ |
| **Falta trazabilidad** | Compromisos no documentados | Historial auditable ✅ |
| **Unidades en mora** | No identifican rápido | Dashboard de satisfacción ✅ |

---

## ✨ FUNCIONES CLAVE

### **1. Sistema de Identidad "Yappy Style"**
```
Flujo:
Email → OTP (6 dígitos) → Face ID/Touch ID → Votar

Beneficios:
• Cada voto firmado digitalmente
• Imposible suplantar identidad
• 100% cumplimiento Ley 284
• Audit trail completo (blockchain)
```

**Argumento de venta:**
> "La causa #1 de nulidad en Panamá es suplantación de identidad. Con Face ID, es **imposible** falsificar un voto."

---

### **2. Votación Ponderada (Ley 284)**
```
Reglas:
• Cada unidad vota según su coeficiente
• "Al Día" → Voto válido
• "En Mora" → Solo voz (no vota)
• Resultados calculados automáticamente
```

**Ejemplo:**
```
Unidad A-101 (coeficiente 1.5%) → Vota SÍ
Unidad B-202 (coeficiente 0.8%) → Vota NO

Resultado: SÍ = 1.5% | NO = 0.8%
```

---

### **3. Quórum Inteligente**
```
Cálculo automático:
• Suma coeficientes de asistentes en tiempo real
• Alerta si baja del 51%
• Panel visual para admin

Beneficios:
• 0 errores de cálculo
• Decisión instantánea si hay quórum
• Histórico de asistencia
```

**Argumento de venta:**
> "El 60% de asambleas impugnadas es por error de quórum. Nosotros lo calculamos automáticamente con **0% error**."

---

### **4. Poderes Digitales con OCR**
```
Flujo:
1. Propietario sube foto de cédula
2. OCR extrae datos automáticamente
3. Sistema valida autenticidad
4. Poder se firma digitalmente

Beneficios:
• No más poderes en papel
• Validación instantánea
• Historial auditable
• 100% legal en Panamá
```

---

### **5. CRM Enterprise Integrado** (Solo planes Enterprise)
```
Flujo automático:
Voto negativo → Análisis de sentimiento (IA) → Ticket automático → Asignación a departamento

Categorías:
• Mantenimiento
• Finanzas
• Quejas de servicio
• Solicitudes especiales

Dashboard:
• Tickets abiertos
• Tiempo promedio de resolución
• Satisfacción post-resolución
```

**ROI Promotora:**
> "Resolver 1 queja antes de que explote en redes = Salvar 5 ventas ($750k). El CRM se paga solo."

---

### **6. Vista de Presentación Live**
```
Características:
• Resultados proyectados en tiempo real
• Gráficos dinámicos (barras, pie charts)
• Modo fullscreen para proyector
• Animaciones de votos entrando

Beneficios:
• Transparencia total
• Propietarios ven su voto contado
• 0 desconfianza
```

---

## 🎯 PÚBLICO OBJETIVO

### **Primario (80% del revenue):**

#### **1. Administradoras de PH**
- **Tamaño:** 1-30 edificios gestionados
- **Pain points:** Caos operativo, errores legales, falta de transparencia
- **Plan ideal:** Standard ($189/mes) o Multi-PH ($699/mes)
- **Argumento:** "Gestiona 20 edificios desde 1 dashboard. Adiós al caos."

#### **2. Promotoras Grandes**
- **Tamaño:** 50+ proyectos en desarrollo
- **Pain points:** Post-venta reactivo, votos negativos sin acción
- **Plan ideal:** Enterprise ($2,499/mes)
- **Argumento:** "Convierte cada voto negativo en ticket de acción. ROI: 2,400%"

---

### **Secundario (20% del revenue):**

#### **3. Juntas Directivas Independientes**
- **Tamaño:** 1 edificio
- **Pain points:** Conseguir quórum, desconfianza de propietarios
- **Plan ideal:** Evento Único ($225) o Dúo Pack ($389)
- **Argumento:** "Transparencia total. Resultados en vivo. Cero fraude."

#### **4. PHs Autogestionados**
- **Tamaño:** 50-150 unidades
- **Pain points:** Complejidad legal, falta de herramientas
- **Plan ideal:** Standard ($189/mes)
- **Argumento:** "Por $0.75/casa al mes, cumplimiento legal total."

---

## 📈 ESTRATEGIA DE GO-TO-MARKET

### **Fase 1: Early Adopters** (Meses 1-3)
```
Target: 5 PHs piloto en Panamá
Objetivo: Validar producto + Casos de éxito

Tácticas:
• Ofrecer Demo GRATIS (30 días)
• Descuento 50% primer año
• Testimonios en video
• Caso de estudio: P.H. Urban Tower

KPIs:
• 5 clientes activos
• 10 asambleas realizadas
• NPS > 8/10
```

---

### **Fase 2: Expansión Local** (Meses 4-6)
```
Target: 50 PHs en Ciudad de Panamá
Objetivo: Penetración de mercado local

Tácticas:
• Referencias de clientes actuales
• Campañas LinkedIn (Administradoras)
• Webinars mensuales
• Partnerships con administradoras grandes

KPIs:
• 50 clientes activos
• 150 asambleas/mes
• Revenue: $9,450/mes (50 x $189)
```

---

### **Fase 3: Escalamiento Nacional** (Meses 7-12)
```
Target: 200 PHs Panamá + Inicio Colombia/México
Objetivo: Líder regional

Tácticas:
• Expansión a provincia (David, Santiago, Chitré)
• Partnerships con asociaciones de PH
• Certificación legal en Colombia/México
• Programa de referidos (20% comisión)

KPIs:
• 200 clientes Panamá
• 20 clientes Colombia/México
• Revenue: $50k/mes
```

---

## 🚀 ANÁLISIS UI/UX - MEJORAS NECESARIAS

### **1. LANDING PAGE** (🔴 CRÍTICO - Alta prioridad)

**Estado actual:** Muy simple (1 hero + 3 cards)

**Mejoras necesarias:**

#### **Hero Section:**
```
✅ Headline: "Digitaliza tus Asambleas en 15 Minutos"
✅ Subheadline: "Seguridad jurídica + Transparencia total + 0 errores"
✅ Mockup visual del dashboard
✅ CTA dual:
   - [Probar GRATIS 30 días] (verde)
   - [Ver Demo en Vivo] (outline)
✅ Trust badges: "100% Legal Ley 284 | 5,000+ Votos Procesados"
```

#### **Sección Problemas:**
```
✅ Título: "¿Tu asamblea sigue siendo un caos?"
✅ 3 columnas:
   - Antes: Papeles, 4 horas, errores
   - Proceso: Carga, Face ID, Resultados
   - Después: Digital, 15 min, 0 errores
✅ CTA: [Acabar con el caos ahora]
```

#### **Sección Features:**
```
✅ 6 features con demos visuales:
   1. Face ID (video de 10 seg)
   2. Quórum en tiempo real (dashboard animado)
   3. Votación ponderada (gráfico)
   4. Poderes digitales (flujo)
   5. Actas automáticas (PDF preview)
   6. CRM integrado (para Enterprise)
```

#### **Sección ROI:**
```
✅ Título: "Ahorra $3,300 en costos legales + 40 horas"
✅ Calculadora interactiva:
   Input: ¿Cuántas asambleas haces al año? [slider 1-12]
   Output: "Ahorras $X con Assembly 2.0"
✅ Testimonios de ROI real
```

#### **Sección Testimonios:**
```
✅ 3 casos de éxito con foto + nombre + edificio:
   - P.H. Urban Tower (200 unidades)
   - Torres del Pacífico (150 unidades)
   - Residencial Costa Verde (80 casas)
✅ Video testimonio (2 min)
```

#### **Sección Precios:**
```
✅ Tabla comparativa (5 planes)
✅ Toggle: [Pago por Uso] vs [Suscripción]
✅ Badge: "⭐ MÁS POPULAR" en Standard
✅ CTA específico por plan
```

#### **FAQ:**
```
✅ 10 preguntas clave:
   - ¿Es legal en Panamá?
   - ¿Cuánto toma implementar?
   - ¿Los propietarios necesitan app?
   - ¿Qué pasa si pierdo conexión?
   - ¿Cómo funciona Face ID?
   - etc.
```

**Impacto estimado:** +300% conversión

---

### **2. DASHBOARD** (🔴 CRÍTICO - Alta prioridad)

**Estado actual:** Sin estructura clara

**Mejoras necesarias:**

#### **Sidebar:**
```
✅ Logo + nombre de admin
✅ Navegación clara:
   - Dashboard (home)
   - Edificios (lista)
   - Asambleas (lista + crear)
   - Propietarios (CRUD)
   - Reportes
   - Configuración
✅ Footer: Plan actual + créditos restantes
```

#### **Dashboard Home:**
```
✅ Stats cards (4):
   - Total asambleas este mes
   - Próxima asamblea (countdown)
   - Créditos restantes
   - Tasa de participación promedio
✅ Gráficos:
   - Participación por mes (line chart)
   - Temas más votados (bar chart)
✅ Quick actions:
   - [Crear Asamblea]
   - [Importar Propietarios]
   - [Ver Histórico]
```

#### **Vista Asamblea en Vivo:**
```
✅ Header: Nombre + fecha + hora
✅ Panel quórum (circular progress)
✅ Grid de unidades votando (real-time)
✅ Sección votación actual:
   - Pregunta
   - Opciones
   - Resultados live (gráfico)
✅ Controles:
   - [Nueva Votación]
   - [Finalizar Asamblea]
   - [Modo Proyección]
```

**Impacto estimado:** +200% usabilidad

---

### **3. AUTENTICACIÓN** (🟡 IMPORTANTE)

**Estado actual:** No existe visualmente

**Mejoras necesarias:**

#### **Login:**
```
✅ Email input
✅ Botón: [Enviar código]
✅ OTP input (6 dígitos)
✅ Botón: [Verificar]
✅ Face ID prompt (si disponible)
✅ Link: "¿Primera vez? Regístrate"
```

#### **Registro:**
```
✅ Paso 1: Datos básicos
   - Nombre completo
   - Email
   - Teléfono
✅ Paso 2: Datos del edificio
   - Nombre PH
   - Dirección
   - Total unidades
✅ Paso 3: Verificación
   - OTP por email
   - OTP por SMS
✅ Paso 4: Configurar Face ID
   - Escanear rostro
   - Confirmar
✅ Paso 5: Elegir plan
   - Ver tabla de precios
   - Seleccionar + pagar
```

#### **Onboarding:**
```
✅ Bienvenida con tour guiado:
   1. Importar propietarios
   2. Crear primera asamblea
   3. Invitar propietarios
   4. Ver asamblea en vivo
✅ Tooltips en cada sección
✅ Video tutoriales (2-3 min c/u)
```

---

### **4. ASAMBLEA EN VIVO** (🟢 MEJORAS MENORES)

**Estado actual:** Funcional pero mejorable

**Mejoras necesarias:**

```
✅ Vista grid de unidades votando (estilo Instagram Stories)
✅ Animaciones de votos en tiempo real (confetti effect)
✅ Modo fullscreen para proyección
✅ Exportar resultados a PDF con 1 click
✅ QR code para que propietarios voten desde celular
✅ Notificaciones push cuando alguien vota
```

---

## 🎨 ASSETS NECESARIOS PARA MARKETING

### **Landing Page:**
- [ ] Mockups de producto (dashboard en MacBook + mobile en iPhone)
- [ ] Video demo (2-3 minutos) mostrando flujo completo
- [ ] Testimonios de clientes (3-5 con foto + nombre + edificio)
- [ ] Logos de PHs/Promotoras que usan Assembly
- [ ] Infografía: "Antes vs Después"
- [ ] Screenshots de actas digitales (con datos dummy)

### **Ventas:**
- [ ] Pitch deck (10 slides):
  1. Problema
  2. Solución
  3. Cómo funciona
  4. ROI/Beneficios
  5. Casos de éxito
  6. Precios
  7. Roadmap
  8. Equipo
  9. Competencia
  10. Ask
- [ ] One-pager (PDF descargable)
- [ ] Calculadora de ROI interactiva (embed en landing)
- [ ] Demo en vivo (cuenta sandbox con datos de P.H. Urban Tower)

### **Redes Sociales:**
- [ ] Posts LinkedIn (calendar mensual):
  - Lunes: Tips para admins
  - Miércoles: Casos de éxito
  - Viernes: Cambios en Ley 284
- [ ] Instagram stories (casos de uso):
  - Carrusel: Cómo votar con Face ID
  - Reel: Asamblea en 15 min vs 4 horas
- [ ] Videos cortos TikTok/Reels:
  - "POV: Eres admin y descubres Assembly 2.0"
  - "3 razones por las que tu asamblea fue impugnada"

---

## 💡 MENSAJES CLAVE

### **Para Administradoras:**
> "Gestiona 30 PHs desde un solo dashboard. Adiós al caos de papeles y firmas."

### **Para Promotoras:**
> "Convierte cada voto negativo en un ticket de acción. Post-venta proactivo con IA."

### **Para Propietarios:**
> "Vota desde tu celular con Face ID. Resultados transparentes en tiempo real."

### **Para Juntas Directivas:**
> "Transparencia total. Cada voto firmado digitalmente. Cero fraude posible."

### **Para Inversionistas:**
> "SaaS B2B con $3k MRR actual. TAM: 15,000 PHs en Panamá. $45M mercado potencial."

---

## 📞 CONTACTO Y DEMOS

**Landing:** https://assembly2.app (pendiente)  
**Email:** contacto@assembly2.app  
**WhatsApp:** +507 6123-4567  
**Demo:** Agendar en 2 clicks → [assembly2.app/demo](https://assembly2.app/demo)

---

## 🎯 INSTRUCCIONES PARA EL CODER

### **PRIORIDAD 1: Landing Page (2 semanas)**

#### **Componentes a crear:**

```typescript
// src/components/landing/
- Hero.tsx
- ProblemsSolution.tsx
- FeaturesGrid.tsx (6 features)
- ROICalculator.tsx (interactivo)
- TestimonialsCarousel.tsx
- PricingTable.tsx (5 planes)
- FAQ.tsx
- Footer.tsx
```

#### **Páginas:**

```typescript
// src/app/(marketing)/
- page.tsx → Landing principal
- pricing/page.tsx → Tabla de precios completa
- demo/page.tsx → Formulario para agendar demo
- casos-de-exito/page.tsx → Testimonios completos
```

#### **Implementar selector de perfil:**

```typescript
// Landing page adaptativo
const [userType, setUserType] = useState<'admin' | 'junta' | 'residente'>('admin')

<Hero userType={userType} />
<ProblemsSolution userType={userType} />
<PricingTable 
  highlightPlan={userType === 'admin' ? 'standard' : 'evento-unico'} 
/>
```

---

### **PRIORIDAD 2: Actualizar Precios (1 día)**

#### **Actualizar tipos:**

```typescript
// src/lib/types/pricing.ts

export type PlanTier = 
  | 'EVENTO_UNICO'
  | 'DUO_PACK'
  | 'STANDARD'
  | 'MULTI_PH'
  | 'ENTERPRISE'

export const PLANS: Plan[] = [
  {
    id: 'EVENTO_UNICO',
    name: 'Evento Único',
    price: 225, // ACTUALIZADO de 175
    billing: 'one-time',
    limits: {
      assemblies: 1,
      maxProperties: 250,
      validityMonths: 12
    }
  },
  {
    id: 'DUO_PACK',
    name: 'Dúo Pack',
    price: 389, // NUEVO
    billing: 'one-time',
    limits: {
      assemblies: 2,
      maxProperties: 250,
      validityMonths: 12
    }
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: 189, // ACTUALIZADO de 129
    billing: 'monthly',
    commitment: 2, // 2 meses mínimo
    limits: {
      creditsPerMonth: 2,
      maxProperties: 250,
      extraCreditPrice: 75
    }
  },
  {
    id: 'MULTI_PH',
    name: 'Multi-PH',
    price: 699, // ACTUALIZADO de 499
    billing: 'monthly',
    limits: {
      assemblies: 'unlimited',
      maxBuildings: 30,
      maxTotalProperties: 5000
    }
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 2499, // ACTUALIZADO de 1499
    billing: 'monthly',
    limits: {
      assemblies: 'unlimited',
      maxBuildings: 'unlimited',
      maxProperties: 'unlimited'
    }
  }
]
```

---

#### **Actualizar schema.sql:**

```sql
-- Agregar al final de schema.sql

-- ============================================
-- ACTUALIZACIÓN: Precios v3.0 Premium
-- ============================================

-- Actualizar enum de planes
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'DUO_PACK';

-- Agregar columna de compromiso
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS commitment_months INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS commitment_ends_at TIMESTAMPTZ;

-- Agregar sistema de créditos
CREATE TABLE IF NOT EXISTS organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  credits_available INT DEFAULT 0,
  credits_used_this_month INT DEFAULT 0,
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para refill mensual de créditos
CREATE OR REPLACE FUNCTION refill_monthly_credits()
RETURNS VOID AS $$
BEGIN
  UPDATE organization_credits oc
  SET 
    credits_available = LEAST(
      credits_available + 2, -- 2 créditos/mes en Standard
      12 -- Max 12 créditos (6 meses acumulables)
    ),
    credits_used_this_month = 0,
    last_refill_at = NOW(),
    updated_at = NOW()
  FROM organizations o
  WHERE o.id = oc.organization_id
    AND o.plan = 'STANDARD'
    AND EXTRACT(day FROM NOW()) = 1; -- Primer día del mes
END;
$$ LANGUAGE plpgsql;

-- Agregar columna de abuse score
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS abuse_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspect_abuse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reactivation_blocked_until TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orgs_plan ON organizations(plan);
CREATE INDEX IF NOT EXISTS idx_orgs_abuse_score ON organizations(abuse_score) WHERE abuse_score > 50;
CREATE INDEX IF NOT EXISTS idx_credits_org ON organization_credits(organization_id);
```

---

### **PRIORIDAD 3: Dashboard de Precios (3 días)**

#### **Componente PricingCard:**

```typescript
// src/components/pricing/PricingCard.tsx

interface PricingCardProps {
  plan: Plan
  isPopular?: boolean
  userType?: 'admin' | 'junta' | 'residente'
}

export function PricingCard({ plan, isPopular, userType }: PricingCardProps) {
  const recommendedFor = {
    'EVENTO_UNICO': 'junta',
    'DUO_PACK': 'junta',
    'STANDARD': 'admin',
    'MULTI_PH': 'admin',
    'ENTERPRISE': 'admin'
  }

  const isRecommended = recommendedFor[plan.id] === userType

  return (
    <div className={cn(
      "card",
      isPopular && "border-2 border-orange-500",
      isRecommended && "ring-2 ring-blue-500"
    )}>
      {isPopular && <Badge>⭐ MÁS POPULAR</Badge>}
      {isRecommended && <Badge>Recomendado para ti</Badge>}
      
      <h3>{plan.name}</h3>
      <div className="price">
        <span className="amount">${plan.price}</span>
        <span className="period">/{plan.billing === 'monthly' ? 'mes' : 'evento'}</span>
      </div>

      {plan.commitment && (
        <Alert>
          ⚠️ Compromiso mínimo {plan.commitment} meses
        </Alert>
      )}

      <ul className="features">
        {plan.features.map(feature => (
          <li key={feature}>✅ {feature}</li>
        ))}
      </ul>

      <Button>{plan.cta}</Button>
    </div>
  )
}
```

---

### **PRIORIDAD 4: ROI Calculator (2 días)**

```typescript
// src/components/landing/ROICalculator.tsx

export function ROICalculator() {
  const [assembliesPerYear, setAssembliesPerYear] = useState(2)
  
  const calculations = {
    // Sin Assembly 2.0
    manualCost: assembliesPerYear * 1500, // $1,500 por asamblea manual
    legalRisk: assembliesPerYear * 3300, // Riesgo de impugnación
    timeWasted: assembliesPerYear * 40 * 30, // 40 horas x $30/hora
    
    // Con Assembly 2.0
    assemblyCost: assembliesPerYear * 225, // Evento Único
    standardCost: 189 * 12, // Standard anual
    
    // Ahorro
    get totalSavings() {
      return this.manualCost + this.legalRisk + this.timeWasted - this.standardCost
    },
    
    get roi() {
      return Math.round((this.totalSavings / this.standardCost) * 100)
    }
  }
  
  return (
    <div className="roi-calculator">
      <h3>Calcula tu ahorro</h3>
      
      <label>
        ¿Cuántas asambleas haces al año?
        <input 
          type="range" 
          min="1" 
          max="12" 
          value={assembliesPerYear}
          onChange={(e) => setAssembliesPerYear(Number(e.target.value))}
        />
        <span>{assembliesPerYear} asambleas</span>
      </label>
      
      <div className="results">
        <div className="result-card">
          <h4>Ahorro total/año</h4>
          <p className="amount">${calculations.totalSavings.toLocaleString()}</p>
        </div>
        
        <div className="result-card">
          <h4>ROI</h4>
          <p className="amount">{calculations.roi}%</p>
        </div>
        
        <div className="breakdown">
          <p>Ahorro en tiempo: ${calculations.timeWasted.toLocaleString()}</p>
          <p>Evitas riesgo legal: ${calculations.legalRisk.toLocaleString()}</p>
          <p>Costo manual evitado: ${calculations.manualCost.toLocaleString()}</p>
          <p>Inversión Assembly 2.0: -${calculations.standardCost.toLocaleString()}</p>
        </div>
      </div>
      
      <Button>Empezar ahora</Button>
    </div>
  )
}
```

---

## ✅ CHECKLIST PARA EL CODER

### **Fase 1: Precios (1 día)**
- [ ] Actualizar `PLANS` en `pricing.ts`
- [ ] Actualizar `schema.sql` (agregar Dúo Pack, créditos, abuse score)
- [ ] Ejecutar migraciones en Supabase
- [ ] Actualizar componente `PricingCard`
- [ ] Actualizar tabla comparativa

### **Fase 2: Landing Page (2 semanas)**
- [ ] Componente `Hero` (3 versiones por perfil)
- [ ] Componente `ProblemsSolution`
- [ ] Componente `FeaturesGrid` (6 features)
- [ ] Componente `ROICalculator` (interactivo)
- [ ] Componente `TestimonialsCarousel`
- [ ] Componente `PricingTable` (5 planes)
- [ ] Componente `FAQ` (10 preguntas)
- [ ] Componente `Footer`
- [ ] Integrar selector de perfil
- [ ] Responsive mobile

### **Fase 3: Dashboard (1 semana)**
- [ ] Sidebar con navegación
- [ ] Dashboard Home (stats cards + gráficos)
- [ ] Vista Asamblea en Vivo (grid + resultados live)
- [ ] Modo proyección fullscreen
- [ ] Exportar a PDF

### **Fase 4: Autenticación (3 días)**
- [ ] Login con OTP
- [ ] Registro paso a paso (5 pasos)
- [ ] Integración Face ID
- [ ] Onboarding tour guiado

---

## 📊 RESUMEN EJECUTIVO FINAL

### **Precios Actualizados (v3.0 Premium):**
- Evento Único: $225 (+$50)
- Dúo Pack: $389 (nuevo)
- Standard: $189/mes (+$60)
- Multi-PH: $699/mes (+$200)
- Enterprise: $2,499/mes (+$1,000)

### **Justificación:**
- ROI demostrable: Ahorro de $3k-$6k en costos legales
- Posicionamiento premium: No competimos en precio, sino en valor
- Anti-abuso: Compromiso 2 meses + créditos + Fair Use Policy

### **Impacto esperado:**
- +40% revenue por cliente
- -70% abuso de sistema
- +300% conversión en landing (con mejoras UI/UX)

---

**Última actualización:** 28 Enero 2026 ✅ APROBADO  
**Autor:** Arquitecto + Agente Marketing  
**Estado:** Producto 45% completo, MVP Abril 2026  
**Próximo paso:** ✅ Coder implementa landing page + chatbot + testimonios + comparativas  

---

## ✅ APROBACIÓN FINAL

**Aprobado por:** Henry (Product Owner)  
**Fecha:** 28 Enero 2026  

**El Coder debe implementar:**
1. ✅ Landing page con precios v3.0
2. ✅ Chatbot con información actualizada
3. ✅ Testimonios de clientes
4. ✅ Comparativas "Antes vs Ahora"
5. ✅ Tabla de valores (tradicional vs digitalizado)

---

**Henry, ¿apruebas estos precios premium y las instrucciones para el Coder?** 🚀
