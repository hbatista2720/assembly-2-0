# 🛡️ PLAN DE BACKUP Y RECUPERACIÓN
## Assembly 2.0 - Protección de Código y Documentación

**Versión:** 1.0  
**Fecha:** 29 Enero 2026  
**Autor:** Arquitecto Assembly 2.0  
**Audiencia:** Coder (OBLIGATORIO LEER)

---

## 🚨 PROBLEMA QUE RESOLVEMOS

**Situación actual:**
```
❌ Se perdió todo el código fuente (src/, app/, package.json)
❌ NO había Git para recuperar
❌ NO había backups
❌ Pérdida total del trabajo de 2 días
```

**Este documento previene que vuelva a pasar.**

---

## ⚠️ REGLAS OBLIGATORIAS

### **REGLA #1: Git desde el PRIMER MINUTO**
```
NUNCA empieces a codear sin Git.
NUNCA hagas más de 30 minutos de trabajo sin commit.
```

### **REGLA #2: Commits FRECUENTES**
```
Cada 30-60 minutos → git commit
Al terminar una funcionalidad → git commit
Antes de cambios grandes → git commit
Al final del día → git commit + git push
```

### **REGLA #3: GitHub como Backup**
```
Al menos 1 push por día.
Antes de apagar la computadora → git push
Si funciona algo importante → git push inmediatamente
```

---

## 🚀 PASO 1: INICIALIZAR GIT (AHORA MISMO)

### **Ejecutar estos comandos:**

```bash
# 1. Ir a la carpeta del proyecto
cd "/Users/henrybatista/LiveAssambly version 2.0"

# 2. Inicializar Git
git init

# 3. Configurar tu identidad
git config user.name "Coder Assembly"
git config user.email "coder@assembly2.com"

# 4. Ver estado actual
git status

# 5. Agregar TODOS los archivos
git add .

# 6. Primer commit
git commit -m "initial: Arquitectura completa Assembly 2.0

- 30+ archivos de documentación
- Schema SQL completo
- Configuración Docker
- .env.local configurado
- Arquitecturas de Login, Registro, Votación
- Base de conocimiento del chatbot

Nota: Código fuente se perdió, será recreado."

# 7. Verificar que se creó
git log --oneline
```

**Resultado esperado:**
```
✅ Repositorio Git creado
✅ Primer commit con 30+ archivos
✅ Protección activada
```

---

## 🌐 PASO 2: CREAR REPOSITORIO EN GITHUB

### **Opción A: Via Web (Recomendada)**

1. Ve a: https://github.com/new
2. Nombre del repo: `assembly-2-0`
3. Descripción: "SaaS de gobernanza digital para asambleas PH"
4. Privado: ✅ (Sí, privado)
5. NO inicialices con README (ya lo tienes)
6. Crear repositorio

**Luego, conectarlo:**

```bash
# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/assembly-2-0.git

# Verificar
git remote -v

# Subir todo
git branch -M main
git push -u origin main
```

### **Opción B: Via CLI (Si tienes gh instalado)**

```bash
# Crear repo privado y conectar automáticamente
gh repo create assembly-2-0 --private --source=. --push

# Listo!
```

---

## 📅 PASO 3: RUTINA DIARIA OBLIGATORIA

### **CADA 30-60 MINUTOS (mientras trabajas):**

```bash
# Guardar tu progreso
git add .
git commit -m "progress: [lo que hiciste]"

# Ejemplos:
git commit -m "progress: Login page 50% completo"
git commit -m "progress: API register-demo funcionando"
git commit -m "progress: Validaciones de votación"
```

### **AL TERMINAR UNA FUNCIONALIDAD:**

```bash
git add .
git commit -m "feat: Login completo y probado"
```

### **AL FINAL DEL DÍA (OBLIGATORIO):**

```bash
# 1. Commit final del día
git add .
git commit -m "chore: Fin de día - [resumen de avances]"

# 2. SUBIR A GITHUB
git push

# 3. Verificar que subió
git status
```

**Resultado:** Tu trabajo está seguro en la nube ✅

---

## 🏷️ PASO 4: VERSIONES IMPORTANTES

### **Cuando algo FUNCIONE BIEN:**

```bash
# Marcar versión
git tag -a v0.1 -m "Login funcionando"
git push --tags

# Ejemplos:
git tag -a v0.2 -m "Registro de residentes completo"
git tag -a v0.3 -m "Votación Face ID funcionando"
git tag -a v1.0 -m "MVP completo - Demo funcional"
```

**Beneficio:** Puedes volver a esa versión en cualquier momento:
```bash
git checkout v0.1
```

---

## 🌿 PASO 5: RAMAS PARA EXPERIMENTAR

### **Antes de cambios grandes o riesgosos:**

```bash
# Crear rama para experimento
git checkout -b feature/nuevo-dashboard

# Trabajar aquí
git add .
git commit -m "WIP: Dashboard experimental"

# Si funciona bien:
git checkout main
git merge feature/nuevo-dashboard
git push

# Si NO funciona:
git checkout main
git branch -D feature/nuevo-dashboard
# La rama main sigue intacta
```

---

## 🔄 RECUPERACIÓN DE DESASTRES

### **Escenario 1: Borraste archivos por error**

```bash
# Ver qué cambió
git status

# Recuperar archivo borrado
git checkout HEAD -- archivo-borrado.tsx

# Recuperar TODO
git reset --hard HEAD
```

### **Escenario 2: Código no funciona, quieres volver atrás**

```bash
# Ver commits recientes
git log --oneline -10

# Volver a commit específico
git checkout abc1234

# O volver 1 commit atrás
git reset --hard HEAD~1
```

### **Escenario 3: Perdiste TODA la carpeta**

```bash
# Si tienes GitHub, clonar de nuevo
git clone https://github.com/TU_USUARIO/assembly-2-0.git

# Todo de vuelta
```

---

## 📊 ESTRATEGIA COMPLETA DE PROTECCIÓN

```
┌─────────────────────────────────────────┐
│  NIVEL 1: Git Local (cada hora)        │
│  - Commits frecuentes                   │
│  - Historial completo                   │
│  - Puedes deshacer cambios              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  NIVEL 2: GitHub (cada día)             │
│  - Backup en la nube                    │
│  - Acceso desde cualquier lugar         │
│  - Nunca se pierde                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  NIVEL 3: Tags (cuando funciona)        │
│  - Versiones estables marcadas          │
│  - Fácil de volver a versión que andaba│
│  - Releases organizados                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  NIVEL 4: Ramas (para experimentos)    │
│  - Probar sin romper main               │
│  - Desarrollo paralelo                  │
│  - Seguridad total                      │
└─────────────────────────────────────────┘
```

---

## 📝 MENSAJES DE COMMIT RECOMENDADOS

### **Tipos de commits:**

```bash
# Nueva funcionalidad
git commit -m "feat: Login con Face ID"

# Corrección de bug
git commit -m "fix: Validación de email en registro"

# Documentación
git commit -m "docs: Actualizar README con instrucciones"

# Progreso (trabajo en curso)
git commit -m "progress: Dashboard admin 60% completo"

# Refactorización
git commit -m "refactor: Simplificar lógica de votación"

# Testing
git commit -m "test: Agregar tests de validación"

# Configuración
git commit -m "chore: Actualizar dependencias"
```

---

## 🔍 COMANDOS ÚTILES

### **Ver historial:**
```bash
# Últimos 10 commits
git log --oneline -10

# Ver cambios de un archivo
git log --oneline -- app/login/page.tsx

# Ver qué cambió en un commit
git show abc1234
```

### **Ver diferencias:**
```bash
# Qué cambió (antes de commit)
git diff

# Qué está en staging
git diff --staged

# Comparar con commit anterior
git diff HEAD~1
```

### **Deshacer cambios:**
```bash
# Deshacer cambios NO guardados
git checkout -- archivo.tsx

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer último commit (BORRA cambios)
git reset --hard HEAD~1
```

---

## 🎯 CHECKLIST OBLIGATORIO

### **ANTES de empezar a codear:**
- [ ] Git init ejecutado
- [ ] Primer commit creado
- [ ] GitHub conectado
- [ ] Push inicial completado

### **DURANTE el desarrollo (cada hora):**
- [ ] git status (ver qué cambió)
- [ ] git add .
- [ ] git commit -m "progress: [descripción]"

### **AL FINAL DEL DÍA:**
- [ ] git add .
- [ ] git commit -m "chore: Fin de día - [resumen]"
- [ ] git push
- [ ] Verificar en GitHub que se subió

### **CUANDO ALGO FUNCIONA BIEN:**
- [ ] git tag -a v0.x -m "Descripción"
- [ ] git push --tags

---

## 🚨 SEÑALES DE ALERTA

### **🔴 PELIGRO - Actúa inmediatamente:**

```
1. Trabajaste 2+ horas sin commit
   → git add . && git commit -m "progress: ..."

2. No has hecho push en 2+ días
   → git push

3. Borraste algo por error
   → git checkout HEAD -- archivo

4. Código funcionaba y ahora no
   → git log (ver qué cambió)
   → git reset --hard <commit-anterior>

5. Experimento arriesgado
   → git checkout -b experiment
   → Trabaja en rama separada
```

---

## 📊 MÉTRICAS DE PROTECCIÓN

### **Buenas prácticas:**

| Métrica | Objetivo | Status |
|---------|----------|--------|
| Commits por día | 5-10 | 🎯 |
| Pushes por día | 1-2 | 🎯 |
| Tiempo sin commit | < 1 hora | ⚠️ |
| Tiempo sin push | < 24 horas | ⚠️ |
| Tags creados | 1 por feature | 📈 |
| Ramas activas | 1-3 | 🎯 |

---

## 🎁 BONUS: .gitignore CORRECTO

```bash
# Crear .gitignore si no existe
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
.vercel

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env (NO SUBIR SECRETOS)
.env.local
.env.development.local
.env.test.local
.env.production.local

# Cache
.npm-cache/
.eslintcache

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
EOF
```

---

## 🎯 PASOS INMEDIATOS PARA EL CODER

### **AHORA MISMO (10 minutos):**

```bash
# 1. Inicializar Git
git init

# 2. Agregar todo lo que existe
git add .

# 3. Primer commit (salvando documentación)
git commit -m "initial: Documentación y arquitectura completa

Incluye:
- 30+ archivos de arquitectura
- Schema SQL
- Configuración Docker y Supabase
- Diseño completo de Login, Registro, Votación

Código fuente será recreado en próximos commits."

# 4. Crear repo en GitHub (privado)
gh repo create assembly-2-0 --private --source=. --push

# O manualmente:
# - Ve a github.com/new
# - Crea repo privado
# - Ejecuta:
git remote add origin https://github.com/TU_USUARIO/assembly-2-0.git
git push -u origin main

# 5. Verificar que todo subió
git log --oneline
```

---

## 📋 RUTINA DIARIA DEL CODER

### **9:00 AM - Empezar el día:**
```bash
# Actualizar desde GitHub (por si hay cambios)
git pull
```

### **Cada 30-60 minutos:**
```bash
# Guardar progreso
git add .
git commit -m "progress: [lo que hiciste]"
```

### **Al terminar funcionalidad:**
```bash
# Commit completo
git add .
git commit -m "feat: [funcionalidad] completada

Incluye:
- [archivo1]
- [archivo2]
- Testing básico realizado"

# Push inmediatamente
git push
```

### **6:00 PM - Fin del día:**
```bash
# Commit final
git add .
git commit -m "chore: Avances del día $(date +%Y-%m-%d)

Completado:
- [lista de avances]

Pendiente:
- [lista de pendientes]"

# Push obligatorio
git push

# Verificar
git status
echo "✅ Trabajo guardado en GitHub"
```

---

## 🔥 RECUPERACIÓN DE CÓDIGO PERDIDO

### **Escenario 1: Borraste un archivo**

```bash
# Ver qué se borró
git status

# Recuperar archivo específico
git checkout HEAD -- src/components/Login.tsx

# Recuperar TODO
git checkout HEAD -- .
```

### **Escenario 2: Código dejó de funcionar**

```bash
# Ver últimos commits
git log --oneline -10

# Identificar el último commit que funcionaba
# Por ejemplo: abc1234 "feat: Login funcionando"

# Volver a ese punto
git checkout abc1234

# Probar si funciona
npm run dev

# Si funciona, crear rama desde ahí
git checkout -b fix-from-working
```

### **Escenario 3: Quieres deshacer commits**

```bash
# Ver historial
git log --oneline

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer último commit (BORRA cambios)
git reset --hard HEAD~1

# Deshacer múltiples commits
git reset --hard HEAD~3
```

### **Escenario 4: Perdiste TODO el proyecto**

```bash
# Si está en GitHub, clonar de nuevo
cd ~
git clone https://github.com/TU_USUARIO/assembly-2-0.git
cd assembly-2-0

# Instalar dependencias
npm install

# Listo, todo recuperado
```

---

## 📊 ESTRUCTURA DE RAMAS RECOMENDADA

### **Estrategia Simple:**

```
main (producción)
└── develop (desarrollo activo)
    ├── feature/login
    ├── feature/registro
    └── feature/votacion
```

### **Comandos:**

```bash
# Crear rama de desarrollo
git checkout -b develop

# Trabajar en feature específica
git checkout -b feature/login

# Cuando termines la feature
git checkout develop
git merge feature/login
git push

# Actualizar main cuando todo funcione
git checkout main
git merge develop
git push
```

---

## 🛡️ PROTECCIÓN EXTRA: BACKUPS LOCALES

### **Opción 1: Copia manual (cada semana)**

```bash
# Crear backup
cd ..
cp -r "LiveAssambly version 2.0" "LiveAssambly-BACKUP-$(date +%Y%m%d)"

# Resultado:
# LiveAssambly version 2.0/
# LiveAssambly-BACKUP-20260129/
```

### **Opción 2: Script automático**

```bash
# Crear script backup.sh
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="../backups"
PROJECT_DIR="/Users/henrybatista/LiveAssambly version 2.0"

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/assembly-$DATE.tar.gz" "$PROJECT_DIR"
echo "✅ Backup creado: assembly-$DATE.tar.gz"

# Mantener solo últimos 7 backups
ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +8 | xargs rm -f
EOF

chmod +x backup.sh

# Ejecutar cada semana
./backup.sh
```

---

## 🎯 VALIDACIÓN: ¿Estás Protegido?

### **Checklist de Seguridad:**

```bash
# ¿Tienes Git?
git status
# Debe mostrar: "On branch main" o similar

# ¿Tienes commits?
git log --oneline
# Debe mostrar: Lista de commits

# ¿Está conectado a GitHub?
git remote -v
# Debe mostrar: origin https://github.com/...

# ¿Último push fue reciente?
git log origin/main --oneline -1
# Debe ser de HOY o AYER

# Si todo eso funciona:
echo "✅ PROTEGIDO"
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### **❌ ERROR #1: "Luego hago commit"**
```
NO LO HAGAS.
Commit cada 30-60 minutos, sin excusas.
```

### **❌ ERROR #2: "No hago push porque no está listo"**
```
PUSH igual. Usa commits "progress: WIP"
GitHub es tu backup, no tu portfolio.
```

### **❌ ERROR #3: "Git es complicado"**
```
Solo necesitas 3 comandos:
git add .
git commit -m "mensaje"
git push

Con eso ya estás protegido.
```

### **❌ ERROR #4: "Subir .env.local a GitHub"**
```
NUNCA subas:
- .env.local (secretos)
- node_modules/ (pesado)
- .next/ (regenerable)

Usa .gitignore para bloquearlo.
```

---

## 🎓 COMANDOS ESENCIALES (Hoja de Referencia)

### **Setup inicial (1 vez):**
```bash
git init
git add .
git commit -m "initial: Proyecto inicial"
git remote add origin <url>
git push -u origin main
```

### **Día a día:**
```bash
# Guardar trabajo
git add .
git commit -m "progress: [qué hiciste]"

# Subir a GitHub
git push

# Ver estado
git status
```

### **Recuperación:**
```bash
# Deshacer cambios
git checkout HEAD -- archivo.tsx

# Volver atrás
git reset --hard HEAD~1

# Ver historial
git log --oneline
```

---

## 📞 SI NECESITAS AYUDA

### **Comandos de diagnóstico:**

```bash
# ¿Qué cambió?
git status
git diff

# ¿Dónde estoy?
git branch
git log --oneline -5

# ¿Está conectado a GitHub?
git remote -v

# ¿Cuál es el último commit?
git log -1
```

### **Preguntas frecuentes:**

**P: ¿Cuándo hago commit?**  
R: Cada 30-60 minutos, o cuando termines algo importante.

**P: ¿Cuándo hago push?**  
R: Al menos 1 vez al día (al final del día).

**P: ¿Qué pongo en el mensaje de commit?**  
R: Resumen corto de lo que hiciste (1 línea).

**P: ¿Puedo deshacer un commit?**  
R: Sí, usa `git reset --soft HEAD~1` (mantiene cambios) o `--hard` (borra cambios).

**P: ¿Y si rompo todo?**  
R: `git reset --hard <commit-anterior>` y listo.

---

## 🎯 PLAN DE ACCIÓN INMEDIATA

### **EJECUTAR AHORA (NO ESPERAR):**

```bash
# 1. Inicializar Git (5 min)
cd "/Users/henrybatista/LiveAssambly version 2.0"
git init
git add .
git commit -m "initial: Arquitectura Assembly 2.0"

# 2. Crear GitHub (5 min)
# - Ve a github.com/new
# - Crea repo privado "assembly-2-0"
# - Conecta:
git remote add origin https://github.com/henrybatista/assembly-2-0.git
git push -u origin main

# 3. Verificar (1 min)
git log --oneline
echo "✅ PROTEGIDO"
```

**TOTAL: 11 minutos para NUNCA perder trabajo de nuevo.**

---

## 📈 PROGRESO VISIBLE

### **Después de 1 semana con Git:**

```bash
# Ver tu progreso
git log --oneline --graph --all

# Resultado:
* abc1234 (HEAD -> main) feat: Votación completa
* def5678 feat: Registro de residentes
* ghi9012 feat: Login funcionando
* jkl3456 progress: Dashboard 80%
* mno7890 progress: Componentes básicos
* pqr1234 initial: Arquitectura completa

# 6 commits = 6 puntos de recuperación
# Si algo falla, vuelves a cualquiera
```

---

## 💡 RESUMEN EJECUTIVO

### **3 Comandos que te salvan:**

```bash
# 1. Guardar progreso (cada hora)
git add . && git commit -m "progress: ..."

# 2. Backup en la nube (cada día)
git push

# 3. Versión estable (cuando funciona)
git tag -a v0.1 -m "Login funcionando" && git push --tags
```

### **Con esto:**
- ✅ NUNCA pierdes más de 1 hora de trabajo
- ✅ Puedes volver atrás en cualquier momento
- ✅ GitHub tiene tu backup siempre
- ✅ Puedes recuperar desde cualquier máquina

---

## 🔗 RECURSOS ADICIONALES

**Aprender Git (15 min):**
- https://learngitbranching.js.org/ (tutorial interactivo)
- https://git-scm.com/docs (documentación oficial)

**GitHub Desktop (alternativa visual):**
- https://desktop.github.com/
- No necesitas comandos, todo con clicks

---

## ✅ CONFIRMACIÓN FINAL

**Después de ejecutar los comandos de "PLAN DE ACCIÓN INMEDIATA", verifica:**

```bash
# ¿Git funcionando?
git status
# Debe decir: "On branch main, nothing to commit"

# ¿GitHub conectado?
git remote -v
# Debe mostrar: origin https://github.com/...

# ¿Commits existen?
git log --oneline
# Debe mostrar: Al menos 1 commit

# ¿Se puede recuperar?
git clone <url> /tmp/test-clone
# Debe clonar todo exitosamente
```

**Si todo eso funciona: ✅ ESTÁS PROTEGIDO**

---

**Fecha:** 29 Enero 2026  
**Versión:** 1.0  
**Autor:** Arquitecto Assembly 2.0  
**Status:** 🔴 CRÍTICO - EJECUTAR INMEDIATAMENTE

---

🎯 **SIGUIENTE PASO:** Coder ejecuta "PLAN DE ACCIÓN INMEDIATA" ANTES de escribir una línea de código.
