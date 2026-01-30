# 🏠 ESTRATEGIA DE LANDING PAGE - Assembly 2.0
**Navegación y Contenido por Tipo de Usuario**

**Versión:** 2.0  
**Fecha:** 28 Enero 2026 ✅ APROBADO  
**Versión anterior:** `LANDING_PAGE_ESTRATEGIA_v1_2026-01-27.md`  
**Backup estable:** `LANDING_PAGE_ESTRATEGIA_v1.md`  
**Sistema de 2 versiones:** mantener `LANDING_PAGE_ESTRATEGIA.md` (actual) y `LANDING_PAGE_ESTRATEGIA_v1.md` (backup)

---

## 🎯 PÚBLICO OBJETIVO (3 PERFILES)

### **Perfil 1: Administrador de PH** ⭐ PRINCIPAL
- Administra 1-30 edificios
- Hace 2-4 asambleas por año por edificio
- Necesita: Eficiencia, cumplimiento legal, transparencia

### **Perfil 2: Junta Directiva**
- Representa a los propietarios
- Organiza/supervisa asambleas
- Necesita: Herramientas para convocar, transparencia en resultados

### **Perfil 3: Residente/Propietario**
- Asiste a asambleas ocasionalmente
- Vota sobre temas importantes
- Necesita: Simplicidad, votar desde celular, ver resultados

---

## 🚫 **IMPORTANTE: QUÉ NO MOSTRAR**

❌ **NO mostrar funcionalidades del Admin de Plataforma:**
- Dashboard de leads
- Gestión de tickets
- CRM interno
- Subscripciones
- Configuración de chatbot

✅ **SÍ mostrar funcionalidades para clientes:**
- Gestión de asambleas
- Votación digital
- Quórum en tiempo real
- Actas automáticas
- Poderes digitales

---

## 📐 ESTRUCTURA DE NAVEGACIÓN

### **HEADER (Igual para todos)**

```
┌─────────────────────────────────────────────────────────┐
│ [Logo Assembly 2.0]  Inicio | Funciones | Precios |    │
│                      Casos | Ayuda | [Probar Demo]      │
└─────────────────────────────────────────────────────────┘
```

---

### **SECCIÓN 1: HERO (Adaptativo por Perfil)**

#### **Para Visitante Genérico (Sin identificar):**

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🏢 Digitaliza tus Asambleas de PH                    ║
║     en 15 minutos                                      ║
║                                                        ║
║  ✅ Votación por Face ID                              ║
║  ✅ Quórum en tiempo real                             ║
║  ✅ 100% Legal (Ley 284)                              ║
║                                                        ║
║  [Probar Demo GRATIS]  [Ver Video 2min]              ║
║                                                        ║
║  💬 Lex (Chatbot):                                     ║
║  "¡Hola! ¿Eres administrador, junta o propietario?"  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**Chatbot Lex pregunta:**
1. "¿Qué rol tienes?"
   - [ ] Administrador de PH
   - [ ] Junta Directiva
   - [ ] Propietario/Residente

**Según la respuesta → Adapta contenido abajo**

---

#### **Para Administrador de PH:**

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  📊 Gestiona 30 PHs desde 1 Dashboard                 ║
║                                                        ║
║  "Reduce 4 horas de preparación a 15 minutos"        ║
║                                                        ║
║  ✅ Importa 200 propietarios en 1 click               ║
║  ✅ Quórum calculado automáticamente                  ║
║  ✅ Actas legales generadas al instante               ║
║                                                        ║
║  [Probar Demo GRATIS]  [Ver Caso: Urban Tower]       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

#### **Para Junta Directiva:**

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🏛️ Organiza Asambleas Transparentes                  ║
║                                                        ║
║  "Convoca, vota y genera actas sin papeles"          ║
║                                                        ║
║  ✅ Convocatorias automáticas por email              ║
║  ✅ Votaciones con firma biométrica                   ║
║  ✅ Resultados visibles en pantalla grande            ║
║                                                        ║
║  [Solicitar Demo]  [Ver Cómo Funciona]               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

#### **Para Residente/Propietario:**

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  📱 Vota desde tu Celular                             ║
║                                                        ║
║  "Sin apps, sin contraseñas. Solo Face ID"           ║
║                                                        ║
║  ✅ Recibe invitación por email                       ║
║  ✅ Vota con Face ID desde tu iPhone                  ║
║  ✅ Ve resultados en tiempo real                      ║
║                                                        ║
║  [¿Tu edificio usa Assembly?]  [Video Demo]          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🤖 COMPORTAMIENTO DEL CHATBOT LEX

### **Flujo de Identificación:**

```
┌─────────────────────────────────────────────┐
│ Visitante llega a landing page              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Chatbot Lex: "¡Hola! 👋"                    │
│ "¿Qué rol tienes?"                          │
│                                             │
│ [ ] Administrador de PH                     │
│ [ ] Junta Directiva                         │
│ [ ] Propietario/Residente                   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Admin  │ │ Junta  │ │Resident│
   └────┬───┘ └────┬───┘ └────┬───┘
        │          │          │
        ▼          ▼          ▼
   [Contenido] [Contenido] [Contenido]
   específico   específico   específico
```

---

### **Conversación por Perfil:**

#### **1. Administrador de PH:**

```
Lex: "¡Perfecto! ¿Cuántos edificios administras?"

Usuario: "8 edificios"

Lex: "Imagino que hacer 8 asambleas al año consume mucho tiempo.
      ¿Tu mayor dolor es:"
      [ ] Preparar actas
      [ ] Calcular quórums
      [ ] Control de asistencia
      [ ] Todo lo anterior

Usuario: "Todo lo anterior"

Lex: "Te entiendo perfectamente. Assembly reduce eso de 4 horas
      a 15 minutos por asamblea.
      
      ¿Quieres ver cómo?"
      [Sí, mostrar demo]  [Agendar llamada]
```

**Acciones del chatbot:**
- Guarda: `userType = 'admin_ph'`, `numPHs = 8`
- Adapta landing: Muestra sección "Para Administradores"
- CTA principal: "Probar Demo GRATIS"

---

#### **2. Junta Directiva:**

```
Lex: "¡Genial! ¿De qué edificio eres parte de la junta?"

Usuario: "Torres del Este"

Lex: "¿Cuál es tu mayor reto al organizar asambleas?"
      [ ] Conseguir quórum
      [ ] Desconfianza de propietarios
      [ ] Actas complejas
      [ ] Falta de transparencia

Usuario: "Desconfianza de propietarios"

Lex: "Assembly resuelve eso con:
      • Votación con Face ID (imposible fraude)
      • Resultados proyectados en vivo
      • Acta certificada automáticamente
      
      ¿Te gustaría ver una demo de 5 minutos?"
      [Sí, agendar]  [Ver video]
```

**Acciones del chatbot:**
- Guarda: `userType = 'junta'`, `building = 'Torres del Este'`
- Adapta landing: Muestra "Transparencia y Confianza"
- CTA principal: "Agendar Demo"

---

#### **3. Residente/Propietario:**

```
Lex: "¡Hola! ¿Tu edificio ya usa Assembly 2.0?"

Usuario: "No sé"

Lex: "¿En qué edificio vives?"

Usuario: "Urban Tower"

Lex: "Déjame verificar... 
      [Busca en BD]
      
      No encontré Urban Tower en nuestro sistema.
      
      Pero puedes sugerirle a tu administrador que lo pruebe.
      ¿Quieres que le enviemos info?"
      [Sí, enviar]  [No, solo quiero saber más]

Usuario: "Sí, enviar"

Lex: "Perfecto. ¿Email del administrador?"

Usuario: "admin@urbantower.com"

Lex: "✅ Listo! Le enviamos:
      • Video de 2 min
      • Caso de éxito
      • Demo GRATIS por 30 días
      
      Nosotros te avisamos cuando tu edificio se registre.
      ¿Dejamos tu email?"
```

**Acciones del chatbot:**
- Guarda: `userType = 'residente'`, `building = 'Urban Tower'`
- Crea lead: `admin@urbantower.com`
- Adapta landing: Muestra "Vota desde tu Celular"
- CTA: "Recomienda Assembly a tu Admin"

---

## 📊 SECCIÓN 2: PROBLEMAS QUE RESOLVEMOS (Por Perfil)

### **Para Administrador de PH:**

```
╔════════════════════════════════════════════════════════╗
║ 🚨 ESTOS SON LOS DOLORES QUE RESOLVEMOS:              ║
║                                                        ║
║ ❌ Antes:                        ✅ Con Assembly:      ║
║ • 4 horas preparando acta       • 15 minutos total    ║
║ • Firmas ilegibles              • Face ID seguro      ║
║ • Quórum mal calculado          • Automático 0 error  ║
║ • Propietarios desconfían       • Transparencia 100%  ║
║ • Gestión de 8 PHs caótica      • 1 dashboard limpio  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

### **Para Junta Directiva:**

```
╔════════════════════════════════════════════════════════╗
║ 🚨 LOS RETOS DE LA JUNTA RESUELTOS:                   ║
║                                                        ║
║ ❌ Antes:                        ✅ Con Assembly:      ║
║ • Baja asistencia               • Voto remoto fácil   ║
║ • Desconfianza en resultados    • Blockchain auditable║
║ • Actas cuestionadas            • PDF certificado     ║
║ • Poderes complicados           • Upload y OCR auto   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

### **Para Residente:**

```
╔════════════════════════════════════════════════════════╗
║ 💡 VOTA SIN COMPLICACIONES:                           ║
║                                                        ║
║ ❌ Antes:                        ✅ Con Assembly:      ║
║ • Asistir presencial obligatorio• Vota desde casa     ║
║ • Firmas en papel              • Face ID en 5 seg     ║
║ • No ver resultados            • Live en pantalla     ║
║ • Duda si contaron mi voto     • Confirmación instant ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## ✨ SECCIÓN 3: FUNCIONES CLAVE (Por Perfil)

### **Para Administrador de PH:**

| Función | Beneficio |
|---------|-----------|
| 🤖 **Chatbot Lex Inteligente** | Soporte antes, durante y después de asamblea |
| 🔐 **Validación Face ID** | Seguridad biométrica, 0 fraude |
| ✋ **Voto Manual** | Opción para personas no tecnológicas |
| 📝 **Pre-registro Masivo** | Importa 250 residentes con Face ID en 1 click |
| ✅ **Asistencia Real-Time** | Ve quién llegó al instante |
| ⚡ **Quórum Automático** | Calculado dinámicamente, 0 errores |
| 📊 **Gráficas por Tema** | Resultados visuales en tiempo real |
| 📄 **Acta Digital Completa** | Generada al finalizar con participación + quórum + asistencia |
| 📱 **Dashboard Multi-PH** | Gestiona 30 edificios desde 1 panel |

---

### **Para Junta Directiva:**

| Función | Beneficio |
|---------|-----------|
| 🤖 **Chatbot Lex Guía** | Ayuda a residentes antes y durante asamblea |
| 🔐 **Votación Face ID** | Seguridad biométrica, imposible falsificar |
| ✋ **Voto Manual** | Para personas mayores o sin smartphone |
| 📝 **Pre-registro** | Lista de asistencia preparada antes |
| ✅ **Asistencia Live** | Ve quién llegó en tiempo real |
| ⚡ **Quórum Dinámico** | Calculado automáticamente, alertas si baja |
| 📊 **Gráficas por Tema** | Proyecta resultados en pantalla grande |
| 📄 **Acta Automática** | Generada al finalizar con todo documentado |
| 📧 **Convocatorias Auto** | Email + WhatsApp a todos |
| ✅ **Cumplimiento Ley 284** | 100% legal en Panamá |

---

### **Para Residente:**

| Función | Beneficio |
|---------|-----------|
| 🤖 **Chatbot Lex** | Te ayuda antes, durante y después de asamblea |
| 📱 **Voto Face ID** | Escaneas tu rostro, votas en 5 segundos |
| ✋ **Opción Manual** | Si no tienes smartphone, vota presencial |
| 📝 **Pre-registro** | Configura Face ID antes, vota más rápido |
| ✅ **Confirma Asistencia** | Marca que llegarás, se cuenta para quórum |
| 📊 **Resultados en Vivo** | Ve cómo va cada tema en tiempo real |
| 📄 **Acta Transparente** | Al terminar, ves toda la documentación |
| 🔒 **Voto Privado** | Nadie ve cómo votaste, solo que votaste |
| ✉️ **Recordatorios Auto** | Te avisamos antes de asamblea |

---

## 💰 SECCIÓN 4: PRECIOS (Adaptativo - v3.0 Premium)

### **Para Administrador de PH:**

```
┌─────────────────────────────────────────────────────┐
│ ELIGE TU PLAN                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🎯 EVENTO ÚNICO                                     │
│    $225 por asamblea                                │
│    ✅ Hasta 250 unidades                            │
│    ✅ Válido 12 meses                               │
│    ✅ Sin compromiso                                │
│    [Comprar Ahora]                                  │
│                                                     │
│ 💼 STANDARD (⭐ Recomendado para ti)               │
│    $189/mes                                         │
│    ✅ 2 asambleas/mes incluidas                     │
│    ✅ 3ra asamblea: +$75                            │
│    ✅ Dashboard siempre activo                      │
│    ✅ Compromiso 2 meses                            │
│    ✅ Hasta 250 unidades                            │
│    [Empezar Standard]                               │
│                                                     │
│ 🏢 MULTI-PH (Para 10-30 edificios)                 │
│    $699/mes                                         │
│    ✅ Hasta 30 edificios                            │
│    ✅ Asambleas ilimitadas                          │
│    ✅ Hasta 5,000 unidades totales                  │
│    ✅ CRM básico incluido                           │
│    [Agendar Demo]                                   │
│                                                     │
│ 💎 ENTERPRISE (Para promotoras)                    │
│    $2,499/mes                                       │
│    ✅ Todo ilimitado                                │
│    ✅ CRM avanzado + IA                             │
│    ✅ API premium                                   │
│    ✅ Consultoría legal 4h/mes                      │
│    [Contactar Ventas]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Chatbot Lex sugiere:**
> "Con 8 edificios y 2 asambleas/año por edificio:
>  
>  Opción 1: 16 x Evento Único = $3,600/año
>  Opción 2: Standard $189/mes = $2,268/año
>  Opción 3: Multi-PH $699/mes = $8,388/año
>  
>  Para ti, recomiendo **Standard**: Pagas $2,268/año
>  y ahorras $1,332 vs Evento Único.
>  
>  Además evitas $3,300-$6,200 en riesgos legales.
>  
>  ¿Quieres probarlo 30 días gratis?"

---

### **Para Junta Directiva:**

```
┌─────────────────────────────────────────────────────┐
│ OPCIONES PARA JUNTAS                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🎯 EVENTO ÚNICO (⭐ Recomendado)                   │
│    $225 por asamblea                                │
│    ✅ Solo pagas cuando la usas                     │
│    ✅ Crédito válido 12 meses                       │
│    [Reservar Fecha]                                 │
│                                                     │
│ 💼 DÚO PACK (Ahorra 15%)                           │
│    $389 por 2 asambleas                             │
│    ✅ 2 créditos válidos 12 meses                   │
│    ✅ Dashboard activo 12 meses                     │
│    [Comprar Pack]                                   │
│                                                     │
│ 📅 STANDARD (Para juntas activas)                  │
│    $189/mes                                         │
│    ✅ 2 asambleas/mes incluidas                     │
│    ✅ Compromiso 2 meses                            │
│    [Contratar]                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Chatbot Lex sugiere:**
> "Si hacen 2 asambleas/año, tienen 2 opciones:
>  
>  Opción 1: 2 x Evento Único = $450
>  Opción 2: Dúo Pack = $389 (ahorra $61)
>  Opción 3: Standard 2 meses = $378 (ahorra $72)
>  
>  **Recomiendo Dúo Pack**: Sin compromiso y más barato.
>  
>  ¿Quieren empezar con un Evento Único gratis para probar?"

---

### **Para Residente:**

```
┌─────────────────────────────────────────────────────┐
│ ¿TU EDIFICIO USA ASSEMBLY?                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Assembly es GRATIS para residentes.                │
│ Tu administrador paga el servicio.                 │
│                                                     │
│ Si tu edificio NO usa Assembly:                    │
│ [Recomienda a tu Admin]                            │
│                                                     │
│ Si ya usan Assembly:                               │
│ [Ver Demo de Cómo Votar]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Chatbot Lex pregunta:**
> "¿Quieres que le enviemos info a tu administrador?
>  Solo necesito su email y le mandamos un video de 2 min."

---

## 📸 SECCIÓN 5: CASOS DE ÉXITO (Compartidos)

```
╔════════════════════════════════════════════════════════╗
║ 🏆 EDIFICIOS QUE YA CONFÍAN EN ASSEMBLY                ║
║                                                        ║
║ ┌────────────────────────────────────────────────┐   ║
║ │ 🏢 P.H. Urban Tower (200 unidades)             │   ║
║ │ "Redujimos 4 horas a 15 minutos por asamblea" │   ║
║ │ - María López, Administradora                  │   ║
║ └────────────────────────────────────────────────┘   ║
║                                                        ║
║ ┌────────────────────────────────────────────────┐   ║
║ │ 🏢 Torres del Pacífico (150 unidades)          │   ║
║ │ "0 fraudes en votaciones. Propietarios         │   ║
║ │  confían 100% en los resultados"               │   ║
║ │ - Juan Pérez, Junta Directiva                  │   ║
║ └────────────────────────────────────────────────┘   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 💬 SECCIÓN 6: FAQ (Adaptativo)

### **Para Administrador:**

<details>
<summary>¿Cuánto tiempo toma implementar Assembly?</summary>

**15 minutos total:**
1. Importas Excel de propietarios (2 min)
2. Configuras la asamblea (3 min)
3. Envías invitaciones (automático)
4. ¡Listo para votar!

[Ver Video Tutorial]
</details>

<details>
<summary>¿Es legal en Panamá?</summary>

Sí. 100% cumplimiento de Ley 284.
- Votación por coeficientes ✅
- Distinción Al Día vs Mora ✅
- Actas con firma digital certificada ✅

[Ver Certificación Legal]
</details>

---

### **Para Junta:**

<details>
<summary>¿Los propietarios necesitan instalar algo?</summary>

NO. Solo necesitan:
- Celular con Face ID/Touch ID
- Email para recibir la invitación

Votan desde el navegador web.
</details>

---

### **Para Residente:**

<details>
<summary>¿Mi voto es privado?</summary>

SÍ. Tu voto está cifrado.
Solo tú y el sistema sabemos cómo votaste.

Los demás solo ven:
- Unidad A-101 votó ✅
- Pero NO ven si votaste SÍ o NO
</details>

---

## 🎯 FOOTER (Igual para todos)

```
┌─────────────────────────────────────────────────────┐
│ Assembly 2.0 - Gobernanza Digital para PHs         │
│                                                     │
│ Producto          Recursos       Empresa           │
│ • Funciones       • Docs         • Sobre nosotros  │
│ • Precios         • Blog         • Contacto        │
│ • Demo            • Videos       • Legal           │
│                                                     │
│ 📧 contacto@assembly2.app                          │
│ 📱 +507 6123-4567                                  │
│                                                     │
│ © 2026 Assembly 2.0 - Hecho en Panamá 🇵🇦          │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 SISTEMA DE VERSIONADO

### **Reglas:**

1. ✅ Solo 2 versiones guardadas:
   - `LANDING_PAGE_ESTRATEGIA.md` (actual)
   - `LANDING_PAGE_ESTRATEGIA_v1_FECHA.md` (anterior)

2. ✅ Cuando se actualice:
   - Eliminar versión v1 más vieja
   - Renombrar actual a v1
   - Crear nueva versión actual

3. ✅ Nomenclatura:
   - Versión actual: `LANDING_PAGE_ESTRATEGIA.md`
   - Versión anterior: `LANDING_PAGE_ESTRATEGIA_v1_YYYY-MM-DD.md`

---

## 📋 CHECKLIST PARA EL CODER

Cuando implementes la landing page:

### **HTML/React Components:**
- [ ] Header con navegación
- [ ] Hero adaptativo (3 versiones)
- [ ] Chatbot Lex integrado
- [ ] Sección Problemas (3 versiones)
- [ ] Sección Funciones (3 versiones)
- [ ] Sección Precios (3 versiones)
- [ ] Casos de éxito
- [ ] FAQ adaptativo
- [ ] Footer

### **Lógica de Adaptación:**
- [ ] Detectar tipo de usuario (via chatbot)
- [ ] Guardar en localStorage: `userType`
- [ ] Adaptar contenido según `userType`
- [ ] CTA principal según perfil

### **Integración Chatbot:**
- [ ] Bot de Telegram embebido
- [ ] Guardar respuestas en BD
- [ ] Identificar perfil automáticamente
- [ ] Adaptar contenido en tiempo real

---

**Última actualización:** 27 Enero 2026  
**Autor:** Arquitecto Assembly 2.0  
**Para:** Equipo de desarrollo
