# Parametrización: 50 residentes demo (Urban Tower PH)

**Para DB/Backend:** Habilitar y parametrizar el límite de residentes para la versión demo.

## Criterios

- **Admin del PH demo (Urban Tower):** solo el correo **`demo@assembly2.com`** se considera administrador del demo. El contexto "demo" en el dashboard y en Propietarios/Residentes se determina únicamente por ese correo (`isDemoResidentsContext()`), para evitar confusión si hay otros usuarios con la misma organización en BD.
- **Organización demo:** `11111111-1111-1111-1111-111111111111` (Urban Tower). En BD puede haber varios usuarios con esa organización: **un solo ADMIN_PH** (`demo@assembly2.com`) y el resto **RESIDENTE**. Los no administradores (residentes) con el mismo PH no ven el panel Admin PH; al iniciar sesión van al chatbot de residentes.
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
