# 💰 GESTIÓN DE COSTOS - Assembly 2.0
## Presupuesto, Optimización de Recursos y ROI

**Versión:** 3.0  
**Fecha:** 30 Enero 2026 (ACTUALIZADO: VPS All-in-One)  
**Responsable:** Contralor  
**Audiencia:** Henry (Product Owner)

---

## 🚨 CAMBIO DE ARQUITECTURA: VPS ALL-IN-ONE

**Decisión aprobada:** Ya NO usamos Supabase Cloud. Todo es self-hosted en VPS Hetzner.

| Antes (Supabase) | Ahora (VPS All-in-One) |
|------------------|------------------------|
| Supabase Pro: $25/mes | VPS Hetzner CX51: $32/mes |
| Cursor: $20/mes | Cursor: $20/mes |
| VPS chatbots: $18/mes | (incluido en VPS) |
| **TOTAL: $63/mes** | **TOTAL: $52/mes** |
| Límites: 500 conn, 8GB | Sin límites |

**AHORRO: $11/mes = $132/año (17%)**

**Documento de referencia:** `Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md`

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
3. [Simulación de Costos por Asambleas Simultáneas](#simulación-de-costos-por-asambleas-simultáneas)
4. [Costos de Plataformas](#costos-de-plataformas)
5. [Costos de Desarrollo (Cursor)](#costos-de-desarrollo-cursor)
6. [Optimización de Recursos](#optimización-de-recursos)
7. [Estrategia de Ahorro](#estrategia-de-ahorro)
8. [ROI del Proyecto](#roi-del-proyecto)
9. [Recomendaciones](#recomendaciones)

---

## 💼 RESUMEN EJECUTIVO

### **Estado Actual: 29% completado**
```
[███████░░░░░░░░░░░░░░░░░] 29%

COMPLETADO:
✅ Landing Page (100%) - 1,116 líneas
✅ Login OTP (90%) - 402 líneas  
✅ Chatbot Telegram (100%) - ~300 líneas
✅ Git & Backup (100%)

EN PROGRESO:
🔄 Dashboard Admin PH (20%)
🔄 Schema BD (40%)

PENDIENTE:
⏸️ Votación & Registro
⏸️ Actas
⏸️ RLS Multi-tenant
```

### **Costo Total Estimado - MVP 30 DÍAS:**

```
FASE DE DESARROLLO (30 días = 1 mes):
├─ Cursor Pro: $20 ($20/mes x 1)
├─ Supabase: $0 (Free durante desarrollo)
├─ GitHub: $0 (Free)
├─ Dominios/hosting: $0 (hasta producción)
└─ TOTAL DESARROLLO: $20 USD

FASE DE PRODUCCIÓN (mensual):
├─ Cursor Pro: $20/mes (mantenimiento)
├─ Supabase Pro: $25/mes (hasta 500 usuarios)
├─ Dominio: $12/año ($1/mes amortizado)
├─ GitHub: $0 (Free)
└─ TOTAL PRODUCCIÓN: $46 USD/mes

TOTAL PRIMER AÑO (con MVP 30 días):
├─ Desarrollo (1 mes): $20
├─ Producción (11 meses): $506
└─ TOTAL: $526 USD/año
```

### **Break-even (punto de equilibrio):**
```
Con 1 cliente pagando Standard ($189/mes):
= $189/mes de ingresos
- $46/mes de costos operativos
= $143/mes de ganancia neta

Con 3 clientes pagando Standard ($189/mes):
= $567/mes de ingresos
- $46/mes de costos operativos
= $521/mes de ganancia neta

ROI con 3 clientes: 1,133% anual
Break-even: 1 cliente = Mes 1 después del lanzamiento
```

### **Timeline MVP 30 Días:**
```
Semana 1 (Días 1-7):
├─ ✅ Login OTP completo y probado
├─ 🔄 Dashboard Admin PH - CRUD Propietarios
└─ 🔄 Schema BD - tablas propietarios, asambleas

Semana 2 (Días 8-14):
├─ Dashboard Admin PH - Crear Asamblea (wizard)
├─ Votación básica - Crear temas
└─ RLS Multi-tenant

Semana 3 (Días 15-21):
├─ Votación - Votar + Resultados en vivo
├─ Quórum Ley 284 (hardcodeado)
└─ Alertas de quórum

Semana 4 (Días 22-30):
├─ Acta simple (texto/PDF)
├─ Testing integración
├─ Deploy a producción
└─ 🎉 MVP LISTO
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO (Auditoría 30 Enero 2026)

### **Arquitectura Creada vs Faltante:**

| COMPONENTE | ESTADO | ARCHIVOS | NOTAS |
|------------|--------|----------|-------|
| **Landing Page** | ✅ 100% | `src/app/page.tsx` (1116 líneas) | Completa con precios, calculadora ROI, chatbot Lex |
| **Login OTP** | ✅ 90% | `src/app/login/page.tsx` (402 líneas) | Flujo OTP funcional, falta testing producción |
| **Dashboard Admin PH** | 🔄 20% | `src/app/dashboard/admin-ph/page.tsx` | Solo redirige a `/ph` |
| **Vista Live Asamblea** | 🔄 30% | `src/app/dashboard/admin-ph/assembly/[id]/live/page.tsx` | Panel voto manual básico (92 líneas) |
| **Dashboard Plataforma** | ⏸️ 5% | `src/app/dashboard/platform-admin/page.tsx` | Placeholder |
| **Chatbot Telegram** | ✅ 100% | `src/chatbot/` | Comandos + Supabase utils |
| **Schema BD** | 🔄 40% | `sql_snippets/login_otp_setup.sql` | Users, organizations, auth básico |
| **API Routes** | ⏸️ 10% | `src/app/api/env/route.ts` | Solo endpoint de config |

### **Código Existente (medido):**

```
ARCHIVOS CREADOS:                    LÍNEAS DE CÓDIGO
├─ src/app/page.tsx                  1,116 líneas (Landing completa)
├─ src/app/login/page.tsx            402 líneas (Login OTP)
├─ src/app/dashboard/.../live/       92 líneas (Voto manual básico)
├─ src/chatbot/                      ~300 líneas (Bot Telegram)
├─ sql_snippets/                     200 líneas (Setup usuarios)
└─ TOTAL CÓDIGO FUNCIONAL:           ~2,110 líneas
```

### **Lo que FALTA para MVP (30 días):**

| MÓDULO | TAREAS | ESTIMACIÓN |
|--------|--------|------------|
| **Dashboard Admin PH** | CRUD propietarios, crear asamblea, wizard | 5-7 días |
| **Votación básica** | Temas, votar, resultados en vivo | 4-5 días |
| **Quórum Ley 284** | Cálculo hardcodeado, alertas | 2 días |
| **Acta simple** | Generación texto/PDF básico | 2 días |
| **RLS Multi-tenant** | Políticas de seguridad | 1 día |
| **Testing integración** | Login + Dashboard + Votación | 3 días |
| **TOTAL MVP** | | **17-20 días hábiles** |

---

## 🎯 SIMULACIÓN DE COSTOS POR ASAMBLEAS SIMULTÁNEAS

### **Escenarios de Producción Real:**

| ESCENARIO | USUARIOS SIMULTÁNEOS | CONEXIONES REALTIME | REQUESTS BD/MIN |
|-----------|---------------------|---------------------|-----------------|
| **1 asamblea** | 50-100 | 100 | 500 |
| **2 asambleas** | 100-200 | 200 | 1,000 |
| **3 asambleas** | 150-300 | 300 | 1,500 |
| **5 asambleas** | 250-500 | 500 | 2,500 |
| **10 asambleas** | 500-1000 | 1,000 | 5,000 |

### **Costos Supabase por Escenario:**

```
PLAN FREE (límites):
├─ Conexiones Realtime: 200 (Free)
├─ Requests/mes: 500,000
├─ Storage: 500 MB
└─ Bandwidth: 2 GB

PLAN PRO ($25/mes):
├─ Conexiones Realtime: 500
├─ Requests/mes: Ilimitado
├─ Storage: 8 GB
├─ Bandwidth: 50 GB
└─ Edge Functions: 500k invocaciones

PLAN TEAM ($599/mes):
├─ Conexiones Realtime: Ilimitado
├─ Todo ilimitado
└─ SOC2, HIPAA compliance
```

### **Tabla de Costos Mensuales por Asambleas Simultáneas:**

| ASAMBLEAS | PLAN SUPABASE | COSTO BD | VERCEL | CURSOR | OTROS | **TOTAL/MES** |
|-----------|---------------|----------|--------|--------|-------|---------------|
| **1** | Free | $0 | $0 | $20 | $1 | **$21** |
| **2** | Free/Pro | $0-$25 | $0 | $20 | $1 | **$21-$46** |
| **3** | Pro | $25 | $0 | $20 | $1 | **$46** |
| **5** | Pro | $25 | $0 | $20 | $5 | **$50** |
| **10** | Pro/Team | $25-$599 | $20 | $20 | $10 | **$75-$649** |

### **Detalle por Escenario:**

#### **1 ASAMBLEA SIMULTÁNEA (Corto plazo - Mes 1-3)**
```
Perfil: 1 PH cliente, 50-100 usuarios votando
├─ Supabase Free: $0 (100 conexiones Realtime OK)
├─ Vercel Hobby: $0 (100 GB bandwidth)
├─ Cursor Pro: $20 (mantenimiento)
├─ Dominio: $1 (amortizado)
├─ Gemini: $0 (Free tier)
└─ TOTAL: $21/mes

Ingresos (1 cliente Standard): $189/mes
Ganancia neta: $168/mes
```

#### **3 ASAMBLEAS SIMULTÁNEAS (Mediano plazo - Mes 4-6)**
```
Perfil: 3 PHs clientes, 150-300 usuarios votando
├─ Supabase Pro: $25 (500 conexiones Realtime)
├─ Vercel Hobby: $0
├─ Cursor Pro: $20
├─ Dominio: $1
├─ Gemini: $0
└─ TOTAL: $46/mes

Ingresos (3 clientes Standard): $567/mes
Ganancia neta: $521/mes
Margen: 92%
```

#### **5 ASAMBLEAS SIMULTÁNEAS (Mediano plazo - Mes 7-12)**
```
Perfil: 5 PHs clientes, 250-500 usuarios votando
├─ Supabase Pro: $25 (500 conexiones = límite)
├─ Vercel Hobby: $0
├─ Cursor Pro: $20
├─ Dominio: $1
├─ Gemini: $5 (más conversaciones)
└─ TOTAL: $51/mes

Ingresos (5 clientes Standard): $945/mes
Ganancia neta: $894/mes
Margen: 95%

⚠️ ALERTA: 5 asambleas simultáneas está en el límite de Supabase Pro
```

#### **10 ASAMBLEAS SIMULTÁNEAS (Largo plazo - Año 2)**
```
Perfil: 10+ PHs, 500-1000 usuarios votando
├─ Supabase Team: $599 (conexiones ilimitadas)
├─ Vercel Pro: $20 (más funciones serverless)
├─ Cursor Pro: $20
├─ Dominio: $1
├─ Gemini Pro: $10
└─ TOTAL: $650/mes

Ingresos (10 clientes Standard): $1,890/mes
Ganancia neta: $1,240/mes
Margen: 66%

Alternativa: 5 Multi-PH Pro ($699 x 5) = $3,495/mes ingresos
Ganancia alternativa: $2,845/mes
```

### **Cuándo Hacer Upgrade:**

| TRIGGER | ACCIÓN | COSTO ADICIONAL |
|---------|--------|-----------------|
| >150 conexiones Realtime simultáneas | Upgrade a Supabase Pro | +$25/mes |
| >500 conexiones Realtime simultáneas | Upgrade a Supabase Team | +$574/mes |
| >100 GB bandwidth/mes | Upgrade a Vercel Pro | +$20/mes |
| >1,500 conversaciones Gemini/día | Activar Gemini Pro | +$5-20/mes |

---

## 🖥️ COSTOS DE PLATAFORMAS

### **1. Cursor (Desarrollo + Mantenimiento)**

| Plan | Costo | Límites | Recomendación |
|------|-------|---------|---------------|
| **Free** | $0/mes | 2,000 requests/mes | ❌ Insuficiente |
| **Pro** | $20/mes | Unlimited requests | ✅ **RECOMENDADO** |
| **Business** | $40/mes | Teams, admin controls | ⏸️ Para fase de crecimiento |

**Decisión:** ✅ **Cursor Pro ($20/mes)**

**Justificación:**
- Free plan: Solo 2,000 requests = ~65 requests/día = INSUFICIENTE
- Pro plan: Unlimited = libertad total para desarrollar
- Durante desarrollo intenso (3 meses): necesitamos Pro
- Post-lanzamiento: podemos mantener Pro para mantenimiento

**Costo anual:** $240 USD/año

---

### **2. Supabase (Backend + Base de Datos)**

| Plan | Costo | Límites | Recomendación |
|------|-------|---------|---------------|
| **Free** | $0/mes | 500 MB BD, 2 GB transferencia, 50k requests, 200 conexiones Realtime | ✅ Para desarrollo |
| **Pro** | $25/mes | 8 GB BD, 50 GB transferencia, 500 conexiones Realtime | ✅ Para producción |
| **Team** | $599/mes | Ilimitado | ⏸️ Para escala (promotoras) |

**Decisión:** 
- ✅ **Free durante desarrollo** (3 meses)
- ✅ **Pro al lanzar** ($25/mes)

**Justificación:**
- Free plan: Suficiente para desarrollo y testing
- Pro plan: Necesario para soportar 250-500 usuarios concurrentes
- Análisis de concurrencia (ANALISIS_ARQUITECTURA_AVANZADA.md):
  - Free: ~100 usuarios simultáneos
  - Pro: 250-500 usuarios simultáneos ✅
- Team plan: Solo si vendemos a promotoras grandes (>10 PHs)

**Costo anual (producción):** $300 USD/año

---

### **3. GitHub (Control de Versiones)**

| Plan | Costo | Límites | Recomendación |
|------|-------|---------|---------------|
| **Free** | $0/mes | Repos públicos ilimitados, 2,000 min Actions | ✅ **SUFICIENTE** |
| **Team** | $4/usuario/mes | Repos privados, 3,000 min Actions | ⏸️ Si necesitamos privacidad |

**Decisión:** ✅ **GitHub Free ($0/mes)**

**Justificación:**
- Repositorio público: OK para proyecto open source o demo
- Si necesitamos privacidad: Team ($4/mes) = $48/año
- GitHub Actions Free: 2,000 min/mes = suficiente para CI/CD básico

**Costo anual:** $0 USD/año (o $48 si privado)

---

### **4. Dominio y Hosting**

| Servicio | Costo | Recomendación |
|----------|-------|---------------|
| **Dominio (.com)** | $12/año | ✅ assembly2.com |
| **Hosting (Next.js)** | $0/mes | ✅ Vercel Free (producción) |
| **CDN** | $0/mes | ✅ Incluido en Vercel |

**Decisión:** 
- ✅ **Vercel Free** (unlimited bandwidth, 100 GB/mes)
- ✅ **Dominio: $12/año**

**Justificación:**
- Vercel Free: Perfecto para Next.js, deploy automático desde GitHub
- Sin límites de requests para apps serverless
- CDN global incluido
- Upgrade a Pro ($20/mes) solo si necesitamos >100 GB/mes

**Costo anual:** $12 USD/año

---

### **5. Email Transaccional (OTP, notificaciones)**

| Servicio | Costo | Límites | Recomendación |
|----------|-------|---------|---------------|
| **Supabase Auth** | $0 (incluido) | Ilimitado | ✅ **USAR ESTE** |
| **SendGrid** | $0/mes | 100 emails/día | Backup |
| **Resend** | $0/mes | 3,000 emails/mes | Backup |

**Decisión:** ✅ **Supabase Auth (incluido en plan)**

**Justificación:**
- Supabase maneja OTP internamente
- No necesitamos servicio externo
- Si Supabase falla: SendGrid Free (100/día) como backup

**Costo anual:** $0 USD/año

---

### **6. Telegram Bot (Chatbot)**

| Servicio | Costo | Límites | Recomendación |
|----------|-------|---------|---------------|
| **Telegram Bot API** | $0 | Ilimitado | ✅ **GRATIS** |

**Decisión:** ✅ **Telegram Bot API (Free)**

**Costo anual:** $0 USD/año

---

### **7. Google Gemini (IA del Chatbot)**

| Plan | Costo | Límites | Recomendación |
|------|-------|---------|---------------|
| **Gemini 1.5 Flash (Free)** | $0/mes | 15 requests/min, 1,500 requests/día | ✅ **Para demo** |
| **Gemini Pro** | $0.0005/request | Sin límites | ⏸️ Para producción si necesario |

**Decisión:** ✅ **Gemini 1.5 Flash Free**

**Justificación:**
- Free: 1,500 requests/día = ~50 conversaciones/día = suficiente para demo
- Costo mínimo si escalamos: $0.0005/request
- Ejemplo: 10,000 conversaciones/mes = $5/mes

**Costo anual estimado (producción):** $60 USD/año (~5k conversaciones/mes)

---

## 📊 TABLA RESUMEN DE COSTOS

| PLATAFORMA | DESARROLLO (3 meses) | PRODUCCIÓN (mensual) | PRODUCCIÓN (anual) |
|------------|----------------------|----------------------|--------------------|
| **Cursor Pro** | $60 | $20 | $240 |
| **Supabase** | $0 (Free) | $25 (Pro) | $300 |
| **GitHub** | $0 (Free) | $0 (Free) | $0 |
| **Dominio** | $0 | $1 (amortizado) | $12 |
| **Vercel Hosting** | $0 (Free) | $0 (Free) | $0 |
| **Email (Supabase)** | $0 (incluido) | $0 (incluido) | $0 |
| **Telegram Bot** | $0 (Free) | $0 (Free) | $0 |
| **Gemini IA** | $0 (Free) | $5 (estimado) | $60 |
| **TOTAL** | **$60** | **$51** | **$612** |

---

## 🚀 COSTOS DE DESARROLLO (CURSOR)

### **Uso de Tokens por Agente:**

| AGENTE | MODELO | COSTO POR TOKEN | USO ESTIMADO/DÍA | COSTO/DÍA |
|--------|--------|-----------------|------------------|-----------|
| **Arquitecto** | Sonnet 4.5 | Incluido en Pro | ~50k tokens | $0 |
| **Contralor** | Opus 4.5 | Incluido en Pro | ~30k tokens | $0 |
| **Database** | Sonnet 4.5 | Incluido en Pro | ~40k tokens | $0 |
| **Coder** | GPT-5.2 Codex | Incluido en Pro | ~80k tokens | $0 |
| **Marketing** | GPT-5.2 | Incluido en Pro | ~20k tokens | $0 |
| **QA** | Sonnet 4.5 | Incluido en Pro | ~30k tokens | $0 |
| **TOTAL** | - | - | **~250k tokens/día** | **$0** |

**Nota:** Cursor Pro = unlimited requests = $0 costo adicional por token

---

## ⚡ OPTIMIZACIÓN DE RECURSOS

### **1. Estrategia de Uso de Modelos:**

```
TAREA                          | MODELO ÓPTIMO      | JUSTIFICACIÓN
-------------------------------|--------------------|-----------------
Diseño de arquitectura         | Sonnet 4.5         | Razonamiento profundo
SQL avanzado                   | Sonnet 4.5         | Especialización en SQL
Código Next.js/React           | GPT-5.2 Codex      | Sintaxis perfecta
Copywriting marketing          | GPT-5.2            | Creatividad
Auditoría completa             | Opus 4.5           | Máxima capacidad
Testing sistemático            | Sonnet 4.5         | Detección de bugs
Documentación                  | Sonnet 4.5         | Claridad y estructura
```

**Principio:** 🎯 **Usar el modelo MÁS ECONÓMICO que sea SUFICIENTE**

Ejemplo:
- ❌ NO usar Opus 4.5 para escribir SQL simple (desperdicio)
- ✅ Usar Sonnet 4.5 para SQL avanzado
- ✅ Usar GPT-5.2 Codex para React (más rápido y especializado)

---

### **2. Evitar Reprocesos (ahorra tokens):**

#### ❌ **Prácticas que DESPERDICIAN tokens:**
```
1. Modificar el mismo archivo múltiples veces
   Solución: Planificar bien antes de implementar

2. Generar código sin leer documentación primero
   Solución: Leer ARQUITECTURA_*.md antes de codear

3. No hacer Git commits frecuentes (riesgo de pérdida)
   Solución: Commit cada 30-60 min

4. Pedir explicaciones de código recién generado
   Solución: Código auto-documentado + comentarios

5. Regenerar componentes por falta de planning
   Solución: Arquitecto diseña, luego Coder implementa

6. Múltiples agentes leyendo el mismo archivo
   Solución: Un agente lee, luego comparte resumen
```

#### ✅ **Prácticas que OPTIMIZAN tokens:**
```
1. Documentación primero, código después
   Ahorro: 70% menos reprocesos

2. Git commits frecuentes
   Ahorro: 100% de pérdida de código

3. Reutilización de componentes
   Ahorro: 50% menos código generado

4. Caching de reglas legales en BD (no regenerar)
   Ahorro: 1,250x menos queries

5. Batch operations (votos, updates)
   Ahorro: 50x menos requests

6. Un agente por archivo (no conflictos)
   Ahorro: 100% de conflictos Git
```

---

### **3. Límites y Alertas:**

```
MÉTRICA                        | LÍMITE SUGERIDO    | ACCIÓN
-------------------------------|--------------------|-----------------
Tokens/día (Cursor)            | 250k tokens        | Cursor Pro = ilimitado ✅
Requests Supabase (Dev)        | 40k/mes            | Monitorear, upgrade a Pro si necesario
Conexiones Realtime (Dev)      | 150 usuarios       | Upgrade a Pro si testing >150
GitHub Actions minutos         | 1,500 min/mes      | Suficiente con Free
Conversaciones Gemini/día      | 1,000              | Suficiente con Free
```

**Sistema de alertas:**
- 🟢 Verde: <70% del límite
- 🟡 Amarillo: 70-90% del límite (monitorear)
- 🔴 Rojo: >90% del límite (tomar acción)

---

## 💡 ESTRATEGIA DE AHORRO

### **Fase 1: Desarrollo (0-3 meses)**

```
OBJETIVO: Minimizar costos hasta validar el producto

✅ Cursor Pro: $20/mes (necesario)
✅ Supabase Free: $0/mes (suficiente para desarrollo)
✅ GitHub Free: $0/mes (suficiente)
✅ Vercel Free: $0/mes (deploy de demos)
✅ Gemini Free: $0/mes (1,500 requests/día = suficiente)

TOTAL: $20/mes = $60 en 3 meses
```

---

### **Fase 2: Lanzamiento (mes 4)**

```
OBJETIVO: Preparar para primeros clientes

✅ Cursor Pro: $20/mes (mantenimiento)
✅ Supabase Pro: $25/mes (upgrade para producción)
✅ Dominio: $12/año ($1/mes amortizado)
✅ Gemini Free: $0/mes (hasta 50 conversaciones/día)

TOTAL: $46/mes
```

---

### **Fase 3: Crecimiento (mes 5+)**

```
OBJETIVO: Escalar según demanda

✅ Cursor Pro: $20/mes (mantenimiento)
✅ Supabase Pro: $25/mes (hasta 500 usuarios)
✅ Gemini: $5/mes (si >1,500 conversaciones/día)
✅ Si >10 clientes: Considerar Supabase Team ($599/mes)

TOTAL: $51-$650/mes (según escala)
```

---

### **Regla de Escala:**

```
INGRESOS MENSUALES           | PLAN SUPABASE RECOMENDADO
-----------------------------|---------------------------
<$500/mes (1-2 clientes)     | Pro ($25/mes) ✅
$500-$5,000 (3-20 clientes)  | Pro ($25/mes) ✅
$5,000-$20,000 (20-80 PH)    | Team ($599/mes)
>$20,000/mes (80+ PH)        | Enterprise (custom)

OBJETIVO: Costos operativos < 5% de ingresos
```

---

## 📈 ROI DEL PROYECTO

### **Inversión Inicial:**

```
Desarrollo (3 meses):
├─ Cursor Pro: $60
├─ Tiempo de desarrollo: 0 (Henry usa agentes IA)
└─ TOTAL INVERSIÓN: $60 USD
```

### **Costos Operativos (mensual):**

```
Producción:
├─ Cursor Pro: $20/mes
├─ Supabase Pro: $25/mes
├─ Dominio: $1/mes
├─ Gemini: $5/mes
└─ TOTAL MENSUAL: $51 USD/mes
```

### **Ingresos Proyectados:**

Basado en `MARKETING_PRECIOS_COMPLETO.md`:

```
ESCENARIO CONSERVADOR (3 clientes):
├─ 1 cliente Standard: $189/mes
├─ 1 cliente Standard: $189/mes
├─ 1 cliente Standard: $189/mes
└─ TOTAL INGRESOS: $567/mes

Ganancia neta: $567 - $51 = $516/mes
Ganancia anual: $516 x 12 = $6,192/año
ROI: ($6,192 - $60) / $60 = 10,220%
```

```
ESCENARIO MODERADO (10 clientes):
├─ 5 clientes Standard: $945/mes
├─ 3 clientes Evento Único: $225 x 3 = $675/mes (promedio)
├─ 2 clientes Multi-PH: $1,398/mes
└─ TOTAL INGRESOS: $3,018/mes

Ganancia neta: $3,018 - $51 = $2,967/mes
Ganancia anual: $2,967 x 12 = $35,604/año
ROI: ($35,604 - $60) / $60 = 59,240%
```

```
ESCENARIO OPTIMISTA (1 cliente Enterprise):
├─ 1 cliente Enterprise: $2,499/mes
└─ TOTAL INGRESOS: $2,499/mes

Ganancia neta: $2,499 - $51 = $2,448/mes
Ganancia anual: $2,448 x 12 = $29,376/año
ROI: ($29,376 - $60) / $60 = 48,860%

Nota: Con Enterprise, upgrade a Supabase Team ($599/mes)
Ganancia neta ajustada: $2,499 - $625 = $1,874/mes
```

---

### **Break-even (punto de equilibrio):**

```
Costos mensuales: $51
Precio plan más bajo: Standard ($189/mes)

Clientes necesarios: $51 / $189 = 0.27 clientes
= 1 cliente Standard = suficiente para break-even ✅

Tiempo para break-even: 
- Si vendemos 1 cliente en mes 4: Inmediato
- Inversión inicial ($60) recuperada en: 1 mes
```

---

## 🎯 RECOMENDACIONES DEL CONTRALOR

### **1. Para Henry (Product Owner):**

```
✅ APROBAR MVP 30 DÍAS
   - Costo desarrollo: $20 (1 mes Cursor Pro)
   - Costo producción: $46/mes
   - Break-even: 1 cliente Standard

✅ PRIORIDADES PARA MVP:
   1. Dashboard Admin PH (CRUD propietarios + crear asamblea)
   2. Votación básica (temas + votar + resultados)
   3. Quórum Ley 284 (hardcodeado, no plugins)
   4. Acta simple (texto, no PDF fancy)

❌ POSPONER PARA FASE 2:
   - Plugins Legales multi-país
   - Dashboard Admin Plataforma completo
   - Optimización 250+ usuarios
   - Poderes digitales con OCR
   - WebAuthn/Face ID

✅ TRIGGERS DE UPGRADE:
   - >3 clientes simultáneos → Supabase Pro ($25)
   - >5 asambleas simultáneas → Revisar arquitectura
   - >10 clientes → Considerar Supabase Team ($599)
```

### **2. Tabla de Decisión por Número de Clientes:**

| CLIENTES | ASAMBLEAS/MES | PLAN SUPABASE | COSTO TOTAL | INGRESOS | MARGEN |
|----------|---------------|---------------|-------------|----------|--------|
| 1 | 1-2 | Free | $21/mes | $189 | 89% |
| 3 | 3-6 | Pro | $46/mes | $567 | 92% |
| 5 | 5-10 | Pro | $51/mes | $945 | 95% |
| 10 | 10-20 | Team | $650/mes | $1,890 | 66% |

### **3. Para Henry (Product Owner) - Decisión Inmediata:**

```
✅ APROBAR Cursor Pro ($20/mes)
   - Necesario para desarrollo ágil
   - Ilimitado = sin preocupaciones de límites
   - ROI: Se recupera con 1 cliente

✅ MANTENER Supabase Free durante desarrollo
   - Suficiente para testing hasta 100 usuarios
   - Upgrade a Pro ($25/mes) solo al lanzar con cliente real

✅ MONITOREAR consumo de recursos semanalmente
   - Dashboard de Supabase: Conexiones Realtime
   - Si >150 conexiones simultáneas → Upgrade a Pro
   - Si >500 conexiones → Evaluar Team o alternativa SSE
```

---

### **2. Para Agentes IA:**

```
✅ Arquitecto: Diseña BIEN desde el inicio (evitar reprocesos)
✅ Database: Crea schema OPTIMIZADO (evitar migraciones costosas)
✅ Coder: Lee documentación ANTES de implementar
✅ QA: Testing TEMPRANO (bugs tempranos = menos costosos)
✅ Marketing: Copy FINAL antes de implementar (evitar cambios)
✅ Contralor: Audita DIARIAMENTE (detecta desperdicios rápido)
```

---

### **3. Estrategia de Escala:**

```
1-2 clientes:
   ✅ Mantener Supabase Pro ($25/mes)
   ✅ Gemini Free ($0/mes)

3-20 clientes:
   ✅ Mantener Supabase Pro ($25/mes)
   ✅ Considerar Gemini Pro ($5-20/mes)

20-80 clientes:
   ✅ Upgrade a Supabase Team ($599/mes)
   ✅ Gemini Pro ($20-50/mes)
   ✅ Considerar CDN dedicado

80+ clientes:
   ✅ Supabase Enterprise (custom pricing)
   ✅ Infraestructura dedicada
   ✅ Contratar equipo de DevOps
```

---

## 📊 DASHBOARD DE COSTOS (para Henry)

### **Métricas a Monitorear:**

```
MÉTRICA                        | VALOR ACTUAL | LÍMITE | STATUS
-------------------------------|--------------|--------|--------
Cursor requests/día            | 250k tokens  | Ilimitado | 🟢
Supabase requests/mes          | 40k          | 50k    | 🟢
Supabase storage               | 200 MB       | 500 MB | 🟢
Supabase bandwidth             | 1.5 GB       | 2 GB   | 🟡
Realtime connections           | 150          | 200    | 🟡
GitHub Actions minutos/mes     | 1,200        | 2,000  | 🟢
Gemini requests/día            | 1,000        | 1,500  | 🟡
Costo mensual total            | $51          | $100   | 🟢
```

---

## 🔐 PLATAFORMAS CONFIRMADAS

### **Stack Tecnológico Final:**

```
✅ DESARROLLO:
   - Cursor Pro ($20/mes) - IDE con IA
   - Git + GitHub Free - Control de versiones
   - Docker local - Ambiente de desarrollo

✅ BACKEND:
   - Supabase Pro ($25/mes en producción) - PostgreSQL + Auth + Realtime + Storage
   - Next.js 14 - Framework fullstack
   - Vercel Free - Hosting y deploy

✅ FRONTEND:
   - React 18 + TypeScript
   - Tailwind CSS
   - Next.js App Router

✅ INTEGRACIONES:
   - Telegram Bot API (Free) - Chatbot
   - Google Gemini 1.5 Flash (Free) - IA del chatbot
   - Supabase Auth (incluido) - Email OTP
   - Supabase Realtime (incluido) - WebSockets

✅ MONITORING:
   - Supabase Dashboard - Métricas de BD
   - Vercel Analytics - Performance de app
   - GitHub Insights - Actividad del repo
```

---

## 📋 CHECKLIST DE OPTIMIZACIÓN

### **Para el Contralor (revisar semanalmente):**

```
[ ] Revisar uso de Supabase (requests, storage, bandwidth)
[ ] Auditar reprocesos de código (commits duplicados)
[ ] Verificar que agentes usan modelo óptimo por tarea
[ ] Detectar código duplicado (oportunidad de reutilización)
[ ] Revisar logs de Gemini (optimizar prompts del chatbot)
[ ] Monitorear GitHub Actions (optimizar workflows CI/CD)
[ ] Calcular costo/beneficio de cada feature
[ ] Reportar a Henry: uso vs límites
```

---

## 📞 CONTACTO PARA DUDAS

**Responsable:** Contralor  
**Modelo:** Opus 4.5  
**Función:** Gestión de costos, optimización de recursos, reportes a Henry

**Preguntas frecuentes:**
- ¿Cuánto cuesta agregar X feature?
- ¿Estamos cerca del límite de Supabase?
- ¿Qué modelo IA debo usar para Y tarea?
- ¿Cuándo debo hacer upgrade de plan?
- ¿Cuál es el ROI actual del proyecto?

**Respuesta:** Consulta este documento o pregunta al Contralor

---

**Fecha:** 30 Enero 2026  
**Versión:** 2.0 (Actualizado con simulación de asambleas)  
**Autor:** Contralor Assembly 2.0  
**Próxima revisión:** Semanal (cada lunes)

---

## 📈 RESUMEN EJECUTIVO PARA HENRY

### **Corto Plazo (30 días - MVP):**
```
Inversión: $20 (desarrollo)
Costo mes 1 producción: $46
Clientes para break-even: 1 (Standard $189)
Ganancia mes 1: $143
```

### **Mediano Plazo (3-6 meses):**
```
Clientes objetivo: 3-5
Costo mensual: $46-$51
Ingresos esperados: $567-$945/mes
Margen: 92-95%
Upgrade necesario: Supabase Pro a partir de 3 clientes
```

### **Largo Plazo (12 meses):**
```
Clientes objetivo: 10+
Costo mensual: $50-$650 (depende de concurrencia)
Ingresos esperados: $1,890+/mes
Decisión crítica: Si >5 asambleas simultáneas → Supabase Team
Alternativa: Optimizar con SSE/polling en lugar de Realtime constante
```

---

**Henry, este documento te da visibilidad completa de costos y proyecciones según el número de asambleas simultáneas. El Contralor es responsable de mantenerlo actualizado semanalmente.** 💰
