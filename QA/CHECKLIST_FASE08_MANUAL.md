# Checklist FASE 08 - Validación manual

Para QA y Contralor. Ejecutar con app en marcha (`npm run dev`).

## Límites y banner

- [ ] `GET /api/subscription/demo-subscription/limits` → 200, JSON con `plan`, `organizations`, `units`, `assemblies`, `show_banner`
- [ ] `GET /api/subscription/enterprise-001/limits` → 200, `show_banner: false`
- [ ] Dashboard admin-ph con `assembly_subscription_id` = demo → banner "Upgrade sugerido" visible
- [ ] Cerrar banner → no reaparece en la misma sesión (sessionStorage)

## Precios y UI

- [ ] `/pricing` → selector "Soy un PH" / "Soy Administradora", planes correctos por perfil
- [ ] Calculadora inteligente: cambiar edificios/residentes/asambleas → plan recomendado coherente
- [ ] Tarjeta Enterprise con estilo premium (badge, precio $2,499)

## Créditos acumulables

- [ ] `GET /api/assembly-credits/{organizationId}` → 200 (o 500 si no existe tabla); si 200, estructura `total_available`, `expiring_soon`, `all_credits`
- [ ] Dashboard admin-ph con `assembly_organization_id` → bloque "Créditos de asambleas" (o "Cargando créditos..." si API falla)

## Creación con validación

- [ ] `POST /api/assemblies` sin `organization_id` → 400
- [ ] `POST /api/organizations` sin `subscription_id` → 400
- [ ] Con BD desplegada: exceder límites → 403 con mensaje claro

## Cron (opcional en local)

- [ ] Documento `Contralor/CRON_FASE08.md` existe con líneas crontab
