# 📊 ESTRUCTURA DE TAREAS Y PERFILES - ASSEMBLY 2.0
## Clarificación de Dashboards, Roles y Tareas

---

## 🎯 RESUMEN EJECUTIVO

**Pregunta clave:** ¿Quién tiene qué?

**Respuesta:**
- 👥 **Residentes/Propietarios** → Solo CHATBOT (sin dashboard)
- 🏢 **Admin PH (cliente)** → Dashboard de ASAMBLEA
- 🛠️ **Admin Plataforma (dueño Assembly 2.0)** → Dashboard INTELIGENTE

---

## 👥 PERFILES DE USUARIO (4 tipos)

### **PERFIL 1: Residente/Propietario** 👤

**¿Quién es?**
- Dueño de una unidad en un edificio (PH)
- Vive en el edificio
- Participa en asambleas

**¿Qué puede hacer?**
- ✅ Hablar con el chatbot Lex
- ✅ Votar en asambleas (si está "Al Día")
- ✅ Ver resultados en tiempo real
- ✅ Registrar su Face ID
- ❌ **NO tiene dashboard** (solo acceso al chatbot)

**Acceso:**
- Chatbot Telegram
- Link de asamblea (cuando hay una activa)
- Vista de resultados (durante asamblea)

**Registro:**
- El admin lo registra (sube Excel)
- O se auto-registra con código de invitación

---

### **PERFIL 2: Admin PH (Cliente de Assembly 2.0)** 🏢

**¿Quién es?**
- Administrador de 1 o varios edificios
- Organiza asambleas
- Gestiona propietarios
- **Cliente pagador** de Assembly 2.0

**¿Qué puede hacer?**
- ✅ Dashboard de ASAMBLEA completo
- ✅ Crear asambleas
- ✅ Gestionar propietarios (subir Excel, marcar Al Día/En Mora)
- ✅ Ver quórum en tiempo real
- ✅ Generar actas
- ✅ Configurar votaciones
- ✅ Hablar con chatbot Lex (soporte)
- ✅ Generar códigos de invitación para propietarios

**Acceso:**
- Dashboard web: `/dashboard/[organizationId]`
- Chatbot Telegram (soporte)
- Vista de presentación (proyectar en asamblea)

**Registro:**
- Activa Demo desde el chatbot
- O compra un plan (Standard, Pro, Enterprise)

**Planes:**
- 🆓 Demo (1 asamblea gratis)
- 💳 Por Asamblea ($150)
- ⭐ Standard ($99/mes)
- 🏢 Pro Multi-PH ($499/mes)
- 🏗️ Enterprise ($1,499/mes)

---

### **PERFIL 3: Admin Plataforma (Dueño de Assembly 2.0)** 🛠️

**¿Quién es?**
- Dueño de Assembly 2.0 (tú, Henry)
- NO administra edificios
- Administra la PLATAFORMA

**¿Qué puede hacer?**
- ✅ Dashboard INTELIGENTE de la plataforma
- ✅ Ver todos los leads (funnel)
- ✅ Ver todos los clientes
- ✅ Gestionar tickets de soporte
- ✅ Ver métricas de la plataforma
- ✅ Configurar chatbot
- ✅ Ver subscripciones y facturación
- ✅ Campañas de CRM
- ✅ Alertas inteligentes

**Acceso:**
- Dashboard web: `/platform-admin`
- Único usuario con este acceso

**Registro:**
- Usuario especial creado manualmente en BD
- `role = 'platform_admin'`

---

### **PERFIL 4: Junta Directiva** 🏛️

**¿Quién es?**
- Presidente, Tesorero o Secretario de un edificio
- NO es administrador profesional
- Administra su propio edificio

**¿Qué puede hacer?**
- ✅ Dashboard de ASAMBLEA (limitado)
- ✅ Ver asambleas de su edificio
- ✅ Ver propietarios
- ✅ Generar reportes
- ❌ NO puede modificar estados de pago (solo admin puede)

**Acceso:**
- Dashboard web: `/dashboard/[organizationId]` (vista limitada)
- Chatbot Telegram (consultas)

**Registro:**
- El admin los invita con rol 'board_member'

---

## 📱 DASHBOARDS (2 tipos)

### **DASHBOARD 1: Admin PH (Dashboard de Asamblea)** 🏢

**Ubicación:** `/dashboard/[organizationId]`

**Pantallas:**

1. **Home / Overview**
   - Próximas asambleas
   - Propietarios registrados
   - Estado general del PH

2. **Propietarios**
   - Lista completa
   - Importar Excel
   - Marcar Al Día / En Mora
   - Generar códigos de invitación

3. **Asambleas**
   - Crear nueva asamblea
   - Lista de asambleas (activas, pasadas, futuras)
   - Ver resultados de asambleas pasadas

4. **Asamblea Activa** (durante asamblea)
   - Panel de quórum en tiempo real
   - Marcar asistencia
   - Crear votaciones
   - Ver resultados en vivo
   - Grid de unidades con colores

5. **Votaciones**
   - Crear nueva votación
   - Configurar: título, descripción, tipo (mayoría simple, calificada, etc.)
   - Cerrar votación
   - Ver resultados

6. **Actas**
   - Generar acta automáticamente
   - Descargar PDF
   - Historial de actas

7. **Reportes**
   - Reporte de asistencia
   - Reporte de votaciones
   - Reporte de quórum
   - Exportar a Excel

8. **Configuración**
   - Datos del PH
   - Coeficientes
   - Notificaciones
   - Integraciones

**Acceso:**
- Admin PH (completo)
- Junta Directiva (solo lectura + reportes)

---

### **DASHBOARD 2: Admin Plataforma (Dashboard Inteligente)** 🛠️

**Ubicación:** `/platform-admin`

**Pantallas:**

1. **Home / Metrics**
   - KPIs principales
   - Gráficos de crecimiento
   - Alertas inteligentes

2. **Leads (Funnel)**
   - Pipeline visual
   - Leads por etapa
   - Conversión de demo a pago
   - Lead scoring

3. **Clientes**
   - Lista de clientes activos
   - Subscripciones
   - Uso de la plataforma
   - Alertas de churn

4. **Tickets (Soporte)**
   - Tickets abiertos
   - Prioridad (urgent, high, medium, low)
   - Asignación automática
   - Historial

5. **CRM Campaigns**
   - Campañas activas
   - Crear nueva campaña
   - Segmentar clientes
   - Métricas de campaña

6. **Chatbot**
   - Métricas del bot
   - Conversaciones activas
   - Configurar prompts
   - Ver logs

7. **Subscriptions**
   - Facturación
   - Planes activos
   - Cancelaciones
   - Upgrades/Downgrades

8. **Analytics**
   - Uso de la plataforma
   - Asambleas realizadas
   - Propietarios activos
   - ROI por cliente

**Acceso:**
- Solo Admin Plataforma (Henry)

---

## 🗂️ ESTRUCTURA DE TAREAS (4 tareas)

### **TAREA 1: Configuración Inicial** ✅ (Completada)

**Objetivo:** Configurar Supabase y Next.js

**Entregables:**
- [x] Supabase configurado
- [x] Schema SQL ejecutado
- [x] Next.js con conexión a Supabase
- [x] `.env.local` configurado

**Documento:** `TAREA_1_DOCKER_LOCAL.md`

**Estado:** ✅ COMPLETA

---

### **TAREA 2: Chatbot IA con Gemini + Telegram** ⏳ (En finalización)

**Objetivo:** Implementar chatbot inteligente con identificación de usuarios

**Entregables:**
- [ ] Bot de Telegram funcionando
- [ ] Sistema de identificación (Assembly ID, Unit ID, Codes)
- [ ] Base de conocimiento con 100+ preguntas
- [ ] Escalación automática a humano
- [ ] Gemini API integrado
- [ ] Tablas en BD: `chatbot_conversations`, `user_identities`, `invitation_codes`

**Documentos:**
- `TAREA_2_CHATBOT_GEMINI_TELEGRAM.md` (implementación)
- `SISTEMA_IDENTIFICACION_CHATBOT.md` (arquitectura de IDs)
- `BASE_CONOCIMIENTO_CHATBOT_LEX.md` (knowledge base)
- `CHECKLIST_CODER_TAREA_2.md` (validación del coder)
- `CHECKLIST_QA_TAREA_2.md` (auditoría de calidad)

**Tiempo estimado:** 8-11 horas (1-2 días)

**Estado:** ⏳ EN FINALIZACIÓN

**Perfil que usa:** 
- Residentes/Propietarios (principal)
- Admins PH (soporte)
- Admins Plataforma (monitoreo)

---

### **TAREA 3: Dashboard Admin Plataforma (Inteligente)** 📋 (Siguiente)

**Objetivo:** Dashboard para el dueño de Assembly 2.0 (Henry) para gestionar leads, tickets, subscripciones y CRM

**Entregables:**
- [ ] Dashboard `/platform-admin`
- [ ] Vista de Leads (funnel)
- [ ] Vista de Tickets (soporte)
- [ ] Vista de CRM Campaigns
- [ ] Vista de Subscripciones
- [ ] Vista de Chatbot (métricas)
- [ ] Alertas inteligentes
- [ ] Tablas en BD: `platform_leads`, `platform_tickets`, `platform_campaigns`, etc.

**Documentos:**
- `TAREA_3_DASHBOARD_ADMIN_INTELIGENTE.md` (implementación)
- `ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md` (arquitectura)

**Tiempo estimado:** 2-3 semanas

**Estado:** 📋 PENDIENTE (después de TAREA 2)

**Perfil que usa:**
- Admin Plataforma (Henry) - ÚNICO usuario

**Requisito previo:** TAREA 2 completa (usa `platform_leads` del chatbot)

---

### **TAREA 4: Dashboard Admin PH (Asamblea)** 📋 (Después de TAREA 3)

**Objetivo:** Dashboard para admins de PH (clientes) para gestionar asambleas, propietarios y votaciones

**Entregables:**
- [ ] Dashboard `/dashboard/[organizationId]`
- [ ] Vista de Propietarios (CRUD)
- [ ] Vista de Asambleas (crear, gestionar)
- [ ] Vista de Asamblea Activa (quórum en tiempo real)
- [ ] Vista de Votaciones (crear, cerrar)
- [ ] Vista de Actas (generar, descargar)
- [ ] Vista de Reportes
- [ ] Importar Excel de propietarios
- [ ] Generar códigos de invitación

**Documentos:**
- `TAREA_4_DASHBOARD_ADMIN_PH.md` (pendiente de crear)

**Tiempo estimado:** 3-4 semanas

**Estado:** 📋 PENDIENTE (después de TAREA 3)

**Perfil que usa:**
- Admin PH (clientes que compran planes)
- Junta Directiva (vista limitada)

**Requisito previo:** TAREA 3 completa

---

## 🔄 FLUJO DE IMPLEMENTACIÓN

```
TAREA 1 (Completa) ✅
    ↓
TAREA 2 (Chatbot) ⏳
    ↓ [QA aprueba]
    ↓
TAREA 3 (Dashboard Admin Plataforma) 📋
    ↓ [QA aprueba]
    ↓
TAREA 4 (Dashboard Admin PH) 📋
    ↓ [QA aprueba]
    ↓
LANZAMIENTO 🚀
```

---

## 📊 MATRIZ DE ACCESO

| Perfil | Chatbot | Dashboard PH | Dashboard Plataforma | Vista Asamblea |
|--------|---------|-------------|---------------------|----------------|
| **Residente** | ✅ SÍ | ❌ NO | ❌ NO | ✅ SÍ (solo votar) |
| **Admin PH** | ✅ SÍ (soporte) | ✅ SÍ (completo) | ❌ NO | ✅ SÍ (gestionar) |
| **Junta Directiva** | ✅ SÍ (consultas) | ✅ SÍ (limitado) | ❌ NO | ✅ SÍ (observar) |
| **Admin Plataforma** | ✅ SÍ (monitoreo) | ✅ SÍ (ver todo) | ✅ SÍ (único) | ✅ SÍ (ver todo) |

---

## 🎯 RESPUESTAS A TUS PREGUNTAS

### **P1: ¿Los residentes tienen dashboard?**
**R:** ❌ **NO**. Solo tienen acceso al chatbot y a la vista de votación durante asambleas.

---

### **P2: ¿Cuántos dashboards hay?**
**R:** ✅ **2 dashboards**:
1. **Dashboard Admin PH** (`/dashboard/[orgId]`) → Para clientes (TAREA 4)
2. **Dashboard Admin Plataforma** (`/platform-admin`) → Para ti, Henry (TAREA 3)

---

### **P3: ¿Cuántos perfiles hay?**
**R:** ✅ **4 perfiles principales**:
1. Residente/Propietario (solo chatbot)
2. Admin PH (dashboard asamblea)
3. Junta Directiva (dashboard limitado)
4. Admin Plataforma (dashboard inteligente)

---

### **P4: ¿En qué tarea estamos?**
**R:** ⏳ **Finalizando TAREA 2** (Chatbot)
- Siguiente: **TAREA 3** (Dashboard Admin Plataforma para ti)
- Después: **TAREA 4** (Dashboard Admin PH para clientes)

---

### **P5: ¿Qué hace el Coder ahora?**
**R:** 
1. ✅ Completar implementación de TAREA 2
2. ✅ Marcar `CHECKLIST_CODER_TAREA_2.md` como COMPLETA
3. ⏳ Esperar auditoría de QA
4. ✅ Si QA aprueba → Empezar TAREA 3

---

### **P6: ¿Qué hace QA ahora?**
**R:**
1. ⏳ Esperar notificación del Coder
2. ✅ Ejecutar `CHECKLIST_QA_TAREA_2.md`
3. ✅ Aprobar / Aprobar con observaciones / Rechazar
4. ✅ Notificar resultado

---

## 📝 RESUMEN EJECUTIVO

### **Estado Actual:**
- ✅ TAREA 1: Completa
- ⏳ TAREA 2: En finalización (80% completa)
- 📋 TAREA 3: Pendiente (siguiente)
- 📋 TAREA 4: Pendiente

### **Perfiles:**
| Perfil | Cantidad | Dashboard | Chatbot |
|--------|----------|-----------|---------|
| Residentes | ~200-300 por PH | ❌ NO | ✅ SÍ |
| Admins PH | 1-5 por PH | ✅ SÍ | ✅ SÍ |
| Admin Plataforma | 1 (Henry) | ✅ SÍ | ✅ SÍ |

### **Dashboards:**
| Dashboard | Usuario | URL | Tareas |
|-----------|---------|-----|--------|
| Admin Plataforma | Henry | `/platform-admin` | TAREA 3 |
| Admin PH | Clientes | `/dashboard/[orgId]` | TAREA 4 |

### **Próximos Pasos:**
1. ✅ Coder termina TAREA 2
2. ✅ QA audita TAREA 2
3. ✅ Si aprobado → Coder empieza TAREA 3
4. ✅ Después de TAREA 3 → Coder empieza TAREA 4

---

## ✅ CONFIRMACIÓN

**Henry, por favor confirma:**

- [ ] Entiendo que residentes NO tienen dashboard (solo chatbot)
- [ ] Entiendo que hay 2 dashboards (Admin Plataforma y Admin PH)
- [ ] Entiendo que TAREA 3 es MI dashboard (Admin Plataforma)
- [ ] Entiendo que TAREA 4 es el dashboard de CLIENTES (Admin PH)
- [ ] Entiendo el orden: TAREA 2 → 3 → 4

---

**Última actualización:** 2026-01-27  
**Versión:** 1.0  
**Autor:** Arquitecto Assembly 2.0
