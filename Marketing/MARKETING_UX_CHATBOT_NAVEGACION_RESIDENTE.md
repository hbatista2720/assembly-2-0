# 📋 UX Chatbot y Navegación Residente – Hallazgos y Recomendaciones

**Fecha:** 26 Febrero 2026  
**Responsable:** Marketing B2B  
**Referencia:** Plan de pruebas navegación, experiencia residente  

---

## 🚨 HALLAZGOS REPORTADOS (Henry)

1. **"Me saca el ambiente chatbot"** – Al hacer clic en un botón del chatbot (ej. Asambleas), se navega a una página completa y se pierde el contexto del chat.

2. **"Volver a la landing me pide registrar nuevamente el correo"** – El botón "Volver a la landing" lleva a `/` y se pierde el estado del residente validado. Hay que ingresar el correo otra vez.

3. **"No guarda el usuario porque sale el ambiente de chatbot"** – No hay persistencia de sesión residente entre la landing y las páginas `/residentes/*`.

4. **"Botón Activar o Programar no tiene función lógica"** – Los badges ACTIVA y PROGRAMADA en las tarjetas de asambleas son solo visuales; no hacen nada al hacer clic.

5. **"No es una experiencia de chat"** – La transición entre chatbot y páginas residentes no se siente como un flujo continuo de chat.

6. **"Debe mostrar el correo o nombre del usuario, número de unidad"** – El chatbot no muestra estos datos una vez validado el residente.

7. **"Votación, Asambleas, Calendario me direcciona a landing fuera del chat"** – Al seleccionar estos botones se navega a páginas externas (`/residentes/votacion`, `/residentes/asambleas`, etc.). Debe **responder dentro del chat**, no sacar al usuario.

8. **Botón a landing en chatbot de residentes** – En el contexto de residente validado (y/o durante votación activa), existe un botón que lleva a la landing. Debe ser **"Cerrar sesión"** en su lugar, con alerta de abandono y registro para el admin PH.

---

## 🆕 PROPUESTAS UX (Marketing)

### A. Separación Landing vs Página Chatbot

**Contexto:**
- **Landing (`/`):** Pensada para **usuario nuevo / cliente potencial** – venta del producto (beneficios, precios, demo, CTA).
- **Usuario existente (residente, admin):** Debería ir a una **página dedicada de chatbot** con ventana visual de chat completa, sin mezclar con la landing de ventas.

**Recomendación:** Crear ruta `/chat` (o `/residentes/chat`) que sea una página centrada 100% en la ventana del chatbot, para usuarios que ya conocen Assembly y solo quieren usar Lex (residentes validados, admins, etc.). La landing queda para captación; el chat para operación.

**Flujo sugerido:**
- Usuario nuevo → `/` (landing) → chatbot flotante para calificación/venta.
- Usuario existente (link directo, QR, favoritos) → `/chat` → ventana full de chatbot, sin distracciones de ventas.

---

### B. Botones dentro del chat (referencia visual TAVIQ)

**Contexto:** La referencia TAVIQ muestra botones tipo *pill* integrados **dentro** del flujo del chat, no como sección aparte.

**Recomendación:** Sí, los botones deben estar **dentro del chat**:
- Aparecer como sugerencias/respuestas rápidas **debajo del último mensaje** y **encima del campo de texto**.
- Estilo pill (bordes redondeados), distribuidos en filas (ej. 2–3 por fila).
- Integrados visualmente con las burbujas del chat.
- Al seleccionar uno, se envía como mensaje del usuario y el bot responde.

**Beneficio:** Experiencia más conversacional y guiada; el usuario no tiene que "buscar" los botones fuera del contexto del chat.

---

### C. Mostrar identidad del residente en el chat

**Problema:** Tras validar el correo, el chatbot no muestra quién está conectado.

**Recomendación:** En el header o en un mensaje fijo del chat, mostrar:
- **Correo** del residente validado
- **Nombre** (si está en BD)
- **Número de unidad** (ej. A-101, Torre 2 Apt 305)

Ejemplo de copy: *"Hola, María · Unidad A-101 · residente@email.com"* o en el encabezado del panel del chat.

---

### D. Responder DENTRO del chat (no redirigir a landing)

**Problema:** Al hacer clic en Votación, Asambleas o Calendario, se navega a `/residentes/votacion`, `/residentes/asambleas`, etc. – el usuario sale del chat.

**Recomendación:** La respuesta debe mostrarse **dentro del chat**:
- **Votación:** Mostrar en el chat el tema del día, opciones de voto (Sí/No/Abstención) y confirmación, como mensajes/cards del chat. Si se necesita pantalla completa para votar, ofrecer enlace "Abrir en pantalla completa" como opción secundaria.
- **Asambleas:** Mostrar lista de asambleas activas y próximas como **cards o lista dentro del chat** (mensaje expandible del bot).
- **Calendario:** Mostrar próximas fechas como mensaje del bot (ej. las 3–5 próximas fechas clave).
- **Tema del día / Ceder poder:** Igual, contenido inline en el chat.

**Implementación sugerida:** Paneles/cards desplegables dentro del flujo de mensajes del chat, o un área expandible debajo del último mensaje del bot. Evitar `router.push` a páginas externas como acción principal; reservar enlace externo solo para "Ver más" o "Abrir en pantalla completa".

---

### E. Cerrar sesión (residente) + alerta de abandono + registro para Admin PH

**Contexto:** Cuando el residente está validado en el chatbot (o en votación activa), no debe haber botón que lo lleve a la landing. En su lugar:

**Recomendación:**

1. **Reemplazar botón "Volver a la landing"** por **"Cerrar sesión"** en el contexto del chatbot de residentes validados.

2. **Al hacer clic en "Cerrar sesión":**
   - Mostrar **alerta de confirmación**: *"Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?"*
   - Si confirma: cerrar sesión (limpiar `assembly_resident_*`, redirigir a landing o cerrar chat).

3. **Registro para Admin PH:**
   - Registrar en BD la **hora** en que el residente abandonó la sala/votación.
   - Tabla o campo sugerido: `resident_abandon_events` o columna en tabla de asistencia (ej. `left_at`, `abandoned_at`).
   - El Admin PH debe poder ver en su dashboard: *"Residente [nombre/unidad] abandonó la sala a las [hora]"* – porque afecta el quórum (la salida de un residente reduce el coeficiente presente).

**Valor de negocio:** Trazabilidad legal; el admin puede justificar cambios de quórum y saber quién abandonó y cuándo.

---

### F. Lógica de habilitación de botones por estado de asamblea

| Botón | Cuándo habilitar | Motivo |
|-------|------------------|--------|
| **Votación** | Solo cuando asamblea activa | No tiene sentido votar sin asamblea en curso. |
| **Asambleas** | Siempre | Muestra lista (activas + programadas); útil en cualquier momento. |
| **Calendario** | Siempre | Ver próximas fechas; no depende de la asamblea. |
| **Tema del día** | Solo cuando asamblea activa | El tema pertenece a la asamblea en vivo. |
| **Ceder poder** | Siempre | Se puede solicitar antes o durante la asamblea. |

**Si no hay asamblea activa:** mostrar Votación y Tema del día deshabilitados (gris) con texto tipo *"No hay votación activa"* o *"Habilitado cuando inicie la asamblea"*.

---

### G. Ceder poder: formulario dentro del chat

**Recomendación:** Al seleccionar "Ceder poder", el bot debe mostrar un **formulario inline** dentro del chat:
- Campo "Correo del apoderado"
- Botón "Enviar poder"
- No navegar a otra página; mantener la experiencia de chat.
- Validar correo y enviar la solicitud; confirmación como mensaje del bot.

---

### H. Validación usuario demo – perfiles por contexto de asamblea

Para pruebas y demo, validar el chatbot con estos **perfiles de contexto**:

| Perfil | Descripción | Comportamiento esperado |
|--------|-------------|-------------------------|
| **Asamblea activa** | Hay asamblea en curso (live) | Votación y Tema del día habilitados. Bot responde con tema y opciones de voto. |
| **Asamblea programada** | Hay asambleas próximas, ninguna activa | Votación y Tema del día deshabilitados. Asambleas y Calendario habilitados. |
| **Pre-registro** | Residente validado, sin asambleas | Botones según contexto (Asambleas, Calendario, Ceder poder habilitados). |
| **Sin asambleas año en curso** | No hay asambleas programadas | Mensaje: *"No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?"* – opción para contactar al admin o pedir más información. |

**Análisis de la idea:** El mensaje "No hay asambleas... ¿Consultar con el administrador?" evita dejar al residente sin respuesta y orienta a quién puede resolver (admin PH). Es coherente con la experiencia de soporte dentro del chat.

---

### I. Página de chatbot de residentes + flujos por perfil de usuario

**Contexto:** Los residentes registrados no deben terminar en la landing de ventas. Debe existir una **página de inicio del chatbot de residentes** como destino por defecto.

**Recomendación:**

1. **Crear página de chatbot de residentes** (ej. `/residentes/chat` o `/residentes`): página centrada en el chatbot, sin contenido de ventas. Es el "hogar" del residente validado.

2. **Al cerrar sesión o finalizar chat:** Redirigir al residente a la **página de chatbot de residentes** (no a la landing `/`). El residente ve el chatbot vacío con campo para volver a validar correo o iniciar sesión.

3. **Dos perfiles de usuario residente:**

| Perfil | Entrada | Destino tras validar / finalizar |
|--------|---------|-----------------------------------|
| **Perfil 1** | Entra por **landing** (`/`) | Tras validar correo → ir a **página chatbot residentes** (`/residentes/chat`). Tras cerrar sesión → volver a **página chatbot residentes**. |
| **Perfil 2** | Entra **directo** con link al chatbot de residentes (`/residentes/chat`) | Validación de correo en esa misma página. Cerrar sesión → permanece en **página chatbot residentes** (sin ir a landing). |

**Ruta sugerida:** `/residentes/chat` o `/residentes` como página de inicio del chatbot para residentes. La landing (`/`) queda solo para captación de leads; el residente nunca "aterriza" en landing tras cerrar sesión.

---

### J. Mejoras UX – Residente con asamblea activa (validación captura 26 Ene 2026)

**Contexto:** Al validar la interfaz del chatbot con residente y asamblea activa, se detectaron estos 4 puntos de mejora:

| # | Punto | Estado actual | Mejora sugerida |
|---|-------|---------------|-----------------|
| **1** | **Mensaje de bienvenida** | Texto genérico B2B: *"Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos."* – no corresponde a residentes. | Mensaje específico para residente: *"Hola [Nombre]. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0."* (o similar según tono de marca). |
| **2** | **Identidad del residente** | Nombre y unidad en cabecera; correo no visible en el chat. | Mostrar **correo** en el chat (cabecera o primera burbuja) para que el residente confirme que está logueado con la cuenta correcta. Complementa §C. |
| **3** | **Acción al clic en "Votación"** | El botón "Votación" solo se resalta; no hay respuesta al clic. | Al hacer clic, responder **dentro del chat** (card o mensaje): título "Votación activa", texto "Tienes una votación abierta. ¿Participar?", botón "Ir a votar". Todo inline, sin redirigir hasta que el usuario confirme. |
| **4** | **Indicador visual "Asamblea activa"** | No hay badge ni indicador visible. | Añadir badge o indicador (ej. *"Asamblea activa"* junto a la cabecera o al inicio del chat) para que el residente entienda de inmediato por qué Votación y Tema del día están disponibles. |

---

## 🎯 RECOMENDACIONES PARA EL CODER

### 1. Persistir sesión del residente validado (prioridad alta)

**Problema:** `residentEmailValidated` vive solo en React state. Al navegar a `/residentes/asambleas` u otra ruta, la página de landing se desmonta y se pierde el estado.

**Solución:**
- Cuando el residente valide su correo, guardar en `localStorage`:
  - `assembly_resident_email` (correo validado)
  - `assembly_resident_validated` (por ejemplo, timestamp o flag)
- Al cargar la landing (`page.tsx`), si existen esos datos (y no están expirados, ej. 24h o sesión), abrir el chatbot con el residente ya validado y mostrar los botones sin pedir correo de nuevo.

### 2. Botón "Volver a la landing" → comportamiento más coherente

**Problema:** Ir a `/` limpia el contexto y el usuario debe reintroducir el correo.

**Solución:**
- Mantener o cambiar el texto a algo como **"Volver al chat"**.
- El enlace puede ser `/?chat=open` para que el chatbot se abra al llegar.
- Con la sesión persistida (punto 1), al volver el chatbot mostrará al residente ya validado y no pedirá correo de nuevo.

### 3. Asambleas: dar función lógica a ACTIVA y PROGRAMADA

**Problema:** Los badges ACTIVA y PROGRAMADA no son clicables y no tienen acción.

**Solución:**
- **ACTIVA:** convertir en botón/enlace a `/residentes/votacion` (o a la votación de esa asamblea).
- **PROGRAMADA:** mostrar "Próximamente" o enlace a detalle/calendario si aplica.

### 4. (Opcional, post-MVP) Mantener el chatbot accesible en `/residentes/*`

- Evaluar un widget flotante del chatbot en las páginas `/residentes/*` para no perder del todo el "ambiente chat".
- Requiere más cambios de layout; puede priorizarse después del MVP.

### 5. Página `/chat` para usuarios existentes (ver §A)

- Crear página dedicada con ventana de chatbot full-screen para residentes y usuarios recurrentes.
- La landing (`/`) queda para ventas; `/chat` para operación.

### 6. Botones integrados dentro del chat (ver §B)

- Mostrar botones de acción como pills **dentro del flujo del chat**, debajo del último mensaje y encima del input.
- Referencia visual: TAVIQ (botones ETF, Stocks, Funds como sugerencias en el chat).
- Evitar que los botones parezcan una sección separada; deben sentirse parte de la conversación.

### 7. Mostrar correo, nombre y número de unidad (ver §C)

- Tras validar al residente, mostrar en header o en un mensaje fijo: correo, nombre, número de unidad.
- Obtener de BD o de los datos ya validados (API `/api/users/check-resident` o equivalente).

### 8. Responder dentro del chat – no redirigir (ver §D)

- **Votación, Asambleas, Calendario, Tema del día, Ceder poder:** Mostrar el contenido como **cards o mensajes dentro del chat**, no navegar a páginas externas.
- El bot responde con el contenido inline (lista de asambleas, tema del día, opciones de voto, etc.).
- Opcional: enlace "Abrir en pantalla completa" para votación o calendario si se necesita más espacio.

### 9. Cerrar sesión + alerta de abandono + registro Admin PH (ver §E)

- En chatbot de residentes validados: **reemplazar** botón "Volver a la landing" por **"Cerrar sesión"**.
- Al cerrar sesión: mostrar **alerta** *"Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?"*.
- **Registrar en BD** la hora en que el residente abandonó (tabla/evento para Admin PH: ver quién abandonó y cuándo; afecta quórum).
- **Redirigir tras cerrar sesión:** a la **página de chatbot de residentes** (`/residentes/chat`), **no** a la landing `/`.

### 10. Lógica de habilitación de botones (ver §F)

- **Votación, Tema del día:** habilitar solo cuando asamblea activa. Si no: deshabilitados (gris) con texto *"No hay votación activa"*.
- **Asambleas, Calendario, Ceder poder:** siempre habilitados.
- Consultar API o estado para saber si hay asamblea activa.

### 11. Ceder poder: formulario dentro del chat (ver §G)

- Al hacer clic en "Ceder poder", mostrar formulario inline (campo "Correo del apoderado", botón "Enviar poder").
- No navegar a otra página.

### 12. Validación usuario demo – perfiles (ver §H)

- Validar chatbot con: **(1) Asamblea activa** – Votación y Tema del día habilitados; **(2) Asamblea programada** – solo Asambleas/Calendario; **(3) Pre-registro** – contexto sin asambleas; **(4) Sin asambleas año en curso** – mensaje *"No hay asambleas programadas. ¿Consultar con el administrador?"*.

### 13. Página chatbot residentes + flujos por perfil (ver §I)

- **Crear página** `/residentes/chat` (o `/residentes`): página de inicio del chatbot para residentes, sin contenido de ventas.
- **Al cerrar sesión o finalizar chat:** redirigir a `/residentes/chat`, **no** a la landing `/`.
- **Perfil 1 (entra por landing):** Tras validar correo en `/` → redirigir a `/residentes/chat`. Tras cerrar sesión → `/residentes/chat`.
- **Perfil 2 (entra directo):** Link directo a `/residentes/chat`. Validación de correo en esa misma página. Cerrar sesión → permanece en `/residentes/chat`.
- La landing (`/`) queda solo para captación; el residente nunca termina en landing tras cerrar sesión.

### 14. Mejoras UX residente con asamblea activa (ver §J)

- **(1) Mensaje de bienvenida residente:** No usar el texto B2B ("Califica leads y ofrece demos"). Usar mensaje específico: *"Hola [Nombre]. Soy Lex, tu asistente para votaciones, asambleas y gestión de tu PH en Assembly 2.0."*
- **(2) Mostrar correo en el chat:** Incluir correo del residente en cabecera o primera burbuja (además de nombre y unidad) para confirmar cuenta.
- **(3) Acción al clic "Votación":** Al hacer clic, mostrar card/mensaje dentro del chat: título "Votación activa", texto "Tienes una votación abierta. ¿Participar?", botón "Ir a votar" – todo inline, sin redirigir hasta confirmar.
- **(4) Badge "Asamblea activa":** Añadir indicador visible (badge junto a cabecera o inicio del chat) cuando hay asamblea activa, para que el residente entienda por qué Votación y Tema del día están habilitados.

---

## 📂 REFERENCIAS

- **Imagen referencia botones en chat:** TAVIQ (pills dentro del chat, sobre input)

- **Páginas afectadas:** `src/app/residentes/asambleas/page.tsx`, `votacion/page.tsx`, `calendario/page.tsx`, `poder/page.tsx`, `tema-del-dia/page.tsx`
- **Chatbot:** `src/app/page.tsx`
- **Plan de pruebas:** QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md
