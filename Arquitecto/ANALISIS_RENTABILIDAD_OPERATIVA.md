# 💰 ANÁLISIS DE RENTABILIDAD OPERATIVA
## Assembly 2.0 - Costos vs Ingresos

**Fecha:** 30 Enero 2026  
**Versión:** 1.0  
**Autor:** Arquitecto  
**Solicitado por:** Henry Batista

---

## 🎯 **ESCENARIO DE VALIDACIÓN:**

**Pregunta clave:**  
> ¿Son rentables los precios de $189-$699/mes si tenemos 30 asambleas simultáneas de 250 unidades (7,500 unidades concurrentes) en un VPS de $150/mes?

---

## 📊 **SUPUESTOS INICIALES:**

### **Infraestructura:**
- **VPS:** Hetzner CX51 (16 GB RAM, 8 vCPU, 320 GB SSD) → **$150/mes**
- **Capacidad:** 30 asambleas simultáneas de 250 unidades = **7,500 usuarios concurrentes**
- **Tecnología:** Next.js, PostgreSQL, Redis, Socket.io (self-hosted)

### **AI/Chatbot:**
- **Modelo Principal:** Google Gemini 1.5 Flash (económico)
- **Modelo Premium:** Claude Sonnet 4.5 (razonamiento lógico superior)
- **Uso:** Asistente chatbot, detección de intención, calificación de leads

---

## 💵 **COSTOS OPERATIVOS MENSUALES:**

### **1. INFRAESTRUCTURA (FIJOS):**

| Concepto | Proveedor | Costo Mensual |
|----------|-----------|---------------|
| VPS CX51 (16GB RAM, 8 vCPU) | Hetzner | $150.00 |
| Dominio (.com) | Namecheap | $1.00 |
| SSL (Let's Encrypt) | Gratis | $0.00 |
| Backup automático VPS | Hetzner | $10.00 |
| Monitoreo (UptimeRobot) | Gratis | $0.00 |
| **SUBTOTAL INFRAESTRUCTURA** | | **$161.00/mes** |

---

### **2. AI/CHATBOT (VARIABLES):**

#### **Opción A: Google Gemini 1.5 Flash (Económico)**

**Precios Gemini 1.5 Flash (Google AI Studio):**
- **Input:** $0.075 por 1M tokens
- **Output:** $0.30 por 1M tokens

**Estimación de uso por asamblea:**
- **Chatbot durante asamblea:** 20 consultas promedio/usuario × 250 usuarios = 5,000 consultas
- **Tokens promedio por consulta:** 500 input + 200 output = 700 tokens
- **Total tokens/asamblea:** 5,000 × 700 = 3.5M tokens (2.5M input + 1M output)

**Costo por asamblea:**
```
Input:  2.5M tokens × $0.075/1M = $0.1875
Output: 1.0M tokens × $0.30/1M  = $0.30
Total: $0.49 por asamblea
```

**Costo mensual (30 asambleas/mes):**
```
30 asambleas × $0.49 = $14.70/mes
```

**✅ VENTAJAS:**
- Muy económico ($14.70/mes para 30 asambleas)
- Latencia baja (200-500ms)
- Bueno para FAQ, soporte básico

**❌ DESVENTAJAS:**
- Razonamiento lógico limitado
- Puede fallar en consultas complejas de quórum/votación

---

#### **Opción B: Claude Sonnet 4.5 (Premium - Razonamiento Superior)**

**Precios Claude Sonnet 4.5 (Anthropic API):**
- **Input:** $3.00 por 1M tokens
- **Output:** $15.00 por 1M tokens

**Estimación de uso (mismo escenario):**
- **Total tokens/asamblea:** 3.5M tokens (2.5M input + 1M output)

**Costo por asamblea:**
```
Input:  2.5M tokens × $3.00/1M = $7.50
Output: 1.0M tokens × $15.00/1M = $15.00
Total: $22.50 por asamblea
```

**Costo mensual (30 asambleas/mes):**
```
30 asambleas × $22.50 = $675/mes
```

**✅ VENTAJAS:**
- Razonamiento lógico superior (ideal para quórum, votación, Ley 284)
- Mejor comprensión de contexto legal
- Respuestas más precisas

**❌ DESVENTAJAS:**
- **MUY COSTOSO** ($675/mes solo en AI)
- **NO RENTABLE** con precios actuales

---

#### **Opción C: HÍBRIDO (Gemini Flash + Sonnet Selectivo) ⭐ RECOMENDADO**

**Estrategia:**
- **Gemini 1.5 Flash:** Para FAQ, soporte básico, conversación casual (80% de consultas)
- **Claude Sonnet 4.5:** Solo para consultas críticas (quórum, votación, legal) (20% de consultas)

**Distribución de consultas:**
```
Total consultas/asamblea: 5,000
├─> Gemini Flash (80%): 4,000 consultas → $0.39/asamblea
└─> Sonnet 4.5 (20%):   1,000 consultas → $4.50/asamblea

Total: $4.89 por asamblea
```

**Costo mensual (30 asambleas/mes):**
```
30 asambleas × $4.89 = $146.70/mes
```

**✅ VENTAJAS:**
- Económico pero inteligente
- Razonamiento superior donde importa
- Escalable

---

### **3. SERVICIOS EXTERNOS (VARIABLES):**

| Concepto | Proveedor | Costo Mensual |
|----------|-----------|---------------|
| Stripe (procesamiento pagos) | 2.9% + $0.30 por transacción | ~$50/mes* |
| Twilio SMS (OTP) | $0.0079 por SMS | ~$25/mes** |
| WhatsApp Business API | Meta | $0.005 por mensaje | ~$15/mes*** |
| Telegram Bot API | Gratis | $0.00 |
| SendGrid (emails transaccionales) | Plan Gratis (100/día) | $0.00 |
| **SUBTOTAL SERVICIOS** | | **~$90/mes** |

**Notas:**
- *Stripe: Asume 20 transacciones/mes promedio ($189 × 20 = $3,780 × 2.9% = $109)
- **Twilio: 500 SMS OTP/mes × $0.0079 = $3.95 (ajustado a $25 con margen)
- ***WhatsApp: 3,000 mensajes/mes × $0.005 = $15

---

### **4. RESUMEN DE COSTOS TOTALES:**

#### **ESCENARIO 1: GEMINI FLASH (ECONÓMICO)**

```
Infraestructura:  $161.00
AI (Gemini):      $14.70
Servicios:        $90.00
─────────────────────────
TOTAL:            $265.70/mes
```

#### **ESCENARIO 2: SONNET 4.5 (PREMIUM - NO VIABLE)**

```
Infraestructura:  $161.00
AI (Sonnet):      $675.00 ⚠️
Servicios:        $90.00
─────────────────────────
TOTAL:            $926.00/mes ❌
```

#### **ESCENARIO 3: HÍBRIDO (RECOMENDADO) ⭐**

```
Infraestructura:  $161.00
AI (Híbrido):     $146.70
Servicios:        $90.00
─────────────────────────
TOTAL:            $397.70/mes ✅
```

---

## 💰 **ANÁLISIS DE RENTABILIDAD:**

### **Supuesto: 30 clientes activos con asambleas en el mes**

#### **MIX DE CLIENTES (CONSERVADOR):**

| Plan | Clientes | Precio | Ingreso Mensual |
|------|----------|--------|-----------------|
| Standard ($189/mes) | 20 clientes | $189 | $3,780 |
| Multi-PH ($699/mes) | 8 clientes | $699 | $5,592 |
| Enterprise ($2,499/mes) | 2 clientes | $2,499 | $4,998 |
| **TOTAL INGRESOS** | **30 clientes** | | **$14,370/mes** |

**Adicionales (one-time):**
- Unidades adicionales: 10 clientes × $50 = $500
- Créditos extras: 5 clientes × $75 = $375

**INGRESOS TOTALES:** $14,370 + $875 = **$15,245/mes**

---

### **RENTABILIDAD POR ESCENARIO:**

#### **ESCENARIO 1: GEMINI FLASH**

```
Ingresos:   $15,245
Costos:     -$266
─────────────────────
UTILIDAD:   $14,979/mes
MARGEN:     98.3% ✅ EXCELENTE
```

#### **ESCENARIO 2: SONNET 4.5 (PURO)**

```
Ingresos:   $15,245
Costos:     -$926
─────────────────────
UTILIDAD:   $14,319/mes
MARGEN:     93.9% ✅ BUENO (pero costoso en AI)
```

#### **ESCENARIO 3: HÍBRIDO (RECOMENDADO)**

```
Ingresos:   $15,245
Costos:     -$398
─────────────────────
UTILIDAD:   $14,847/mes
MARGEN:     97.4% ✅ EXCELENTE
```

---

## 📊 **CAPACIDAD VPS vs CLIENTES:**

### **VPS Hetzner CX51 (16 GB RAM, 8 vCPU):**

**Capacidad teórica:**
- **Asambleas simultáneas:** 30 asambleas × 250 unidades = 7,500 usuarios concurrentes
- **WebSocket connections:** 10,000+ conexiones simultáneas (Socket.io + Redis)
- **PostgreSQL:** PgBouncer (500 connections pool) + tuning para alta concurrencia
- **Redis:** Pub/Sub para real-time (muy ligero)

**Límite práctico:**
```
CPU: 8 vCPU × 80% utilización = 6.4 vCPU efectivos
RAM: 16 GB × 75% safe = 12 GB disponibles

Fórmula aproximada:
- Next.js (SSR): ~200 MB base + 50 MB por cada 10 usuarios concurrentes
- PostgreSQL: ~2 GB + 50 MB por cada 1,000 queries/seg
- Redis: ~500 MB + crecimiento lineal
- Socket.io: ~100 MB por cada 1,000 conexiones

Para 7,500 usuarios:
Next.js:     200 MB + (750 × 50 MB) = 3,950 MB ≈ 4 GB
PostgreSQL:  2 GB + 1 GB = 3 GB
Redis:       500 MB + 700 MB = 1.2 GB
Socket.io:   750 MB
────────────────────────────────────────────────
TOTAL:       8.95 GB ✅ OK (queda 3 GB de buffer)
```

**✅ Conclusión:** VPS CX51 es suficiente para 30 asambleas simultáneas.

---

## 🚀 **ESCALABILIDAD:**

### **¿Qué pasa si creces a 50 asambleas simultáneas?**

**Opción 1: Upgrade VPS**
- Hetzner CX61 (24 GB RAM, 12 vCPU) → **$250/mes**
- Capacidad: 50 asambleas × 250 = 12,500 usuarios

**Opción 2: Multi-VPS (Load Balancer)**
- 2× CX51 → $300/mes
- Capacidad: 60 asambleas × 250 = 15,000 usuarios

---

## ⚠️ **RIESGOS Y MITIGACIONES:**

### **RIESGO 1: Picos de uso (todos votan a la vez)**

**Escenario:**
- 30 asambleas simultáneas
- Todos votan en los primeros 5 minutos del tema

**Solución:**
- Redis Queue para votos (batch inserts)
- Debouncing en WebSocket updates (500ms)
- PostgreSQL tuning (checkpoint_completion_target, work_mem)

---

### **RIESGO 2: Costos AI se disparan (mucho uso de chatbot)**

**Escenario:**
- Usuarios abusan del chatbot
- Costos de Gemini/Sonnet suben 3x-5x

**Solución:**
- Rate limiting por usuario: 20 consultas/hora
- Cache de respuestas frecuentes (Redis)
- Modelo híbrido (Gemini para FAQ, Sonnet para crítico)

---

### **RIESGO 3: Stripe fees crecen con volumen**

**Escenario:**
- 100 clientes Standard ($189/mes)
- Stripe cobra 2.9% + $0.30 × 100 = $548 + $30 = $578/mes

**Solución:**
- Negociar con Stripe (volumen alto → 2.5% + $0.20)
- Ofrecer ACH/Yappy (0% fees) con descuento

---

## 🎯 **RECOMENDACIONES FINALES:**

### **1. MODELO DE AI RECOMENDADO:**

**✅ HÍBRIDO (Gemini Flash + Sonnet Selectivo)**

```javascript
// Lógica de routing inteligente
function selectAIModel(query) {
  const criticalKeywords = [
    'quorum', 'votacion', 'ley 284', 'coeficiente',
    'impugnar', 'legal', 'anular', 'mora'
  ];
  
  if (criticalKeywords.some(kw => query.toLowerCase().includes(kw))) {
    return 'CLAUDE_SONNET_4_5';  // Razonamiento superior
  }
  
  return 'GEMINI_FLASH';  // Económico para FAQ
}
```

**Beneficios:**
- Costos controlados ($146.70/mes)
- Razonamiento superior donde importa
- 97.4% de margen

---

### **2. PRECIOS SON RENTABLES ✅**

**Con 30 clientes y modelo híbrido:**
```
Ingresos:  $15,245/mes
Costos:    $398/mes
Margen:    97.4%
```

**Incluso en escenario pesimista (solo Standard):**
```
30 clientes × $189 = $5,670/mes
Costos: $398
Margen: 93% ✅ Aún rentable
```

---

### **3. VPS CX51 ES SUFICIENTE** ✅

**Capacidad:**
- 30 asambleas simultáneas (7,500 usuarios) → ✅ OK
- RAM: 9 GB usados de 16 GB → ✅ 3 GB buffer
- CPU: 80% utilización → ✅ OK

**Upgrade necesario solo si:**
- Superas 40 asambleas simultáneas
- Cada asamblea tiene >400 unidades

---

## 📈 **PROYECCIÓN A 12 MESES:**

### **Crecimiento conservador (10% mensual):**

| Mes | Clientes | Ingresos | Costos (híbrido) | Utilidad | Margen |
|-----|----------|----------|------------------|----------|--------|
| 1 | 30 | $15,245 | $398 | $14,847 | 97.4% |
| 3 | 40 | $20,327 | $450 | $19,877 | 97.8% |
| 6 | 53 | $26,934 | $550* | $26,384 | 98.0% |
| 12 | 94 | $47,790 | $800** | $46,990 | 98.3% |

**Notas:**
- *Mes 6: Upgrade a CX61 ($250) para manejar 50+ asambleas
- **Mes 12: Multi-VPS ($300) + AI híbrido escalado ($500)

---

## ✅ **CONCLUSIONES:**

### **1. PRECIOS ACTUALES SON MUY RENTABLES:**

```
Margen de ganancia: 93-98% ✅
VPS $150/mes cubre hasta 30 asambleas simultáneas ✅
AI híbrido (Gemini + Sonnet) mantiene costos bajos ✅
```

### **2. MODELO HÍBRIDO ES LA CLAVE:**

- **Gemini Flash** para 80% de consultas (FAQ, casual)
- **Sonnet 4.5** para 20% crítico (quórum, votación, legal)
- **Costo:** $146.70/mes (vs $675 con solo Sonnet)

### **3. CAPACIDAD VPS ES ADECUADA:**

- CX51 soporta 7,500 usuarios concurrentes ✅
- Upgrade a CX61 solo si superas 40 asambleas/mes
- Arquitectura escalable (Redis, PgBouncer, Socket.io)

### **4. RIESGOS SON MANEJABLES:**

- Rate limiting en chatbot (evita abusos)
- Cache Redis (reduce llamadas AI)
- Batch inserts (optimiza BD)

---

## 🚨 **ALERTA: NO USAR SONNET PURO**

**Si usas solo Sonnet 4.5:**
```
Costos AI: $675/mes ⚠️
Costos totales: $926/mes
Margen baja a 93.9% (aún rentable, pero innecesario)
```

**Mejor: Modelo híbrido ahorra $528/mes en AI** 💰

---

## 📝 **TAREAS PARA EL CODER:**

```
Backend:
[ ] Implementar routing inteligente de AI (Gemini vs Sonnet)
[ ] Rate limiting en chatbot (20 consultas/hora/usuario)
[ ] Cache de respuestas frecuentes (Redis)
[ ] Monitoreo de costos AI (alertas si >$200/mes)

DevOps:
[ ] Tuning PostgreSQL para 7,500 conexiones concurrentes
[ ] Redis Pub/Sub para Socket.io (multi-instance)
[ ] Monitoreo de RAM/CPU (Prometheus + Grafana)
[ ] Auto-scaling rules (si RAM >85%, alerta upgrade VPS)
```

---

**Fin del Análisis de Rentabilidad**

**Resumen Ejecutivo para Henry:**
✅ **Precios son muy rentables (97.4% margen)**  
✅ **VPS $150/mes es suficiente para 30 asambleas**  
✅ **Usa modelo híbrido AI (Gemini + Sonnet) para ahorrar $528/mes**  
✅ **Escalabilidad: Upgrade a CX61 ($250) solo si superas 40 asambleas/mes**
