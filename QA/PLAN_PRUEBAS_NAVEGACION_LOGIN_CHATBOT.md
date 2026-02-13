# Plan de pruebas: Navegación, botones y funciones (Login → Chatbot)

**Fecha:** Febrero 2026  
**Objetivo:** Probar el flujo completo desde login hasta uso del chatbot y navegación por rol (Admin PH, Platform Admin, Residente).  
**Responsable ejecución:** QA  
**Referencia:** Contralor/ESTATUS_AVANCE.md  

**Nota:** En este plan solo se documentan instrucciones y resultados. El código lo genera siempre el Coder.

---

## Barra de progreso de las pruebas

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

**Fase actual de las pruebas (Contralor confirma):** Etapas 1–6 del plan de navegación **completadas y aprobadas**. Face ID (TAREA 5): Database ejecutó script 101; QA revalidó Face ID e informó al Contralor. **Estado:** cerrado. Próxima tarea la asigna el Contralor.

**Validación §E (abandono de sala):** Fuera del alcance de las etapas 1–6. Según QA_FEEDBACK.md (06 Feb): BD + API listos; **QA puede revalidar §E** cuando la tabla `resident_abandon_events` exista en el entorno. Pendientes opcionales: botón "Cerrar sesión", alerta, vista Admin PH con abandonos. Estatus: revalidación §E pendiente cuando QA ejecute la prueba.

### Validación §J + Recomendación #14 (Marketing) – Residente con asamblea activa
**Registro:** §J y recomendación #14 están registrados en Contralor/ESTATUS_AVANCE.md con instrucción explícita para el Coder. Este bloque es el **checklist de validación** que QA debe ejecutar cuando corresponda.

**Fuente:** Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md – Sección §J y Recomendación #14.

Cuando QA ejecute pruebas de chatbot con **residente validado y asamblea activa**, validar:

| # | Punto (§J / rec 14) | Qué validar | OK / Pendiente |
|---|---------------------|-------------|----------------|
| 1 | Mensaje de bienvenida | Texto específico para residente: "Hola [Nombre]. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0." – NO texto B2B (leads/demos). | ☐ |
| 2 | Identidad / correo en chat | Correo del residente visible en cabecera o primera burbuja (además de nombre y unidad). | ☐ |
| 3 | Clic en "Votación" | Respuesta **dentro del chat**: card/mensaje con título "Votación activa", texto "Tienes una votación abierta. ¿Participar?", botón "Ir a votar" – sin redirigir hasta que el usuario confirme. | ☐ |
| 4 | Badge "Asamblea activa" | Indicador visible (badge junto a cabecera o inicio del chat) cuando hay asamblea activa. | ☐ |

Reportar resultado en QA/QA_FEEDBACK.md (sección §J / rec 14). Referencia: Contralor/ESTATUS_AVANCE.md.

### Hallazgo Marketing (07 Feb 2026) – §K Mensaje y botones /residentes/chat
| Qué validar | Esperado |
|-------------|----------|
| Tras cerrar sesión en /residentes/chat | Mensaje "chatbot para asambleas de PH" (no "Califica leads") |
| Botones en /residentes/chat | NO los 4 perfiles (Admin/Junta/Residente/Demo); solo flujo residente |

### Hallazgo Marketing (07 Feb 2026) – Chatbot más inteligente + Gemini
| Qué validar | Esperado |
|-------------|----------|
| Residente validado escribe "¿Qué más hay?" | Respuesta coherente (opciones Votación, Asambleas, etc.), NO "No encuentro ese correo" |
| Residente validado escribe "ya estoy registrado" | Confirmación y oferta de ayuda, NO validación de correo |
| Conexión Gemini | API responde; GEMINI_API_KEY configurada |

### Prueba sugerida: Chatbot Gemini (residente validado + texto libre)
**Origen:** Reporte Coder al Contralor. Validación sugerida para QA según ESTATUS_AVANCE § "Para QA – Validación Chatbot más inteligente con Gemini".

**Prerequisitos:** App corriendo (local o Docker). Variable `GEMINI_API_KEY` configurada en el entorno de la app (si no está, la API devuelve 503 y el bot mostrará mensaje de error).

**Pasos:**

| Paso | Acción | Resultado esperado | OK / Fallo |
|------|--------|--------------------|------------|
| 1 | Abrir **http://localhost:3000** (o **/residentes/chat**). | Carga el chat (Lex). | ☐ |
| 2 | Elegir perfil **Residente** (escribir "residente" o clic si aplica). | Bot pide correo registrado en el PH. | ☐ |
| 3 | Escribir un correo de prueba: `residente1@demo.assembly2.com`. | Bot indica envío de PIN (y en modo local puede mostrar "Código de prueba: XXXXXX"). | ☐ |
| 4 | Escribir el PIN recibido (o el mostrado en modo local). | Mensaje de bienvenida "Hola ... Soy Lex..." y botones (Votación, Asambleas, etc.). | ☐ |
| 5 | Escribir **"¿Qué más hay?"** y Enviar. | Lex responde con opciones (Votación, Asambleas, Calendario, Tema del día, Ceder poder). **NO** debe decir "No encuentro ese correo". | ☐ |
| 6 | Escribir **"ya estoy registrado"** (o "ya toy registrado") y Enviar. | Lex confirma que está validado y ofrece ayuda/opciones. **NO** debe pedir correo ni decir "No encuentro ese correo". | ☐ |
| 7 | (Opcional) Escribir **"¿Cómo voto?"** o **"¿Cuál es el tema?"**. | Respuesta coherente (instrucciones breves o tema activo). | ☐ |

**Criterio de aprobación:** Los pasos 5 y 6 son obligatorios: el bot **nunca** responde "No encuentro ese correo" cuando el residente ya está validado y escribe texto libre.

**Si GEMINI_API_KEY no está configurada:** El bot puede mostrar "No pude conectar..." o "Chat con Gemini no configurado". En ese caso documentar en QA_FEEDBACK.md como "Chatbot Gemini: no ejecutado – falta GEMINI_API_KEY".

**Reportar resultado en:** QA/QA_FEEDBACK.md (sección Chatbot Gemini). Informar al Contralor al finalizar.

### Hallazgo Marketing (26 Ene 2026) – Página chatbot residentes §I
| Perfil | Entrada | Destino tras validar / cerrar sesión |
|--------|---------|--------------------------------------|
| Perfil 1 | Landing `/` | Validar correo → `/residentes/chat`; Cerrar sesión → `/residentes/chat` |
| Perfil 2 | Link directo `/residentes/chat` | Validar correo en esa página; Cerrar sesión → permanece en `/residentes/chat` |
**Regla:** El residente nunca termina en landing tras cerrar sesión; siempre va a `/residentes/chat`.

### Prueba: PH A y PH B con assembly-context
**Objetivo:** Validar que la API `GET /api/assembly-context` devuelve el contexto correcto según BD (PH A activa, PH B programada) y según override `?profile=`.

**Referencia:** Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md

| # | Prueba | Parámetro | Resultado esperado |
|---|--------|-----------|-------------------|
| 1 | PH A (Demo) | `?organization_id=11111111-1111-1111-1111-111111111111` | `{"context":"activa"}` |
| 2 | PH B (Torres) | `?organization_id=22222222-2222-2222-2222-222222222222` | `{"context":"programada"}` |
| 3 | Override activa | `?profile=activa` | `{"context":"activa"}` |
| 4 | Override programada | `?profile=programada` | `{"context":"programada"}` |
| 5 | Override sin asambleas | `?profile=sin_asambleas` | `{"context":"sin_asambleas"}` |

**Reportar en:** QA/QA_FEEDBACK.md § "PH A y PH B assembly-context".

---

## Tarea QA: Validación redirección por rol (todos los perfiles)

**Objetivo:** Verificar que cada rol se redirige a la zona correcta tras login OTP. Revisar todos los perfiles según docs/USUARIOS_DEMO_BD.md.

**Orden Contralor:** Primero se hace **backup** de todo (Henry autoriza → Contralor commit + push). Después QA ejecuta esta tarea.

**Usuarios de prueba:** Ver docs/USUARIOS_DEMO_BD.md (emails y roles).

| # | Rol | Usuario de prueba | Zona esperada tras login | Qué validar | OK / Fallo |
|---|-----|-------------------|--------------------------|--------------|------------|
| 1 | **Residente** | residente1@demo.assembly2.com o residente2@demo.assembly2.com | **/residentes/chat** (chatbot de residentes) | No debe ir a Dashboard Admin PH ni a Platform Admin. Debe ver el chat Lex y flujo residente. | ✅ OK |
| 2 | **Admin PH** | demo@assembly2.com (PH A) | **/dashboard/admin-ph** (zona Admin PH) | Dashboard con Propietarios, Asambleas, Votaciones, etc. | ✅ OK |
| 3 | **Admin PH** | admin@torresdelpacifico.com (PH B) | **/dashboard/admin-ph** | Idem. | ✅ OK |
| 4 | **Platform Admin (Henry)** | henry.batista27@gmail.com | **/dashboard/platform-admin** (zona Henry) | Dashboard plataforma (monitoring, clients, leads, etc.). | ✅ OK |

**Criterio de aprobación:** Los 4 perfiles redirigen a la zona indicada. En especial: **ningún residente** (role RESIDENTE) debe terminar en `/dashboard/admin-ph`.

**Resultado:** ✅ **Aprobado.** QA ejecutó y reportó en QA/QA_FEEDBACK.md § "QA Validación · Redirección por rol (todos los perfiles)". Contralor actualizó informes. Siguiente: más pruebas (abajo).

---

## Próximas pruebas (más pruebas)

Tras cerrar la validación redirección por rol, QA puede seguir con cualquiera de estas (orden sugerido por prioridad):

| # | Prueba | Dónde está | Qué validar |
|---|--------|-------------|-------------|
| 1 | **§J + Recomendación #14** (residente con asamblea activa) | Arriba en este doc; QA_FEEDBACK ya tiene 4/4 en código | En navegador: mensaje bienvenida, correo en chat, card Votación, badge "Asamblea activa". |
| 2 | **Chatbot Gemini** (texto libre con residente validado) | Arriba § "Prueba sugerida: Chatbot Gemini" | "¿Qué más hay?", "ya estoy registrado" → respuestas coherentes; no "No encuentro ese correo". GEMINI_API_KEY. |
| 3 | **§K** – Mensaje y botones /residentes/chat | Arriba § "Hallazgo Marketing §K" | Tras cerrar sesión: mensaje "chatbot para asambleas de PH"; solo flujo residente (no 4 perfiles). |
| 4 | **Validación demo por perfil** (asamblea activa/programada/pre-registro) | Arriba § "Hallazgo Marketing – Validación demo chatbot por perfil" | Botones según contexto; mensaje "No hay asambleas programadas" cuando aplique. |
| 5 | **PH A y PH B assembly-context** | Arriba § "Prueba: PH A y PH B con assembly-context" | GET /api/assembly-context con organization_id y ?profile= → context activa/programada/sin_asambleas. |
| 6 | **Revalidación §E** (abandono de sala) | ESTATUS_AVANCE; tabla resident_abandon_events | Cuando la tabla exista en entorno: API y flujo de abandonos. Opcional: botón Cerrar sesión, alerta, vista Admin PH. |

Reportar cada resultado en QA/QA_FEEDBACK.md en la sección correspondiente. Informar al Contralor al finalizar cada una.

---

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
| 1.3 | Redirección **Residente** | Login con residente1@demo.assembly2.com o residente2@ (rol RESIDENTE). | Redirección a **/residentes/chat** (chatbot). No a Admin PH. |
| 1.4 | Redirección Admin PH | Login con demo@assembly2.com o admin@torresdelpacifico.com (rol ADMIN_PH). | Redirección a `/dashboard/admin-ph` (demo con ?mode=demo si aplica). |
| 1.5 | Redirección Platform Admin (Henry) | Login con henry.batista27@gmail.com (ADMIN_PLATAFORMA). | Redirección a `/dashboard/platform-admin`. |

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
