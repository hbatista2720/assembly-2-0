# 🤖 PROMPTS PARA EL CODER - FASE 08
## Implementación de Precios v4.0 (Multi-PH Lite + Lógica Triple)

**Fecha:** 30 Enero 2026  
**Fase:** 08 - Sistema de Suscripción y Precios v4.0  
**Validación Técnica:** ✅ Aprobada por Arquitecto  
**Documento de referencia:** `Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md`

---

## 📋 CONTEXTO PARA EL CODER:

```
Marketing actualizó los planes de precios (v4.0):
├─ NUEVO plan: Multi-PH Lite ($399/mes) para 10 edificios
├─ Regla: "Lo que ocurra primero" (PHs, Residentes o Asambleas)
├─ Upgrade Trigger: Banner automático al 90% de cualquier límite
└─ Enterprise: ILIMITADO con validación de uso justo

El Arquitecto validó que todo es técnicamente viable.
Ahora debes implementar los cambios en Base de Datos, Backend y Frontend.
```

---

## 🗄️ PARTE 1: BASE DE DATOS (SQL)

### **PROMPT 1.1 - Agregar nuevo plan Multi-PH Lite**

```
Actualiza la tabla `subscriptions` para incluir el nuevo plan 'MULTI_PH_LITE'.

CONTEXTO:
- Marketing creó un plan intermedio de $399/mes para administradoras pequeñas
- Este plan permite: 10 edificios, 1,500 residentes totales, 5 asambleas/mes

TAREA:
1. Modifica el constraint del campo `plan_tier` para agregar 'MULTI_PH_LITE'
2. Asegúrate de mantener el orden lógico: DEMO, EVENTO_UNICO, DUO_PACK, STANDARD, MULTI_PH_LITE, MULTI_PH_PRO, ENTERPRISE

RESULTADO ESPERADO:
- El enum debe tener 7 planes (antes tenía 6)
- No debe romper datos existentes

ARCHIVO: src/lib/db/migrations/add_multi_ph_lite_plan.sql
```

---

### **PROMPT 1.2 - Agregar campo para límite total de residentes**

```
Agrega un nuevo campo `max_units_total_all_orgs` a la tabla `subscriptions` para controlar el límite de residentes sumando TODOS los edificios de la cartera.

CONTEXTO:
- Antes solo validábamos unidades por edificio individual
- Ahora necesitamos validar la SUMA TOTAL de residentes de todos los edificios
- Ejemplo: Multi-PH Lite permite máximo 1,500 residentes sumando todos sus 10 edificios

TAREA:
1. Agrega el campo: max_units_total_all_orgs INT
2. Actualiza los valores por defecto para cada plan:
   - STANDARD: 250
   - MULTI_PH_LITE: 1500
   - MULTI_PH_PRO: 5000
   - ENTERPRISE: NULL (ilimitado)

ARCHIVO: src/lib/db/migrations/add_max_units_total_field.sql
```

---

### **PROMPT 1.3 - Agregar campo para uso justo Enterprise**

```
Agrega el campo `company_tax_id` a la tabla `subscriptions` para validar que los clientes Enterprise solo administren edificios de la misma razón social.

CONTEXTO:
- El plan Enterprise es ilimitado pero tiene una restricción de "uso justo"
- Solo puede administrar edificios de la misma empresa (RUC/Tax ID)
- Esto evita que revendan el servicio a terceros

TAREA:
1. Agrega el campo: company_tax_id TEXT
2. Debe ser NULL para planes no-Enterprise
3. Debe ser obligatorio (validación en app) para Enterprise

ARCHIVO: src/lib/db/migrations/add_company_tax_id_field.sql
```

---

### **PROMPT 1.4 - Función SQL para verificar límites Multi-PH Lite**

```
Crea la función SQL `check_multi_ph_lite_limits()` que verifica si una suscripción Multi-PH Lite ha excedido alguno de sus 3 límites: edificios, residentes o asambleas.

CONTEXTO:
- Multi-PH Lite tiene límites: 10 edificios, 1,500 residentes totales, 5 asambleas/mes
- La regla es: "lo que ocurra primero" → si excede CUALQUIERA, necesita upgrade

TAREA:
Crea una función que:
1. Recibe: subscription_id (UUID)
2. Cuenta edificios totales de esa suscripción
3. Suma TODOS los residentes de TODOS los edificios
4. Cuenta asambleas del mes actual
5. Retorna JSON con:
   - current, limit, percentage para cada límite
   - needs_upgrade: true si excede alguno

RESULTADO ESPERADO:
{
  "organizations": {"current": 8, "limit": 10, "percentage": 80, "exceeded": false},
  "units": {"current": 1200, "limit": 1500, "percentage": 80, "exceeded": false},
  "assemblies": {"current": 3, "limit": 5, "percentage": 60, "exceeded": false},
  "needs_upgrade": false
}

ARCHIVO: src/lib/db/functions/check_multi_ph_lite_limits.sql
REFERENCIA: Ver código completo en Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 95-145
```

---

### **PROMPT 1.5 - Función SQL genérica para verificar límites de cualquier plan**

```
Crea la función SQL `check_plan_limits()` que verifica si CUALQUIER plan ha excedido sus límites usando la regla "lo que ocurra primero".

CONTEXTO:
- Todos los planes (excepto Enterprise) tienen límites
- La regla: si excedes CUALQUIER límite (edificios, residentes o asambleas) → upgrade requerido
- Debe funcionar para: Standard, Multi-PH Lite, Multi-PH Pro

TAREA:
Crea una función que:
1. Recibe: subscription_id (UUID)
2. Lee los límites del plan desde la tabla subscriptions
3. Cuenta valores actuales (edificios, residentes totales, asambleas del mes)
4. Retorna TRUE si excede CUALQUIER límite

LÓGICA:
RETURN (
  current_orgs > max_organizations OR
  current_units > max_units_total_all_orgs OR
  current_assemblies > max_assemblies_per_month
);

ARCHIVO: src/lib/db/functions/check_plan_limits.sql
REFERENCIA: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 212-245
```

---

### **PROMPT 1.6 - Función SQL para detectar planes ilimitados**

```
Crea la función SQL `is_unlimited_plan()` que detecta si una suscripción es Enterprise (ilimitado) para bypassear validaciones de límites.

CONTEXTO:
- Enterprise es el único plan sin límites
- Necesitamos una función rápida para detectarlo y evitar validaciones innecesarias

TAREA:
Crea una función simple que:
1. Recibe: subscription_id (UUID)
2. Retorna: TRUE si el plan es 'ENTERPRISE' y status = 'ACTIVE'
3. Retorna: FALSE en cualquier otro caso

USO:
IF is_unlimited_plan(sub_id) THEN
  -- No validar límites
ELSE
  -- Validar límites normalmente
END IF;

ARCHIVO: src/lib/db/functions/is_unlimited_plan.sql
```

---

## 🔧 PARTE 2: BACKEND API

### **PROMPT 2.1 - Endpoint para obtener límites actuales**

```
Crea el endpoint GET /api/subscription/:id/limits que retorna los límites actuales de una suscripción y sus porcentajes de uso.

CONTEXTO:
- El frontend necesita mostrar un banner de "Upgrade Sugerido" al 90% de cualquier límite
- Este endpoint alimenta ese banner con datos en tiempo real

TAREA:
1. Ruta: GET /api/subscription/:subscriptionId/limits
2. Autenticación: Requiere usuario autenticado
3. Validación: El usuario debe pertenecer a la organización de esa suscripción
4. Lógica:
   - Si es Enterprise → retornar todos los límites como NULL (ilimitado)
   - Si es otro plan → ejecutar check_multi_ph_lite_limits() o check_plan_limits()
5. Retornar JSON con estructura detallada

RESPUESTA ESPERADA:
{
  "plan": "MULTI_PH_LITE",
  "organizations": {
    "current": 8,
    "limit": 10,
    "percentage": 80,
    "exceeded": false
  },
  "units": {
    "current": 1200,
    "limit": 1500,
    "percentage": 80,
    "exceeded": false
  },
  "assemblies": {
    "current": 3,
    "limit": 5,
    "percentage": 60,
    "exceeded": false
  },
  "needs_upgrade": false,
  "show_banner": true  // true si cualquier percentage >= 90
}

ARCHIVO: src/app/api/subscription/[subscriptionId]/limits/route.ts
```

---

### **PROMPT 2.2 - Middleware para validar límites antes de crear recursos**

```
Crea un middleware `validateSubscriptionLimits` que se ejecuta ANTES de crear organizaciones o asambleas, bloqueando la acción si se exceden los límites.

CONTEXTO:
- Cuando un usuario intenta crear un nuevo edificio o asamblea, debemos validar primero que no exceda sus límites
- Si excede, debe retornar error con mensaje claro

TAREA:
1. Crea middleware: src/lib/middleware/validateSubscriptionLimits.ts
2. Parámetros: userId, subscriptionId, actionType ('create_organization' | 'create_assembly')
3. Lógica:
   - Si es Enterprise → permitir siempre
   - Si es otro plan → verificar límites con check_plan_limits()
   - Si excede → throw error 403 con mensaje: "Has alcanzado el límite de tu plan"

USO EN RUTAS:
await validateSubscriptionLimits(userId, subscriptionId, 'create_organization');
// Si pasa, continúa con la creación

ARCHIVO: src/lib/middleware/validateSubscriptionLimits.ts
```

---

### **PROMPT 2.3 - Actualizar endpoint de creación de organizaciones**

```
Modifica el endpoint POST /api/organizations para que valide los límites de suscripción ANTES de crear una nueva organización.

CONTEXTO:
- Actualmente el endpoint crea organizaciones sin validar límites
- Ahora debe verificar que el plan permita agregar más edificios

TAREA:
1. Archivo: src/app/api/organizations/route.ts
2. ANTES de insertar en la BD:
   - Obtener subscription_id del usuario
   - Llamar a validateSubscriptionLimits(userId, subscriptionId, 'create_organization')
   - Si lanza error → retornar 403 con mensaje
3. Si pasa validación → continuar con creación normal

FLUJO:
1. Usuario autenticado
2. ✅ Validar límites
3. Crear organización
4. Retornar respuesta

ARCHIVO: src/app/api/organizations/route.ts (MODIFICAR archivo existente)
```

---

### **PROMPT 2.4 - Actualizar endpoint de creación de asambleas**

```
Modifica el endpoint POST /api/assemblies para que valide los límites de asambleas/mes ANTES de crear una nueva asamblea.

CONTEXTO:
- Los planes tienen límite de asambleas por mes (ej: Standard = 2/mes, Multi-PH Lite = 5/mes)
- Debe bloquear si se excede el límite mensual

TAREA:
1. Archivo: src/app/api/assemblies/route.ts
2. ANTES de insertar en la BD:
   - Obtener subscription_id de la organización
   - Llamar a validateSubscriptionLimits(userId, subscriptionId, 'create_assembly')
   - Si lanza error → retornar 403 con mensaje
3. Si pasa validación → continuar con creación normal

MENSAJE DE ERROR AMIGABLE:
"Has alcanzado el límite de asambleas de tu plan este mes. Considera actualizar tu plan o espera al próximo mes."

ARCHIVO: src/app/api/assemblies/route.ts (MODIFICAR archivo existente)
```

---

## 🎨 PARTE 3: FRONTEND (UI/UX)

### **PROMPT 3.1 - Componente PricingSelector (PH vs Administradora)**

```
Crea el componente `PricingSelector` que permite al usuario elegir entre "Soy un PH" o "Soy una Administradora/Promotora" y muestra los planes correspondientes.

CONTEXTO:
- Marketing solicitó separar la experiencia de compra
- PHs individuales ven: Evento Único, Dúo Pack, Standard
- Administradoras ven: Multi-PH Lite, Multi-PH Pro, Enterprise

TAREA:
1. Componente: src/components/pricing/PricingSelector.tsx
2. Estado: userType ('ph' | 'admin')
3. UI: 2 botones grandes tipo toggle
4. Condicionalmente renderizar:
   - Si 'ph' → <PricingCardsPH />
   - Si 'admin' → <PricingCardsAdmin />

DISEÑO:
- Botones con iconos: 🏢 Soy un PH | 🏛️ Soy Administradora/Promotora
- Activo: bg-blue-600 text-white
- Inactivo: bg-gray-200
- Transición suave

ARCHIVO: src/components/pricing/PricingSelector.tsx
REFERENCIA: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 391-425
```

---

### **PROMPT 3.2 - Componente ROICalculator (Calculadora Inteligente)**

```
Crea el componente `ROICalculator` que sugiere automáticamente el plan ideal basándose en la regla "lo que ocurra primero".

CONTEXTO:
- Marketing quiere una calculadora que ayude a elegir el plan correcto
- Debe considerar: edificios, residentes totales, asambleas/mes
- Sugerencia basada en "lo que llegue primero" a un límite

TAREA:
1. Componente: src/components/pricing/ROICalculator.tsx
2. Inputs:
   - Edificios que administro (número)
   - Residentes totales (número)
   - Asambleas por mes (número)
3. Lógica de sugerencia:
   - Si cualquiera > límite Pro → Enterprise
   - Si cualquiera > límite Lite → Multi-PH Pro
   - Si cualquiera > límite Standard → Multi-PH Lite
   - Else → Standard
4. Mostrar explicación del por qué se sugiere ese plan

EJEMPLO EXPLICACIÓN:
"Recomendamos Multi-PH Pro porque administras 25 edificios (límite Lite: 10)"

ARCHIVO: src/components/pricing/ROICalculator.tsx
REFERENCIA: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 433-498
```

---

### **PROMPT 3.3 - Componente EnterprisePlanCard (Badge Gold/Premium)**

```
Crea el componente `EnterprisePlanCard` con diseño premium (badge dorado) que destaque el plan Enterprise con su CRM con IA.

CONTEXTO:
- Marketing solicitó que Enterprise se vea como el plan premium/insignia
- Debe tener diseño Gold con gradientes amarillos
- Destacar especialmente el "CRM con IA de Sentimiento"

TAREA:
1. Componente: src/components/pricing/EnterprisePlanCard.tsx
2. Diseño:
   - Borde dorado (border-4 border-yellow-400)
   - Badge flotante: "✨ PREMIUM"
   - Gradiente de fondo: from-yellow-50 to-white
   - Precio destacado: $2,499/mes en amarillo
3. Features destacadas:
   - ♾️ Asambleas ILIMITADAS
   - ♾️ Residentes ILIMITADOS
   - ♾️ Edificios ILIMITADOS
   - 🤖 CRM con IA de Sentimiento (separado con borde)
4. CTA: "Contactar Ventas" con gradiente amarillo

ARCHIVO: src/components/pricing/EnterprisePlanCard.tsx
REFERENCIA: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 506-551
```

---

### **PROMPT 3.4 - Hook useUpgradeBanner (Trigger al 90%)**

```
Crea el custom hook `useUpgradeBanner` que detecta cuando cualquier límite de la suscripción alcanza el 90% y activa el banner de upgrade.

CONTEXTO:
- Cuando un cliente está cerca de exceder sus límites (90%), debe ver un banner sugiriendo upgrade
- Debe revisar los límites periódicamente (cada 5 minutos)

TAREA:
1. Hook: src/hooks/useUpgradeBanner.ts
2. Parámetro: subscriptionId (string)
3. Lógica:
   - Fetch: GET /api/subscription/:id/limits cada 5 minutos
   - Verificar si algún percentage >= 90
   - Retornar: { showBanner: boolean, limits: object }
4. useEffect con interval de 300000ms (5 min)

RETORNO:
{
  showBanner: true,  // true si algún percentage >= 90
  limits: {
    organizations: { current: 9, limit: 10, percentage: 90, exceeded: false },
    units: { current: 1200, limit: 1500, percentage: 80, exceeded: false },
    assemblies: { current: 4, limit: 5, percentage: 80, exceeded: false }
  }
}

ARCHIVO: src/hooks/useUpgradeBanner.ts
```

---

### **PROMPT 3.5 - Componente UpgradeBanner (Banner de alerta)**

```
Crea el componente `UpgradeBanner` que muestra una alerta amarilla cuando el usuario alcanza el 90% de cualquier límite.

CONTEXTO:
- Se muestra en el dashboard cuando showBanner = true
- Debe ser visible pero no invasivo
- Mostrar qué límite está cerca de excederse

TAREA:
1. Componente: src/components/UpgradeBanner.tsx
2. Props: limits (objeto con datos de límites)
3. Diseño:
   - Fondo amarillo (bg-yellow-50)
   - Borde izquierdo amarillo (border-l-4 border-yellow-400)
   - Icono: ⚠️
   - Título: "Upgrade Sugerido"
4. Contenido:
   - Listar límites que están al 90%+
   - Ejemplo: "• Edificios: 9/10 (90%)"
5. CTA: Botón "Ver Planes Superiores"

ARCHIVO: src/components/UpgradeBanner.tsx
REFERENCIA: Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md líneas 359-389
```

---

### **PROMPT 3.6 - Actualizar página de Pricing**

```
Actualiza la página `/pricing` para incluir el nuevo plan Multi-PH Lite y todos los componentes nuevos (selector, calculadora, badge Enterprise).

CONTEXTO:
- La página actual tiene los planes antiguos (sin Multi-PH Lite)
- Debe integrarse con los nuevos componentes

TAREA:
1. Archivo: src/app/pricing/page.tsx (MODIFICAR existente)
2. Agregar:
   - <PricingSelector /> en la parte superior
   - <ROICalculator /> en sidebar o sección lateral
   - Tarjeta de Multi-PH Lite entre Standard y Pro
   - <EnterprisePlanCard /> al final con diseño premium
3. Actualizar datos de todos los planes:
   - Standard: $189/mes, 2 asambleas, 250 residentes, 1 PH
   - Multi-PH Lite: $399/mes, 5 asambleas, 1,500 residentes, 10 PHs
   - Multi-PH Pro: $699/mes, 15 asambleas, 5,000 residentes, 30 PHs
   - Enterprise: $2,499/mes, ILIMITADO

LAYOUT SUGERIDO:
[PricingSelector]
[Grid de planes según selección]
[ROICalculator en sidebar]

ARCHIVO: src/app/pricing/page.tsx (MODIFICAR)
```

---

### **PROMPT 3.7 - Integrar UpgradeBanner en Dashboard Admin**

```
Integra el componente `UpgradeBanner` en el dashboard principal del Admin de PH para que aparezca cuando alcance el 90% de cualquier límite.

CONTEXTO:
- El banner debe aparecer en la parte superior del dashboard
- Solo visible si showBanner = true
- Debe ser dismissible (cerrable) pero volver a aparecer en próxima sesión

TAREA:
1. Archivo: src/app/dashboard/admin-ph/page.tsx (MODIFICAR)
2. Importar: useUpgradeBanner hook
3. Obtener subscriptionId del usuario actual
4. Llamar: const { showBanner, limits } = useUpgradeBanner(subscriptionId)
5. Renderizar condicionalmente:
   {showBanner && <UpgradeBanner limits={limits} />}

POSICIÓN:
Debe aparecer justo después del header, antes del contenido principal del dashboard

ARCHIVO: src/app/dashboard/admin-ph/page.tsx (MODIFICAR)
```

---

## ✅ PARTE 4: TESTING Y VALIDACIÓN

### **PROMPT 4.1 - Tests de la función check_plan_limits**

```
Crea tests para la función SQL `check_plan_limits()` que valida la regla "lo que ocurra primero".

CONTEXTO:
- Esta función es crítica: bloquea la creación de recursos si se exceden límites
- Debe testearse exhaustivamente

CASOS DE PRUEBA:
1. Cliente con Multi-PH Lite:
   - 8 edificios (80%), 1200 residentes (80%), 3 asambleas (60%) → NO necesita upgrade
   - 11 edificios (110%) → SÍ necesita upgrade (excede edificios)
   - 1600 residentes (107%) → SÍ necesita upgrade (excede residentes)
   - 6 asambleas (120%) → SÍ necesita upgrade (excede asambleas)

2. Cliente Enterprise:
   - Cualquier cantidad → NO necesita upgrade (ilimitado)

ARCHIVO: tests/db/check_plan_limits.test.ts
```

---

### **PROMPT 4.2 - Tests del endpoint /api/subscription/limits**

```
Crea tests para el endpoint GET /api/subscription/:id/limits que retorna los límites actuales.

CASOS DE PRUEBA:
1. Cliente Standard con 150 residentes → percentage = 60%, showBanner = false
2. Cliente Standard con 230 residentes → percentage = 92%, showBanner = true
3. Cliente Multi-PH Lite con 9 edificios → percentage = 90%, showBanner = true
4. Cliente Enterprise → todos los límites en NULL (ilimitado)
5. Usuario sin autenticación → Error 401
6. Usuario intentando ver límites de otra org → Error 403

ARCHIVO: tests/api/subscription-limits.test.ts
```

---

### **PROMPT 4.3 - Tests de integración: Bloqueo al exceder límites**

```
Crea tests de integración end-to-end que validan que el sistema bloquea correctamente cuando se exceden límites.

ESCENARIOS:
1. Cliente Standard intenta crear 2do edificio → Bloqueado con error 403
2. Cliente Standard intenta crear 3ra asamblea del mes → Bloqueado con error 403
3. Cliente Multi-PH Lite intenta crear 11vo edificio → Bloqueado con error 403
4. Cliente Enterprise intenta crear 100 edificios → Permitido (ilimitado)

VALIDAR:
- Mensaje de error es claro
- No se inserta nada en la BD
- Frontend muestra mensaje amigable

ARCHIVO: tests/integration/subscription-limits.test.ts
```

---

### **PROMPT 4.4 - Tests del componente UpgradeBanner**

```
Crea tests para el componente React `UpgradeBanner` usando Jest + React Testing Library.

CASOS DE PRUEBA:
1. Se renderiza correctamente cuando se pasa limits
2. Muestra solo los límites que están al 90%+
3. No muestra límites que están por debajo del 90%
4. El botón "Ver Planes Superiores" redirige a /pricing
5. El banner se puede cerrar (dismiss)

ARCHIVO: tests/components/UpgradeBanner.test.tsx
```

---

### **PROMPT 4.5 - Test manual: Flujo completo de upgrade**

```
Realiza un test manual end-to-end del flujo completo de upgrade cuando se alcanza un límite.

PASOS:
1. Crea una cuenta con plan Multi-PH Lite
2. Crea 9 edificios (90% del límite)
3. Verifica que aparece el UpgradeBanner en el dashboard
4. Intenta crear el 11vo edificio → Debe bloquearse con error
5. Haz upgrade a Multi-PH Pro
6. Intenta crear el 11vo edificio → Debe permitirse
7. Verifica que el banner desaparece

RESULTADO ESPERADO:
✅ Banner aparece al 90%
✅ Sistema bloquea al 100%
✅ Mensaje de error es claro
✅ Upgrade desbloquea funcionalidad
✅ Banner desaparece después de upgrade

DOCUMENTAR: Captura de pantalla de cada paso
```

---

## 📊 CHECKLIST FINAL PARA EL CODER

```
BASE DE DATOS:
[ ] 1.1 - Agregar 'MULTI_PH_LITE' al enum
[ ] 1.2 - Agregar campo max_units_total_all_orgs
[ ] 1.3 - Agregar campo company_tax_id
[ ] 1.4 - Función check_multi_ph_lite_limits()
[ ] 1.5 - Función check_plan_limits()
[ ] 1.6 - Función is_unlimited_plan()

BACKEND API:
[ ] 2.1 - Endpoint GET /api/subscription/:id/limits
[ ] 2.2 - Middleware validateSubscriptionLimits
[ ] 2.3 - Actualizar POST /api/organizations
[ ] 2.4 - Actualizar POST /api/assemblies

FRONTEND:
[ ] 3.1 - Componente PricingSelector
[ ] 3.2 - Componente ROICalculator
[ ] 3.3 - Componente EnterprisePlanCard
[ ] 3.4 - Hook useUpgradeBanner
[ ] 3.5 - Componente UpgradeBanner
[ ] 3.6 - Actualizar página /pricing
[ ] 3.7 - Integrar UpgradeBanner en dashboard

TESTING:
[ ] 4.1 - Tests función check_plan_limits
[ ] 4.2 - Tests endpoint /api/subscription/limits
[ ] 4.3 - Tests integración bloqueo límites
[ ] 4.4 - Tests componente UpgradeBanner
[ ] 4.5 - Test manual flujo completo

TOTAL: 22 tareas
```

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO:

```
FASE A - BASE DE DATOS (Día 1 - Mañana):
├─ PROMPT 1.1 → 1.6
└─ Testing básico con queries SQL directas

FASE B - BACKEND (Día 1 - Tarde):
├─ PROMPT 2.1 → 2.4
└─ Testing con Postman/Thunder Client

FASE C - FRONTEND (Día 2 - Mañana):
├─ PROMPT 3.1 → 3.7
└─ Testing visual en navegador

FASE D - TESTING COMPLETO (Día 2 - Tarde):
├─ PROMPT 4.1 → 4.5
└─ Reporte final a QA
```

---

## 📚 REFERENCIAS:

```
DOCUMENTOS CLAVE:
├─ Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md (Validación técnica completa)
├─ Marketing/MARKETING_PRECIOS_COMPLETO.md (Especificaciones de Marketing v4.0)
├─ Arquitecto/LIMITES_UNIDADES_POR_PLAN.md (Sistema de límites original)
└─ Contralor/ESTATUS_AVANCE.md (Estado actual del proyecto)

CÓDIGO DE REFERENCIA:
└─ Todos los ejemplos SQL y TypeScript están en VALIDACION_FASE08_PRECIOS_V4.md
```

---

## ⚠️ IMPORTANTE PARA EL CODER:

```
1. NO implementes NADA sin leer primero Arquitecto/VALIDACION_FASE08_PRECIOS_V4.md
2. TODOS los ejemplos de código están en ese documento
3. Si algo no está claro, consulta al Arquitecto ANTES de implementar
4. Ejecuta los prompts EN ORDEN (no saltes pasos)
5. Testa cada componente antes de pasar al siguiente
6. Reporta al Contralor después de completar cada FASE (A, B, C, D)
```

---

**FIN DE LOS PROMPTS - FASE 08**

**Validado por:** Arquitecto  
**Fecha:** 30 Enero 2026  
**Listo para:** Implementación inmediata ✅
