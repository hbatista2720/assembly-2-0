# 🔐 LÓGICA: CHATBOT RESIDENTE – VALIDACIÓN CON PIN POR CORREO
## Especificación para Contralor y Coder

**Fecha:** Febrero 2026  
**Responsable:** Arquitecto  
**Motivo:** El flujo actual acepta el correo del residente y da acceso al chat/botones **sin verificar** que quien escribe es el dueño del correo. Se requiere **PIN enviado al correo** y **habilitación de botones según asamblea activa**.

**Referencias:**  
- Marketing/MARKETING_REPORTE_LOGIC_CHATBOT_RESIDENTE.md  
- Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (§F, §J)  
- Arquitecto/FLUJO_IDENTIFICACION_USUARIO.md  
- QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md  

---

## 🚨 GAP ACTUAL

| Paso actual | Comportamiento | Problema |
|-------------|----------------|----------|
| 1 | Usuario elige "Residente" | OK | - |
| 2 | Usuario escribe correo | OK | - |
| 3 | Sistema comprueba si correo existe (BD o lista demo) | OK | - |
| 4 | Si existe → **acceso inmediato** al chat residente y botones | ❌ | Cualquiera que conozca el correo puede entrar sin demostrar que tiene acceso al buzón. |
| 5 | Si no existe → mensaje "Contacta al administrador" | OK | - |

**Falta:** Un segundo factor (PIN por correo) **antes** de considerar al residente validado y mostrar botones.

---

## ✅ FLUJO DESEADO (LÓGICA A IMPLEMENTAR)

### Resumen en pasos

1. **Usuario elige rol "Residente".**
2. **Usuario escribe correo** (el que tiene registrado en su PH).
3. **Sistema comprueba si el correo existe** (BD de residentes / unidades, o lista demo si aplica).
   - **Si NO existe:** Mensaje *"No encuentro ese correo. Contacta al administrador de tu PH para validar."* No avanzar. Permitir reintentar con otro correo. **No** enviar PIN ni mostrar botones.
   - **Si SÍ existe:** Continuar al paso 4.
4. **Sistema envía un PIN al correo** (por email, usando SMTP ya existente o servicio configurado). Mensaje al usuario: *"Te enviamos un PIN a [correo]. Revisa tu bandeja (y spam) e ingrésalo aquí."*
5. **Usuario escribe el PIN** en el chat (o en un campo dedicado en la misma pantalla).
6. **Sistema valida el PIN** (comparar con el PIN generado y almacenado para ese correo/sesión, con expiración breve, ej. 5–10 min).
   - **Si PIN incorrecto o expirado:** Mensaje *"PIN incorrecto o vencido. ¿Reenviar PIN?"* Permitir reintentar o volver a pedir correo.
   - **Si PIN correcto:** Continuar al paso 7.
7. **Sistema marca al residente como validado** (equivalente a `residentEmailValidated === true`). Guardar en sesión/localStorage lo necesario para no pedir PIN de nuevo en la misma sesión (según política: misma sesión o ventana).
8. **Sistema muestra el chat de residente y los botones de acciones rápidas**, aplicando la **lógica de habilitación** según asamblea activa (ver más abajo).

Nada de lo anterior debe depender solo de “haber escrito un correo que existe”; la validación completa es **correo existente + PIN correcto**.

---

## 🔘 LÓGICA DE HABILITACIÓN DE BOTONES (ASAMBLEA ACTIVA O NO)

Una vez el residente está validado (correo + PIN), los botones se muestran pero se **habilitan o deshabilitan** según contexto:

| Botón | Cuándo habilitado | Cuándo deshabilitado |
|-------|--------------------|----------------------|
| **Votación** | Hay al menos una asamblea **activa** (en curso) para el PH del residente. | No hay asamblea activa. Mostrar texto tipo *"No hay votación activa"* (gris, no clicable o clicable con mensaje). |
| **Tema del día** | Igual que Votación: solo si hay asamblea activa. | No hay asamblea activa. Mismo criterio que arriba. |
| **Asambleas** | Siempre habilitado (listar asambleas programadas/pasadas). | - |
| **Calendario** | Siempre habilitado. | - |
| **Ceder poder** | Siempre habilitado. | - |

**Fuente de verdad para “asamblea activa”:** API o estado que indique si existe una asamblea en estado “activa”/“en curso” para la organización (PH) del residente. El frontend debe consultar esto (por ejemplo al cargar el chat o al mostrar los botones) y usar el resultado para habilitar/deshabilitar **Votación** y **Tema del día**.

---

## 📍 DÓNDE APLICA

- **Landing** (`/`): chatbot embebido cuando el usuario elige "Residente".
- **Página chatbot residentes** (`/residentes/chat` o equivalente): mismo flujo (correo → PIN → validación) si el usuario llega directo sin sesión ya validada.

Si la sesión ya está validada (misma sesión/ventana, según política), no repetir correo ni PIN; cargar directamente el chat y botones con la lógica de habilitación anterior.

---

## 🔒 SEGURIDAD Y UX

- **PIN:** Corto (ej. 6 dígitos), numérico o alfanumérico según decisión de implementación. Una sola vez por validación (no reutilizable).
- **Expiración:** Ej. 5–10 minutos. Si expira, permitir "Reenviar PIN" (mismo correo, nuevo PIN).
- **Límite de intentos:** Opcional pero recomendable (ej. 3 intentos erróneos → bloquear reintento por X minutos o pedir reenviar PIN).
- **No mostrar botones** hasta que `residentEmailValidated === true` (es decir, hasta que PIN correcto haya sido verificado). Mantener la regla actual de no mostrar botones solo con el paso de correo.

---

## 📋 ESTADOS A USAR EN FRONTEND (REFERENCIA PARA CODER)

- **residentEmailValidated:** `true` solo cuando **correo existe Y PIN correcto** verificado. No poner en `true` solo por “correo reconocido”.
- **Flujo de pasos (steps):** Incluir un paso explícito “esperando PIN” (por ejemplo después de “correo reconocido, enviamos PIN”). No avanzar al paso donde se muestran los botones hasta que el PIN sea válido.
- **Botones:** Mostrar solo cuando `chatRole === "residente"` **y** `residentEmailValidated === true`. Dentro de eso, habilitar/deshabilitar **Votación** y **Tema del día** según **asamblea activa**; el resto según la tabla anterior.

---

## ✅ RESUMEN PARA CONTRALOR

- **Cambio funcional:** Añadir **validación por PIN enviado al correo** antes de dar por validado al residente y mostrar botones.
- **Regla de botones:** **Votación** y **Tema del día** solo habilitados si hay asamblea activa; **Asambleas**, **Calendario** y **Ceder poder** siempre habilitados una vez validado.
- **Documento de referencia para Coder:** Este archivo (`Arquitecto/LOGICA_CHATBOT_RESIDENTE_PIN.md`). El Contralor debe indicar al Coder que implemente esta lógica (backend: envío y validación de PIN; frontend: flujo correo → PIN → botones con habilitación por asamblea activa).

**El Arquitecto no genera código; solo esta especificación. La implementación la realiza el Coder según instrucción del Contralor.**
