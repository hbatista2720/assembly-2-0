# Lógica demo: cliente nuevo en chatbot y asignación por correo

## Aclaración rápida (resumen)

| Pregunta | Respuesta |
|----------|-----------|
| **¿El demo se asigna por correo en el chatbot?** | No. El chatbot solo guarda el correo como lead. El acceso demo es **único y compartido**: **demo@assembly2.com**. |
| **¿Se crea un demo nuevo por cada cliente?** | No. Hay **un solo demo global**. No se crea un demo “por correo”. |
| **¿Se carga Urban Tower o se puede crear un PH con regla 50/1 crédito/15 días?** | Se carga **siempre el PH Urban Tower** (Vista Tower) con 50 residentes. No existe flujo para “crear tu PH” con esa regla. |
| **Al iniciar sesión demo, ¿hay bienvenida?** | Se puede mostrar una bienvenida indicando la regla: 50 residentes, 1 crédito, 15 días de prueba (Urban Tower). |

---

## Cómo está hoy

### 1. Cliente nuevo entra al chatbot (landing / chat)

- El usuario elige perfil: **Administrador PH**, **Junta**, **Residente** o **Solo demo**.
- Si elige **"demo"** (o "solo demo"):
  - El bot pide: *"¿Con qué correo quieres probar el sistema?"*
  - El usuario escribe su correo (ej. `cliente@empresa.com`).
  - Ese correo **no crea** una cuenta demo nueva ni se liga a un PH propio.
  - Se guarda como **lead** en `localStorage` (`landingLead`) y el bot dice que enviará acceso de demo.
  - Si elige **Administrador** y pone correo, se genera un *sugerido* de tipo `xxx-adminph@demo.assembly.local` (solo texto, no se crea cuenta).

**Conclusión:** Hoy el chatbot **no asigna** un demo ligado al correo ni crea un demo “por cliente”. Solo captura el lead.

---

### 2. Cómo se “asigna” el demo realmente

- El acceso demo real es **un solo usuario compartido**: **`demo@assembly2.com`**.
- Quien quiera probar:
  - Va a **/demo** o **/login?demo=1**
  - Pone correo **demo@assembly2.com** y el OTP que recibe (o 123456 en debug).
- En base de datos:
  - Existe un usuario con ese correo y una organización con **`is_demo = true`**.
  - Al hacer verify-otp, se devuelve `is_demo: true` (desde la organización) y el front redirige a `/dashboard/admin-ph?mode=demo`.

**Conclusión:** No hay “un demo por correo”. Hay **un solo demo global** (demo@assembly2.com). El correo que el cliente puso en el chatbot no se usa para crear ni para iniciar sesión en ese demo.

---

### 3. ¿Se carga PH Urban Tower o se crea un PH nuevo con regla 50 / 1 crédito / 15 días?

- **Se carga siempre el mismo PH de demo:** **Urban Tower** (id `urban-tower`).
- El front usa `isDemoResidentsContext()` que es `true` solo si `assembly_email === "demo@assembly2.com"`.
- En ese caso:
  - Listado de PH = **PH_LIST_DEMO** → solo **Urban Tower PH** (50 unidades en demo).
  - Residentes = **demoResidentsStore** (localStorage por PH): para `urban-tower` se siembran **50 residentes** (unidades 1–50).
  - No hay flujo de “crear tu propio PH” con regla 50 residentes / 1 crédito / 15 días; es un PH fijo de ejemplo.

**Regla mostrada en UI:** “Plan 50 usuarios (1 crédito, expira en 15 días)” es el **texto del plan demo** en banners y menú; no es una oferta que el usuario “active” creando un PH. El contenido del demo (Urban Tower, 50 residentes) ya está definido en código/storage.

**Conclusión:**  
- **Se carga PH “Vista Tower” (Urban Tower)** con 50 residentes y 1 crédito.  
- **No** se carga un flujo para “crear un PH con regla 50 residentes, 1 crédito, 15 días de prueba”.

---

### 4. Cuando inicia sesión como demo: bienvenida y regla

- Tras login con **demo@assembly2.com** → redirección a `/dashboard/admin-ph?mode=demo`.
- No hay un mensaje de **bienvenida específico** tipo “Bienvenido al demo; puedes usar 50 residentes, 1 crédito y 15 días”.
- La regla aparece en:
  - Banner / card de “Versión demo” (ej. “Plan 50 usuarios (1 crédito, expira en 15 días)”).
  - Menú de usuario (chips del plan).

**Conclusión:** Hoy no se indica explícitamente al iniciar sesión que “puede crear demos con la regla 50 / 1 crédito / 15 días”; la regla se muestra como descripción del plan actual (demo compartido).

---

## Resumen directo a tus preguntas

| Pregunta | Respuesta actual |
|----------|------------------|
| ¿Cómo se asigna un demo cuando un cliente nuevo entra al chatbot? | No se asigna: solo se guarda el correo como lead. El acceso demo es el mismo para todos: **demo@assembly2.com**. |
| ¿El demo está ligado al correo del cliente? | No. El correo del chatbot no crea cuenta ni se usa para login. Solo hay un demo global por correo **demo@assembly2.com**. |
| ¿Cómo se crea el demo de nuevo cliente? | Hoy no hay “demo por nuevo cliente”. El demo es uno solo; no se crea uno nuevo por cada correo. |
| ¿Se carga el PH Urban Tower o se deja crear un PH con regla 50 / 1 crédito / 15 días? | Se carga **siempre el PH Urban Tower** (Vista Tower) con 50 residentes. No hay flujo para “crear tu PH con esa regla”. |
| Al iniciar sesión como demo, ¿hay bienvenida y se indica que puede crear demos con la regla? | La regla se muestra en el plan (50 usuarios, 1 crédito, 15 días). No hay pantalla de bienvenida que diga explícitamente que “puede crear demos con esta regla”. |

---

## Si quisieras cambiar la lógica (ideas)

1. **Demo ligado al correo**
   - Por cada correo del chatbot (o por “crear demo”) crear en BD: usuario + organización demo y marcar `is_demo = true`.
   - Login con **ese** correo (no demo@assembly2.com) y mismo flujo de OTP.

2. **Cargar Urban Tower vs “crear PH con regla”**
   - **Opción A (como ahora):** Seguir cargando solo Urban Tower para todos los demos.
   - **Opción B:** Después de login demo, mostrar “Crear tu PH de prueba” con regla: 50 residentes, 1 crédito, 15 días; al aceptar, crear org/PH y redirigir al dashboard de ese PH.

3. **Bienvenida al iniciar sesión demo**
   - Tras login con usuario demo, mostrar un modal o pantalla única: “Bienvenido al demo. Puedes usar un PH de ejemplo (Urban Tower) con 50 residentes, 1 crédito y 15 días de prueba.”

Este documento refleja la lógica actual del código (chatbot, login, verify-otp, demoResidentsStore, dashboard admin-ph y PH list).

**Propuesta Product Owner (Henry):** Crear demo por correo del cliente nuevo (administrador PH) en lugar de un solo demo compartido. Ver **Marketing/MARKETING_PROPUESTA_DEMO_POR_CORREO_CLIENTE.md**.
