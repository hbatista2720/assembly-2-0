# 📊 ESTATUS DE AVANCE - Assembly 2.0
## Control del Contralor

**Última actualización:** Febrero 2026  
**Responsable:** Contralor

**Rol Contralor con Henry:** Ser directo. Toda instrucción = **Tarea** + **Agente** + **dónde está** (plan de navegación de pruebas o avances). No rodeos.

**Regla de cierre de tarea:** Al terminar, el agente informa al Contralor. El Contralor valida y dice la próxima actividad en una frase, ej.: «Coder: realizar [tarea X]» o «QA: validar [Y]».

**Recordatorio para todos los agentes (Arquitecto, Contralor, Database, Coder, Marketing, QA):** No crear carpetas innecesarias. Usar la estructura existente del proyecto (Contralor/, QA/, Coder/, Arquitecto/, Marketing/, etc.) para evitar confusiones. Ver Contralor/EQUIPO_AGENTES_CURSOR.md – Regla 9.

**Informar a Marketing (carpeta para reportes):** Los reportes e informes de Marketing deben subirse **solo en la carpeta Marketing/** (ya existente). No crear carpetas nuevas sin consentimiento del Contralor.

---

## 📋 PROTOCOLO DE BACKUP POR FASE

```
🔒 REGLA OBLIGATORIA (Establecida por Henry - Product Owner):

RESPONSABLES DEL BACKUP:
├─ Henry (Product Owner): AUTORIZA cuándo hacer backup
└─ Contralor: EJECUTA el commit y push

⚠️ OTROS AGENTES NO HACEN BACKUP (Arquitecto, Coder, Database, QA, Marketing)

FLUJO:
1. ✅ Fase completada por Coder
2. ✅ QA aprueba la fase
3. ✅ Henry autoriza: "Hacer backup"
4. ✅ Contralor ejecuta: commit + push
5. ✅ Contralor confirma: "Backup completado"
6. ✅ Se autoriza inicio de siguiente fase

FORMATO DE COMMIT:
"FASE X completada: [descripción] - Aprobado por QA"
```

| Fase | Estado QA | Commit | Push GitHub |
|------|-----------|--------|-------------|
| FASE 0 | ✅ Aprobado | ✅ 8039fd7 | ✅ 30 Ene 2026 |
| FASE 1 | ✅ Aprobado | ✅ 8039fd7 | ✅ 30 Ene 2026 |
| FASE 2 | ✅ Aprobado | ✅ 8039fd7 | ✅ 30 Ene 2026 |
| FASE 3 | ✅ Aprobado | ✅ 8039fd7 | ✅ 30 Ene 2026 |
| FASE 4 | ✅ Aprobado QA | ✅ 8039fd7 | ✅ 30 Ene 2026 |
| FASE 5 | ✅ Aprobado QA | ✅ 68ecd64 | ✅ 30 Ene 2026 |
| FASE 6 | ✅ Aprobado QA | ✅ 137421b | ✅ 30 Ene 2026 |
| FASE 7 | ✅ Aprobado QA | ✅ bd253ff | ✅ 02 Feb 2026 |
| FASE 8 | ✅ Aprobado QA | ✅ 3715276 | ⚠️ Push manual (Henry) |
| FASE 9, 10, 11 | ✅ Aprobado QA | ✅ dc1f9c7 | ⏳ Push (Henry si falla) |
| Plan navegación + Chatbot residente (Opción B) + Usuarios demo | ✅ Aprobado QA | ✅ a76fb32 | ✅ Push OK |

**Último backup:** **Completado.** Push ejecutado por Henry: **9fcd533..b2e3be6** main → main (4 Mar 2026). Incluye: docs ACTUALIZAR_VPS_CON_GITHUB, tarea Coder deploy VPS assembly-prod.
**Repositorio:** https://github.com/hbatista2720/assembly-2-0

**¿Backup requerido ahora?** No. Backup completo (b2e3be6). **Validación redirección por rol:** ✅ QA aprobó. Ver QA_FEEDBACK.md § "QA Validación · Redirección por rol". **Usuarios demo por plan:** ✅ Ejecutado. Ver REPORTE_USUARIOS_DEMO_POR_PLAN.md. **Siguiente:** Más pruebas (plan § "Próximas pruebas"), QA validar Dashboard Admin PH con los 5 usuarios por plan.

**Reporte Coder al Contralor (últimos cambios – tema, perfil, demo, contadores):**
- Botón **"Subir a plan real"** validado: redirige a `/pricing?from=demo` (trazabilidad).
- **Usuario demo:** demo@assembly2.com — contadores sincronizados a **50 residentes** en Dashboard y en Monitor (antes 311).
- **Monitor:** Para assemblyId demo se generan 50 unidades (Torre A, 50); para el resto se mantienen 200+111.
- **Dashboard Admin PH:** En modo demo (subscription demo u organización demo) se muestran 50 propietarios en lista de PH y KPIs.
- Cambios previos ya aplicados: tema claro/oscuro, perfil (avatar, tema, foto, organización), sidebar, "Dashboard principal" limpia PH seleccionado, listas y gráfica en tema claro, script antiparpadeo.

**Instrucción para QA:** Probar con usuario **demo@assembly2.com**: login, dashboard (contadores 50 en lista y KPIs), Monitor (50 residentes/unidades), editar perfil, tema claro/oscuro y botón "Subir a plan real" → debe llevar a /pricing?from=demo.

**¿Por qué el Contralor no puede hacer el backup directo (push)?**  
El **commit** sí se hace desde aquí (Contralor/Cursor). El **push** a GitHub no: GitHub pide usuario y contraseña o token. Esas credenciales solo están en tu sesión (tu máquina, tu IDE, tu cuenta). Por eso el flujo es: (1) Contralor hace commit cuando autorizas; (2) tú ejecutas `git push origin main` en tu terminal para subir a GitHub. Así el backup queda completo.

---

## 🤝 ACUERDO CONTRALOR - PRODUCT OWNER (Henry)

**Fecha:** 30 Enero 2026  
**Estado:** ✅ APROBADO

### **Directrices acordadas:**

| # | Directriz | Aplicación |
|---|-----------|------------|
| 1 | **Supervisar observaciones** | Verificar que feedback de agentes se alinee con MVP |
| 2 | **Mantener orden de trabajo** | Fases secuenciales, no saltar pasos |
| 3 | **Evitar desviaciones** | Detener propuestas fuera del alcance MVP |
| 4 | **Priorizar lanzamiento** | 30 días MVP, features adicionales después |

### **Regla de Oro:**
```
🎯 OBJETIVO: Lanzamiento en 30 días

❌ NO PERMITIDO:
• Agregar features fuera del MVP
• Cambiar arquitectura sin justificación
• Perfeccionismo que retrase lanzamiento

✅ PERMITIDO:
• Correcciones críticas de QA
• Ajustes menores que no bloqueen
• Mejoras post-lanzamiento
```

---

## 🎯 PROGRESO GENERAL

```
[████████████████████████] 85%
```

### **¿En qué fase estamos?**

Estamos **tras FASES 9, 10 y 11** (monetización completada) y el bloque **Plan navegación + Chatbot residente + Usuarios demo** (backup a76fb32 OK). Siguiente: **pulido y validación** — Coder (botón retorno Platform Admin), **Marketing** (validar dashboard Henry: información correcta y aspecto visual inteligente para Henry). Luego FASE 12 (Docker local) y FASE 13 (Deploy VPS).

### **FASES CORE (MVP Mínimo):**

| # | Fase | Progreso | Estado | QA |
|---|------|----------|--------|-----|
| 0 | Git & Backup | 100% | ✅ COMPLETADO | ✅ Aprobado |
| 1 | Landing Page | 100% | ✅ COMPLETADO | ✅ Aprobado |
| 2 | Chatbot IA (Telegram) | 100% | ✅ COMPLETADO | ✅ Aprobado |
| **3** | **Login OTP** | 100% | ✅ COMPLETADO | ✅ Aprobado |
| **4** | **Dashboard Admin PH** | 100% | ✅ COMPLETADO | ✅ Aprobado |
| **5** | **Votación + Monitor** | 100% | ✅ COMPLETADO | ✅ Aprobado |
| **6** | **Actas y Reportes** | 100% | ✅ COMPLETADO | ✅ Aprobado |

### **FASES MONETIZACIÓN (Ingresos):**

| # | Fase | Progreso | Estado | QA |
|---|------|----------|--------|-----|
| **7** | **Dashboard Admin Plataforma (Henry)** | 100% | ✅ COMPLETADO | ✅ Aprobado |
| **8** | **Precios y Suscripciones (BD)** | 100% | ✅ COMPLETADO | ✅ Aprobado QA |
| 9 | Métodos de Pago (solo PayPal, Tilopay, Yappy, ACH; Stripe quitado) | 100% | ✅ COMPLETADO | ✅ Aprobado QA |
| 10 | Menú Demo (sandbox) | 100% | ✅ COMPLETADO | ✅ Aprobado QA |
| 11 | Lead Validation (chatbot → CRM) | 100% | ✅ COMPLETADO | ✅ Aprobado QA |

### **FASES PRODUCCIÓN:**

| # | Fase | Progreso | Estado | QA |
|---|------|----------|--------|-----|
| 12 | Docker Local (desarrollo) | 40% | 🔄 EN PROGRESO | ⏸️ Esperando |
| 13 | Deploy VPS (producción) | 0% | ⏸️ Pendiente | ⏸️ Esperando |

---

### **DETALLE DE FASES FALTANTES:**

#### **FASE 7: Dashboard Admin Plataforma (Henry)**
```
Funcionalidades:
├─ Vista de todos los PHs registrados
├─ Métricas de uso (asambleas, votos, usuarios)
├─ Gestión de suscripciones (activas, vencidas, trial)
├─ Leads del chatbot (funnel de conversión)
├─ Tickets de soporte escalados
├─ Configuración de planes y precios
└─ Reportes financieros
```

#### **FASE 8: Precios y Suscripciones**
```
Funcionalidades:
├─ Tabla subscriptions en BD
├─ Planes: Demo, Evento Único, Standard, Multi-PH, Enterprise
├─ Límites por plan (asambleas, usuarios, storage)
├─ Trial de 14 días
├─ Upgrade/downgrade de plan
└─ Créditos de asamblea
```

#### **FASE 9: Métodos de Pago**
```
⚠️ STRIPE QUITADO: No permite retiros en Panamá. Ver Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md

Funcionalidades (pasarelas con retiro en Panamá):
├─ PayPal (principal – tarjetas + retiro a bancos Panamá)
├─ Tilopay (principal – tarjetas locales / Centroamérica)
├─ Yappy (Panamá – wallet móvil / botón de pago)
├─ ACH / Transferencia bancaria (manual)
├─ Webhooks de pago exitoso/fallido
├─ Facturas automáticas
└─ Recordatorios de pago
```

#### **FASE 10: Menú Demo (Sandbox)**
```
Funcionalidades:
├─ Modo demo con datos de ejemplo
├─ PH ficticio pre-cargado
├─ Asamblea de prueba lista
├─ Votación simulada
├─ Reset automático cada 24h
└─ CTA para upgrade a plan real
```

#### **FASE 11: Lead Validation**
```
Funcionalidades:
├─ Chatbot captura email + teléfono + PH
├─ Validación de email (formato + dominio)
├─ Score de calificación automático
├─ Integración con CRM (Dashboard Henry)
├─ Notificación a Henry de leads calientes
└─ Seguimiento automático (nurturing)
```

---

## ✅ FASE 3 COMPLETADA - INICIANDO FASE 4

### FASE 3: Login OTP - ✅ COMPLETADO (30 Enero 2026)

**Confirmado por Coder:**
- ✅ Login OTP implementado y funcional
- ✅ Modo DEMO configurado (código: 123456)
- ✅ Redirección por rol funcional
- ✅ Docker Postgres funcionando (puerto 5433)
- ✅ Middleware protege rutas `/dashboard/*`

---

## ✅ OBSERVACIONES QA CORREGIDAS (30 Enero 2026)

**Coder completó:**
- ✅ FASE 1 (Landing) - Observaciones corregidas
- ✅ FASE 2 (Chatbot) - Checklist verificado
- ✅ FASE 3 (Login OTP) - 100% funcional

**Aprobado por:** Henry (Product Owner) + Contralor

---

## 🚨 ACLARACIÓN IMPORTANTE PARA QA

### **Error "Database error finding user" - YA NO APLICA**

```
⚠️ CONTEXTO:
El error "Database error finding user" que aparecía en QA/QA_FEEDBACK.md
era un problema de SUPABASE CLOUD.

✅ RESUELTO:
El proyecto migró de Supabase Cloud → Docker Local VPS
Este error YA NO EXISTE en la arquitectura actual.

📁 NUEVA ARQUITECTURA (30 Enero 2026):
├─ PostgreSQL Local (Docker, puerto 5433)
├─ Auth Self-Hosted (OTP + JWT)
├─ Redis Local (sesiones, cache)
└─ NO usa Supabase Cloud

📁 DOCUMENTACIÓN:
├─ Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md
└─ Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md
```

**QA debe actualizar su checklist para reflejar la nueva arquitectura Docker Local VPS.**

---

## ✅ FASE 5 COMPLETADA Y APROBADA

| Criterio FASE 5 | Estado |
|-----------------|--------|
| Vista Resumen de Votaciones | ✅ |
| Matriz de Unidades (200-600 adaptativo) | ✅ |
| WebSocket tiempo real | ✅ |
| Colores automáticos por estado | ✅ |
| Dashboard Monitor Henry (Módulo 8) | ✅ |
| **Aprobado por QA** | ✅ 30 Ene 2026 |
| **Backup GitHub** | ✅ Commit 68ecd64 |

---

## ✅ FASE 6 COMPLETADA Y APROBADA POR QA

| Criterio FASE 6 | Estado |
|-----------------|--------|
| Generación automática de acta | ✅ |
| Exportar PDF con firmas | ✅ |
| Historial de asambleas | ✅ |
| Reportes de votación por tema | ✅ |
| Estadísticas de participación | ✅ |
| Exportar Excel/CSV | ✅ |
| **Aprobado por QA** | ✅ 30 Ene 2026 |
| **Backup GitHub** | ✅ Commit 137421b |

**VEREDICTO FINAL:** ✅ **FASE 6 APROBADA + BACKUP - Avanzar a FASE 7**

---

## ✅ FASE 7 COMPLETADA - PENDIENTE APROBACIÓN QA

### **VALIDACIÓN DEL CONTRALOR (02 Febrero 2026):**

| Criterio FASE 7 | Estado |
|-----------------|--------|
| Monitor de recursos (CPU, RAM, Disco, DB) | ✅ COMPLETADO |
| Calendario de ocupación con colores | ✅ COMPLETADO |
| Alertas proactivas de capacidad | ✅ COMPLETADO |
| Predicción de carga (30 días) | ✅ COMPLETADO |
| Lista de PHs con estado suscripción | ✅ COMPLETADO |
| Métricas de negocio (ingresos, churn) | ✅ COMPLETADO |

| Aprobación | Fecha |
|------------|-------|
| ✅ Coder | 02 Febrero 2026 |
| ✅ Contralor | 02 Febrero 2026 |
| ✅ QA | 02 Febrero 2026 |

**VEREDICTO FINAL:** ✅ **FASE 7 APROBADA - Avanzar a FASE 8**

---

## 📋 INSTRUCCIÓN PARA ARQUITECTO (Del Contralor) - FASE 8

```
🎯 ORDEN DEL CONTRALOR: Validar FASE 8 antes de enviar a Coder

📢 MARKETING ACTUALIZÓ PRECIOS (v4.0 - 03 Febrero 2026)
⚠️ ARQUITECTO debe validar técnicamente ANTES de pasar a Coder

═══════════════════════════════════════════════════════════
CAMBIOS DE MARKETING A VALIDAR:
═══════════════════════════════════════════════════════════

📖 FUENTE: Marketing/MARKETING_PRECIOS_COMPLETO.md

PLANES ACTUALIZADOS (v4.0):
┌──────────────────┬──────────┬───────────┬────────────┬─────────┐
│ Plan             │ Precio   │ Asambleas │ Residentes │ PHs     │
├──────────────────┼──────────┼───────────┼────────────┼─────────┤
│ Evento Único     │ $225     │ 1         │ 250        │ 1       │
│ Dúo Pack         │ $389     │ 2         │ 250        │ 1       │
│ Standard         │ $189/mes │ 2/mes     │ 250        │ 1       │
│ Multi-PH Lite    │ $399/mes │ 5/mes     │ 1,500      │ 10      │ ← NUEVO
│ Multi-PH Pro     │ $699/mes │ 15/mes    │ 5,000      │ 30      │
│ Enterprise       │ $2,499   │ ∞         │ ∞          │ ∞       │
└──────────────────┴──────────┴───────────┴────────────┴─────────┘

LÓGICA DE CONTROL (Marketing solicita):
1. LÍMITE TRIPLE: Monitorear edificios + unidades + asambleas simultáneamente
2. 🆕 ASAMBLEAS ACUMULABLES (ROLLOVER):
   - Planes: Standard, Multi-PH Lite, Multi-PH Pro
   - Asambleas NO usadas → se acumulan al mes siguiente
   - ⚠️ VENCIMIENTO: 6 MESES (FIFO - First-In, First-Out)
   - Packs transaccionales: válidos 12 meses
3. UPGRADE TRIGGER: Al 90% de cualquier límite → Banner "Upgrade Sugerido"
4. USO JUSTO: Enterprise restringido a misma razón social

UX SOLICITADA POR MARKETING:
1. Selector: "Soy un PH" vs "Soy Administradora/Promotora"
2. Calculadora inteligente con regla "lo que llegue primero"
3. Badge Gold/Premium para Enterprise

═══════════════════════════════════════════════════════════
ARQUITECTO DEBE VALIDAR:
═══════════════════════════════════════════════════════════
[✅] Estructura de tablas BD soporta los 6 planes
[✅] Límite triple es técnicamente viable
[✅] Upgrade trigger al 90% es implementable
[✅] Actualizar LIMITES_UNIDADES_POR_PLAN.md si es necesario
[✅] Crear instrucciones técnicas para Coder

🆕 VALIDACIÓN ADICIONAL REQUERIDA (03 Feb 2026):
═══════════════════════════════════════════════════════════
[ ] Sistema de CRÉDITOS ACUMULABLES (Rollover):
    - Tabla assembly_credits (org_id, month, credits_earned, credits_used, expires_at)
    - Lógica FIFO para consumo (primero los más viejos)
    - Job automático para expirar créditos > 6 meses
    - Validez diferenciada:
      * Suscripciones: 6 meses rollover
      * Packs transaccionales: 12 meses fijos
[ ] UI para mostrar créditos disponibles y próximos a vencer
[ ] Alertas cuando créditos están por expirar (30 días antes)

═══════════════════════════════════════════════════════════
REPORTE DEL ARQUITECTO (30 Enero 2026):
═══════════════════════════════════════════════════════════

✅ FASE 8 VALIDADA TÉCNICAMENTE

Documento: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md

VALIDACIONES COMPLETADAS:
├─ ✅ Matriz de Precios v4.0 (6 planes)
├─ ✅ Multi-PH Lite ($399/mes) - Plan intermedio viable
├─ ✅ Regla "Lo que ocurra primero" - Implementable
├─ ✅ Upgrade Trigger 90% - Lógica clara
├─ ✅ Enterprise ILIMITADO - Con uso justo
└─ ✅ UX Solicitada (Selector + Calculadora + Badge Gold)

CAMBIOS EN BD NECESARIOS:
├─ Agregar 'MULTI_PH_LITE' al enum plan_tier
├─ Agregar campo max_units_total_all_orgs (suma total)
├─ Agregar campo company_tax_id (Enterprise uso justo)
└─ 3 funciones SQL nuevas

BLOQUEADORES: NINGUNO
TIEMPO ESTIMADO: 1-2 días implementación

✅ LISTO PARA QUE CODER INICIE FASE 8
```

---

## ✅ INSTRUCCIÓN PARA CODER (VALIDACIÓN COMPLETA)

```
✅ CODER (CURSOR IA): INICIAR FASE 8 - Precios v4.0 + Créditos Acumulables

VALIDACIÓN ARQUITECTO: ✅ COMPLETADA (Ambos sistemas)

📂 PROMPT PARA CURSOR IA:
└─ Contralor/PROMPT_CURSOR_IA_FASE08.md ⭐ USA ESTE (Actualizado con FASE D)

📖 REFERENCIAS TÉCNICAS (LEER PRIMERO):
├─ Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md (FASES A, B, C)
└─ Arquitecto/VALIDACION_SISTEMA_CREDITOS_ACUMULABLES.md (FASE D) ⭐ NUEVO

ESTRUCTURA:
├─ FASE A: Base de Datos - Límites (7 tareas)
├─ FASE B: Backend API - Validaciones (4 tareas)
├─ FASE C: Frontend - UI/UX (7 tareas)
├─ FASE D: Créditos Acumulables (11 tareas) ⭐ NUEVO
└─ FASE E: Testing (8 tareas)

CAMBIOS PRINCIPALES:
1. Plan Multi-PH Lite ($399/mes) - 10 PHs, 1,500 residentes, 5 asambleas
2. Regla "Lo que ocurra primero" → Excede CUALQUIER límite = Upgrade
3. Créditos acumulables FIFO - Vencen a los 6 meses ⭐ NUEVO
4. Alertas 30 días antes de expirar ⭐ NUEVO

TIEMPO ESTIMADO: 2-3 días
BLOQUEADORES: NINGUNO

🚀 INICIAR IMPLEMENTACIÓN
REPORTAR al Contralor después de cada FASE
```

---

## 📋 REPORTE CODER - FASE 08 COMPLETADA AL 100%

**Fecha:** Feb 2026  
**Estado:** ✅ FASE 08 IMPLEMENTACIÓN COMPLETA - Lista para QA y backup

### FASE A - BASE DE DATOS
- [x] Migraciones: `add_multi_ph_lite_plan.sql`, `add_max_units_total_field.sql`, `add_company_tax_id_field.sql`
- [x] Tabla `assembly_credits`: `009_assembly_credits.sql`
- [x] Funciones: `check_multi_ph_lite_limits`, `check_plan_limits`, `is_unlimited_plan`, `consume_assembly_credits`, `expire_old_credits`

### FASE B - BACKEND API
- [x] `GET /api/subscription/[subscriptionId]/limits` (mock; con BD retorna datos reales)
- [x] Middleware `validateSubscriptionLimits` en `src/lib/middleware/validateSubscriptionLimits.ts`
- [x] `POST /api/organizations` con validación de límites
- [x] `POST /api/assemblies` con validación de límites + consumo de créditos FIFO (rollback por transacción si falla insert)

### FASE C - FRONTEND
- [x] PricingSelector, ROICalculator, EnterprisePlanCard
- [x] useUpgradeBanner, UpgradeBanner integrado en dashboard admin-ph
- [x] Página `/pricing` con planes v4.0 y Multi-PH Lite
- [x] Tipos y planes en `src/lib/types/pricing.ts`

### FASE D - CRÉDITOS ACUMULABLES
- [x] Tabla y funciones SQL (FIFO, expiración)
- [x] Scripts `grant-monthly-credits.ts`, `expire-assembly-credits.ts`
- [x] `GET /api/assembly-credits/[organizationId]`
- [x] Hook `useAssemblyCredits`, componente `AssemblyCreditsDisplay` en dashboard admin-ph
- [x] Cron documentado en `Contralor/CRON_FASE08.md`
- [x] Rollback de créditos: cubierto por transacción en `POST /api/assemblies`

### FASE E - TESTING
- [x] Checklist de validación manual en `QA/CHECKLIST_FASE08_MANUAL.md`

### Validación final
- [x] Cliente sin BD: flujo con mocks (limits, pricing, banner)
- [x] Con BD: validación de límites y créditos aplicada
- [x] Sin errores de lint en archivos tocados

⏭️ **Siguiente paso:** QA valida con checklist manual → Henry autoriza backup → Contralor commit + push

---

## 📢 NOTIFICACIÓN ARQUITECTO - FASE 9 (antes de notificar al QA)

**Para CODER:** Notificación con alcance FASE 9 (solo PayPal, Tilopay, Yappy, ACH; **Stripe fuera de alcance**) y lista de documentos alineados:

| Documento | Contenido |
|-----------|-----------|
| **Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md** | Validación y matriz de pasarelas con retiro en Panamá |
| **Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md** | FASE 7: PayPal/Tilopay, BD paypal_*, tilopay_*, .env, tareas 7.2–7.4, checklist |
| **Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md** | Pantalla 7 y esquema |
| **Contralor/ESTATUS_AVANCE.md** | FASE 9 con Stripe quitado |

✅ Coder aplicó el alcance: checkout y webhooks solo PayPal/Tilopay/Yappy/ACH; migración 013 (paypal_*, tilopay_*). Listo para que Contralor notifique a QA.

---

## 📋 REPORTE CODER - FASES 9, 10 Y 11 COMPLETADAS

**Fecha:** Feb 2026  
**Estado:** ✅ FASES 9, 10 y 11 implementadas - Listas para QA (FASE 9 alineada con notificación Arquitecto)

### FASE 9 - MÉTODOS DE PAGO (alcance Arquitecto: solo PayPal, Tilopay, Yappy, ACH; Stripe quitado)
- [x] Migración `010_payment_methods.sql`: manual_payment_requests, invoices
- [x] Migración `013_paypal_tilopay_panama.sql`: paypal_*, tilopay_* en subscriptions e invoices; payment_method solo PAYPAL|TILOPAY|MANUAL_*
- [x] `src/lib/payments.ts`: montos por plan, sin Stripe
- [x] `POST /api/subscription/create-checkout`: solo PAYPAL, TILOPAY (placeholder), MANUAL_ACH, MANUAL_YAPPY, MANUAL_TRANSFER
- [x] `POST /api/webhooks/stripe`: 410 – Stripe fuera de alcance
- [x] `POST /api/webhooks/paypal` y `/api/webhooks/tilopay`: placeholders para configuración
- [x] Página `/checkout`: PayPal, Tilopay, Yappy, ACH, Transferencia (sin Tarjeta/Stripe)
- [x] `.env.example`: PayPal, Tilopay, Yappy (sin Stripe)

### FASE 10 - MENÚ DEMO (SANDBOX)
- [x] Página `/demo`: entrada al sandbox con CTA "Entrar al demo" → login ?demo=1
- [x] Login: prefill demo@assembly2.com cuando ?demo=1; verify-otp devuelve organization_id y subscription_id; localStorage guarda ambos
- [x] Componente `DemoBanner`: visible cuando org es demo (UUID fijo o mode=demo), CTA "Subir a plan real"
- [x] Migración `011_demo_sandbox.sql`: suscripción DEMO, org demo vinculada, asamblea de prueba
- [x] Script `scripts/reset-demo-sandbox.ts`: reset asambleas demo (para cron 24h)

### FASE 11 - LEAD VALIDATION
- [x] Migración `012_platform_leads.sql`: tabla platform_leads (email, phone, company_name, lead_score, funnel_stage, etc.)
- [x] Chatbot: comando `/registrarme` en `commands.ts` captura email/tel/PH, valida email, calcula score, INSERT/UPDATE en platform_leads
- [x] `GET /api/leads` y `PATCH /api/leads` (qualify, activate_demo)
- [x] Página `/platform-admin/leads`: lista desde API, filtro por etapa, acciones Calificar y Activar demo

⏭️ **Siguiente paso:** QA valida FASES 9, 10 y 11 → Henry autoriza backup → Contralor commit + push

**✅ Validación Contralor (avance Coder):** FASES 9, 10 y 11 registradas como finalizadas en este documento. Tabla de progreso (FASES MONETIZACIÓN) actualizada: 9, 10, 11 = 100% COMPLETADO, pendiente QA.

---

ESTATUS FINAL FASE 7:
✅ FASE 7 APROBADA ✅
➡️ Henry autoriza backup
➡️ Contralor hace commit + push
➡️ Coder inicia FASE 8 (Precios y Suscripciones)

═══════════════════════════════════════════════════════════
DOCUMENTACIÓN A LEER:
═══════════════════════════════════════════════════════════
📖 Arquitecto/INSTRUCCIONES_DASHBOARD_HENRY_RECURSOS.md
📖 Arquitecto/MODULO_MONITOREO_INFRAESTRUCTURA.md
📖 Arquitecto/ANALISIS_RENTABILIDAD_OPERATIVA.md

═══════════════════════════════════════════════════════════
CRITERIO DE ÉXITO:
═══════════════════════════════════════════════════════════
✅ Henry puede ver métricas de recursos en tiempo real
✅ Calendario muestra ocupación con colores
✅ Alertas avisan cuando VPS necesita upgrade
✅ Lista de clientes con estado de suscripción
✅ Métricas de negocio (ingresos, clientes, asambleas)
```

---

## 🔄 FASE SIGUIENTE: FASE 5 - Votación Básica

**Estado:** ⏸️ ESPERANDO (QA debe aprobar FASE 4 primero)

**Documentación lista del Arquitecto:**
- ✅ `ARQUITECTURA_DASHBOARD_ADMIN_PH.md`
- ✅ Sistema de Roles y Equipo integrado
- ✅ FASE 6 en `INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md`

**TAREAS FASE 4 (después de corregir observaciones):**
```
1. Layout con sidebar navegable
2. Módulo Propietarios - Lista + CRUD
3. Módulo Asambleas - Lista + Wizard crear
4. Import Excel de propietarios

DEPENDENCIAS (Database):
- Tabla owners (propietarios)
- Tabla assemblies (asambleas)
- RLS policies por organization_id
```

**Para DATABASE:**
```
CREAR TABLAS PARA FASE 4:
1. owners (propietarios) - con RLS
2. assemblies (asambleas) - con RLS
3. Policies multi-tenant por organization_id
```

---

## 📋 SUGERENCIAS PARA AGENTES

### Para CODER (assembly-context PH A / PH B) – Contralor reenvía información de Database
**Referencia:** Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md  
**Estado:** ✅ Coder informó listo. Contralor valida. Próxima actividad: Contralor asigna en una frase.

Database informó al Contralor. Contralor reenvía al Coder: leer y aplicar ese documento. Resumen: script 102 ejecutado (PH A asamblea activa, PH B programada). Actualizar API `src/app/api/assembly-context/route.ts`: si `?organization_id=xxx` (sin profile), consultar BD por status (active → "activa", scheduled → "programada", sin filas → "sin_asambleas"). Detalle, query y emails de prueba en el documento.
```
📋 INFORMACIÓN DATABASE (Contralor reenvía al Coder):
   Documento obligatorio: Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md
   Script 102_demo_ph_a_ph_b_assemblies.sql ya ejecutado. PH A: asamblea activa. PH B: asamblea programada.
   Coder: actualizar API assembly-context según el documento. Al finalizar, informar al Contralor.
```

**Reporte Coder – Completado:** ✅ **Aplicado.** API `GET /api/assembly-context` actualizada: (1) `?profile=activa|programada|sin_asambleas` sigue como override. (2) `?organization_id=xxx` (sin profile) consulta BD: `assemblies` por organization_id y status (active → "activa", scheduled → "programada", sin filas → "sin_asambleas"). (3) Chat y landing pasan `organization_id` cuando no hay profile (desde residentProfile o localStorage). Bloque actualizado. **Coder informa al Contralor: tarea finalizada.**

### Para CODER:
```
🎯 NOTIFICACIÓN CONTRALOR: FASE 9 - Documentos alineados por Arquitecto

ALCANCE FASE 9 (solo estas pasarelas):
├─ PayPal (principal – tarjetas + retiro bancos Panamá)
├─ Tilopay (principal – tarjetas locales / Centroamérica)
├─ Yappy (Panamá – wallet / botón de pago)
├─ ACH / Transferencia bancaria (manual)
└─ ❌ STRIPE QUITADO (fuera de alcance – no retiros Panamá)

DOCUMENTOS YA ALINEADOS (seguir en este orden):
├─ Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md – Validación y matriz de pasarelas
├─ Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md – FASE 7: PayPal/Tilopay, BD (paypal_*, tilopay_*), .env, Tareas 7.2–7.4, checklist
├─ Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md – Pantalla 7 y esquema con PayPal/Tilopay
└─ Contralor/ESTATUS_AVANCE.md – FASE 9 con PayPal/Tilopay; Stripe quitado

El Coder puede seguir FASE 9 usando solo PayPal, Tilopay, Yappy y ACH/transferencia.
Opcional: FASES 9, 10 y 11 como bloque. Producción (12-13) cuando todo OK.
```

### Para DATABASE (Base de Datos):
```
📋 REGLA: Reportar siempre al Contralor tras ejecutar scripts en BD o completar tareas (entrada en historial ESTATUS_AVANCE.md).
🎯 ORDEN DEL CONTRALOR: Validar Docker y persistencia OTP (referencia única)

📖 LEER Y SEGUIR: Contralor/VALIDACION_DOCKER_Y_OTP.md

VALIDAR:
1. Levantar Docker: docker compose up -d (desde la raíz del proyecto)
2. Servicios activos: postgres:5433, pgbouncer:6432, redis:6379, app:3000, telegram-bot, web-chatbot (docker compose ps)
3. OTP se guarda solo en BD: tabla auth_pins en PostgreSQL (contenedor assembly-db). Esquema/seed en sql_snippets/auth_otp_local.sql
4. Conclusión para Base de Datos: "Todo OK, el login OTP depende solo de esta BD". No Redis ni archivos para OTP.

✅ Tabla resident_abandon_events (§E): sql_snippets/100_resident_abandon_events.sql. Instrucciones Coder: Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md.

🔴 CORRECCIÓN PgBouncer↔PostgreSQL ("wrong password type", 08P01):
   RESPONSABLE PRINCIPAL: Database.
   Tarea: Diagnosticar y especificar la corrección de autenticación (pg_hba.conf, auth_method md5 vs scram-sha-256, userlist si aplica). Documentar qué debe cambiar en Postgres y/o PgBouncer. Entregar instrucciones al Coder para aplicar en el repo.
```

### Para CODER (corrección PgBouncer↔PostgreSQL):
```
🔴 CORRECCIÓN: Autenticación PgBouncer↔PostgreSQL (bloqueador QA – "wrong password type").

   📖 INSTRUCCIONES DE BASE DE DATOS (obligatorio leer y aplicar):
   Database_DBA/INSTRUCCIONES_CODER_PGBOUNCER_AUTH.md

   Contenido: problema 08P01, causa (md5 vs scram-sha-256), 3 opciones (A: md5 en Postgres, B: auth en PgBouncer, C: conexión directa temporal), verificación y referencias.
   Tras aplicar: avisar a QA para re-ejecutar validación del flujo OTP (Contralor/VALIDACION_DOCKER_Y_OTP.md).
```

### Para CODER (bloqueador verify-otp – QA reporta 26 Feb):
```
✅ ESTATUS REPORTE QA: Listo – Registrado en Contralor.
✅ CODER COMPLETÓ: parent_subscription_id añadido en sql_snippets/auth_otp_local.sql (CREATE TABLE + ALTER para instancias existentes). Bloqueador verify-otp resuelto.

   (Causa original: La API verify-otp usa `o.parent_subscription_id`; la columna no existía en el schema. TAREA ya aplicada.)
   Referencia: QA/QA_FEEDBACK.md – sección "QA Re-validación · Docker + OTP".
   Instancias existentes: ejecutar ALTER o recrear volumen para que el init aplique el script actualizado.
```

### Para CODER – Resumen de tareas (1) (2) (3):
```
(1) parent_subscription_id en auth_otp_local.sql
    ✅ APLICADO. Columna en CREATE TABLE organizations + ALTER para instancias existentes.

(2) Corrección PgBouncer (cuando se deje de usar Opción C)
    ✅ YA APLICADA EN REPO: sql_snippets/99_pgbouncer_md5_compat.sql (init Docker).
    Cuando Contralor/QA decida volver a PgBouncer:
    ├─ En docker-compose.yml, servicio app: cambiar DATABASE_URL de postgres:5432 a pgbouncer:5432.
    ├─ Asegurar que el init de Postgres haya corrido con 99_ (recrear volumen si la BD se creó antes del script).
    └─ Ver Database_DBA/INSTRUCCIONES_CODER_PGBOUNCER_AUTH.md (verificación).

(3) Leads
    ✅ Tabla platform_leads: sql_snippets/97_platform_leads.sql. Revisar/ajustar si QA reporta algo en Gestión de Leads.
```

### Para CODER (corrección "No se pudieron cargar los leads"):
```
Responsable: Coder.

Problema: En /platform-admin/leads aparece el mensaje "No se pudieron cargar los leads." porque la tabla platform_leads no existía en la BD (no estaba en el init Docker).

Corrección aplicada por Coder:
├─ Añadido sql_snippets/97_platform_leads.sql para que el init de Docker cree la tabla platform_leads.
├─ Nuevas instancias (docker compose up -d con volumen nuevo): la tabla se crea automáticamente.
└─ Instancias existentes (volumen ya creado): ejecutar una vez el SQL manualmente:
   docker compose exec postgres psql -U postgres -d assembly -f - < sql_snippets/97_platform_leads.sql
   (o pegar el contenido de 97_platform_leads.sql en psql).

Tras aplicar en BD existente, recargar la página de Gestión de Leads; debe cargar sin error (lista vacía = "No hay leads registrados." sin toast rojo).
```

### Para CODER (Registro abandono de sala §E):
```
✅ Coder implementó: POST /api/resident-abandon, flujo "Cerrar sesión", alerta.
✅ Database ejecutó script: tabla resident_abandon_events creada en BD (06 Feb).
📋 Pendiente (si aplica): UI Admin PH "Residente [nombre/unidad] abandonó a las [hora]" en monitor/vista asamblea.
📋 QA puede revalidar §E.
```

### Para CODER – Chatbot residente: PIN por correo + habilitación de botones (orden Contralor):
```
🎯 INSTRUCCIÓN: Implementar validación por PIN enviado al correo antes de dar acceso al chat de residentes, y habilitar botones según asamblea activa.

📖 ESPECIFICACIÓN (obligatorio leer):
   Arquitecto/LOGICA_CHATBOT_RESIDENTE_PIN.md

RESUMEN DE LÓGICA:

1) Flujo residente actual se cambia a:
   • Usuario elige "Residente" → escribe correo.
   • Si correo NO existe en BD/lista demo → mensaje "No encuentro ese correo. Contacta al administrador de tu PH para validar." No avanzar. No mostrar botones.
   • Si correo SÍ existe → enviar PIN al correo (SMTP existente o servicio configurado). Mensaje: "Te enviamos un PIN a [correo]. Revisa tu bandeja e ingrésalo aquí."
   • Usuario escribe PIN → backend valida (PIN correcto + no expirado, ej. 5–10 min).
   • Si PIN incorrecto/expirado → "PIN incorrecto o vencido. ¿Reenviar PIN?" Reintentar o reenviar.
   • Si PIN correcto → marcar residente como validado (residentEmailValidated = true). Mostrar chat y botones.

2) Botones de residente (solo después de validado por PIN):
   • Votación: HABILITADO solo cuando el Admin PH ha activado la votación (existe votación abierta/activa para la asamblea en curso). Cronograma: quórum aprobado → orden del día aprobado → temas del día → Admin inicia votación → entonces el chatbot habilita "Votación". Ver Arquitecto/LOGICA_ASAMBLEA_CRONOGRAMA_VOTACION_CHATBOT.md.
   • Tema del día: habilitado cuando hay asamblea en curso y hay tema actual (agenda); recomendación: al menos cuando hay votación abierta o tema actual en agenda.
   • Si no hay votación activa: botón Votación deshabilitado (gris) con texto "No hay votación activa" o "Habilitado cuando el administrador abra la votación".
   • Asambleas, Calendario, Ceder poder: siempre habilitados una vez validado.

3) Backend: endpoint(s) para (a) enviar PIN al correo (generar y guardar PIN con expiración), (b) validar PIN. BD o cache para PIN por correo/sesión y expiración.

4) No mostrar botones hasta que correo + PIN estén validados. Mantener regla: residentEmailValidated = true solo tras PIN correcto.

Referencias adicionales: Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md, Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (§F, §J), QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md.
```

### Para CODER – Lógica asamblea, cronograma y botón Votación (Arquitecto)
```
🎯 REFINAMIENTO: El botón "Votación" en el chatbot debe habilitarse solo cuando el Admin PH ha activado la votación (no solo "asamblea activa").

📖 ESPECIFICACIÓN OBLIGATORIA: Arquitecto/LOGICA_ASAMBLEA_CRONOGRAMA_VOTACION_CHATBOT.md

• Cronograma asamblea: (1) Quórum aprobado → (2) Orden del día aprobado → (3) Temas del día indicados → (4) Admin inicia/activa votación para un tema. Entonces los residentes pueden votar y el chatbot debe mostrar "Votación" habilitado.
• Fuente de verdad para el botón: existe al menos una votación abierta/activa para la asamblea actual del PH (iniciada por el Admin desde el dashboard). La API que alimenta el chatbot (ej. assembly-context o equivalente) debe exponer "hay votación abierta" además de "asamblea en curso".
• Al implementar o refinar: usar "votación abierta/activa" como condición para habilitar "Votación" en el chatbot; reflejar el cronograma en el flujo del dashboard y en BD si aplica.
Al finalizar, informar al Contralor.
```

### Para CODER – Demo por correo del cliente (Arquitecto + Marketing)
**Origen:** Marketing/MARKETING_PROPUESTA_DEMO_POR_CORREO_CLIENTE.md. **Arquitecto revisó y especificó:** Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md.

```
🎯 INSTRUCCIÓN: Implementar "demo por correo": cuando un visitante elige "Administrador PH" o "Solo demo" en el chatbot y proporciona su correo, crear (o reutilizar) una cuenta demo ligada a ese correo. El cliente entra al demo con su propio correo (OTP) y ve dashboard demo (50 residentes, 1 crédito, 15 días).

📖 ESPECIFICACIÓN OBLIGATORIA: Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md

TAREAS RESUMIDAS:
1) BD: Añadir demo_expires_at en organizations si no existe. Crear función/script para "crear org demo + usuario" (contenido tipo Urban Tower: 50 unidades, 1 crédito, 15 días). Un demo activo por correo; si el mismo correo ya tiene usuario con org is_demo vigente, no duplicar.
2) API: POST /api/demo/request con body { email }. Crear usuario + organización demo o devolver already_exists; respuesta { success, already_exists, login_url, message }. Rate limit opcional (ej. 5 por IP/hora).
3) Chatbot (page.tsx, chat/page.tsx): Tras capturar correo para perfil Admin PH o Solo demo, llamar POST /api/demo/request; mostrar "Tu demo está listo. Entra con este correo en [Entrar al demo]" (link /login) o "Ya tienes un demo activo. [Entrar al demo]". Dejar de mostrar el correo demo ficticio (xxx-adminph@demo.assembly.local).
4) Leads: Al crear/reutilizar demo, crear o actualizar platform_leads (funnel_stage demo_requested o demo_active).
5) Login: Sin cambios; verify-otp ya devuelve is_demo; el nuevo usuario tiene org is_demo=true.

Orden sugerido: (1) BD y API, (2) Chatbot, (3) Leads, (4) pruebas E2E.
Priorización: Contralor/Henry definen en qué fase se implementa.
Al finalizar, informar al Contralor.
```

### Para CODER (bug verify-otp chatbot residente)
```
🔴 BLOQUEADOR: El chatbot residente muestra "Error al verificar" al ingresar el PIN correcto.

CAUSA: Bug en la cadena fetch("/api/auth/verify-otp") en dos archivos. En el segundo .then((data) => {...}) se usa res.ok pero res no está en scope (solo data). Eso lanza ReferenceError → se ejecuta .catch() → mensaje "Error al verificar".

ARCHIVOS A CORREGIR:
1. src/app/chat/page.tsx – líneas ~213-232
2. src/app/page.tsx – líneas ~276-304

SOLUCIÓN: Pasar res y data juntos al siguiente handler. Ejemplo:

  .then((res) => res.json().then((data) => ({ res, data })))
  .then(({ res, data }) => {
    if (res.ok && data?.user?.role === "RESIDENTE") {
      // ... flujo éxito
    } else {
      pushBotMessage("PIN incorrecto o vencido. ¿Reenviar PIN? ...");
    }
  })
  .catch(() => pushBotMessage("Error al verificar. Intenta de nuevo o escribe «Reenviar PIN»."));

Referencia: QA/QA_FEEDBACK.md § "QA Validación · Error PIN y visualización en Docker local".
Al finalizar, confirmar al Contralor.
```

### Para CODER (login – residente no debe entrar como Admin PH) – 🔴 Prioridad crítica

**Estado:** ✅ **Coder listo.** ✅ **Backup completado.** ✅ **QA aprobó validación redirección por rol** (QA_FEEDBACK.md § "QA Validación · Redirección por rol"). **Siguiente:** Más pruebas según QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § "Próximas pruebas".

**Nota Contralor:** Lista de usuarios demo y roles: **docs/USUARIOS_DEMO_BD.md**.

```
🔴 BLOQUEADOR / PRIORIDAD CRÍTICA: Residente (ej. residente2@demo.assembly2.com) entra al Dashboard Admin PH en lugar del chatbot.

CAUSA: En src/app/login/page.tsx la redirección tras verify-otp NO comprueba role === "RESIDENTE". La org Demo tiene is_demo=true, así que residente2@ cumple user.is_demo y va a /dashboard/admin-ph.

SOLUCIÓN: Añadir check ANTES de is_demo:
  if (user.role === "RESIDENTE") {
    try {
      localStorage.setItem("assembly_role", "residente");
      localStorage.setItem("assembly_resident_email", trimmedEmail);
      localStorage.setItem("assembly_resident_validated", String(Date.now()));
      if (user.id) localStorage.setItem("assembly_user_id", user.id);
      if (user.organization_id) localStorage.setItem("assembly_organization_id", user.organization_id);
    } catch {}
    router.push("/residentes/chat");
    return;
  }
Orden de checks: 1) RESIDENTE → /residentes/chat. 2) platform-admin. 3) is_demo → admin-ph demo. 4) else → admin-ph.

Referencia: QA/QA_FEEDBACK.md § "QA Hallazgo crítico · Residente entra como Admin PH". Usuarios demo: docs/USUARIOS_DEMO_BD.md.
Al finalizar, informar al Contralor.
```

### Para CODER (chatbot más inteligente – preguntas simples) – Orden Contralor según QA

**Estado:** ✅ **Coder informó completado.** Contralor puede asignar próxima actividad (p. ej. QA revalidar o backup).

**Fase actual:** Pulido del chatbot residente (post–Gemini integrado). QA reportó que preguntas como "¿cómo voto?" y "¿mi voto está registrado?" reciben respuesta genérica; el Contralor asigna esta corrección al Coder.

**Dónde debe buscar el Coder:** QA/QA_FEEDBACK.md – Sección **"QA Análisis · Chatbot inteligente – Preguntas simples en asamblea"** (detalle, causa raíz, recomendaciones y tabla de intenciones).

```
🎯 INSTRUCCIÓN (Contralor): Corregir el chatbot para que responda mejor según el análisis de QA. Residentes validados que preguntan "¿cómo voto?", "¿mi voto está registrado?" deben recibir respuestas específicas, no el mensaje genérico.

TAREAS (según QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea"):

1. En src/app/api/chat/resident/route.ts añadir detección de intenciones (similar a isAskingForName), con respuestas predefinidas:
   - "como voto", "cómo voto", "como puedo votar" → "Para votar: usa el botón Votación de abajo, elige Sí/No/Abstención y confirma. Si es tu primera vez, puede pedirte Face ID. ¿Quieres que te lleve a la votación?"
   - "mi voto registrado", "validar voto", "ya voté" → "Si ya usaste el botón Votación y elegiste Sí/No/Abstención, tu voto quedó registrado. Para confirmar en tiempo real, entra a la votación activa desde el botón de abajo."
   - "cuál es el tema", "qué se vota" → usar temaActivo del contexto o mensaje con opción de ir a Votación.

2. Ejecutar estas respuestas ANTES de llamar a Gemini (o como fallback si Gemini falla o devuelve vacío).

3. Revisar GEMINI_API_KEY (válida y con cuota) y que el prompt use la base de conocimiento y temaActivo.

Referencia completa: QA/QA_FEEDBACK.md – "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea" (detalle y recomendaciones).
Al finalizar, informar al Contralor.
```

**✅ CODER informó al Contralor (chatbot más inteligente – preguntas simples):** Implementado en `src/app/api/chat/resident/route.ts`: (1) Detección de identidad: preguntas "¿cómo te llamas?", "tu nombre", etc. → respuesta fija "Me llamo Lex...". (2) Base de conocimiento desde archivo: `docs/chatbot-knowledge-resident.md` cargado en el prompt (resumen residente: cómo votar, quórum, Ley 284). (3) Validación API en entorno: GET `/api/chat/resident?validate=1` hace llamada real a Gemini y devuelve ok/error. (4) Fallback cuando Gemini falla o vacío: mensaje incluye "Soy Lex...". (5) generationConfig y extracción robusta de texto (candidates como respaldo). Documentación: `docs/REVISAR_ENTORNO_CHATBOT_GEMINI.md`. Detalle y recomendaciones aplicadas/registradas en QA/QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea". **Próxima actividad:** Contralor asigna (p. ej. QA revalidar preguntas "como voto" / "mi voto registrado" o backup).

**Validación Contralor – Respuesta QA (bug PIN chatbot residente):** ✅ **Validada.** El reporte de QA es coherente. **Corrección aplicada en código:** en `chat/page.tsx` y `page.tsx` ya se usa `.then((res) => res.json().then((data) => ({ res, data })))` y `.then(({ res, data }) => { if (res.ok && ...`. **Falta una re-validación de QA:** confirmar en navegador que con PIN correcto ya no aparece "Error al verificar" y que el residente pasa al chat validado.

**Validación Contralor – Respuesta QA (listo):** ✅ **Validada.** QA informó tarea completada (listo). Contralor confirma la respuesta. Próxima actividad: Contralor asigna en una frase.

**Último reporte QA (listo):** ✅ Registrado. QA informó listo. Contralor valida. Próxima actividad: Contralor asigna en una frase.

### Para CODER – Face ID opcional (orden Arquitecto)
**Dónde empezar:** `Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md`  
**Estado:** ✅ Completado. Database ejecutó script 101; QA revalidó Face ID. Cerrado. Ver "Face ID – dónde quedamos" en TAREA 5.

### Para CODER (chatbot – residentes demo de Propietarios) – Orden QA
**Referencia:** Coder/INSTRUCCIONES_QA_MEJORAS_RESIDENTES_MONITOR_CHATBOT.md  
**Origen:** QA ejecutó plan QA/PLAN_PRUEBAS_RESIDENTES_MONITOR_SINCRONIZACION.md. Sincronización Monitor OK; chatbot solo reconoce residente1–5@.  
**Instrucción:** Hacer que el chatbot reconozca residentes agregados en Propietarios demo (assembly_demo_residents). Validar contra getDemoResidents() cuando isDemoResidentsContext(). Coder informa al Contralor al finalizar.

### Para CODER – Ceder poder en chatbot (orden Arquitecto + Marketing §G)

**Validación Contralor – Reporte Arquitecto (poderes) y observaciones Marketing:** ✅ **Validadas.** Arquitecto: Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md (formulario inline, datos del que acepta, estado pendiente por aprobar, botón "en proceso..." cuando hay solicitud pendiente, Ley 284 – cédula opcional). Marketing: §G en Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (formulario inline, pendiente por aprobar, misma lógica). Contralor coordina: instrucción al Coder debajo. Al finalizar, Coder informa al Contralor.

**Dónde debe buscar el Coder para empezar:** `Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md` y §G en `Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md`.

```
🎯 INSTRUCCIÓN (Contralor, según Arquitecto + Marketing): Al hacer clic en "Ceder poder", desplegar formulario inline con datos del que acepta (residente mismo PH o titular mayor de edad). Estado "pendiente por aprobar"; si hay solicitud pendiente, botón "Poder en proceso de validación y aprobación" (deshabilitado).

📖 ESPECIFICACIÓN: Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md (incluye DOCUMENTO DE MEJORA – Ley 284 y cédula)

• Formulario inline: tipo apoderado, correo, nombre, cédula (opcional), teléfono, vigencia, "Enviar solicitud de poder".
• Cédula: Residente mismo PH → no requerida. Titular mayor de edad → opcional. Ver DOCUMENTO DE MEJORA en el archivo del Arquitecto.
• Crear solicitud en BD estado PENDIENTE; mensaje en chat: "Solicitud enviada. Pendiente por aprobar."
• Notificación: mensaje en el chat y email al correo del residente (confirmación).
• Si ya hay solicitud PENDIENTE: botón → "Poder en proceso de validación y aprobación", deshabilitado.
• API: crear solicitud desde chatbot; enviar email al residente; consultar si hay pendiente por residente/unidad.

Referencia Marketing: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §G. Al finalizar, informar al Contralor.
```

**Reporte Coder – Completado:** ✅ **Aplicado.** Revisado Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md y Marketing §G. Implementado: (1) Tabla `power_requests` (sql_snippets/103_power_requests_chatbot.sql). (2) API POST /api/power-requests (crear solicitud PENDING; validación residente mismo PH por correo en misma org). (3) API GET /api/power-requests?user_id= (consultar si hay pendiente). (4) Formulario inline completo en chat y landing: tipo apoderado (Residente del mismo PH | Titular mayor de edad), correo, nombre, cédula opcional, teléfono opcional, vigencia opcional, botón "Enviar solicitud de poder". (5) Mensaje en chat: "Solicitud enviada. Está pendiente por aprobar por el administrador de tu PH. Te confirmamos en minutos." (6) Si hay solicitud pendiente: botón "Poder en proceso de validación y aprobación" (deshabilitado); al clic mensaje "Ya tienes una solicitud de poder pendiente por aprobar...". **Pendiente (opcional):** envío de email al residente con confirmación (doc lo indica; no implementado en esta entrega). **Coder informa al Contralor: tarea finalizada.**

**📋 PENDIENTE (Contralor):** Prueba QA – Ceder poder (§G). Validar en navegador: residente validado → clic "Ceder poder" → formulario completo → Enviar solicitud → mensaje "Solicitud enviada. Pendiente por aprobar"; tras enviar, botón debe mostrarse "Poder en proceso de validación y aprobación" (deshabilitado). Plan: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (4.7 Ceder poder). Contralor anota como pendiente hasta que QA (o Henry) ejecute y reporte.

### Para CODER (AssembliesPage – duplicate export, aprobado por Contralor):
```
✅ APLICADO POR CODER. Una sola export default en el archivo.
Referencia: QA/QA_FEEDBACK.md – sección "QA Re-validación · Login + Plan de Pruebas".
```

### Para CODER (bloqueador QA re-ejecución 26 Feb):
```
🔴 NUEVO BLOQUEADOR: Module not found: Can't resolve '@/components/UpgradeBanner'
   Archivo: src/app/dashboard/admin-ph/page.tsx, línea 4.
   El componente existe en src/components/UpgradeBanner.tsx.
   Tarea: Revisar alias @/ en tsconfig.json o next.config.js. Alternativa: usar import relativo (../../components/UpgradeBanner).
   Referencia: QA/QA_FEEDBACK.md – "QA Re-ejecución Plan de Pruebas · Reporte al Contralor".
```

### Para QA:
```
✅ PLAN PRUEBAS COMPLETADO (26 Ene 2026). Etapas 1–6 aprobadas.
   Rutas automáticas: 200. Ver QA_FEEDBACK.md (Fase 04 + Smoke).

✅ Residentes demo en BD: residente1@…residente5@demo.assembly2.com (role RESIDENTE, org Demo).
   Scripts: sql_snippets/auth_otp_local.sql (init) y sql_snippets/seeds_residentes_demo.sql (BD existente).
   Usar para: login OTP como residente, pruebas E2E, carga (varios residentes). Ver QA_FEEDBACK.md § "Asamblea demo con admin y residentes".

✅ Abandono de sala (§E): Tabla resident_abandon_events creada en BD (script ejecutado 06 Feb). Coder implementó API POST /api/resident-abandon. **QA puede revalidar §E.**
📋 OPCIONAL: Validación manual chatbot (4.1, 4.3–4.7) en navegador.
📋 SIGUIENTE: Validar Docker local según Contralor/VALIDACION_DOCKER_Y_OTP.md (si aplica).
────────────────────────────────────────────────────────
✅ FASE 8 y FASES 9, 10, 11 ya APROBADAS por QA. Backup realizado (dc1f9c7).

📖 LEER Y SEGUIR: Contralor/VALIDACION_DOCKER_Y_OTP.md (Docker + OTP).
```

### Validación Contralor – Avances Coder Dashboard Henry

**Estado:** Coder informó completado (historial 26 Ene 2026). Contralor validó en código:

| Item (QA_REPORTE_DASHBOARD_HENRY §5 y §7) | Verificación en código |
|-------------------------------------------|------------------------|
| Resumen ejecutivo desde BD | Resumen consume GET /api/leads y GET /api/platform-admin/clients; fallback si API falla. |
| Tickets desde BD | Tabla platform_tickets; APIs GET /api/platform-admin/tickets, GET/PATCH /api/platform-admin/tickets/[id]. sql_snippets/104_platform_tickets.sql. |
| Monitor VPS | GET /api/platform-admin/monitoring (placeholder documentado). |
| CRM campañas | platform_campaigns; APIs campaigns, campaigns/[id], campaigns/execute. |
| Métricas negocio | GET /api/platform-admin/business (agregados BD + placeholder). |
| Exportar reporte | GET /api/platform-admin/leads/export (CSV). |
| Ejecutar campañas | POST execute con last_executed_at (placeholder). |

**Conclusión:** Avances del Coder coherentes con lo reportado. **QA debe revisar** según checklist abajo.

### Para QA – Revisar avances Dashboard Henry

```
Responsable: QA.
Objetivo: Revisar que los avances del Coder (Dashboard Henry §5 y §7) funcionan en entorno local/Docker.
Referencia: QA/QA_REPORTE_DASHBOARD_HENRY.md (tabla §5 Resumen para Contralor, §7 Instrucción Coder, §6 Verificación APIs).
Checklist: QA/QA_FEEDBACK.md § "QA Checklist · Navegación Dashboard Henry (Platform Admin)" (rutas, botones, retorno, bloqueador @/lib/db si aplica).

Qué validar:
- Resumen ejecutivo: KPI, Funnel, Clientes desde APIs (o fallback).
- Tickets: lista y detalle desde API; Resolver/Escalar persisten si tabla existe.
- Monitor VPS: /platform-admin/monitoring muestra datos (placeholder OK).
- CRM: campañas desde API; Activar/Desactivar y Ejecutar (placeholder OK).
- Métricas negocio: /platform-admin/business con datos BD o placeholder.
- Exportar reporte: botón en leads y descarga CSV.
- Navegación: sidebar, botones, retorno al dashboard según checklist.

Reportar resultado en QA/QA_FEEDBACK.md (sección Dashboard Henry o nueva "Revisión avances Coder Dashboard Henry"). Informar al Contralor al finalizar.

📋 **Falta una re-validación (bug verify-otp):** La corrección ya está en código (res + data en scope). QA debe **re-validar** que en el chatbot, con PIN correcto, ya no aparece "Error al verificar" y el residente entra al chat validado. Ref: bloque "Para CODER (bug verify-otp chatbot residente)" – Validación Contralor.

📖 **Lista de pruebas y revisión respuesta chatbot:** QA/LISTA_PRUEBAS_QA_Y_RESPUESTA_CHATBOT.md (lista actual de pruebas por QA + revisión de cómo responde el chatbot y qué validar).

📋 **Test Dashboard Admin PH con usuarios demo:** Los usuarios demo están listos para validar funcionalidad y límites del Dashboard Admin PH. **QA** ejecuta según **QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md**. Referencia: Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md.
```

### Para ARQUITECTO:
```
VALIDAR PROCESO DASHBOARD ADMIN PH
Documento de referencia: docs/RESUMEN_DASHBOARD_ADMIN_PH.md (resumen del dashboard, rutas, flujos, últimos cambios).
Tarea: Validar el proceso del dashboard Admin PH (flujos, rutas, coherencia con Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md).
⏳ Se espera respuesta de Marketing primero para validar el flujo correcto (navegación, botones asamblea/monitor, suscripción).
Cuando Marketing confirme el flujo, el Arquitecto valida y reporta al Contralor.
Referencias: Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md, ESTATUS_AVANCE (este bloque).
```

### Para CODER – Deploy Assembly 2.0 en VPS Vultr (assembly-prod)
```
Tarea: Desplegar Assembly 2.0 en el VPS ya creado por Henry (Vultr).

Datos del servidor:
- Ubicación: Miami
- IP: 45.63.104.7
- Usuario: root
- Contraseña: Henry la proporciona al Coder por canal seguro (no guardar en repo ni en archivos del proyecto).

Servidor: Docker on Ubuntu 24.04, 1 vCPU, 1 GB RAM, 25 GB. Nombre en Vultr: assembly-prod. Ping verificado OK.

Referencia de deploy: Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (o la guía de deploy/VPS del proyecto). Conectar por SSH (ssh root@45.63.104.7), clonar/upload proyecto, configurar .env, docker-compose, etc.

Al finalizar, informar al Contralor y a Henry (URL de la app si aplica).
```

---

### Para CODER – Panel ejecutivo Landing (orden Marketing Feb 2026):
```
Reemplazar la lista de 6 PHs con "Quorum: 68%" por funcionalidades de Assembly 2.0.
Referencia: Marketing/MARKETING_OBSERVACIONES_LANDING.md
Ubicación: src/app/page.tsx – mockup "Panel ejecutivo" (hero).
Contenido sugerido: 6 funcionalidades (Quórum en tiempo real, Votación ponderada, Poderes digitales, Monitor por unidad, Chatbot residente, Actas automáticas).
Prioridad: Media.
Al finalizar, informar al Contralor.
```

### Propuesta Henry – Demo por correo del cliente nuevo (Administrador PH)
```
Estado actual: En curso. Henry ya informó al Arquitecto.
Documento: Marketing/MARKETING_PROPUESTA_DEMO_POR_CORREO_CLIENTE.md
Resumen: Crear demo por correo (usuario + org demo en BD, mismo flujo OTP); lead + demo asociados; límites y flujo exacto a definir.
Orden de revisión: 1) Arquitecto (revisar, definir flujo técnico y documentar especificación). 2) Coder (implementar cuando el Arquitecto entregue la especificación aprobada).
⏳ Contralor espera: especificación del Arquitecto para luego asignar al Coder.
```

### Propuesta Henry – Proceso de asambleas en un solo módulo (Wizard tipo factura)
```
Henry solicita: Adaptar la experiencia de creación de factura (stepper multi-paso) al proceso de asambleas, todo en un solo módulo.
Pasos: registro residentes, crear asambleas, agendar, celebrar, monitor back office, finalización, crear acta.
Documento: Marketing/MARKETING_RECOMENDACION_WIZARD_ASAMBLEAS_UN_MODULO.md
Instrucciones Coder: Coder/INSTRUCCIONES_CODER_WIZARD_PROCESO_ASAMBLEA.md (módulos actuales, qué agregar, qué mantener, persistencia fase).
Resumen: Wizard horizontal (5 pasos), ruta /dashboard/admin-ph/proceso-asamblea, nuevo ítem sidebar "Proceso de Asamblea", lista asambleas pendientes con fase guardada.
Contralor/Arquitecto: Valorar prioridad. Coder implementa según INSTRUCCIONES_CODER_WIZARD_PROCESO_ASAMBLEA.md. Prioridad sugerida: Media-Alta.
```

### Para CODER – Terminología unificada Comunidad (orden Marketing Feb 2026):
```
Unificar términos en la app para PH residencial + plazas comerciales.
Documento: Coder/INSTRUCCIONES_CODER_TERMINOLOGIA_UNIFICADA_COMUNIDAD.md
Término principal: "Comunidad". Campo tipo: PH | PLAZA | COMPLEJO.
Reemplazar "Panel del PH", "PH actual" por "Panel de la Comunidad", etc.
Prioridad: Media. Aplicar de forma gradual.
```

### Para CODER – Créditos asambleas, carrito y pago Fase 1 (orden Henry Feb 2026):
```
Requisitos: (1) Visualizar saldo y vigencias de créditos para asambleas; bloquear creación sin crédito.
(2) Unificar Suscripciones con carrito de compra; consolidar botones duplicados; carrito visible al agregar.
(3) Fase 1 pago: ACH y Yappy; subir comprobante; Henry aprueba; email al comprador cuando crédito disponible.
Documento: Coder/INSTRUCCIONES_CODER_CREDITOS_ASAMBLEAS_Y_CARRITO_FASE1.md
Prioridad: Alta.
```

### Para MARKETING:
```
NINGUNA ACCIÓN REQUERIDA
Landing Page y pricing ya implementados.
Copy listo para producción.
Observación Panel ejecutivo documentada en Marketing/MARKETING_OBSERVACIONES_LANDING.md. Contralor asignará al Coder.
Terminología unificada documentada en Coder/INSTRUCCIONES_CODER_TERMINOLOGIA_UNIFICADA_COMUNIDAD.md.
```

---

## ✅ COMPLETADO HOY (31 Enero 2026)

- [x] API `/api/chatbot/config` conectada a PostgreSQL
- [x] Página `/platform-admin/chatbot-config` funcional (GET/PUT)
- [x] SQL `chatbot_config` aplicado en DB `assembly`
- [x] Chatbot web y Telegram leen prompts desde BD
- [x] Rutas residentes conectadas a acciones rápidas
- [x] Docker Postgres expuesto en `5433` (evita conflicto local)
- [x] Tests OK: `/`, `/residentes/votacion`, `/platform-admin/chatbot-config`, `/api/chatbot/config`
- [x] OTP local sin demo: API `/api/auth/request-otp` y `/api/auth/verify-otp`
- [x] SQL local OTP: `sql_snippets/auth_otp_local.sql`
- [x] Login web usa OTP real con BD (modo local con código visible)
- [x] Nota QA: "Database error finding user" ocurre si usan Supabase o DB equivocada; usar Docker local (DB 5433) + SQL `auth_otp_local.sql`.

---

## 📅 PRÓXIMAS ACCIONES

| Prioridad | Acción | Responsable | Fecha límite |
|-----------|--------|-------------|--------------|
| ✅ COMPLETADO | FASE 3 Login OTP | Coder | 30 Enero |
| ✅ COMPLETADO | Observaciones QA corregidas | Coder | 30 Enero |
| ✅ COMPLETADO | **FASE 4: Dashboard Admin PH** | Coder | 30 Enero |
| ✅ COMPLETADO | **QA aprobó FASE 4** | QA | 30 Enero |
| ✅ COMPLETADO | **Backup GitHub** | Contralor | 30 Enero |
| ✅ COMPLETADO | **FASE 5: Votación + Monitor** | Coder | 30 Enero |
| ✅ COMPLETADO | **QA aprobó FASE 5** | QA | 30 Enero |
| ✅ COMPLETADO | **Backup FASE 5** (68ecd64) | Contralor + Henry | 30 Enero |
| ✅ COMPLETADO | **FASE 6: Actas y Reportes** | Coder | 30 Enero |
| ✅ COMPLETADO | **QA aprobó FASE 6** | QA | 30 Enero |
| ✅ COMPLETADO | **Backup FASE 6** (137421b) | Contralor + Henry | 30 Enero |
| ✅ COMPLETADO | **FASE 7: Dashboard Admin Plataforma (Henry)** | Coder | 02 Feb |
| ✅ COMPLETADO | **QA aprobó FASE 7** | QA | 02 Feb |
| ✅ COMPLETADO | **Backup FASE 7** (bd253ff) | Contralor + Henry | 02 Feb |
| 📢 ACTUALIZADO | **Marketing v4.0** - Nuevos planes | Marketing | 03 Feb |
| ✅ COMPLETADO | **Arquitecto validó FASE 8** | Arquitecto | 03 Feb |
| ✅ COMPLETADO | **Coder: FASE 8** (Precios y Suscripciones) 100% | Coder | Feb 2026 |
| ✅ COMPLETADO | **QA aprobó FASE 8** | QA | Feb 2026 |
| ✅ COMPLETADO | **Backup FASE 8** (3715276) | Contralor | Feb 2026 |
| ✅ COMPLETADO | **Coder: FASES 9, 10 y 11** (Pagos, Demo, Lead Validation) | Coder | Feb 2026 |
| ✅ COMPLETADO | **QA aprobó FASES 9, 10 y 11** | QA | Feb 2026 |
| ✅ COMPLETADO | **Backup FASES 9, 10, 11** (dc1f9c7) | Contralor | Feb 2026 |
| 🔴 SIGUIENTE | **Validar Docker** – Database y QA según Contralor/VALIDACION_DOCKER_Y_OTP.md | Database + QA | Feb 2026 |
| ✅ COMPLETADO | **Coder: parent_subscription_id** – Columna añadida en auth_otp_local.sql (verify-otp desbloqueado). | Coder | Feb 2026 |
| ✅ COMPLETADO | **Coder: AssembliesPage** – Eliminada la segunda definición (duplicate export default) en src/app/dashboard/admin-ph/assemblies/page.tsx. Una sola export default. Ver "Para CODER (AssembliesPage)". | Coder | Feb 2026 |
| ✅ COMPLETADO | **QA: Re-ejecutó etapas 2 y 3** (Admin PH + Platform Admin). Todas las rutas 200. Reporte QA_FEEDBACK.md + historial. 26 Ene 2026. | QA | Feb 2026 |
| ✅ COMPLETADO | **QA: Plan pruebas completado** (etapas 1–6). Fase 04, residentes, smoke OK. | QA | Feb 2026 |
| 📋 PLAN CREADO | **Pruebas navegación Login→Chatbot** – QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (flujo login, Admin PH, Platform Admin, chatbot botones, residentes). Ejecutar QA cuando login esté OK. | Contralor + QA | Feb 2026 |

### **🚦 FLUJO DE TRABAJO ACTUAL:**
```
✅ COMPLETADO: FASES 0-6 (Git, Landing, Chatbot, Login, Dashboard, Votación, Actas)
✅ APROBADO POR QA: FASES 0-6
✅ BACKUP EN GITHUB: Commit 137421b (FASE 6)

✅ COMPLETADO: FASES 0-7 (Git, Landing, Chatbot, Login, Dashboard, Votación, Actas, Monitor Henry)
✅ APROBADO POR QA: FASES 0-7
✅ BACKUP: Commit bd253ff
────────────────────────────────────────────────────────
✅ FASE 8 - COMPLETADA y APROBADA POR QA → ✅ BACKUP (commit 3715276)

✅ Backup: commit 3715276 realizado. Henry: ejecutar `git push origin main` si falta.
✅ CODER: FASES 9, 10 y 11 implementadas. ✅ QA aprobó. ✅ Backup commit dc1f9c7.
   Henry: ejecutar `git push origin main` si el push no se hizo desde el IDE.
────────────────────────────────────────────────────────
✅ Etapas 2 y 3 APROBADAS (26 Ene 2026). Siguiente: QA ejecutar etapa 4 (Chatbot). Plan: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md.
📌 FASES PRODUCCIÓN (12-13): Docker validado → luego Deploy VPS cuando Henry decida.
```

---

## 📈 MÉTRICAS

| Métrica | Valor | Meta |
|---------|-------|------|
| Días transcurridos | 5 | - |
| Días restantes MVP | 25 | 30 |
| **Fases CORE completadas** | 5/7 (FASE 5 en progreso) | 7/7 |
| **Fases MONETIZACIÓN** | 1/5 (Dashboard Henry iniciado) | 5/5 |
| **Fases PRODUCCIÓN** | 1/2 (Docker Local) | 2/2 |
| **TOTAL FASES** | 5/14 completadas | 14/14 |
| Bloqueadores activos | 0 | 0 |
| Código funcional | ~3,200 líneas | ~8,000 |
| Documentación Arquitecto | ✅ Rentabilidad + Límites | Completo |

### **Progreso por Categoría:**
```
CORE (MVP):        [██████████████░░░░░░] 70% (4/7 fases completadas)
MONETIZACIÓN:      [████░░░░░░░░░░░░░░░░] 20% (Dashboard Henry iniciado)
PRODUCCIÓN:        [████░░░░░░░░░░░░░░░░] 20% (Docker Local iniciado)
────────────────────────────────────────────
TOTAL PROYECTO:    [████████░░░░░░░░░░░░] 32%
```

### **Avances del Coder (30 Ene):**
- ✅ **FASE 3 COMPLETADA - Login OTP 100%**
- ✅ **FASE 4 COMPLETADA - Dashboard Admin PH** (Aprobado QA 30 Ene)
- ✅ Docker Postgres funcionando (puerto 5433)
- ✅ API chatbot config conectada a PostgreSQL
- ✅ Rutas residentes conectadas
- ✅ Panel chatbot config funcional
- 🔄 **EN PROGRESO: FASE 5 - Votación Básica**

---

## 🗓️ HISTORIAL DE CAMBIOS

| Fecha | Cambio | Responsable |
|-------|--------|-------------|
| Feb 2026 | **✅ CODER informa al Contralor: Formulario asambleas, dashboard (filtro/abandono/historial) y edición masiva propietarios** – Formulario Nueva asamblea: diseño create-ph-form; tipos Ordinaria, Extraordinaria, Por derecho propio (3-5 días), Especial (texto libre); temas con tipo de aprobación (51%, 66%, reglamento, informativo) y sugerencia automática. Dashboard: filtro año/mes, fecha de hoy, tarjeta Abandono de sala (chatbot) con métricas desde API, historial asambleas celebradas/canceladas. Lista Propietarios: edición masiva (checkboxes, Marcar Mora/Al Día, Habilitar/Deshabilitar Face ID). Detalle en **Contralor/INFORME_ULTIMOS_CAMBIOS_FEB2026.md** §13. | Coder |
| Feb 2026 | **✅ CODER informa al Contralor: Últimos cambios Dashboard Admin PH y mejoras** – Botón "Subir a plan real" → Modificar suscripción. Tema claro: tabla de planes (Suscripción), Actas, Vista Monitor (contenedor, tarjetas, indicadores). Bitácoras: Abandonos de sala y Modificaciones de voto con listado y enlace Dashboard principal. Monitor: una torre "Urban Tower PH" (50 residentes) en selector; botones Exportar Excel/PDF (resumen y unidades); voto manual por administrador (clic en casilla → modal, comentario obligatorio al modificar). Corrección /pricing (Suspense desde react). Detalle en bloque "Reporte Coder al Contralor – Últimos cambios Dashboard Admin PH y mejoras (Feb 2026)". | Coder |
| 07 Feb 2026 | **📋 ORDEN MARKETING: Chatbot más inteligente con Gemini** – Orden registrada en ESTATUS_AVANCE: bloque "Para CODER – Chatbot más inteligente con Gemini (orden Marketing 07 Feb 2026)". Coder: ramificar handleChatSubmit; POST /api/chat/resident con Gemini; GEMINI_API_KEY; base conocimiento PERFIL 5, TEMA 4B. Referencia: Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md. | Marketing / Contralor |
| Feb 2026 | **✅ CODER: Chatbot más inteligente con Gemini – Completado** – Implementado POST /api/chat/resident (Gemini), rama en chat/page.tsx y page.tsx para residente validado + texto libre. Reporte y sugerencia QA en ESTATUS_AVANCE. Prueba sugerida en QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § Chatbot Gemini. | Coder |
| Feb 2026 | **✅ CONTRALOR: Reportes agentes validados – Fase listo. Requisito 2 PH para pruebas** – Contralor valida reportes de esta fase; fase cerrada. Para probar funcionalidades: 2 PH necesarios (uno con asamblea activa para votar, otro agendada no activa). **Responsable datos:** Database. **Responsable pruebas:** QA. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación respuesta Marketing – Instrucción al Coder (chatbot Gemini)** – Marketing indicó: ramificar handleChatSubmit (residente validado + texto libre → no validar email); crear POST /api/chat/resident con Gemini; GEMINI_API_KEY; base conocimiento PERFIL 5, TEMA 4B. Contralor valida. Instrucción en bloque "Para CODER – Chatbot más inteligente con Gemini". Coder informa al Contralor al finalizar. | Contralor |
| Feb 2026 | **📋 CONTRALOR: Propuesta demo por correo – Henry informó al Arquitecto** – Propuesta Marketing (demo por correo del cliente nuevo) en curso. Orden: Arquitecto primero (definir flujo técnico y especificación), luego Coder. Bloque "Propuesta Henry – Demo por correo" actualizado en ESTATUS_AVANCE. Contralor espera especificación del Arquitecto. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación respuesta Marketing – Mejoras creación asambleas Ley 284 (T6)** – Se actualizaron **Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md** y el bloque **"Para CODER"** en ESTATUS_AVANCE.md. T6 (Acta inmediata al finalizar votaciones + mensaje acta legal en plazo Ley 284) incluida en la instrucción al Coder. Contralor valida. Coder ejecuta según bloque "Para CODER – Mejoras creación asambleas (Ley 284, orden Marketing Feb 2026)". | Contralor |
| Feb 2026 | **📋 CONTRALOR: Tarea QA – Sincronización Residentes ↔ Monitor Back Office y Chatbot** – Unidades demo unificadas a **1–50** en listado Propietarios y Monitor. Sincronización por `unit`/`code`: mismo nombre y estatus Al Día/Mora en ambos. Creado **QA/PLAN_PRUEBAS_RESIDENTES_MONITOR_SINCRONIZACION.md**. Instrucción QA: verificar numeración 1–50, sincronización estatus, **borrar y crear residentes 1 x 1**, probar chatbot y resto del plan. Bloque "Para QA – Sincronización Residentes ↔ Monitor Back Office y Chatbot" en ESTATUS_AVANCE. Contralor asigna a QA. | Contralor |
| Feb 2026 | **📋 CONTRALOR: Reporte Coder + Arquitecto – Dashboard Admin PH** – Actualizado docs/RESUMEN_DASHBOARD_ADMIN_PH.md con estado del reporte Coder (R1–R4/R8 aplicados; pendiente bug botones, planes pago único) e instrucción al **Arquitecto** para validar el proceso del dashboard. **Espera respuesta de Marketing primero** para validar el flujo correcto; luego Arquitecto valida y reporta. Bloque "Para ARQUITECTO" actualizado en ESTATUS_AVANCE. | Contralor |
| Feb 2026 | **📋 CONTRALOR: Bug botones Dashboard Admin PH (Marketing)** – En la sección monitor/asamblea del dashboard Admin PH los botones Ver detalle, Iniciar asamblea y Monitor llevan al resumen en lugar del destino correcto. Añadido en Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "BUG: Botones sección Monitor de asamblea" y en ESTATUS_AVANCE bloque "Para CODER – Dashboard Admin PH" instrucción al Coder para corregir (usar id asamblea real, destinos correctos). | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación respuesta Coder y QA** – Revisión estado actual: Coder y QA **OK** en login residente, redirección por rol, assembly-context, Face ID, chatbot Gemini, Ceder poder (implementado), Dashboard Henry (implementado). Pendiente: QA re-validar verify-otp en navegador; QA revisar Dashboard Henry y test Admin PH con 5 usuarios; QA prueba §G en navegador; Coder §K y mejoras Admin PH R1–R8. Bloque "Validación Contralor – Respuesta Coder y QA (estado actual)" añadido en ESTATUS_AVANCE. | Contralor |
| Feb 2026 | **📋 CONTRALOR: Test Dashboard Admin PH con usuarios demo** – Usuarios demo listos para validar funcionalidad y límites del Dashboard Admin PH. Creado **QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md** (Fase 1: navegación 2.1–2.9 por cada uno de los 5 usuarios; Fase 2: límites por plan; Fase 3: botones principales). Actualizado Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md con indicaciones QA. QA ejecuta según el plan y reporta en QA_FEEDBACK.md. | Contralor |
| 18 Feb 2026 | **✅ DATABASE informa al Contralor:** Script sql_snippets/107_powers_enabled_organizations.sql ejecutado en BD. Columna organizations.powers_enabled creada (BOOLEAN DEFAULT FALSE). Toggle "Poderes de asamblea" en Propietarios y chatbot persisten correctamente. | Database |
| 13 Feb 2026 | **✅ QA informa al Contralor: Plan Sincronización Residentes ↔ Monitor ejecutado – PARCIAL** – Sincronización Propietarios ↔ Monitor OK (unidades 1–50, Al Día/Mora, nombres). Chatbot no reconoce residentes demo agregados en Propietarios (solo residente1–5@). Mejoras para Coder en Coder/INSTRUCCIONES_QA_MEJORAS_RESIDENTES_MONITOR_CHATBOT.md. Ref: QA/QA_FEEDBACK.md § "QA Ejecución · Sincronización Residentes ↔ Monitor y Chatbot". | QA |
| 13 Feb 2026 | **✅ DATABASE informa al Contralor: Migración listado residentes §3 aplicada** – Creados: 107_residents_listado_columns.sql (columnas nombre, numero_finca, cedula_identidad, unit, cuota_pct, payment_status, habilitado_para_asamblea, titular_orden en users); seeds_residentes_listado_demo.sql (datos ricos 5 residentes); INSTRUCCIONES_CODER_RESIDENTES_LISTADO.md (GET ampliado + PATCH). Ejecutar scripts en BD cuando Docker disponible. Coder: implementar según instrucciones. Ref: Database_DBA/INSTRUCCIONES_LISTADO_RESIDENTES_BD.md §3. | Database |
| 26 Ene 2026 | **✅ QA informa al Contralor: Validación listado residentes vs INSTRUCCIONES_LISTADO_RESIDENTES_BD – CONFORME** – QA validó que el listado de residentes está alineado con Database_DBA/INSTRUCCIONES_LISTADO_RESIDENTES_BD.md. Demo usa localStorage (assembly_demo_residents); producción usa API (id, email, face_id_enabled). UI adapta columnas según origen. Ref: QA/QA_FEEDBACK.md § "QA Validación · Listado de residentes vs INSTRUCCIONES_LISTADO_RESIDENTES_BD". | QA |
| Feb 2026 | **✅ CONTRALOR: Validación avances Coder – Dashboard Henry** – Avances verificados en código: APIs platform-admin (tickets, clients, leads, campaigns, monitoring, business, leads/export), resumen ejecutivo desde BD con fallback, tickets desde platform_tickets. **QA debe revisar** según QA/QA_REPORTE_DASHBOARD_HENRY y QA_FEEDBACK § "QA Checklist · Navegación Dashboard Henry". Bloque "Para QA – Revisar avances Dashboard Henry" añadido en ESTATUS_AVANCE. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación respuesta QA (listo)** – QA informó tarea completada. Contralor valida. Próxima actividad la asigna el Contralor en una frase. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación respuesta QA – Bug PIN chatbot residente** – QA informó: "Error al verificar" con PIN correcto; causa `res.ok` fuera de scope en chat/page.tsx y page.tsx. Contralor valida el reporte. Coder: corregir según bloque "Para CODER (bug verify-otp chatbot residente)". Al finalizar informa al Contralor. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Database + QA Face ID** – Database ejecutó script 101 (face_id_enabled). QA revalidó Face ID e informó. Contralor confirma. Plan de navegación: etapas 1–6 aprobadas; Face ID cerrado. Próxima tarea: Contralor asigna en una frase. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Coder completó TAREA 5 Face ID** – QA valida Face ID, informa al Contralor; Contralor valida respuesta y asigna próxima tarea. | Contralor |
| 26 Ene 2026 | **✅ CODER: Dashboard Henry §5 y §7 – 100% COMPLETADO** – Media: Monitor VPS (GET /api/platform-admin/monitoring, placeholder); CRM campañas (tabla platform_campaigns, GET/PATCH/POST execute, UI conectada); Métricas negocio (GET /api/platform-admin/business, agregados BD o placeholder). Baja: Exportar reporte → CSV (botón en leads + GET /api/platform-admin/leads/export, dashboard "Exportar reporte (CSV)"); Ejecutar campañas → POST execute con last_executed_at y mensaje placeholder. Ver QA_REPORTE_DASHBOARD_HENRY.md §8. | Coder |
| 26 Ene 2026 | **✅ CODER: Dashboard Henry – Tickets desde BD (QA §5 y §7)** – Tabla platform_tickets (sql_snippets/104_platform_tickets.sql) con seeds TKT-2026-021, 019, 017. API GET /api/platform-admin/tickets (lista), GET/PATCH /api/platform-admin/tickets/[id] (detalle, resolver, escalar). Lista y detalle de tickets consumen API con fallback a seeds. Resolver/Escalar persisten en BD cuando la tabla existe. Ref: QA/QA_REPORTE_DASHBOARD_HENRY.md §5 y §7. | Coder |
| 26 Ene 2026 | **✅ CODER: Dashboard Henry – Resumen ejecutivo desde BD (QA §5 y §7)** – Resumen ejecutivo consume GET /api/leads y GET /api/platform-admin/clients. KPI (Funnel conversión, Clientes activos), Funnel de leads (Pipeline por etapa) y lista Clientes se derivan de las APIs; fallback a datos actuales si la API falla (ej. tabla platform_leads no existe). Tickets y Campañas siguen con datos actuales. Ref: QA/QA_REPORTE_DASHBOARD_HENRY.md §5 y §7. Informe al Contralor. | Coder |
| 07 Feb 2026 | **✅ CONTRALOR: Validación avances** – Las 4 tareas realizadas (Tarea 1 Coder, Tarea 2 QA, Tarea 3 Database, Tarea 4 Plan navegación). Falta el backup. Cuando Henry autorice, Contralor ejecuta commit + push. Tabla de validación y bloque "BACKUP – Falta ejecutar" añadidos en ESTATUS_AVANCE. | Contralor |
| 07 Feb 2026 | **✅ DATABASE: Verificación §E** – Tabla resident_abandon_events existe en BD. Script 100_resident_abandon_events.sql no fue necesario ejecutar. QA puede revalidar §E. Informe al Contralor. | Database |
| Feb 2026 | **📋 CONTRALOR: Prueba Ceder poder (§G) – Pendiente** – Coder completó implementación; BD lista (script 103). Pendiente: ejecutar prueba QA (formulario inline, enviar solicitud, mensaje pendiente por aprobar, botón "Poder en proceso..." deshabilitado). Plan: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md 4.7. Contralor anota hasta que QA/Henry reporte. | Contralor |
| Feb 2026 | **✅ CODER informa al Contralor: Ceder poder en chatbot (§G) – Completado** – Revisados Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md y Marketing §G. Tabla power_requests (103), API POST/GET power-requests, formulario completo (tipo, correo, nombre, cédula/tel/vigencia opcionales), mensaje "Solicitud enviada. Pendiente por aprobar", botón "Poder en proceso de validación y aprobación" cuando hay pendiente. Chat y landing. Pendiente opcional: email confirmación al residente. | Coder |
| Feb 2026 | **✅ CODER informa al Contralor: Chatbot más inteligente – preguntas simples – Completado** – Detección identidad (Lex), base de conocimiento desde docs/chatbot-knowledge-resident.md, GET /api/chat/resident?validate=1 para validar API Gemini, fallback "Soy Lex", generationConfig y extracción robusta. Detalle y recomendaciones en QA/QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea". Contralor asigna próxima actividad. | Coder |
| Feb 2026 | **✅ CODER informa al Contralor: assembly-context desde BD – Completado** – Aplicado Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md. API GET /api/assembly-context: con organization_id consulta BD (active→activa, scheduled→programada, sin filas→sin_asambleas). Chat y landing envían organization_id cuando no hay profile. Bloque actualizado en ESTATUS_AVANCE. | Coder |
| 30 Ene 2026 | **✅ CONTRALOR: Informes actualizados – QA validación redirección por rol listo** – QA aprobó la prueba (todos los perfiles a su zona). Contralor actualiza ESTATUS_AVANCE y tabla PARA HENRY. Siguiente: más pruebas (plan § "Próximas pruebas"). | Contralor |
| 30 Ene 2026 | **✅ HENRY: Backup completado** – Push ejecutado: `git push origin main` (226bd72..b3afdd2 main → main). Repo: https://github.com/hbatista2720/assembly-2-0. Siguiente: QA ejecuta tarea "Validación redirección por rol". | Henry |
| Feb 2026 | **✅ CONTRALOR: Coder listo (login residente) + Tarea QA redirección por rol + Backup primero** – Coder finalizó corrección login (residente no entra como Admin PH). Contralor actualiza: (1) Backup de todo **primero** (Henry autoriza → Contralor commit, Henry push). (2) QA ejecuta tarea "Validación redirección por rol" (todos los perfiles: residente→chatbot, Admin PH→su zona, Henry→platform-admin). Plan: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § "Tarea QA: Validación redirección por rol (todos los perfiles)". Usuarios: docs/USUARIOS_DEMO_BD.md. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Doc usuarios demo + login residente prioridad crítica** – Creado docs/USUARIOS_DEMO_BD.md (lista usuarios demo en BD con rol y org para pruebas). QA Hallazgo crítico § "Residente entra como Admin PH" coordinado: bloque "Para CODER (login – residente no debe entrar como Admin PH)" con prioridad crítica. Orden: primero validar chatbot cuando Coder termine recomendaciones; corrección login residente = prioridad crítica. | Contralor |
| Feb 2026 | **✅ CONTRALOR: QA Análisis chatbot inteligente – Asignación al Coder** – QA reportó (QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea"): preguntas "¿cómo voto?" y "¿mi voto está registrado?" reciben respuesta genérica. Contralor valida. Fase: pulido chatbot residente. Instrucción en bloque "Para CODER (chatbot más inteligente – preguntas simples)": detección intenciones en /api/chat/resident, fallbacks, revisar Gemini. Coder informa al Contralor al finalizar. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Validación reporte Arquitecto (poderes) + observaciones Marketing §G** – Arquitecto: LOGICA_CEDER_PODER_CHATBOT.md (formulario inline, pendiente por aprobar, botón "en proceso...", Ley 284). Marketing §G alineado. Instrucción al Coder en bloque "Para CODER – Ceder poder en chatbot". Dónde empezar: Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md y Marketing §G. Coder informa al Contralor al finalizar. | Contralor |
| Feb 2026 | **✅ CONTRALOR: QA listo** – QA informó tarea completada. Contralor valida. Próxima actividad: Contralor asigna en una frase. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Coder listo (assembly-context BD)** – Coder informó tarea completada. Contralor valida. Próxima actividad: Contralor asigna en una frase. | Contralor |
| Feb 2026 | **✅ CONTRALOR: Reenvío al Coder – Respuesta Database (assembly-context)** – Database respondió con referencia a Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md. Contralor reenvía al Coder: aplicar ese documento (API assembly-context desde BD, PH A/PH B). Bloque "Para CODER (assembly-context PH A / PH B)" actualizado. Coder informa al Contralor al finalizar. | Contralor |
| 09 Feb 2026 | **✅ DATABASE informa al Contralor:** Script 97_platform_leads.sql ejecutado en BD. Tabla platform_leads creada. GET /api/leads habilitado (evita 500). | Database |
| 07 Feb 2026 | **📋 DATABASE informa al Contralor (para Coder):** Script 102_demo_ph_a_ph_b_assemblies.sql ejecutado. Tabla assemblies existe con organization_id y status (active/scheduled). PH A (Demo): asamblea activa. PH B (Torres): asamblea programada. **Coder:** Requisito BD cumplido. API assembly-context: si la tabla no existe, el catch devuelve "activa". En este entorno la tabla ya existe. Ver Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md. | Database |
| 26 Ene 2026 | **✅ CODER: §F, §G y §H implementados (Marketing)** – §F: Votación y Tema del día solo si asamblea activa; Asambleas, Calendario y Ceder poder siempre; si no hay asamblea activa, botones en gris con "No hay votación activa". §G: Formulario Ceder poder inline en chat con validación de correo y mensaje del bot. §H: API assembly-context (activa/programada/sin_asambleas); mensaje "No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?" cuando sin_asambleas. Demo: ?profile=activa|programada|sin_asambleas. Ref: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md, orden Contralor. | Coder |
| 26 Ene 2026 | **✅ CODER: Respuesta dentro del chatbot (UX residente)** – Votación, Asambleas, Calendario, Tema del día y Ceder poder responden **dentro del chat** con cards/mensajes (sin navegar a landings). Cards en landing (modal) y en /chat: votación (Sí/No/Abstengo), asambleas (listado), calendario (próximas actividades), tema (texto + Ver anexos), poder (formulario email + Enviar). Ref: validación UX Marketing. | Coder |
| 26 Ene 2026 | **✅ CODER: UX Chatbot navegación residente (Marketing)** – Rec 1: sesión residente en localStorage (assembly_resident_email, assembly_resident_validated) y restauración con ?chat=open. Rec 2: "Volver al chat" (href /chat) en páginas residentes. Rec 3: ACTIVA→votación, PROGRAMADA→Próximamente en asambleas. Rec 5: página /chat full-screen. Rec 6: pills debajo mensaje, encima input. Ref: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md. | Coder |
| 26 Ene 2026 | **✅ CODER: Build y tipos React** – @types/react y @types/react-dom en devDependencies; en entornos con NODE_ENV=production usar `npm install --include=dev`. Dockerfile, Dockerfile.webchat, Dockerfile.telegram, Dockerfile.whatsapp con `RUN npm install --include=dev`. Build pasa: params Promise (API Next 15), Stripe apiVersion, useSearchParams en Suspense (checkout, login, landing, AdminPhShell, leads), assemblies route, acts onClick. Ref: ESTATUS_AVANCE § "Para Coder (fallo de build)". | Coder |
| 05 Feb 2026 | **✅ BACKUP COMPLETADO** – Henry ejecutó push. 5c94eb5..7140ba2 main -> main. Test de navegación más tarde. | Henry |
| 05 Feb 2026 | **✅ BACKUP ejecutado** – Commit 7140ba2 (Tareas 2-3 finalizadas, TAREA_2_QA, TAREA_3_CODER, ESTATUS_AVANCE). Push completado por Henry. | Contralor |
| 05 Feb 2026 | **✅ Henry: Tareas 2 y 3 finalizadas** – Backup ahora; test de navegación más tarde. ESTATUS_AVANCE actualizado. | Henry |
| 05 Feb 2026 | **📋 CONTRALOR: Tareas 2 y 3 creadas** – Contralor/TAREA_2_QA.md (QA: revalidar §E o validación manual chatbot) y Contralor/TAREA_3_CODER.md (Coder: §F, §G, §H). Referencias en ESTATUS_AVANCE actualizadas. | Contralor |
| 05 Feb 2026 | **✅ CONTRALOR: Validación respuesta Coder (Tarea 1)** – Confirmada en código: residentEmailValidated, mensaje con reintento, botones solo cuando validado. Tarea 1 cerrada. Añadido "Para Henry – ¿En qué fase estamos? (1 a 10)" y qué falta. | Contralor |
| 05 Feb 2026 | **📋 ORDEN TAREAS 1→2→3** – Henry: primero Tarea 1 (Coder lógica chatbot residente), después Tarea 2 (QA), después Tarea 3 (Coder §F/§G/§H) cuando confirme finalizado. ESTATUS_AVANCE actualizado. | Henry |
| 05 Feb 2026 | **✅ CODER: Tarea 1** – Lógica chatbot residente reforzada: mensaje "No encuentro ese correo" incluye "Puedes escribir otro correo para reintentar"; comentario Marketing §2 en bloque de botones; condición explícita residentEmailValidated para mostrar botones. Ref: INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md §2. | Coder |
| 05 Feb 2026 | **✅ BACKUP COMPLETADO** – Henry ejecutó `git push origin main`. a76fb32..5c94eb5 main -> main. Código y documentación respaldados en GitHub. | Henry |
| 30 Ene 2026 | **✅ CONTRALOR: Backup ejecutado** – Commit 5c94eb5. Incluye: código fuente completo (src/), validaciones §E, plan pruebas, ESTATUS_AVANCE, API resident-abandon, sql_snippets (100_, 98_, seeds_leads_demo), Database_DBA, Marketing, docs. Push completado por Henry 05 Feb 2026. | Contralor |
| 30 Ene 2026 | **✅ CONTRALOR: Validación QA, Coder y Base de datos §E** – Respuesta QA validada; respuesta Coder §E validada; **respuesta Base de datos incluida y validada** (tabla resident_abandon_events ejecutada en BD 06 Feb). Plan de pruebas: estatus actualizado. **Próxima tarea prioritaria: backup** (Henry autoriza → Contralor ejecuta). | Contralor |
| 30 Ene 2026 | **✅ CONTRALOR: Reporte Docker validado** – GUIA_DOCKER_PARA_HENRY.md § "Recomendación: Quitar assembly-web" y QA_FEEDBACK.md observación verificadas. Recomendación: eliminar assembly-web en Docker Desktop para evitar confusiones; no afecta la app actual (assembly-app). | Contralor |
| 07 Feb 2026 | **📋 CONTRALOR: Informe Dashboard Henry registrado** – Auditoría QA en **QA/QA_REPORTE_DASHBOARD_HENRY.md**: sincronización con BD, Monitor VPS vs real, botones sin acción. Tabla de acciones sugeridas para el Coder (sección 5 y 7). Instrucción para Coder: priorizar según tabla (Alta: resumen ejecutivo + BD, tickets + BD; Media: Monitor VPS, CRM, métricas negocio; Baja: exportar reporte, ejecutar campañas). Referencia auditoría en QA_FEEDBACK.md. Contralor asigna al Coder cuando corresponda. | Contralor |
| 07 Feb 2026 | **📋 QA: Re-test post-Database + validación prompts chatbot** – Leads API 200 (tabla existe). Chatbot: prompts en BD (telegram, web, whatsapp) pero **/api/chat/resident NO usa prompts.residente** – usa buildSystemPrompt hardcoded. Respuesta "¿Cómo voto?" = fallback (Gemini 404 modelo). **Para Coder:** (1) sincronizar prompts config con /api/chat/resident; (2) revisar GEMINI_MODEL. Ver QA_FEEDBACK § "Re-test post-Database + Validación Chatbot Prompts". | QA |
| 07 Feb 2026 | **✅ QA Master Usuario: Dashboard Henry ejecutado** – Checklist QA_REPORTE_DASHBOARD_HENRY + QA_FEEDBACK. Rutas 200 OK. APIs: leads 500 (platform_leads falta), clients/chatbot/export/tickets/business/monitoring/campaigns 200. Navegación sidebar, botones, retorno OK. Bloqueador: ejecutar 97_platform_leads.sql. Ver QA_FEEDBACK § "QA Master Usuario · Ejecución Dashboard Henry". | QA |
| 07 Feb 2026 | **📋 QA: Dashboard Henry – auditoría sincronización BD y botones** – Reporte completo: Resumen ejecutivo, Tickets, CRM, Métricas negocio y Monitor VPS usan datos hardcoded (no BD). Leads: API existe, tabla platform_leads puede faltar. Clientes: API con fallback. Chatbot config: OK. Monitor VPS no refleja Docker/VPS real. Botones sin lógica: Exportar reporte, Activar demo, Revisar ticket (bug IDs), Configurar campaña, Ejecutar campañas. Bug: tickets lista TKT-2026-* pero detalle espera tkt-001 → "Ticket no encontrado". Ver QA/QA_REPORTE_DASHBOARD_HENRY.md. **Para Coder:** tabla de acciones sugeridas por prioridad. | QA |
| 07 Feb 2026 | **✅ QA: Chatbot reconoce correo Admin PH – APROBADO** – Implementado POST /api/admin-ph/residents + UI "Agregar residente" en Propietarios. Prueba: crear nuevo.pha@demo.assembly2.com (PH A) y nuevo.phb@torresdelpacifico.com (PH B); chatbot reconoce ambos; assembly-context: PH A=activa, PH B=programada. En producción: Admin PH agrega → chatbot reconoce automáticamente y valida tipo residente según asambleas. Ver QA_FEEDBACK.md § "Chatbot reconoce correo registrado por Admin PH". | QA |
| 07 Feb 2026 | **📋 INFORME DOCKER – Revisión contenedores para Henry** – Lista enumerada de 7 contenedores según docker-compose: assembly-db, assembly-pgbouncer, assembly-redis, assembly-app, assembly-telegram-bot, assembly-whatsapp-bot, assembly-web-chatbot. Creada **Contralor/GUIA_DOCKER_PARA_HENRY.md** con función de cada uno, puertos y URLs. Observación: `assembly-web` (visible en Docker Desktop) es contenedor huérfano/legacy; el correcto es `assembly-app`. Todos los del compose están correctos. | QA |
| 07 Feb 2026 | **✅ QA: Validación redirección por rol – APROBADO** – Ejecutada tarea según PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md. 5 usuarios: residente1@, residente2@ → /residentes/chat; demo@, admin@torresdelpacifico.com → /dashboard/admin-ph; henry.batista27@gmail.com → /dashboard/platform-admin. Ningún residente termina en admin-ph. Ver QA_FEEDBACK.md § "Validación redirección por rol". | QA |
| 07 Feb 2026 | **📋 QA reporta al Contralor: Chatbot inteligente – revalidación fallida** – Prueba "como voto" sigue devolviendo mensaje genérico. La detección de intenciones (cómo votar, estado voto, tema) NO está implementada en /api/chat/resident. **Para Coder:** añadir isAskingHowToVote(), isAskingVoteStatus(), etc. con respuestas predefinidas. Ver QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente". | QA |
| 07 Feb 2026 | **🔴 QA: Residente entra como Admin PH – BLOQUEADOR** – Login con residente2@demo.assembly2.com (rol RESIDENTE) redirige a Dashboard Admin PH. Causa: no hay check de role RESIDENTE; is_demo de la org aplica y manda a admin-ph. **Para Coder:** añadir if (role===RESIDENTE) → redirect /residentes/chat. Ver QA_FEEDBACK.md § "QA Hallazgo crítico · Residente entra como Admin PH" y bloque "Para CODER (login residente)". | QA |
| 07 Feb 2026 | **📋 QA: Chatbot inteligente – Análisis y recomendaciones** – Prueba con "como voto" y "puede validar si mi voto ya se registro" devuelve mensaje genérico. Causa: Gemini falla/vacío → fallback. Recomendación: añadir detección de intenciones (cómo votar, estado voto) con respuestas predefinidas. Ver QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente". | QA |
| 07 Feb 2026 | **✅ QA: PH A y PH B assembly-context – APROBADO** – API devuelve activa para PH A (Demo), programada para PH B (Torres). Overrides ?profile= OK. Ver QA_FEEDBACK.md § "PH A y PH B assembly-context". | QA |
| 07 Feb 2026 | **✅ QA: Face ID revalidado – APROBADO** – Todas las APIs 200 OK (admin-ph/residents, resident-profile, GET/PUT settings). Toggle Propietarios operativo. | QA |
| 07 Feb 2026 | **📋 QA informa al Contralor – Bug PIN chatbot residente** – APIs request-otp y verify-otp OK (prueba con residente2@). Bug frontend: `res.ok` fuera de scope en chat/page.tsx y page.tsx (verify-otp). Usuario recibe "Error al verificar" aunque el PIN sea correcto. **Para Coder:** ver instrucción "Para CODER (bug verify-otp chatbot)" más abajo. | QA |
| 07 Feb 2026 | **🟡 QA: Face ID revalidado – PARCIAL** – GET admin-ph/residents y resident-profile 200 OK; columna BD operativa. GET/PUT settings 500: import path incorrecto en settings/route.ts. **Para Coder:** corregir `../../../../../lib/db` → `../../../../../../lib/db`. Ver QA_FEEDBACK.md § "QA Revalidación Face ID". | QA |
| 07 Feb 2026 | **📋 QA informa al Contralor** – Coordinar próxima tarea. Prioridad: Database ejecutar script 101 (face_id_enabled) → QA revalida Face ID. Alternativa: Coder botón retorno Platform Admin. Ver bloque "COORDINACIÓN PRÓXIMA TAREA" más abajo. | QA |
| 07 Feb 2026 | **🟡 QA: Face ID (TAREA 5) – PARCIAL** – Código Admin PH + APIs implementados; UI toggle en Propietarios OK. APIs 500: columna `face_id_enabled` no existe en BD. **Para Database:** ejecutar `sql_snippets/101_face_id_enabled_users.sql`. Ver QA_FEEDBACK.md § "QA Validación · Face ID opcional". | QA |
| 07 Feb 2026 | **✅ QA: Plan completo + §J/rec 14** – Ejecutado plan navegación etapas 1–6 (todas 200 OK). Validación §J/rec 14: 4/4 puntos implementados (mensaje bienvenida, correo en cabecera, card Votación, badge Asamblea activa). Informe en QA_FEEDBACK.md. Contralor: registro y backup si Henry autoriza. | QA |
| 07 Feb 2026 | **✅ QA: TAREA_2 completada (§E + Opción B)** – §E revalidado: API 200 OK, tabla BD operativa, botón Cerrar sesión + alerta. Opción B: botones chatbot 4.3–4.7 muestran cards inline; rutas /residentes/* todas 200. Ver QA_FEEDBACK.md § "QA TAREA 2 – Ejecución completa". | QA |
| 06 Feb 2026 | **✅ QA: TAREA_2 Opción A – Revalidación §E completada** – Tabla BD OK, botón "Cerrar sesión" + alerta implementados, POST /api/resident-abandon 200 OK, registro verificado via GET. Sin fallos. Ver QA_FEEDBACK.md § "QA Revalidación §E – TAREA_2_QA Opción A". Pendiente: UI Admin PH para listar abandonos. | QA |
| 06 Feb 2026 | **📋 QA: Registro abandono sala §E** – NO IMPLEMENTADO. Falta: botón Cerrar sesión, alerta, tabla BD, UI Admin PH. Ver QA_FEEDBACK.md. **Para Coder + Database.** | QA |
| 06 Feb 2026 | **📋 QA: Funnel leads + Tickets** – Funnel vacío (tabla platform_leads no existe/vacía). Seeds creados: 97_platform_leads.sql + seeds_leads_demo.sql. **Para Database:** ejecutar scripts. **Para Coder:** integrar en init. Ver QA_FEEDBACK.md. | QA |
| 05 Feb 2026 | **📋 QA: Dashboard Henry** – Páginas hijas (monitoring, clients, business, leads, chatbot-config, crm) sin botón "Volver al dashboard". **Para Coder.** Ver QA_FEEDBACK.md. | QA |
| 05 Feb 2026 | **✅ QA: Chatbot re-validado** – Fix Opción B aplicado (DEMO_RESIDENT_EMAILS). Emails residente1@…residente5@ reconocidos. Login OTP + carga OK. Ver QA_FEEDBACK.md. | QA |
| 05 Feb 2026 | **📋 QA: Chatbot residente** – Validación email usa solo localStorage.assembly_users; residente2@ existe en BD pero chatbot dice "No encuentro ese correo". **Para Coder:** validar contra API/BD. Ver QA_FEEDBACK.md. | QA |
| 05 Feb 2026 | **✅ QA: Flujo residente validado** – Seeds ejecutados, login OTP residente1@…residente5@ OK, acceso /residentes/votacion con redirect. Ver QA_FEEDBACK.md § "Flujo residente con usuarios demo". | QA |
| 05 Feb 2026 | **📋 QA: /residentes/votacion** – Botón "Emitir voto" no responde (sin onClick). No valida usuario. Ver QA_FEEDBACK.md. **Para Coder.** | QA |
| 26 Ene 2026 | **✅ QA PLAN PRUEBAS COMPLETADO** – Fase 04 (Landing→Chatbot), etapas 5 (residentes) y 6 (smoke). Todas las rutas 200. Ver QA_FEEDBACK.md. Plan navegación Login→Chatbot 100% aprobado. | QA |
| 26 Ene 2026 | **✅ CONTRALOR APROBÓ AVANCE QA** – Avance QA confirmado. Fase 04 (Landing → Chatbot) queda autorizada para ejecución. | Contralor |
| 26 Ene 2026 | **✅ QA RE-EJECUTÓ ETAPAS 2 Y 3** – Plan pruebas navegación. Dashboard Admin PH (2.1–2.9) y Platform Admin (3.1–3.6). Todas las rutas HTTP 200. /api/chatbot/config 200. Reporte QA_FEEDBACK.md. Etapas 2 y 3 APROBADAS. Siguiente: etapa 4 (Chatbot). | QA |
| Feb 2026 | **✅ CONTRALOR CONFIRMA AVANCES QA** – Revisado QA/QA_FEEDBACK.md: (1) Ejecución plan: Login ✅, etapas 2–6 con bloqueadores. (2) Re-validación: AssembliesPage duplicate → Coder corrigió. (3) Re-ejecución: alias @/ UpgradeBanner → Coder corrigió + duplicate export + "use client". Coder confirma build OK. Siguiente: QA re-ejecutar etapas 2 y 3 y reportar en QA_FEEDBACK + historial. | Contralor |
| Feb 2026 | **📋 CODER: Bloqueadores compilación corregidos** – Plan de pruebas indica que QA debe re-ejecutar etapas 2 (Dashboard Admin PH) y 3 (Platform Admin) y reportar en QA_FEEDBACK.md y en historial Contralor. | Coder |
| 26 Feb | **📋 QA RE-EJECUTÓ PLAN** – AssembliesPage OK. Nuevo bloqueador: Module not found @/components/UpgradeBanner (admin-ph/page.tsx). App 500 en rutas. Coder: revisar alias @/ o usar import relativo. Reporte QA_FEEDBACK + notificación Contralor. | QA |
| Feb 2026 | **✅ CODER: Bloqueadores plan pruebas** – Corregidos duplicate export/const en team, owners, settings, support, votations; "use client" en acts y reports. Build compila. Plan de pruebas (QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md) actualizado: QA re-ejecuta etapas 2 y 3. | Coder |
| Feb 2026 | **✅ CODER: Script residentes demo integrado en init Docker** – sql_snippets/seeds_residentes_demo.sql (entregado por Database) ya está en la carpeta montada en /docker-entrypoint-initdb.d; se ejecuta en el primer arranque. Cabecera del script y sql_snippets/README.md documentan ejecución manual para instancias existentes. Ref: QA_FEEDBACK.md, ESTATUS_AVANCE. | Coder |
| 26 Feb 2026 | **✅ CODER: Revisión plan de pruebas + API chatbot** – Revisado PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md y QA_FEEDBACK. GET /api/chatbot/config: si tabla no existe (42P01) devuelve [] en lugar de 500 para no bloquear UI. Sin más imports @/ en src. Siguiente: QA re-ejecutar etapas 2 y 3 y reportar. | Coder |
| Feb 2026 | **✅ CODER: Bloqueador alias @/** – Sustituidos todos los imports `@/` por rutas relativas (admin-ph/page, checkout, pricing, AssemblyCreditsDisplay, API organizations/assemblies/assembly-credits, validateSubscriptionLimits). QA_FEEDBACK actualizado. Build ya no falla por Module not found @/. | Coder |
| 26 Feb | **✅ QA RE-EJECUTÓ ETAPAS 2 Y 3** – Dashboard Admin PH (2.1–2.9) y Platform Admin (3.1–3.6). Todas las rutas 200. Reporte en QA_FEEDBACK.md. Etapas 2 y 3 APROBADAS. | QA |
| 26 Feb | **📋 QA INFORMA AL CONTRALOR** – Siguiente tarea (tras reporte QA) es para Coder: corregir bloqueadores que QA reporte en QA_FEEDBACK.md. | QA |
| Feb 2026 | **✅ CODER: AssembliesPage duplicate export** – Eliminada la segunda definición en src/app/dashboard/admin-ph/assemblies/page.tsx (una sola export default). Sección "Para CODER (AssembliesPage)" y tabla de próximas acciones actualizadas. QA puede re-validar rutas. | Coder |
| Feb 2026 | **✅ CODER: AssembliesPage finalizado** – Eliminada definición duplicada en assemblies/page.tsx. Siguiente: QA re-validar navegación y reportar. | Coder |
| Feb 2026 | **✅ APROBADO POR CONTRALOR** – Documentos: QA/QA_FEEDBACK.md (re-validación con causa raíz y acción para Coder), ESTATUS_AVANCE (entrada en historial). Acción Coder: eliminar una de las dos definiciones de AssembliesPage en src/app/dashboard/admin-ph/assemblies/page.tsx. | Contralor |
| Feb 2026 | **✅ CONTRALOR VALIDA RESPUESTA QA** – QA_FEEDBACK: Login OK; plan ejecutado; bloqueadores (AssembliesPage duplicate → Coder ya corrigió). Siguiente tarea: (1) QA re-ejecutar plan tras fix AssembliesPage y reportar en QA_FEEDBACK + historial. (2) Coder corregir bloqueadores restantes si QA los reporta: /api/chatbot/config 500, /pricing /register 500, residentes 500. | Contralor |
| Feb 2026 | **✅ CONTRALOR VALIDA: Coder finalizó AssembliesPage** – Una sola export default en assemblies/page.tsx. Próximo paso: QA re-validar navegación (plan pruebas) y reportar en QA_FEEDBACK + historial. | Contralor |
| Feb 2026 | **✅ CODER: parent_subscription_id aplicado** – auth_otp_local.sql actualizado (CREATE + ALTER). Verify-otp desbloqueado. Siguiente: QA re-validar login y ejecutar plan navegación. | Coder |
| Feb 2026 | **📋 PLAN DE PRUEBAS: Navegación Login→Chatbot** – Creado QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (login, redirección por rol, Admin PH, Platform Admin, chatbot, residentes). Para QA. | Contralor |
| Feb 2026 | **✅ Reporte QA verify-otp registrado en Contralor** – Responsable: Coder. Asignación: añadir parent_subscription_id a organizations en auth_otp_local.sql. Instrucción en "Para CODER (bloqueador verify-otp)" e historial. Ref: QA/QA_FEEDBACK.md. | Contralor |
| Feb 2026 | **✅ QA re-validación documentada** - QA/QA_FEEDBACK.md (Docker+OTP tras Opción C). **docker-compose:** app DATABASE_URL → postgres:5432 (Opción C temporal). Historial actualizado. | QA + Contralor |
| 06 Feb 2026 | **✅ DATABASE: Tabla resident_abandon_events ejecutada en BD** – Script 100_resident_abandon_events.sql ejecutado. Tabla creada. QA puede revalidar §E. Coder ya implementó POST /api/resident-abandon. | Database |
| Feb 2026 | **✅ DATABASE: Tabla resident_abandon_events (§E)** – Registro abandono de sala. Script sql_snippets/100_resident_abandon_events.sql. Instrucciones Coder: Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md. Ref: QA_FEEDBACK.md "Registro de abandono de sala (§E)". | Database |
| Feb 2026 | **✅ DATABASE: Residentes demo en BD** – Usuarios residente1@…residente5@demo.assembly2.com (org Demo, role RESIDENTE) en auth_otp_local.sql + seeds_residentes_demo.sql. Ref: QA_FEEDBACK.md "Recomendación: Asamblea demo con admin y residentes". QA puede usar para plan pruebas (login OTP como residente, carga). | Database |
| Feb 2026 | **📋 BASE DE DATOS: Instrucciones para Coder** - Database_DBA/INSTRUCCIONES_CODER_PGBOUNCER_AUTH.md (corrección PgBouncer↔PostgreSQL, wrong password type) | Database |
| Feb 2026 | **📋 Ceder poder en chatbot** - Formulario completo (datos del que acepta: residente mismo PH o titular mayor de edad), estado pendiente por aprobar, botón "en proceso de validación y aprobación". Incluye DOCUMENTO DE MEJORA: Análisis Ley 284 – cédula opcional (residente mismo PH: no requerida; titular mayor de edad: opcional). Ver Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md. Instrucción Coder en ESTATUS_AVANCE. | Arquitecto |
| Feb 2026 | **📋 Face ID opcional por residente** - Admin PH puede activar/desactivar Face ID por residente; OTP siempre disponible como fallback. Ver Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md. Instrucción Coder en ESTATUS_AVANCE. | Arquitecto |
| Feb 2026 | **📋 Chatbot residente: PIN por correo** - Arquitecto especificó flujo correo → PIN al email → validar PIN → luego botones; Votación/Tema solo si asamblea activa. Ver Arquitecto/LOGICA_CHATBOT_RESIDENTE_PIN.md. Instrucción Coder en ESTATUS_AVANCE. | Arquitecto |
| Feb 2026 | **🔄 FASE 09 ACTUALIZADA** - Stripe quitado (no retiros Panamá). Pasarelas: PayPal, Tilopay, Yappy, ACH. Ver Arquitecto/VALIDACION_PASARELAS_PAGO_PANAMA.md | Arquitecto |
| Feb 2026 | **📋 CONTRALOR: Siguiente paso validar Docker** - Instrucciones a Base de Datos y QA vía Contralor/VALIDACION_DOCKER_Y_OTP.md | Contralor |
| Feb 2026 | **✅ BACKUP FASES 9, 10, 11** - Commit dc1f9c7 (push manual: `git push origin main`) | Contralor |
| Feb 2026 | **✅ CODER: Corrección "No se pudieron cargar los leads"** – Añadido sql_snippets/97_platform_leads.sql para que el init Docker cree la tabla platform_leads. Nueva sección "Para CODER (corrección Gestión de Leads)" en ESTATUS_AVANCE. Instancias existentes: ejecutar 97_platform_leads.sql una vez en la BD. | Coder |
| Feb 2026 | **✅ CODER: Correcciones UI y build** – (1) Botón "Crear demo" en dashboard admin: ahora es enlace con href="/demo". (2) API leads: import corregido en src/app/api/leads/route.ts (de @/lib/db a relativo ../../../lib/db) para que compile; /platform-admin/leads operativo. Nota: el build completo sigue fallando por otros módulos (checkout, admin-ph, assemblies) no relacionados con leads. | Coder |
| 26 Feb | **📋 QA RE-VALIDACIÓN** - Login + Plan pruebas. Bloqueador persiste: assemblies/page.tsx tiene 2x export default (líneas 6 y 170). App 500 en todas las rutas. Coder debe eliminar duplicado. Ver QA_FEEDBACK | QA |
| 26 Feb | **📋 QA EJECUTÓ PLAN PRUEBAS** - PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT. Login OK. Bloqueadores: Duplicate export default, /api/chatbot/config 500, pricing/register/residentes 500. Ver QA_FEEDBACK | QA |
| 26 Feb | **📋 CONTRALOR ASIGNA A CODER** - Corregir verify-otp: añadir parent_subscription_id a organizations en auth_otp_local.sql (bloqueador login) | Contralor |
| 26 Feb | **🟡 QA: Re-validación Docker+OTP** - Opción C aplicada. Formas A/B/C OK. verify-otp bloqueado: columna parent_subscription_id falta en organizations (auth_otp_local) | QA |
| 26 Feb | **🔴 QA: Validación Docker+OTP** - Bloqueador: "wrong password type" app→PgBouncer→Postgres (ver QA_FEEDBACK) | QA |
| 26 Feb | **✅ FASES 09, 10, 11 APROBADAS POR QA** - Métodos de Pago, Menú Demo, Lead Validation | QA |
| 26 Feb | **✅ FASE 08 APROBADA POR QA** - Precios y Suscripciones (Precios v4.0 + Créditos FIFO + UI + BD) | QA |
| 30 Ene | **✅ BACKUP FASE 6** - Commit 137421b → GitHub | Contralor |
| 30 Ene | **✅ FASE 06 APROBADA POR QA** - Actas y Reportes | QA |
| 03 Feb | **🆕 MARKETING AGREGÓ** - Vencimiento créditos: 6 meses FIFO | Marketing |
| 03 Feb | **📋 ARQUITECTO: Re-validar** - Sistema de créditos acumulables | Contralor |
| 03 Feb | **✅ ARQUITECTO VALIDÓ** - Sistema créditos acumulables FIFO 6 meses | Arquitecto |
| 03 Feb | **📢 MARKETING ACTUALIZÓ** - Créditos acumulables + Planes v4.0 | Marketing |
| 03 Feb | **📋 FASE 08 ENVIADA A ARQUITECTO** - Validar antes de Coder | Contralor |
| 03 Feb | **🔄 FASE 08 EN PROGRESO** - Precios v4.0 + UI de suscripciones | Coder |
| 03 Feb | **🔄 FASE 08 FASE D** - Sistema de créditos acumulables (FIFO) | Coder |
| Feb 2026 | **📋 ARQUITECTO ACTUALIZÓ FASE 9** - Stripe quitado; solo PayPal/Tilopay/Yappy (retiros Panamá) | Arquitecto |
| Feb 2026 | **✅ FASE 08 COMPLETADA 100%** - Reporte al Contralor (A+B+C+D+E) | Coder |
| Feb 2026 | **📋 ARQUITECTO: Docs alineados FASE 9** - VALIDACION_PASARELAS, INSTRUCCIONES_VPS FASE 7, ARQUITECTURA_DASHBOARD_ADMIN_PH; notificar Coder (solo PayPal/Tilopay/Yappy/ACH) | Arquitecto |
| Feb 2026 | **✅ QA APROBÓ FASE 8** - Precios y Suscripciones | QA |
| Feb 2026 | **✅ BACKUP FASE 8** - Commit 3715276 (push manual si falta) | Contralor |
| Feb 2026 | **📋 CONTRALOR NOTIFICA CODER** - Iniciar FASE 9 (opcional 9+10+11) | Contralor |
| Feb 2026 | **📋 CONTRALOR INFORMA A QA** - Validar FASE 8 (checklist manual) | Contralor |
| 02 Feb | **✅ BACKUP FASE 7** - Commit bd253ff → GitHub | Contralor |
| 02 Feb | **✅ FASE 07 APROBADA POR QA** - Dashboard Admin Plataforma | QA |
| 02 Feb | **🔄 FASE 08 INICIADA** - Precios y Suscripciones | Arquitecto → Coder |
| 02 Feb | **✅ FASE 07 COMPLETADA** - Dashboard Admin Plataforma (Henry) | Coder |
| 30 Ene | **🔄 FASE 07 INICIADA** - Dashboard Admin Plataforma (Henry) | Coder |
| 30 Ene | **✅ FASE 06 COMPLETADA** - Actas y Reportes al 100% | Coder |
| 30 Ene | **✅ BACKUP FASE 5** - Commit 68ecd64 → GitHub | Contralor |
| 30 Ene | **✅ FASE 05 APROBADA POR QA** - Votación + Monitor | QA |
| 30 Ene | **✅ FASE 05 COMPLETADA** - Votación + Monitor al 100% | Coder |
| 30 Ene | **✅ FASE 05 LISTA** - Arquitecto confirmó todo preparado para Coder | Arquitecto |
| 30 Ene | **✅ MÓDULO 8 MONITOREO** - Dashboard Henry con métricas VPS | Arquitecto |
| 30 Ene | **📋 INSTRUCCIONES_DASHBOARD_HENRY_RECURSOS.md** - Monitor de capacidad VPS | Contralor → Arquitecto |
| 30 Ene | **✅ ANALISIS_RENTABILIDAD_OPERATIVA.md** - Costos vs Ingresos | Arquitecto |
| 30 Ene | **✅ LIMITES_UNIDADES_POR_PLAN.md** - Validación de límites | Arquitecto |
| 30 Ene | **✅ FASE 4 APROBADA POR QA** - Dashboard Admin PH | QA |
| 30 Ene | **✅ BACKUP GITHUB** - Commit 8039fd7 | Contralor |
| 30 Ene | **✅ FASE 5 INICIADA** - Votación Básica | Coder |
| 30 Ene | **✅ FASE 3 COMPLETADA - Login OTP 100%** | Coder |
| 31 Ene | Estrategia B2B Premium y Sistema de Créditos | Marketing |
| 31 Ene | Chatbot Config (API + UI + DB) | Coder |
| 31 Ene | Rutas residentes conectadas | Coder |
| 31 Ene | Docker Postgres en 5433 | Coder |
| 31 Ene | QA: error login explicado (DB local/OTP) | Coder |
| 30 Ene | Arquitectura VPS All-in-One aprobada (sin Supabase) | Arquitecto + Database |
| 30 Ene | INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (1,285 líneas) | Arquitecto |
| 30 Ene | Creación de carpeta Contralor_Desarrollo | Contralor |
| 30 Ene | Diagnóstico bloqueador login OTP | Contralor |
| 30 Ene | Plan de trabajo por fases v1.0 | Contralor |
| 29 Ene | Auditoría de base de datos | Database |
| 29 Ene | Git & Backup configurado | Coder |
| 27-29 Ene | Landing Page + Chatbot completados | Coder |

---

## 📝 REGISTRO DE AVANCES POR AGENTE

### 🏗️ ARQUITECTO - Últimos Avances:
```
Feb 2026 | 📋 CONSULTA MARKETING (Henry): ¿Admin puede tener varios planes? (un solo uso + suscripción, ej. Standard + Evento Único extra). Definir regla de negocio. Ver Marketing/MARKETING_CONSULTA_PLANES_MULTIPLES_ADMIN.md. Responder y documentar.
30 Ene | ✅ SISTEMA CRÉDITOS ACUMULABLES validado (FIFO, expiración 6m, alertas 30d)
30 Ene | ✅ FASE 8 VALIDADA - Precios v4.0 + Créditos + Prompts actualizados
30 Ene | ✅ Arquitectura VPS All-in-One aprobada (PostgreSQL + Redis + Auth self-hosted)
30 Ene | ✅ INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md (1,285 líneas, 5 FASES)
30 Ene | ✅ SETUP_VPS_CHATBOTS_MULTI_CANAL.md (guía completa VPS)
30 Ene | ✅ Diseñado botones acciones rápidas para residentes en chatbot
30 Ene | ✅ INSTRUCCIONES_CHATBOT_CONFIG_PAGE.md
30 Ene | ✅ Sistema de Roles y Equipo integrado en ARQUITECTURA_DASHBOARD_ADMIN_PH.md
30 Ene | ✅ FASE 6 agregada en INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md
30 Ene | ✅ Sistema de Suscripción Automático (PayPal/Tilopay) + Manual (ACH/Yappy)
30 Ene | ✅ FASE 7 completada: Pagos, créditos, facturas, webhooks (600+ líneas)
30 Ene | ✅ PANTALLA 7 en ARQUITECTURA_DASHBOARD_ADMIN_PH.md (Suscripción y Facturación)
30 Ene | ✅ VISTA 2: Matriz de Unidades Adaptativa (200-600+ unidades con estados visuales)
30 Ene | ✅ VISTA_PRESENTACION_TIEMPO_REAL.md actualizado (grid escalable, filtros, zoom)
30 Ene | ✅ Sistema de Límites de Unidades por Plan (validación + cargos adicionales)
30 Ene | ✅ LIMITES_UNIDADES_POR_PLAN.md (tabla completa + función check_units_limit)
30 Ene | ✅ Sistema valida: max_units_included + units_addon_purchased (SQL + API)
30 Ene | ✅ ANALISIS_RENTABILIDAD_OPERATIVA.md completado (VPS + AI + capacidad)
30 Ene | ✅ Validado: Margen 97.4% con modelo híbrido (Gemini Flash + Sonnet selectivo)
30 Ene | ✅ VPS CX51 ($150/mes) soporta 30 asambleas/7,500 usuarios concurrentes ✅
30 Ene | ✅ FASE 5 agregada a INSTRUCCIONES_CODER: Vista Monitor Votación (tiempo real)
30 Ene | ✅ Checklist completo para Coder: Grid adaptativo, WebSocket, filtros, estilos CSS
30 Ene | ✅ MODULO_MONITOREO_INFRAESTRUCTURA.md creado (Módulo 8 Dashboard Henry)
30 Ene | ✅ Sistema proactivo: Métricas tiempo real + predicción de carga + alertas upgrade
30 Ene | ✅ Predicción basada en asambleas programadas (función SQL predict_capacity_needs)
30 Ene | ✅ RESUMEN_SESION_30_ENE_2026.md creado (resumen ejecutivo completo)
30 Ene | ✅ Gráficas de vista rápida diseñadas (Ingresos, Recursos, Heatmap, Gauge)
30 Ene | ✅ Validación: FASE 05 lista para iniciar implementación por Coder
30 Ene | ✅ APROBADO POR HENRY: Iniciar FASE 05 (Votación + Vista Monitor)
30 Ene | 🚀 Henry informa al Coder para comenzar implementación inmediata
30 Ene | ✅ COMPARACION_DASHBOARDS_MONITOR.md creado (validación dashboards Henry vs Admin PH)
30 Ene | ✅ VALIDACION_PREDICCION_UNIDADES.md creado (confirma sincronización con unidades)
30 Ene | ✅ Sistema predice basado en USUARIOS CONCURRENTES, no solo cantidad asambleas
```

### 🗄️ DATABASE - Últimos Avances:
```
06 Feb 2026 | ✅ Script 100_resident_abandon_events.sql ejecutado en BD. Tabla resident_abandon_events creada. QA puede revalidar §E. Reportado en ESTATUS_AVANCE y QA_FEEDBACK.
Feb 2026 | ✅ Tabla resident_abandon_events (§E): 100_resident_abandon_events.sql + INSTRUCCIONES_CODER_ABANDONO_SALA.md. Reportado en QA_FEEDBACK y ESTATUS_AVANCE.
Feb 2026 | ✅ Residentes demo en BD: auth_otp_local.sql + seeds_residentes_demo.sql (residente1@…residente5@demo.assembly2.com, role RESIDENTE). Reportado en QA_FEEDBACK.md y ESTATUS_AVANCE.
30 Ene | ✅ Revisión y aprobación Arquitectura VPS All-in-One
30 Ene | ✅ VEREDICTO_DBA_ARQUITECTURA_VPS.md con validación técnica
30 Ene | ✅ Recomendaciones: PgBouncer, work_mem, backup, rate limiting
30 Ene | ✅ Scripts RLS multi-tenant creados
```

### 💻 CODER - Últimos Avances:
```
26 Ene 2026 | ✅ §F §G §H (Marketing): Botones por estado asamblea (Votación/Tema solo si activa), Ceder poder inline con validación correo, perfiles demo (activa/programada/sin_asambleas) y mensaje "No hay asambleas programadas... ¿Consultar con el administrador?". API /api/assembly-context. Landing y /chat.
26 Ene 2026 | ✅ Respuesta dentro del chatbot: Votación, Asambleas, Calendario, Tema del día, Ceder poder y botón votar responden en el chat con cards/mensajes (sin navegar a landings). Aplicado en landing (modal) y /chat.
26 Ene 2026 | ✅ UX Chatbot residente (Marketing): sesión en localStorage, "Volver al chat" (/chat), ACTIVA/PROGRAMADA en asambleas, página /chat full-screen, pills debajo mensaje/encima input.
26 Ene 2026 | ✅ Build y tipos React: devDependencies instaladas con npm install --include=dev; todos los Dockerfiles actualizados; npm run build pasa (Next 15, Suspense useSearchParams, Stripe apiVersion, rutas API).
Feb 2026 | ✅ FASES 9, 10 y 11 COMPLETADAS: Métodos de pago (Stripe + manual), Demo sandbox, Lead Validation
Feb 2026 | ✅ FASE 09: create-checkout, webhook Stripe, /checkout, migración 010 (manual_payment_requests, invoices)
Feb 2026 | ✅ FASE 10: /demo, DemoBanner, login ?demo=1, migración 011 (suscripción DEMO + asamblea), script reset-demo-sandbox
Feb 2026 | ✅ FASE 11: tabla platform_leads (012), API GET/PATCH /api/leads, CRM leads desde BD, chatbot /registrarme guarda en platform_leads
Feb 2026 | ✅ FASE 08 COMPLETADA 100%: Precios v4.0 + Límites + Créditos FIFO + UI + Tests manuales
Feb 2026 | ✅ Reporte formal al Contralor en ESTATUS_AVANCE.md (FASES A-E)
02 Feb | 🔄 FASE 5 iniciada: Vista Monitor + Presentación
02 Feb | ✅ FASE 5 completada: Monitor + Presenter + APIs backend (polling)
02 Feb | ✅ API: /api/monitor/summary, /api/monitor/units, /api/presenter/token, /api/presenter/view
02 Feb | ✅ SQL: presenter_tokens listo (modo demo si assemblyId no es UUID)
02 Feb | ✅ FASE 5 artefactos: asambleas, temas y flujo de votos (localStorage)
02 Feb | 🔄 FASE 6 avance: actas automáticas + export CSV/Excel + firma digital
02 Feb | 🔄 FASE 7 iniciada: Dashboard Admin Plataforma (Henry)
26 Ene | ✅ FASE 4 completada (owners, assemblies, votations, acts, reports, team, settings, support + permisos)
26 Ene | ✅ QA FASE 4 listo: instrucciones en QA/QA_FEEDBACK.md
26 Ene | ✅ FASE 4 iniciada: dashboard Admin PH (shell, sidebar, home KPIs)
1 Feb | ✅ Dashboard Admin PH actualizado (layout, sidebar y nuevas secciones)
30 Ene | ✅ Observaciones QA FASE 1-2 corregidas
30 Ene | ✅ FASE 3 COMPLETADA - Login OTP 100% funcional
31 Ene | ✅ API /api/chatbot/config conectada a PostgreSQL
31 Ene | ✅ Página /platform-admin/chatbot-config funcional (GET/PUT)
31 Ene | ✅ SQL chatbot_config aplicado en DB
31 Ene | ✅ Docker Postgres en puerto 5433
31 Ene | ✅ Rutas residentes conectadas a acciones rápidas
29 Ene | ✅ Landing Page completada (page.tsx - 1,116 líneas)
29 Ene | ✅ Login OTP implementado (login/page.tsx - 402 líneas)
29 Ene | ✅ Git & Backup configurado
       | ✅ FASE 4 COMPLETADA - Validada por Contralor
       | ⏳ ESPERANDO: Aprobación QA → Iniciar FASE 5
```

### ✅ QA - Últimos Avances:
```
30 Ene | ✅ FASES 1-2-3 APROBADAS (Coder corrigió observaciones)
30 Ene | 📝 QA_FEEDBACK.md - Veredicto FASES 0-3:
       |    ✅ Arquitectura y base legal alineadas con Ley 284
       |    ✅ Login funcional (Docker Local VPS)
       |    ✅ Landing corregida
       |    ✅ Chatbot verificado
30 Ene | 📝 QA_FEEDBACK.md - Instrucciones FASE 4:
       |    ✅ Acceso http://localhost:3000/dashboard/admin-ph
       |    ✅ Permisos: localStorage/assembly_admin_ph_role según instrucciones
       |    ✅ Revisar las 8 secciones y visibilidad de equipo
       |    ✅ Validar UI/UX vs arquitectura antes de aprobar
30 Ene | 📝 CHECKLIST_MEJORAS_UI_UX.md (1,205 líneas) - Para FASE 4+
30 Ene | 📝 CHECKLIST_QA_TAREA_2.md - Chatbot auditado
29 Ene | ✅ FASE 0 aprobada (Git & Backup)
       |
       | ⚠️ NOTA: Error "Database error finding user" ya NO APLICA
       |    Era de Supabase Cloud. Ahora usamos Docker Local VPS.
       |
       | 📋 VEREDICTO QA POR FASE:
       | FASE 0: ✅ APROBADA
       | FASE 1: ✅ APROBADA (observaciones corregidas)
       | FASE 2: ✅ APROBADA (checklist verificado)
       | FASE 3: ✅ APROBADA (login funcional - Docker VPS)
30 Ene | 📝 QA_FEEDBACK.md · Fase 4 validada
       |    ✅ Navegación 8 secciones verificada
       |    ✅ Equipo/permisos visibles con localStorage/cookie
       |    ✅ UI/UX coherente con arquitectura
30 Ene | 📝 QA_FEEDBACK.md · Fases 5-6-7 aprobadas
       |    ✅ FASE 5: Votación + Monitor validado
       |    ✅ FASE 6: Actas y Reportes aprobado
       |    ✅ FASE 7: Dashboard Henry aprobado (monitoring/clients/business)
```

### 📢 MARKETING - Últimos Avances:
```
Feb 2026 | ✅ T12 Implementado – Integración abandono–quórum: Presentes excluyen abandonos; tablero muestra en gris a quien abandonó; estado "Quórum perdido" si tras abandonos no se alcanza; export Excel/PDF con mismo criterio. Indicador "Chatbot · Asistencia activa" en Monitor de Quórum. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md § Abandono de sala.
Feb 2026 | 📋 Voto por tema – lógica colores (Henry): Grid vs resumen desincronizados, Ausente/En mora mismo color, naranja con voto debería ser verde, gris con voto (Ley 284), % vs conteos, voto manual en SI/NO/ABST. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Voto por tema y chatbot – Lógica de colores". **Para Coder:** corregir según prioridades.
Feb 2026 | 📋 Tipos asamblea y mayorías Ley 284 (Henry): Lista tipos (Ordinaria/Extraordinaria), quién convoca (Junta/20% propietarios), % por tema (51% presupuesto, 66% cambio cuotas, etc.). Incluir en formulario (seleccionar tipo aprobación por tema), dashboard (indicadores %), zona Q&A. Ver Marketing/MARKETING_TIPOS_ASAMBLEA_Y_MAYORIAS_LEY284.md. **Para Coder:** implementar según prioridades.
Feb 2026 | 📋 Acta referencia + Número finca y Cédula (Henry): Revisada acta PH Quintas del Lago. Número de finca y cédula de titulares son importantes para actas completas. Lista de presentes: unidad, finca, propietario, representado por, %. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md §4. Listado residentes debe incluir estos campos. T13 agregada.
Feb 2026 | 📋 INSTRUCCIÓN CODER – Listado Propietarios/Residentes: Objetivo: Admin PH tenga información correcta para asambleas, quórum, convocatorias, actas. Mejoras: Estado Al Día/En Mora visible, Nombre, filtros/búsqueda, botón + con límite, acciones consistentes, HAB. ASAMBLEA. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Listado Propietarios/Residentes – Instrucciones para el Coder".
Feb 2026 | 📋 Abandono de sala – integrar con quórum (Henry): Quien abandona debe dejar de contar como presente; recalcular quórum; alertar si se pierde. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md § Abandono de sala. T12.
Feb 2026 | 📋 Monitor Quórum – Botones, asistencia y apertura (Henry): (1) Botones NO "aprobada" → "Registrar primera/segunda convocatoria". (2) Al abrir Monitor Quórum: activar asistencia en chatbot; residente entra (QR o link) → registrar asistencia → reflejar en tablero. (3) Apertura sala: 30 min o 1h antes de primera convocatoria. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md § Monitor Quórum. T9–T11 agregadas.
Feb 2026 | 📋 Monitor Quórum – nombre asamblea no visible (Henry): Al abrir Monitor de Quórum (ej. Demo), no se muestra el nombre de la asamblea. Recomendación: mostrar "Monitor de Quórum · Demo" (o título de asamblea) en el encabezado. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. **Para Coder:** implementar.
Feb 2026 | 📋 Monitor Back Office + cronograma (Henry): (1) Botón Quórum primero, Votación segundo. (2) Cronograma: Quórum → (opc.) Aprobar orden día → Explicación + votación temas. "Aprobar orden día" opcional (votación / pregunta general / aprobación tácita). Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md § Monitor Back Office. T7–T8 agregadas.
Feb 2026 | 📋 Mejoras creación asambleas (Ley 284): Objetivo: herramienta completa para administradores. Validación plazos (Extraordinaria 3-5 días, Ordinaria 10-20 días), campo Orden del día obligatorio, advertencia segundo llamado, formato dd/mm/aaaa. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md. **Para Contralor:** asignar al Coder según prioridades del documento.
Feb 2026 | 📋 Vista gráfica Casilla Unidades (Monitor): Henry/Marketing – Leyenda incompleta (icono candado no explicado), iconos combinados confusos (voto manual + SI/NO + abstención), Abstención vs leyenda (verde+punto vs gris), redundancia candado+En mora. Sugerencias: R9 Leyenda completa, R10 Reglas iconos combinados, R11 Clic casilla→modal. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Vista gráfica – Casilla Unidades". **Para Contralor:** asignar al Coder según prioridad (R9 alta, R10 media, R11 opcional).
Feb 2026 | 📋 Dashboard Admin PH – instrucciones refinadas (Henry): (1) Dashboard más simple al entrar: solo icono Dashboard, icono Suscripción y lista de PHs. (2) Iconos de la barra lateral mal – corregir. (3) Barra lateral debe ocultarse para tener más espacio. Reglas R4b, R6, R6b agregadas. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. Bloque Para CODER actualizado.
Feb 2026 | 📋 Observaciones Dashboard Admin PH (Henry): Suscripción confusa, sin botón Volver al Dashboard, plan actual poco visible, falta lista de PHs, sidebar siempre visible, flujo de entrada no simple. Reglas R1–R8 definidas. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. **Para Contralor:** revisar reglas y asignar tareas al Coder según prioridad.
Feb 2026 | 📋 Consulta planes múltiples (Henry): ¿Un admin puede tener varios planes de un solo uso O planes de suscripción a la vez? (ej. Standard + Evento Único extra, o 2× Evento Único). Documento Marketing/MARKETING_CONSULTA_PLANES_MULTIPLES_ADMIN.md. **Para Arquitecto y Contralor:** definir regla de negocio y documentar.
Feb 2026 | ✅ ARQUITECTO revisó consulta planes múltiples: Respuesta en Arquitecto/RESPUESTA_ARQUITECTO_PLANES_MULTIPLES_ADMIN.md. Recomienda Opción A (un plan/org) para MVP o Opción B (suscripción base + créditos pago único). Carrito unificado apoyado. Contralor/Henry deciden A o B.
07 Feb | 📋 Chatbot más inteligente (Henry): Residente validado escribe "¿Qué más hay?" o "ya estoy registrado" y el chatbot responde "No encuentro ese correo" (no razona). Sugerencia: ramificar lógica por estado; cuando residentEmailValidated + chatStep ≥ 8, NO tratar texto como email; llamar a Gemini con contexto. Crear POST /api/chat/resident, verificar GEMINI_API_KEY, actualizar base de conocimiento. Ver Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md. BASE_CONOCIMIENTO actualizada con TEMA 4B (residente validado – preguntas en contexto).
07 Feb | 📋 §K (Henry): En /residentes/chat tras cerrar sesión: NO mensaje "Califica leads y ofrece demos"; usar "Soy Lex, chatbot para asambleas de PH (propiedades horizontales)". NO mostrar los 4 botones de perfil (Admin/Junta/Residente/Demo); solo flujo residente. Botones de perfil solo en landing. Ver Marketing §K y rec 14.
26 Feb | ✅ UX chatbot: (6) Lógica botones: Votación/Tema del día solo si asamblea activa; Asambleas/Calendario/Ceder poder siempre. (7) Ceder poder: formulario inline en chat. (8) Validación demo: perfiles asamblea activa, programada, pre-registro, sin asambleas ("¿Consultar con admin?"). Ver §F, §G, §H.
26 Feb | ✅ UX chatbot: (5) Cerrar sesión en lugar de "Volver a landing"; alerta abandono; registro hora para Admin PH. Ver Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §E.
26 Feb | ✅ UX chatbot: (3) Mostrar correo, nombre y número de unidad en el chat. (4) Votación/Asambleas/Calendario: responder DENTRO del chat (cards/mensajes inline), no redirigir a landing externa. Ver Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §C y §D.
26 Feb | ✅ UX chatbot: (1) Separación Landing vs /chat: landing para ventas, /chat para usuarios existentes. (2) Botones dentro del chat: pills integrados (ref. TAVIQ). Actualizado Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md.
26 Feb | ✅ UX navegación residente: sesión se pierde al ir a /residentes/* y volver; "Volver a la landing" pide re-ingresar correo; badges ACTIVA/PROGRAMADA sin función. Reporte Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md. Recomendaciones: persistir sesión residente en localStorage, función lógica en tarjetas asambleas.
26 Feb | ✅ Hallazgo lógica chatbot residente: botones se muestran aunque email NO validado. Reporte en Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md. Instrucciones Coder en INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md §2.
31 Ene | ✅ Estrategia B2B Premium: Standard ($189), Multi-PH ($699), Enterprise ($2,499)
31 Ene | ✅ Política Anti-Abuso y Sistema de Créditos Acumulables
31 Ene | ✅ Lógica de ROI y Realismo de Datos para Landing Page
31 Ene | ✅ Instrucciones de Pulido para Chatbot Residente
29 Ene | ✅ Copy de landing page finalizado
29 Ene | ✅ Precios v3.0 definidos
```

### 👔 CONTRALOR - Últimas Auditorías:
```
Feb 2026 | 📋 REPORTE MARKETING – Monitor Quórum (botones, asistencia, apertura): Botones sin "aprobada"; activar asistencia en chatbot al abrir Quórum; QR/link para registrar; apertura sala 30 min o 1h antes. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md § Monitor Quórum. T9–T11.
Feb 2026 | 📋 REPORTE MARKETING – Mejoras creación asambleas (Ley 284): Validación plazos (Extraordinaria ≥3 días, Ordinaria ≥10 días), Orden del día obligatorio, advertencia segundo llamado, formato fecha, modo Presencial/Virtual/Mixta. Ver Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md. **Contralor:** asignar al Coder. Prioridad: T1-T3 alta, T4-T5 media.
Feb 2026 | 📋 REPORTE MARKETING – Vista Casilla Unidades (Monitor): Leyenda incompleta (candado no explicado), iconos combinados confusos, Abstención vs leyenda, redundancia candado+En mora. Reglas R9–R11 sugeridas. Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Vista gráfica – Casilla Unidades". **Contralor:** asignar al Coder según prioridad (R9 alta, R10 media, R11 opcional).
Feb 2026 | 📋 REPORTE MARKETING – Observaciones Dashboard Admin PH: 7 observaciones (suscripción confusa, sin Volver al Dashboard, plan poco visible, falta lista PHs, sidebar fija, flujo entrada). Reglas R1–R8 definidas en Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. **Contralor:** revisar reglas y asignar al Coder según prioridad (R1–R3 alta, R4 alta, R8 media).
30 Ene | ✅ Fases de monetización agregadas (7-11)
30 Ene | ✅ Métodos de pago actualizados (Stripe/PayPal/Yappy/ACH/Tilopay)
30 Ene | ✅ Actualización de perfiles de agentes (VPS All-in-One)
30 Ene | ✅ Gestión de costos actualizada v3.0
30 Ene | ✅ Diagnóstico bloqueador login OTP
30 Ene | ✅ Plan de trabajo por fases creado
30 Ene | ✅ Contralor confirma avance QA: etapas 2 y 3 aprobadas; autorizada Fase 04 (Chatbot).
30 Ene | ✅ Decisión Contralor (QA_FEEDBACK): validación residente en chatbot → Opción B (aceptar residente1@…residente5@demo.assembly2.com en front; sin API). Coder: implementar en page.tsx.
30 Ene | ✅ Coder finalizó Opción B (validación residente en chatbot). Siguiente: QA revalidar reconocimiento de correo y botones.
30 Ene | ✅ QA revalidación chatbot Opción B completada y aprobada (QA_FEEDBACK.md). Siguiente tarea: Contralor backup (cuando Henry autorice) o QA validación manual 4.1–4.7.
30 Ene | ✅ Backup ejecutado (commit a76fb32). Henry autorizó. Push a GitHub completado (main -> main).
30 Ene | ✅ Incluido Marketing: validar dashboard Henry (información correcta, aspecto visual inteligente). Instrucción en ESTATUS_AVANCE.
30 Ene | ✅ Marketing entregó informe MARKETING_VALIDACION_DASHBOARD_HENRY.md con instrucciones explícitas para Coder (layout, sidebar, enlaces, Clients BD, datos reales, precios VPS, tildes). Siguiente: Coder ejecuta.
30 Ene | ✅ Informe Marketing MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md validado. Arquitecto actualizó FLUJO_IDENTIFICACION_USUARIO.md (regla: botones residente solo cuando residentEmailValidated). Coder puede proceder con corrección en page.tsx.
30 Ene | ✅ Informe Marketing MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md confirmado (sección A Landing vs Chat, sección B Botones en chat, rec 5 y 6 para Coder). Instrucción para Coder en ESTATUS_AVANCE.
30 Ene | ✅ Contralor valida: QA reportó que botón de abandono de sala (§E) no está implementado correctamente (QA_FEEDBACK 06 Feb). Acción: Coder + Database implementar según QA_FEEDBACK.md.
30 Ene | ✅ Contralor valida respuesta Coder §E: implementación coherente con QA_FEEDBACK, INSTRUCCIONES_CODER_ABANDONO_SALA.md y Marketing §E. Pendiente: ejecutar 100_resident_abandon_events.sql en la BD si la tabla no existe (si no, POST devuelve 500).
```

---

## ▶ SIGUIENTE PASO (al cierre de este documento)

---

### 📌 PARA HENRY – ¿En qué fase estamos? (del 1 al 10, en términos simples)

**Escala 1 a 10:** Estamos en **8,5 / 10**.

- **Del 1 al 8** ya está hecho: Landing, Chatbot, Login OTP, Dashboard Admin PH, Votación y Monitor, Actas y Reportes, Dashboard Henry, Precios y Suscripciones, Métodos de Pago, Demo, Lead Validation, backup y pulido del chatbot residente (Tarea 1). Todo eso está completado y aprobado por QA donde aplica.
- **Lo que falta para llegar al 10:**
  - **8,5 → 9:** Tarea 2 (QA revalide §E o chatbot) y Tarea 3 (Coder §F, §G, §H: botones por asamblea activa, Ceder poder en chat, validación demo). Son pulidos del chatbot y validación.
  - **9 → 10:** FASE 12 – Docker local al 100 % (ahora ~40 %) y FASE 13 – Deploy en VPS (producción). Con eso el proyecto queda listo para uso real.

**Resumen:** Casi todo el producto está. Tareas 2 y 3 dadas por finalizadas (05 Feb 2026). Falta: ejecutar backup (cuando Henry autorice), luego terminar Docker (FASE 12) y deploy VPS (FASE 13). Las revisiones continúan más tarde.

---

### 📌 PARA HENRY – Siguiente paso (Contralor te explica)

**Qué hay ahora mismo:**  
- **Tarea 1** (Coder – lógica chatbot residente) está hecha: los botones del residente solo se muestran cuando el correo está validado; si no, el bot dice "No encuentro ese correo... Puedes escribir otro correo para reintentar" y no se muestran botones.  
- **Backup** ya está hecho (commit 5c94eb5 en GitHub).

**Estado actual:** Tareas 1, 2 y 3 dadas por **finalizadas** (05 Feb 2026). Siguiente: **autorizar backup** (Contralor ejecuta commit + push). Las **revisiones** se retoman más tarde.

---

### 📌 COORDINACIÓN PRÓXIMA TAREA (QA informa – 07 Feb 2026)

**Resumen QA:** Plan completo + §J/rec 14 ✅. Face ID (TAREA 5) parcial: código OK, APIs 500 por columna `face_id_enabled` faltante en BD.

**Orden sugerido de tareas:**

| # | Agente | Tarea | Instrucción |
|---|--------|-------|-------------|
| 1 | **Coder** | **Login residente → Admin PH** | Residente (ej. residente2@) entra al dashboard Admin PH. Añadir check role===RESIDENTE antes de is_demo en login/page.tsx → redirect /residentes/chat. **Prioridad crítica** – fallo de seguridad/permisos. |
| 2 | **Coder** | **Bug verify-otp chatbot** | Corregir `res.ok` fuera de scope en chat/page.tsx y page.tsx. Ver bloque "Para CODER (bug verify-otp chatbot residente)" más abajo. **Prioridad alta** – bloquea login residente. |
| 3 | **Database** | Ejecutar script Face ID | `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/101_face_id_enabled_users.sql` (si no ejecutado) |
| 4 | **QA** | Revalidar Face ID | Tras script 101: probar GET/PUT admin-ph/residents, resident-profile; reportar en QA_FEEDBACK |
| 5 | **Coder** | Botón retorno Platform Admin | Añadir "← Volver al Dashboard" en monitoring, clients, business, leads, chatbot-config, crm (ref. tickets/[id]/page.tsx) |
| 5 | **Coder** | Chatbot más inteligente + Gemini **(orden Marketing 07 Feb 2026)** | Ramificar lógica: residente validado + texto libre → llamar API chat con Gemini (no validar email). Crear POST /api/chat/resident. Ver bloque "Para CODER – Chatbot más inteligente con Gemini (orden Marketing 07 Feb 2026)" y Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md. |
| 6 | **Coder** | §K Mensaje y botones /residentes/chat **(orden Marketing 07 Feb 2026)** | En /residentes/chat: mensaje "chatbot para asambleas de PH" (no "Califica leads"); NO mostrar 4 botones perfil; solo flujo residente. Ver bloque "Para CODER – §K" y Marketing §K. |

**Prioridad inmediata:** Bug verify-otp – el residente no puede completar login en chatbot aunque el PIN sea correcto.

**Referencias:** QA/QA_FEEDBACK.md (§ Face ID, § Plan completo, § Error PIN). Contralor asigna según disponibilidad de agentes.

---

### Para CODER – Chatbot más inteligente con Gemini (orden Marketing 07 Feb 2026)

```
Eres el Coder. Orden del Contralor: Implementar chatbot más inteligente para residentes validados, con razonamiento vía Gemini.

PROBLEMA: Cuando el residente ya está validado (residentEmailValidated, chatStep ≥ 8) y escribe texto libre ("¿Qué más hay?", "ya estoy registrado", etc.), el chatbot responde "No encuentro ese correo" porque trata todo texto como intento de validar email.

TAREAS:
1. Ramificar handleChatSubmit: Si residentEmailValidated && chatRole === "residente" && chatStep >= 8, NO tratar el mensaje como email. En su lugar, llamar a una API de chat (POST /api/chat/resident o similar) que use Gemini.

2. Crear API POST /api/chat/resident:
   - Entrada: { message: string, context: { email, organizationId, assemblyContext, temaActivo, residentProfile, ... } }
   - Incluir en el prompt: base de conocimiento para residentes (Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md – PERFIL 5, TEMA 4B)
   - Llamar a Gemini (Google AI) con mensaje + historial reciente
   - Devolver respuesta generada

3. Verificar/configurar GEMINI_API_KEY en variables de entorno. Validar que la API responde.

4. En el prompt a Gemini: indicar que el usuario está validado; NO pedir correo. Si pregunta "¿Qué más hay?", "ya estoy registrado", responder según TEMA 4B (opciones Votación, Asambleas, etc.).

Referencia: Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md. Base de conocimiento actualizada: Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md (TEMA 4B). Al finalizar, confirmar al Contralor.
```

**Validación Contralor – Respuesta Marketing (instrucción al Coder):** ✅ **Validada.** Marketing indicó la instrucción al Coder. Contralor la registra aquí. El Coder debe: (1) Ramificar handleChatSubmit: si el residente está validado y envía texto libre, no usar el flujo de validación de email. (2) Crear POST /api/chat/resident que llame a Gemini con contexto. (3) Comprobar y configurar GEMINI_API_KEY. (4) Incluir en el prompt la base de conocimiento para residentes (PERFIL 5, TEMA 4B). Dónde: Marketing/MARKETING_SUGERENCIA_CHATBOT_INTELIGENTE_GEMINI.md y Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md. Al finalizar, Coder informa al Contralor.

**Reporte Coder – Tarea completada:** ✅ **Implementado.** API POST /api/chat/resident (Gemini, PERFIL 5 + TEMA 4B); rama en handleChatSubmit en `chat/page.tsx` y `page.tsx` cuando residentEmailValidated && chatStep ≥ 8. Variable GEMINI_API_KEY requerida. **Sugerencia al Contralor:** Asignar a QA validación según plan (prueba sugerida en QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § Chatbot Gemini).

---

### Para QA – Validación Chatbot más inteligente con Gemini (sugerida por Coder)
```
Responsable: QA.
Objetivo: Validar que el residente validado puede escribir texto libre y recibe respuesta de Lex (Gemini), no "No encuentro ese correo".
Plan: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md – sección "Prueba sugerida: Chatbot Gemini (residente validado + texto libre)".
Prerequisito: GEMINI_API_KEY configurada en el entorno (app o .env).
Al finalizar, QA informa al Contralor (resultado en QA_FEEDBACK.md).
```

---

### Para CODER – §K Mensaje y botones en página chatbot residentes (orden Marketing 07 Feb 2026)

```
Eres el Coder. Orden del Contralor: Corregir mensaje y botones en /residentes/chat según §K.

PROBLEMA: Tras cerrar sesión, el residente en /residentes/chat ve:
- Mensaje "Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos." (incorrecto para residentes)
- Los 4 botones de perfil (Administrador PH, Junta Directiva, Residente, Solo demo) visibles

TAREAS:
1. En /residentes/chat: Cambiar el mensaje inicial/bienvenida a "Soy Lex, chatbot para asambleas de PH (propiedades horizontales)." (o similar). NO usar "Califica leads y ofrece demos". Este mensaje al validar usuario o al cargar la página de residentes.
2. En /residentes/chat: NO mostrar los 4 botones de perfil (Admin, Junta, Residente, Demo). Solo el flujo de residente: validar correo si no validado, o pills (Votación, Asambleas, etc.) si ya validado.
3. Los 4 perfiles (Admin, Junta, Residente, Demo) solo en la landing (/).

Referencia: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §K y recomendación 14. Al finalizar, confirmar al Contralor.
```

---

### Para CODER – Dashboard Admin PH: mejoras visuales y reglas (orden Marketing Feb 2026)

**Referencia obligatoria:**  
- **Contralor:** Este bloque en `Contralor/ESTATUS_AVANCE.md` (instrucción y estado Coder).  
- **Especificación detallada:** `Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md` (observaciones, reglas R1–R8, prioridades, planes de pago único).

```
Eres el Coder. Orden del Contralor: Aplicar mejoras UX del Dashboard Admin PH según observaciones de Henry.

📖 ESPECIFICACIÓN COMPLETA: Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md

REGLAS PRIORITARIAS (según Marketing):
R1 – Plan actual visible: Bloque/card fijo "Plan actual: [nombre] · X/Y asambleas · Z edificios" en perfil o cabecera.
R2 – Modificar suscripción: Botón/enlace "Modificar suscripción" visible en perfil o bloque de plan.
R3 – Botón Volver al Dashboard: En cada subpágina (Suscripción, Configuración, Asambleas, etc.) botón "← Volver al Dashboard" arriba.
R4 – Lista de PHs al entrar: Primera vista Admin PH = lista de PHs que administra. Clic en PH → dashboard de ese PH.
R4b – Dashboard simple: Al entrar mostrar SOLO icono Dashboard, icono Suscripción y lista de PHs. Sin elementos extra.
R6 – Sidebar ocultable: La barra lateral debe ocultarse para tener más espacio. Por defecto colapsada o solo iconos; botón para expandir/ocultar.
R6b – Iconos de la barra lateral correctos: Cada ítem con icono coherente (Dashboard, Suscripción, PHs, etc.). Mostrar nombre al pasar el mouse (tooltip).
R8 – Página Suscripción clara: Bloque "Tu plan actual" arriba; debajo, planes disponibles. Incluir planes de pago único (Evento Único, Dúo Pack).

Vista Casilla Unidades (Monitor): Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Vista gráfica – Casilla Unidades".
R9 – Leyenda completa: Incluir candado en leyenda y definir su significado.
Monitor Quórum – Nombre asamblea: Mostrar nombre de asamblea en encabezado (ej. "Monitor de Quórum · Demo" o "Monitor de Quórum · Asamblea Ordinaria 2026"). Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Monitor de Quórum – Nombre de asamblea".
Voto por tema (colores): Sincronizar grid con resumen; naranja=solo sin voto, verde=ya votó; Ausente/En mora sin icono voto (o "por poder"); % coherentes con SI/NO/ABST; voto manual dentro de SI/NO/ABST. Ver § "Voto por tema y chatbot – Lógica de colores".
R10 – Reglas iconos combinados: Documentar o simplificar combinaciones (voto manual + SI/NO + abstención).
R11 (opcional) – Clic en casilla → modal con detalle y acciones.

OPCIONAL: R5 Selector PH, R7 Menú agrupado.

PLANES DE PAGO ÚNICO: En Suscripción mostrar Evento Único, Dúo Pack y planes mensuales (ref. MARKETING_PRECIOS_COMPLETO.md). Opción "Agregar más residentes" (paquetes de unidades) en Suscripción y checkout para pago único.

🔴 BUG – BOTONES SECCIÓN ASAMBLEA (validar y corregir):
En el dashboard Admin PH (página resumen), los botones **Ver detalle**, **Iniciar asamblea** y **Monitor** no funcionan bien: llevan al dashboard PH resumen en lugar del destino correcto.
- **Ver detalle:** debe llevar a detalle de la asamblea (`/dashboard/admin-ph/assemblies/[id]` con id real).
- **Iniciar asamblea:** debe llevar a vista live de la asamblea (`/dashboard/admin-ph/assembly/[id]/live` con id real; no usar id hardcodeado 123).
- **Monitor:** debe llevar al Monitor de asamblea (`/dashboard/admin-ph/monitor/[assemblyId]`) para la asamblea en curso o seleccionada, no al resumen.
Usar id de asamblea real (desde "Próxima Asamblea" o lista de asambleas). Ver Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "BUG: Botones sección Monitor de asamblea".

**Coder – Botones corregidos (Feb 2026):** ✅ **Completado.** En el dashboard Admin PH (resumen): se obtiene la próxima asamblea desde `getAssemblies()` (primera no completada o primera de la lista); **Ver detalles** → `/dashboard/admin-ph/assemblies/[id]` (o lista si no hay asamblea); **Iniciar Asamblea** → `/dashboard/admin-ph/assembly/[id]/live`; **Monitor** → `/dashboard/admin-ph/monitor/[assemblyId]`. Se añadió el botón **Monitor** en la tarjeta "Próxima Asamblea". El título y fecha de la tarjeta muestran los datos de la próxima asamblea cuando existe. En la lista de asambleas (`/dashboard/admin-ph/assemblies`): **Ver detalles**, **Iniciar asamblea** (vista live) y **Monitor** usan el `id` real de cada ítem. Sin id hardcodeado (123).

Al finalizar, informar al Contralor en ESTATUS_AVANCE (este bloque).
```

**Coder – R1, R2, R3, R4, R8 aplicados (26 Ene 2026):** ✅ **Completado.** R1: bloque "Plan actual" visible en cabecera (AdminPhShell). R2: enlace "Modificar suscripción" en perfil → `/dashboard/admin-ph/subscription`. R3: botón "← Volver al Dashboard" en subpáginas (cuando pathname !== /dashboard/admin-ph). R4: primera vista = lista "Tus propiedades horizontales" (ej. Urban Tower PH); al elegir PH se muestra dashboard; "Cambiar PH" para volver a la lista. R8: página Suscripción con bloque "Tu plan actual" arriba y "Planes disponibles" debajo; enlace en sidebar "Modificar suscripciones". Informado al Contralor.

**Coder – R4b, R6, R6b y UX adicional (Feb 2026):** ✅ **Completado.** R4b: al entrar sin PH seleccionado solo se muestran en sidebar "Dashboard principal", "Modificar suscripciones" y "Tus propiedades"; al elegir un PH se habilitan Propietarios, Asambleas, etc. R6: sidebar colapsable con botón "◀ Ocultar" / "▶"; estado guardado en localStorage; por defecto colapsada (solo iconos). R6b: iconos SVG modernos por ítem (dashboard, document, building, users, calendar, vote, monitor, file, chart, team, settings, support); tooltip con el nombre del ítem al pasar el mouse cuando la barra está colapsada; contenedor 40×40 px para que los iconos no se estiren. Además: widgets del dashboard centrados (max-width 1000px/92vw); navegación "Dashboard principal" con Link (Next.js) a `/dashboard/admin-ph`; eliminado botón "Volver a landing"; opción "Agregar más residentes" (paquetes de unidades) en Suscripción y en checkout para Evento Único/Dúo Pack. Ref. Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md.

**Coder – Planes de pago único y alineación precios (validación Contralor):** ✅ **Completado.** (1) **Dashboard Admin PH · Suscripción:** Planes de pago único (Evento Único, Dúo Pack) visibles en `/dashboard/admin-ph/subscription`; debajo, planes por suscripción mensual (Standard, Multi-PH Lite, Multi-PH Pro, Enterprise). Fuente única: `src/lib/types/pricing.ts` (PLANS). (2) **Modificar suscripción:** Bloque "Tu plan actual" con "Ver planes pago único" y "Ver planes mensuales"; cada plan → `/checkout?plan=ID`. (3) **Landing y planes unificados:** Mismos planes en landing, /pricing y Suscripción Admin PH; CTA a checkout. (4) **Agregar más residentes:** Sección en Suscripción y página `/dashboard/admin-ph/subscription/units-addon`; en checkout (Evento Único/Dúo Pack) opción "Agregar límite de residentes" (+100, +200, +300) y total antes de Comprar.

**Coder – Validación botón "Subir a plan real", contadores demo y reporte (Feb 2026):** ✅ **Completado.** (1) **Botón "Subir a plan real":** Lógica validada: enlace a `/pricing?from=demo` desde DemoBanner cuando el usuario está en modo demo (query `mode=demo` o `assembly_organization_id` = org demo). (2) **Contadores sincronizados para usuario demo:** Para **demo@assembly2.com** (plan DEMO, 50 unidades): Dashboard Admin PH muestra **50 propietarios** en lista de PH, KPIs y tarjeta de perfil ("50 propietarios · 1 asamblea disponible"); Monitor (ruta `/dashboard/admin-ph/monitor/demo`) muestra **50 unidades** desde el mock (`lib/monitoringMock.ts`: cuando `assemblyId === "demo"` se usan 50 unidades en lugar de 311). Así dashboard y monitor quedan alineados a 50 para el usuario demo. (3) **Reporte al Contralor:** Este bloque. (4) **Para QA:** Ver bloque "Para QA – Probar con usuario demo@assembly2.com" más abajo.

---

### Para CODER – Mejoras creación asambleas (Ley 284, orden Marketing Feb 2026)

```
Eres el Coder. Orden del Contralor: Implementar mejoras en el formulario de creación de asambleas para cumplir Ley 284 (Panamá) y ofrecer una herramienta completa a los administradores.

✅ Respuesta Marketing validada por Contralor. Especificación actualizada: Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md (incluye T6 – Acta inmediata y acta legal).

📖 ESPECIFICACIÓN: Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md

TAREAS PRIORITARIAS (alta):
T1 – Validación plazos: Si Extraordinaria → fecha asamblea ≥ 3 días después de creación. Si Ordinaria → ≥ 10 días después. Mensaje claro si no cumple; sugerir fecha mínima válida.
T2 – Campo obligatorio Orden del día (agenda): textarea o lista de temas. Ayuda: "Solo pueden votarse temas incluidos en el orden del día (Ley 284)."
T3 – Advertencia segundo llamado: checkbox pre-marcado o texto fijo: "Si no se alcanza el quórum, segundo llamado 1h después válido con presentes al día."
T6 – Acta inmediata: al finalizar votaciones, emitir acta resumen con resultados por tema + unidades y su voto (SI/NO/ABST). Indicar: "Acta legal se enviará en plazo Ley 284 (máx. 10 días)." Acta legal formal tras revisión legal y firma.
T7 – Monitor Back Office: botón Quórum primero, Votación segundo (flujo: validar quórum antes de votar).
T8 – Cronograma asamblea: Quórum → (opc.) Aprobar orden día → Explicación + votación temas. "Aprobar orden día" opcional (votación / pregunta general / aprobación tácita).
T9 – Botones convocatoria: NO "aprobada". Usar "Registrar primera convocatoria" / "Registrar segunda convocatoria".
T10 – Al abrir Monitor Quórum: activar asistencia en chatbot. Residente entra (QR o link) → registrar asistencia → reflejar en tablero.
T11 – Apertura sala: configurable 30 min o 1h antes de primera convocatoria. Campo en asamblea; habilitar registro a la hora de apertura.
T12 – Abandono de sala: integrar con quórum. Quien abandona deja de contar como presente; recalcular quórum; alertar si se pierde. ✅ Implementado. Indicador "Chatbot · Asistencia activa" en Monitor Quórum.

TAREAS (media):
T4 – Formato dd/mm/aaaa, hora 24h; validar fecha futura.
T5 – Campo Modo: Presencial / Virtual / Mixta. Si Virtual/Mixta: campo enlace (Zoom, Meet, etc.).

Referencia: Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md. Al finalizar, informar al Contralor.
```

---

### Para CODER – Listado Propietarios/Residentes (orden Marketing Feb 2026)

```
Eres el Coder. Orden del Contralor: Mejorar el listado de Propietarios/Residentes para que el cliente Admin PH tenga información correcta y completa para gestionar asambleas, quórum, convocatorias y actas.

📖 ESPECIFICACIÓN: Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md § "Listado Propietarios/Residentes – Instrucciones para el Coder"

OBJETIVO: Que el Admin PH disponga de datos precisos para:
- Convocatorias y quórum (residentes Al Día pueden votar; En Mora solo voz).
- Actas (nombres, unidades, estado).
- Límites del plan (residentes máximos).

TAREAS (prioridad alta):
- Estado Al Día / En Mora visible en columna ESTATUS (no guiones).
- Columna NOMBRE del residente.
- **Número de finca** (folio real) y **Cédula de identidad** – requeridos para actas completas (ref. acta PH Quintas del Lago).
- Filtros y búsqueda por correo, unidad, nombre; filtrar por Al Día/En Mora, Face ID, Hab. asamblea.

TAREAS (prioridad media):
- Botón + con límite alcanzado: deshabilitar o mensaje "Límite alcanzado. Actualice su plan."
- Acciones consistentes por fila (Ed. rápida, Plantilla, Eliminar, Soporte).
- Aclarar HAB. ASAMBLEA con ayuda contextual.

Referencia: Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md. Al finalizar, informar al Contralor.
```

---

### Para CODER – Crear .cursorignore para estabilidad de Cursor (orden Contralor Feb 2026)

**ESTADO: ✅ COMPLETADO** (Ene 2026)

```
Eres el Coder. Orden del Contralor: Crear archivo .cursorignore en la raíz del proyecto para reducir la carga de indexación y mejorar estabilidad del editor (tras reporte de crash).

TAREA: Crear .cursorignore con:
node_modules/
.next/
.npm-cache/
out/
build/
*.log
.DS_Store

📖 ESPECIFICACIÓN: Coder/INSTRUCCIONES_CURSORIGNORE_ESTABILIDAD.md

Al finalizar, informar al Contralor.
```

---

### Para CODER – Tipos asamblea y mayorías Ley 284 (orden Marketing Feb 2026)

```
Eres el Coder. Orden del Contralor: Incluir tipos de asamblea y % de aprobación por tema según Ley 284 en formularios, dashboard y zona Q&A.

📖 ESPECIFICACIÓN: Marketing/MARKETING_TIPOS_ASAMBLEA_Y_MAYORIAS_LEY284.md

TIPOS DE ASAMBLEA: Ordinaria (10-20 días anticipación), Extraordinaria (3-5 días). Quién convoca: Junta/Presidente, o 20% propietarios al día (judicialmente).

MAYORÍAS POR TEMA:
- Presupuesto, cuota extraordinaria, proyectos (remodelación, pintura): 51% unidades al día.
- Cambio estructura cuotas: 66%.
- Elección Junta Directiva: mayoría simple por cargo.
- 2ª convocatoria (cuotas): 30%.

TAREAS:
1. Formulario crear asamblea: por cada tema, campo "Tipo de aprobación" (51%, 66%, informativo). Sugerencia según nombre tema.
2. Monitor votación: mostrar "Requiere X% a favor" por tema; indicador en tiempo real.
3. Zona Q&A o chatbot: preguntas sobre tipos de asamblea y % por tema.

Referencia: Marketing/MARKETING_TIPOS_ASAMBLEA_Y_MAYORIAS_LEY284.md. Al finalizar, informar al Contralor.
```

---

### Para QA – Probar con usuario demo@assembly2.com (Feb 2026)

```
Responsable: QA.
Objetivo: Validar Dashboard Admin PH y Monitor con el usuario demo, verificando que los contadores estén sincronizados (50 residentes/propietarios en dashboard y 50 unidades en Monitor).

Usuario a usar: demo@assembly2.com (plan DEMO, 50 unidades).
Referencia: QA/PLAN_PRUEBAS_DASHBOARD_ADMIN_PH_USUARIOS_DEMO.md (Fase 1–3). Este usuario es el #1 de la tabla (DEMO, 50).

Validaciones solicitadas:
1. Login con demo@assembly2.com + OTP → redirección a /dashboard/admin-ph.
2. En "Tus propiedades horizontales": el PH debe mostrar "1 edificio · 50 propietarios (demo)".
3. En la tarjeta de perfil (Plan actual): debe decir "50 propietarios · 1 asamblea disponible".
4. KPIs del dashboard (modo demo): Propietarios activos = 50; Face ID activo coherente con 50.
5. Ir a Monitor (sidebar → Monitor o /dashboard/admin-ph/monitor/demo): debe mostrar 50 unidades en la vista, no 311.
6. Botón "Subir a plan real" (banner Modo demo): debe llevar a /pricing?from=demo.

Reportar resultado en QA_FEEDBACK.md. Contralor revisa tras el reporte.
```

---

### Para QA – Sincronización Residentes ↔ Monitor Back Office y Chatbot (Feb 2026)

```
Responsable: QA.
Objetivo: Validar que la información de residentes esté sincronizada con el Monitor Back Office y las asambleas; unidades unificadas 1 a 50; y flujo chatbot.

CONTEXTO (Contralor):
- Unidades demo unificadas a 1–50 en listado Propietarios y en Monitor (misma numeración: Unidad 1 … Unidad 50).
- Listado de residentes y Monitor comparten la misma fuente (store demo): nombres, estatus Al Día/Mora, Hab. asamblea.

📖 PLAN DE PRUEBAS: QA/PLAN_PRUEBAS_RESIDENTES_MONITOR_SINCRONIZACION.md

TAREAS PRINCIPALES:
1. Verificar numeración unificada: en Propietarios deben verse Unidad 1 … Unidad 50; en Monitor Back Office las mismas 50 unidades (códigos 1–50).
2. Verificar sincronización estatus: cambiar un residente a En Mora en Propietarios → en Monitor esa unidad debe reflejar Mora; igual al pasar a Al Día.
3. Borrar residentes y crear 1 x 1: restablecer listado demo, borrar uno (ej. Unidad 10), comprobar Monitor; agregar nuevo residente asignando Unidad 10, comprobar que el Monitor refleje el cambio. Repetir con otra unidad.
4. Probar chatbot: correos del listado (ej. residente1@demo.assembly2.com) deben ser reconocidos; probar correo no registrado; tras agregar residente nuevo, probar si el chatbot lo reconoce.
5. Otras pruebas sugeridas en el plan: export/import CSV, plantilla de unidad, Face ID, asambleas.

Usuario: demo@assembly2.com. Reportar en QA_FEEDBACK.md. Contralor revisa tras el reporte.
```

---

### Reporte Coder al Contralor – Últimos cambios Dashboard Admin PH y mejoras (Feb 2026)

**Informe consolidado (últimos cambios Ley 284, live, crear PH, etc.):** Ver **`Contralor/INFORME_ULTIMOS_CAMBIOS_FEB2026.md`** — resumen ejecutivo para control y trazabilidad (Monitor 50 unidades, filtro por tema, zona cuenta, Ley 284 T1–T6, unificación botones, vista Ver asamblea, pantalla Iniciar asamblea sin voto manual, crear propiedad horizontal). **Sección 11 del mismo informe:** sugerencia de plan al crear PH (pago único / mensual), chat de soporte como zona estratégica (widget flotante), página Soporte con chat de ayuda y tickets. **Arquitecto:** ver también `Arquitecto/REPORTE_CODER_SOPORTE_Y_SUGERENCIA_PLAN_FEB2026.md`.

**Resumen para Contralor (bloque histórico):** Se aplicaron mejoras de UX, tema claro, flujos de bitácora en Monitor y voto manual. Detalle:

**(1) Botón "Subir a plan real" y Modificar suscripción**
- El botón del banner demo **"Subir a plan real"** redirige a **Modificar suscripción** (`/dashboard/admin-ph/subscription`), no a la landing de precios, para que el admin pueda cambiar de plan desde el mismo panel.

**(2) Tema claro en todo el Dashboard Admin PH**
- **Tabla de planes (Suscripción):** Tarjetas de pago único y mensuales con fondo claro (gradiente #f8fafc / #f1f5f9), texto oscuro legible, bordes #e2e8f0. Misma línea visual que el resto del tema claro.
- **Actas:** Encabezado de tabla y filas con fondo claro; tarjeta "Vista previa de acta" (`.surface`) y botones con tonos claros.
- **Vista Monitor:** Contenedor del monitor, tarjetas de resumen (Total, Presentes, Votaron, En mora, Face ID), indicadores inferiores en Vista Unidades (`.grid-stats`), botones de vista y filtro de torre con tema claro aplicado en `layout.tsx` (selectores `html[data-theme="light"] .admin-ph-shell .admin-ph-content`).

**(3) Bitácoras desde el Monitor**
- **Abandonos de sala:** Botón en el Monitor que lleva a `/dashboard/admin-ph/monitor/[assemblyId]/abandonos`. Listado en tabla con Residente, Unidad, Email y **hora de abandono** (bitácora). Enlace "Dashboard principal" en la página limpia PH y lleva al dashboard principal.
- **Modificaciones de voto:** Botón que lleva a `/dashboard/admin-ph/monitor/[assemblyId]/modificaciones-voto`. Bitácora de cambios de voto (estructura lista; datos desde localStorage/API según disponibilidad). Mismo enlace "Dashboard principal".
- Navegación con `Link` (Next.js) y `encodeURIComponent(assemblyId)` para rutas correctas.

**(4) Vista Monitor – Una torre "Urban Tower PH" (50 residentes)**
- Cuando hay una sola torre con 50 unidades (modo demo), el selector muestra **"Urban Tower PH"** (50 unidades) en lugar de "Torre A / Torre B". Constante `BUILDING_NAME_SINGLE = "Urban Tower PH"`; opciones de torre derivadas de los datos cargados.

**(5) Exportar Excel y PDF**
- En la cabecera del Monitor: botones **"Exportar Excel"** y **"Exportar PDF"**.
- **Excel:** En Vista Resumen exporta indicadores y resultados de votación (CSV); en Vista Unidades exporta la lista de unidades (código, torre, propietario, presente, voto, método, mora) en CSV.
- **PDF:** `window.print()` para imprimir o guardar como PDF la vista actual.

**(6) Voto manual por el administrador**
- **Clic en la casilla de la unidad** en Vista Unidades abre un **modal** (ventana emergente).
- Modal: título **"Voto manual"** (si no había voto) o **"Modificar voto"** (si ya había voto). Opciones SI / NO / Abstención y campo **Comentario**.
- **Comentario obligatorio al modificar:** Si el residente ya tenía voto (o override previo), el comentario es obligatorio; si se guarda sin texto se muestra alerta y no se guarda.
- Los overrides se guardan en estado local (`manualOverrides`) y se reflejan en la grilla y en los totales (Votaron, etc.).

**(7) Corrección página de precios**
- En `/pricing`, el componente `Suspense` se importa desde `react` (no desde `next/navigation`) para evitar error de render en la ruta `/pricing?from=demo`.

**Pendiente sugerido para QA:** Probar con tema claro en Suscripción, Actas y Monitor; flujo Abandonos de sala → listado con hora; Modificaciones de voto → bitácora; clic en unidad → voto manual / modificar voto con comentario obligatorio; exportar Excel/PDF en ambas vistas. Usuario demo: demo@assembly2.com.

---

**Primera tarea (prioridad):** ~~**Backup.**~~ ✅ **Completado** (commit 5c94eb5, push 05 Feb 2026).

**Validación Contralor – Respuesta del Coder (Tarea 1):** ✅ **Confirmada.** En `src/app/page.tsx`: (1) `residentEmailValidated` controla la visibilidad de los botones; (2) si el correo no se reconoce se muestra "No encuentro ese correo. Contacta al administrador de tu PH para validar. Puedes escribir otro correo para reintentar." y no se avanza a step 8 ni se muestran botones; (3) los botones (Votación, Asambleas, etc.) solo se renderizan cuando `chatStep >= 8 && chatRole === "residente" && residentEmailValidated`. Tarea 1 cerrada.

**Orden de tareas (Henry confirmado):**
1. **Tarea 1 (Coder):** Lógica chatbot residente – botones solo cuando `residentEmailValidated`. ✅ Hecho y validado por Contralor.
2. **Tarea 2 (QA):** Revalidar §E o validación manual chatbot. ✅ **Finalizada** (Henry 05 Feb 2026).
3. **Tarea 3 (Coder):** §F, §G, §H (botones por asamblea activa, Ceder poder en chat, validación demo). ✅ **Finalizada** (Henry 05 Feb 2026).

**Backup:** ✅ Completado (7140ba2, push OK). **Test de navegación:** se continúa más tarde.

**Plan de pruebas navegación:** ✅ **COMPLETADO** (etapas 1–6 aprobadas).

**Respuesta Contralor a QA:** Se recomienda **continuar con la validación manual del chatbot en navegador** para cerrar el ciclo UX del plan (pasos 4.1, 4.3–4.7). Si Henry prefiere otra tarea, puede asignar: validación Docker/OTP (VALIDACION_DOCKER_Y_OTP.md) o autorizar backup.

**Validación Contralor – Tarea usuarios residentes demo:** ✅ **REALIZADA.** Database: script en `sql_snippets/seeds_residentes_demo.sql` e INSERT en `auth_otp_local.sql` (residente1@ a residente5@demo.assembly2.com, rol RESIDENTE, org demo). Coder: integración en init Docker; ejecución manual documentada en `seeds_residentes_demo.sql`.

**Decisión Contralor – Validación residente en chatbot (QA_FEEDBACK):** Se toma **Opción B**. Para la org demo, aceptar en el flujo residente del chatbot los emails `residente1@demo.assembly2.com` … `residente5@demo.assembly2.com` sin consultar BD (sin crear API). Motivo: MVP en 30 días, menor alcance y entrega más rápida. La Opción A (API `GET /api/users/check-resident`) queda como mejora post-lanzamiento si se requiere validación por BD para todas las orgs. Reporte: QA/QA_FEEDBACK.md.

**Coder – Validación residente en chatbot (Opción B):** ✅ **FINALIZADA.**

**QA – Revalidación chatbot Opción B:** ✅ **COMPLETADA.** Reporte en QA/QA_FEEDBACK.md (§ "QA Re-validación · Chatbot tras fix Opción B"). Veredicto: aprobado.

**Siguiente tarea:** **1** Coder (lógica chatbot residente – botones solo si residentEmailValidated) → **2** QA (revalidar §E o validación manual chatbot) → **3** Coder (§F, §G, §H) cuando Henry confirme finalizado. Ver instrucciones más abajo.

**QA observación (botón retorno):** En platform-admin/tickets/[id]/page.tsx (líneas 109-110) ya existe botón "← Volver al Dashboard". Usar como base para añadirlo en el resto de páginas Platform Admin. Ver QA/QA_FEEDBACK.md § "Botón de retorno en páginas Platform Admin".

**Marketing (validación dashboard Henry):** ✅ **Informe entregado.** Marketing/MARKETING_VALIDACION_DASHBOARD_HENRY.md con checklist detallado, observaciones por ruta y recomendaciones para Henry. Incluye instrucciones explícitas para el Coder (layout compartido, enlace Chatbot Config, enlaces alineados, persistencia Clients, datos reales en dashboard, precios VPS, tildes). Siguiente: **Coder** ejecuta según ese documento. **Regla para Marketing:** Subir reportes solo en la carpeta **Marketing/**; no crear carpetas nuevas sin consentimiento del Contralor.

**Validación avance – fallo de build:** Sí, **lo corrige el Coder**. El fallo del build por ausencia de `@types/react` (o tipos de React) no está causado por los cambios de funcionalidad; es un tema de dependencias/tipos. El Coder debe instalar los tipos (`@types/react`, `@types/react-dom`) y asegurar que el build pase por completo. Instrucción más abajo.

**Informe Marketing – lógica chatbot residente (MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md):** ✅ **Validado.** Contralor valida el informe. **Arquitecto actualizó:** Arquitecto/FLUJO_IDENTIFICACION_USUARIO.md con la sección "Regla: Chatbot landing – Flujo residente y botones" (residentEmailValidated; botones solo cuando correo validado). **Coder puede proceder** con la corrección en src/app/page.tsx según Marketing + Arquitecto.

**Informe Marketing – UX Chatbot y navegación residente (MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md):** ✅ **Confirmado.** Contenido: **§A** Landing vs Chat. **§B** Botones pills en chat. **§C** Identidad residente (correo, nombre, unidad). **§D** Responder DENTRO del chat: botones Votación, Asambleas, Calendario, Tema del día, Ceder poder y botón votar deben dar **respuesta dentro del chatbot** (cards/mensajes inline), no llevar a una landing externa; lo implementa el **Coder**. **§E. Cerrar sesión y abandono de sala:** Reemplazar "Volver a la landing" por "Cerrar sesión"; al clic mostrar alerta "Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?"; si confirma: cerrar sesión y limpiar datos del residente; **registrar en BD la hora** en que el residente abandonó (para Admin PH). **§I (Henry 26 Ene 2026):** Página chatbot residentes `/residentes/chat`; al cerrar sesión redirigir a esa página (no a landing); dos perfiles: (1) Entra por landing → termina en chatbot residentes; (2) Entra directo con link chatbot residentes. **§J (Henry 26 Ene 2026 – 4 puntos UX residente con asamblea activa):** (1) Mensaje bienvenida residente (no B2B "leads/demos"); (2) Mostrar correo en chat; (3) Al clic "Votación" responder con card inline ("Votación activa", "¿Participar?", botón "Ir a votar"); (4) Badge "Asamblea activa" visible. Instrucción para Coder más abajo. **Probar build en Docker:** lo ejecuta **QA** (o Coder para validar); instrucción más abajo.

**Validación Contralor – Respuesta del Coder (§E):** ✅ **Validada.** La implementación del flujo §E (Cerrar sesión, alerta, registro de abandono) está coherente con QA_FEEDBACK.md, Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md y Marketing §E. API `POST /api/resident-abandon` y uso de la tabla `resident_abandon_events` implementados. **Pendiente:** En la BD debe existir la tabla `resident_abandon_events` (script `sql_snippets/100_resident_abandon_events.sql` ejecutado). Si la tabla no está creada en el entorno, el POST devolverá 500 hasta que **Database** (o quien tenga acceso a la BD) ejecute el script. Instrucción para Database más abajo.

**Validación Contralor – Respuesta QA (§E, 06 Feb 2026):** ✅ **Validada.** El reporte de QA en QA_FEEDBACK.md § "Registro de abandono de sala (§E)" es coherente con el estado actual: (1) BD + API listos (tabla creada 06 Feb, POST /api/resident-abandon implementado). (2) QA indica "QA puede revalidar §E" una vez verificada la tabla en el entorno. (3) Pendientes reportados por QA: botón "Cerrar sesión" en lugar de "Volver al inicio", alerta de confirmación, vista Admin PH "Residente X abandonó a las [hora]", trazabilidad/quórum. La última respuesta del Coder ya fue validada; no hay nueva contestación del Coder que requiera nueva validación. **Siguiente:** QA revalida §E (flujo Cerrar sesión + registro en BD) cuando corresponda; si la tabla existe, el POST debe responder OK.

**Validación Contralor – Respuesta Base de datos (§E):** ✅ **Incluida y validada.** La respuesta de Database está registrada en este documento: (1) **06 Feb 2026:** Database ejecutó en BD el script `sql_snippets/100_resident_abandon_events.sql`; tabla `resident_abandon_events` creada. (2) Script e instrucciones para Coder en Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md. (3) Historial y sección "DATABASE - Últimos Avances" reflejan: tabla §E creada, residentes demo en BD, instrucciones PgBouncer. No queda pendiente de Database para §E (tabla ya ejecutada en BD el 06 Feb).

**Validación Contralor – Botón de abandono de sala (§E):** ✅ **QA sí lo reportó.** En QA/QA_FEEDBACK.md (06 Feb 2026), sección "QA Validación · Registro de abandono de sala (§E)", el resultado fue **NO IMPLEMENTADO**. Coder ya implementó; pendiente que la tabla exista en BD.

**Orden de trabajo §E (instrucciones separadas):**

| Orden | Agente    | Tarea | Al finalizar |
|-------|-----------|--------|----------------|
| **1º** | **Database** | Crear tabla/estructura en BD para registrar hora de abandono del residente (resident_abandon_events o equivalente). Entregar script en sql_snippets/ y documentar para el Coder. | Indicar en ESTATUS_AVANCE o QA_FEEDBACK que Database terminó; **el Coder puede proceder**. |
| **2º** | **Coder** | Implementar botón "Cerrar sesión", alerta de confirmación, API que registre en la tabla de Database, y vista Admin PH "Residente X abandonó a las [hora]". | QA revalida §E cuando Coder entregue. |

Instrucciones detalladas para cada agente más abajo (copiar y pegar).

---

### ✅ Validación Contralor – Avances (4 tareas realizadas, falta backup)

| Tarea | Responsable | Estado | Nota |
|-------|-------------|--------|------|
| **Tarea 1** | Coder | ✅ Realizada | §F, §G, §H, §I, §J (Marketing UX chatbot). |
| **Tarea 2** | QA | ✅ Realizada | Revalidar §E o validación manual chatbot. |
| **Tarea 3** | Database | ✅ Realizada (si aplica) | Script §E en BD si faltaba tabla. |
| **Tarea 4** | QA | ✅ Realizada | Plan de navegación (etapas 1–6) + validación §J/rec 14. |
| **Backup** | Contralor / Henry | ✅ **Completado** (b3afdd2 en GitHub, 30 Ene 2026) | Commit desde Contralor; push ejecutado por Henry. |

**Siguiente paso:** Seguir con las siguientes tareas según el plan. Backup actual al día.

**Validación Contralor – Reportes de agentes (esta fase listo):** ✅ **Validada.** Contralor confirma que los reportes de los agentes de esta fase están validados. Fase cerrada.

---

### Validación Contralor – Respuesta Coder y QA (estado actual)

**Resumen:** La mayoría de entregas Coder y aprobaciones QA están **OK**. Quedan **re-validaciones QA** y **tareas Coder/QA pendientes** (no bloqueantes para lo ya cerrado).

| Área | Coder | QA | Estado |
|------|--------|-----|--------|
| Login residente (role RESIDENTE → /residentes/chat) | ✅ Implementado | ✅ Aprobado (redirección por rol) | **OK** |
| Bug verify-otp (res.ok en scope) | ✅ Corregido en código | 📋 Falta re-validar en navegador (PIN correcto → sin "Error al verificar") | Coder OK; QA pendiente 1 re-validación |
| Chatbot más inteligente (Gemini, base conocimiento) | ✅ Completado | Sugerida revalidar "como voto" / "mi voto registrado" | **OK** |
| Ceder poder §G | ✅ Completado (API, formulario, mensaje) | 📋 Pendiente prueba en navegador (plan 4.7) | Coder OK; QA pendiente 1 prueba |
| Assembly-context PH A/PH B | ✅ Completado | ✅ Aprobado | **OK** |
| Dashboard Henry (§5 y §7) | ✅ Completado (APIs, tickets, CRM, export, etc.) | 📋 Revisar avances según plan (bloque "Para QA") | Coder OK; QA pendiente revisión |
| Redirección por rol (5 usuarios) | — | ✅ Aprobado | **OK** |
| Face ID | ✅ + Database script 101 | ✅ Revalidado | **OK** |
| §K mensaje/botones /residentes/chat | 📋 Pendiente | — | Tarea Coder pendiente |
| Dashboard Admin PH mejoras R1–R8 (Marketing) | 📋 Pendiente | — | Tarea Coder pendiente |
| Test Dashboard Admin PH (5 usuarios demo) | — | 📋 Pendiente (plan creado) | QA pendiente |

**Conclusión:** Respuestas del Coder y de QA sobre lo ya cerrado están **validadas y OK**. Pendiente: (1) QA re-validar verify-otp en navegador; (2) QA ejecutar revisión Dashboard Henry y test Admin PH con usuarios demo; (3) QA prueba Ceder poder §G; (4) Coder §K y mejoras Admin PH R1–R8 cuando se asignen.

**Validación funcionalidades – 2 PH de prueba:** Para probar funcionalidades hacen falta **2 PH (organizaciones) de prueba:** (1) **PH A:** con residentes y asamblea **activa** (agendada y en curso para votar). (2) **PH B:** con residentes y asamblea **agendada pero no activa** para votar (solo programada). **Responsable de crear los datos:** **Database.** Database entrega scripts o datos en BD para las 2 orgs (o amplía la org demo con 2 contextos de asamblea). **Responsable de ejecutar las pruebas:** **QA**, una vez existan los 2 PH. Database informa al Contralor al terminar; Contralor asigna a QA la prueba de funcionalidades.

---

### 📌 PARA HENRY – Instrucciones directas

Cada fila: **Tarea** · **Agente** · **Plan de pruebas o Avances** (documento donde buscar).

| Tarea | Agente | Plan de pruebas / Avances |
|-------|--------|---------------------------|
| ~~Face ID opcional~~ (Coder ✅) | QA | Valida Face ID, informa al Contralor; Contralor valida y asigna próxima tarea. |
| Plan de navegación completo (etapas 1–6) + validación §J/rec 14 | QA | Plan de pruebas: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md |
| §F, §G, §H, §I, §J (Marketing UX chatbot, botones, Ceder poder, /residentes/chat, §J) | Coder | Avances: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md |
| Revalidar §E o validación manual chatbot (botones 4.1–4.7) | QA | Plan de pruebas: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (sección 4); Avances: ESTATUS_AVANCE |
| Script tabla resident_abandon_events en BD si no existe | Database | Avances: ESTATUS_AVANCE (instrucción más abajo) |
| Lógica chatbot residente (botones solo si residentEmailValidated) | Coder | Avances: Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md |
| Build dentro de Docker | QA | Plan de pruebas / Avances: QA_FEEDBACK.md |
| **2 PH de prueba** (uno con asamblea activa para votar, otro con asamblea agendada no activa) | **Database** | Crear datos/scripts para 2 PH. Luego **QA** prueba funcionalidades. Ver "Validación funcionalidades – 2 PH de prueba" más arriba. |
| **Ceder poder (formulario completo)** – Arquitecto + Marketing §G | Coder | Dónde empezar: Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md y Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §G. Bloque "Para CODER – Ceder poder en chatbot" más abajo. |
| **Chatbot más inteligente – preguntas simples** (mejorar respuestas según QA) | Coder | QA_FEEDBACK.md § "QA Análisis · Chatbot inteligente – Preguntas simples en asamblea". Bloque "Para CODER (chatbot más inteligente – preguntas simples)" más abajo. Validar cuando Coder termine. |
| ~~Login – residente no debe entrar como Admin PH~~ | ~~Coder~~ | ✅ Coder informó listo. Siguiente: Backup → QA validación redirección por rol. |
| ~~Backup de todo~~ | ~~Contralor / Henry~~ | ✅ Completado (b3afdd2, 30 Ene 2026). |
| ~~Validación redirección por rol~~ | ~~QA~~ | ✅ **Completado.** QA aprobó (ver QA_FEEDBACK.md § "QA Validación · Redirección por rol"). Todos los perfiles redirigen correctamente. |
| **Más pruebas** (siguiente) | QA | Ver lista en QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § "Próximas pruebas". Opciones: §J/rec 14 en navegador, Chatbot Gemini (texto libre), §E revalidación, assembly-context PH A/B, validación demo por perfil, §K /residentes/chat. |
| **Revisar avances Coder – Dashboard Henry** | QA | Contralor validó avances en código. QA debe revisar según QA/QA_REPORTE_DASHBOARD_HENRY y QA_FEEDBACK § "QA Checklist · Navegación Dashboard Henry". Ver bloque "Para QA – Revisar avances Dashboard Henry" en ESTATUS_AVANCE. |

Detalle y texto para pegar al agente: más abajo en este documento.

---

**TAREA 1 – CODER**

**Instrucción para copiar y pegar (agente Coder):**

```
Eres el Coder. Orden del Contralor (ESTATUS_AVANCE.md): Implementar §F, §G, §H, §I y §J del informe Marketing según Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md. §F: Botones Votación y Tema del día solo si asamblea activa; Asambleas, Calendario y Ceder poder siempre; si no hay activa, Votación y Tema del día en gris con "No hay votación activa". §G: Ceder poder con formulario dentro del chat (campo Correo del apoderado + Enviar poder), todo inline. §H: Validación demo por perfil (activa/programada/pre-registro/sin asambleas con mensaje "¿Consultar con el administrador?"). §I: Página /residentes/chat; al cerrar sesión redirigir allí (no a landing); dos perfiles según documento. §J: (1) Mensaje bienvenida residente "Hola [Nombre]. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0." (2) Mostrar correo en chat (3) Clic Votación → card inline "Votación activa", "¿Participar?", botón "Ir a votar" (4) Badge "Asamblea activa" visible. Referencia: Contralor/TAREA_3_CODER.md. Al finalizar, confirmar en ESTATUS_AVANCE o al Contralor.
```

**Instrucción para copiar y pegar (agente QA):**

```
El Coder finalizó la Tarea 1 (§F, §G, §H, §I, §J). Orden del Contralor: ejecutar Tarea 2. Eres QA. Ejecutar según Contralor/TAREA_2_QA.md: Opción A – Revalidar §E (abandono de sala) o Opción B – Validación manual chatbot (sección 4 del plan). Reportar resultado en QA/QA_FEEDBACK.md. Referencia: Contralor/ESTATUS_AVANCE.md.
```

Puedes asignar la instrucción anterior al agente QA cuando el Coder haya terminado la Tarea 1.

---

**TAREA 2 – Para el QA**

**Instrucción para copiar y pegar (agente QA):**

```
Eres QA. Orden del Contralor (ESTATUS_AVANCE.md): Ejecutar Tarea 2. Opción A – Revalidar §E (abandono de sala): comprobar flujo "Cerrar sesión" en chatbot (residente validado), alerta, registro en BD. Opción B – Validación manual chatbot: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md sección 4; abrir http://localhost:3000, chatbot, probar botones Votación, Asambleas, Calendario, Tema del día, Ceder poder. Reportar en QA/QA_FEEDBACK.md. Referencia: Contralor/TAREA_2_QA.md.
```

**Instrucción para copiar y pegar (agente Contralor):**

```
QA finalizó la Tarea 2. Reporte en QA/QA_FEEDBACK.md. Contralor: registrar en ESTATUS_AVANCE y, si Henry autoriza, ejecutar backup (commit + push). Siguiente: test de navegación o tarea que Henry indique.
```

Puedes asignar la instrucción anterior al agente Contralor cuando QA haya terminado la Tarea 2.

---

**TAREA 3 – Para DATABASE (si aplica)**

**Instrucción para copiar y pegar (agente Database):**

```
Eres Database. Orden del Contralor (ESTATUS_AVANCE.md): Si en el entorno la tabla resident_abandon_events no existe, ejecutar el script desde la raíz del proyecto: docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/100_resident_abandon_events.sql. Sin la tabla, POST /api/resident-abandon devuelve 500. Al ejecutar, indicar en ESTATUS_AVANCE o QA_FEEDBACK que la tabla está creada. Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Instrucción para copiar y pegar (agente Contralor):**

```
Database ejecutó el script 100_resident_abandon_events.sql; tabla resident_abandon_events creada. Contralor: registrar en ESTATUS_AVANCE. QA puede revalidar §E.
```

Puedes asignar la instrucción anterior al agente Contralor cuando Database haya ejecutado el script.

---

**TAREA 4 – Plan de navegación (QA)**

**Instrucción para copiar y pegar (agente QA):**

```
Eres QA. Orden del Contralor: Ejecutar el plan de pruebas de navegación según QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (etapas 1 a 6). Incluir validación §J/rec 14 cuando pruebes residente con asamblea activa. Reportar resultado en QA/QA_FEEDBACK.md. Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Instrucción para copiar y pegar (agente Contralor):**

```
QA ejecutó el plan de navegación. Reporte en QA/QA_FEEDBACK.md. Contralor: actualizar ESTATUS_AVANCE. Si Henry autoriza backup, ejecutar commit + push.
```

Puedes asignar la instrucción anterior al agente Contralor cuando QA haya terminado el plan de navegación.

---

**TAREA 5 – Face ID opcional (Coder):** ✅ Completado por Coder.

**Face ID – dónde quedamos:** ✅ **Database** ejecutó script 101 (columna `face_id_enabled`). ✅ **QA** revalidó Face ID e informó al Contralor. Contralor confirma: Face ID (TAREA 5) cerrado. Próxima tarea la indica el Contralor en una frase.

---

**BACKUP – Completado (30 Ene 2026)**

► Commit **226bd72** subido a GitHub (main). Incluye: 4 tareas realizadas (Coder §F-§J, QA T2 y plan navegación, Database §E), ESTATUS_AVANCE, Marketing, QA, chat residentes, api resident-profile. Para el próximo backup: Contralor hace commit; Henry ejecuta `git push origin main` (credenciales solo en tu máquina).

---

**Próxima tarea (Marketing – §F, §G, §H agregados al informe):**

| Sección | Qué hace el Coder | Referencia |
|---------|-------------------|------------|
| **§F** | **Lógica de habilitación de botones:** Votación y Tema del día solo si hay asamblea activa; Asambleas, Calendario y Ceder poder siempre habilitados. Si no hay asamblea activa: Votación y Tema del día deshabilitados (gris) con texto "No hay votación activa" o similar. | Marketing informe §F |
| **§G** | **Ceder poder: formulario dentro del chat.** Formulario inline en el chat: campo "Correo del apoderado" + botón "Enviar poder". Todo dentro del chat, sin redirigir. Validar correo y confirmar con mensaje del bot. | Marketing informe §G |
| **§H** | **Validación demo por perfil.** Comportamiento según contexto: Asamblea activa → Votación y Tema del día habilitados; Asamblea programada → solo Asambleas y Calendario, Votación/Tema deshabilitados; Pre-registro → residente validado sin asambleas; Sin asambleas año en curso → mensaje "No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?" | Marketing informe §H |
| **§I** | **Página chatbot residentes + flujos por perfil.** Crear `/residentes/chat` (página de inicio chatbot residentes). Al cerrar sesión: redirigir a `/residentes/chat`, no a landing. Perfil 1: entra por landing → tras validar va a `/residentes/chat`; cerrar sesión → `/residentes/chat`. Perfil 2: entra directo con link `/residentes/chat`; validar y cerrar sesión en esa misma página. | Marketing informe §I |
| **§J** | **4 puntos UX residente con asamblea activa.** (1) Mensaje bienvenida residente, no B2B; (2) Mostrar correo en chat; (3) Clic "Votación" → card inline "Votación activa", "¿Participar?", botón "Ir a votar"; (4) Badge "Asamblea activa" visible. | Marketing informe §J |

**Registro §J y recomendación #14:** Fuente **Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md** – Sección **§J** (Mejoras UX – Residente con asamblea activa, validación 26 Ene 2026) y **Recomendación #14** (Mejoras UX residente con asamblea activa, ver §J). Contralor registra aquí; tarea asignada al Coder; QA valida según QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md cuando ejecute pruebas de chatbot residente con asamblea activa.

**Resumen:** §J y la recomendación #14 quedan **registrados en ESTATUS_AVANCE**, con **(1) instrucción explícita para el Coder** (secciones *"Para el CODER (Tarea 3 – §F…§J)"* y *"Para el CODER (§J + recomendación #14)"* más abajo) y **(2) checklist de validación en el plan de QA** (QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md – sección *Validación §J + Recomendación #14*).

**Responsable:** Coder (una sola instrucción para §F, §G, §H, §I, §J). Instrucción para copiar y pegar más abajo.

**Próximas opciones (mismo formato: Tarea · Agente · Plan de pruebas / Avances):**
| Tarea | Agente | Plan / Avances |
|-------|--------|----------------|
| ~~Backup~~ | ~~Contralor~~ | ✅ Completado 05 Feb 2026. |
| Lógica chatbot residente (residentEmailValidated; botones solo si validado) | Coder | Avances: Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md |
| Dashboard Henry (layout, Chatbot Config, enlaces, Clients, precios VPS, tildes) | Coder | Avances: Marketing/MARKETING_VALIDACION_DASHBOARD_HENRY.md |
| UX chatbot (§F–§J, /residentes/chat, pills, sesión, §J) | Coder | Avances: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md |
| Botón retorno dashboard (platform-admin: monitoring, clients, business, leads, chatbot-config, crm) | Coder | Avances: ESTATUS_AVANCE (ref. tickets/[id]/page.tsx) |
| Plan de navegación (etapas 1–6) | QA | Plan de pruebas: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md |
| Build en Docker | QA | Plan de pruebas / Avances: QA_FEEDBACK.md |
| Script resident_abandon_events en BD si falta tabla | Database | Avances: ESTATUS_AVANCE |
| §E Cerrar sesión, alerta, API abandono, vista Admin PH | Coder | Avances: ESTATUS_AVANCE / Database_DBA |
| ~~Face ID opcional~~ | ~~Coder~~ | ✅ Completado. QA valida, informa al Contralor; Contralor valida respuesta y asigna próxima tarea. |
| Validar §E (abandono de sala) | QA | Plan de pruebas: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md; Avances: QA_FEEDBACK.md |

---

### Tarea: Usuarios residentes demo (propuesta QA) – ✅ COMPLETADA

**Estado:** ✅ Database: script en `seeds_residentes_demo.sql` e INSERT en `auth_otp_local.sql`. ✅ Coder: init Docker + documentación ejecución manual. Usuarios: residente1@ a residente5@demo.assembly2.com, rol RESIDENTE, org demo. **Qué había que hacer:** Crear en BD usuarios residentes de la org demo (ej. residente1@demo.assembly2.com, residente2@demo.assembly2.com, …) con rol RESIDENTE o PROPIETARIO, para poder: entrar como admin (demo@assembly2.com), entrar como residente vía OTP (residente1@…), probar votación y pruebas de carga con varios residentes. Reporte detallado: **QA/QA_FEEDBACK.md** (sección “Recomendación: Asamblea demo con admin y residentes”).

**Quién lo hace primero:** **Database.** Luego, si hace falta integrar el script en el init de Docker o en un comando de seed, **Coder**.

| Orden | Agente   | Acción |
|-------|----------|--------|
| 1º    | **Database** | Crear script SQL: INSERT en `users` con `organization_id` = org demo (`11111111-1111-1111-1111-111111111111`), emails `residente1@demo.assembly2.com`, `residente2@...`, etc., `role` = `RESIDENTE` o `PROPIETARIO`. Entregar en `sql_snippets/` o indicar cómo añadirlo a `auth_otp_local.sql`. |
| 2º    | **Coder** (si aplica) | Integrar el script en el init de Docker o documentar cómo ejecutarlo (ej. en README o en script de seed). No crear los usuarios; solo ejecutar/integrar lo que Database entregue. |

---

### Instrucciones por agente (solo copiar y pegar; no generar código aquí)

Copia solo el texto que está dentro de cada recuadro (el que va entre las líneas con ```) y pégalo en el chat del agente indicado. La línea "Puedes asignar..." es para ti: indica cuándo usar la siguiente instrucción. Este documento no genera código; solo contiene el texto a copiar.

**Para QA (revalidación chatbot Opción B):** ✅ Completada (ver QA_FEEDBACK.md).

**Agente: QA · Tarea: Plan de navegación completo (etapas 1–6) + validación §J/rec 14:**
```
Ejecutar el plan de pruebas de navegación completo según QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md: etapas 1 (Login), 2 (Dashboard Admin PH 2.1–2.9), 3 (Platform Admin 3.1–3.6), 4 (Landing → Chatbot y botones 4.1–4.7), 5 (Páginas Residentes 5.1–5.5), 6 (Smoke test 6.1–6.5). Verificar que cada página y dashboard carguen bien (sin errores, sin tiempos excesivos). Anotar cualquier lentitud, error o mejora de experiencia de usuario (UX). Reportar resultado en QA/QA_FEEDBACK.md y actualizar la barra de progreso en el plan si aplica. Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Agente: QA · Tarea: Probar build dentro de Docker:**
```
Probar el build dentro de una de las imágenes Docker: levantar el stack (docker compose up -d --build o equivalente), asegurar que la imagen de la app se construye sin error (npm run build dentro del contenedor). Si el build falla, reportar en QA/QA_FEEDBACK.md el mensaje de error y el paso donde falla; el Coder corrige. Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Para QA (validar registro de abandono de sala – §E Coder):** ✅ **Ejecutada.** QA reportó NO IMPLEMENTADO (06 Feb 2026). Ver QA/QA_FEEDBACK.md § "QA Validación · Registro de abandono de sala (§E)".

**Agente: Database · Tarea: Ejecutar script §E en BD si la tabla resident_abandon_events no existe:**
```
El script sql_snippets/100_resident_abandon_events.sql ya existe y crea la tabla resident_abandon_events. El Coder ya implementó la API POST /api/resident-abandon que usa esa tabla. Si en el entorno (Docker/local) la tabla aún no existe, ejecutar el script: desde la raíz del proyecto, `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/100_resident_abandon_events.sql` (o equivalente según entorno). Sin la tabla, el POST devuelve 500. Al ejecutar el script, indicar en ESTATUS_AVANCE o QA_FEEDBACK que la tabla está creada para que QA pueda revalidar §E. Referencia: Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md, Contralor/ESTATUS_AVANCE.md.
```

**Para Database (§E – crear tabla, cuando aún no exista script):** ✅ Script ya entregado (100_resident_abandon_events.sql). Solo falta **ejecutarlo en la BD** si la tabla no está creada.

**Para Coder (§F, §G, §H, §I – próxima tarea, Marketing):**
```
Implementar según Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md secciones §F, §G, §H y §I. §F: Habilitar botones por estado de asamblea – Votación y Tema del día solo si hay asamblea activa; Asambleas, Calendario y Ceder poder siempre. Si no hay asamblea activa, mostrar Votación y Tema del día deshabilitados (gris) con texto tipo "No hay votación activa". §G: Ceder poder con formulario dentro del chat – campo "Correo del apoderado" + botón "Enviar poder", todo inline en el chat sin redirigir; validar correo y confirmar con mensaje del bot. §H: Validación demo por perfil – Asamblea activa: Votación y Tema del día habilitados; Asamblea programada: solo Asambleas y Calendario, Votación/Tema deshabilitados; Pre-registro: residente validado sin asambleas; Sin asambleas año en curso: mensaje "No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?". §I: Página chatbot residentes – Crear /residentes/chat; al cerrar sesión redirigir allí (no a landing); Perfil 1: landing → validar → /residentes/chat; cerrar sesión → /residentes/chat; Perfil 2: link directo /residentes/chat; validar y cerrar sesión en esa misma página. §J: 4 puntos UX residente con asamblea activa – (1) Mensaje bienvenida residente; (2) Mostrar correo en chat; (3) Clic Votación → card inline; (4) Badge "Asamblea activa". Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Para Coder (§E abandono de sala – ejecutar después de Database):**
```
Implementar el flujo de abandono de sala (§E) solo cuando Database haya finalizado (tabla/estructura para registrar abandono). Según QA/QA_FEEDBACK.md: (1) Reemplazar "Volver al inicio" por "Cerrar sesión" en contexto residente validado (ej. chat/page.tsx). (2) Al clic en "Cerrar sesión": mostrar alerta "Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?". (3) Si confirma: limpiar sesión del residente y llamar API (POST) para registrar en BD la hora de abandono usando la tabla que Database creó. (4) Crear la ruta API que inserte en esa tabla (user/resident, assembly/session, abandoned_at). (5) En el dashboard Admin PH (monitor o vista asamblea): mostrar lista o mensaje "Residente [nombre/unidad] abandonó la sala a las [hora]" leyendo desde la BD. Referencia: Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md §E, QA/QA_FEEDBACK.md, Contralor/ESTATUS_AVANCE.md.
```

**Para Contralor (primera tarea – backup):**
```
Primera tarea prioritaria: cuando Henry autorice "Hacer backup", ejecutar commit + push según protocolo de backup por fase (Contralor/ESTATUS_AVANCE.md). Incluir en el commit: validaciones QA/Coder/Database §E, plan de pruebas, ESTATUS_AVANCE, cambios §E (API resident-abandon, script 100_resident_abandon_events.sql). Formato commit: "Backup: validaciones §E + plan pruebas + ESTATUS_AVANCE" (o "FASE X completada: [descripción] - Aprobado por QA" si aplica). Confirmar "Backup completado" tras el push.
```

**Para QA (validación manual chatbot 4.1–4.7, si falta):**
```
Ejecutar validación manual del chatbot: abrir http://localhost:3000, abrir el chatbot (4.1), probar cada botón de navegación rápida (4.3 Votación, 4.4 Asambleas, 4.5 Calendario, 4.6 Tema del día, 4.7 Ceder poder). Reportar en QA/QA_FEEDBACK.md. Referencia: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md sección 4.
```

**Para QA (validación manual chatbot):**
```
Ejecutar validación manual del chatbot en navegador: abrir http://localhost:3000, abrir el chatbot (4.1), probar cada botón de navegación rápida (4.3 Votación, 4.4 Asambleas, 4.5 Calendario, 4.6 Tema del día, 4.7 Ceder poder). Documento de referencia: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md sección 4. Reportar resultado en QA/QA_FEEDBACK.md (breve: qué se probó, si cada botón lleva a la URL esperada).
```

**Para Coder (validación residente en chatbot – Opción B):** ✅ Completado.

**Para Marketing (validación dashboard Henry):**
```
Validar el dashboard de Admin Plataforma (Henry): rutas /dashboard/admin, /platform-admin/monitoring, /platform-admin/clients, /platform-admin/business, /platform-admin/leads, /platform-admin/chatbot-config. Revisar que (1) la información mostrada sea correcta y útil para Henry y (2) que visualmente se vea inteligente y profesional. Entregar informe o checklist en la carpeta Marketing/ (ej. MARKETING_VALIDACION_DASHBOARD_HENRY.md). No crear carpetas nuevas sin consentimiento del Contralor; usar solo la carpeta Marketing/ existente para subir reportes. Referencia: Contralor/ESTATUS_AVANCE.md, Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md.
```

**Para Coder (informe Marketing UX chatbot navegación residente):**
```
Implementar según Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md. Incluir: (5) Página /chat; (6) Botones pills; §C Identidad residente; §D Responder dentro del chat; §E Cerrar sesión + alerta + registro abandono; §F Lógica botones (Votación/Tema del día solo si asamblea activa; Asambleas/Calendario/Ceder poder siempre); §G Ceder poder: formulario inline en chat; §H Validación demo: perfiles asamblea activa, programada, pre-registro, sin asambleas ("¿Consultar con admin?"). Y: (1) Persistir sesión; (2) "Volver al chat"; (3) ACTIVA/PROGRAMADA. Ver Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md.
```

**Para Coder (lógica chatbot residente – Marketing 26 Feb):**
```
Corregir lógica del chatbot residente en src/app/page.tsx: los botones (Votación, Asambleas, Calendario, etc.) deben mostrarse SOLO cuando el correo fue validado. Si no validado: mensaje "Contacta al administrador" y permitir reintentar; NO mostrar botones. Añadir estado residentEmailValidated. Ver Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md y Marketing/INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md §2.
```

**Para Arquitecto (referencia):**
```
Marketing reporta hallazgo en flujo chatbot residente: validación de correo debe controlar visibilidad de botones. Documento: Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md. Referencias: ARQUITECTURA_CHATBOT_IA.md, FLUJO_IDENTIFICACION_USUARIO.md.
```

**Para Coder (informe Marketing – lógica chatbot residente):**
```
Corregir en src/app/page.tsx usando residentEmailValidated y mostrando los botones de residente (Votación, Asambleas, Calendario, Tema del día, Ceder poder) solo cuando el correo esté validado. Si el correo no se reconoce, no mostrar botones y permitir reintentar. Referencia: Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md. Regla de negocio documentada en Arquitecto/FLUJO_IDENTIFICACION_USUARIO.md (sección "Regla: Chatbot landing – Flujo residente y botones"). Contralor/ESTATUS_AVANCE.md.
```

**Para Coder (informe Marketing – dashboard Henry):**
```
Ejecutar las instrucciones del informe de Marketing en Marketing/MARKETING_VALIDACION_DASHBOARD_HENRY.md (sección "INSTRUCCIONES PARA EL CODER"). Resumen: (1) Crear layout compartido para platform-admin con sidebar similar al dashboard principal. (2) Añadir enlace a Chatbot Config en el sidebar del dashboard. (3) Alinear enlaces de navegación: Funnel→leads, Tickets→tickets, Clientes→clients, CRM→crm (rutas reales). (4) Persistir cambios en Clients en BD o API. (5) Conectar el dashboard principal a vistas/APIs reales. (6) Ajustar precios VPS en Monitoring (CX51 ≈ $32/mes según arquitectura). (7) Corregir tildes (Gestión, Métricas, operación, etc.). Implementar en el proyecto según prioridades del documento. Referencia: Contralor/ESTATUS_AVANCE.md.
```

**Para Coder (botón retorno Platform Admin – observación QA):**
```
Añadir en cada página de platform-admin que aún no lo tenga un botón de retorno al dashboard (ej. "← Volver al Dashboard") que permita volver a /dashboard/admin o /dashboard/platform-admin. Usar como referencia la implementación ya existente en src/app/platform-admin/tickets/[id]/page.tsx (líneas 109-110). Páginas a revisar: monitoring, clients, business, leads, chatbot-config, crm. No generar código aquí; solo implementar en el proyecto. Referencia: QA/QA_FEEDBACK.md § "Botón de retorno en páginas Platform Admin".
```

**Para Coder (fallo de build por @types/react):** ✅ Aplicado
```
Si el build falla por ausencia de @types/react (o tipos de React), instalar los tipos: npm install --save-dev @types/react @types/react-dom. Asegurar que en el entorno donde se ejecuta el build (local y/o Docker) se instalen las devDependencies (npm install sin --production). Confirmar que el build pase por completo (npm run build). Referencia: Contralor/ESTATUS_AVANCE.md.
```
- **Estado:** Tipos instalados en package.json (devDependencies). En entornos donde npm omita devDependencies (p. ej. NODE_ENV=production), usar `npm install --include=dev`. Todos los Dockerfiles (Dockerfile, Dockerfile.webchat, Dockerfile.telegram, Dockerfile.whatsapp) usan `RUN npm install --include=dev`. Build verificado: `npm run build` pasa por completo (tipos, rutas API Next 15, Suspense useSearchParams, Stripe apiVersion).

**Para Coder (cuando QA reporte otras correcciones):**
```
Corregir los bloqueadores o errores indicados en QA/QA_FEEDBACK.md (etapa que corresponda del plan de pruebas). Implementar solo lo que QA reporta. Confirmar cuando esté listo.
```

**Para Database (Funnel de leads – QA reporta vacío 06 Feb 2026):**
```
Ejecutar en BD (instancia existente) para que Gestión de Leads muestre datos demo:
1. docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/97_platform_leads.sql
2. docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/seeds_leads_demo.sql

Script seeds_leads_demo.sql creado por QA. 5 leads (new, qualified, demo_active, converted).
Referencia: QA/QA_FEEDBACK.md § "Funnel de leads y Tickets".
```

**Para Coder (Funnel leads – seeds en init Docker):**
```
Añadir seeds_leads_demo.sql a la carpeta montada en /docker-entrypoint-initdb.d
(ya está en sql_snippets/). Se ejecutará tras 97_platform_leads.sql (orden alfabético).
Referencia: QA/QA_FEEDBACK.md, sql_snippets/README.md.
```

**Para Database (tarea: usuarios residentes demo) – ejecutar primero:**
```
Crear usuarios residentes en BD para la org demo: INSERT en tabla users con organization_id = '11111111-1111-1111-1111-111111111111' (Demo - P.H. Urban Tower), emails residente1@demo.assembly2.com, residente2@demo.assembly2.com, residente3@demo.assembly2.com (y los que se necesiten), role = RESIDENTE o PROPIETARIO. Entregar script en sql_snippets/ o integrar en auth_otp_local.sql. Referencia: QA/QA_FEEDBACK.md sección "Recomendación: Asamblea demo con admin y residentes".
```

**✅ Usuarios demo por plan (Dashboard Admin PH) – 26 Ene 2026:**
```
Ejecutados: schema_subscriptions_base.sql + 106_usuarios_demo_por_plan.sql
Resultado: 5 Admin PH (uno por plan) listos para probar límites:
  demo@assembly2.com          → DEMO (50 uds)
  admin@torresdelpacifico.com → STANDARD (250 uds)
  multilite@demo.assembly2.com → MULTI_PH_LITE (1.500 uds)
  multipro@demo.assembly2.com  → MULTI_PH_PRO (5.000 uds)
  enterprise@demo.assembly2.com → ENTERPRISE (ilimitado)
Reporte: Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md
Usuarios: docs/USUARIOS_DEMO_BD.md
QA: validar login con cada correo y probar límites de plan.
QA Fase 4 (R1-R4, R8): ✅ Ejecutada 26 Ene 2026. Reglas aprobadas. Ver QA_FEEDBACK.md § "QA Fase 4 – Reglas R1, R2, R3, R4, R8".
```

**Para Coder (usuarios residentes demo) – después de Database:** ✅ Completado
```
Integrar el script SQL de usuarios residentes demo (entregado por Database) en el init de Docker o documentar cómo ejecutarlo. No crear los datos; solo ejecutar/integrar el script que Database haya proporcionado. Referencia: QA/QA_FEEDBACK.md, Contralor/ESTATUS_AVANCE.md.
```
- **Integración init Docker:** El script `sql_snippets/seeds_residentes_demo.sql` está en la carpeta montada en `/docker-entrypoint-initdb.d`; se ejecuta automáticamente en el primer arranque del contenedor Postgres.
- **Ejecución manual** (si la BD ya existía antes): ver cabecera de `sql_snippets/seeds_residentes_demo.sql` o `sql_snippets/README.md`.

---

**Próxima actualización:** Febrero 2026
