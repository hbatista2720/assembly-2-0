# 📅 LÓGICA: CRONOGRAMA DE ASAMBLEA Y HABILITACIÓN DEL BOTÓN VOTACIÓN EN CHATBOT
## El botón "Votación" se habilita cuando el Admin PH activa la votación (tras quórum y orden del día)

**Fecha:** Febrero 2026  
**Responsable:** Arquitecto  
**Objetivo:** Confirmar y precisar la lógica: el botón **Votación** en el chatbot de residentes debe habilitarse cuando el **Admin PH activa la votación** en el sistema (tras aprobar quórum, aprobar orden del día e indicar los temas del día). Debe existir un **cronograma** de la asamblea.

**Referencias:**  
- Marketing/MARKETING_UX_CHATBOT_NAVEGACION_RESIDENTE.md (§F)  
- Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md (agenda, quórum, crear votación)  
- Arquitecto/LOGICA_CHATBOT_RESIDENTE_PIN.md (habilitación de botones)  
- Arquitecto/VISTA_PRESENTACION_TIEMPO_REAL.md (votación en curso)

---

## 🚨 ESTADO ACTUAL EN LA DOCUMENTACIÓN

Hoy está documentado de forma genérica:

- **Votación** y **Tema del día** se habilitan cuando hay **“asamblea activa”** para el PH del residente.
- La “fuente de verdad” se describe como: API o estado que indique si existe una asamblea en estado “activa” o “en curso”.

**Limitación:** No se exige de forma explícita que la habilitación dependa del **cronograma** de la asamblea (quórum → orden del día → temas) ni de que el **Admin PH active** la votación para el chatbot.

---

## ✅ LÓGICA DESEADA (CRONOGRAMA Y ACTIVACIÓN POR ADMIN)

### 1. Cronograma de la asamblea

La asamblea sigue un **cronograma** (secuencia de pasos). Orden mínimo:

1. **Inicio de asamblea** – El Admin PH abre/inicia la asamblea (estado “en curso” o equivalente).
2. **Asistencia y quórum** – Se registra asistencia; el sistema calcula si se alcanza el quórum (ej. 51%).
3. **Aprobación del quórum** – El Admin PH (o el sistema) confirma que el quórum está alcanzado.
4. **Aprobación del orden del día** – Se aprueba la agenda/orden del día de la asamblea.
5. **Temas del día** – Quedan definidos los temas a tratar (según la agenda); puede haber temas informativos y temas con votación.
6. **Para cada tema con votación:** el **Admin PH inicia la votación** desde su dashboard (ej. “Iniciar Votación” para ese tema). A partir de ese momento, los residentes pueden votar en ese tema (presencial o vía app/chatbot).

El sistema debe poder representar estas fases (por ejemplo con estados o pasos en la asamblea/agenda) para que el cronograma sea auditable y claro.

### 2. Cuándo se habilita el botón “Votación” en el chatbot

El botón **Votación** en el chatbot de residentes debe habilitarse **solo cuando el Admin PH ha activado la votación** para la asamblea en curso. Es decir:

- No basta con que la asamblea esté “activa” o “en curso”.
- Debe haberse cumplido el flujo anterior: **quórum aprobado → orden del día aprobado → temas del día indicados** y, además, el **Admin PH ha abierto/activado al menos una votación** (un tema en estado “votación en curso” o “votación abierta”) para esa asamblea.

En la práctica:

- **Fuente de verdad:** Existe al menos una **votación abierta/activa** para la asamblea actual del PH (creada e iniciada por el Admin desde el dashboard). Esa votación corresponde a un tema de la agenda y solo se abre después de quórum y orden del día (según el cronograma).
- **Chatbot:** La API que alimenta el chatbot (ej. `assembly-context` o equivalente) debe exponer, para el PH del residente:  
  - Si hay asamblea en curso.  
  - Si hay **votación activa/abierta** (Admin ya activó la votación para al menos un tema).  
  - Tema del día / tema en votación (para mostrar “Tema del día” y opciones de voto).
- **Botón Votación:** Habilitado solo cuando **hay votación activa/abierta** para esa asamblea (es decir, cuando el Admin PH la activó). Si no hay votación abierta (aún no se ha aprobado quórum, o no se ha aprobado orden del día, o el Admin no ha pulsado “Iniciar Votación”), el botón **Votación** debe mostrarse deshabilitado con texto tipo *“No hay votación activa”* o *“Habilitado cuando el administrador abra la votación”*.
- **Botón Tema del día:** Puede habilitarse cuando hay asamblea en curso y hay **tema actual** (agenda/orden del día con temas definidos), aunque la votación aún no esté abierta, para que el residente vea el tema; la regla exacta puede ser “asamblea en curso + temas del día cargados”. Si se desea alinear con el mismo criterio que Votación, podría mostrarse solo cuando hay votación abierta; en este documento se deja como recomendación: **Tema del día** habilitado cuando hay asamblea en curso y hay tema actual en la agenda.

### 3. Resumen para implementación

| Elemento | Regla |
|----------|--------|
| **Cronograma** | Asamblea con fases: inicio → asistencia/quórum → aprobación quórum → aprobación orden del día → temas del día → por cada tema con votación: Admin **activa/inicia votación**. |
| **Botón Votación (chatbot)** | Habilitado **solo cuando el Admin PH ha activado** (abierto/iniciado) al menos una votación para la asamblea en curso. Equivale a: “existe una votación abierta/activa” para esa asamblea. |
| **Botón Tema del día (chatbot)** | Habilitado cuando hay asamblea en curso y hay tema actual (agenda/temas del día); recomendación: al menos cuando hay votación abierta o cuando la agenda ya tiene tema actual visible. |
| **Fuente de verdad** | Backend/BD: asamblea en curso + existencia de al menos una “votación abierta/activa” (iniciada por el Admin) para esa asamblea. La API del chatbot debe basarse en esto, no solo en “asamblea activa”. |

---

## 📋 COMPATIBILIDAD CON LO YA DOCUMENTADO

- **§F (Marketing):** “Votación solo cuando asamblea activa” se interpreta en sentido fuerte: **asamblea en curso y votación activada por el Admin** (cronograma cumplido y “Iniciar Votación” pulsado).
- **Dashboard Admin PH:** El flujo ya descrito (quórum, agenda, “Crear Votación” / “Iniciar Votación”) es el que **activa** la votación; ese mismo flujo debe ser lo que dispare la habilitación del botón Votación en el chatbot (vía API que consulte “votación abierta” para la asamblea).
- **Cronograma:** Debe estar contemplado en el modelo de datos y en el flujo del Admin (estados o pasos de asamblea/agenda), de modo que quede claro: quórum aprobado → orden del día aprobado → temas del día → Admin activa votación → entonces el chatbot habilita “Votación”.

---

## ✅ VALIDACIÓN PARA CONTRALOR Y CODER

- **Sí está contemplado** que el botón Votación dependa del estado de la asamblea y de la votación, pero debe precisarse que:
  - La habilitación es **cuando el Admin PH activa la votación** (tras quórum y orden del día).
  - Debe existir un **cronograma** de la asamblea (quórum → orden del día → temas del día → activación de votación).
- **Implementación:** La API que usa el chatbot para decidir si mostrar “Votación” habilitado debe basarse en “hay votación abierta/activa para la asamblea actual del PH” (iniciada por el Admin), no solo en “asamblea status = active”. El cronograma debe estar reflejado en el flujo del dashboard (y en BD si aplica) para que quórum, orden del día y temas del día queden claros antes de que el Admin abra la votación.

**Documento de referencia:** Este archivo (`Arquitecto/LOGICA_ASAMBLEA_CRONOGRAMA_VOTACION_CHATBOT.md`).

**El Arquitecto no genera código; solo esta especificación.**
