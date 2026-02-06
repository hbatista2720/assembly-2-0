# Tarea 2 – QA
**Origen:** Contralor · Orden de tareas (Henry)  
**Responsable:** Agente QA  
**Referencia:** Contralor/ESTATUS_AVANCE.md  

---

## Objetivo
Ejecutar la **Tarea 2** del plan: revalidar el flujo de abandono de sala (§E) o hacer la validación manual del chatbot (sección 4 del plan de pruebas).

---

## Opción A – Revalidar §E (abandono de sala)

1. Asegurar que la tabla `resident_abandon_events` existe en BD (si no: `docker compose exec -T postgres psql -U postgres -d assembly < sql_snippets/100_resident_abandon_events.sql`).
2. En la app (http://localhost:3000): abrir chatbot → elegir **Residente** → ingresar un correo válido (ej. `residente1@demo.assembly2.com`) hasta ver los botones.
3. Pulsar **Cerrar sesión** (o equivalente en el header del chat): debe mostrarse la alerta *"Estás abandonando la votación. Esto afecta el quórum. ¿Cerrar sesión?"*.
4. Confirmar: debe cerrar sesión y, en backend, registrarse el evento en BD (POST /api/resident-abandon sin error).
5. **Reportar** en **QA/QA_FEEDBACK.md**: resultado (OK / fallos), pasos ejecutados y cualquier error.

**Referencias:** QA/QA_FEEDBACK.md § "Registro de abandono de sala (§E)", Database_DBA/INSTRUCCIONES_CODER_ABANDONO_SALA.md.

---

## Opción B – Validación manual chatbot (plan sección 4)

1. Abrir **http://localhost:3000**.
2. Abrir el chatbot (4.1).
3. Elegir rol **Residente** y validar correo (ej. residente1@demo.assembly2.com) hasta ver los botones de acción rápida.
4. Probar cada botón y comprobar que lleva a la URL esperada:
   - **4.3** Votación → `/residentes/votacion`
   - **4.4** Asambleas → `/residentes/asambleas`
   - **4.5** Calendario → `/residentes/calendario`
   - **4.6** Tema del día → `/residentes/tema-del-dia`
   - **4.7** Ceder poder → `/residentes/poder`
5. **Reportar** en **QA/QA_FEEDBACK.md**: qué se probó, si cada botón lleva a la URL esperada (Sí/No por botón).

**Referencia:** QA/PLAN_PRUEBAS_NAVEGACION_LOGIN_CHATBOT.md sección 4.

---

## Al finalizar
- Añadir entrada en **Contralor/ESTATUS_AVANCE.md** en el historial (ej.: "QA ejecutó Tarea 2 – resultado OK / incidencias: …").
- Si hay fallos, describirlos en QA_FEEDBACK para que Coder o Database corrijan.
