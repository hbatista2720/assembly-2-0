# 📋 Tipos de Asamblea y Mayorías de Aprobación – Ley 284 (Panamá)

**Fecha:** Febrero 2026  
**Responsable:** Marketing B2B  
**Destinatario:** Contralor (asignar al Coder)  
**Objetivo:** Definir tipos de asamblea, % de aprobación por tema, y cómo incluirlo en formularios, dashboard y zona de preguntas/respuestas.

---

## 🎯 USO EN EL SISTEMA

- **Formulario crear asamblea:** Seleccionar tipo de asamblea y, por tema, tipo de aprobación (% requerido).
- **Dashboard:** Indicadores según tipo de tema y mayoría necesaria (ej. "Presupuesto: requiere 51%").
- **Zona Q&A o chatbot:** Preguntas frecuentes sobre qué % se necesita para aprobar X tema.

---

## 📐 TIPOS DE ASAMBLEA (Ley 284)

| Tipo | Descripción | Plazo convocatoria |
|------|-------------|--------------------|
| **Ordinaria** | Reunión anual obligatoria. Presupuesto, elección Junta Directiva, informe gestión. | 10–20 días calendario |
| **Extraordinaria** | Para temas urgentes o específicos (cuota extraordinaria, emergencias, modificaciones). | 3–5 días calendario |

### Quién puede convocar

| Convocante | Requisito |
|------------|-----------|
| **Junta Directiva / Presidente** | Por derecho propio. Convocan según reglamento. |
| **20% de propietarios al día** | Art. 63 Ley 284: propietarios que representen al menos 20% de las cuotas de participación, al día en obligaciones, pueden solicitar judicialmente la convocatoria si la Junta no convoca. |
| **Administrador** | Cuando corresponda según reglamento. |

---

## 📊 MAYORÍAS DE APROBACIÓN POR TIPO DE TEMA (Ley 284)

| Tipo de tema | Mayoría requerida | Notas |
|--------------|-------------------|-------|
| **Presupuesto anual** | 51% de unidades al día (1ª convocatoria) | Decisión sobre gastos comunes ordinarios. |
| **Cuota extraordinaria** | 51% de unidades al día (1ª convocatoria) | Ej. impermeabilización, reparación urgente. |
| **Modificación cuotas gastos comunes (ordinarias)** | 51% (1ª convocatoria) / 30% (2ª convocatoria) | Si no hay quórum en 1ª, 2ª convocatoria 1h después. |
| **Cambio estructura cálculo cuotas** | **66%** de unidades al día | Ej. cambiar de m² a unidades, distintos precios por ubicación. |
| **Modificación Reglamento de Copropiedad** | Mayoría calificada (consultar Ley 284 / reglamento) | Suele requerir % mayor. |
| **Elección Junta Directiva** | Mayoría simple (más votos a favor) | Por cargo: presidente, vice, secretario, tesorero, vocales. |
| **Proyectos de mejora (remodelación, pintura, obras)** | Generalmente **51%** | Si afecta bienes comunes y no modifica estructura de cuotas. |
| **Decisión general sobre bienes comunes** | **51%** de unidades al día | Mantenimiento, uso, mejoras menores. |

### Quórum mínimo (para que la asamblea sea válida)

| Convocatoria | Quórum |
|--------------|--------|
| Primera | Más del **50%** de las cuotas de participación (presentes o representados). |
| Segunda (1h después) | Válida con los propietarios **al día** que estén presentes. |

---

## 🔧 APLICACIÓN EN FORMULARIO Y DASHBOARD

### 1. Formulario crear asamblea

Al crear una asamblea:
- **Tipo:** Ordinaria | Extraordinaria.
- **Por cada tema del orden del día:** Seleccionar **tipo de aprobación**:
  - `Mayoría simple (51%)` – presupuesto, cuota extraordinaria, proyectos, elección Junta.
  - `Mayoría calificada (66%)` – cambio estructura cuotas.
  - `Mayoría reglamento` – modificación Reglamento (consultar reglamento del PH).
  - `Informativo` – sin votación.

El sistema puede sugerir el % según el tipo de tema (ej. "Presupuesto" → 51%).

### 2. Dashboard / Monitor de votación

- Mostrar para cada tema: **"Requiere: 51% a favor"** (o el % correspondiente).
- Indicador en tiempo real: **"X% a favor – Quórum alcanzado"** o **"Faltan Y% para aprobar"**.
- Resumen: "Tema 1 (Presupuesto): 51% requerido. Actual: 45% SI, 5% NO, 3% ABST."

### 3. Zona de preguntas y respuestas (Q&A)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué % se necesita para aprobar el presupuesto? | 51% de las unidades al día (primera convocatoria). En segunda convocatoria, 30%. |
| ¿Qué % para una cuota extraordinaria? | 51% de las unidades al día. |
| ¿Qué % para cambiar cómo se calculan las cuotas? | 66% de las unidades al día. |
| ¿Qué % para elegir la Junta Directiva? | Mayoría simple (más votos a favor) por cargo. |
| ¿Quién puede convocar una asamblea? | La Junta Directiva. Si no convoca, el 20% de propietarios al día puede solicitar judicialmente. |
| ¿Qué es asamblea ordinaria y extraordinaria? | Ordinaria: anual, 10–20 días de anticipación. Extraordinaria: temas urgentes, 3–5 días. |

---

## ✅ TAREAS PARA EL CODER

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | En formulario crear asamblea: por cada tema, campo "Tipo de aprobación" con opciones: Mayoría simple (51%), Mayoría calificada (66%), Informativo. Sugerencia automática según nombre del tema (ej. "Presupuesto" → 51%). | Alta |
| 2 | En Monitor de votación: mostrar "Requiere X% a favor" por tema. Indicador en tiempo real "X% a favor – Aprobado" o "Faltan Y%". | Alta |
| 3 | Tabla maestra: `tipo_aprobacion` con id, nombre, porcentaje_minimo (51, 66, etc.). Usar en temas de asamblea. | Media |
| 4 | Zona Q&A o base de conocimiento chatbot: incluir preguntas sobre tipos de asamblea y % por tema. | Media |
| 5 | Dashboard: indicadores o tooltip que expliquen qué % se necesita para cada tema cuando el admin crea o visualiza una asamblea. | Media |

---

## 📂 REFERENCIAS

- Ley 284 de 2022 (Panamá) – Régimen de Propiedad Horizontal
- Marketing/MARKETING_MEJORAS_CREACION_ASAMBLEAS_LEY284.md
- Acta referencia: P.H. Quintas del Lago (nov 2024)
