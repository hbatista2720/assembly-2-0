# Poderes de asamblea – Qué hace falta para al 100%

**Fecha:** Febrero 2026  
**Destinatario:** Contralor (y Coder/QA según tareas)  
**Contexto:** BD validada; sección "Poderes de asamblea" en Propietarios tiene flujo implementado. Este documento lista lo que falta para considerarla al 100%.

---

## 1. Lo que ya está (BD + backend + UI)

| Área | Estado | Detalle |
|------|--------|---------|
| **BD** | ✅ Validado | Tabla `power_requests` (script 103). Columna `organizations.powers_enabled` (script 107). |
| **API residente** | ✅ | POST /api/power-requests (crear PENDING), GET ?user_id= (consultar y has_pending). |
| **API Admin PH** | ✅ | GET/PUT /api/admin-ph/powers-config (activar/desactivar botón). GET /api/admin-ph/power-requests?organization_id=. PATCH /api/admin-ph/power-requests/[id] (APPROVED/REJECTED). |
| **Chatbot / Landing** | ✅ | Formulario "Ceder poder" (tipo, correo, nombre, cédula/tel/vigencia opcionales). Botón "Poder en proceso de validación y aprobación" cuando hay PENDING. |
| **UI Admin – Pestaña Poderes** | ✅ | Toggle "Activar botón de poderes para residentes". Lista de solicitudes con Aprobar/Rechazar. Solo visible y funcional cuando **no** es modo demo. |

---

## 2. Lo que falta para al 100%

### 2.1 Modo demo en la pestaña Poderes (prioridad alta para QA)

- **Situación:** Con usuario **demo** (demo@assembly2.com), al abrir Propietarios → Poderes de asamblea solo se muestra: *"En modo demo la gestión de poderes usa la organización real; inicie sesión con un Admin PH no demo para activar el botón y ver solicitudes."* No se cargan datos ni se puede activar el botón.
- **Consecuencia:** No se puede probar el flujo completo de poderes sin una organización real (Admin PH no demo).
- **Opciones:**
  - **A)** Dejar como está y documentar que la prueba al 100% requiere sesión Admin PH no demo con organización donde existan o se creen solicitudes de poder.
  - **B)** Implementar soporte demo: cuando `isDemo`, usar `organization_id` de la org demo (ej. 11111111-1111-1111-1111-111111111111) en las llamadas a powers-config y power-requests, de modo que en demo también se vea el toggle y la lista (vacía o con datos de prueba). Así QA puede probar sin org real.

### 2.2 Mostrar cédula, teléfono y vigencia en la lista Admin (prioridad media) — ✅ HECHO

- **Situación:** La tabla `power_requests` tiene `apoderado_cedula`, `apoderado_telefono`, `vigencia`. El residente los envía en el formulario.
- **Implementado:** El GET `/api/admin-ph/power-requests` ahora devuelve `apoderado_cedula`, `apoderado_telefono`, `vigencia`. La UI de la pestaña Poderes muestra esos datos en una línea secundaria bajo cada solicitud cuando existen.

### 2.3 Email de confirmación al residente (prioridad baja – opcional)

- **Situación:** Según Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md, tras crear la solicitud se debería enviar **email al residente** con confirmación (solicitud enviada, pendiente por aprobar). Actualmente solo se muestra el mensaje en el chat.
- **Falta:** Integración de envío de email (o servicio de notificaciones) al crear la solicitud. Opcional para considerar la sección "al 100%" funcional.

### 2.4 Notificación al residente cuando Admin aprueba o rechaza (prioridad baja – opcional)

- **Situación:** Cuando el Admin PH aprueba o rechaza una solicitud, el residente no recibe aviso automático (solo podría verlo si el chatbot consulta de nuevo el estado).
- **Falta:** Email o notificación in-app al residente al cambiar el estado a APPROVED o REJECTED. Mejora de experiencia; no bloqueante para el 100%.

---

## 3. Resumen para el Contralor

| # | Qué falta | Prioridad | Responsable sugerido |
|---|-----------|-----------|----------------------|
| 1 | Soporte modo demo en pestaña Poderes (o documentar que prueba = Admin no demo) | Alta (para QA) | Coder (opción B) o Contralor/QA (opción A: documentar) |
| 2 | Mostrar cédula, teléfono y vigencia en lista de solicitudes (Admin) | ✅ Hecho | — |
| 3 | Email al residente al crear solicitud | Baja (opcional) | Coder |
| 4 | Notificación al residente al aprobar/rechazar | Baja (opcional) | Coder |

**Con BD validada:** Con 1 (documentado o implementado) y 2 hechos, la sección Poderes puede considerarse al 100% para flujo core. Los puntos 3 y 4 son mejoras opcionales.
