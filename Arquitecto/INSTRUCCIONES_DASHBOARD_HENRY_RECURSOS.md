# 📋 INSTRUCCIONES PARA ARQUITECTO
## Dashboard Admin Plataforma (Henry) - Monitor de Recursos

**Fecha:** 30 Enero 2026  
**Solicitado por:** Contralor (orden de Henry - Product Owner)  
**Prioridad:** 🔴 ALTA  
**Relacionado con:** FASE 7 - Dashboard Admin Plataforma

---

## 🎯 **OBJETIVO:**

Diseñar un módulo en el Dashboard de Henry que permita visualizar:
1. **Asambleas activas** (en vivo ahora mismo)
2. **Asambleas reservadas** (programadas futuras)
3. **Recomendación automática de recursos** (¿VPS $150 es suficiente?)
4. **Calendario de ocupación** con código de colores

---

## 📊 **CONTEXTO DEL NEGOCIO (Del Contralor):**

### **Estrategia de Escalabilidad:**

```
FASE 1 (Mes 1-3):  10 clientes → VPS CX51 ($150) SOBRA
FASE 2 (Mes 4-6):  20 clientes → VPS CX51 ($150) AÚN OK
FASE 3 (Mes 7+):   30+ clientes → Evaluar CX61 ($250)

REGLA: Upgrade solo cuando el calendario lo justifique
       NO antes, NO por suposiciones
```

### **Capacidad VPS Hetzner:**

| VPS | RAM | vCPU | Precio | Asambleas Simultáneas | Usuarios Concurrentes |
|-----|-----|------|--------|----------------------|----------------------|
| CX51 | 16 GB | 8 | $150/mes | 30 | 7,500 |
| CX61 | 24 GB | 12 | $250/mes | 50 | 12,500 |
| Multi-VPS | 32 GB+ | 16+ | $300/mes | 60+ | 15,000+ |

### **Fórmula de Recursos por Asamblea:**

```
Por cada asamblea activa (250 unidades promedio):
├─ RAM: ~300 MB
├─ CPU: ~0.25 vCPU
├─ Conexiones WebSocket: 250-300
└─ Queries PostgreSQL: ~50/segundo

VPS CX51 (16 GB RAM, 8 vCPU):
├─ RAM disponible: 12 GB (75% safe)
├─ Asambleas máx: 12 GB ÷ 300 MB = 40 asambleas
├─ CPU disponible: 6.4 vCPU (80% safe)
├─ Asambleas máx: 6.4 ÷ 0.25 = 25 asambleas
└─ LÍMITE PRÁCTICO: 25-30 asambleas simultáneas
```

---

## 🖥️ **DISEÑO REQUERIDO:**

### **PANTALLA: Monitor de Recursos y Capacidad**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 MONITOR DE RECURSOS - Assembly 2.0                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ ASAMBLEAS AHORA │  │ RESERVADAS HOY  │  │ CAPACIDAD VPS   │  │
│  │                 │  │                 │  │                 │  │
│  │      🟢 8       │  │      📅 12      │  │    ████░░ 40%   │  │
│  │    activas      │  │   programadas   │  │   12/30 slots   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📈 ESTADO DEL SERVIDOR:                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ RAM:  ████████░░░░░░░░░░░░  42% (6.7 GB / 16 GB)       │    │
│  │ CPU:  ██████░░░░░░░░░░░░░░  35% (2.8 / 8 vCPU)         │    │
│  │ DISK: ██████████████░░░░░░  68% (217 GB / 320 GB)      │    │
│  │ CONN: ████░░░░░░░░░░░░░░░░  22% (2,200 / 10,000)       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  🎯 RECOMENDACIÓN AUTOMÁTICA:                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ✅ VPS ACTUAL ES SUFICIENTE                            │    │
│  │                                                          │    │
│  │  Con 12 asambleas reservadas hoy, tu VPS CX51 ($150)    │    │
│  │  tiene capacidad de sobra. Puedes manejar hasta 30.     │    │
│  │                                                          │    │
│  │  Próxima evaluación: Cuando reserves >25 el mismo día   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **CALENDARIO DE OCUPACIÓN:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 CALENDARIO DE ASAMBLEAS - FEBRERO 2026                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Lu      Ma      Mi      Ju      Vi      Sá      Do         │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐            │
│  │      │      │      │      │      │   1  │   2  │            │
│  │      │      │      │      │      │  [3] │  [5] │            │
│  │      │      │      │      │      │  🟢  │  🟢  │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │   3  │   4  │   5  │   6  │   7  │   8  │   9  │            │
│  │  [2] │  [1] │  [0] │  [4] │  [8] │ [15] │ [12] │            │
│  │  🟢  │  🟢  │  ⚪  │  🟢  │  🟡  │  🟠  │  🟡  │            │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│  │  10  │  11  │  12  │  13  │  14  │  15  │  16  │            │
│  │  [6] │  [3] │  [2] │  [9] │ [22] │ [28] │ [18] │            │
│  │  🟢  │  🟢  │  🟢  │  🟡  │  🟠  │  🔴  │  🟠  │            │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘            │
│                                                                  │
│  LEYENDA:                                                        │
│  ⚪ 0 reservas     │  🟢 1-10 (libre)    │  🟡 11-20 (normal)   │
│  🟠 21-25 (ocupado) │  🔴 26-30 (lleno)  │  ⚠️ >30 (UPGRADE!)   │
│                                                                  │
│  ⚠️ ALERTA: 15 Feb tiene 28 reservas. Considera preparar VPS.   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **LÓGICA DE RECOMENDACIÓN AUTOMÁTICA:**

```typescript
interface ResourceRecommendation {
  status: 'OK' | 'WARNING' | 'UPGRADE_NEEDED';
  message: string;
  currentVPS: string;
  suggestedVPS: string | null;
  estimatedCost: number;
}

function getResourceRecommendation(
  activeAssemblies: number,
  reservedToday: number,
  maxReservedNext7Days: number
): ResourceRecommendation {
  
  const VPS_CAPACITY = {
    CX51: { max: 30, price: 150 },
    CX61: { max: 50, price: 250 },
    MULTI: { max: 100, price: 400 }
  };
  
  const currentVPS = 'CX51'; // Desde configuración
  const currentCapacity = VPS_CAPACITY[currentVPS].max;
  
  // Calcular pico esperado
  const peakExpected = Math.max(activeAssemblies, reservedToday, maxReservedNext7Days);
  const utilizationPercent = (peakExpected / currentCapacity) * 100;
  
  // Reglas de recomendación
  if (utilizationPercent <= 70) {
    return {
      status: 'OK',
      message: `✅ VPS actual es suficiente. Capacidad usada: ${utilizationPercent.toFixed(0)}%`,
      currentVPS,
      suggestedVPS: null,
      estimatedCost: VPS_CAPACITY[currentVPS].price
    };
  }
  
  if (utilizationPercent <= 90) {
    return {
      status: 'WARNING',
      message: `⚠️ Acercándote al límite (${utilizationPercent.toFixed(0)}%). Monitorea los próximos días.`,
      currentVPS,
      suggestedVPS: 'CX61',
      estimatedCost: VPS_CAPACITY.CX61.price
    };
  }
  
  // > 90%
  return {
    status: 'UPGRADE_NEEDED',
    message: `🔴 UPGRADE RECOMENDADO. Tienes ${peakExpected} asambleas esperadas vs ${currentCapacity} de capacidad.`,
    currentVPS,
    suggestedVPS: peakExpected > 50 ? 'MULTI' : 'CX61',
    estimatedCost: peakExpected > 50 ? VPS_CAPACITY.MULTI.price : VPS_CAPACITY.CX61.price
  };
}
```

---

### **ALERTAS AUTOMÁTICAS:**

```typescript
// Configuración de alertas
const ALERT_THRESHOLDS = {
  WARNING: 0.70,    // 70% capacidad → Notificación amarilla
  CRITICAL: 0.85,   // 85% capacidad → Email a Henry
  UPGRADE: 0.95     // 95% capacidad → Alerta roja + SMS
};

// Tipos de alerta
interface Alert {
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  action?: string;
  date?: string;
}

// Ejemplos de alertas a mostrar
const alerts: Alert[] = [
  {
    type: 'WARNING',
    title: 'Alta ocupación el 15 Feb',
    message: 'Tienes 28 asambleas reservadas (93% capacidad)',
    action: 'Ver opciones de upgrade',
    date: '2026-02-15'
  },
  {
    type: 'INFO',
    title: 'Semana tranquila',
    message: 'Próxima semana: máximo 12 asambleas/día',
    date: '2026-02-03'
  }
];
```

---

### **WIDGET DE COSTO VS CAPACIDAD:**

```
┌─────────────────────────────────────────────────────────────────┐
│  💰 ANÁLISIS COSTO/BENEFICIO                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VPS ACTUAL: Hetzner CX51                                       │
│  ├─ Costo: $150/mes                                             │
│  ├─ Capacidad: 30 asambleas simultáneas                         │
│  ├─ Uso actual: 12 asambleas (40%)                              │
│  └─ Estado: ✅ ÓPTIMO                                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  SI NECESITAS MÁS:                                              │
│                                                                  │
│  ┌─────────────┬──────────┬────────────┬─────────────────────┐  │
│  │ VPS         │ Precio   │ Capacidad  │ Costo/Asamblea      │  │
│  ├─────────────┼──────────┼────────────┼─────────────────────┤  │
│  │ CX51 (actual)│ $150/mes │ 30 asamb. │ $5.00/asamblea     │  │
│  │ CX61        │ $250/mes │ 50 asamb.  │ $5.00/asamblea     │  │
│  │ Multi-VPS   │ $400/mes │ 100 asamb. │ $4.00/asamblea     │  │
│  └─────────────┴──────────┴────────────┴─────────────────────┘  │
│                                                                  │
│  💡 TIP: El costo por asamblea se mantiene o baja al escalar.   │
│          1 cliente Standard ($189) = cubre VPS + ganancia.      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 **ESTRUCTURA DE ARCHIVOS A CREAR:**

```
src/app/platform-admin/
├─ resources/
│   └─ page.tsx              # Página principal de recursos
├─ components/
│   ├─ ResourceMonitor.tsx   # Widget de estado del servidor
│   ├─ AssemblyCalendar.tsx  # Calendario de ocupación
│   ├─ RecommendationCard.tsx # Tarjeta de recomendación
│   ├─ CostAnalysis.tsx      # Widget costo vs capacidad
│   └─ AlertsPanel.tsx       # Panel de alertas
└─ api/
    └─ resources/
        ├─ status/route.ts   # GET estado actual del servidor
        ├─ calendar/route.ts # GET reservas por fecha
        └─ recommend/route.ts # GET recomendación de VPS
```

---

## 🔗 **DATOS NECESARIOS:**

### **Del Backend:**

```typescript
// Endpoint: GET /api/resources/status
interface ServerStatus {
  ram: { used: number; total: number; percent: number };
  cpu: { used: number; total: number; percent: number };
  disk: { used: number; total: number; percent: number };
  connections: { active: number; max: number; percent: number };
  assemblies: {
    active: number;      // Asambleas en vivo ahora
    reservedToday: number; // Reservadas para hoy
    reservedWeek: number;  // Reservadas próximos 7 días
  };
}

// Endpoint: GET /api/resources/calendar?month=2026-02
interface CalendarDay {
  date: string;
  reserved: number;
  status: 'free' | 'normal' | 'busy' | 'full' | 'overflow';
}
```

### **De la Base de Datos:**

```sql
-- Contar asambleas activas (en vivo)
SELECT COUNT(*) as active_assemblies
FROM assemblies
WHERE status = 'live'
  AND started_at IS NOT NULL
  AND ended_at IS NULL;

-- Contar reservadas por fecha
SELECT 
  DATE(scheduled_date) as date,
  COUNT(*) as reserved
FROM assemblies
WHERE scheduled_date >= CURRENT_DATE
  AND status IN ('scheduled', 'confirmed')
GROUP BY DATE(scheduled_date)
ORDER BY date;

-- Pico de reservas en próximos 7 días
SELECT MAX(count) as max_reserved
FROM (
  SELECT DATE(scheduled_date), COUNT(*) as count
  FROM assemblies
  WHERE scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  GROUP BY DATE(scheduled_date)
) sub;
```

---

## ✅ **CRITERIOS DE ACEPTACIÓN:**

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | Henry puede ver asambleas activas en tiempo real | Dashboard muestra número actualizado |
| 2 | Calendario muestra reservas por día con colores | Código de colores funciona |
| 3 | Recomendación automática aparece según ocupación | Lógica de 70%/85%/95% funciona |
| 4 | Alertas se muestran cuando hay picos esperados | Notificaciones visibles |
| 5 | Widget de costo muestra comparación de VPS | Tabla con precios correctos |
| 6 | Datos se actualizan cada 30 segundos | Polling o WebSocket funciona |

---

## 📝 **NOTAS ADICIONALES:**

1. **NO hacer upgrade automático** - Solo recomendación, Henry decide
2. **Métricas reales del servidor** - Usar Prometheus/API de Hetzner si disponible
3. **Histórico** - Guardar datos para análisis de tendencias
4. **Exportar** - Botón para exportar calendario a Excel/PDF

---

**Fin de Instrucciones**

**Próximo paso:** Arquitecto diseña la arquitectura detallada y Coder implementa.
