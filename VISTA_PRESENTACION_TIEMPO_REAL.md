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

### Basado en la imagen de referencia del usuario:

1. **Matriz de Unidades (Color Coding)**
   - Verde: Al día y presente con voto
   - Amarillo: Al día pero ausente
   - Rojo: En mora
   - Gris: No registrado

```typescript
function UnitsGrid({ units }) {
  return (
    <div className="units-grid">
      {units.map(unit => (
        <div 
          key={unit.id} 
          className={`unit-cell ${getUnitStatus(unit)}`}
          title={`${unit.code} - ${unit.owner_name}`}
        >
          {unit.code}
        </div>
      ))}
    </div>
  );
}

function getUnitStatus(unit) {
  if (unit.attendance && unit.payment_status === 'AL_DIA') return 'present-vote';
  if (!unit.attendance && unit.payment_status === 'AL_DIA') return 'absent';
  if (unit.payment_status === 'MORA') return 'mora';
  return 'unregistered';
}
```

```css
.units-grid {
  display: grid;
  grid-template-columns: repeat(25, 1fr);
  gap: 4px;
  padding: 1rem;
}

.unit-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.unit-cell:hover {
  transform: scale(1.1);
}

.unit-cell.present-vote {
  background: #10b981;
  color: white;
}

.unit-cell.absent {
  background: #fbbf24;
  color: #000;
}

.unit-cell.mora {
  background: #ef4444;
  color: white;
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
