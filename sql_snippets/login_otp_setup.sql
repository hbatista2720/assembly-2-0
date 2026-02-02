-- ====================================================================
-- ASSEMBLY 2.0 - SETUP USUARIOS PARA LOGIN OTP
-- ====================================================================
-- Fecha: 30 Enero 2026
-- Propósito: Crear usuarios de prueba SIN passwords (solo OTP)
-- Ejecutar en: Supabase SQL Editor
-- ====================================================================

-- IMPORTANTE: Este script usa ON CONFLICT DO NOTHING para ser idempotente
-- Puedes ejecutarlo múltiples veces sin problemas

-- ====================================================================
-- 1) HENRY BATISTA (Admin Plataforma / Owner)
-- ====================================================================

-- Crear usuario en auth.users (sin password)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'henry.batista27@gmail.com',
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Crear perfil en public.users
INSERT INTO public.users (
  id,
  organization_id,
  email,
  role,
  is_platform_owner,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'henry.batista27@gmail.com',
  'ADMIN_PLATAFORMA',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 2) USUARIO DEMO (Admin PH - Organización de Prueba)
-- ====================================================================

-- Crear organización DEMO
INSERT INTO public.organizations (
  id,
  name,
  is_demo,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo - P.H. Urban Tower',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Crear usuario DEMO en auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111113',
  '00000000-0000-0000-0000-000000000000',
  'demo@assembly2.com',
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Crear perfil DEMO en public.users
INSERT INTO public.users (
  id,
  organization_id,
  email,
  role,
  is_platform_owner,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111113',
  '11111111-1111-1111-1111-111111111111',
  'demo@assembly2.com',
  'ADMIN_PH',
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 3) ADMIN ACTIVO (Admin PH - Organización Real)
-- ====================================================================

-- Crear organización ACTIVA
INSERT INTO public.organizations (
  id,
  name,
  is_demo,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'P.H. Torres del Pacífico',
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Crear usuario ACTIVO en auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222224',
  '00000000-0000-0000-0000-000000000000',
  'admin@torresdelpacifico.com',
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Crear perfil ACTIVO en public.users
INSERT INTO public.users (
  id,
  organization_id,
  email,
  role,
  is_platform_owner,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222224',
  '22222222-2222-2222-2222-222222222222',
  'admin@torresdelpacifico.com',
  'ADMIN_PH',
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- VERIFICACIÓN: Ejecuta esto después para confirmar
-- ====================================================================

-- Ver usuarios creados en auth
-- SELECT id, email, email_confirmed_at FROM auth.users 
-- WHERE email IN ('henry.batista27@gmail.com', 'demo@assembly2.com', 'admin@torresdelpacifico.com')
-- ORDER BY email;

-- Ver perfiles creados en public
-- SELECT id, email, role, is_platform_owner, organization_id 
-- FROM public.users 
-- WHERE email IN ('henry.batista27@gmail.com', 'demo@assembly2.com', 'admin@torresdelpacifico.com')
-- ORDER BY email;

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
-- 1. Estos usuarios NO tienen password, solo pueden entrar con OTP
-- 2. El OTP se envía automáticamente por Supabase cuando usan signInWithOtp()
-- 3. En desarrollo, el OTP aparece en: Supabase Dashboard → Logs → Auth
-- 4. En producción, necesitas configurar SMTP en Supabase para enviar emails
-- 5. Si necesitas agregar más usuarios, sigue el mismo patrón:
--    a) INSERT en auth.users (sin password)
--    b) INSERT en public.users (con rol y organización)
-- ====================================================================
