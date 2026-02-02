# 📊 COMPARACIÓN: VISTAS DE MONITOR
## Dashboard Henry vs Dashboard Admin PH

**Fecha:** 30 Enero 2026  
**Versión:** 1.0  
**Autor:** Arquitecto  
**Solicitado por:** Henry Batista

---

## 🎯 **OBJETIVO:**

Validar y comparar las dos vistas de monitor diferentes:
1. **Monitor Henry** (Admin Plataforma) - Monitoreo de infraestructura
2. **Monitor Admin PH** (Cliente) - Monitoreo de votaciones en asamblea

---

## 📋 **TABLA COMPARATIVA:**

| Aspecto | 👨‍💼 ADMIN HENRY (Platform Owner) | 🏢 ADMIN PH (Cliente) |
|---------|-----------------------------------|----------------------|
| **Usuario** | Henry (dueño de Assembly 2.0) | Administrador de PH (cliente) |
| **URL** | `/platform-admin/monitoring` | `/dashboard/admin-ph/monitor/[assemblyId]` |
| **Propósito** | Monitorear infraestructura y recursos | Monitorear votaciones de su asamblea |
| **Acceso** | Solo Henry | Cada Admin PH ve solo sus asambleas |
| **Datos que ve** | TODOS los clientes y servidor | Solo su organización |
| **Tiempo real** | Métricas cada 30 seg | WebSocket en vivo (<2 seg) |

---

## 🖥️ **MONITOR HENRY (Platform Owner)**

### **Ubicación:** `/platform-admin/monitoring`

### **Propósito:**
Monitorear la **infraestructura completa** del VPS y **predecir** cuándo necesita hacer upgrade.

### **Pantallas incluidas:**

```
┌─────────────────────────────────────────────────────┐
│  🖥️ MONITOREO DE INFRAESTRUCTURA - Assembly 2.0     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ 💻 CPU   │ │ 💾 RAM   │ │ 💽 Disco │ │🔌 DB   ││
│  │  45%     │ │  62%     │ │  38%     │ │125/500 ││
│  │  ✅ OK   │ │  ✅ OK   │ │  ✅ OK   │ │ ✅ OK  ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                                                     │
│  📈 Gráficas Históricas (Últimas 24h)             │
│  ├─ Line Chart: CPU/RAM                           │
│  └─ Line Chart: Usuarios Activos                  │
│                                                     │
│  🚨 Alertas Activas (2)                           │
│  ├─ 🚀 Upgrade recomendado para 15 Feb           │
│  └─ 🔥 CPU alto sostenido (87%)                  │
│                                                     │
│  📅 Predicción de Carga (Próximos 30 días)        │
│  ┌────────┬──────────┬──────────┬──────────────┐  │
│  │ Fecha  │ Asamb.   │ Usuarios │ Estado       │  │
│  ├────────┼──────────┼──────────┼──────────────┤  │
│  │ 15 Feb │ 8        │ 9,200    │⚠️ UPGRADE    │  │
│  │ 20 Feb │ 3        │ 1,800    │✅ OK         │  │
│  └────────┴──────────┴──────────┴──────────────┘  │
│                                                     │
│  💰 Gráficas de Vista Rápida                      │
│  ├─ Ingresos vs Costos (Line)                     │
│  ├─ Recursos VPS (Doughnut)                       │
│  ├─ Asambleas Programadas (Bar)                   │
│  ├─ Heatmap Ocupación Mensual                     │
│  └─ Gauge Capacidad Actual                        │
└─────────────────────────────────────────────────────┘
```

### **Funcionalidades:**

#### **1. Métricas en Tiempo Real:**
```typescript
interface ServerMetrics {
  cpu_usage_percent: number;      // 45%
  ram_usage_percent: number;      // 62%
  disk_usage_percent: number;     // 38%
  db_connections_active: number;  // 125/500
  websocket_connections: number;  // 2,200
  active_assemblies: number;      // 8
  active_users: number;          // 1,800
}
```

**Actualización:** Cada 30 segundos

#### **2. Predicción Inteligente:**
```sql
-- Función SQL que predice carga futura
SELECT * FROM predict_capacity_needs();

-- Retorna:
Fecha: 15 Feb 2026
Asambleas: 8 simultáneas
Usuarios: 9,200 estimados
Capacidad actual: 7,500 (CX51)
Recomendación: 🚨 UPGRADE a CX61
```

#### **3. Alertas Proactivas:**
```
🚨 Alertas que Henry recibe:

1. CPU_HIGH (>80% sostenido 10 min)
2. RAM_HIGH (>85%)
3. DISK_HIGH (>90%)
4. UPGRADE_RECOMMENDED (7 días antes)
5. PEAK_LOAD_WARNING (pico esperado)
6. CAPACITY_EXCEEDED (ya excedió)
```

#### **4. Email Diario (6 AM):**
```
Para: henry@assembly2.com
Asunto: 📊 Reporte Diario - 2 alertas activas

🚨 Alertas Activas (2)
───────────────────────────────────────
🚀 Upgrade Recomendado para 15 Febrero 2026
🔥 CPU Alto Sostenido (87%)

📅 Predicciones (Próximos 7 días)
15 Feb: 8 asambleas ⚠️ UPGRADE
20 Feb: 3 asambleas ✅ OK

[Ver Dashboard Completo]
```

#### **5. Gráficas de Vista Rápida:**

**a) Ingresos vs Costos (Line Chart):**
```
Muestra los últimos 30 días:
- Línea verde: Ingresos ($15,245/mes)
- Línea roja: Costos ($398/mes)
- Margen: 97.4%
```

**b) Recursos VPS (Doughnut):**
```
CPU: 45% usado / 55% libre
RAM: 62% usado / 38% libre
Disco: 38% usado / 62% libre
```

**c) Asambleas Programadas (Bar Chart):**
```
Próximos 7 días con línea de capacidad máxima (30)
Barras verdes si <10, rojas si >25
```

**d) Heatmap de Ocupación Mensual:**
```
Calendario completo del mes
Colores por intensidad:
⚪ 0 asambleas
🟢 1-10 asambleas
🟡 11-20 asambleas
🟠 21-25 asambleas
🔴 26-30 asambleas
```

**e) Gauge de Capacidad Actual:**
```
Gauge circular mostrando:
12/30 asambleas = 40%
Estado: ✅ VPS Suficiente
```

### **Datos que ve Henry:**

```
✅ Métricas de TODOS los clientes juntos:
   ├─ Total asambleas activas (todas las orgs)
   ├─ Total usuarios conectados
   ├─ Recursos del servidor (CPU, RAM, Disco)
   ├─ Conexiones DB, Redis, WebSocket
   └─ Predicción basada en TODAS las asambleas programadas

✅ Ingresos y costos totales
✅ Alertas de capacidad del VPS
✅ Recomendaciones de upgrade
```

### **Lo que NO ve Henry aquí:**
```
❌ Detalles de votaciones específicas de un cliente
❌ Quién votó qué en una asamblea específica
❌ Resultados de votaciones individuales
❌ Lista de propietarios de un PH específico

(Eso lo ve en otro dashboard: Platform Admin General)
```

---

## 🏢 **MONITOR ADMIN PH (Cliente)**

### **Ubicación:** `/dashboard/admin-ph/monitor/[assemblyId]`

### **Propósito:**
Monitorear en **tiempo real** la **votación activa** de SU asamblea específica.

### **Pantallas incluidas:**

```
┌─────────────────────────────────────────────────────┐
│  📊 MONITOR DE ASAMBLEA - Urban Tower               │
│  Asamblea Ordinaria 2026 - 15 Feb 2026             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [📊 Resumen] [🏢 Matriz de Unidades]              │
│                                                     │
│  ═══════════════════════════════════════════════   │
│  VISTA 1: RESUMEN (seleccionada)                   │
│  ═══════════════════════════════════════════════   │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ 👥 Total │ │ ✅ Pres. │ │ 🗳️ Votar │ │⚠️ Mora ││
│  │  200     │ │  131     │ │  95      │ │  12    ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                                                     │
│  📊 Quórum Actual: 65.4% ✅ ALCANZADO             │
│  ████████████████░░░░░░░░░░░░░░░░░░░░             │
│                                                     │
│  🗳️ Votación Activa:                              │
│  "Tema 2: Aprobación de Presupuesto 2026"         │
│                                                     │
│  ✅ SÍ:         78.2% ████████████░░░░             │
│  ❌ NO:         15.1% ███░░░░░░░░░░░░              │
│  ⚪ ABSTENCIÓN:  6.7% ██░░░░░░░░░░░░░              │
│                                                     │
│  Votos emitidos: 95 / 131 presentes (72.5%)       │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│  📊 MONITOR DE ASAMBLEA - Urban Tower               │
│  [📊 Resumen] [🏢 Matriz de Unidades] ← activa     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ═══════════════════════════════════════════════   │
│  VISTA 2: MATRIZ DE UNIDADES                       │
│  ═══════════════════════════════════════════════   │
│                                                     │
│  Filtros: [Torre: Todas ▼] [Zoom: Normal ▼]       │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ [GRID DE UNIDADES - 311 unidades]          │   │
│  │                                             │   │
│  │  A-101  A-102  A-103  A-104  A-105  ...    │   │
│  │   🟢    🟡     🟢     ⚫     🟢           │   │
│  │   ✅🔒  📱     ✅🔒   EN    ❌🔒          │   │
│  │                        MORA                 │   │
│  │  A-201  A-202  A-203  A-204  A-205  ...    │   │
│  │   🟡    🟢     ⚪     🟢     🟡           │   │
│  │   📱    ✅📱   AUS    ✅🔒   📱           │   │
│  │                                             │   │
│  │  ... (continúa hasta 311 unidades)         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Leyenda:                                          │
│  🟢 Presente + Votó    🟡 Presente + No votó      │
│  ⚪ Ausente            ⚫ En Mora (sin voto)       │
│                                                     │
│  ✅ Voto SÍ  ❌ Voto NO  ⚪ Abstención            │
│  🔒 Face ID  📱 Voto Manual                       │
└─────────────────────────────────────────────────────┘
```

### **Funcionalidades:**

#### **1. Vista Resumen (Tarjetas de Estadísticas):**
```typescript
interface AssemblySummary {
  total_owners: number;      // 200
  present_owners: number;    // 131
  voted_owners: number;      // 95
  mora_owners: number;       // 12
  face_id_owners: number;    // 118
  quorum_percent: number;    // 65.4%
  quorum_achieved: boolean;  // true
}
```

**Actualización:** Tiempo real vía WebSocket (<2 segundos)

#### **2. Vista Matriz de Unidades:**

**Grid adaptativo:**
```
200 unidades:  → 16 columnas (compacto)
311 unidades:  → 20 columnas (normal)
400 unidades:  → 25 columnas (normal)
600 unidades:  → 30 columnas (compacto)
```

**Colores por estado:**
```typescript
function getUnitColor(unit: Unit) {
  if (unit.payment_status === 'EN_MORA') 
    return '#64748b';  // ⚫ Gris oscuro
  
  if (!unit.is_present) 
    return '#e2e8f0';  // ⚪ Gris claro (ausente)
  
  if (unit.vote_value) 
    return '#22c55e';  // 🟢 Verde (ya votó)
  
  return '#fbbf24';    // 🟡 Amarillo (pendiente)
}
```

**Animación para pendientes:**
```css
.unit-cell.pending-vote {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

#### **3. Tooltip al Hover:**
```
Cuando el admin pasa el mouse sobre una unidad:

┌─────────────────────┐
│ 🏢 A-301           │
│ Juan Pérez         │
│ Torre: A           │
│ ✅ Presente        │
│ 🔒 Face ID activo  │
│ Voto: SÍ           │
│ Estado: Al Día     │
│ Hora: 19:45        │
└─────────────────────┘
```

#### **4. Filtros disponibles:**
```
Torre/Edificio:
├─ Todas
├─ Torre A
├─ Torre B
└─ Torre C

Zoom:
├─ Compacto (24px por celda)
├─ Normal (60px por celda)
└─ Grande (100px por celda)
```

#### **5. WebSocket en Tiempo Real:**
```typescript
// El admin recibe eventos instantáneos:

socket.on('vote_cast', (data) => {
  // Una unidad cambió de 🟡 amarillo a 🟢 verde
  updateUnitColor(data.unitId, 'green');
});

socket.on('attendance_updated', (data) => {
  // Una unidad cambió de ⚪ ausente a 🟡 presente
  updateUnitColor(data.unitId, 'yellow');
});

// Latencia: <2 segundos
```

### **Datos que ve el Admin PH:**

```
✅ Solo su asamblea específica:
   ├─ Lista completa de sus propietarios
   ├─ Estado de cada unidad (presente, votó, mora)
   ├─ Método de voto (Face ID o manual)
   ├─ Resultados de votación en vivo
   ├─ Quórum calculado automáticamente
   └─ Tooltip con info detallada de cada unidad

✅ Actualización en tiempo real (<2 seg)
✅ Gráficas de votación activa
✅ Histórico de votaciones anteriores
```

### **Lo que NO ve el Admin PH:**
```
❌ Recursos del servidor (CPU, RAM)
❌ Otras asambleas de otros clientes
❌ Ingresos/costos de la plataforma
❌ Alertas de capacidad del VPS
❌ Predicción de carga futura

(Eso solo lo ve Henry)
```

---

## 📊 **COMPARACIÓN LADO A LADO:**

### **MÉTRICAS MONITOREADAS:**

| Métrica | Henry | Admin PH |
|---------|-------|----------|
| CPU, RAM, Disco | ✅ | ❌ |
| Conexiones DB | ✅ | ❌ |
| WebSocket total | ✅ | ❌ |
| Asambleas activas (todas) | ✅ | ❌ |
| Predicción futura | ✅ | ❌ |
| Ingresos/Costos | ✅ | ❌ |
| **Su asamblea específica** | ❌ | ✅ |
| Quórum de su asamblea | ❌ | ✅ |
| Votaciones de su asamblea | ❌ | ✅ |
| Estado de cada unidad | ❌ | ✅ |
| Matriz visual de unidades | ❌ | ✅ |

### **ACTUALIZACIÓN DE DATOS:**

| Aspecto | Henry | Admin PH |
|---------|-------|----------|
| Frecuencia | Cada 30 seg | Tiempo real (<2 seg) |
| Tecnología | Polling | WebSocket |
| Propósito | Monitoreo general | Votación en vivo |

### **ALERTAS:**

| Tipo de Alerta | Henry | Admin PH |
|----------------|-------|----------|
| CPU/RAM alta | ✅ | ❌ |
| Upgrade recomendado | ✅ | ❌ |
| Pico de carga esperado | ✅ | ❌ |
| Email diario | ✅ | ❌ |
| Quórum alcanzado | ❌ | ✅ |
| Votación finalizada | ❌ | ✅ |
| Unidad votó | ❌ | ✅ |

---

## 📂 **ARCHIVOS DE REFERENCIA:**

### **Para Monitor Henry:**
```
Arquitecto/MODULO_MONITOREO_INFRAESTRUCTURA.md
└─ Sistema completo de monitoreo de VPS

Arquitecto/INSTRUCCIONES_DASHBOARD_HENRY_RECURSOS.md
└─ Mockup conceptual (complementario)

Arquitecto/ANALISIS_RENTABILIDAD_OPERATIVA.md
└─ Costos y capacidad para gráficas
```

### **Para Monitor Admin PH:**
```
Arquitecto/VISTA_PRESENTACION_TIEMPO_REAL.md
└─ VISTA 2: Matriz de Unidades (diseño completo)

Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md
└─ PANTALLA 4: Asamblea en Vivo

Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md
└─ FASE 5: Vista Monitor de Votación
```

---

## ✅ **VALIDACIÓN FINAL:**

### **¿Están bien separados?**

```
✅ SÍ - Cada dashboard tiene su propósito específico:

HENRY (Platform Owner):
└─ Monitorea infraestructura y capacidad
└─ Ve TODOS los clientes juntos
└─ Predice necesidades de upgrade
└─ Recibe alertas proactivas

ADMIN PH (Cliente):
└─ Monitorea SU asamblea específica
└─ Ve votaciones en tiempo real
└─ Grid visual de sus unidades
└─ Control de quórum y resultados
```

### **¿Hay solapamiento?**

```
❌ NO - Son completamente diferentes:

Datos en común: NINGUNO
Propósito: DIFERENTE
Usuario: DIFERENTE
Actualización: DIFERENTE (30s vs <2s)
```

### **¿Falta algo?**

```
HENRY:
✅ Métricas en tiempo real
✅ Predicción de carga
✅ Alertas proactivas
✅ Email diario
✅ Gráficas de vista rápida
✅ Recomendaciones de upgrade

ADMIN PH:
✅ Vista resumen (estadísticas)
✅ Matriz de unidades (grid visual)
✅ Colores por estado
✅ Animación en pendientes
✅ Tooltip con detalles
✅ Filtros (torre, zoom)
✅ WebSocket tiempo real
✅ Resultados de votación

TODO COMPLETO ✅
```

---

## 🚀 **IMPLEMENTACIÓN:**

### **Para el Coder:**

```
Dashboard Henry (Priority 2):
├─ Crear /platform-admin/monitoring/page.tsx
├─ Implementar QuickOverview component
├─ Agregar gráficas (Chart.js)
├─ Conectar a API /api/monitoring/*
└─ Testing con datos reales

Dashboard Admin PH (Priority 1 - URGENTE):
├─ Crear /dashboard/admin-ph/monitor/[assemblyId]/page.tsx
├─ Implementar UnitsMonitorView component
├─ Implementar UnitCell con colores y tooltip
├─ Agregar estilos CSS (grid adaptativo)
├─ Conectar WebSocket
└─ Testing con 200, 311, 600 unidades
```

---

## 📊 **RESUMEN VISUAL:**

```
┌───────────────────────────────────────────────────────┐
│                 ASSEMBLY 2.0                          │
├───────────────────────────────────────────────────────┤
│                                                       │
│  👨‍💼 HENRY (Platform Owner)                          │
│  └─ /platform-admin/monitoring                       │
│     ├─ 🖥️ Monitor de VPS (CPU, RAM, Disco)           │
│     ├─ 📈 Gráficas de Recursos                       │
│     ├─ 💰 Ingresos vs Costos                         │
│     ├─ 🔮 Predicción de Carga                        │
│     ├─ 🚨 Alertas de Upgrade                         │
│     └─ 📧 Email Diario 6 AM                          │
│                                                       │
│  ───────────────────────────────────────────────────  │
│                                                       │
│  🏢 ADMIN PH (Cliente)                                │
│  └─ /dashboard/admin-ph/monitor/[assemblyId]         │
│     ├─ 📊 Vista Resumen (estadísticas)               │
│     ├─ 🏢 Matriz de Unidades (grid visual)           │
│     ├─ 🟢🟡⚪⚫ Colores por estado                      │
│     ├─ ✅❌⚪ Iconos de voto                           │
│     ├─ 🔒📱 Método de voto                            │
│     ├─ 💬 Tooltip con detalles                       │
│     └─ ⚡ WebSocket tiempo real                       │
│                                                       │
└───────────────────────────────────────────────────────┘

CONCLUSIÓN: ✅ AMBOS DASHBOARDS ESTÁN COMPLETOS Y BIEN DIFERENCIADOS
```

---

**Fin de la Comparación**

**Henry, ¿todo validado correctamente?** ✅
