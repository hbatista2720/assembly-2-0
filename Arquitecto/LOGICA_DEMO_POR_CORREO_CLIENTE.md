# Especificación: Demo por correo del cliente nuevo (Administrador PH)

**Rol:** Arquitecto  
**Fecha:** Febrero 2026  
**Origen:** Marketing/MARKETING_PROPUESTA_DEMO_POR_CORREO_CLIENTE.md (validado por Arquitecto)  
**Referencias:** docs/LOGICA_DEMO_CLIENTE_NUEVO_CHATBOT.md, docs/USUARIOS_DEMO_BD.md, ARQUITECTURA_LOGIN_AUTENTICACION.md

---

## 1. Objetivo

En lugar de un único demo compartido (`demo@assembly2.com`), **crear un demo ligado al correo** que el visitante (perfil "Administrador PH" o "Solo demo") ingresa en el chatbot. El cliente entra al demo con **su propio correo** (OTP a ese correo) y ve su dashboard demo con la misma regla: 50 residentes, 1 crédito, 15 días (contenido tipo Urban Tower).

---

## 2. Flujo de usuario (resumen)

| Paso | Actor | Acción |
|------|--------|--------|
| 1 | Visitante | En chatbot elige "Administrador PH" o "Solo demo" e ingresa su correo. |
| 2 | Sistema | Guarda lead (como hoy) y llama a API para crear/reservar demo por ese correo. |
| 3 | Sistema | Si es nuevo: crea usuario + organización demo; si ya existe demo vigente: no duplica, devuelve "ya tienes demo". |
| 4 | Chatbot | Muestra mensaje: "Tu demo está listo. Entra con este correo en [link a /login]." (y opcional: enviar email). |
| 5 | Cliente | Va a /login, ingresa su correo, recibe OTP, ingresa PIN → redirección a `/dashboard/admin-ph?mode=demo`. |

---

## 3. Flujo técnico

### 3.1 Momento de creación del demo

- **Disparador:** Cuando el visitante, en el chatbot (landing o /chat), ha elegido perfil **"Administrador PH"** o **"Solo demo"** y ha proporcionado un **correo válido** (formato email).
- **Acciones en secuencia:**
  1. **Guardar lead** (como hoy): persistir en `platform_leads` (email, lead_source, funnel_stage) o al menos en localStorage. Si existe API POST para leads, llamarla con email y funnel_stage `demo_requested` o `new`.
  2. **Llamar API crear demo:** `POST /api/demo/request` (o nombre acordado) con body `{ "email": "cliente@ejemplo.com" }`.
  3. **Backend:** Crear o reutilizar usuario + organización demo (ver §4). Devolver `{ success, already_exists?, login_url?, message }`.
  4. **Chatbot:** Mostrar mensaje al usuario según respuesta (demo listo + link a /login, o "Ya tienes un demo activo, entra aquí [link]").

### 3.2 Login con ese correo

- El flujo de login existente (**request-otp** → **verify-otp**) se mantiene.
- El usuario creado para el demo tiene `organization_id` apuntando a una organización con `is_demo = true`.
- Tras **verify-otp**, el backend devuelve (como hoy) la información del usuario y de la organización (`is_demo: true`). El front redirige a `/dashboard/admin-ph?mode=demo` cuando corresponda.
- No se requiere cambio en la lógica de verify-otp salvo asegurar que usuarios con org `is_demo=true` se traten como demo (ya documentado).

---

## 4. Modelo de datos y reglas de negocio

### 4.1 Organización demo por correo

- **Una organización demo por correo** (por solicitud desde chatbot). Cada organización tiene:
  - `is_demo = true`
  - Nombre identificable (ej. "Demo - P.H. Urban Tower" o "Demo - cliente@ejemplo.com")
  - **Expiración:** 15 días desde la creación. Implementación: columna `demo_expires_at` en `organizations` (o usar `subscriptions.trial_ends_at` si la suscripción DEMO ya tiene trial). Si no existe, añadir `demo_expires_at TIMESTAMPTZ NULL` en `organizations` para orgs con `is_demo = true`.
- **Contenido:** Mismo contenido que el demo actual: límite 50 unidades, 1 crédito, 15 días. Se puede reutilizar la misma estructura de datos que "Urban Tower" (PH de plantilla) o clonar; decisión de implementación: Coder/Database (objetivo: que el usuario vea un PH de ejemplo con 50 residentes y 1 crédito).

### 4.2 Usuario

- **Un usuario** por ese correo, con:
  - `email` = correo ingresado por el visitante
  - `role` = `ADMIN_PH`
  - `organization_id` = id de la organización demo creada (o ya existente para ese correo)
- Si el correo **ya existe** en `users` y está vinculado a una organización demo **no expirada** (`demo_expires_at > NOW()` o equivalente): **no crear otra org ni otro usuario**. Devolver éxito con `already_exists: true` y `login_url: "/login"` (o URL base).

### 4.3 Límites y reutilización

- **Un demo activo por correo:** A un mismo correo no se le crean dos organizaciones demo vigentes. Si vuelve a solicitar y ya tiene demo vigente → respuesta "ya tienes demo, entra aquí" con link a /login.
- **Expiración 15 días:** Tras 15 días, la organización demo puede considerarse expirada (no se elimina necesariamente; el usuario puede quedar sin acceso o ver mensaje "Demo vencido"). Política de re-solicitud: si el demo está vencido, se puede permitir una nueva solicitud (mismo correo) que cree una nueva org demo o extienda; queda a criterio de Contralor/Product Owner. Para la primera versión: **una sola creación por correo**; si ya existe usuario con org demo (vigente o vencida), devolver "Ya tienes una cuenta demo; entra en [link]".
- **Límite global opcional:** Para evitar abuso, se puede limitar el número de demos creados por día o por IP (ej. rate limit en `POST /api/demo/request`). Detalle: Contralor/Coder.

### 4.5 Cantidad total de demos y aislamiento de datos

- **Cantidad:** Se pueden crear **tantos demos como correos distintos** (N correos → N demos). No hay en esta especificación un tope máximo obligatorio de demos en la plataforma; cada nueva solicitud con un correo **nuevo** crea un nuevo usuario + nueva organización demo.
- **Aislamiento:** Cada demo es **una organización distinta** y **un usuario** ligado solo a esa organización. Los datos (asambleas, propietarios, votaciones, actas, etc.) viven por organización. Por tanto **no hay cruce de datos** entre un demo y otro: el demo de `cliente1@empresa.com` y el de `cliente2@otra.com` son independientes; ninguno ve ni modifica datos del otro.
- **Resumen:** Regla por correo = **1 demo por correo**. Regla global = **N demos posibles** (uno por cada correo distinto), con **datos 100 % aislados** entre demos.

### 4.4 Lead (platform_leads)

- Al crear o reutilizar demo, actualizar lead si existe: `funnel_stage = 'demo_active'` (o `'demo_requested'`) y `updated_at = NOW()`. Si no existe fila para ese email, crearla (email, lead_source='chatbot', funnel_stage='demo_active' o 'demo_requested').

---

## 5. Regla de demo contra abuso

Objetivo: permitir un demo por visitante legítimo y limitar abusos (múltiples demos por persona, bots, spam de solicitudes). El Coder debe implementar al menos las reglas **obligatorias**; las **recomendadas** (rate limit) son fuertes recomendaciones para producción.

### 5.1 Reglas obligatorias

| # | Regla | Comportamiento | Qué evita |
|---|--------|----------------|-----------|
| 1 | **Un demo por correo** | Un mismo correo solo puede tener una organización demo + un usuario. Si el correo ya existe en `users` con org demo (vigente o vencida), no crear otra org ni otro usuario; devolver `already_exists: true` y mensaje "Ya tienes una cuenta demo; entra en [link]". | Que una misma persona genere muchos demos con el mismo correo. |
| 2 | **Expiración 15 días** | Toda organización demo tiene `demo_expires_at = fecha_creación + 15 días`. Pasados 15 días el demo se considera vencido (acceso denegado o mensaje "Demo vencido"). | Demos perpetuos sin conversión que consuman recursos. |
| 3 | **Un usuario y una org por demo** | Cada demo = exactamente 1 usuario (email) + 1 organización. Datos (asambleas, propietarios, votaciones) viven por organización; no se comparten entre demos. | Acumulación de varias orgs demo por un mismo "cliente" sin control. |

### 5.2 Reglas recomendadas (rate limit)

| # | Regla | Comportamiento sugerido | Qué evita |
|---|--------|-------------------------|-----------|
| 4 | **Límite por IP** | En `POST /api/demo/request`, rechazar si desde la misma IP ya se crearon X solicitudes en la última ventana (ej. **5 solicitudes por hora por IP**). Respuesta: **429** con mensaje genérico. | Bots o scripts que creen muchos demos desde una misma IP. |
| 5 | **Límite por correo** | Rechazar o ignorar si el mismo correo intenta crear demo más de Y veces en una ventana (ej. **3 solicitudes por día por email**). Puede devolver 200 con `already_exists: true` en lugar de 429 si ya existe demo. | Intentos repetidos de abuso con el mismo email. |

### 5.3 Resumen para implementación

- **Obligatorias:** (1) 1 demo por correo, (2) `demo_expires_at` 15 días, (3) aislamiento 1 usuario + 1 org por demo.
- **Recomendadas:** (4) Rate limit por IP (ej. 5/hora), (5) rate limit por email (ej. 3/día). Si se implementa rate limit, la API debe responder **429 Too Many Requests** cuando se supere el límite.
- **Mensaje al usuario cuando 429:** En el chatbot, si la API devuelve 429, mostrar mensaje genérico: "Demasiadas solicitudes. Intenta de nuevo en unos minutos o escribe a soporte."

---

## 6. API propuesta: POST /api/demo/request

- **Método:** POST  
- **Body:** `{ "email": "string" }` (correo obligatorio, formato email válido).  
- **Respuesta éxito (201 o 200):**
  - `{ "success": true, "already_exists": false, "login_url": "/login", "message": "Tu demo está listo. Entra con este correo en el enlace." }`
  - Si ya existía demo vigente: `{ "success": true, "already_exists": true, "login_url": "/login", "message": "Ya tienes un demo activo. Entra aquí." }`
- **Respuesta error (4xx):**
  - Email inválido: 400.
  - Rate limit (si se implementa): 429.
  - Cualquier otro error de creación: 500 con mensaje genérico.
- **Seguridad:** Aplicar regla de demo contra abuso (§5). Rate limit recomendado: 5 solicitudes por IP por hora y/o 3 por email por día; respuesta 429 si se supera.

---

## 7. Chatbot (cambios)

- **Dónde:** Donde hoy se captura el correo para perfil "Administrador PH" o "Solo demo" (ej. `src/app/page.tsx`, `src/app/chat/page.tsx`).
- **Qué hacer tras validar el correo:**
  1. Mantener guardado de lead en localStorage (y si hay API de leads, llamar POST para crear/actualizar lead).
  2. Llamar `POST /api/demo/request` con `{ email: correoDelUsuario }`.
  3. Según respuesta:
     - Si `success`: mostrar mensaje tipo "Tu demo está listo. Entra con este correo en [Entrar al demo]." (enlace a `/login`). Si `already_exists`: "Ya tienes un demo activo. [Entrar al demo]."
     - Si error: mostrar mensaje genérico "No pudimos preparar tu demo ahora. Intenta más tarde o escribe a soporte."
  4. No mostrar el "correo demo sugerido" ficticio (ej. `xxx-adminph@demo.assembly.local`); el usuario usa **su propio correo** para entrar.
  5. Si la API devuelve **429** (rate limit): mostrar "Demasiadas solicitudes. Intenta de nuevo en unos minutos o escribe a soporte."

---

## 8. Email opcional (posterior)

- Opcional: tras crear el demo, enviar un email al correo del usuario con el enlace a /login y texto "Tu demo de Assembly 2.0 está listo. Entra con este correo." No es obligatorio para la primera implementación; puede dejarse para una fase siguiente.

---

## 9. Compatibilidad con demo global (demo@assembly2.com)

- El usuario **demo@assembly2.com** y la organización "Demo - P.H. Urban Tower" existentes **se mantienen** para pruebas internas y QA. El nuevo flujo es **adicional**: demos creados por correo desde el chatbot conviven con el demo global. En login, ambos tipos de usuario (demo@ y cliente@ejemplo.com con org demo) deben recibir `is_demo: true` y redirección a dashboard admin-ph en modo demo.

---

## 10. Resumen para el Coder

| Tarea | Descripción |
|-------|-------------|
| BD | Añadir `demo_expires_at` en `organizations` si no existe; o usar suscripción DEMO con trial_ends_at. Crear función o script para "crear org demo + usuario" (contenido tipo Urban Tower: 50 unidades, 1 crédito). |
| API | Implementar `POST /api/demo/request` con body `{ email }`. Crear usuario + organización demo o reutilizar; devolver success, already_exists, login_url, message. Aplicar **regla de demo contra abuso** (§5): obligatorio 1 demo por correo, demo_expires_at 15 días, aislamiento; recomendado rate limit por IP (ej. 5/hora) y por email (ej. 3/día), respuesta 429 si se supera. |
| Chatbot | Tras capturar correo (perfil Admin PH o Solo demo): llamar POST /api/demo/request; mostrar mensaje con link a /login; dejar de mostrar correo demo ficticio. |
| Leads | Al crear/reutilizar demo, crear o actualizar fila en `platform_leads` (funnel_stage demo_requested/demo_active). |
| Login | Sin cambios; el usuario creado ya tiene org is_demo=true; verify-otp debe seguir devolviendo is_demo y el front redirige a dashboard demo. |

**Orden sugerido:** (1) BD y API, (2) Chatbot, (3) Leads y (4) pruebas de extremo a extremo.

---

**El Arquitecto no genera código; esta especificación es la base para la instrucción al Coder.**  
**Priorización y asignación de fase:** Contralor con Henry.

---

## Estado de implementación (Coder)

| § | Tarea | Estado |
|---|--------|--------|
| 4 | Organización demo con `demo_expires_at` 15 días | ✅ Migración 015. API crea org con demo_expires_at. |
| 4 | Usuario ADMIN_PH por correo, 1 por org demo | ✅ POST /api/demo/request crea usuario + org. |
| 4.3 | Un demo activo por correo; ya existe → already_exists | ✅ |
| 5 | Reglas contra abuso: 1 demo/correo, 15 días, rate limit | ✅ Rate limit por IP (016) y por email; 429 si se supera. |
| 6 | API POST /api/demo/request | ✅ Implementada en src/app/api/demo/request/route.ts. |
| 7 | Chatbot: llamar API, mensaje con link /login, sin correo ficticio | ✅ Landing (page.tsx) y /chat (chat/page.tsx). |
| 4.4 | platform_leads funnel_stage demo_active | ✅ upsertLead en la API. |
| 9 | Compatibilidad demo@assembly2.com | ✅ verify-otp trata is_demo; ambos redirigen a dashboard demo. |
