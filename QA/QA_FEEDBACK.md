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
