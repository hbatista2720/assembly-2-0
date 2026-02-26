# Propuesta: Demo por correo del cliente nuevo (Administrador PH)

**Origen:** Henry (Product Owner)  
**Fecha:** Febrero 2026  
**Documento de referencia:** `docs/LOGICA_DEMO_CLIENTE_NUEVO_CHATBOT.md`

---

## Resumen de la lógica actual

| Aspecto | Comportamiento actual |
|---------|------------------------|
| **Chatbot** | El correo del cliente nuevo **solo se guarda como lead**; no se crea cuenta ni demo por ese correo. |
| **Acceso demo** | **Un único usuario** `demo@assembly2.com`; tras login con OTP se redirige a `/dashboard/admin-ph?mode=demo`. |
| **PH** | Siempre se carga **Urban Tower** (50 unidades, 1 crédito, 15 días en la UI); no hay flujo para “crear tu PH” con esa regla. |
| **Bienvenida** | Al entrar por primera vez como demo se puede mostrar modal con la regla (50 / 1 crédito / 15 días) y Urban Tower. |

---

## Pregunta de Henry

> **¿No sería mejor que se cree un demo con el correo del cliente nuevo (administrador de PH)?**

Es decir: en lugar de un demo global compartido (`demo@assembly2.com`), **crear un demo por cada correo** que el cliente nuevo (administrador PH) ingresa en el chatbot.

---

## Propuesta (Marketing documenta; decisión: Contralor / Arquitecto)

**Idea:** Cuando un visitante elige perfil “Administrador PH” o “Solo demo” y proporciona su correo en el chatbot:

1. **Seguir guardando el correo como lead** (como hoy).
2. **Además:** crear (o reservar) una **cuenta demo ligada a ese correo**:
   - Usuario en BD con ese email + organización demo (`is_demo = true`).
   - Regla igual: 50 residentes, 1 crédito, 15 días (mismo contenido que Urban Tower o PH de prueba).
3. El cliente **entra al demo con su propio correo** (OTP a ese correo) y ve su dashboard demo sin usar `demo@assembly2.com`.

**Ventajas posibles:**

- Cada administrador PH nuevo tiene **su propio demo**, sin compartir credenciales.
- Mejor **trazabilidad**: lead + demo asociado al mismo correo.
- Mensaje de venta más claro: *“Prueba con tu correo y en 15 días decides si subes a plan real.”*
- Reduce confusión (“¿todos usan el mismo demo?”).

**Consideraciones (para Arquitecto / Contralor):**

- **BD:** Crear usuario + organización demo por cada correo (o por cada “solicitud demo” desde chatbot). Límite de demos por correo/tiempo si se quiere evitar abuso.
- **Auth/OTP:** El flujo ya existe; el nuevo usuario demo usaría el mismo login OTP con su correo.
- **Chatbot:** Tras capturar el correo, además de guardar lead, llamar a un endpoint que cree (o reserve) el demo y opcionalmente enviar email “Tu demo está listo; entra con este correo en [link]”.
- **Límites:** Definir si hay cupo máximo de demos activos, expiración 15 días por demo, y si se reutiliza el mismo correo (ej. “ya tienes un demo, entra aquí”).
- **Contenido del demo:** Mismo PH de ejemplo (Urban Tower / 50 unidades) por ahora, o en el futuro flujo “crear tu PH de prueba” (ver `docs/LOGICA_DEMO_CLIENTE_NUEVO_CHATBOT.md` § “Si quisieras cambiar la lógica”).

---

## Recomendación Marketing

- **Sí tiene sentido** ofrecer demo por correo del cliente nuevo: mejora la experiencia y la percepción de producto (“mi demo” vs “un demo compartido”).
- La **decisión de implementación** (alcance, límites, flujo exacto) corresponde a **Contralor** y **Arquitecto** (auth, BD, seguridad, coste).
- Una vez definido el flujo, la tarea es para **Coder** (chatbot → API crear demo; BD; login con ese correo).

---

## Próximo paso – Orden de revisión

**Orden acordado:** Quien revisa/valida primero es el **Arquitecto**; después el **Coder** implementa.

1. **Arquitecto (primero):** Revisar esta propuesta, definir flujo técnico (cuándo se crea usuario demo, modelo de datos, límites, seguridad) y documentar en arquitectura / lógica demo. Entregar especificación para el Coder.
2. **Coder (después):** Implementar según la especificación aprobada por el Arquitecto (chatbot → API crear demo; BD; login con ese correo).

- **Contralor:** Valorar con Henry si se prioriza esta propuesta y en qué fase.
- **Marketing:** No toca código; solo documenta la propuesta y la recomendación.

---

**✅ Revisión Arquitecto (Feb 2026):** Especificación técnica publicada en **Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md**. Instrucción al Coder en **Contralor/ESTATUS_AVANCE.md** § "Para CODER – Demo por correo del cliente".

---

## Estado de implementación (Coder)

| Componente | Estado | Notas |
|------------|--------|--------|
| BD `demo_expires_at` | ✅ | Migración 015. verify-otp rechaza demo vencido. |
| BD `auth_attempts.ip_address` | ✅ | Migración 016 para rate limit por IP. |
| API `POST /api/demo/request` | ✅ | Crea usuario + org demo; 1 demo por correo; 15 días; rate limit IP/email; platform_leads. |
| Chatbot (landing + /chat) | ✅ | Admin PH / Solo demo → captura correo → llama API → mensaje con link a /login. |
| Login | ✅ | Sin cambios; verify-otp devuelve is_demo; front redirige a dashboard demo. |
| Demo global demo@assembly2.com | ✅ | Se mantiene para QA; convive con demos por correo. |
