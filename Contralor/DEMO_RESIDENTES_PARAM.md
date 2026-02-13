# Parametrización: 50 residentes demo (Urban Tower PH)

**Para DB/Backend:** Habilitar y parametrizar el límite de residentes para la versión demo.

## Criterios

- **Versión demo:** usuario `demo@assembly2.com` y/o organización demo (`11111111-1111-1111-1111-111111111111` o `demo-organization`).
- **Límite:** **50 espacios** de residentes para la demo, ligados a **Urban Tower PH**.
- **Correos de ejemplo:** `residente.Urban1@demo.assembly2.com`, `residente.Urban2@demo.assembly2.com`, etc. (dominio `@demo.assembly2.com`).

## Implementación actual (frontend)

- En el frontend, cuando el contexto es demo, se usa el store local (`assembly_demo_residents` en localStorage) con límite **50**.
- Agregar y eliminar residentes funciona en esa lista local sin tocar la DB.
- Constantes en código: `DEMO_RESIDENTS_LIMIT = 50`, `DEMO_PH_NAME = "Urban Tower PH"` (`src/lib/demoResidentsStore.ts`).

## Para parametrizar en DB

- Definir en configuración o tabla de parámetros el valor **50** para organizaciones demo (por ejemplo por `organization_id` o flag `is_demo`).
- Al listar/crear residentes para una organización demo, aplicar ese límite (máx. 50) y rechazar creación si se supera.
- Opcional: tabla o vista que asocie “Urban Tower PH” a la org demo para reportes y etiquetado.
