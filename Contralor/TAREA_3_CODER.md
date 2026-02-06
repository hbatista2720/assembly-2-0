# Tarea 3 – Coder (§F, §G, §H)
**Origen:** Contralor · Orden de tareas (Henry)  
**Responsable:** Agente Coder  
**Referencia:** Contralor/ESTATUS_AVANCE.md, Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md  

---

## Estado
**✅ COMPLETADO (26 Ene 2026)**  
Implementación aplicada en landing (`src/app/page.tsx`), página chat (`src/app/chat/page.tsx`) y API `GET /api/assembly-context`. Confirmación registrada en Contralor/ESTATUS_AVANCE.md (historial y sección CODER - Últimos Avances).

---

## Objetivo
Implementar las secciones **§F**, **§G** y **§H** del informe Marketing (UX chatbot y navegación residente). Tarea 3 se ejecuta cuando Henry confirme finalizadas Tarea 1 y Tarea 2.

---

## §F – Lógica de habilitación de botones

- **Votación** y **Tema del día:** habilitados **solo si hay asamblea activa**.
- **Asambleas**, **Calendario** y **Ceder poder:** **siempre** habilitados.
- Si **no** hay asamblea activa: mostrar Votación y Tema del día **deshabilitados** (estilo gris), con texto tipo *"No hay votación activa"* o similar (tooltip/label).
- El estado "asamblea activa" puede venir de la API `/api/assembly-context` o del contexto ya usado en la landing/chat (`assemblyContext`).

**Archivo principal:** `src/app/page.tsx` (bloque de botones de acción rápida del residente).

---

## §G – Ceder poder: formulario dentro del chat

- Añadir **formulario inline en el chat** (no redirigir a otra página): campo **"Correo del apoderado"** + botón **"Enviar poder"**.
- Validar formato de correo; al enviar, confirmar con un **mensaje del bot** (ej. "Poder enviado. Te confirmamos por correo.").
- Todo debe ocurrir **dentro del flujo del chatbot**, sin navegar fuera.

**Archivos:** `src/app/page.tsx` (chat landing) y, si aplica, `src/app/chat/page.tsx`.

---

## §H – Validación demo por perfil

Comportamiento según contexto del residente:

| Contexto | Comportamiento |
|----------|----------------|
| **Asamblea activa** | Votación y Tema del día habilitados. |
| **Asamblea programada** | Solo Asambleas y Calendario habilitados; Votación y Tema del día deshabilitados. |
| **Pre-registro** | Residente validado sin asambleas; botones según contexto. |
| **Sin asambleas en el año** | Mensaje: *"No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?"* (ya puede existir; verificar que se muestre en el caso correcto). |

Usar el contexto que ya expone la app (ej. `assemblyContext`: activa / programada / sin_asambleas) para aplicar §F y §H de forma coherente.

---

## Referencias
- **Marketing:** Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (§F, §G, §H).
- **Contralor:** Contralor/ESTATUS_AVANCE.md (orden de tareas, instrucciones copiar/pegar).
- **Plan de pruebas:** QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md (para alinear con lo que QA valida).

---

## Implementación realizada (resumen)

- **§F:** Estado `assemblyContext` (`activa` | `programada` | `sin_asambleas`). Pills Votación y Tema del día con `onlyWhenActive: true` → deshabilitados (gris, `title="No hay votación activa"`) cuando `assemblyContext !== "activa"`. Asambleas, Calendario y Ceder poder siempre habilitados.
- **§G:** Card "Ceder poder" con campo "Correo del apoderado" y botón "Enviar poder" inline. Validación con regex de email; si inválido, mensaje del bot: *"Indica un correo válido para el apoderado."*; si válido, confirmación del bot. Sin redirección.
- **§H:** API `GET /api/assembly-context?profile=activa|programada|sin_asambleas` para demo. Cuando `sin_asambleas` se muestra el mensaje *"No hay asambleas programadas para el año en curso. ¿Consultar con el administrador?"* encima de los pills. Landing usa `searchParams.get("profile")`; /chat usa `window.location.search` para `profile`.

---

## Al finalizar
- Confirmar en **Contralor/ESTATUS_AVANCE.md** (historial) o al Contralor que Tarea 3 está completada.
- No hacer backup sin que Henry autorice; el Contralor ejecuta commit/push cuando corresponda.
