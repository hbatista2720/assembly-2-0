# Observaciones Landing Page – Assembly 2.0

**Origen:** Henry (Product Owner) / Marketing  
**Fecha:** Febrero 2026  
**Objetivo:** Documentar mejoras de contenido y UX en la landing para que el Coder las implemente.

---

## Zona: Panel ejecutivo (Hero – barra lateral derecha)

**Ubicación:** Sección hero de la landing (`src/app/page.tsx`), panel derecho "Panel ejecutivo" con etiqueta "Live".

### Estado: ✅ Implementado (2026-02)

**Implementación actual:** El panel muestra **6 funcionalidades** de Assembly 2.0 con subtexto descriptivo:

- Quórum en tiempo real — Actualización live
- Votación ponderada — Por coeficiente PH
- Poderes digitales — OCR + validación
- Monitor por unidad — Vista tablero
- Chatbot residente — Lex integrado
- Actas automáticas — En minutos

### Observación original (antes)

El panel mostraba una **lista de 6 PHs** con el mismo valor (Quorum: 68%), lo que resultaba repetitivo, poco creíble y no comunicaba valor real.

---

## Recomendación Henry / Marketing

**Sustituir la lista de PHs por funcionalidades de la aplicación.**

En vez de mostrar nombres de PHs + Quorum fijo, usar una **lista de capacidades/funcionalidades** que destaquen lo que Assembly 2.0 ofrece. Así el panel refuerza el mensaje del producto en lugar de parecer datos simulados.

### Ideas de funcionalidades (sin duplicar las ya mostradas en la tag-row)

En el hero ya existen: Compliance legal, Biometría nativa, Actas certificadas, CRM inteligente, Presentación live.

**Opciones para el grid del Panel ejecutivo** (elegir 6 u otra cantidad que encaje en el layout):

| # | Funcionalidad | Subtexto opcional |
|---|---------------|-------------------|
| 1 | Quórum en tiempo real | Actualización live |
| 2 | Votación ponderada | Por coeficiente PH |
| 3 | Poderes digitales | OCR + validación |
| 4 | Monitor por unidad | Vista tablero |
| 5 | Chatbot residente | Lex integrado |
| 6 | Actas automáticas | En minutos |

O bien usar formato similar al card-list inferior (ejemplo):

- Quórum en tiempo real
- Votación ponderada (Ley 284)
- Poderes digitales
- Monitor por unidad
- Chatbot Lex
- Actas en minutos

**Criterio:** Mantener el estilo visual del panel (tarjetas con borde/glow) y reemplazar solo el contenido: de "PH + Quorum: X%" a "Funcionalidad + breve subtexto".

---

## Resumen para el Coder

| Ubicación | Estado |
|-----------|--------|
| `src/app/page.tsx` | ✅ **Hecho.** El mockup "Panel ejecutivo" muestra 6 funcionalidades (Quórum en tiempo real, Votación ponderada, Poderes digitales, Monitor por unidad, Chatbot residente, Actas automáticas) con subtexto. Layout `.grid.grid-3` y `.stat` conservados. |

---

## Prioridad

~~**Media**~~ — **Completado.** Mejora de contenido y credibilidad del hero implementada.

---

*Marketing documenta; Coder implementa. Contralor asigna tareas según `ESTATUS_AVANCE.md`.*
