 # QA Feedback · Estado de fase

 **Fecha:** 30 Enero 2026  
 **Autor:** Agente QA · Calidad Full Stack

 ## Veredicto
 - Fase inicial (landing + autenticación legal) estructurada pero no terminada.
 - Arquitectura y base legal (schema, triggers, RLS, roadmap) están alineadas con Ley 284.
 - El filtro de precios y anti-abuso requiere ajustes en el copy (usar `MARKETING_PRECIOS_COMPLETO.md`) y ortografía antes de considerar la landing lista.
 - Login está bloqueado por la ausencia de perfiles en `public.users`; actualmente hay parche temporal pero hay que completar la Tarea 1 (auto creación) y ejecutar el trigger propuesto.

## Recomendaciones QA
 1. **Landing / Marketing:** Corregir todas las tildes y anclas en `src/app/page.tsx`, consumir los datos desde `MARKETING_PRECIOS_COMPLETO.md` único, y mostrar pricing/beneficios de forma consistente.
 2. **Login / Database:** Priorizar Tarea 1 del documento `Database/INSTRUCCIONES_PARA_CODER.md` (maybeSingle + upsert) y aplicar el trigger `sql_snippets/auth_profile_sync_trigger.sql` para sincronizar `auth.users` y `public.users`.
 3. **Seeds & Datos:** Crear script de seed para los 311 propietarios (218 al día / 93 morosos) y estados de asamblea para reproducir la simulación del caso Quintas del Lago.
 4. **Antia-buso:** Implementar los campos/triggers propuestos (compromisos, créditos, bloqueos) y mostrar las reglas en la landing para que el cliente visualice el valor por plan.
 5. **Docker y Manifest:** Añadir `package.json`+`Dockerfile`/`docker-compose` y `.env.example` para poder iniciar localmente; sin esto no se puede ejecutar QA completo ni pruebas de carga.

 ## Próximo checkpoint
 - Confirmar que el login ya no muestra “Database error finding user” con Henry/demo.
 - Validar que la landing carga los precios desde el archivo maestro y que el slider/calculadora muestran ahorros coherentes.
 - Una vez completado, pasar a implementar el dashboard del administrador (Fase siguiente).
- Revisar las 8 secciones del dashboard `admin-ph` usando http://localhost:3000/dashboard/admin-ph y los permisos descritos (localStorage/local cookie).

---

# QA Feedback · Fase 4 (Dashboard Admin PH)

**Fecha:** 26 Enero 2026  
**Estado:** ⏳ En revisión QA  

## Acceso para QA
1. Levantar entorno Docker/VPS local:
   - `docker compose up -d`
   - URL: `http://localhost:3000`
2. Ir a: `http://localhost:3000/dashboard/admin-ph`
3. Activar permisos de equipo (consola):
```
localStorage.setItem("assembly_admin_ph_role", "ADMIN_PRINCIPAL")
localStorage.setItem("assembly_admin_ph_permissions", JSON.stringify({ manage_team: true }))
localStorage.setItem("assembly_role", "admin-ph")
localStorage.setItem("assembly_email", "qa@assembly2.com")
```

## Secciones a validar (8)
- `/dashboard/admin-ph`
- `/dashboard/admin-ph/owners`
- `/dashboard/admin-ph/assemblies`
- `/dashboard/admin-ph/votations`
- `/dashboard/admin-ph/acts`
- `/dashboard/admin-ph/reports`
- `/dashboard/admin-ph/team`
- `/dashboard/admin-ph/settings`
- `/dashboard/admin-ph/support`

## Checklist QA (UI/UX + Permisos)
- Sidebar y header consistentes con la arquitectura Admin PH.
- Sección **Equipo** visible solo con `manage_team = true`.
- Navegación entre secciones sin errores.
- Coherencia visual con estilos neon/iOS definidos.
- Cards/KPIs/alertas acordes a la arquitectura.

## Veredicto
- Pendiente de QA.

---

# QA Feedback · Fase 06 (Actas y Reportes)

**Fecha:** 02 Febrero 2026  
**Estado:** ⏳ En revisión QA  

## Acceso para QA
- Actas: `http://localhost:3000/dashboard/admin-ph/acts`
- Reportes: `http://localhost:3000/dashboard/admin-ph/reports`

## Checklist QA (Fase 06)
- Generar acta desde una asamblea (selector + botón “Generar acta nueva”).
- Ver firma digital (hash) en vista previa.
- Exportar CSV y Excel desde actas.
- Exportar PDF (ventana de impresión) con firma digital visible.
- Reporte de votación actualizado con totales.

## Veredicto
- Pendiente de QA.

---

# QA Feedback · Fase 05 (Votación + Vista Monitor)

**Fecha:** 02 Febrero 2026  
**Estado:** ⏳ En revisión QA  

## Acceso para QA
- Monitor: `http://localhost:3000/dashboard/admin-ph/monitor/demo`
- Presentación: `http://localhost:3000/presenter/demo-token`
- En asamblea en vivo: botón **Abrir vista de presentación**

## APIs disponibles (backend)
- `GET /api/monitor/summary?assemblyId=demo`
- `GET /api/monitor/units?assemblyId=demo`
- `POST /api/presenter/token`
- `GET /api/presenter/view?token=demo-token`

## Checklist QA
- Monitor actualiza KPIs y grilla sin recargar (polling cada 4-8s)
- Vista Presentación carga sin login y actualiza datos
- Botón “Abrir vista de presentación” genera URL válida
- UI/UX consistente con arquitectura (colores/leyendas)

## Artefactos de votación (entregados)
- Listado de asambleas: `http://localhost:3000/dashboard/admin-ph/assemblies`
- Detalle + temas: `/dashboard/admin-ph/assemblies/[id]`
- Flujo de voto admin: `/dashboard/admin-ph/assemblies/[id]/vote`
- Flujo residente: `/assembly/[id]/vote`
- Persistencia temporal vía `localStorage` (QA puede crear asambleas/temas y votar).

## Pasos sugeridos QA (votación básica)
1) Crear asamblea nueva (botón “Crear asamblea”).
2) Entrar al detalle y agregar 1-2 temas.
3) Iniciar votación y emitir votos (sí/no/abstención).
4) Verificar que el contador se actualiza y que el Monitor refleja cambios.

## Veredicto
- ✅ **FASE 5 APROBADA** (30 Enero 2026)
- Monitor y Votación funcionan correctamente
- UI/UX consistente con arquitectura
- Coder puede avanzar a FASE 6 (Actas y Reportes)

---

# QA Feedback · Fase 06 (Actas y Reportes)

**Fecha:** 30 Enero 2026  
**Estado:** ⏳ En revisión QA  

## Acceso para QA
- Actas: `http://localhost:3000/dashboard/admin-ph/acts`
- Reportes: `http://localhost:3000/dashboard/admin-ph/reports`

## Funcionalidades a validar

### 1. ACTAS
- Lista de actas generadas
- Generación automática al cerrar asamblea
- PDF incluye: fecha, asistentes, temas, resultados, firmas
- Descarga de PDF funciona

### 2. REPORTES
- Estadísticas de participación
- Reportes de votación por tema
- Filtros (fecha, asamblea, tema)
- Exportar a Excel/CSV

### 3. HISTORIAL
- Lista de asambleas pasadas
- Filtros funcionan
- Datos coherentes con votaciones

## Checklist QA
- [x] Actas se generan correctamente
- [x] PDF descargable con formato correcto
- [x] Reportes muestran datos correctos
- [x] Filtros funcionan
- [x] Exportar Excel/CSV funciona
- [x] UI/UX consistente

## Veredicto
- ✅ **FASE 6 APROBADA** (30 Enero 2026)
- Actas y reportes funcionan correctamente
- PDF y exportaciones operativas
- Coder puede avanzar a FASE 7
