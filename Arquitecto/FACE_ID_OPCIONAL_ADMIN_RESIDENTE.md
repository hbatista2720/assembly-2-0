# 🔐 FACE ID OPCIONAL – CONFIGURABLE POR ADMIN PH Y FALLBACK OTP
## Especificación para Contralor y Coder

**Fecha:** Febrero 2026  
**Responsable:** Arquitecto  
**Objetivo:** Face ID como **opción** que el administrador del PH puede **activar o desactivar por perfil de residente**. Si el residente no puede usar Face ID (por decisión del admin o por temas técnicos), **siempre** se habilita la opción de **OTP**.

**Referencias:**  
- Arquitecto/ARQUITECTURA_REGISTRO_VOTACION_RESIDENTES.md (Face ID + fallback manual)  
- Arquitecto/ARQUITECTURA_LOGIN_AUTENTICACION.md (OTP, WebAuthn)  
- Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md (gestión de residentes)

---

## 🎯 REGLAS DE NEGOCIO

### 1. Face ID es opcional y configurable por Admin PH

- El **administrador del PH** decide, por **perfil de residente** (por unidad o por persona, según el modelo de datos), si ese residente puede usar **Face ID** (WebAuthn) para identificarse o votar.
- **Activado:** El residente puede usar Face ID / Touch ID cuando su dispositivo lo soporte.
- **Desactivado:** El residente **no** ve la opción Face ID; solo usa **OTP** (PIN por correo o por SMS, según lo ya definido en el sistema).

### 2. Fallback OTP siempre disponible

- Si el admin **desactiva** Face ID para un residente → el residente usa **solo OTP** (sin intentar Face ID).
- Si el admin **activa** Face ID pero el residente **no puede usarlo** (dispositivo sin soporte, fallo técnico, prefiere no usarlo) → el sistema debe ofrecer **siempre** la opción **“Usar código OTP”** o equivalente, de forma visible y accesible.
- En ningún caso un residente válido debe quedarse sin forma de acceder: **Face ID opcional + OTP siempre disponible** cuando Face ID no esté disponible o no esté permitido.

### 3. Dónde se configura

- **Pantalla:** En el **Dashboard Admin PH**, en la gestión de **residentes** (o de unidades con sus titulares).
- **Acción:** Por cada residente (o unidad), un control **activar/desactivar Face ID** (por ejemplo toggle o checkbox).
- **Almacenamiento:** Un indicador por residente (o por unidad), por ejemplo `face_id_enabled` (boolean). Si no existe o es `false`, el flujo de residente no ofrece Face ID y usa OTP.

### 4. Flujo del residente (resumen)

- **Face ID habilitado por admin y dispositivo soporta WebAuthn:**  
  Ofrecer primero Face ID; si falla o el usuario elige “Usar código”, mostrar flujo OTP.

- **Face ID deshabilitado por admin:**  
  No mostrar Face ID; ir directo a OTP (correo/SMS según definición actual).

- **Face ID habilitado pero dispositivo no soporta o falla:**  
  Mostrar mensaje claro y ofrecer de inmediato **“Entrar con código OTP”** (o similar). No bloquear al residente.

---

## 📋 ELEMENTOS A IMPLEMENTAR (PARA CODER)

### Backend / BD

- **Campo (o equivalente):** Indicador por residente (o por unidad) de si Face ID está permitido para ese perfil. Nombre sugerido: `face_id_enabled` (boolean), en la tabla de residentes/unidades o en la tabla de usuarios vinculados a residentes. Valor por defecto recomendado: `true` (Face ID permitido) para no romper comportamiento actual; el admin puede desactivarlo.
- **API:** Endpoint(s) para que el Admin PH pueda **leer y actualizar** esa configuración por residente (o por unidad). Ejemplo: `GET/PUT /api/organizations/:orgId/residents/:residentId/settings` o equivalente, incluyendo `face_id_enabled`.

### Dashboard Admin PH

- **UI:** En la vista de detalle/edición de un **residente** (o de la unidad con sus titulares), un control **“Permitir Face ID”** (activar/desactivar). Debe guardar el valor en backend y reflejarse en el flujo del residente.

### Flujo residente (login / identificación / votación)

- **Consultar** si el residente tiene Face ID habilitado (`face_id_enabled === true`).
  - Si **no** → No mostrar opción Face ID; usar **solo OTP** (correo o SMS según definición existente).
  - Si **sí** → Ofrecer Face ID; si el dispositivo no soporta WebAuthn o el usuario falla/cancela, mostrar **siempre** la opción **“Usar código OTP”** (o “Recibir código por correo”) y continuar con el flujo OTP ya existente.
- **No bloquear** nunca al residente: OTP es el fallback obligatorio cuando Face ID no se usa o no está disponible.

---

## ✅ RESUMEN PARA CONTRALOR

- **Face ID:** Opcional, configurable por el **Admin PH** por perfil de residente (activar/desactivar).
- **OTP:** Siempre disponible cuando Face ID está desactivado por el admin o cuando el residente no puede o no quiere usar Face ID (fallback técnico y de preferencia).
- **Implementación:** BD (campo tipo `face_id_enabled`), API de configuración para Admin PH, UI en gestión de residentes, y flujo residente que consulte esa configuración y ofrezca OTP cuando corresponda.

**Documento de referencia para Coder:** Este archivo (`Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md`). El Contralor debe indicar al Coder que implemente esta lógica sin eliminar el flujo OTP existente.

**El Arquitecto no genera código; solo esta especificación.**

---

## ✅ CODER – Implementación completada

- **BD:** Script `sql_snippets/101_face_id_enabled_users.sql` añade columna `face_id_enabled BOOLEAN DEFAULT TRUE` en `users`. Ejecutar antes de desplegar.
- **API Admin PH:** `GET /api/admin-ph/residents?organization_id=xxx` lista residentes con `face_id_enabled`. `GET/PUT /api/admin-ph/residents/[userId]/settings` (PUT body: `organization_id`, `face_id_enabled`) para leer/actualizar.
- **API residente:** `GET /api/resident-profile?email=...` incluye `face_id_enabled` para que el flujo residente (o futuro WebAuthn) consulte si puede ofrecer Face ID.
- **Dashboard Admin PH:** En **Propietarios / Residentes** (`/dashboard/admin-ph/owners`) se listan los residentes de la organización y un toggle **Permitir Face ID** por cada uno; guarda vía PUT en la API.
- **Flujo residente:** Login actual sigue siendo solo OTP. Comentario en `login/page.tsx` indica que, al implementar WebAuthn, se debe consultar `face_id_enabled` y ofrecer siempre "Usar código OTP" como fallback.
