# QA Reporte · Dashboard Henry (Platform Admin)

**Fecha:** 07 Febrero 2026  
**Objetivo:** Validar sincronización con BD, Monitor VPS vs Docker real, y botones sin acción lógica.

**Referencias cruzadas:**
- **Coder:** Instrucción en **§5** (Resumen para Contralor) y **§7** (Instrucción para Coder) de este documento.
- **Contralor:** Informe registrado en el historial de **Contralor/ESTATUS_AVANCE.md** (entrada 07 Feb 2026 – Informe Dashboard Henry).
- **QA_FEEDBACK:** Apunta a esta auditoría en QA/QA_FEEDBACK.md (§ "Auditoría detallada (Dashboard Henry)" y § "QA Auditoría · Dashboard Henry").

---

## 1. Sincronización con Base de Datos

| Sección | Datos mostrados | Fuente actual | Estado |
|---------|-----------------|---------------|--------|
| **Resumen ejecutivo** (KPI, Funnel, Tickets, Clientes, Campañas) | KPI, Pipeline, Tickets, Clientes, Campañas | Constantes hardcoded en código | ❌ **NO sincronizado** |
| **Funnel de leads** | Lista leads, pipeline por etapa | GET /api/leads → `platform_leads` | ⚠️ **API existe** – tabla `platform_leads` puede no existir (500) |
| **Gestión de leads** (página dedicada) | Leads desde BD | GET /api/leads | ⚠️ Igual que arriba |
| **Clientes** | Lista organizaciones + status | GET /api/platform-admin/clients → `organizations` + `platform_client_status` | ⚠️ Si tabla falta → fallback hardcoded |
| **Tickets** | Lista tickets | Constantes hardcoded | ❌ **NO sincronizado** – No hay API ni tabla `platform_tickets` |
| **Métricas de negocio** | Ingresos, churn, proyección | Constantes hardcoded | ❌ **NO sincronizado** |
| **CRM campañas** | Campañas | `seedCampaigns` en memoria – no API | ❌ **NO sincronizado** |
| **Monitor VPS** | RAM, CPU, Disco, asambleas, calendario, alertas | Todo hardcoded en `useMemo` y `useEffect` | ❌ **NO sincronizado** – No refleja Docker/VPS real |
| **Configuración Chatbot** | Config bots, prompts | GET/PUT /api/chatbot/config | ✅ **Sincronizado** |

---

## 2. Monitor VPS – Comportamiento esperado vs actual

**Esperado (usuario):** Ver comportamiento real de Docker/VPS local (CPU, RAM, contenedores, conexiones BD).

**Actual:**
- RAM: 6.7/16 GB (fijo)
- CPU: 2.8/8 vCPU (fijo)
- Disco: 217/320 GB (fijo)
- Conexiones DB: 2200/10000 (fijo)
- Asambleas activas: 8 (fijo)
- Calendario, alertas, forecast: datos estáticos en código

**Conclusión:** El Monitor VPS **no consulta métricas reales** del sistema. Para entorno local/Docker haría falta:
- API que ejecute `docker stats` o similar
- O endpoint que lea `/proc`, `os.cpus()`, etc.
- Conexiones BD: consultar `pg_stat_activity` o equivalente

---

## 3. Botones sin acción lógica (reportar al Contralor)

| Ubicación | Botón/Enlace | Comportamiento actual | Problema |
|-----------|--------------|------------------------|----------|
| Resumen ejecutivo | "Exportar reporte" | Navega a /platform-admin/leads | No exporta nada (CSV/Excel) |
| Resumen ejecutivo | "Activar demo" | Navega a leads?stage=demo_active | Solo filtra, no activa demo |
| Resumen ejecutivo | Cards "Revisar ticket" | Navega a /platform-admin/tickets/TKT-2026-021 | ✅ Corregido: IDs unificados en detalle. Sigue sin BD. |
| Resumen ejecutivo | "Configurar" (campañas) | Navega a /platform-admin/crm | Solo va a CRM; no abre config de esa campaña |
| CRM | "Ejecutar campañas ahora" | Toast "Campañas ejecutadas" | No ejecuta nada real (no envía emails, no dispara flujos) |
| CRM | "Activar" / "Desactivar" campaña | Actualiza estado en memoria | No persiste en BD |
| Monitor VPS | "Reconocer" (alerta) | Quita alerta de la lista | Solo estado local; no persiste |
| Monitor VPS | "Ver opciones de upgrade" (en alerta) | Texto, no es botón | Sin acción |
| Ticket detalle | "Resolver ticket" | Actualiza estado local, redirige | No persiste en BD (no hay API tickets) |
| Ticket detalle | "Escalar prioridad" | Actualiza estado local | No persiste en BD |

---

## 4. Bug crítico: Tickets (corregido temporalmente)

- **Lista** muestra: TKT-2026-021, TKT-2026-019, TKT-2026-017
- **Detalle** (`tickets/[id]/page.tsx`) usaba `seedTickets` solo con `tkt-001`, `tkt-002` → "Ticket no encontrado"
- **Corrección QA:** Añadidos TKT-2026-021, 019, 017 a seedTickets para que "Revisar ticket" funcione. Sigue sin BD (datos en código).

---

## 5. Resumen para Contralor

| Prioridad | Item | Acción sugerida |
|-----------|------|-----------------|
| Alta | Resumen ejecutivo no usa BD | Coder: consumir /api/leads, /api/platform-admin/clients para KPI, Funnel, Clientes |
| Alta | Tickets: IDs inconsistentes + sin BD | Coder: unificar IDs lista/detalle; crear tabla platform_tickets y API |
| Media | Monitor VPS datos estáticos | Coder: API que lea métricas reales (Docker, BD, sistema) para entorno local |
| Media | CRM campañas sin BD | Coder: tabla platform_campaigns, API GET/PATCH, persistir activar/ejecutar |
| Media | Métricas negocio hardcoded | Coder: API con agregados desde subscriptions, assemblies, payments |
| Baja | "Exportar reporte" no exporta | Coder: implementar descarga CSV/Excel de leads |
| Baja | "Ejecutar campañas" sin lógica | Coder: integración con envío real (email, etc.) o dejar como placeholder documentado |

---

## 6. Verificación APIs (entorno actual)

| API | Estado | Nota |
|-----|--------|------|
| GET /api/leads | 500 | `platform_leads` no existe en BD (ejecutar 97_platform_leads.sql) |
| GET /api/platform-admin/clients | 200 | Devuelve fallback si `platform_client_status` no existe |
| GET /api/chatbot/config | 200 | OK |
| API tickets | No existe | - |
| API métricas negocio | No existe | - |
| API monitor/VPS real | No existe | - |

---

**Reportar en:** Contralor/ESTATUS_AVANCE.md. **Para Coder:** priorizar según tabla de acciones sugeridas (sección 5 y 7).

---

## 9. Chatbot – Prompts no sincronizados con /api/chat/resident (07 Feb 2026)

**Hallazgo QA:** Los prompts editados en Configuración Chatbot (landing, residente, demo, soporte) se guardan en `chatbot_config` pero **/api/chat/resident no los usa**. Usa `buildSystemPrompt()` hardcoded. La respuesta de la IA no refleja los cambios que Henry hace en la configuración.

**Para Coder:** Hacer que `/api/chat/resident` consulte `chatbot_config` (bot `web` o contexto `residente`) y use `prompts.residente` como base o override del system prompt.

---

## 7. Instrucción para Coder (Contralor asigna)

**Documento de referencia:** QA/QA_REPORTE_DASHBOARD_HENRY.md (este archivo).

**Tabla de acciones sugeridas para el Coder** (prioridad: Alta → Media → Baja):

| Prioridad | Item | Acción sugerida |
|-----------|------|-----------------|
| **Alta** | Resumen ejecutivo no usa BD | Consumir /api/leads, /api/platform-admin/clients para KPI, Funnel, Clientes en el dashboard principal. |
| **Alta** | Tickets: IDs inconsistentes + sin BD | Unificar IDs lista/detalle; crear tabla `platform_tickets` y API GET/PATCH (o seguir con seeds documentados hasta tener BD). |
| **Media** | Monitor VPS datos estáticos | API que lea métricas reales (Docker, BD, sistema) para entorno local, o dejar placeholder documentado. |
| **Media** | CRM campañas sin BD | Tabla `platform_campaigns`, API GET/PATCH, persistir activar/desactivar y estado. |
| **Media** | Métricas negocio hardcoded | API con agregados desde subscriptions, assemblies, payments (o placeholder documentado). |
| **Baja** | "Exportar reporte" no exporta | Implementar descarga CSV/Excel de leads desde /platform-admin/leads. |
| **Baja** | "Ejecutar campañas" sin lógica | Integración con envío real (email, etc.) o dejar como placeholder documentado. |

**Bloqueador previo (si aplica):** Si `Module not found: Can't resolve '@/lib/db'` en `src/app/api/leads/route.ts`, corregir path o exportación para que `/api/leads` y `/platform-admin/leads` funcionen. Ver QA_FEEDBACK.md § "QA Checklist · Navegación Dashboard Henry".

**Al finalizar:** Informar al Contralor. Contralor registra en ESTATUS_AVANCE.

---

## 8. Completado 100% (Coder)

**Fecha:** 26 Ene 2026

Todas las acciones sugeridas en §5 y §7 implementadas:

| Prioridad | Item | Estado |
|-----------|------|--------|
| Alta | Resumen ejecutivo desde BD | ✅ GET /api/leads, /api/platform-admin/clients en dashboard principal |
| Alta | Tickets + BD | ✅ Tabla platform_tickets, API GET/PATCH, lista y detalle con fallback |
| Media | Monitor VPS | ✅ GET /api/platform-admin/monitoring (placeholder documentado) |
| Media | CRM campañas | ✅ Tabla platform_campaigns, API GET/PATCH, POST execute (placeholder) |
| Media | Métricas negocio | ✅ GET /api/platform-admin/business (agregados BD o placeholder) |
| Baja | Exportar reporte | ✅ CSV desde /platform-admin/leads y GET /api/platform-admin/leads/export |
| Baja | Ejecutar campañas | ✅ POST /api/platform-admin/campaigns/execute (persiste last_executed_at; mensaje placeholder) |
