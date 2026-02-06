# Plan de pruebas: Navegación, botones y funciones (Login → Chatbot)

**Fecha:** Febrero 2026  
**Objetivo:** Probar el flujo completo desde login hasta uso del chatbot y navegación por rol (Admin PH, Platform Admin, Residente).  
**Responsable ejecución:** QA  
**Referencia:** Contralor/ESTATUS_AVANCE.md  

**Nota:** En este plan solo se documentan instrucciones y resultados. El código lo genera siempre el Coder.

---

## Barra de progreso de la prueba

```
[✅ 1.Login] [✅ 2.Admin PH] [✅ 3.Platform Admin] [✅ 4.Chatbot] [✅ 5.Residentes] [✅ 6.Smoke]
                                                                                         PLAN COMPLETADO
```

| Etapa | Nombre | Estado | Nota |
|-------|--------|--------|------|
| 1 | Flujo Login | ✅ Aprobado | Coder corrigió `parent_subscription_id`. QA validó OK. |
| 2 | Dashboard Admin PH | ✅ Aprobado | QA re-ejecutó 2.1–2.9. Todas las rutas 200. |
| 3 | Platform Admin (Henry) | ✅ Aprobado | QA re-ejecutó 3.1–3.6. Todas las rutas 200. |
| 4 | Landing → Chatbot | ✅ Aprobado | /api/chatbot/config 200, rutas residentes 200. |
| 5 | Páginas Residentes | ✅ Aprobado | /residentes/* todas 200. |
| 6 | Smoke test rutas | ✅ Aprobado | /, /login, /demo, /pricing, /register → 200. |

**Por donde vamos:** Plan de pruebas completado. Todas las etapas 1–6 aprobadas.

**Validación §E (abandono de sala):** Fuera del alcance de las etapas 1–6. Según QA_FEEDBACK.md (06 Feb): BD + API listos; **QA puede revalidar §E** cuando la tabla `resident_abandon_events` exista en el entorno. Pendientes opcionales: botón "Cerrar sesión", alerta, vista Admin PH con abandonos. Estatus: revalidación §E pendiente cuando QA ejecute la prueba.

### Hallazgo Marketing (26 Feb 2026) – Validación demo chatbot por perfil
| Perfil | Qué validar |
|--------|-------------|
| Asamblea activa | Votación y Tema del día habilitados |
| Asamblea programada | Solo Asambleas/Calendario habilitados; Votación/Tema deshabilitados |
| Pre-registro | Residente validado sin asambleas; botones según contexto |
| Sin asambleas año en curso | Mensaje "No hay asambleas programadas. ¿Consultar con el administrador?" |

### Hallazgo Marketing (26 Feb 2026) – Lógica chatbot residente
| Elemento | Hallazgo | Acción |
|----------|----------|--------|
| Botones residente | Se muestran aunque el correo NO esté validado | Coder: mostrar botones solo cuando `residentEmailValidated === true`. Ver Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md |
| Flujo esperado | Si correo no encontrado: mensaje "Contacta al administrador" + NO botones; si validado: SÍ botones | Instrucciones en Marketing/INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md §2. |

### Resultado ejecución Punto 3 (Platform Admin) – anterior (pre-corrección)

| # | Ruta | HTTP | Resultado |
|---|------|------|-----------|
| 3.1 | /dashboard/platform-admin | 500 | ❌ |
| 3.2 | /platform-admin/monitoring | 500 | ❌ |
| 3.3 | /platform-admin/clients | 500 | ❌ |
| 3.4 | /platform-admin/business | 500 | ❌ |
| 3.5 | /platform-admin/leads | 500 | ❌ |
| 3.6 | /platform-admin/chatbot-config | 500 | ❌ |
| - | /api/chatbot/config | 500 | ❌ |

**Causa (ya corregida):** Bloqueador Module not found @/ y duplicate export/const. Coder aplicó correcciones. **QA debe re-ejecutar etapas 2 y 3.**

---

### Coder informa corrección (registro)

| Fecha | Corrección | Archivo / detalle | Etapa que desbloquea |
|-------|------------|-------------------|----------------------|
| Feb 2026 | `parent_subscription_id` en tabla `organizations` | `sql_snippets/auth_otp_local.sql` (CREATE + ALTER) | 1 – Login (verify-otp) |
| Feb 2026 | Eliminada segunda definición `AssembliesPage` (duplicate export default) | `src/app/dashboard/admin-ph/assemblies/page.tsx` | 2 – Dashboard Admin PH |
| Feb 2026 | Imports alias `@/` → rutas relativas | admin-ph/page, checkout, pricing, AssemblyCreditsDisplay, API routes, validateSubscriptionLimits | 2 y 3 |
| Feb 2026 | Duplicate export/const eliminados | team, owners, settings, support, votations (una sola definición por página) | 2 – Admin PH 2.1–2.9 |
| Feb 2026 | `"use client"` en acts y reports | `src/app/dashboard/admin-ph/acts/page.tsx`, `reports/page.tsx` | 2 – Actas y Reportes |
| 26 Feb 2026 | GET /api/chatbot/config: si tabla no existe (42P01) devuelve [] en lugar de 500 | `src/app/api/chatbot/config/route.ts` | 3.6 y 4.2 – Chatbot config |

**Siguiente:** QA re-ejecuta etapas 2 y 3 y reporta en QA_FEEDBACK.md + historial Contralor.

---

## Prerequisitos

- Docker arriba (`docker compose up -d`).
- Login OTP funcionando (verify-otp sin error; si falla, ver bloqueador `parent_subscription_id` en ESTATUS_AVANCE).
- App en **http://localhost:3000**.

---

## 1. Flujo Login completo

| # | Paso | Acción | Resultado esperado |
|---|------|--------|--------------------|
| 1.1 | Email | Ir a `/login`, ingresar email (ej. `demo@assembly2.com` o el configurado en BD). | Sin error; paso a ingreso de OTP. |
| 1.2 | OTP | Ver código (pantalla con OTP_DEBUG, o logs/SQL). Ingresar código. | Sin error; redirección según rol. |
| 1.3 | Redirección Admin PH | Login con usuario que no es platform-admin ni demo. | Redirección a `/dashboard/admin-ph`. |
| 1.4 | Redirección Demo | Login con usuario demo. | Redirección a `/dashboard/admin-ph?mode=demo`. |
| 1.5 | Redirección Platform Admin | Login con usuario `is_platform_owner` o rol ADMIN_PLATAFORMA. | Redirección a `/dashboard/platform-admin`. |

---

## 2. Navegación Dashboard Admin PH (tras login como Admin PH)

| # | Ruta / Sección | Acción | Resultado esperado |
|---|----------------|--------|--------------------|
| 2.1 | Resumen | Entrar a `/dashboard/admin-ph`. | Página carga; sidebar con 8 secciones. |
| 2.2 | Propietarios | Clic en **Propietarios** / ir a `/dashboard/admin-ph/owners`. | Lista o vacío; sin 404 ni 500. |
| 2.3 | Asambleas | Clic en **Asambleas** / `/dashboard/admin-ph/assemblies`. | Lista o vacío; botones coherentes. |
| 2.4 | Votaciones | Clic en **Votaciones** / `/dashboard/admin-ph/votations`. | Vista de votaciones; sin error. |
| 2.5 | Actas | Clic en **Actas** / `/dashboard/admin-ph/acts`. | Vista actas; opción generar acta si aplica. |
| 2.6 | Reportes | Clic en **Reportes** / `/dashboard/admin-ph/reports`. | Vista reportes; exportar si aplica. |
| 2.7 | Equipo | Clic en **Equipo** / `/dashboard/admin-ph/team`. | Visible si permisos; sin error. |
| 2.8 | Configuración | Clic en **Configuración** / `/dashboard/admin-ph/settings`. | Página carga. |
| 2.9 | Soporte | Clic en **Soporte** / `/dashboard/admin-ph/support`. | Página carga. |

**Botones:** En cada sección, pulsar los botones principales (ej. "Nueva asamblea", "Generar acta") y comprobar que no rompen (pueden abrir modal o navegar).

---

## 3. Navegación Platform Admin (Henry) – si hay usuario platform-admin

| # | Ruta / Sección | Acción | Resultado esperado |
|---|----------------|--------|--------------------|
| 3.1 | Inicio | Entrar a `/dashboard/platform-admin`. | Dashboard Henry carga. |
| 3.2 | Monitor | Ir a `/platform-admin/monitoring` (o enlace desde dashboard). | Métricas / gráficas o placeholder. |
| 3.3 | Clientes | Ir a `/platform-admin/clients`. | Lista PHs/clientes o vacío. |
| 3.4 | Negocio | Ir a `/platform-admin/business`. | Métricas de negocio. |
| 3.5 | Leads | Ir a `/platform-admin/leads`. | Lista leads desde BD. |
| 3.6 | Config Chatbot | Ir a `/platform-admin/chatbot-config`. | GET/PUT de configuración chatbot. |

---

## 4. Landing → Chatbot y botones de navegación rápida

| # | Paso | Acción | Resultado esperado |
|---|------|--------|--------------------|
| 4.1 | Abrir chatbot | En **http://localhost:3000** (landing), abrir el chatbot (botón/flotante). | Panel del chatbot se abre. |
| 4.2 | Config inicial | (Opcional) Verificar que se llama a `/api/chatbot/config` al abrir. | Sin error en red; respuestas coherentes. |
| 4.3 | Botón "Votación" | Pulsar acción rápida **Votación** (o equivalente). | Mensaje + navegación a `/residentes/votacion`. |
| 4.4 | Botón "Asambleas" | Pulsar **Asambleas**. | Navegación a `/residentes/asambleas`. |
| 4.5 | Botón "Calendario" | Pulsar **Calendario**. | Navegación a `/residentes/calendario`. |
| 4.6 | Botón "Tema del día" | Pulsar **Tema del día**. | Navegación a `/residentes/tema-del-dia`. |
| 4.7 | Botón "Ceder poder" | Pulsar **Ceder poder**. | Navegación a `/residentes/poder`. |

---

## 5. Páginas Residentes (tras navegación desde chatbot o directo)

| # | Ruta | Acción | Resultado esperado |
|---|------|--------|--------------------|
| 5.1 | `/residentes/votacion` | Abrir URL directa o desde chatbot. | Página carga; sin 500. |
| 5.2 | `/residentes/asambleas` | Idem. | Página carga. |
| 5.3 | `/residentes/calendario` | Idem. | Página carga. |
| 5.4 | `/residentes/tema-del-dia` | Idem. | Página carga. |
| 5.5 | `/residentes/poder` | Idem. | Página carga. |

---

## 6. Otras rutas útiles (smoke test)

| # | Ruta | Resultado esperado |
|---|------|--------------------|
| 6.1 | `/` | Landing carga. |
| 6.2 | `/login` | Formulario login. |
| 6.3 | `/demo` | Página demo; CTA "Entrar al demo". |
| 6.4 | `/pricing` | Página de precios; selector de plan si aplica. |
| 6.5 | `/register` | Página de registro (si existe). |

---

## 7. Criterio de éxito y reporte

- **Éxito:** Todas las rutas cargan sin 500; botones de navegación y acciones rápidas del chatbot llevan a la URL esperada; login redirige según rol.
- **Fallos:** Anotar ruta, acción y mensaje de error (pantalla o consola).

### Entregables de la respuesta QA (obligatorios)

| Entregable | Contenido |
|------------|-----------|
| **QA/QA_FEEDBACK.md** | Informe detallado de la ejecución (qué se probó, resultado por sección, fallos con ruta/acción/error). |
| **Contralor/ESTATUS_AVANCE.md** | Entrada en el historial de cambios (ej.: "QA ejecutó plan navegación Login→Chatbot – resultado OK / bloqueadores: …"). |

---

## Orden sugerido de ejecución

1. Login completo (1.1–1.5).  
2. Dashboard Admin PH – todas las secciones (2.1–2.9).  
3. Landing → abrir chatbot → probar cada botón de navegación rápida (4.1–4.7).  
4. Páginas residentes (5.1–5.5).  
5. Si hay usuario platform-admin: sección 3.  
6. Smoke test rutas (6.1–6.5).

---

## ▶ SIGUIENTE PASO (al cierre de este plan)

**Instrucción para copiar y pegar (para QA):**
```
Ejecutar etapa 4 del plan: Landing → Chatbot y botones de navegación rápida (4.1–4.7). Documento: QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md. Reportar resultado en QA/QA_FEEDBACK.md y añadir entrada en el historial de Contralor/ESTATUS_AVANCE.md.
```

**Instrucción para copiar y pegar (para Coder, cuando QA reporte correcciones):**
```
Corregir los bloqueadores o errores indicados en QA/QA_FEEDBACK.md (etapa que corresponda del plan de pruebas). Implementar solo lo que QA reporta. Confirmar cuando esté listo.
```

**Regla:** El código lo genera siempre el Coder. QA solo prueba y reporta; este plan solo documenta instrucciones.
