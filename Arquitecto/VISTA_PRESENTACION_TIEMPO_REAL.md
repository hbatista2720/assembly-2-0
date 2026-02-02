# 📊 Vista de Presentación en Tiempo Real
**Dashboard para Proyección en Asambleas**

---

## Objetivo

Pantalla de **solo lectura** para proyectar en sala durante la asamblea, mostrando:
- Quórum en tiempo real
- Resultados de votaciones activas
- Gráficos visuales intuitivos
- Actualización automática sin recargar página

---

## Arquitectura de la Vista

### Componentes Principales

```
┌────────────────────────────────────────────────────┐
│          MODO PRESENTACIÓN (Read-Only)            │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  HEADER: Nombre PH + Tipo Asamblea          │  │
│  │  "Urban Tower - Asamblea Ordinaria 2026"    │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  PANEL QUÓRUM (Grande, Central)            │  │
│  │                                             │  │
│  │      ┌──────────────────┐                  │  │
│  │      │  QUÓRUM ACTUAL   │                  │  │
│  │      │                  │                  │  │
│  │      │      65.4%       │  ← Tamaño 80px  │  │
│  │      │                  │                  │  │
│  │      │  ✅ ALCANZADO   │  ← Verde/Rojo    │  │
│  │      └──────────────────┘                  │  │
│  │                                             │  │
│  │  131 / 200 propietarios presentes         │  │
│  │  (65.4 / 100 coeficiente)                 │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  VOTACIÓN ACTIVA                            │  │
│  │  "Tema 1: Aprobación de Presupuesto 2026"  │  │
│  │                                             │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  [████████████░░░░░░░] SI: 78.2%    │  │  │
│  │  │  [███░░░░░░░░░░░░░░░░] NO: 15.1%    │  │  │
│  │  │  [██░░░░░░░░░░░░░░░░░] ABST: 6.7%   │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  │                                             │  │
│  │  Votos emitidos: 95 / 131 presentes        │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  HISTÓRICO DE VOTACIONES                    │  │
│  │                                             │  │
│  │  ✅ Tema 1: Acta anterior (98% SI)         │  │
│  │  ✅ Tema 2: Informe financiero (85% SI)    │  │
│  │  ⏳ Tema 3: En votación...                 │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Integración en Arquitectura

### Nueva Tabla: `presenter_tokens`

```sql
CREATE TABLE presenter_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembly_id UUID NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Generación de Token de Presentación

**Endpoint:** `POST /api/assemblies/:id/presenter-token`

**Roles permitidos:** `ADMIN_PH`, `JUNTA_DIRECTIVA`

**Response:**
```json
{
  "presenter_url": "https://assembly2.app/presenter/abc123xyz",
  "expires_at": "2026-01-26T18:00:00Z"
}
```

**Lógica:**
```typescript
export async function generatePresenterToken(assembly_id: string) {
  const token = crypto.randomBytes(16).toString('hex');
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  
  await prisma.presenterToken.create({
    data: { assembly_id, token, expires_at }
  });
  
  return {
    presenter_url: `${process.env.APP_URL}/presenter/${token}`,
    expires_at
  };
}
```

---

## Implementación Frontend (Conceptual)

### Ruta: `/presenter/:token`

**Sin autenticación (solo token de URL)**

```typescript
// pages/presenter/[token].tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PresenterView({ token }) {
  const [assembly, setAssembly] = useState(null);
  const [quorum, setQuorum] = useState(null);
  const [activeVotation, setActiveVotation] = useState(null);
  
  useEffect(() => {
    // Validar token y cargar asamblea
    fetchAssemblyByToken(token).then(data => {
      setAssembly(data.assembly);
      setQuorum(data.quorum);
    });
    
    // Suscripción Realtime
    const channel = supabase.channel(`assembly:${assembly.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assembly_attendance',
        filter: `assembly_id=eq.${assembly.id}`
      }, payload => {
        // Actualizar quórum
        fetchQuorum(assembly.id).then(setQuorum);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `votation_id=eq.${activeVotation?.id}`
      }, payload => {
        // Actualizar resultados votación
        fetchVotationResults(activeVotation.id).then(results => {
          setActiveVotation({ ...activeVotation, results });
        });
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [token]);
  
  return (
    <div className="presenter-view">
      <Header assembly={assembly} />
      <QuorumPanel quorum={quorum} />
      <ActiveVotationPanel votation={activeVotation} />
      <HistoryPanel assembly={assembly} />
    </div>
  );
}
```

---

## Componentes Visuales

### 1. Panel de Quórum

```typescript
function QuorumPanel({ quorum }) {
  const percentage = quorum.percentage;
  const isAchieved = quorum.achieved;
  
  return (
    <div className="quorum-panel">
      <div className={`quorum-indicator ${isAchieved ? 'achieved' : 'not-achieved'}`}>
        <div className="percentage">{percentage.toFixed(1)}%</div>
        <div className="status">
          {isAchieved ? '✅ QUÓRUM ALCANZADO' : '⚠️ QUÓRUM PENDIENTE'}
        </div>
      </div>
      
      <div className="quorum-details">
        <div className="stat">
          <span className="label">Propietarios Presentes:</span>
          <span className="value">{quorum.attendees_count} / {quorum.total_units}</span>
        </div>
        <div className="stat">
          <span className="label">Coeficiente Presente:</span>
          <span className="value">{quorum.current.toFixed(2)} / {quorum.required.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        <div 
          className="required-marker" 
          style={{ left: '51%' }}
        >
          Requerido
        </div>
      </div>
    </div>
  );
}
```

**Estilos sugeridos:**
```css
.quorum-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.quorum-indicator.achieved {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.quorum-indicator.not-achieved {
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
}

.percentage {
  font-size: 80px;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
```

---

### 2. Panel de Votación Activa

```typescript
function ActiveVotationPanel({ votation }) {
  if (!votation) return <div>Sin votación activa</div>;
  
  const { results } = votation;
  const total = results.coef_si + results.coef_no + results.coef_abstencion;
  
  const pct_si = (results.coef_si / total * 100).toFixed(1);
  const pct_no = (results.coef_no / total * 100).toFixed(1);
  const pct_abs = (results.coef_abstencion / total * 100).toFixed(1);
  
  return (
    <div className="votation-panel">
      <h2>{votation.topic}</h2>
      
      <div className="vote-bars">
        <VoteBar 
          label="A FAVOR" 
          value={pct_si} 
          color="#10b981"
          icon="✅"
        />
        <VoteBar 
          label="EN CONTRA" 
          value={pct_no} 
          color="#ef4444"
          icon="❌"
        />
        <VoteBar 
          label="ABSTENCIÓN" 
          value={pct_abs} 
          color="#94a3b8"
          icon="⚪"
        />
      </div>
      
      <div className="vote-count">
        Votos emitidos: {votation.votes_count} / {votation.attendees_count}
      </div>
      
      {/* Gráfico de pastel alternativo */}
      <PieChart data={[
        { label: 'SI', value: results.coef_si, color: '#10b981' },
        { label: 'NO', value: results.coef_no, color: '#ef4444' },
        { label: 'ABST', value: results.coef_abstencion, color: '#94a3b8' }
      ]} />
    </div>
  );
}

function VoteBar({ label, value, color, icon }) {
  return (
    <div className="vote-bar-container">
      <div className="vote-bar-label">
        <span className="icon">{icon}</span>
        <span className="text">{label}</span>
        <span className="percentage">{value}%</span>
      </div>
      <div className="vote-bar-track">
        <div 
          className="vote-bar-fill" 
          style={{ 
            width: `${value}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
}
```

---

### 3. Gráfico de Línea: Evolución del Quórum

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function QuorumHistoryChart({ history }) {
  // history = [{ timestamp, quorum_percentage }]
  
  return (
    <LineChart width={800} height={300} data={history}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="quorum_percentage" 
        stroke="#8b5cf6" 
        strokeWidth={3}
      />
      {/* Línea de referencia para 51% */}
      <Line 
        type="monotone" 
        y={51} 
        stroke="#ef4444" 
        strokeDasharray="5 5"
      />
    </LineChart>
  );
}
```

---

## Mejoras Visuales Sugeridas

### **VISTA 2: MATRIZ DE UNIDADES (Escalable hasta 600+ unidades)**

**Escenarios reales:**
- 🏢 1 torre: 200 unidades
- 🏢🏢 2 torres: 400 unidades
- 🏢🏢🏢 3 torres: 600 unidades
- 🏘️ Complejo: 311 unidades (múltiples edificios)

---

#### **Sistema de Estados y Colores:**

```
ESTADOS DE LA UNIDAD:

📊 ASISTENCIA:
├─ 🟢 PRESENTE + VOTÓ          (verde brillante)
├─ 🟡 PRESENTE + NO HA VOTADO  (amarillo)
├─ ⚪ AUSENTE                   (gris claro)
└─ ⚫ EN MORA (sin derecho)    (gris oscuro)

🔐 MÉTODO DE ACCESO:
├─ ✅ Face ID configurado
├─ 📱 Voto manual (admin marcó)
└─ ❌ Sin registro

🗳️ VOTACIÓN:
├─ ✅ Votó SÍ (verde + check)
├─ ❌ Votó NO (rojo + X)
├─ ⚪ Votó ABSTENCIÓN (naranja)
└─ ⏳ No ha votado (amarillo pulsante)
```

---

#### **Layout Adaptativo:**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface Unit {
  id: string;
  code: string;
  tower?: string;
  owner_name: string;
  payment_status: 'AL_DIA' | 'MORA';
  is_present: boolean;
  has_face_id: boolean;
  vote_value?: 'SI' | 'NO' | 'ABSTENCION' | null;
  vote_method?: 'FACE_ID' | 'MANUAL' | null;
}

export default function UnitsMonitorView() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'grid'>('summary');
  const [filterTower, setFilterTower] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<'compact' | 'normal' | 'large'>('normal');

  // Toggle entre vistas
  return (
    <div className="monitor-container">
      {/* Header con controles */}
      <div className="monitor-header">
        <div className="view-toggle">
          <button 
            className={viewMode === 'summary' ? 'active' : ''}
            onClick={() => setViewMode('summary')}
          >
            📊 Vista Resumen
          </button>
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            📋 Vista Unidades
          </button>
        </div>

        {viewMode === 'grid' && (
          <>
            {/* Filtro por torre */}
            <select 
              value={filterTower} 
              onChange={(e) => setFilterTower(e.target.value)}
              className="tower-filter"
            >
              <option value="all">🏢 Todas las Torres</option>
              <option value="A">Torre A (200 unidades)</option>
              <option value="B">Torre B (150 unidades)</option>
              <option value="C">Torre C (161 unidades)</option>
            </select>

            {/* Zoom */}
            <div className="zoom-controls">
              <button onClick={() => setZoomLevel('compact')}>
                🔍- Compacto
              </button>
              <button onClick={() => setZoomLevel('normal')}>
                🔍 Normal
              </button>
              <button onClick={() => setZoomLevel('large')}>
                🔍+ Grande
              </button>
            </div>
          </>
        )}
      </div>

      {/* Contenido */}
      {viewMode === 'summary' ? (
        <SummaryView units={units} />
      ) : (
        <UnitsGridView 
          units={units} 
          filterTower={filterTower}
          zoomLevel={zoomLevel}
        />
      )}
    </div>
  );
}

// ============================================
// VISTA 2: GRID DE UNIDADES (ADAPTATIVO)
// ============================================

function UnitsGridView({ units, filterTower, zoomLevel }: {
  units: Unit[];
  filterTower: string;
  zoomLevel: 'compact' | 'normal' | 'large';
}) {
  const filteredUnits = filterTower === 'all' 
    ? units 
    : units.filter(u => u.tower === filterTower);

  // Calcular columnas según cantidad de unidades y zoom
  const getGridColumns = () => {
    const total = filteredUnits.length;
    
    if (zoomLevel === 'compact') {
      if (total > 400) return 40; // 600 unidades: 40 columnas
      if (total > 200) return 30; // 400 unidades: 30 columnas
      return 25; // 200 unidades: 25 columnas
    }
    
    if (zoomLevel === 'large') {
      if (total > 400) return 20;
      if (total > 200) return 15;
      return 12;
    }
    
    // Normal
    if (total > 400) return 30;
    if (total > 200) return 20;
    return 16;
  };

  return (
    <div className="units-grid-container">
      {/* Leyenda */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10b981' }}></span>
          🟢 Presente + Votó
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#fbbf24' }}></span>
          🟡 Presente + No votó
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#e5e7eb' }}></span>
          ⚪ Ausente
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#6b7280' }}></span>
          ⚫ En mora
        </div>
        <div className="legend-item">
          <span className="legend-icon">✅</span> Votó SÍ
        </div>
        <div className="legend-item">
          <span className="legend-icon">❌</span> Votó NO
        </div>
        <div className="legend-item">
          <span className="legend-icon">⚪</span> Abstención
        </div>
        <div className="legend-item">
          <span className="legend-icon">📱</span> Voto manual
        </div>
      </div>

      {/* Grid de unidades */}
      <div 
        className={`units-grid zoom-${zoomLevel}`}
        style={{ 
          gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` 
        }}
      >
        {filteredUnits.map(unit => (
          <UnitCell key={unit.id} unit={unit} zoomLevel={zoomLevel} />
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid-stats">
        <div className="stat">
          Total: <strong>{filteredUnits.length}</strong>
        </div>
        <div className="stat">
          Presentes: <strong>{filteredUnits.filter(u => u.is_present).length}</strong>
        </div>
        <div className="stat">
          Votaron: <strong>{filteredUnits.filter(u => u.vote_value).length}</strong>
        </div>
        <div className="stat">
          En mora: <strong>{filteredUnits.filter(u => u.payment_status === 'MORA').length}</strong>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CELDA DE UNIDAD (con tooltip y animación)
// ============================================

function UnitCell({ unit, zoomLevel }: { unit: Unit; zoomLevel: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determinar color de fondo
  const getBackgroundColor = () => {
    // En mora: gris oscuro (sin derecho a voto)
    if (unit.payment_status === 'MORA') return '#6b7280';
    
    // Ausente: gris claro
    if (!unit.is_present) return '#e5e7eb';
    
    // Presente + Votó: verde
    if (unit.vote_value) return '#10b981';
    
    // Presente + No ha votado: amarillo (pulsante)
    return '#fbbf24';
  };

  // Determinar icono de voto
  const getVoteIcon = () => {
    if (!unit.vote_value) return null;
    
    if (unit.vote_value === 'SI') return '✅';
    if (unit.vote_value === 'NO') return '❌';
    if (unit.vote_value === 'ABSTENCION') return '⚪';
    
    return null;
  };

  // Determinar icono de método
  const getMethodIcon = () => {
    if (unit.vote_method === 'MANUAL') return '📱';
    if (unit.has_face_id) return '🔒';
    return null;
  };

  const isPending = unit.is_present && !unit.vote_value;

  return (
    <div 
      className={`unit-cell ${isPending ? 'pending-vote' : ''}`}
      style={{ backgroundColor: getBackgroundColor() }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Código de unidad */}
      <div className="unit-code">
        {unit.code}
      </div>

      {/* Iconos */}
      <div className="unit-icons">
        {getVoteIcon()}
        {getMethodIcon()}
      </div>

      {/* Tooltip al hover */}
      {showTooltip && (
        <div className="unit-tooltip">
          <div className="tooltip-header">
            <strong>{unit.code}</strong>
          </div>
          <div className="tooltip-body">
            <div>👤 {unit.owner_name}</div>
            <div>
              {unit.payment_status === 'AL_DIA' ? '✅ Al día' : '⚠️ En mora'}
            </div>
            <div>
              {unit.is_present ? '✅ Presente' : '❌ Ausente'}
            </div>
            {unit.is_present && (
              <>
                <div>
                  {unit.has_face_id ? '🔒 Face ID configurado' : '📱 Voto manual'}
                </div>
                <div>
                  {unit.vote_value 
                    ? `Votó: ${unit.vote_value}` 
                    : '⏳ Esperando voto...'}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### **Estilos CSS (Responsive):**

```css
/* ============================================
   CONTENEDOR PRINCIPAL
   ============================================ */

.monitor-container {
  width: 100%;
  height: 100vh;
  background: #0f172a;
  color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  padding: 1rem 2rem;
  background: #1e293b;
  display: flex;
  gap: 2rem;
  align-items: center;
  border-bottom: 2px solid #334155;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-toggle button {
  padding: 0.5rem 1.5rem;
  background: #334155;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: #3b82f6;
  transform: scale(1.05);
}

.tower-filter {
  padding: 0.5rem 1rem;
  background: #334155;
  color: white;
  border: 1px solid #475569;
  border-radius: 8px;
  font-size: 14px;
}

.zoom-controls {
  display: flex;
  gap: 0.5rem;
}

.zoom-controls button {
  padding: 0.5rem 1rem;
  background: #334155;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* ============================================
   GRID DE UNIDADES (ADAPTATIVO)
   ============================================ */

.units-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.legend {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #1e293b;
  border-radius: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.2);
}

.legend-icon {
  font-size: 18px;
}

/* ============================================
   GRID (Tamaños adaptativos)
   ============================================ */

.units-grid {
  display: grid;
  gap: 3px;
  width: 100%;
  margin-bottom: 1rem;
}

/* Zoom Compacto (600+ unidades) */
.units-grid.zoom-compact .unit-cell {
  min-width: 24px;
  min-height: 24px;
  font-size: 8px;
}

/* Zoom Normal (200-400 unidades) */
.units-grid.zoom-normal .unit-cell {
  min-width: 40px;
  min-height: 40px;
  font-size: 10px;
}

/* Zoom Grande (detalle) */
.units-grid.zoom-large .unit-cell {
  min-width: 60px;
  min-height: 60px;
  font-size: 12px;
}

/* ============================================
   CELDA DE UNIDAD
   ============================================ */

.unit-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.unit-cell:hover {
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Animación para unidades pendientes de voto */
.unit-cell.pending-vote {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.unit-code {
  font-weight: 700;
  text-align: center;
  line-height: 1;
}

.unit-icons {
  display: flex;
  gap: 2px;
  font-size: 0.8em;
  margin-top: 2px;
}

/* ============================================
   TOOLTIP (Información detallada)
   ============================================ */

.unit-tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.unit-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.95);
}

.tooltip-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 14px;
}

.tooltip-body > div {
  margin: 0.25rem 0;
  line-height: 1.4;
}

/* ============================================
   ESTADÍSTICAS RÁPIDAS
   ============================================ */

.grid-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem;
  background: #1e293b;
  border-radius: 8px;
  margin-top: 1rem;
}

.grid-stats .stat {
  font-size: 16px;
  color: #94a3b8;
}

.grid-stats .stat strong {
  color: white;
  font-size: 20px;
  margin-left: 0.5rem;
}
```

---

#### **Ejemplo de uso con 311 unidades (Complejo):**

```typescript
// Datos simulados
const complexUnits = [
  // Torre A (200 unidades)
  ...generateUnits('A', 1, 200),
  // Torre B (111 unidades)
  ...generateUnits('B', 1, 111),
];

function generateUnits(tower: string, start: number, count: number): Unit[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${tower}-${start + i}`,
    code: `${tower}${start + i}`,
    tower,
    owner_name: `Propietario ${tower}${start + i}`,
    payment_status: Math.random() > 0.15 ? 'AL_DIA' : 'MORA',
    is_present: Math.random() > 0.3,
    has_face_id: Math.random() > 0.2,
    vote_value: Math.random() > 0.4 
      ? ['SI', 'NO', 'ABSTENCION'][Math.floor(Math.random() * 3)] as any
      : null,
    vote_method: Math.random() > 0.8 ? 'MANUAL' : 'FACE_ID',
  }));
}
```

---

### 2. Contador en Vivo de Votos

```typescript
function LiveVoteCounter({ current, total }) {
  return (
    <div className="live-counter">
      <div className="counter-number">
        <AnimatedNumber value={current} />
        <span className="divider">/</span>
        <span className="total">{total}</span>
      </div>
      <div className="counter-label">Votos Emitidos</div>
    </div>
  );
}

// Animación de número con spring
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const increment = Math.ceil((value - displayValue) / 10);
    const timer = setInterval(() => {
      setDisplayValue(prev => {
        if (prev >= value) {
          clearInterval(timer);
          return value;
        }
        return prev + increment;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span className="animated-number">{displayValue}</span>;
}
```

---

### 3. Alerta de Pérdida de Quórum

```typescript
function QuorumAlert({ quorum, previousQuorum }) {
  const lostQuorum = previousQuorum?.achieved && !quorum.achieved;
  
  if (lostQuorum) {
    return (
      <div className="alert alert-danger">
        ⚠️ ALERTA: Se perdió el quórum. 
        Actual: {quorum.percentage}% (Requerido: {quorum.required_percentage}%)
      </div>
    );
  }
  
  return null;
}
```

---

## Configuración de Supabase Realtime

### Habilitar Realtime en Tablas

```sql
-- Habilitar publicación de cambios
ALTER PUBLICATION supabase_realtime ADD TABLE assembly_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE assemblies;
```

### Política RLS para Lectura Pública con Token

```sql
-- Permitir lectura si token es válido
CREATE POLICY presenter_read_attendance ON assembly_attendance
  FOR SELECT
  USING (
    assembly_id IN (
      SELECT assembly_id FROM presenter_tokens
      WHERE token = current_setting('request.jwt.claims')::json->>'presenter_token'
        AND expires_at > NOW()
    )
  );
```

---

## Optimización de Performance

### 1. Vista Materializada para Estado de Asamblea

```sql
CREATE MATERIALIZED VIEW assembly_live_state AS
SELECT 
  a.id AS assembly_id,
  a.quorum_current,
  a.quorum_achieved,
  COUNT(aa.id) AS total_attendees,
  COUNT(aa.id) FILTER (WHERE aa.voting_rights = 'VOTA') AS voters_count
FROM assemblies a
LEFT JOIN assembly_attendance aa ON aa.assembly_id = a.id
GROUP BY a.id;

-- Refresh automático cada 5 segundos
CREATE OR REPLACE FUNCTION refresh_assembly_state()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY assembly_live_state;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_state_on_attendance
  AFTER INSERT OR UPDATE ON assembly_attendance
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_assembly_state();
```

---

### 2. Caché de Resultados en Redis

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getVotationResults(votation_id: string) {
  const cached = await redis.get(`votation:${votation_id}:results`);
  if (cached) return JSON.parse(cached);
  
  const results = await prisma.$queryRaw`
    SELECT * FROM votation_results WHERE votation_id = ${votation_id}
  `;
  
  await redis.setex(`votation:${votation_id}:results`, 5, JSON.stringify(results));
  return results;
}
```

---

## Checklist de Implementación

- [ ] Crear tabla `presenter_tokens`
- [ ] Endpoint de generación de token
- [ ] Ruta `/presenter/:token` sin auth
- [ ] Validación de token con expiración
- [ ] Componentes React (QuorumPanel, VotationPanel, etc.)
- [ ] Integración de Supabase Realtime
- [ ] Gráficos con Chart.js o Recharts
- [ ] Vista materializada para performance
- [ ] Políticas RLS para lectura pública
- [ ] CSS responsive para proyección (1920x1080)
- [ ] Modo fullscreen automático
- [ ] Animaciones suaves en cambios de datos

---

**Fin de especificación de Vista de Presentación**
