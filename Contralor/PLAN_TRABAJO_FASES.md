# 📋 PLAN DE TRABAJO POR FASES - Assembly 2.0
## Control de Desarrollo del Contralor

**Versión:** 1.0  
**Fecha:** 30 Enero 2026  
**Responsable:** Contralor  
**Objetivo:** MVP en 30 días

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

## 📊 RESUMEN DE TIMELINE

```
FASE 3: Login OTP .......... Días 1-5   [🔴 ACTUAL - BLOQUEADO]
FASE 4: Dashboard Admin PH . Días 6-15  [⏸️ PENDIENTE]
FASE 5: Votación básica .... Días 16-22 [⏸️ PENDIENTE]
FASE 6: Acta y Deploy ...... Días 23-30 [⏸️ PENDIENTE]
                                         ─────────────
                             TOTAL:      30 días
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
