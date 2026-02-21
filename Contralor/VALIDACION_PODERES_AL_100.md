# Validación: Sección Poderes de asamblea al 100 %

**Fecha:** Febrero 2026  
**Destinatarios:** Contralor, BD (Database), QA  
**Objetivo:** Listar lo que está listo (BD validada) y lo que faltaba o se completó para que la sección «Poderes de asamblea» quede al 100 %.

---

## 1. Lo que está listo (BD y backend)

| Elemento | Estado | Notas |
|----------|--------|--------|
| **Tabla `power_requests`** | ✅ Listo | Script `sql_snippets/103_power_requests_chatbot.sql`. Campos: id, resident_user_id, organization_id, apoderado_tipo, apoderado_email, apoderado_nombre, apoderado_cedula, apoderado_telefono, vigencia, status (PENDING/APPROVED/REJECTED), requested_via, created_at. |
| **Columna `organizations.powers_enabled`** | ✅ Listo | Script `sql_snippets/107_powers_enabled_organizations.sql`. Si true, los residentes ven «Ceder poder» en el chatbot. |
| **API POST /api/power-requests** | ✅ Listo | Crear solicitud PENDING; validación residente mismo PH por correo en misma org. |
| **API GET /api/power-requests?user_id=** | ✅ Listo | Consultar si el residente tiene solicitud pendiente (para botón «Poder en proceso…»). |
| **API GET /api/admin-ph/powers-config?organization_id=** | ✅ Listo | Devuelve `powers_enabled` de la organización. |
| **API PUT /api/admin-ph/powers-config** | ✅ Listo | Actualiza `powers_enabled` de la organización. |
| **API GET /api/admin-ph/power-requests?organization_id=** | ✅ Listo | Lista solicitudes de la organización (PENDING primero, luego por fecha). Incluye apoderado_cedula, apoderado_telefono, vigencia. |
| **API PATCH /api/admin-ph/power-requests/[id]** | ✅ Listo | Aprobar (APPROVED) o rechazar (REJECTED). Solo si status es PENDING. |

---

## 2. Lo que está listo (UI Admin PH)

| Elemento | Estado | Notas |
|----------|--------|--------|
| **Pestaña «Poderes de asamblea»** | ✅ Listo | Propietarios/Residentes → segunda pestaña. |
| **Toggle «Activar botón de poderes para residentes»** | ✅ Listo | PUT a powers-config. Los residentes ven «Ceder poder» en el chatbot cuando está activo. |
| **Lista de solicitudes** | ✅ Listo | Resident email → apoderado (nombre, email), tipo, fecha. Cédula, teléfono y vigencia se muestran cuando existen. |
| **Botones Aprobar / Rechazar** | ✅ Listo | Solo para solicitudes PENDING. PATCH a power-requests/[id]. |
| **Modo demo** | ✅ Completado | En modo demo (demo@assembly2.com) la pestaña Poderes usa la organización demo en BD (UUID 11111111-1111-1111-1111-111111111111). Se cargan config y solicitudes; el admin puede activar el botón y aprobar/rechazar. Mensaje informativo: «Modo demo: se usa la organización demo en BD…». |

---

## 3. Chatbot / residente (ya implementado)

- Formulario «Ceder poder» en chat y landing: tipo apoderado (Residente mismo PH | Titular mayor de edad), correo, nombre, cédula/tel/vigencia opcionales.
- Mensaje tras enviar: «Solicitud enviada. Está pendiente por aprobar…».
- **Estatus en el chat:** al hacer clic en «Poder» (o en «Poder en proceso…» / «Poder aprobado») el chat muestra el estado real de la última solicitud:
  - **Pendiente:** «Tu solicitud de poder está pendiente de aprobación. Te confirmaremos por correo cuando el administrador la revise.»
  - **Aprobada:** «Tu solicitud de poder fue aprobada. Ya puedes ejercer el poder según lo acordado.»
  - **Rechazada:** «Tu solicitud de poder fue rechazada. Si deseas, puedes enviar una nueva solicitud haciendo clic de nuevo en «Ceder poder».» (el botón vuelve a «Ceder poder» para permitir nueva solicitud).
- Botón según estado: «Ceder poder» (sin solicitud o rechazada), «Poder en proceso de validación y aprobación» (PENDING, deshabilitado), «Poder aprobado» (APPROVED).

---

## 4. Qué faltaba y se completó en esta validación

1. **Soporte demo en la pestaña Poderes**  
   Antes: en modo demo solo se mostraba el mensaje «En modo demo la gestión de poderes usa la organización real…» y no se cargaban datos.  
   Ahora: en demo se usa `DEMO_ORG_ID` (11111111-1111-1111-1111-111111111111) para GET powers-config, GET power-requests, PUT powers-config y PATCH power-requests. La pestaña muestra el mismo contenido (toggle + lista) y permite probar el flujo con la organización demo en BD.

2. **Cédula, teléfono y vigencia en la lista Admin**  
   La API GET admin-ph/power-requests ya devolvía estos campos; la UI ya los muestra en cada fila cuando existen. Nada pendiente.

---

## 5. Notificación por correo (punto de extensión)

- **Stub implementado:** `src/lib/notifyPowerEmail.ts` exporta `notifyPowerStatus(residentEmail, status)`.
- Se llama desde: (1) **POST /api/power-requests** al crear la solicitud (status PENDING); (2) **PATCH /api/admin-ph/power-requests/[id]** al aprobar o rechazar (status APPROVED o REJECTED).
- Hoy solo registra en consola (`console.log`). Para envío real: integrar en esa función un proveedor (Resend, SendGrid, etc.) y enviar el texto correspondiente (solicitud recibida / aprobada / rechazada).

---

## 6. Comprobación rápida para QA / Contralor

1. **BD:** Verificar que existen tabla `power_requests` y columna `organizations.powers_enabled` (scripts 103 y 107 ejecutados).
2. **Admin PH (no demo):** Iniciar sesión con Admin PH de una organización real → Propietarios → Poderes. Activar el botón; comprobar que aparecen solicitudes si las hay; aprobar o rechazar una PENDING.
3. **Admin PH (demo):** Iniciar sesión como demo@assembly2.com → Propietarios → Poderes. Comprobar que se carga la pantalla (toggle + lista) usando la organización demo; si en BD hay solicitudes para esa org, se listan; se puede activar/desactivar el botón y aprobar/rechazar.
4. **Residente:** Con powers_enabled = true, en el chatbot debe verse «Ceder poder»; al enviar una solicitud debe aparecer «Poder en proceso…» hasta que Admin PH apruebe o rechace. Al hacer clic en el botón de poder, el chat muestra el estatus (pendiente / aprobada / rechazada). Si fue rechazada, puede enviar de nuevo desde «Ceder poder».

---

*Documento generado a partir de la validación «listo por BD, qué hace falta para sección de poderes al 100 %».*
