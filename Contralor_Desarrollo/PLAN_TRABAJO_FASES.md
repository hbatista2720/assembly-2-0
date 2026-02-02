# 📋 PLAN DE TRABAJO POR FASES - Assembly 2.0
## Control de Desarrollo del Contralor

**Versión:** 2.0 (ACTUALIZADO con fases de monetización)  
**Fecha:** 30 Enero 2026  
**Responsable:** Contralor  
**Objetivo:** MVP completo en 30-35 días

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Fases | Estado |
|-----------|-------|--------|
| **CORE (MVP Mínimo)** | 0-6 | 3/7 completadas (43%) |
| **MONETIZACIÓN** | 7-11 | 0/5 completadas (0%) |
| **PRODUCCIÓN** | 12-13 | 0/2 completadas (0%) |
| **TOTAL** | 14 fases | 3/14 (22%) |

---

## 🎯 FASE ACTUAL: FASE 3 - LOGIN OTP

### **Estado:** 🔴 BLOQUEADO
### **Problema:** OTP no envía código por email

---

## FASE 3: LOGIN & AUTENTICACIÓN OTP

### **Duración estimada:** 3-5 días
### **Responsable principal:** Coder
### **Dependencias:** Supabase configurado

### Tareas:

| # | Tarea | Responsable | Estado | Bloqueador |
|---|-------|-------------|--------|------------|
| 3.1 | Configurar SMTP en Supabase | Coder | ⏸️ | Necesita credenciales |
| 3.2 | Activar modo DEMO temporal | Coder | 🔴 URGENTE | Ninguno |
| 3.3 | Probar login con 3 usuarios | QA | ⏸️ | Depende de 3.2 |
| 3.4 | Redirección por rol funcional | Coder | ✅ | - |
| 3.5 | Middleware protección rutas | Coder | ⏸️ | Depende de 3.3 |

### **INSTRUCCIÓN PARA CODER (URGENTE):**

```
✅ CONFIGURACIÓN YA CORRECTA EN .env.local:
   NEXT_PUBLIC_OTP_DEMO=true

USUARIOS DE PRUEBA + CÓDIGO DEMO:
┌─────────────────────────────────┬───────────┬─────────────────────────┐
│ EMAIL                           │ CÓDIGO    │ DASHBOARD               │
├─────────────────────────────────┼───────────┼─────────────────────────┤
│ henry.batista27@gmail.com       │ 123456    │ /dashboard/platform-admin│
│ demo@assembly2.com              │ 123456    │ /dashboard/admin-ph?mode=demo│
│ admin@torresdelpacifico.com     │ 123456    │ /dashboard/admin-ph     │
└─────────────────────────────────┴───────────┴─────────────────────────┘

PASOS PARA PROBAR:
1. Reiniciar servidor: npm run dev
2. Ir a: http://localhost:3000/login
3. Ingresar email de prueba
4. Ingresar código: 123456
5. Verificar redirección al dashboard correcto

SI NO FUNCIONA:
- Verificar consola del navegador (F12 → Console)
- Verificar terminal del servidor por errores
- Probar en modo incógnito (caché)
```

### **Criterios de aceptación (QA):**
- [ ] Login funciona con los 3 usuarios de prueba
- [ ] Redirección correcta según rol
- [ ] Middleware protege rutas /dashboard/*
- [ ] Logout funciona correctamente

### **Siguiente fase:** FASE 4 - Dashboard Admin PH

---

## FASE 4: DASHBOARD ADMIN PH

### **Duración estimada:** 7-10 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 3 completada y aprobada por QA

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 4.1 | Layout con sidebar navegable | Coder | ⏸️ | Alta |
| 4.2 | Módulo Propietarios - Lista | Coder | ⏸️ | Alta |
| 4.3 | Módulo Propietarios - CRUD | Coder | ⏸️ | Alta |
| 4.4 | Módulo Propietarios - Import Excel | Coder | ⏸️ | Media |
| 4.5 | Módulo Asambleas - Lista | Coder | ⏸️ | Alta |
| 4.6 | Módulo Asambleas - Wizard crear | Coder | ⏸️ | Alta |
| 4.7 | Schema BD - tablas propietarios | Database | ⏸️ | Alta |
| 4.8 | Schema BD - tablas asambleas | Database | ⏸️ | Alta |
| 4.9 | RLS policies multi-tenant | Database | ⏸️ | Alta |

### **Criterios de aceptación (QA):**
- [ ] CRUD propietarios funciona completo
- [ ] Crear asamblea con wizard de 4 pasos
- [ ] Datos aislados por organization_id (RLS)
- [ ] Responsive en mobile/tablet/desktop

---

## FASE 5: VOTACIÓN BÁSICA

### **Duración estimada:** 5-7 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 4 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 5.1 | Crear temas de votación | Coder | ⏸️ | Alta |
| 5.2 | Interface de votación | Coder | ⏸️ | Alta |
| 5.3 | Resultados en tiempo real | Coder | ⏸️ | Alta |
| 5.4 | Cálculo quórum Ley 284 | Coder | ⏸️ | Alta |
| 5.5 | Alertas de quórum | Coder | ⏸️ | Media |
| 5.6 | Schema BD - votos | Database | ⏸️ | Alta |
| 5.7 | Función calculate_quorum() | Database | ⏸️ | Alta |

### **Criterios de aceptación (QA):**
- [ ] Crear tema con opciones A/B/C/Abstención
- [ ] Votar funciona (1 voto por unidad)
- [ ] Resultados se actualizan en vivo
- [ ] Quórum se calcula según Ley 284

---

## FASE 6: ACTA Y DEPLOY

### **Duración estimada:** 3-5 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 5 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 6.1 | Generación acta texto | Coder | ⏸️ | Alta |
| 6.2 | Export PDF básico | Coder | ⏸️ | Media |
| 6.3 | Testing integración completo | QA | ⏸️ | Alta |
| 6.4 | Configurar dominio | Coder | ⏸️ | Alta |
| 6.5 | Deploy Vercel producción | Coder | ⏸️ | Alta |
| 6.6 | Configurar SMTP producción | Coder | ⏸️ | Alta |

### **Criterios de aceptación (QA):**
- [ ] Acta se genera con datos de asamblea
- [ ] PDF descargable
- [ ] Deploy funciona en producción
- [ ] OTP real funciona (SMTP configurado)

---

---

## FASE 7: DASHBOARD ADMIN PLATAFORMA (HENRY)

### **Duración estimada:** 5-7 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 4 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 7.1 | Layout dashboard Henry | Coder | ⏸️ | Alta |
| 7.2 | Vista de todos los PHs | Coder | ⏸️ | Alta |
| 7.3 | Métricas de uso (asambleas, votos) | Coder | ⏸️ | Alta |
| 7.4 | Gestión de suscripciones | Coder | ⏸️ | Alta |
| 7.5 | Leads del chatbot (funnel) | Coder | ⏸️ | Media |
| 7.6 | Tickets de soporte | Coder | ⏸️ | Media |
| 7.7 | Reportes financieros | Coder | ⏸️ | Media |

### **Criterios de aceptación (QA):**
- [ ] Henry puede ver todos los PHs registrados
- [ ] Métricas de uso se actualizan en tiempo real
- [ ] Puede gestionar suscripciones (activar/cancelar)
- [ ] Ve leads del chatbot con score de calificación

---

## FASE 8: PRECIOS Y SUSCRIPCIONES

### **Duración estimada:** 3-4 días
### **Responsable principal:** Database + Coder
### **Dependencias:** FASE 7 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 8.1 | Tabla subscriptions | Database | ⏸️ | Alta |
| 8.2 | Tabla plans (límites por plan) | Database | ⏸️ | Alta |
| 8.3 | API de suscripciones | Coder | ⏸️ | Alta |
| 8.4 | Validación de límites | Coder | ⏸️ | Alta |
| 8.5 | Trial de 14 días | Coder | ⏸️ | Alta |
| 8.6 | Créditos de asamblea | Database | ⏸️ | Media |

### **Planes a implementar:**
```
├─ Demo (14 días, 1 PH, 1 asamblea)
├─ Evento Único ($225, 1 asamblea)
├─ Standard ($189/mes, ilimitadas)
├─ Multi-PH ($699/mes, hasta 10 PHs)
└─ Enterprise ($2,499/mes, ilimitado + CRM)
```

---

## FASE 9: MÉTODOS DE PAGO

### **Duración estimada:** 5-7 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 8 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 9.1 | Integración Stripe (tarjetas intl) | Coder | ⏸️ | Alta |
| 9.2 | Integración Yappy (Panamá) | Coder | ⏸️ | Alta |
| 9.3 | Integración ACH (transferencia) | Coder | ⏸️ | Alta |
| 9.4 | Integración PayPal | Coder | ⏸️ | Alta |
| 9.5 | Integración Tilopay (Centroamérica) | Coder | ⏸️ | Alta |
| 9.6 | Webhooks de pago (todos) | Coder | ⏸️ | Alta |
| 9.7 | Selector de método de pago | Coder | ⏸️ | Alta |
| 9.8 | Facturas automáticas | Coder | ⏸️ | Media |
| 9.9 | Recordatorios de pago | Coder | ⏸️ | Media |

### **Métodos de Pago:**
```
┌─────────────────────────────────────────────────────────────┐
│ MÉTODO          │ REGIÓN           │ TIPO                  │
├─────────────────┼──────────────────┼───────────────────────┤
│ Stripe          │ Internacional    │ Tarjetas crédito/déb  │
│ PayPal          │ Internacional    │ Wallet digital        │
│ Yappy           │ Panamá           │ Wallet móvil (Banistmo)│
│ Tilopay         │ Centroamérica    │ Tarjetas locales      │
│ ACH             │ USA/Panamá       │ Transferencia directa │
└─────────────────┴──────────────────┴───────────────────────┘
```

---

## FASE 10: MENÚ DEMO (SANDBOX)

### **Duración estimada:** 2-3 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 4 completada

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 10.1 | Datos de ejemplo (PH ficticio) | Database | ⏸️ | Alta |
| 10.2 | Asamblea de prueba pre-cargada | Database | ⏸️ | Alta |
| 10.3 | Votación simulada | Coder | ⏸️ | Alta |
| 10.4 | Reset automático cada 24h | Coder | ⏸️ | Media |
| 10.5 | CTA para upgrade | Coder | ⏸️ | Alta |

---

## FASE 11: LEAD VALIDATION

### **Duración estimada:** 2-3 días
### **Responsable principal:** Coder
### **Dependencias:** FASE 2 (Chatbot) + FASE 7 (Dashboard Henry)

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 11.1 | Chatbot captura datos (email, tel, PH) | Coder | ⏸️ | Alta |
| 11.2 | Validación de email | Coder | ⏸️ | Alta |
| 11.3 | Score de calificación | Coder | ⏸️ | Alta |
| 11.4 | Integración con CRM Henry | Coder | ⏸️ | Alta |
| 11.5 | Notificación de leads calientes | Coder | ⏸️ | Media |
| 11.6 | Tabla leads | Database | ⏸️ | Alta |

---

## FASE 12-13: DOCKER Y DEPLOY VPS

### **Duración estimada:** 3-5 días
### **Responsable principal:** Coder
### **Dependencias:** FASES CORE completadas

### Tareas:

| # | Tarea | Responsable | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 12.1 | docker-compose.yml completo | Coder | ⏸️ | Alta |
| 12.2 | Dockerfiles (app + bots) | Coder | ⏸️ | Alta |
| 12.3 | Scripts de backup | Coder | ⏸️ | Alta |
| 13.1 | Configurar VPS Hetzner | Coder | ⏸️ | Alta |
| 13.2 | Deploy con Docker | Coder | ⏸️ | Alta |
| 13.3 | SSL + dominio | Coder | ⏸️ | Alta |
| 13.4 | Monitoreo y alertas | Coder | ⏸️ | Media |

---

## 📊 RESUMEN DE TIMELINE (ACTUALIZADO)

```
FASES CORE (MVP Mínimo):
──────────────────────────────────────────────────────────
FASE 3: Login OTP .............. Días 1-3   [🔄 EN PROGRESO]
FASE 4: Dashboard Admin PH ..... Días 4-10  [⏸️ PENDIENTE]
FASE 5: Votación básica ........ Días 11-15 [⏸️ PENDIENTE]
FASE 6: Actas y Reportes ....... Días 16-18 [⏸️ PENDIENTE]

FASES MONETIZACIÓN:
──────────────────────────────────────────────────────────
FASE 7: Dashboard Henry ........ Días 19-23 [⏸️ PENDIENTE]
FASE 8: Precios/Suscripciones .. Días 24-26 [⏸️ PENDIENTE]
FASE 9: Métodos de Pago ........ Días 27-30 [⏸️ PENDIENTE]
FASE 10: Menú Demo ............. Paralelo   [⏸️ PENDIENTE]
FASE 11: Lead Validation ....... Paralelo   [⏸️ PENDIENTE]

FASES PRODUCCIÓN:
──────────────────────────────────────────────────────────
FASE 12-13: Docker + Deploy VPS  Días 31-35 [⏸️ PENDIENTE]

                                 ───────────────────────
                   TOTAL MVP:    30 días (CORE + MONETIZACIÓN)
                   PRODUCCIÓN:   +5 días
```

---

## 🚨 BLOQUEOS ACTUALES

| Bloqueador | Impacto | Solución | Responsable |
|------------|---------|----------|-------------|
| OTP no envía email | FASE 3 bloqueada | ✅ YA CONFIGURADO - Solo reiniciar servidor y usar código 123456 | Coder |

**NOTA:** El archivo `.env.local` ya tiene `NEXT_PUBLIC_OTP_DEMO=true`. Solo falta:
1. Reiniciar el servidor (`npm run dev`)
2. Probar login con código `123456`

---

**Última actualización:** 30 Enero 2026  
**Próxima revisión:** Diaria hasta resolver bloqueador
