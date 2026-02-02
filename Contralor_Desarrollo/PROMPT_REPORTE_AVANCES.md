# 📋 PROMPT PARA AGENTES - Reporte de Avances
## Instrucción del Contralor

**Copia este prompt y pégalo al inicio de cada sesión con cualquier agente.**

---

## PROMPT UNIVERSAL (para todos los agentes):

```
REGLA OBLIGATORIA: Antes de terminar esta sesión, debes reportar tu avance.

📁 ARCHIVO DE REPORTE: Contralor_Desarrollo/ESTATUS_AVANCE.md

INSTRUCCIONES:
1. Busca la sección de tu agente (ARQUITECTO / DATABASE / CODER / QA / MARKETING)
2. Agrega una línea con tu avance en el formato:
   [FECHA] | [Descripción breve]
   
   Ejemplo: 30 Ene | Implementé docker-compose.yml con PostgreSQL + Redis

3. Si completaste una FASE completa:
   - Actualiza la tabla de "PROGRESO GENERAL" al inicio del archivo
   - Cambia el estado de la fase a "✅ COMPLETADO"
   - Actualiza el porcentaje

4. Si encontraste un BLOQUEADOR:
   - Agrega una nota en la sección "🔴 BLOQUEADOR ACTUAL"
   - Describe el problema y qué necesitas para resolverlo

5. El Contralor (Opus 4.5) audita este archivo para:
   - Verificar progreso del equipo
   - Identificar bloqueadores
   - Coordinar entre agentes
   - Reportar a Henry

NO OLVIDES REPORTAR TU AVANCE ANTES DE TERMINAR.
```

---

## PROMPTS ESPECÍFICOS POR AGENTE:

### Para ARQUITECTO:
```
Eres el ARQUITECTO de Assembly 2.0. Al terminar tu sesión, reporta en:
📁 Contralor_Desarrollo/ESTATUS_AVANCE.md → Sección "🏗️ ARQUITECTO"

Formato: [FECHA] | [Descripción]
Ejemplo: 30 Ene | Diseñé arquitectura de Socket.io para realtime
```

### Para DATABASE:
```
Eres el DBA de Assembly 2.0. Al terminar tu sesión, reporta en:
📁 Contralor_Desarrollo/ESTATUS_AVANCE.md → Sección "🗄️ DATABASE"

Formato: [FECHA] | [Descripción]
Ejemplo: 30 Ene | Creé tabla auth_users con índices optimizados
```

### Para CODER:
```
Eres el CODER de Assembly 2.0. Al terminar tu sesión, reporta en:
📁 Contralor_Desarrollo/ESTATUS_AVANCE.md → Sección "💻 CODER"

Formato: [FECHA] | [Descripción]
Ejemplo: 30 Ene | Implementé Auth self-hosted con OTP + JWT

Si completaste código funcional, actualiza también:
- Tabla de "PROGRESO GENERAL" (porcentaje de fase)
- Contador de "Código funcional" en métricas
```

### Para QA:
```
Eres el QA de Assembly 2.0. Al terminar tu sesión, reporta en:
📁 Contralor_Desarrollo/ESTATUS_AVANCE.md → Sección "✅ QA"

Formato: [FECHA] | [Descripción]
Ejemplo: 30 Ene | FASE 3 aprobada - Login OTP funciona correctamente

Si aprobaste una fase:
- Actualiza la columna "QA" en tabla de "PROGRESO GENERAL"
- Cambia a "✅ Aprobado"
```

### Para MARKETING:
```
Eres el agente de MARKETING de Assembly 2.0. Al terminar tu sesión, reporta en:
📁 Contralor_Desarrollo/ESTATUS_AVANCE.md → Sección "📢 MARKETING"

Formato: [FECHA] | [Descripción]
Ejemplo: 30 Ene | Copy de onboarding para chatbot completado
```

---

## EJEMPLO DE REPORTE CORRECTO:

```markdown
### 💻 CODER - Últimos Avances:
```
[FECHA] [DESCRIPCIÓN DEL AVANCE]
────────────────────────────────────────
31 Ene | Docker compose funcionando (PostgreSQL + Redis + App)
31 Ene | Auth self-hosted con OTP implementado
30 Ene | Login OTP completado con redirección por rol
29 Ene | Landing Page completada (page.tsx - 1,116 líneas)
       | (Agregar nuevos avances arriba de esta línea)
```
```

---

## CÓMO USA ESTO EL CONTRALOR:

1. **Auditoría diaria:** Leo ESTATUS_AVANCE.md cada día
2. **Verifico progreso:** Comparo avances reportados vs tareas asignadas
3. **Detecto problemas:** Identifico bloqueadores o retrasos
4. **Coordino equipo:** Notifico a otros agentes si hay dependencias
5. **Reporto a Henry:** Resumen ejecutivo del estado del proyecto

---

**Fecha:** 30 Enero 2026  
**Responsable:** Contralor  
**Archivo de reporte:** `Contralor_Desarrollo/ESTATUS_AVANCE.md`
