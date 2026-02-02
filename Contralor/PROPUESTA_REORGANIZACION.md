# 📂 PROPUESTA DE REORGANIZACIÓN DE CARPETAS
## Assembly 2.0 - Estructura por Agente

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Audiencia:** Henry, Contralor

---

## 🎯 OBJETIVO

Organizar los **44 archivos .md** de la raíz en carpetas por agente para:
- ✅ Facilitar navegación y búsqueda
- ✅ Separar responsabilidades claramente
- ✅ Reducir confusión en la raíz del proyecto
- ✅ Eliminar archivos duplicados/obsoletos

---

## 📊 SITUACIÓN ACTUAL

```
Raíz del proyecto: 44 archivos .md ❌ (muy desordenado)

Ya existen 2 carpetas organizadas:
✅ Database_DBA/ (5 archivos + auditorias/)
✅ Contralor_Desarrollo/ (2 archivos)

Falta crear carpetas para:
⏸️ Arquitecto/
⏸️ Coder/
⏸️ Marketing/
⏸️ QA/
```

---

## 🏗️ ESTRUCTURA PROPUESTA

```
/Users/henrybatista/LiveAssambly version 2.0/
│
├── 📁 Arquitecto/                     (NUEVA - 13 archivos)
│   ├── ARQUITECTURA_ASSEMBLY_2.0.md
│   ├── ARQUITECTURA_CHATBOT_IA.md
│   ├── ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md
│   ├── ARQUITECTURA_DASHBOARD_ADMIN_PH.md
│   ├── ARQUITECTURA_LOGIN_AUTENTICACION.md
│   ├── ARQUITECTURA_REGISTRO_VOTACION_RESIDENTES.md
│   ├── ANALISIS_ARQUITECTURA_AVANZADA.md
│   ├── DIAGRAMAS.md
│   ├── ROADMAP_IMPLEMENTACION.md
│   ├── ESTRUCTURA_TAREAS_Y_PERFILES.md
│   ├── FLUJO_IDENTIFICACION_USUARIO.md
│   ├── SISTEMA_IDENTIFICACION_CHATBOT.md
│   └── VISTA_PRESENTACION_TIEMPO_REAL.md
│
├── 📁 Contralor/                      (RENOMBRAR de Contralor_Desarrollo/)
│   ├── ESTATUS_AVANCE.md
│   ├── PLAN_TRABAJO_FASES.md
│   ├── CONTRALOR_GESTION_COSTOS.md    (MOVER)
│   ├── GESTION_COSTOS_PROYECTO.md     (MOVER - falta crear)
│   ├── EQUIPO_AGENTES_CURSOR.md       (MOVER)
│   ├── PLAN_BACKUP_Y_GIT.md           (MOVER)
│   └── PROGRESO.md                    (MOVER)
│
├── 📁 Database/                       (RENOMBRAR de Database_DBA/)
│   ├── README.md
│   ├── INDICE.md
│   ├── ESTADO_ACTUAL.md
│   ├── ASIGNACIONES_PENDIENTES.md
│   ├── GUIA_RAPIDA_HENRY.md
│   ├── INSTRUCCIONES_PARA_CODER.md
│   ├── AUDITORIA_DATABASE_ASSEMBLY_2.0.md      (MOVER)
│   ├── INDICE_AUDITORIA_DATABASE.md            (MOVER)
│   ├── SOLUCION_URGENTE_DATABASE_ERROR.md      (MOVER)
│   └── auditorias/
│       └── 2026-01-30_database_error.md
│
├── 📁 Coder/                          (NUEVA - 10 archivos)
│   ├── README_CODER.md
│   ├── REGLAS_CODER.md
│   ├── CHECKLIST_CODER_TAREA_2.md
│   ├── CHECKLIST_CODER_DATABASE_FIX.md
│   ├── CONFIRMACION_PARA_CODER.md
│   ├── INSTRUCCIONES_CODER_LANDING_PRICING.md
│   ├── INSTRUCCIONES_CODER_LOGIN_OTP.md
│   ├── INFORME_TECNICO_LOGIN_OTP.md
│   ├── TAREA_1_DOCKER_LOCAL.md
│   ├── TAREA_2_CHATBOT_GEMINI_TELEGRAM.md
│   └── TAREA_3_DASHBOARD_ADMIN_INTELIGENTE.md
│
├── 📁 Marketing/                      (NUEVA - 5 archivos)
│   ├── BASE_CONOCIMIENTO_CHATBOT_LEX.md
│   ├── ESTRATEGIA_B2B_CONSOLIDADO_EN_MARKETING.md
│   ├── LANDING_PAGE_ESTRATEGIA.md
│   ├── MARKETING_PRECIOS_COMPLETO.md
│   └── RESUMEN_CAMBIOS_PRICING_v3.md
│
├── 📁 QA/                             (NUEVA - 2 archivos)
│   ├── CHECKLIST_QA_TAREA_2.md
│   └── CHECKLIST_MEJORAS_UI_UX.md
│
├── 📁 _archived/                      (NUEVA - archivos obsoletos)
│   ├── LANDING_PAGE_ESTRATEGIA_v1_2026-01-27.md  (versión vieja)
│   └── MARKETING_v1_2026-01-27.md                (versión vieja)
│
├── 📄 INDICE.md                       (raíz - navegación principal)
├── 📄 README.md                       (raíz - descripción del proyecto)
├── 📄 GUIA_HENRY_VERIFICAR_SUPABASE.md  (raíz - guía para Henry)
├── 📄 RESUMEN_PARA_HENRY.md          (raíz - resumen ejecutivo)
│
├── 📁 src/                            (código fuente - NO TOCAR)
├── 📁 public/                         (assets - NO TOCAR)
├── 📁 scripts/                        (scripts - NO TOCAR)
├── 📁 sql_snippets/                   (SQL - NO TOCAR)
├── 📄 docker-compose.yml              (config - NO TOCAR)
├── 📄 Dockerfile                      (config - NO TOCAR)
├── 📄 package.json                    (config - NO TOCAR)
├── 📄 schema.sql                      (SQL - NO TOCAR)
└── ... (otros archivos de configuración)
```

---

## 📋 DETALLE DE MOVIMIENTOS

### **1. Crear carpeta `Arquitecto/` (13 archivos):**

```bash
mkdir -p Arquitecto/

# Mover archivos de arquitectura
mv ARQUITECTURA_*.md Arquitecto/
mv ANALISIS_ARQUITECTURA_AVANZADA.md Arquitecto/
mv DIAGRAMAS.md Arquitecto/
mv ROADMAP_IMPLEMENTACION.md Arquitecto/
mv ESTRUCTURA_TAREAS_Y_PERFILES.md Arquitecto/
mv FLUJO_IDENTIFICACION_USUARIO.md Arquitecto/
mv SISTEMA_IDENTIFICACION_CHATBOT.md Arquitecto/
mv VISTA_PRESENTACION_TIEMPO_REAL.md Arquitecto/
```

---

### **2. Reorganizar carpeta `Contralor/` (7 archivos):**

```bash
# Renombrar carpeta
mv Contralor_Desarrollo/ Contralor/

# Mover archivos adicionales
mv CONTRALOR_GESTION_COSTOS.md Contralor/
mv GESTION_COSTOS_PROYECTO.md Contralor/  # (si existe)
mv EQUIPO_AGENTES_CURSOR.md Contralor/
mv PLAN_BACKUP_Y_GIT.md Contralor/
mv PROGRESO.md Contralor/
```

---

### **3. Reorganizar carpeta `Database/` (9 archivos):**

```bash
# Renombrar carpeta
mv Database_DBA/ Database/

# Mover archivos adicionales
mv AUDITORIA_DATABASE_ASSEMBLY_2.0.md Database/
mv INDICE_AUDITORIA_DATABASE.md Database/
mv SOLUCION_URGENTE_DATABASE_ERROR.md Database/
```

---

### **4. Crear carpeta `Coder/` (10 archivos):**

```bash
mkdir -p Coder/

# Mover archivos del Coder
mv README_CODER.md Coder/
mv REGLAS_CODER.md Coder/
mv CHECKLIST_CODER_*.md Coder/
mv CONFIRMACION_PARA_CODER.md Coder/
mv INSTRUCCIONES_CODER_*.md Coder/
mv INFORME_TECNICO_LOGIN_OTP.md Coder/
mv TAREA_*.md Coder/
```

---

### **5. Crear carpeta `Marketing/` (5 archivos):**

```bash
mkdir -p Marketing/

# Mover archivos de marketing
mv BASE_CONOCIMIENTO_CHATBOT_LEX.md Marketing/
mv ESTRATEGIA_B2B_CONSOLIDADO_EN_MARKETING.md Marketing/
mv LANDING_PAGE_ESTRATEGIA.md Marketing/
mv MARKETING_PRECIOS_COMPLETO.md Marketing/
mv RESUMEN_CAMBIOS_PRICING_v3.md Marketing/
```

---

### **6. Crear carpeta `QA/` (2 archivos):**

```bash
mkdir -p QA/

# Mover archivos de QA
mv CHECKLIST_QA_*.md QA/
mv CHECKLIST_MEJORAS_UI_UX.md QA/
```

---

### **7. Archivar versiones obsoletas (2 archivos):**

```bash
mkdir -p _archived/

# Mover versiones viejas
mv LANDING_PAGE_ESTRATEGIA_v1_2026-01-27.md _archived/
mv MARKETING_v1_2026-01-27.md _archived/
```

---

## 📊 COMPARATIVA ANTES/DESPUÉS

| MÉTRICA | ANTES | DESPUÉS | MEJORA |
|---------|-------|---------|--------|
| **Archivos .md en raíz** | 44 | 4 | -91% 🎉 |
| **Carpetas organizadas** | 2 | 7 | +250% ✅ |
| **Archivos por agente** | Mezclados | Separados | 100% ✅ |
| **Archivos obsoletos** | En raíz | _archived/ | ✅ |
| **Navegabilidad** | Difícil ❌ | Fácil ✅ | +90% |

---

## ⚠️ ARCHIVOS QUE NO SE TOCAN

```
✅ src/ (código fuente del Coder)
✅ public/ (assets, imágenes)
✅ scripts/ (scripts de utilidad)
✅ sql_snippets/ (scripts SQL del Database)
✅ docker-compose.yml
✅ Dockerfile
✅ package.json
✅ package-lock.json
✅ schema.sql
✅ middleware.ts
✅ tsconfig.json
✅ next-env.d.ts
✅ .gitignore
```

**Razón:** Son archivos de código/configuración que necesita el Coder. Solo movemos documentación (.md).

---

## 🎯 BENEFICIOS

### **1. Navegación Clara:**
```
Quiero ver arquitectura → Entro a Arquitecto/
Quiero ver costos → Entro a Contralor/
Quiero ver tareas de DB → Entro a Database/
Quiero ver instrucciones de código → Entro a Coder/
Quiero ver marketing → Entro a Marketing/
```

### **2. Responsabilidades Definidas:**
```
Cada agente tiene su carpeta
No hay confusión de quién creó qué
Fácil auditar trabajo de cada agente
```

### **3. Raíz Limpia:**
```
Solo 4 archivos principales en raíz:
- INDICE.md (navegación)
- README.md (descripción)
- GUIA_HENRY_VERIFICAR_SUPABASE.md
- RESUMEN_PARA_HENRY.md
```

### **4. Histórico Preservado:**
```
Versiones viejas en _archived/
No se pierde información
Pero no molestan en búsquedas
```

---

## 📝 ACTUALIZACIÓN DE REFERENCIAS

### **INDICE.md necesita actualizar rutas:**

```markdown
# Antes:
- `ARQUITECTURA_ASSEMBLY_2.0.md`

# Después:
- `Arquitecto/ARQUITECTURA_ASSEMBLY_2.0.md`
```

### **PROGRESO.md necesita actualizar rutas:**

```markdown
# Antes:
**Documentos:** `ARQUITECTURA_LOGIN_AUTENTICACION.md`

# Después:
**Documentos:** `Arquitecto/ARQUITECTURA_LOGIN_AUTENTICACION.md`
```

---

## ✅ SCRIPT DE REORGANIZACIÓN AUTOMÁTICO

```bash
#!/bin/bash
# reorganizar_proyecto.sh
# Ejecutar desde: /Users/henrybatista/LiveAssambly version 2.0/

echo "🚀 Iniciando reorganización de Assembly 2.0..."

# 1. Crear carpetas nuevas
mkdir -p Arquitecto Coder Marketing QA _archived

# 2. Mover archivos Arquitecto
mv ARQUITECTURA_*.md Arquitecto/ 2>/dev/null
mv ANALISIS_ARQUITECTURA_AVANZADA.md Arquitecto/ 2>/dev/null
mv DIAGRAMAS.md Arquitecto/ 2>/dev/null
mv ROADMAP_IMPLEMENTACION.md Arquitecto/ 2>/dev/null
mv ESTRUCTURA_TAREAS_Y_PERFILES.md Arquitecto/ 2>/dev/null
mv FLUJO_IDENTIFICACION_USUARIO.md Arquitecto/ 2>/dev/null
mv SISTEMA_IDENTIFICACION_CHATBOT.md Arquitecto/ 2>/dev/null
mv VISTA_PRESENTACION_TIEMPO_REAL.md Arquitecto/ 2>/dev/null

# 3. Renombrar y completar carpeta Contralor
mv Contralor_Desarrollo/ Contralor/ 2>/dev/null
mv CONTRALOR_GESTION_COSTOS.md Contralor/ 2>/dev/null
mv GESTION_COSTOS_PROYECTO.md Contralor/ 2>/dev/null
mv EQUIPO_AGENTES_CURSOR.md Contralor/ 2>/dev/null
mv PLAN_BACKUP_Y_GIT.md Contralor/ 2>/dev/null
mv PROGRESO.md Contralor/ 2>/dev/null

# 4. Renombrar y completar carpeta Database
mv Database_DBA/ Database/ 2>/dev/null
mv AUDITORIA_DATABASE_ASSEMBLY_2.0.md Database/ 2>/dev/null
mv INDICE_AUDITORIA_DATABASE.md Database/ 2>/dev/null
mv SOLUCION_URGENTE_DATABASE_ERROR.md Database/ 2>/dev/null

# 5. Mover archivos Coder
mv README_CODER.md Coder/ 2>/dev/null
mv REGLAS_CODER.md Coder/ 2>/dev/null
mv CHECKLIST_CODER_*.md Coder/ 2>/dev/null
mv CONFIRMACION_PARA_CODER.md Coder/ 2>/dev/null
mv INSTRUCCIONES_CODER_*.md Coder/ 2>/dev/null
mv INFORME_TECNICO_LOGIN_OTP.md Coder/ 2>/dev/null
mv TAREA_*.md Coder/ 2>/dev/null

# 6. Mover archivos Marketing
mv BASE_CONOCIMIENTO_CHATBOT_LEX.md Marketing/ 2>/dev/null
mv ESTRATEGIA_B2B_CONSOLIDADO_EN_MARKETING.md Marketing/ 2>/dev/null
mv LANDING_PAGE_ESTRATEGIA.md Marketing/ 2>/dev/null
mv MARKETING_PRECIOS_COMPLETO.md Marketing/ 2>/dev/null
mv RESUMEN_CAMBIOS_PRICING_v3.md Marketing/ 2>/dev/null

# 7. Mover archivos QA
mv CHECKLIST_QA_*.md QA/ 2>/dev/null
mv CHECKLIST_MEJORAS_UI_UX.md QA/ 2>/dev/null

# 8. Archivar versiones obsoletas
mv LANDING_PAGE_ESTRATEGIA_v1_2026-01-27.md _archived/ 2>/dev/null
mv MARKETING_v1_2026-01-27.md _archived/ 2>/dev/null

echo "✅ Reorganización completada!"
echo ""
echo "📊 Resumen:"
echo "- Arquitecto: $(ls -1 Arquitecto/ | wc -l) archivos"
echo "- Contralor: $(ls -1 Contralor/ | wc -l) archivos"
echo "- Database: $(ls -1 Database/ | wc -l) archivos"
echo "- Coder: $(ls -1 Coder/ | wc -l) archivos"
echo "- Marketing: $(ls -1 Marketing/ | wc -l) archivos"
echo "- QA: $(ls -1 QA/ | wc -l) archivos"
echo "- Raíz: $(ls -1 *.md 2>/dev/null | wc -l) archivos"
```

---

## 🚨 PRECAUCIONES

### **ANTES de ejecutar el script:**

```bash
# 1. Hacer backup completo
cd "/Users/henrybatista/LiveAssambly version 2.0"
tar -czf ../assembly-2-0-backup-$(date +%Y%m%d).tar.gz .

# 2. Commit a Git
git add .
git commit -m "Backup antes de reorganización de carpetas"
git push

# 3. Ejecutar script
bash reorganizar_proyecto.sh

# 4. Verificar resultado
ls -la
ls -la Arquitecto/
ls -la Contralor/
ls -la Database/
ls -la Coder/
ls -la Marketing/
ls -la QA/

# 5. Si todo OK, commit nuevamente
git add .
git commit -m "Reorganización de carpetas por agente"
git push
```

---

## 📞 APROBACIÓN REQUERIDA

**Henry, necesito tu aprobación para:**

```
[ ] Crear carpetas nuevas (Arquitecto, Coder, Marketing, QA, _archived)
[ ] Renombrar carpetas existentes (Contralor_Desarrollo → Contralor, Database_DBA → Database)
[ ] Mover 44 archivos .md de la raíz a sus carpetas correspondientes
[ ] Archivar 2 versiones obsoletas en _archived/
[ ] Actualizar INDICE.md con nuevas rutas
[ ] Ejecutar script de reorganización
```

**¿Apruebas la reorganización?** (Responde: SÍ para proceder, NO para cancelar, o REVISAR para ajustes)

---

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Status:** ⏸️ ESPERANDO APROBACIÓN DE HENRY
