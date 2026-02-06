# 📋 REPORTE: Lógica Chatbot Residente (Validación Email)
## Hallazgo y Corrección Requerida

**Fecha:** 26 Febrero 2026  
**Responsable:** Marketing B2B  
**Referencia:** Plan de pruebas navegación (QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md)  
**Destinatarios:** Arquitecto, Contralor, Coder

---

## 🚨 HALLAZGO

**Problema:** Los botones de acciones de residente (Votación, Asambleas, Calendario, Tema del día, Ceder poder) se muestran **siempre** cuando el usuario selecciona "Residente" e ingresa un correo, **independientemente de si el correo fue validado o no**.

### Comportamiento actual (incorrecto)

| Escenario | Mensaje del bot | ¿Muestra botones? |
|-----------|-----------------|-------------------|
| Correo **NO** encontrado | "No encuentro ese correo. Contacta al administrador de tu PH para validar." | ❌ **SÍ** (incorrecto) |
| Correo **SÍ** encontrado | "Correo reconocido. Te conecto con tu administrador." | ✅ Sí (correcto) |

### Comportamiento esperado

| Escenario | Mensaje del bot | ¿Muestra botones? |
|-----------|-----------------|-------------------|
| Correo **NO** encontrado | "No encuentro ese correo. Contacta al administrador de tu PH para validar." | **NO** – solo mensaje; input para reintentar |
| Correo **SÍ** encontrado | "Correo reconocido. Te conecto con tu administrador." | **SÍ** – botones Votación, Asambleas, Calendario, etc. |

---

## 📍 UBICACIÓN EN CÓDIGO

**Archivo:** `src/app/page.tsx`

- **Líneas 237-246:** Flujo residente cuando correo NO reconocido – actualmente hace `setChatStep(8)` y retorna.
- **Líneas 243-246:** Flujo residente cuando correo SÍ reconocido – también hace `setChatStep(8)`.
- **Líneas 1117-1199:** Los botones se muestran cuando `chatStep >= 8` y `chatRole === "residente"`.

**Causa:** Ambos caminos (validado / no validado) llegan a `chatStep(8)`, y la condición actual solo verifica `chatStep` y `chatRole`, no el estado de validación del correo.

---

## 🛠️ INSTRUCCIONES PARA EL CODER

### 1. Añadir estado de validación

```typescript
// Nuevo estado: solo true cuando el correo del residente fue encontrado
const [residentEmailValidated, setResidentEmailValidated] = useState(false);
```

### 2. Ajustar flujo cuando correo NO reconocido

- No llamar `setChatStep(8)`.
- Mantener `chatStep` en 3 (o usar un step específico, ej. 7 = "residente no validado").
- Dejar visible el input para reintentar con otro correo.
- Opcional: botón "Contactar administrador" o enlace de soporte.

### 3. Ajustar flujo cuando correo SÍ reconocido

- `setResidentEmailValidated(true)`.
- `setChatStep(8)`.
- Mostrar botones de residente.

### 4. Condición para mostrar botones

Mostrar los botones (Votación, Asambleas, Calendario, etc.) solo cuando:

```typescript
chatRole === "residente" && chatStep === 8 && residentEmailValidated === true
```

### 5. Context switching (ya definido en INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md)

- Cuando `residentEmailValidated === true`: título "Lex · Asistente de Asamblea", subtítulo "Soporte Residente · [PH]", footer "Conectado a la red segura de tu PH".
- Ocultar mensaje "Te contactamos en menos de 24 horas..." para residentes validados.

---

## 📂 REFERENCIAS PARA ARQUITECTO Y CONTRALOR

- **Arquitectura Chatbot:** Arquitecto/ARQUITECTURA_CHATBOT_IA.md  
- **Flujo Identificación:** Arquitecto/FLUJO_IDENTIFICACION_USUARIO.md  
- **Instrucciones Coder:** Marketing/INSTRUCCIONES_CODER_PULIDO_CHATBOT_RESIDENTE.md  
- **Plan de pruebas:** QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (sección 4)  
- **Control:** Contralor/ESTATUS_AVANCE.md

---

## ✅ CHECKLIST Coder

- [ ] Añadir `residentEmailValidated` (boolean).
- [ ] No mostrar botones cuando correo NO validado.
- [ ] Mostrar mensaje "Contacta al administrador de tu PH" y permitir reintentar.
- [ ] Mostrar botones solo cuando `residentEmailValidated === true`.
- [ ] Aplicar context switching (título, subtítulo, footer) para residentes validados.
