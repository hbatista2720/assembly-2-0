# 🖥️ MÓDULO 8: MONITOREO DE INFRAESTRUCTURA Y CAPACIDAD
## Dashboard Henry - Sistema Proactivo de Alertas

**Fecha:** 30 Enero 2026  
**Versión:** 1.0  
**Autor:** Arquitecto  
**Prioridad:** 🔴 ALTA (Evita caídas durante asambleas)

---

## 🎯 **OBJETIVO:**

**Monitorear en tiempo real los recursos del VPS y predecir cuándo necesitas hacer upgrade ANTES de que se caiga el sistema durante una asamblea importante.**

---

## 📊 **FUNCIONALIDADES CLAVE:**

```
1. 📈 Métricas en Tiempo Real (CPU, RAM, Disco, Conexiones)
2. 🔮 Predicción de Carga (basado en asambleas programadas)
3. 🚨 Alertas Proactivas (7 días antes si necesitas upgrade)
4. 💡 Recomendaciones Automáticas (upgrade sugerido con costos)
5. 📅 Calendario de Carga (vista de asambleas vs capacidad)
6. 🔔 Notificaciones Multi-Canal (Email, Slack, WhatsApp)
```

---

## 🗄️ **BASE DE DATOS:**

### **Tabla 1: `server_metrics` (Historial de Métricas)**

```sql
CREATE TABLE IF NOT EXISTS server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CPU
  cpu_usage_percent NUMERIC(5,2) NOT NULL,  -- 0.00 - 100.00
  cpu_load_1min NUMERIC(5,2),               -- Load average
  cpu_load_5min NUMERIC(5,2),
  cpu_load_15min NUMERIC(5,2),
  
  -- RAM
  ram_total_mb INT NOT NULL,
  ram_used_mb INT NOT NULL,
  ram_free_mb INT NOT NULL,
  ram_usage_percent NUMERIC(5,2) NOT NULL,
  
  -- Disco
  disk_total_gb INT NOT NULL,
  disk_used_gb INT NOT NULL,
  disk_free_gb INT NOT NULL,
  disk_usage_percent NUMERIC(5,2) NOT NULL,
  
  -- PostgreSQL
  db_connections_active INT NOT NULL,
  db_connections_idle INT NOT NULL,
  db_connections_max INT NOT NULL,
  pgbouncer_clients INT DEFAULT 0,
  pgbouncer_servers INT DEFAULT 0,
  
  -- Redis
  redis_connected_clients INT DEFAULT 0,
  redis_used_memory_mb INT DEFAULT 0,
  
  -- WebSocket (Socket.io)
  websocket_connections INT DEFAULT 0,
  
  -- Asambleas activas
  active_assemblies INT DEFAULT 0,
  active_users_in_assemblies INT DEFAULT 0,
  
  -- Metadata
  server_type TEXT DEFAULT 'VPS',  -- 'VPS', 'CLOUD', 'DEDICATED'
  server_plan TEXT,                -- 'CX41', 'CX51', 'CX61'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_server_metrics_recorded_at ON server_metrics(recorded_at DESC);
CREATE INDEX idx_server_metrics_cpu ON server_metrics(cpu_usage_percent DESC);
CREATE INDEX idx_server_metrics_ram ON server_metrics(ram_usage_percent DESC);

-- Retention: Solo mantener últimos 30 días
CREATE OR REPLACE FUNCTION cleanup_old_server_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM server_metrics
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

### **Tabla 2: `capacity_alerts` (Alertas de Capacidad)**

```sql
CREATE TABLE IF NOT EXISTS capacity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'CPU_HIGH',              -- CPU >80% sostenido
    'RAM_HIGH',              -- RAM >85%
    'DISK_HIGH',             -- Disco >90%
    'DB_CONNECTIONS_HIGH',   -- PgBouncer near limit
    'UPGRADE_RECOMMENDED',   -- Necesitas plan superior
    'PEAK_LOAD_WARNING',     -- Carga pico en X días
    'CAPACITY_EXCEEDED'      -- Ya excediste capacidad
  )),
  
  -- Severidad
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Mensaje
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,  -- Acción sugerida
  
  -- Métrica que disparó la alerta
  metric_name TEXT,
  metric_value NUMERIC(10,2),
  threshold_value NUMERIC(10,2),
  
  -- Contexto
  assemblies_count INT DEFAULT 0,  -- Asambleas programadas que causan el problema
  predicted_peak_date TIMESTAMPTZ, -- Cuándo se espera el pico
  predicted_users INT,
  
  -- Upgrade recomendado
  current_plan TEXT,
  recommended_plan TEXT,
  upgrade_cost_monthly NUMERIC(10,2),
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  
  -- Notificaciones
  email_sent BOOLEAN DEFAULT FALSE,
  slack_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capacity_alerts_status ON capacity_alerts(status) WHERE status = 'active';
CREATE INDEX idx_capacity_alerts_severity ON capacity_alerts(severity DESC);
CREATE INDEX idx_capacity_alerts_type ON capacity_alerts(alert_type);
CREATE INDEX idx_capacity_alerts_created ON capacity_alerts(created_at DESC);
```

---

### **Tabla 3: `scheduled_assemblies_load` (Predicción de Carga)**

```sql
-- Vista materializada para calcular carga esperada por día
CREATE MATERIALIZED VIEW scheduled_assemblies_load AS
SELECT 
  DATE(a.scheduled_date) AS assembly_date,
  COUNT(a.id) AS assemblies_count,
  SUM(o.total_units) AS total_units,
  SUM(o.total_units * 0.7) AS estimated_active_users,  -- Asumiendo 70% participación
  MAX(o.total_units) AS max_units_single_assembly
FROM assemblies a
JOIN organizations o ON o.id = a.organization_id
WHERE a.status IN ('SCHEDULED', 'IN_PROGRESS')
  AND a.scheduled_date >= CURRENT_DATE
  AND a.scheduled_date <= CURRENT_DATE + INTERVAL '60 days'
GROUP BY DATE(a.scheduled_date)
ORDER BY assembly_date;

-- Refrescar cada hora
CREATE UNIQUE INDEX ON scheduled_assemblies_load(assembly_date);
```

---

## 📡 **BACKEND: SCRIPT DE MONITOREO**

### **Archivo: `scripts/monitor-server.js`**

```javascript
// Script que corre cada 2 minutos (cron job)
const { Client } = require('pg');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function collectMetrics() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  try {
    // 1. CPU
    const cpuUsage = getCPUUsage();
    const loadAvg = os.loadavg();
    
    // 2. RAM
    const totalRAM = Math.round(os.totalmem() / (1024 * 1024)); // MB
    const freeRAM = Math.round(os.freemem() / (1024 * 1024));
    const usedRAM = totalRAM - freeRAM;
    const ramPercent = ((usedRAM / totalRAM) * 100).toFixed(2);
    
    // 3. Disco
    const { stdout: dfOutput } = await execPromise('df -h / | tail -1');
    const diskData = dfOutput.split(/\s+/);
    const diskTotal = parseInt(diskData[1]);
    const diskUsed = parseInt(diskData[2]);
    const diskFree = parseInt(diskData[3]);
    const diskPercent = parseFloat(diskData[4]);
    
    // 4. PostgreSQL connections
    const pgResult = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE state = 'active') AS active,
        COUNT(*) FILTER (WHERE state = 'idle') AS idle,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    
    const dbConnections = pgResult.rows[0];
    
    // 5. PgBouncer stats (si está disponible)
    let pgbouncerClients = 0;
    let pgbouncerServers = 0;
    try {
      const pgbResult = await client.query('SHOW POOLS');
      if (pgbResult.rows.length > 0) {
        pgbouncerClients = pgbResult.rows[0].cl_active || 0;
        pgbouncerServers = pgbResult.rows[0].sv_active || 0;
      }
    } catch (e) {
      // PgBouncer no disponible
    }
    
    // 6. Redis connections (simulado, en producción usar redis-cli)
    const redisClients = 50; // TODO: Implementar con redis-cli INFO
    const redisMemory = 100;
    
    // 7. WebSocket connections (desde Socket.io)
    const wsConnections = await getWebSocketCount();
    
    // 8. Asambleas activas
    const assemblyResult = await client.query(`
      SELECT 
        COUNT(*) AS active_assemblies,
        SUM(o.total_units * 0.7) AS estimated_active_users
      FROM assemblies a
      JOIN organizations o ON o.id = a.organization_id
      WHERE a.status = 'IN_PROGRESS'
    `);
    
    const activeAssemblies = parseInt(assemblyResult.rows[0].active_assemblies) || 0;
    const activeUsers = parseInt(assemblyResult.rows[0].estimated_active_users) || 0;
    
    // 9. Insertar métricas en BD
    await client.query(`
      INSERT INTO server_metrics (
        cpu_usage_percent, cpu_load_1min, cpu_load_5min, cpu_load_15min,
        ram_total_mb, ram_used_mb, ram_free_mb, ram_usage_percent,
        disk_total_gb, disk_used_gb, disk_free_gb, disk_usage_percent,
        db_connections_active, db_connections_idle, db_connections_max,
        pgbouncer_clients, pgbouncer_servers,
        redis_connected_clients, redis_used_memory_mb,
        websocket_connections,
        active_assemblies, active_users_in_assemblies,
        server_plan
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17,
        $18, $19,
        $20,
        $21, $22,
        $23
      )
    `, [
      cpuUsage, loadAvg[0], loadAvg[1], loadAvg[2],
      totalRAM, usedRAM, freeRAM, ramPercent,
      diskTotal, diskUsed, diskFree, diskPercent,
      dbConnections.active, dbConnections.idle, dbConnections.max,
      pgbouncerClients, pgbouncerServers,
      redisClients, redisMemory,
      wsConnections,
      activeAssemblies, activeUsers,
      process.env.SERVER_PLAN || 'CX51'
    ]);
    
    console.log(`✅ Metrics collected: CPU ${cpuUsage}%, RAM ${ramPercent}%, Active Users: ${activeUsers}`);
    
    // 10. Verificar si necesita crear alertas
    await checkThresholdsAndAlert(client, {
      cpu: cpuUsage,
      ram: ramPercent,
      disk: diskPercent,
      dbConnections: dbConnections.active,
      maxConnections: dbConnections.max
    });
    
  } catch (error) {
    console.error('❌ Error collecting metrics:', error);
  } finally {
    await client.end();
  }
}

// Función para detectar CPU usage
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);
  
  return usage;
}

// Función para obtener WebSocket connections
async function getWebSocketCount() {
  // TODO: Implementar llamada a Socket.io server
  // Por ahora, retornar simulado
  return 0;
}

// Función para verificar umbrales y crear alertas
async function checkThresholdsAndAlert(client, metrics) {
  const alerts = [];
  
  // ALERTA 1: CPU >80% sostenido
  if (metrics.cpu > 80) {
    const recentHighCPU = await client.query(`
      SELECT COUNT(*) AS count
      FROM server_metrics
      WHERE cpu_usage_percent > 80
        AND recorded_at > NOW() - INTERVAL '10 minutes'
    `);
    
    if (recentHighCPU.rows[0].count >= 5) {  // 5 muestras en 10 min = sostenido
      alerts.push({
        type: 'CPU_HIGH',
        severity: 'high',
        title: '🔥 CPU Alto Sostenido',
        description: `CPU usage ha estado por encima de 80% durante los últimos 10 minutos (actual: ${metrics.cpu}%)`,
        recommendation: 'Considera hacer upgrade a un plan superior o reducir carga'
      });
    }
  }
  
  // ALERTA 2: RAM >85%
  if (metrics.ram > 85) {
    alerts.push({
      type: 'RAM_HIGH',
      severity: metrics.ram > 90 ? 'critical' : 'high',
      title: '💾 RAM Alta',
      description: `Uso de RAM: ${metrics.ram}%`,
      recommendation: metrics.ram > 90 
        ? '🚨 CRÍTICO: Upgrade inmediato recomendado' 
        : 'Monitorear y considerar upgrade'
    });
  }
  
  // ALERTA 3: Disco >90%
  if (metrics.disk > 90) {
    alerts.push({
      type: 'DISK_HIGH',
      severity: 'critical',
      title: '💽 Disco Casi Lleno',
      description: `Uso de disco: ${metrics.disk}%`,
      recommendation: 'Limpiar logs antiguos o aumentar storage'
    });
  }
  
  // ALERTA 4: Conexiones DB cerca del límite
  const connPercent = (metrics.dbConnections / metrics.maxConnections) * 100;
  if (connPercent > 70) {
    alerts.push({
      type: 'DB_CONNECTIONS_HIGH',
      severity: connPercent > 85 ? 'high' : 'medium',
      title: '🔌 Conexiones DB Altas',
      description: `Usando ${metrics.dbConnections} de ${metrics.maxConnections} conexiones (${connPercent.toFixed(1)}%)`,
      recommendation: 'Verificar PgBouncer pool size o aumentar max_connections'
    });
  }
  
  // Insertar alertas en BD (solo si no existen activas del mismo tipo)
  for (const alert of alerts) {
    await client.query(`
      INSERT INTO capacity_alerts (
        alert_type, severity, title, description, recommendation,
        metric_name, metric_value, status
      )
      SELECT $1, $2, $3, $4, $5, $6, $7, 'active'
      WHERE NOT EXISTS (
        SELECT 1 FROM capacity_alerts
        WHERE alert_type = $1 AND status = 'active'
      )
    `, [
      alert.type,
      alert.severity,
      alert.title,
      alert.description,
      alert.recommendation,
      alert.type.toLowerCase(),
      alert.type === 'CPU_HIGH' ? metrics.cpu : (alert.type === 'RAM_HIGH' ? metrics.ram : metrics.disk),
    ]);
  }
}

// Ejecutar
collectMetrics().catch(console.error);
```

---

## 🔮 **PREDICCIÓN DE CARGA (Función SQL)**

```sql
-- Función que predice si necesitas upgrade basado en asambleas programadas
CREATE OR REPLACE FUNCTION predict_capacity_needs()
RETURNS TABLE (
  date DATE,
  assemblies_count INT,
  estimated_users INT,
  current_capacity INT,
  needs_upgrade BOOLEAN,
  recommended_plan TEXT,
  alert_message TEXT
) AS $$
DECLARE
  current_plan TEXT := 'CX51';  -- Detectar del .env o tabla de configuración
  current_capacity INT := 7500;  -- CX51 = 7,500 usuarios simultáneos
BEGIN
  RETURN QUERY
  SELECT 
    sal.assembly_date::DATE,
    sal.assemblies_count::INT,
    sal.estimated_active_users::INT,
    current_capacity::INT,
    (sal.estimated_active_users > current_capacity * 0.8)::BOOLEAN AS needs_upgrade,
    CASE 
      WHEN sal.estimated_active_users > 12000 THEN 'CX61 (24GB RAM)'
      WHEN sal.estimated_active_users > 7500 THEN 'CX51 Upgrade ($250/mes)'
      ELSE current_plan
    END AS recommended_plan,
    CASE 
      WHEN sal.estimated_active_users > current_capacity THEN 
        '🚨 CRÍTICO: Excede capacidad actual'
      WHEN sal.estimated_active_users > current_capacity * 0.8 THEN 
        '⚠️ ADVERTENCIA: Cerca del límite (>80%)'
      ELSE 
        '✅ OK: Dentro de capacidad'
    END AS alert_message
  FROM scheduled_assemblies_load sal
  WHERE sal.assembly_date >= CURRENT_DATE
    AND sal.assembly_date <= CURRENT_DATE + INTERVAL '30 days'
  ORDER BY sal.assembly_date;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚨 **JOB DIARIO: CREAR ALERTAS PROACTIVAS**

```sql
-- Job que se ejecuta diariamente a las 6 AM
CREATE OR REPLACE FUNCTION generate_capacity_alerts()
RETURNS void AS $$
DECLARE
  prediction RECORD;
BEGIN
  -- Obtener predicciones de los próximos 30 días
  FOR prediction IN 
    SELECT * FROM predict_capacity_needs()
    WHERE needs_upgrade = TRUE
  LOOP
    -- Crear alerta si aún no existe
    INSERT INTO capacity_alerts (
      alert_type,
      severity,
      title,
      description,
      recommendation,
      assemblies_count,
      predicted_peak_date,
      predicted_users,
      current_plan,
      recommended_plan,
      upgrade_cost_monthly
    )
    SELECT 
      'UPGRADE_RECOMMENDED',
      CASE 
        WHEN prediction.date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
        WHEN prediction.date <= CURRENT_DATE + INTERVAL '14 days' THEN 'high'
        ELSE 'medium'
      END,
      format('🚀 Upgrade Recomendado para %s', prediction.date),
      format('Tienes %s asambleas programadas con ~%s usuarios. Tu capacidad actual es de 7,500 usuarios.',
        prediction.assemblies_count,
        prediction.estimated_users
      ),
      format('Considera upgrade a %s antes del %s', prediction.recommended_plan, prediction.date),
      prediction.assemblies_count,
      prediction.date::TIMESTAMPTZ,
      prediction.estimated_users,
      'CX51',
      prediction.recommended_plan,
      CASE 
        WHEN prediction.recommended_plan LIKE '%CX61%' THEN 250.00
        ELSE 150.00
      END
    WHERE NOT EXISTS (
      SELECT 1 FROM capacity_alerts
      WHERE alert_type = 'UPGRADE_RECOMMENDED'
        AND predicted_peak_date::DATE = prediction.date
        AND status = 'active'
    );
  END LOOP;
  
  -- Refrescar vista materializada
  REFRESH MATERIALIZED VIEW scheduled_assemblies_load;
END;
$$ LANGUAGE plpgsql;

-- Programar con pg_cron (instalar extensión)
-- SELECT cron.schedule('generate-capacity-alerts', '0 6 * * *', 'SELECT generate_capacity_alerts()');
```

---

## 🎨 **FRONTEND: DASHBOARD DE MONITOREO**

### **Archivo: `src/app/platform-admin/monitoring/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';

interface ServerMetrics {
  cpu_usage_percent: number;
  ram_usage_percent: number;
  disk_usage_percent: number;
  db_connections_active: number;
  db_connections_max: number;
  websocket_connections: number;
  active_assemblies: number;
  active_users_in_assemblies: number;
  recorded_at: string;
}

interface CapacityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  predicted_peak_date: string;
  recommended_plan: string;
  upgrade_cost_monthly: number;
  status: string;
}

export default function MonitoringPage() {
  const [currentMetrics, setCurrentMetrics] = useState<ServerMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<ServerMetrics[]>([]);
  const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetchCurrentMetrics();
    fetchHistoricalMetrics();
    fetchAlerts();
    fetchPredictions();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchCurrentMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchCurrentMetrics() {
    const res = await fetch('/api/monitoring/current');
    const data = await res.json();
    setCurrentMetrics(data);
  }

  async function fetchHistoricalMetrics() {
    const res = await fetch('/api/monitoring/history?hours=24');
    const data = await res.json();
    setHistoricalMetrics(data.metrics || []);
  }

  async function fetchAlerts() {
    const res = await fetch('/api/monitoring/alerts?status=active');
    const data = await res.json();
    setAlerts(data.alerts || []);
  }

  async function fetchPredictions() {
    const res = await fetch('/api/monitoring/predictions');
    const data = await res.json();
    setPredictions(data.predictions || []);
  }

  async function acknowledgeAlert(alertId: string) {
    await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
    fetchAlerts();
  }

  if (!currentMetrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">🖥️ Monitoreo de Infraestructura</h1>
        <p className="text-gray-600 mt-2">Estado actual del servidor y predicciones de capacidad</p>
      </div>

      {/* Alertas Críticas */}
      {alerts.length > 0 && (
        <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">
            🚨 {alerts.length} Alerta{alerts.length > 1 ? 's' : ''} Activa{alerts.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-4">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
            ))}
          </div>
        </div>
      )}

      {/* Métricas Actuales */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="CPU Usage"
          value={`${currentMetrics.cpu_usage_percent}%`}
          status={getStatus(currentMetrics.cpu_usage_percent, 70, 85)}
          icon="💻"
        />
        <MetricCard
          title="RAM Usage"
          value={`${currentMetrics.ram_usage_percent}%`}
          status={getStatus(currentMetrics.ram_usage_percent, 70, 85)}
          icon="💾"
        />
        <MetricCard
          title="Disk Usage"
          value={`${currentMetrics.disk_usage_percent}%`}
          status={getStatus(currentMetrics.disk_usage_percent, 80, 90)}
          icon="💽"
        />
        <MetricCard
          title="DB Connections"
          value={`${currentMetrics.db_connections_active} / ${currentMetrics.db_connections_max}`}
          status={getStatus((currentMetrics.db_connections_active / currentMetrics.db_connections_max) * 100, 70, 85)}
          icon="🔌"
        />
      </div>

      {/* Gráficas Históricas (Últimas 24h) */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">CPU & RAM (Últimas 24h)</h3>
          <Line
            data={{
              labels: historicalMetrics.map(m => new Date(m.recorded_at).toLocaleTimeString()),
              datasets: [
                {
                  label: 'CPU %',
                  data: historicalMetrics.map(m => m.cpu_usage_percent),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
                {
                  label: 'RAM %',
                  data: historicalMetrics.map(m => m.ram_usage_percent),
                  borderColor: 'rgb(249, 115, 22)',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                }
              ]
            }}
            options={{
              responsive: true,
              scales: {
                y: { min: 0, max: 100 }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Usuarios Activos (Últimas 24h)</h3>
          <Line
            data={{
              labels: historicalMetrics.map(m => new Date(m.recorded_at).toLocaleTimeString()),
              datasets: [
                {
                  label: 'Usuarios en Asambleas',
                  data: historicalMetrics.map(m => m.active_users_in_assemblies),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                }
              ]
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>

      {/* Predicciones de Carga (Próximos 30 días) */}
      {predictions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">📅 Predicción de Carga (Próximos 30 días)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Asambleas</th>
                  <th className="px-4 py-2 text-left">Usuarios Estimados</th>
                  <th className="px-4 py-2 text-left">Capacidad Actual</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx} className={pred.needs_upgrade ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2">{new Date(pred.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{pred.assemblies_count}</td>
                    <td className="px-4 py-2">{pred.estimated_users.toLocaleString()}</td>
                    <td className="px-4 py-2">{pred.current_capacity.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pred.needs_upgrade ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                      }`}>
                        {pred.alert_message}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {pred.needs_upgrade && (
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                          Upgrade a {pred.recommended_plan}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para tarjetas de métricas
function MetricCard({ title, value, status, icon }: any) {
  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`p-6 rounded-lg shadow border-2 ${statusColors[status]}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{title}</div>
    </div>
  );
}

// Componente para alertas
function AlertCard({ alert, onAcknowledge }: any) {
  return (
    <div className="bg-white border-l-4 border-red-500 p-4 rounded">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{alert.title}</h3>
          <p className="text-gray-700 mt-1">{alert.description}</p>
          <p className="text-sm text-gray-600 mt-2">💡 {alert.recommendation}</p>
          {alert.predicted_peak_date && (
            <p className="text-sm text-gray-600 mt-1">
              📅 Pico esperado: {new Date(alert.predicted_peak_date).toLocaleDateString()}
            </p>
          )}
          {alert.recommended_plan && (
            <p className="text-sm font-bold text-blue-600 mt-2">
              🚀 Plan recomendado: {alert.recommended_plan} (${alert.upgrade_cost_monthly}/mes)
            </p>
          )}
        </div>
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
        >
          Reconocer
        </button>
      </div>
    </div>
  );
}

// Helper para determinar status
function getStatus(value: number, warningThreshold: number, criticalThreshold: number) {
  if (value >= criticalThreshold) return 'critical';
  if (value >= warningThreshold) return 'warning';
  return 'good';
}
```

---

## 📡 **BACKEND API ROUTES:**

### **1. GET `/api/monitoring/current`**

```typescript
// src/app/api/monitoring/current/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT *
      FROM server_metrics
      ORDER BY recorded_at DESC
      LIMIT 1
    `);
    
    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
```

### **2. GET `/api/monitoring/history?hours=24`**

```typescript
// src/app/api/monitoring/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const hours = req.nextUrl.searchParams.get('hours') || '24';
  
  try {
    const result = await query(`
      SELECT *
      FROM server_metrics
      WHERE recorded_at > NOW() - INTERVAL '${parseInt(hours)} hours'
      ORDER BY recorded_at ASC
    `);
    
    return NextResponse.json({ metrics: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
```

### **3. GET `/api/monitoring/predictions`**

```typescript
// src/app/api/monitoring/predictions/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM predict_capacity_needs()');
    return NextResponse.json({ predictions: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}
```

### **4. GET `/api/monitoring/alerts?status=active`**

```typescript
// src/app/api/monitoring/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || 'active';
  
  try {
    const result = await query(`
      SELECT *
      FROM capacity_alerts
      WHERE status = $1
      ORDER BY severity DESC, created_at DESC
    `, [status]);
    
    return NextResponse.json({ alerts: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
```

### **5. POST `/api/monitoring/alerts/:id/acknowledge`**

```typescript
// src/app/api/monitoring/alerts/[id]/acknowledge/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await query(`
      UPDATE capacity_alerts
      SET status = 'acknowledged', acknowledged_at = NOW()
      WHERE id = $1
    `, [params.id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}
```

---

## 🔔 **NOTIFICACIONES AUTOMÁTICAS:**

### **Email Diario (6 AM):**

```typescript
// Script que se ejecuta diariamente
import nodemailer from 'nodemailer';

async function sendDailyMonitoringReport() {
  const alerts = await getActiveAlerts();
  const predictions = await getPredictions();
  
  const html = `
    <h1>📊 Reporte Diario de Monitoreo</h1>
    
    <h2>🚨 Alertas Activas (${alerts.length})</h2>
    ${alerts.map(a => `
      <div style="background: #fee; padding: 15px; margin: 10px 0; border-left: 4px solid #f00;">
        <strong>${a.title}</strong><br/>
        ${a.description}<br/>
        <em>💡 ${a.recommendation}</em>
      </div>
    `).join('')}
    
    <h2>📅 Predicciones de Carga (Próximos 7 días)</h2>
    ${predictions.slice(0, 7).map(p => `
      <div style="background: ${p.needs_upgrade ? '#ffe' : '#efe'}; padding: 10px; margin: 5px 0;">
        <strong>${p.date}</strong>: ${p.assemblies_count} asambleas, ~${p.estimated_users} usuarios
        ${p.needs_upgrade ? `<br/><strong style="color: red;">⚠️ UPGRADE RECOMENDADO</strong>` : ''}
      </div>
    `).join('')}
    
    <p><a href="${process.env.NEXT_PUBLIC_URL}/platform-admin/monitoring">Ver Dashboard Completo</a></p>
  `;
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: 'henry@assembly2.com',  // Tu email
    subject: `📊 Reporte Diario - ${alerts.length} alertas activas`,
    html
  });
}
```

---

## ⏰ **CRON JOBS (Setup):**

```bash
# Agregar a crontab en el servidor VPS
crontab -e

# Recolectar métricas cada 2 minutos
*/2 * * * * cd /app && node scripts/monitor-server.js >> /var/log/assembly-monitor.log 2>&1

# Generar alertas diarias a las 6 AM
0 6 * * * cd /app && node scripts/generate-capacity-alerts.js >> /var/log/assembly-alerts.log 2>&1

# Enviar email diario a las 6:30 AM
30 6 * * * cd /app && node scripts/send-daily-report.js >> /var/log/assembly-report.log 2>&1

# Limpiar métricas antiguas (mensual)
0 0 1 * * cd /app && psql $DATABASE_URL -c "SELECT cleanup_old_server_metrics();"
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN:**

```
Base de Datos:
[ ] Crear tabla server_metrics
[ ] Crear tabla capacity_alerts
[ ] Crear vista materializada scheduled_assemblies_load
[ ] Crear función predict_capacity_needs()
[ ] Crear función generate_capacity_alerts()
[ ] Crear función cleanup_old_server_metrics()

Scripts de Monitoreo:
[ ] Crear scripts/monitor-server.js
[ ] Crear scripts/generate-capacity-alerts.js
[ ] Crear scripts/send-daily-report.js
[ ] Testing: Scripts recolectan métricas correctamente

Backend API:
[ ] GET /api/monitoring/current
[ ] GET /api/monitoring/history
[ ] GET /api/monitoring/predictions
[ ] GET /api/monitoring/alerts
[ ] POST /api/monitoring/alerts/:id/acknowledge

Frontend:
[ ] Crear page /platform-admin/monitoring
[ ] Implementar MetricCard component
[ ] Implementar AlertCard component
[ ] Gráficas con Chart.js o Recharts
[ ] Tabla de predicciones

Cron Jobs:
[ ] Configurar crontab para monitor-server.js (cada 2 min)
[ ] Configurar crontab para generate-capacity-alerts.js (diario 6 AM)
[ ] Configurar crontab para send-daily-report.js (diario 6:30 AM)

Notificaciones:
[ ] Email diario con reporte
[ ] (Opcional) Integración con Slack/WhatsApp para alertas críticas

Testing:
[ ] Simular CPU alta (> 80%) → Verificar alerta
[ ] Simular RAM alta (> 85%) → Verificar alerta
[ ] Programar 30 asambleas futuras → Verificar predicción
[ ] Verificar email diario llega correctamente
[ ] Verificar dashboard actualiza cada 30 segundos
```

---

## 🎯 **RESUMEN PARA HENRY:**

**Ahora tendrás:**

1. ✅ **Dashboard en tiempo real** con métricas del servidor (CPU, RAM, disco, conexiones)
2. ✅ **Gráficas históricas** de las últimas 24 horas
3. ✅ **Predicción de carga** basada en asambleas programadas (próximos 30 días)
4. ✅ **Alertas automáticas** si se acerca al límite de capacidad
5. ✅ **Email diario a las 6 AM** con reporte y alertas
6. ✅ **Recomendaciones de upgrade** con costos y fechas

**Ejemplo de alerta proactiva:**

```
🚨 Alerta: Upgrade Recomendado para 15 Febrero 2026

Tienes 8 asambleas programadas con ~9,200 usuarios estimados.
Tu capacidad actual (CX51) es de 7,500 usuarios.

💡 Recomendación: Upgrade a CX61 (24GB RAM) antes del 15 de febrero
Costo: $250/mes (temporal, puedes downgrade después)

[Ver Dashboard] [Upgrade Ahora]
```

---

**Fin del Módulo 8: Monitoreo de Infraestructura**
