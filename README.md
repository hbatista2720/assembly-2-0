# 🏛️ Assembly 2.0 - Arquitectura Técnica Completa

**Plataforma SaaS de Gobernanza Digital para Asambleas de Copropietarios**

---

## 👨‍💻 ¿ERES EL CODER?

**👉 Lee primero: [`README_CODER.md`](README_CODER.md)** - Guía rápida de implementación

Este documento es la documentación completa del proyecto. El `README_CODER.md` te dice exactamente qué archivos leer y en qué orden.

---

## 📋 Resumen Ejecutivo

Assembly 2.0 es una plataforma multi-tenant diseñada para digitalizar y legalizar las asambleas de propietarios de Propiedad Horizontal (PH), con cumplimiento estricto de la **Ley 284 de Panamá** y capacidad de escalamiento internacional.

### Características Principales

✅ **Multi-tenant con RLS** - Múltiples PHs aislados por organización  
✅ **Autenticación Yappy Style** - Email + OTP + WebAuthn (Face ID/Touch ID)  
✅ **Votación Ponderada por Coeficientes** - Cumplimiento Ley 284  
✅ **Quórum en Tiempo Real** - Con alertas de pérdida  
✅ **Diferenciación Al Día vs Mora** - Voto vs Solo Voz  
✅ **CRM Enterprise** - Tickets automáticos de votos negativos  
✅ **Poderes Digitales con OCR** - Validación automatizada  
✅ **Vista de Presentación Live** - Dashboard en tiempo real para proyectar  
✅ **Auditoría Completa** - Trazabilidad legal de todos los eventos  
✅ **Escalabilidad Internacional** - Capa de Contexto Legal configurable  

---

## 📁 Documentos Entregados

| Archivo | Contenido |
|---------|-----------|
| **ARQUITECTURA_ASSEMBLY_2.0.md** | Visión global, modelo de datos Prisma, caso de uso Urban Tower (200 unidades) |
| **schema.sql** | DDL completo de PostgreSQL con triggers, RLS, vistas y funciones |
| **DIAGRAMA_RELACIONES.md** | Diagramas visuales de flujos y relaciones entre entidades |
| **ROADMAP_IMPLEMENTACION.md** | Guía paso a paso para el Coder con código de ejemplo |
| **VISTA_PRESENTACION_TIEMPO_REAL.md** | Especificación del dashboard de proyección en vivo |
| **README.md** | Este documento (resumen ejecutivo) |

---

## 🏗️ Arquitectura de Datos

### Jerarquía Multi-Tenant

```
LegalContext (PA, MX, CO)
  ↓
Organization (Promotora/PH)
  ↓
Property (Edificio/Complejo)
  ↓
Unit (Unidad Individual)
  ↓
User (Propietario/Residente)
```

### Entidades Principales

- **Organizations**: Promotoras o PHs independientes
- **Properties**: PHs gestionados (ej. Urban Tower)
- **Units**: Unidades con coeficiente y estado de pago
- **Users**: Propietarios con autenticación biométrica
- **Assemblies**: Asambleas ordinarias/extraordinarias
- **Votations**: Temas a votar en una asamblea
- **Votes**: Votos individuales firmados con WebAuthn
- **PowersOfAttorney**: Poderes digitales con validación OCR
- **CRMTickets**: Tickets generados automáticamente

---

## 🔐 Seguridad: Flujo Yappy Style

### 1️⃣ Registro Inicial
```
Email → OTP (6 dígitos) → Validación → email_verified = TRUE
```

### 2️⃣ Registro Biométrico
```
Challenge → WebAuthn → Face ID/Touch ID → Credential guardada
```

### 3️⃣ Login y Firma de Votos
```
Challenge → Firma biométrica → JWT Session
```

**Sin contraseñas. Solo biometría después del primer OTP.**

---

## ⚖️ Cumplimiento Legal (Ley 284 Panamá)

### Reglas Implementadas

| Regla Legal | Implementación Técnica |
|-------------|------------------------|
| Quórum por coeficientes | `SUM(coefficient_snapshot WHERE voting_rights = VOTA)` |
| Solo "Al Día" votan | Trigger `check_voting_rights()` valida antes de insertar |
| "En Mora" solo voz | Campo `voting_rights = SOLO_VOZ` |
| Coeficientes congelados | Snapshot al registrar asistencia |
| Votación ponderada | `coefficient_used` multiplicado en cálculo |
| Mayorías variables | SIMPLE, CALIFICADA, UNANIMIDAD |
| Auditoría legal | Tabla `audit_logs` con prev/new state |

---

## 📊 Vista de Presentación en Tiempo Real

### Componentes Visuales

1. **Panel de Quórum Grande**
   - Porcentaje en fuente 80px
   - Semáforo verde/rojo según alcance
   - Barra de progreso con marcador del 51%

2. **Resultados de Votación Activa**
   - Barras horizontales animadas (SI/NO/ABSTENCION)
   - Gráfico de pastel con coeficientes
   - Contador en vivo de votos emitidos

3. **Matriz de Unidades**
   - Grid visual 200 unidades (25x8)
   - Color coding: Verde (vota), Amarillo (ausente), Rojo (mora)

4. **Histórico de Votaciones**
   - Lista de temas cerrados con resultado
   - Votación activa destacada

### Tecnología
- **Supabase Realtime** para updates automáticos
- **Token de solo lectura** con expiración 24h
- **Sin autenticación** en URL `/presenter/:token`

---

## 🚀 Caso de Uso: P.H. Urban Tower

| Parámetro | Valor |
|-----------|-------|
| Total Unidades | 200 |
| Unidades Al Día | 150 (pueden votar) |
| Unidades En Mora | 50 (solo voz) |
| Coeficiente Total | 100.00 |
| Quórum Requerido | 51% (51.00 coef.) |

### Flujo de Asamblea

1. Admin crea asamblea con regla de quórum 51%
2. Marca asistencia manual o con Face ID de propietarios
3. Sistema calcula quórum en tiempo real (trigger automático)
4. Alerta si quórum < 51%
5. Admin abre votación (Tema 1, 2, 3...)
6. Propietarios "Al Día" votan con firma biométrica
7. Sistema calcula resultados por coeficiente
8. Al cerrar votación: trigger crea tickets CRM por votos NO
9. Acta final en PDF con hash inmutable

---

## 🔧 Stack Tecnológico Recomendado

| Capa | Tecnología |
|------|------------|
| Base de Datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| Backend | Node.js + Express/Fastify |
| Autenticación | WebAuthn (`@simplewebauthn/server`) |
| Realtime | Supabase Realtime |
| OCR | AWS Textract / Google Vision |
| Storage | Supabase Storage |
| Frontend | Next.js + React |
| Gráficos | Recharts / Chart.js |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |

---

## 📈 Escalabilidad Internacional

### Capa de Contexto Legal

Tabla `legal_contexts` con reglas parametrizables por país:

```json
{
  "country_code": "PA",
  "rules": {
    "quorum_base": "total_coefficient",
    "quorum_percentage": 51,
    "mora_restriction": "no_vote",
    "majority_types": {
      "simple": 50.01,
      "calificada": 66.67,
      "unanimidad": 100
    }
  }
}
```

**Agregar México, Colombia, Costa Rica sin refactorizar código.**

---

## 🎯 CRM Enterprise: Tickets Automáticos

### Trigger Post-Votación

Cuando una votación se cierra:
1. Sistema identifica votos = NO
2. Por cada voto negativo crea ticket:
   - `source_type`: NEGATIVE_VOTE
   - `ticket_type`: SEGUIMIENTO_OBRA
   - `priority`: MEDIUM
   - `subject`: "Voto negativo en: [tema]"
   - `description`: "Unidad [código] votó NO. Requiere seguimiento."

### Dashboard CRM
- Lista filtrada por organización (RLS)
- Asignación a responsables
- Estados: OPEN → IN_PROGRESS → RESOLVED
- Métricas de tiempo de resolución

---

## ✅ Validaciones de Integridad

### Nivel Base de Datos

- **Trigger:** Validar `voting_rights = VOTA` antes de insertar voto
- **Trigger:** Actualizar quórum al registrar asistencia
- **Trigger:** Crear tickets CRM al cerrar votación
- **Trigger:** Auditar cambios en estados de pago
- **Constraint:** UNIQUE(votation_id, unit_id) - un voto por unidad
- **Constraint:** Suma de coeficientes = 100% (validación en carga)

### Nivel Aplicación

- Validar WebAuthn signature en todos los votos
- Congelar coeficientes al momento de asistencia
- Calcular mayorías según tipo (SIMPLE/CALIFICADA/UNANIMIDAD)
- Verificar cédulas en poderes con OCR

---

## 🧪 Testing Requerido

### Prioridad Alta

- [ ] Cálculo de quórum con diferentes combinaciones
- [ ] Validación de derechos de voto (Al Día vs Mora)
- [ ] Cálculo de resultados por mayoría
- [ ] Suma de coeficientes = 100%
- [ ] RLS: usuario no puede ver datos de otra org
- [ ] WebAuthn: registro y login completo
- [ ] Triggers: ejecución automática correcta

### Cobertura Objetivo

**> 80%** en lógica de negocio crítica

---

## 📝 Roadmap de Implementación

### Fase 1: Setup (1 semana)
- Infraestructura Supabase
- Migración de schema SQL
- Setup de Prisma

### Fase 2: Autenticación (2 semanas)
- Email + OTP
- WebAuthn registro/login
- Middleware de sesión

### Fase 3: Carga Masiva (1 semana)
- Script CSV → BD
- Validación de coeficientes
- Invitaciones por email

### Fase 4: Asambleas (2 semanas)
- CRUD de asambleas
- Registro de asistencia
- Cálculo de quórum en tiempo real

### Fase 5: Votaciones (2 semanas)
- CRUD de votaciones
- Emisión de votos con WebAuthn
- Cálculo de resultados

### Fase 6: CRM (1 semana)
- Generación automática de tickets
- Dashboard de gestión

### Fase 7: Poderes (2 semanas)
- Upload de documentos
- OCR y validación
- Uso en asambleas

### Fase 8: Vista Presentación (1 semana)
- Token de solo lectura
- Dashboard en tiempo real
- Gráficos visuales

---

## 🎯 Métricas de Éxito

| KPI | Target |
|-----|--------|
| Tiempo de carga 200 unidades | < 2 seg |
| Latencia de registro de voto | < 500ms |
| Actualización quórum (Realtime) | < 1 seg |
| Tasa de éxito WebAuthn | > 95% |
| Integridad coeficientes | 100% |
| Uptime del sistema | > 99.9% |

---

## 🛡️ Seguridad y Auditoría

### Row Level Security (RLS)

Todas las tablas con `organization_id` tienen políticas:
```sql
USING (organization_id = current_setting('app.current_org_id')::UUID)
```

### Auditoría Inmutable

Tabla `audit_logs` registra:
- Cambios en estados de pago
- Apertura/cierre de asambleas
- Validación de poderes
- Modificaciones a coeficientes

**Formato:** `prev_state` + `new_state` en JSONB

---

## 📞 Próximos Pasos

### ✅ ARQUITECTURA COMPLETADA

Esperando **auditoría del Agente de Calidad (QA)** para validar:
- Cumplimiento de Ley 284
- Seguridad de datos sensibles
- Escalabilidad multi-tenant
- Integridad de lógica de votación
- Viabilidad técnica de WebAuthn

**Una vez aprobado:**
👉 El Agente Coder puede iniciar implementación siguiendo `ROADMAP_IMPLEMENTACION.md`

---

## 📚 Referencias

- [Ley 284 de Panamá (Propiedad Horizontal)](https://www.gacetaoficial.gob.pa)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Arquitectura diseñada por:** Agente Arquitecto (Lead Software Architect)  
**Fecha:** 26 Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para auditoría QA
