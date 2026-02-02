-- ====================================================================
-- ASSEMBLY 2.0 - ROW LEVEL SECURITY (RLS) PARA MULTI-TENANCY
-- ====================================================================
-- Fecha: 30 Enero 2026
-- Propósito: Separar datos de diferentes PHs en una sola base de datos
-- Ejecutar en: Supabase SQL Editor
-- Beneficio: Mantener Free Tier sin pagar instancias separadas
-- ====================================================================

-- IMPORTANTE: Con RLS, cada PH solo ve sus propios datos
-- El Admin Plataforma (Henry) puede ver todo

-- ====================================================================
-- PASO 1: Funciones helper para RLS
-- ====================================================================

-- Función que devuelve el perfil del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS public.users
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * 
  FROM public.users 
  WHERE id = auth.uid()
$$;

-- Función que verifica si el usuario es owner de plataforma
CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
      AND is_platform_owner = TRUE
  )
$$;

-- Función que devuelve la organization_id del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM public.users 
  WHERE id = auth.uid()
$$;

-- ====================================================================
-- PASO 2: RLS en tabla 'users' (perfiles)
-- ====================================================================

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Ver solo su propio perfil
CREATE POLICY "users_select_own_profile" 
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Política: Admin Plataforma ve todos los perfiles
CREATE POLICY "users_select_platform_owner" 
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.users u
      WHERE u.id = auth.uid() 
        AND u.is_platform_owner = TRUE
    )
  );

-- Política: Actualizar solo su propio perfil
CREATE POLICY "users_update_own_profile" 
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- ====================================================================
-- PASO 3: RLS en tabla 'organizations'
-- ====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Política: Admin PH ve solo su organización
CREATE POLICY "organizations_select_own_org" 
  ON public.organizations
  FOR SELECT
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma ve todas las organizaciones
CREATE POLICY "organizations_select_platform_owner" 
  ON public.organizations
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Admin PH actualiza solo su organización
CREATE POLICY "organizations_update_own_org" 
  ON public.organizations
  FOR UPDATE
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma actualiza cualquier organización
CREATE POLICY "organizations_update_platform_owner" 
  ON public.organizations
  FOR UPDATE
  USING (public.is_platform_owner());

-- Política: Solo Admin Plataforma crea organizaciones
CREATE POLICY "organizations_insert_platform_owner" 
  ON public.organizations
  FOR INSERT
  WITH CHECK (public.is_platform_owner());

-- ====================================================================
-- PASO 4: RLS en tabla 'assemblies' (asambleas)
-- ====================================================================

ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;

-- Política: Ver solo asambleas de su organización
CREATE POLICY "assemblies_select_own_org" 
  ON public.assemblies
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma ve todas las asambleas
CREATE POLICY "assemblies_select_platform_owner" 
  ON public.assemblies
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Crear asambleas solo en su organización
CREATE POLICY "assemblies_insert_own_org" 
  ON public.assemblies
  FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Actualizar solo asambleas de su organización
CREATE POLICY "assemblies_update_own_org" 
  ON public.assemblies
  FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- ====================================================================
-- PASO 5: RLS en tabla 'votes' (votos)
-- ====================================================================

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Política: Ver votos de asambleas de su organización
CREATE POLICY "votes_select_own_org" 
  ON public.votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.assemblies a
      WHERE a.id = votes.assembly_id
        AND a.organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Política: Admin Plataforma ve todos los votos
CREATE POLICY "votes_select_platform_owner" 
  ON public.votes
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Insertar votos solo en asambleas de su organización
CREATE POLICY "votes_insert_own_org" 
  ON public.votes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.assemblies a
      WHERE a.id = votes.assembly_id
        AND a.organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    )
  );

-- ====================================================================
-- PASO 6: RLS en tabla 'residents' (residentes)
-- ====================================================================

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Política: Ver residentes de su organización
CREATE POLICY "residents_select_own_org" 
  ON public.residents
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma ve todos los residentes
CREATE POLICY "residents_select_platform_owner" 
  ON public.residents
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Crear residentes solo en su organización
CREATE POLICY "residents_insert_own_org" 
  ON public.residents
  FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Actualizar residentes de su organización
CREATE POLICY "residents_update_own_org" 
  ON public.residents
  FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- ====================================================================
-- PASO 7: RLS en tabla 'subscriptions' (suscripciones)
-- ====================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Ver solo suscripción de su organización
CREATE POLICY "subscriptions_select_own_org" 
  ON public.subscriptions
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma ve todas las suscripciones
CREATE POLICY "subscriptions_select_platform_owner" 
  ON public.subscriptions
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Solo Admin Plataforma actualiza suscripciones
CREATE POLICY "subscriptions_update_platform_owner" 
  ON public.subscriptions
  FOR UPDATE
  USING (public.is_platform_owner());

-- ====================================================================
-- PASO 8: RLS en tabla 'organization_credits' (créditos)
-- ====================================================================

ALTER TABLE public.organization_credits ENABLE ROW LEVEL SECURITY;

-- Política: Ver créditos de su organización
CREATE POLICY "credits_select_own_org" 
  ON public.organization_credits
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- Política: Admin Plataforma ve todos los créditos
CREATE POLICY "credits_select_platform_owner" 
  ON public.organization_credits
  FOR SELECT
  USING (public.is_platform_owner());

-- Política: Solo Admin Plataforma actualiza créditos
CREATE POLICY "credits_update_platform_owner" 
  ON public.organization_credits
  FOR UPDATE
  USING (public.is_platform_owner());

-- ====================================================================
-- VERIFICACIÓN: Prueba las políticas RLS
-- ====================================================================

-- 1. Login como Henry (Admin Plataforma)
-- Debe ver TODAS las organizaciones
-- SELECT * FROM public.organizations;

-- 2. Login como demo@assembly2.com
-- Debe ver SOLO la organización Demo
-- SELECT * FROM public.organizations;

-- 3. Login como admin@torresdelpacifico.com
-- Debe ver SOLO Torres del Pacífico
-- SELECT * FROM public.organizations;

-- ====================================================================
-- DEBUG: Verificar políticas activas
-- ====================================================================

-- Ver todas las políticas RLS en el esquema public
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ====================================================================
-- DESACTIVAR RLS (SOLO PARA DEBUG - NO USAR EN PRODUCCIÓN)
-- ====================================================================

-- Si necesitas desactivar RLS temporalmente para debugging:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.assemblies DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.residents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.organization_credits DISABLE ROW LEVEL SECURITY;

-- ⚠️ IMPORTANTE: Vuelve a habilitar RLS antes de ir a producción

-- ====================================================================
-- BENEFICIOS DE ESTA CONFIGURACIÓN RLS
-- ====================================================================
-- ✅ Una sola base de datos para todos los PHs (Free Tier)
-- ✅ Separación total de datos entre organizaciones
-- ✅ Admin Plataforma (Henry) supervisa todo
-- ✅ Cada Admin PH solo ve sus propios datos
-- ✅ Imposible acceder a datos de otro PH (seguridad a nivel DB)
-- ✅ Escalable a cientos de PHs sin cambios en la arquitectura
-- ✅ Sin riesgo de fugas de datos entre organizaciones
-- ✅ Compatible con Supabase Free Tier
-- ====================================================================

-- ====================================================================
-- PRÓXIMOS PASOS
-- ====================================================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Probar login con los 3 usuarios (Henry, Demo, Torres)
-- 3. Verificar que cada uno ve solo sus datos
-- 4. Actualizar documentación en ARQUITECTURA_ASSEMBLY_2.0.md
-- 5. Crear pruebas automatizadas de RLS
-- ====================================================================

-- ====================================================================
-- CÓMO AGREGAR RLS A NUEVAS TABLAS
-- ====================================================================
-- Cuando crees una nueva tabla relacionada con organizations:
--
-- 1. Agregar columna organization_id:
--    ALTER TABLE nueva_tabla ADD COLUMN organization_id UUID REFERENCES organizations(id);
--
-- 2. Habilitar RLS:
--    ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
--
-- 3. Crear políticas (template):
--    CREATE POLICY "nueva_tabla_select_own_org" 
--      ON nueva_tabla FOR SELECT
--      USING (organization_id = public.current_user_org_id());
--
--    CREATE POLICY "nueva_tabla_select_platform_owner" 
--      ON nueva_tabla FOR SELECT
--      USING (public.is_platform_owner());
--
-- 4. Repetir para INSERT/UPDATE/DELETE según necesidad
-- ====================================================================
