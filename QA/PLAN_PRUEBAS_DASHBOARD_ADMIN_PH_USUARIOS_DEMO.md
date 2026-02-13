# Plan de pruebas: Dashboard Admin PH con usuarios demo por plan

**Fecha:** Febrero 2026  
**Objetivo:** Validar funcionalidad y límites del Dashboard Admin PH usando los **5 usuarios demo** (uno por plan).  
**Referencia:** Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md, docs/USUARIOS_DEMO_BD.md, QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md § 2.

**Estado:** Los usuarios demo están listos para validar (tras ejecución de scripts por Database: schema_subscriptions_base.sql, 106_usuarios_demo_por_plan.sql). Ver REPORTE_USUARIOS_DEMO_POR_PLAN.md.

**Observaciones Marketing (validar si ya aplicadas):** Ver **Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md** – reglas R1–R8 (plan actual visible, Modificar suscripción, Volver al Dashboard, lista de PHs, selector PH, sidebar colapsable, menú agrupado, página Suscripción clara). El Coder tiene la tarea en ESTATUS_AVANCE § "Para CODER – Dashboard Admin PH: mejoras visuales y reglas". QA puede verificar R1, R2, R3 (alta) durante las pruebas.

---

## Prerequisitos

- Docker arriba (`docker compose up -d`).
- Login OTP funcionando (verify-otp).
- Scripts ejecutados en BD: `schema_subscriptions_base.sql`, `106_usuarios_demo_por_plan.sql` (para tener los 5 Admin PH y sus planes).
- App en **http://localhost:3000**.

---

## Usuarios demo para Dashboard Admin PH (por plan)

| # | Plan | Límite unidades | Email | Organización |
|---|------|------------------|-------|--------------|
| 1 | DEMO | 50 | demo@assembly2.com | Demo - P.H. Urban Tower (PH A) |
| 2 | STANDARD | 250 | admin@torresdelpacifico.com | P.H. Torres del Pacífico (PH B) |
| 3 | MULTI_PH_LITE | 1.500 (cartera) | multilite@demo.assembly2.com | P.H. Multi-Lite Demo (PH C) |
| 4 | MULTI_PH_PRO | 5.000 (cartera) | multipro@demo.assembly2.com | P.H. Multi-Pro Demo (PH D) |
| 5 | ENTERPRISE | Ilimitado | enterprise@demo.assembly2.com | P.H. Enterprise Demo (PH E) |

**Fuente:** Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md, docs/USUARIOS_DEMO_BD.md.

---

## Fase 1: Navegación por usuario (2.1–2.9)

Para **cada uno de los 5 usuarios** (login con email + OTP → redirección a `/dashboard/admin-ph`):

| # | Ruta / Sección | Acción | Resultado esperado | U1 | U2 | U3 | U4 | U5 |
|---|----------------|--------|--------------------|----|----|----|----|-----|
| 2.1 | Resumen | Entrar a `/dashboard/admin-ph`. | Página carga; sidebar con 8 secciones. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.2 | Propietarios | Ir a `/dashboard/admin-ph/owners`. | Lista o vacío; sin 404 ni 500. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.3 | Asambleas | Ir a `/dashboard/admin-ph/assemblies`. | Lista o vacío; botones coherentes. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.4 | Votaciones | Ir a `/dashboard/admin-ph/votations`. | Vista de votaciones; sin error. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.5 | Actas | Ir a `/dashboard/admin-ph/acts`. | Vista actas; opción generar acta si aplica. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.6 | Reportes | Ir a `/dashboard/admin-ph/reports`. | Vista reportes; exportar si aplica. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.7 | Equipo | Ir a `/dashboard/admin-ph/team`. | Visible si permisos; sin error. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.8 | Configuración | Ir a `/dashboard/admin-ph/settings`. | Página carga. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2.9 | Soporte | Ir a `/dashboard/admin-ph/support`. | Página carga. | ☐ | ☐ | ☐ | ☐ | ☐ |

**U1** = demo@, **U2** = admin@torresdelpacifico.com, **U3** = multilite@, **U4** = multipro@, **U5** = enterprise@.

**Criterio:** Todas las rutas 200 (o comportamiento esperado). Anotar cualquier 404/500 o mensaje de límite en la tabla.

---

## Fase 2: Validación de límites por plan

Según Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md § 4 (casos de prueba por plan):

| Plan | Prueba | Resultado esperado | OK / Fallo |
|------|--------|--------------------|------------|
| **DEMO** | Agregar >50 unidades (propietarios) o superar límite de asambleas/mes | Bloqueado con mensaje de límite o modal de upgrade | ☐ |
| **STANDARD** | Agregar >250 unidades | Bloqueado o modal de compra adicional | ☐ |
| **MULTI_PH_LITE** | Suma cartera >1.500 unidades | Bloqueado | ☐ |
| **MULTI_PH_PRO** | Suma cartera >5.000 unidades | Bloqueado | ☐ |
| **ENTERPRISE** | Agregar muchas unidades | Sin límite (permite) | ☐ |

**Acciones sugeridas para QA:**

1. Con **demo@** (DEMO 50): intentar agregar propietarios hasta superar 50; verificar que se muestre mensaje de límite o bloqueo.
2. Con **admin@torresdelpacifico.com** (STANDARD 250): idem hasta 250.
3. Con **multilite@** (MULTI_PH_LITE): validar límite 1.500 (cartera).
4. Con **multipro@** (MULTI_PH_PRO): validar límite 5.000 (cartera).
5. Con **enterprise@** (ENTERPRISE): validar que no se bloquea por cantidad de unidades.

Si la UI de límites aún no está implementada, documentar: "Límites por plan: pendiente de implementación en UI; BD/scripts listos."

---

## Fase 3: Botones principales (por usuario)

En cada sección (Propietarios, Asambleas, Actas, Reportes), pulsar los botones principales:

| Sección | Botón / acción | Qué validar |
|---------|----------------|-------------|
| Propietarios | "Agregar propietario" / "Agregar residente" | Modal o formulario; no 500. |
| Asambleas | "Nueva asamblea" / "Crear asamblea" | Navegación o wizard; respeta límites si aplica. |
| Actas | "Generar acta" | Opción visible; sin error. |
| Reportes | "Exportar" / descarga | Sin 500. |

Anotar fallos por usuario/plan si aplica.

---

## Fase 4: Observaciones Marketing (reglas R1–R3 – alta prioridad)

Si el Coder ya aplicó las mejoras, QA valida según **Marketing/MARKETING_OBSERVACIONES_DASHBOARD_ADMIN_PH.md**:

| Regla | Qué validar | OK / Pendiente |
|-------|-------------|----------------|
| **R1** | Plan actual visible: bloque o card "Plan actual: [nombre] · X/Y asambleas · Z edificios" en perfil o cabecera. | ☑ |
| **R2** | Botón o enlace "Modificar suscripción" visible (perfil o bloque de plan). | ☑ |
| **R3** | En subpáginas (Suscripción, Configuración, Asambleas, etc.): botón "← Volver al Dashboard" en la parte superior. | ☑ |
| **R4** | Lista de PHs al entrar | ☑ |
| **R8** | Página Suscripción clara ("Tu plan actual" arriba) | ☑ |

Ejecutado 26 Ene 2026. Ver QA_FEEDBACK.md § "QA Fase 4 – Reglas R1, R2, R3, R4, R8".

---

## Reporte

- **Documentar resultado en:** QA/QA_FEEDBACK.md (sección "Pruebas Dashboard Admin PH – usuarios demo por plan").
- **Incluir:** qué usuarios se probaron, resultados Fase 1 (2.1–2.9 por usuario), Fase 2 (límites), Fase 3 (botones), Fase 4 (observaciones Marketing R1–R3 si aplica). Cualquier 404/500 o mensaje inesperado.
- **Informar al Contralor** al finalizar. Referencia: Contralor/ESTATUS_AVANCE.md, Contralor/REPORTE_USUARIOS_DEMO_POR_PLAN.md.
