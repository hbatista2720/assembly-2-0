# 📜 LÓGICA: CEDER PODER DESDE EL CHATBOT (RESIDENTE)
## Formulario inline, datos del que acepta, estado pendiente y botón en proceso

**Fecha:** Febrero 2026  
**Responsable:** Arquitecto  
**Objetivo:** Definir el flujo completo de "Ceder poder" en el chatbot: formulario con datos del **que acepta** el poder (residente del mismo PH o titular mayor de edad), estado **pendiente por aprobar** y botón **en proceso de validación y aprobación**.

**Referencias:**  
- Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (§G)  
- Arquitecto/ARQUITECTURA_REGISTRO_VOTACION_RESIDENTES.md (poderes digitales, powers_of_attorney)  
- QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (4.7 Ceder poder)

---

## 🎯 REGLAS DE NEGOCIO

### 1. Quién puede recibir el poder (el que acepta)

El **apoderado** (quien recibe el poder para votar en nombre del residente) puede ser:

- **Residente del mismo PH:** otra persona registrada como residente/propietario en el mismo edificio (misma organización).
- **Titular mayor de edad:** persona mayor de edad que actúa como titular (fuera del PH o del sistema), cumpliendo requisitos legales (Ley 284). En el formulario se capturan sus datos para validación posterior por el Admin PH.

El sistema debe permitir elegir o completar datos según uno de estos dos perfiles y validar según corresponda (ej. si es residente mismo PH: verificar que el correo exista en la misma organización).

### 2. Formulario dentro del chatbot (desplegar al hacer clic en "Ceder poder")

Al hacer clic en **"Ceder poder"**, el chatbot debe **desplegar un formulario inline** (dentro del chat, sin ir a otra página), con los datos **del que acepta** el poder:

**Campos sugeridos:**

- **Tipo de apoderado:** selector o botones: **"Residente del mismo PH"** | **"Titular mayor de edad"** (fuera del PH).
- **Correo del apoderado** (obligatorio): para residente mismo PH sirve para buscar en BD; para titular mayor de edad es contacto.
- **Nombre completo del apoderado** (obligatorio).
- **Cédula / documento** (opcional): Ver DOCUMENTO DE MEJORA más abajo. Residente mismo PH: no requerida. Titular mayor de edad: opcional; el Admin PH puede solicitarla durante la validación.
- **Teléfono** (opcional): contacto del apoderado.
- **Vigencia del poder** (opcional): permanente o solo para la próxima asamblea / fecha hasta.
- **Botón:** **"Enviar solicitud de poder"** o **"Ceder poder"**.

Validación en el chat: correo válido, nombre no vacío; si es "Residente mismo PH", validar que el correo exista en la misma organización. Tras enviar, mostrar confirmación en el chat y estado **pendiente por aprobar**.

### 3. Flujo optimizado desde el chatbot

1. Residente hace clic en **"Ceder poder"**.
2. El bot muestra un mensaje breve (ej. *"Completa los datos de la persona que acepta el poder (puede ser un residente de tu PH o un titular mayor de edad)."*) y **despliega el formulario inline** con los campos anteriores.
3. Residente completa el formulario y pulsa **"Enviar solicitud de poder"**.
4. Sistema valida (correo, nombre; si aplica, que el residente exista en el mismo PH). Si hay error, mensaje en el chat sin cerrar el formulario.
5. Si todo es correcto: se crea la solicitud de poder en BD con estado **PENDIENTE** (pendiente por aprobar).
   - **Chatbot:** Mensaje del bot: *"Solicitud enviada. Está **pendiente por aprobar** por el administrador de tu PH. Te confirmamos en minutos."* o similar. No redirigir; todo en el chat.
   - **Correo:** Enviar **email al residente** (correo validado) con la misma confirmación: solicitud enviada, pendiente por aprobar, datos del apoderado (resumen). El mensaje debe llegar **tanto al chatbot como al correo**.
6. Opcional: el bot puede mostrar un resumen en el chat (ej. *"Poder enviado a [correo/nombre]. Pendiente por aprobar."*).

### 4. Estado "Pendiente por aprobar"

- Toda solicitud nueva de poder creada desde el chatbot queda en estado **PENDIENTE** (pendiente por aprobar).
- El **Admin PH** aprueba o rechaza desde su dashboard (flujo ya definido en ARQUITECTURA_REGISTRO_VOTACION_RESIDENTES.md).
- El residente no puede votar "por poder" hasta que el Admin PH cambie el estado a **APROBADO**. Hasta entonces, el poder está "en proceso de validación y aprobación".

### 5. Botón "Ceder poder" cuando hay solicitud pendiente

- Si el residente **ya tiene una solicitud de poder en estado PENDIENTE** (para la misma unidad / misma asamblea o vigencia, según reglas de negocio):
  - El botón **"Ceder poder"** debe reflejar ese estado: por ejemplo, cambiar texto a **"Poder en proceso de validación y aprobación"** (o "Pendiente por aprobar") y mostrarse **deshabilitado** o en estilo secundario (gris), para que el residente entienda que no puede enviar otra hasta que se resuelva la actual.
- Si **no** hay solicitud pendiente, el botón se muestra normal: **"Ceder poder"** y al hacer clic se despliega el formulario como en el punto 2.

Resumen: **un solo flujo desde el chatbot (formulario → enviar → pendiente por aprobar)** y **botón que pasa a "en proceso de validación y aprobación"** cuando existe una solicitud pendiente.

---

## 📋 ELEMENTOS A IMPLEMENTAR (PARA CODER)

### Backend / BD

- Reutilizar o extender la tabla de poderes (ej. `powers_of_attorney` o equivalente) con estado **PENDING** / **APPROVED** / **REJECTED**.
- Campo o lógica para indicar **origen**: ej. `requested_via: 'CHATBOT'` para distinguir solicitudes desde el chat.
- API para **crear solicitud de poder** desde el chatbot: recibir datos del apoderado (tipo, correo, nombre, cédula, teléfono, vigencia), validar (y si es residente mismo PH, comprobar que exista en la misma organización). Crear registro en estado PENDIENTE y devolver confirmación.
- **Envío de notificación:** Tras crear la solicitud, enviar **email al correo del residente** con confirmación (solicitud enviada, pendiente por aprobar, datos del apoderado). El mensaje debe llegar al chatbot (respuesta en el chat) y al correo del residente.
- API para **consultar si el residente tiene una solicitud pendiente** (por unidad / asamblea o vigencia): el frontend del chatbot usará esta respuesta para mostrar el botón como "Poder en proceso de validación y aprobación" y deshabilitarlo.

### Chatbot (Landing y /residentes/chat)

- Al hacer clic en **"Ceder poder"**:
  - Si hay solicitud **pendiente**: no abrir formulario; mostrar mensaje del bot: *"Ya tienes una solicitud de poder **pendiente por aprobar**. Te confirmamos cuando el administrador la revise."* El botón sigue mostrando **"Poder en proceso de validación y aprobación"** (o "Pendiente por aprobar").
  - Si **no** hay pendiente: mostrar mensaje breve del bot y **formulario inline** con los campos indicados (tipo apoderado, correo, nombre, cédula, teléfono, vigencia, botón "Enviar solicitud de poder").
- Tras enviar con éxito: mensaje de confirmación en el chat (*"Solicitud enviada. Pendiente por aprobar..."*) y actualizar el estado del botón a "Poder en proceso de validación y aprobación" (deshabilitado o secundario) hasta que el Admin PH resuelva la solicitud.

### Dashboard Admin PH

- Mantener flujo existente (o el definido en arquitectura) para **aprobar o rechazar** solicitudes de poder. Las creadas desde el chatbot aparecen con estado PENDIENTE y mismo criterio de validación (datos del apoderado, residente mismo PH o titular mayor de edad).

---

## ✅ RESUMEN PARA CONTRALOR

- **Formulario:** El chatbot **despliega un formulario** al hacer clic en "Ceder poder", con datos **del que acepta** (residente mismo PH o titular mayor de edad): tipo, correo, nombre, cédula, teléfono, vigencia.
- **Flujo:** Todo desde el chat: formulario → enviar → confirmación (en chatbot y por email) → estado **pendiente por aprobar**.
- **Notificación:** El mensaje de confirmación debe llegar **al chatbot** (mensaje en el chat) y **al correo** del residente (email con mismo resumen: solicitud enviada, pendiente por aprobar).
- **Botón:** Si hay solicitud pendiente, el botón muestra **"Poder en proceso de validación y aprobación"** (o "Pendiente por aprobar") y está deshabilitado o en estilo secundario hasta que el Admin PH apruebe o rechace.
- **Backend:** Crear solicitud en BD (estado PENDIENTE), enviar email de confirmación al residente, API para consultar si hay pendiente y para crear desde el chatbot.

**Documento de referencia para Coder:** Este archivo (`Arquitecto/LOGICA_CEDER_PODER_CHATBOT.md`). El Contralor debe indicar al Coder que implemente esta lógica en el chatbot (formulario inline, validación, estado pendiente y estado del botón).

**El Arquitecto no genera código; solo esta especificación.**

---

## 📄 DOCUMENTO DE MEJORA – Análisis Ley 284 y campo cédula (Feb 2026)

**Contexto:** Hoy se usa una hoja con detalle del poder: el titular firma y adjunta cédula; el que acepta firma y la envía. La idea moderna era no pedir cédula. ¿Qué dice la Ley 284?

### Lo que dice la Ley 284

- La Ley 284 **no especifica** requisitos detallados de documentación (cédula) para poderes de representación.
- Permite representación en asambleas; el acta debe reflejar propietarios presentes/representados y coeficientes.
- Permite asambleas virtuales o mixtas.

La práctica tradicional (cédula, papel, firmas) es costumbre prudente, no mandato explícito de la ley.

### Recomendación por tipo de apoderado

| Tipo de apoderado | Cédula en formulario | Justificación |
|-------------------|----------------------|---------------|
| **Residente del mismo PH** | **No requerida** | Ya está en BD (correo, unidad); identidad validada por el sistema (OTP, Face ID). Ley 51 reconoce valor legal de documentos electrónicos y firma biométrica. |
| **Titular mayor de edad** (externo) | **Opcional** | No está en el sistema. El Admin PH puede solicitar cédula durante la validación si lo considera necesario. |

### Política a implementar

- **Residente mismo PH:** No exigir cédula en el chatbot. Correo + validación en BD suficientes.
- **Titular mayor de edad:** Campo cédula **opcional** en el formulario. Si el Admin PH lo requiere, puede solicitarlo durante la revisión. Texto sugerido: *"Si el administrador lo solicita, podrás adjuntar cédula más adelante."*

**Nota:** No sustituye criterio jurídico formal. Para reglas definitivas, consultar abogado que aplique Ley 284 y reglamento interno del PH.
