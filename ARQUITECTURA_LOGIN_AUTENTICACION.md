# 🔐 ARQUITECTURA LOGIN Y AUTENTICACIÓN
## Assembly 2.0 - Sistema de Roles y Acceso

**Versión:** 1.0  
**Fecha:** 29 Enero 2026  
**Autor:** Arquitecto Assembly 2.0  
**Audiencia:** Henry, Coder, QA

---

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [3 Roles Principales](#3-roles-principales)
3. [Actualización del Schema](#actualización-del-schema)
4. [Flujo de Login TEST](#flujo-de-login-test)
5. [Flujo de Login PRODUCCIÓN](#flujo-de-login-producción)
6. [Dashboards por Rol](#dashboards-por-rol)
7. [Instrucciones para el Coder](#instrucciones-para-el-coder)

---

## 🎯 VISIÓN GENERAL

### **Objetivo:**
Definir un sistema de autenticación robusto con 3 perfiles de usuario claramente diferenciados, con acceso controlado según rol y estado de suscripción.

### **Tecnología:**
- **Auth Provider:** Supabase Auth
- **Método:** Email + OTP (PIN 6 dígitos) → WebAuthn (Face ID/Touch ID)
- **RLS:** Row Level Security en PostgreSQL
- **Frontend:** Next.js con `@supabase/auth-helpers-nextjs`

---

## 👥 3 ROLES PRINCIPALES

### **1. 🧪 DEMO (Admin PH - Modo Prueba)**

**Perfil:**
- Administrador de PH probando la plataforma
- Plan: `DEMO`
- Acceso: 30 días gratis
- Limitaciones: Dashboard con funcionalidades limitadas

**Características:**
```typescript
{
  role: 'ADMIN_PH',
  plan: 'DEMO',
  subscription_status: 'TRIAL',
  trial_ends_at: NOW() + 30 días,
  organization: {
    name: 'Demo - [Nombre PH]',
    type: 'PH_INDEPENDIENTE',
    is_demo: true
  }
}
```

**Acceso:**
- ✅ Dashboard Admin PH (modo restringido)
- ✅ Chatbot Lex (soporte limitado)
- ✅ 1 asamblea de prueba (máx 50 unidades)
- ❌ Exportar actas certificadas
- ❌ CRM avanzado
- ❌ Análisis de sentimiento

**Dashboard:** `app/dashboard/admin-ph` (vista DEMO)

---

### **2. 👑 ADMIN PLATAFORMA (Henry Batista)**

**Perfil:**
- Dueño de la plataforma Assembly 2.0
- Email: `henry.batista27@gmail.com`
- Acceso: TOTAL (Dios Mode)

**Características:**
```typescript
{
  id: '00000000-0000-0000-0000-000000000001', // UUID fijo
  role: 'ADMIN_PLATAFORMA',
  email: 'henry.batista27@gmail.com',
  first_name: 'Henry',
  last_name: 'Batista',
  organization_id: null, // No pertenece a una org específica
  is_platform_owner: true
}
```

**Acceso:**
- ✅ Dashboard Admin Inteligente (monitor de toda la plataforma)
- ✅ Gestión de Leads/Funnel
- ✅ Tickets escalados
- ✅ Configuración de precios
- ✅ Gestión de suscripciones
- ✅ Campañas CRM
- ✅ Configurar chatbot
- ✅ Analytics globales
- ✅ Acceso a todas las organizaciones (read-only audit)

**Dashboard:** `app/dashboard/platform-admin`

---

### **3. 💼 ADMIN PH CON SUSCRIPCIÓN ACTIVA**

**Perfil:**
- Cliente que ya pagó un plan (EVENTO_UNICO, DUO_PACK, STANDARD, MULTI_PH, ENTERPRISE)
- Acceso completo según plan contratado

**Características:**
```typescript
{
  role: 'ADMIN_PH',
  plan: 'STANDARD' | 'MULTI_PH' | 'ENTERPRISE',
  subscription_status: 'ACTIVE',
  subscription_id: UUID,
  organization: {
    name: 'P.H. Urban Tower',
    type: 'PH_INDEPENDIENTE',
    is_demo: false,
    plan_limits: {
      assemblies_per_month: 2, // según plan
      max_properties: 100,
      max_units: 1000
    }
  }
}
```

**Acceso (según plan):**
- ✅ Dashboard Admin PH (completo)
- ✅ Chatbot Lex (soporte completo)
- ✅ Crear/gestionar asambleas
- ✅ Exportar actas certificadas
- ✅ CRM básico/avanzado (según plan)
- ✅ Validación Face ID
- ✅ Voto manual
- ✅ Gráficas en tiempo real
- ✅ Pre-registro de residentes

**Dashboard:** `app/dashboard/admin-ph` (vista FULL)

---

## 🗄️ ACTUALIZACIÓN DEL SCHEMA

### **1. Nuevo Enum para Roles**

```sql
-- Actualizar enum existente
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM (
  'PROPIETARIO',
  'RESIDENTE',
  'ADMIN_PH',
  'ADMIN_PROMOTORA',
  'JUNTA_DIRECTIVA',
  'ADMIN_PLATAFORMA'  -- 🆕 NUEVO ROL
);
```

### **2. Enum para Plan Tier**

```sql
CREATE TYPE plan_tier AS ENUM (
  'DEMO',           -- 🆕 30 días gratis
  'EVENTO_UNICO',   -- $225
  'DUO_PACK',       -- $389
  'STANDARD',       -- $189/mes
  'MULTI_PH',       -- $699/mes
  'ENTERPRISE'      -- $2,499/mes
);
```

### **3. Enum para Estado de Suscripción**

```sql
CREATE TYPE subscription_status AS ENUM (
  'TRIAL',          -- Prueba gratuita (DEMO)
  'ACTIVE',         -- Pagado y activo
  'PAST_DUE',       -- Pago vencido
  'CANCELLED',      -- Cancelado
  'EXPIRED'         -- Expirado
);
```

### **4. Tabla de Suscripciones**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan plan_tier NOT NULL DEFAULT 'DEMO',
  status subscription_status NOT NULL DEFAULT 'TRIAL',
  
  -- Precios y facturación
  price_paid NUMERIC(10,2),
  billing_cycle VARCHAR(20), -- 'one-time', 'monthly', 'annual'
  
  -- Fechas importantes
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Anti-abuso
  commitment_months INT DEFAULT 0,
  commitment_ends_at TIMESTAMPTZ,
  early_cancellation_penalty NUMERIC(10,2),
  
  -- Stripe (cuando se integre)
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
```

### **5. Actualizar Tabla Organizations**

```sql
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_plan plan_tier DEFAULT 'DEMO',
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

CREATE INDEX idx_orgs_plan ON organizations(current_plan);
CREATE INDEX idx_orgs_demo ON organizations(is_demo);
```

### **6. Actualizar Tabla Users**

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_platform_owner BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;

-- Constraint: solo 1 platform owner
CREATE UNIQUE INDEX idx_users_platform_owner 
  ON users(is_platform_owner) 
  WHERE is_platform_owner = TRUE;
```

### **7. Tabla de Créditos (ya definida en v3.0)**

```sql
CREATE TABLE IF NOT EXISTS organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  credits_available INT DEFAULT 0,
  credits_used_this_month INT DEFAULT 0,
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_org ON organization_credits(organization_id);
```

---

## 🧪 FLUJO DE LOGIN - FASE TEST

### **Objetivo:**
Testing local con usuarios hardcodeados en Supabase.

### **Setup Inicial (Coder ejecuta 1 vez):**

#### **1. Crear Usuario Henry (Admin Plataforma)**

```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'henry.batista27@gmail.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Crear perfil en tabla users
INSERT INTO users (
  id,
  organization_id,
  email,
  email_verified,
  first_name,
  last_name,
  role,
  is_platform_owner
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'henry.batista27@gmail.com',
  TRUE,
  'Henry',
  'Batista',
  'ADMIN_PLATAFORMA',
  TRUE
);
```

**Credenciales TEST:**
```
Email: henry.batista27@gmail.com
Password: TestPassword123!
Rol: ADMIN_PLATAFORMA
```

---

#### **2. Crear Usuario DEMO (Admin PH Prueba)**

```sql
-- Crear organización DEMO
INSERT INTO organizations (
  id,
  name,
  type,
  legal_context_id,
  is_demo,
  current_plan
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo - P.H. Urban Tower',
  'PH_INDEPENDIENTE',
  (SELECT id FROM legal_contexts WHERE country_code = 'PA'),
  TRUE,
  'DEMO'
);

-- Crear suscripción DEMO (30 días)
INSERT INTO subscriptions (
  id,
  organization_id,
  plan,
  status,
  trial_ends_at
) VALUES (
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111111',
  'DEMO',
  'TRIAL',
  NOW() + INTERVAL '30 days'
);

-- Crear usuario DEMO en auth
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111113',
  'demo@assembly2.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Crear perfil demo
INSERT INTO users (
  id,
  organization_id,
  email,
  email_verified,
  first_name,
  last_name,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111113',
  '11111111-1111-1111-1111-111111111111',
  'demo@assembly2.com',
  TRUE,
  'Admin',
  'Demo',
  'ADMIN_PH'
);
```

**Credenciales TEST:**
```
Email: demo@assembly2.com
Password: Demo123!
Rol: ADMIN_PH (DEMO)
```

---

#### **3. Crear Usuario ACTIVO (Admin PH con Plan Standard)**

```sql
-- Crear organización ACTIVA
INSERT INTO organizations (
  id,
  name,
  type,
  legal_context_id,
  is_demo,
  current_plan
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'P.H. Torres del Pacífico',
  'PH_INDEPENDIENTE',
  (SELECT id FROM legal_contexts WHERE country_code = 'PA'),
  FALSE,
  'STANDARD'
);

-- Crear suscripción ACTIVA
INSERT INTO subscriptions (
  id,
  organization_id,
  plan,
  status,
  price_paid,
  billing_cycle,
  current_period_end
) VALUES (
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222222',
  'STANDARD',
  'ACTIVE',
  189.00,
  'monthly',
  NOW() + INTERVAL '30 days'
);

-- Crear créditos para plan Standard (2 asambleas/mes)
INSERT INTO organization_credits (
  organization_id,
  credits_available,
  credits_used_this_month
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  2,
  0
);

-- Crear usuario ACTIVO en auth
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222224',
  'admin@torresdelpacifico.com',
  crypt('Active123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Crear perfil activo
INSERT INTO users (
  id,
  organization_id,
  email,
  email_verified,
  first_name,
  last_name,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222224',
  '22222222-2222-2222-2222-222222222222',
  'admin@torresdelpacifico.com',
  TRUE,
  'Carlos',
  'Martínez',
  'ADMIN_PH'
);
```

**Credenciales TEST:**
```
Email: admin@torresdelpacifico.com
Password: Active123!
Rol: ADMIN_PH (STANDARD - ACTIVO)
```

---

### **Resumen Usuarios TEST:**

| Email | Password | Rol | Plan | Dashboard |
|-------|----------|-----|------|-----------|
| `henry.batista27@gmail.com` | `TestPassword123!` | ADMIN_PLATAFORMA | N/A | `/dashboard/platform-admin` |
| `demo@assembly2.com` | `Demo123!` | ADMIN_PH | DEMO | `/dashboard/admin-ph?mode=demo` |
| `admin@torresdelpacifico.com` | `Active123!` | ADMIN_PH | STANDARD | `/dashboard/admin-ph` |

---

## 🤖 REGISTRO DEMO VIA CHATBOT

### **Objetivo:**
El chatbot Lex puede registrar usuarios DEMO directamente desde la conversación, validando si ya existen en la base de datos.

### **Información que Recopila el Chatbot:**

```typescript
interface DemoRegistrationData {
  email: string;              // OBLIGATORIO - validar formato
  firstName: string;          // OBLIGATORIO
  lastName: string;           // OBLIGATORIO
  phone?: string;             // OPCIONAL
  propertyName: string;       // OBLIGATORIO - nombre del PH
  propertyUnits: number;      // OBLIGATORIO - cantidad de unidades
  propertyType: 'PH_INDEPENDIENTE' | 'PROMOTORA'; // OBLIGATORIO
  source: 'chatbot_telegram' | 'chatbot_web' | 'landing'; // Origen
}
```

### **Flujo Conversacional:**

```
Usuario: Quiero probar Assembly 2.0

Lex: ¡Perfecto! 🎉 Te voy a activar una cuenta DEMO gratuita por 30 días.
     Necesito algunos datos:

     📧 ¿Cuál es tu email?

Usuario: admin@urbantower.com

Lex: [Valida en BD si existe]
     
     [SI NO EXISTE]
     ✅ Perfecto. ¿Cuál es tu nombre completo?

Usuario: Carlos Martínez

Lex: 🏢 ¿Cuál es el nombre de la Propiedad Horizontal que administras?

Usuario: P.H. Urban Tower

Lex: 📊 ¿Cuántas unidades tiene?

Usuario: 200

Lex: Excelente! Tu Demo está listo 🎉
     
     Te envié un email a admin@urbantower.com con:
     ✅ Link de acceso
     ✅ PIN de verificación (6 dígitos)
     ✅ Tutorial de primeros pasos
     
     Escribe /login para ingresar a tu dashboard.

[SI YA EXISTE]
Lex: ⚠️ Este email ya tiene una cuenta registrada.
     
     Opciones:
     1️⃣ /login - Iniciar sesión
     2️⃣ /recuperar - Recuperar acceso
     3️⃣ Usar otro email
```

### **API Endpoint para el Chatbot:**

```typescript
// app/api/chatbot/register-demo/route.ts
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { 
    email, 
    firstName, 
    lastName, 
    phone,
    propertyName, 
    propertyUnits,
    propertyType,
    source 
  } = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side key
  );
  
  // 1. VALIDAR SI EL EMAIL YA EXISTE
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email, organization_id, role')
    .eq('email', email)
    .maybeSingle();
  
  if (existingUser) {
    // Usuario ya existe
    const { data: org } = await supabase
      .from('organizations')
      .select('name, current_plan, is_demo')
      .eq('id', existingUser.organization_id)
      .single();
    
    return Response.json({
      success: false,
      error: 'EMAIL_EXISTS',
      message: 'Este email ya tiene una cuenta registrada',
      data: {
        email: existingUser.email,
        role: existingUser.role,
        organization: org?.name,
        plan: org?.current_plan,
        is_demo: org?.is_demo
      }
    }, { status: 409 }); // 409 Conflict
  }
  
  // 2. CREAR USUARIO DEMO
  try {
    // 2.1 Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // Requiere confirmación por email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        source
      }
    });
    
    if (authError) throw authError;
    
    // 2.2 Crear organización DEMO
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `Demo - ${propertyName}`,
        type: propertyType,
        legal_context_id: '00000000-0000-0000-0000-000000000001', // Panamá (hardcoded)
        is_demo: true,
        current_plan: 'DEMO'
      })
      .select()
      .single();
    
    if (orgError) throw orgError;
    
    // 2.3 Crear suscripción TRIAL (30 días)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: org.id,
        plan: 'DEMO',
        status: 'TRIAL',
        trial_ends_at: trialEndsAt.toISOString(),
        billing_cycle: 'trial'
      });
    
    if (subError) throw subError;
    
    // 2.4 Crear perfil de usuario
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        organization_id: org.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'ADMIN_PH',
        email_verified: false
      });
    
    if (userError) throw userError;
    
    // 2.5 Crear propiedad inicial
    const { error: propError } = await supabase
      .from('properties')
      .insert({
        organization_id: org.id,
        name: propertyName,
        address: 'Por definir',
        total_units: propertyUnits,
        total_coefficient: 100.00
      });
    
    if (propError) throw propError;
    
    // 2.6 Registrar conversación en chatbot_conversations
    await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: authUser.user.id,
        lead_email: email,
        funnel_stage: 'demo_registered',
        source,
        last_message: `Registro DEMO completado: ${propertyName}`,
        metadata: {
          property_name: propertyName,
          property_units: propertyUnits,
          property_type: propertyType,
          registration_completed: true
        }
      });
    
    // 2.7 Enviar email de verificación (Supabase lo hace automático)
    // El email contiene el link con OTP
    
    // 3. GENERAR PIN DE ACCESO (6 dígitos)
    const accessPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar PIN temporalmente (expira en 15 minutos)
    await supabase
      .from('auth_pins')
      .insert({
        user_id: authUser.user.id,
        pin: accessPin,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      });
    
    return Response.json({
      success: true,
      message: 'Cuenta DEMO creada exitosamente',
      data: {
        user_id: authUser.user.id,
        email,
        organization_id: org.id,
        organization_name: org.name,
        trial_ends_at: trialEndsAt.toISOString(),
        access_pin: accessPin,
        login_url: `${process.env.NEXT_PUBLIC_URL}/login?email=${encodeURIComponent(email)}`
      }
    });
    
  } catch (error: any) {
    console.error('Error creating demo user:', error);
    
    return Response.json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Error al crear la cuenta DEMO',
      details: error.message
    }, { status: 500 });
  }
}
```

### **Integración con el Chatbot (Telegram):**

```typescript
// src/chatbot/handlers/demoRegistration.ts
import TelegramBot from 'node-telegram-bot-api';

interface DemoRegistrationState {
  step: 'email' | 'name' | 'property' | 'units' | 'type' | 'complete';
  data: Partial<DemoRegistrationData>;
}

const registrationStates = new Map<number, DemoRegistrationState>();

export async function handleDemoRegistration(
  bot: TelegramBot, 
  chatId: number, 
  message: string
) {
  const state = registrationStates.get(chatId) || {
    step: 'email',
    data: {}
  };
  
  switch (state.step) {
    case 'email':
      const email = message.trim().toLowerCase();
      
      // Validar formato de email
      if (!isValidEmail(email)) {
        await bot.sendMessage(chatId, '❌ Email inválido. Por favor ingresa un email válido:');
        return;
      }
      
      state.data.email = email;
      state.step = 'name';
      registrationStates.set(chatId, state);
      
      await bot.sendMessage(chatId, '✅ Perfecto. ¿Cuál es tu nombre completo?');
      break;
      
    case 'name':
      const [firstName, ...lastNameParts] = message.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      
      if (!lastName) {
        await bot.sendMessage(chatId, '❌ Por favor ingresa tu nombre y apellido completos:');
        return;
      }
      
      state.data.firstName = firstName;
      state.data.lastName = lastName;
      state.step = 'property';
      registrationStates.set(chatId, state);
      
      await bot.sendMessage(chatId, `¡Mucho gusto ${firstName}! 🏢\n\n¿Cuál es el nombre de la Propiedad Horizontal que administras?`);
      break;
      
    case 'property':
      state.data.propertyName = message.trim();
      state.step = 'units';
      registrationStates.set(chatId, state);
      
      await bot.sendMessage(chatId, '📊 ¿Cuántas unidades tiene? (número)');
      break;
      
    case 'units':
      const units = parseInt(message.trim());
      
      if (isNaN(units) || units < 1) {
        await bot.sendMessage(chatId, '❌ Por favor ingresa un número válido de unidades:');
        return;
      }
      
      if (units > 250) {
        await bot.sendMessage(
          chatId, 
          `⚠️ El plan DEMO está limitado a 250 unidades.\n\n` +
          `Tu propiedad tiene ${units} unidades. Te recomiendo el plan STANDARD ($189/mes) que soporta hasta 1,000 unidades.\n\n` +
          `¿Quieres continuar con el DEMO (limitado a 250) o hablar con un asesor?`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '✅ Continuar con DEMO', callback_data: 'demo_continue' },
                { text: '📞 Hablar con asesor', callback_data: 'escalate_sales' }
              ]]
            }
          }
        );
        return;
      }
      
      state.data.propertyUnits = units;
      state.step = 'type';
      registrationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        '🏗️ ¿Qué tipo de organización es?',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🏠 PH Independiente', callback_data: 'type_ph' },
              { text: '🏢 Promotora', callback_data: 'type_promotora' }
            ]]
          }
        }
      );
      break;
      
    case 'complete':
      // Ya completado
      await bot.sendMessage(chatId, '✅ Tu registro ya está completo. Escribe /login para ingresar.');
      break;
  }
}

export async function handlePropertyType(
  bot: TelegramBot,
  chatId: number,
  type: 'PH_INDEPENDIENTE' | 'PROMOTORA'
) {
  const state = registrationStates.get(chatId);
  
  if (!state || state.step !== 'type') {
    await bot.sendMessage(chatId, '❌ Error en el registro. Escribe /demo para empezar de nuevo.');
    return;
  }
  
  state.data.propertyType = type;
  state.step = 'complete';
  
  // Llamar a la API para crear el usuario DEMO
  try {
    await bot.sendMessage(chatId, '⏳ Creando tu cuenta DEMO...');
    
    const response = await fetch(`${process.env.API_URL}/api/chatbot/register-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state.data,
        source: 'chatbot_telegram'
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      if (result.error === 'EMAIL_EXISTS') {
        await bot.sendMessage(
          chatId,
          `⚠️ ${result.message}\n\n` +
          `📧 Email: ${result.data.email}\n` +
          `🏢 Organización: ${result.data.organization}\n` +
          `📦 Plan: ${result.data.plan}\n\n` +
          `Opciones:\n` +
          `1️⃣ /login - Iniciar sesión\n` +
          `2️⃣ /recuperar - Recuperar acceso\n` +
          `3️⃣ Usar otro email (escribe /demo)`
        );
      } else {
        throw new Error(result.message);
      }
      return;
    }
    
    // Éxito!
    const daysLeft = Math.ceil(
      (new Date(result.data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    await bot.sendMessage(
      chatId,
      `🎉 ¡Tu cuenta DEMO está lista!\n\n` +
      `📧 Te enviamos un email a: ${result.data.email}\n` +
      `🔑 PIN de acceso: ${result.data.access_pin}\n` +
      `📅 Válido por: ${daysLeft} días\n\n` +
      `✅ **Pasos siguientes:**\n` +
      `1️⃣ Revisa tu email y confirma tu cuenta\n` +
      `2️⃣ Usa el comando /login para ingresar\n` +
      `3️⃣ Ingresa el PIN cuando te lo pida\n\n` +
      `📺 Tutorial: /tutorial\n` +
      `❓ Ayuda: /ayuda`,
      { parse_mode: 'Markdown' }
    );
    
    // Limpiar estado
    registrationStates.delete(chatId);
    
  } catch (error: any) {
    console.error('Error registrando demo:', error);
    await bot.sendMessage(
      chatId,
      `❌ Hubo un error al crear tu cuenta DEMO.\n\n` +
      `Por favor intenta de nuevo en unos minutos o contacta a soporte:\n` +
      `📧 soporte@assembly20.com`
    );
  }
}

// Helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### **Tabla Adicional Necesaria (auth_pins):**

```sql
-- Tabla para guardar PINs de acceso temporales
CREATE TABLE auth_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_pins_user ON auth_pins(user_id);
CREATE INDEX idx_auth_pins_pin ON auth_pins(pin) WHERE used = FALSE;

-- Función para validar PIN
CREATE OR REPLACE FUNCTION validate_auth_pin(p_email TEXT, p_pin TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  user_id UUID,
  message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_pin_record RECORD;
BEGIN
  -- Buscar usuario por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Usuario no encontrado';
    RETURN;
  END IF;
  
  -- Buscar PIN válido
  SELECT * INTO v_pin_record
  FROM auth_pins
  WHERE user_id = v_user_id
    AND pin = p_pin
    AND used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_pin_record IS NULL THEN
    RETURN QUERY SELECT FALSE, v_user_id, 'PIN inválido o expirado';
    RETURN;
  END IF;
  
  -- Marcar PIN como usado
  UPDATE auth_pins
  SET used = TRUE
  WHERE id = v_pin_record.id;
  
  RETURN QUERY SELECT TRUE, v_user_id, 'PIN válido';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Comandos del Chatbot:**

```typescript
// src/chatbot/commands.ts

bot.onText(/\/demo/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(
    chatId,
    `🎉 ¡Bienvenido al Demo de Assembly 2.0!\n\n` +
    `Tendrás **30 días gratis** para probar todas las funciones:\n` +
    `✅ Crear 1 asamblea completa\n` +
    `✅ Hasta 250 unidades\n` +
    `✅ Votación con Face ID\n` +
    `✅ Gráficas en tiempo real\n` +
    `✅ Acta digital certificada\n\n` +
    `📧 Para empezar, necesito tu email:`
  );
  
  // Iniciar flujo de registro
  registrationStates.set(chatId, {
    step: 'email',
    data: {}
  });
});

bot.onText(/\/login/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(
    chatId,
    `🔐 **Login a Assembly 2.0**\n\n` +
    `Opciones:\n` +
    `1️⃣ Ingresa desde el navegador: ${process.env.APP_URL}/login\n` +
    `2️⃣ O proporciona aquí:\n` +
    `   📧 Email\n` +
    `   🔑 PIN (6 dígitos)\n\n` +
    `Formato: email PIN\n` +
    `Ejemplo: admin@urbantower.com 123456`,
    { parse_mode: 'Markdown' }
  );
});

// Manejar login desde chatbot
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  
  if (!text || text.startsWith('/')) return;
  
  // Detectar si es un login (email + PIN)
  const loginMatch = text.match(/^([^\s@]+@[^\s@]+\.[^\s@]+)\s+(\d{6})$/);
  
  if (loginMatch) {
    const [, email, pin] = loginMatch;
    
    await bot.sendMessage(chatId, '⏳ Validando credenciales...');
    
    // Validar PIN
    const { data: validation } = await supabase.rpc('validate_auth_pin', {
      p_email: email,
      p_pin: pin
    });
    
    if (validation.valid) {
      const loginUrl = `${process.env.APP_URL}/login?email=${encodeURIComponent(email)}&verified=true`;
      
      await bot.sendMessage(
        chatId,
        `✅ **Login exitoso!**\n\n` +
        `Ingresa a tu dashboard:\n` +
        `👉 ${loginUrl}\n\n` +
        `Tu sesión estará activa por 7 días.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `❌ ${validation.message}\n\n` +
        `Opciones:\n` +
        `1️⃣ /demo - Registrar nueva cuenta\n` +
        `2️⃣ /recuperar - Recuperar acceso\n` +
        `3️⃣ Contactar soporte: soporte@assembly20.com`
      );
    }
    return;
  }
  
  // Si hay un registro en progreso, continuar
  const state = registrationStates.get(chatId);
  if (state && state.step !== 'complete') {
    await handleDemoRegistration(bot, chatId, text);
  }
});
```

---

## 🚀 FLUJO DE LOGIN - PRODUCCIÓN

### **Diferencias con TEST:**

1. **No hay usuarios hardcodeados** (excepto Henry)
2. **Registro via Landing Page** con validación de email
3. **Integración con Stripe** para pagos
4. **WebAuthn obligatorio** después del primer login

### **Flujo Completo:**

#### **1. Nuevo Usuario (DEMO)**

```mermaid
graph TD
    A[Usuario llega a Landing] --> B[Clic "Prueba 30 días gratis"]
    B --> C[Formulario registro]
    C --> D[Email + Nombre + PH]
    D --> E[Supabase crea cuenta]
    E --> F[Envío OTP al email]
    F --> G[Usuario valida OTP]
    G --> H[Crear organización DEMO]
    H --> I[Crear suscripción TRIAL]
    I --> J[Redirect a Dashboard DEMO]
    J --> K[Configurar Face ID]
```

**Código (Coder):**
```typescript
// app/api/auth/register-demo/route.ts
export async function POST(req: Request) {
  const { email, firstName, lastName, propertyName } = await req.json();
  
  // 1. Crear usuario en Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password: crypto.randomBytes(32).toString('hex'), // Random (no se usa)
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`
    }
  });
  
  if (authError) throw authError;
  
  // 2. Crear organización DEMO
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: `Demo - ${propertyName}`,
      type: 'PH_INDEPENDIENTE',
      legal_context_id: PANAMA_CONTEXT_ID,
      is_demo: true,
      current_plan: 'DEMO'
    })
    .select()
    .single();
  
  // 3. Crear suscripción TRIAL
  await supabase.from('subscriptions').insert({
    organization_id: org.id,
    plan: 'DEMO',
    status: 'TRIAL',
    trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  });
  
  // 4. Crear perfil de usuario
  await supabase.from('users').insert({
    id: authUser.user!.id,
    organization_id: org.id,
    email,
    first_name: firstName,
    last_name: lastName,
    role: 'ADMIN_PH',
    email_verified: false
  });
  
  // 5. Enviar email con OTP
  return Response.json({ 
    success: true, 
    message: 'Revisa tu email para verificar tu cuenta' 
  });
}
```

---

#### **2. Login Existente (Password en TEST, WebAuthn en PROD)**

**Fase TEST (Email + Password):**
```typescript
// app/login/page.tsx
const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    toast.error('Credenciales inválidas');
    return;
  }
  
  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('users')
    .select('role, organization_id, is_platform_owner')
    .eq('id', data.user.id)
    .single();
  
  // Redirect según rol
  if (profile.is_platform_owner) {
    router.push('/dashboard/platform-admin');
  } else {
    router.push('/dashboard/admin-ph');
  }
};
```

**Fase PRODUCCIÓN (Email + OTP → WebAuthn):**
```typescript
// Paso 1: Email → OTP
const handleLoginStart = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false
    }
  });
  
  if (!error) {
    setStep('verify-otp');
  }
};

// Paso 2: Verificar OTP
const handleVerifyOtp = async () => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'email'
  });
  
  if (!error) {
    // Verificar si tiene WebAuthn configurado
    const hasWebAuthn = await checkWebAuthnCredentials(data.user.id);
    
    if (!hasWebAuthn) {
      setStep('setup-webauthn');
    } else {
      setStep('verify-webauthn');
    }
  }
};

// Paso 3: WebAuthn (Face ID / Touch ID)
const handleWebAuthnVerify = async () => {
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
      rpId: window.location.hostname,
      userVerification: 'required'
    }
  });
  
  // Verificar credencial en backend
  const verified = await verifyWebAuthnCredential(credential);
  
  if (verified) {
    router.push(getDashboardUrl());
  }
};
```

---

#### **3. Upgrade DEMO → Plan Pagado**

```typescript
// app/dashboard/admin-ph/upgrade/page.tsx
const handleUpgrade = async (selectedPlan: PlanTier) => {
  // 1. Crear Checkout Session en Stripe
  const { sessionId } = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      plan: selectedPlan,
      organizationId: user.organization_id
    })
  }).then(r => r.json());
  
  // 2. Redirect a Stripe Checkout
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
  await stripe?.redirectToCheckout({ sessionId });
};

// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Actualizar suscripción
    await supabase
      .from('subscriptions')
      .update({
        plan: session.metadata.plan,
        status: 'ACTIVE',
        price_paid: session.amount_total / 100,
        billing_cycle: session.metadata.billing_cycle,
        stripe_subscription_id: session.subscription,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .eq('organization_id', session.metadata.organization_id);
    
    // Actualizar organización
    await supabase
      .from('organizations')
      .update({
        is_demo: false,
        current_plan: session.metadata.plan
      })
      .eq('id', session.metadata.organization_id);
    
    // Crear créditos si es plan Standard/Multi-PH
    if (['STANDARD', 'MULTI_PH'].includes(session.metadata.plan)) {
      const credits = session.metadata.plan === 'STANDARD' ? 2 : 10;
      await supabase.from('organization_credits').insert({
        organization_id: session.metadata.organization_id,
        credits_available: credits
      });
    }
  }
  
  return Response.json({ received: true });
}
```

---

## 🎛️ DASHBOARDS POR ROL

### **1. Admin Plataforma (Henry)**

**URL:** `/app/dashboard/platform-admin`

**Componentes:**
```
/app/dashboard/platform-admin/
├── page.tsx              # Overview KPIs
├── leads/
│   └── page.tsx         # Funnel de conversión
├── tickets/
│   └── page.tsx         # Tickets escalados
├── organizations/
│   └── page.tsx         # Todas las orgs (audit)
├── subscriptions/
│   └── page.tsx         # Gestión de planes
├── analytics/
│   └── page.tsx         # Analytics globales
└── settings/
    ├── pricing/page.tsx # Configurar precios
    └── chatbot/page.tsx # Configurar Lex
```

**Middleware de protección:**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (req.nextUrl.pathname.startsWith('/dashboard/platform-admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_platform_owner')
      .eq('id', user?.id)
      .single();
    
    if (!profile?.is_platform_owner) {
      return NextResponse.redirect(new URL('/dashboard/admin-ph', req.url));
    }
  }
  
  return NextResponse.next();
}
```

---

### **2. Admin PH (DEMO)**

**URL:** `/app/dashboard/admin-ph?mode=demo`

**Restricciones:**
- ⚠️ Banner "Prueba gratuita - X días restantes"
- ❌ Exportar actas certificadas (bloqueado)
- ❌ CRM avanzado (bloqueado)
- ❌ Crear más de 1 asamblea
- ❌ Más de 50 unidades

**Componente:**
```typescript
// app/dashboard/admin-ph/page.tsx
export default async function AdminPHDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at')
    .eq('organization_id', user.organization_id)
    .single();
  
  const isDemo = subscription.plan === 'DEMO';
  const daysLeft = Math.ceil(
    (new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <DashboardLayout>
      {isDemo && (
        <DemoTrialBanner 
          daysLeft={daysLeft}
          onUpgrade={() => router.push('/dashboard/admin-ph/upgrade')}
        />
      )}
      
      {/* Dashboard content con restricciones si isDemo */}
      <AssembliesPanel isDemo={isDemo} />
      <CRMPanel isLocked={isDemo} />
      <AnalyticsPanel isLimited={isDemo} />
    </DashboardLayout>
  );
}
```

---

### **3. Admin PH (ACTIVO)**

**URL:** `/app/dashboard/admin-ph`

**Acceso completo según plan:**
- ✅ Todo desbloqueado
- ✅ Funcionalidades según límites del plan
- ✅ Gestión de créditos (si Standard/Multi-PH)

**Componente:**
```typescript
// components/AssembliesPanel.tsx
export function AssembliesPanel({ plan }: { plan: PlanTier }) {
  const limits = PLAN_LIMITS[plan];
  const { data: credits } = useQuery(
    ['credits'],
    () => supabase
      .from('organization_credits')
      .select('credits_available, credits_used_this_month')
      .single()
  );
  
  const canCreateAssembly = 
    plan === 'ENTERPRISE' || 
    (credits && credits.credits_available > 0);
  
  return (
    <Card>
      <CardHeader>
        <h2>Asambleas</h2>
        {['STANDARD', 'MULTI_PH'].includes(plan) && (
          <Badge>
            {credits.credits_available} créditos disponibles
          </Badge>
        )}
      </CardHeader>
      
      <Button 
        onClick={handleCreateAssembly}
        disabled={!canCreateAssembly}
      >
        Crear Asamblea
      </Button>
      
      {!canCreateAssembly && (
        <Alert variant="warning">
          No tienes créditos disponibles. 
          <Link href="/dashboard/admin-ph/upgrade">Agregar más</Link>
        </Alert>
      )}
    </Card>
  );
}
```

---

## 🔨 INSTRUCCIONES PARA EL CODER

### **Checklist de Implementación:**

#### **FASE 1: Actualizar Schema (URGENTE)**
- [ ] Ejecutar SQL de actualización de enums
- [ ] Crear tabla `subscriptions`
- [ ] Crear tabla `organization_credits`
- [ ] Crear tabla `auth_pins` (para PINs temporales)
- [ ] Actualizar tabla `organizations` (columnas nuevas)
- [ ] Actualizar tabla `users` (columnas nuevas)
- [ ] Crear función `validate_auth_pin()`
- [ ] Crear usuario Henry en Supabase (ADMIN_PLATAFORMA)
- [ ] Crear usuarios TEST (demo y activo)
- [ ] Verificar RLS policies (agregar para ADMIN_PLATAFORMA)

#### **FASE 2: Componentes de Auth**
- [ ] `app/login/page.tsx` - Página de login
- [ ] `app/register/page.tsx` - Registro DEMO
- [ ] `app/auth/callback/route.ts` - Callback OTP
- [ ] `components/auth/OTPInput.tsx` - Input PIN 6 dígitos
- [ ] `components/auth/WebAuthnSetup.tsx` - Configurar Face ID
- [ ] `lib/auth/webauthn.ts` - Helpers WebAuthn

#### **FASE 3: Middleware y Guards**
- [ ] `middleware.ts` - Proteger rutas según rol
- [ ] `lib/guards/requireAdmin.ts` - HOC para admin
- [ ] `lib/guards/requirePlatformAdmin.ts` - HOC para Henry
- [ ] `hooks/useUserRole.ts` - Hook para obtener rol

#### **FASE 4: Dashboards**
- [ ] `app/dashboard/platform-admin/page.tsx` - Dashboard Henry
- [ ] `app/dashboard/admin-ph/page.tsx` - Dashboard Admin PH
- [ ] `components/DemoTrialBanner.tsx` - Banner DEMO
- [ ] `components/UpgradeModal.tsx` - Modal upgrade

#### **FASE 5: API Routes**
- [ ] `app/api/auth/register-demo/route.ts` - Registro DEMO (landing)
- [ ] `app/api/chatbot/register-demo/route.ts` - Registro DEMO (chatbot) 🆕
- [ ] `app/api/auth/login/route.ts` - Login
- [ ] `app/api/auth/verify-otp/route.ts` - Verificar OTP
- [ ] `app/api/auth/validate-pin/route.ts` - Validar PIN 🆕
- [ ] `app/api/subscriptions/upgrade/route.ts` - Upgrade plan

#### **FASE 5B: Integración Chatbot 🆕**
- [ ] `src/chatbot/handlers/demoRegistration.ts` - Handler registro DEMO
- [ ] `src/chatbot/commands.ts` - Comandos `/demo` y `/login`
- [ ] Actualizar `src/chatbot/index.ts` - Integrar handlers
- [ ] Validar flujo completo en Telegram
- [ ] Testing: registro nuevo usuario
- [ ] Testing: email duplicado
- [ ] Testing: login con PIN desde chatbot

#### **FASE 6: Testing (LOCAL)**
- [ ] Login como Henry → Verificar dashboard platform-admin
- [ ] Login como DEMO → Verificar restricciones
- [ ] Login como ACTIVO → Verificar acceso completo
- [ ] Intentar acceder a rutas prohibidas
- [ ] Verificar RLS funciona correctamente

---

## 📊 SQL COMPLETO PARA EJECUTAR

```sql
-- ============================================
-- ACTUALIZACIÓN SCHEMA - LOGIN Y ROLES
-- Fecha: 29 Enero 2026
-- ============================================

-- 1. ENUMS NUEVOS Y ACTUALIZADOS
-- ============================================

-- Actualizar user_role
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
  'PROPIETARIO',
  'RESIDENTE',
  'ADMIN_PH',
  'ADMIN_PROMOTORA',
  'JUNTA_DIRECTIVA',
  'ADMIN_PLATAFORMA'
);

-- Crear plan_tier
CREATE TYPE plan_tier AS ENUM (
  'DEMO',
  'EVENTO_UNICO',
  'DUO_PACK',
  'STANDARD',
  'MULTI_PH',
  'ENTERPRISE'
);

-- Crear subscription_status
CREATE TYPE subscription_status AS ENUM (
  'TRIAL',
  'ACTIVE',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED'
);

-- ============================================
-- 2. TABLA SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan plan_tier NOT NULL DEFAULT 'DEMO',
  status subscription_status NOT NULL DEFAULT 'TRIAL',
  
  price_paid NUMERIC(10,2),
  billing_cycle VARCHAR(20),
  
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  commitment_months INT DEFAULT 0,
  commitment_ends_at TIMESTAMPTZ,
  early_cancellation_penalty NUMERIC(10,2),
  
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- ============================================
-- 3. TABLA ORGANIZATION_CREDITS
-- ============================================

CREATE TABLE IF NOT EXISTS organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  credits_available INT DEFAULT 0,
  credits_used_this_month INT DEFAULT 0,
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_org ON organization_credits(organization_id);

-- ============================================
-- 4. TABLA AUTH_PINS (PINs temporales)
-- ============================================

CREATE TABLE IF NOT EXISTS auth_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_pins_user ON auth_pins(user_id);
CREATE INDEX idx_auth_pins_pin ON auth_pins(pin) WHERE used = FALSE;

-- Función para validar PIN
CREATE OR REPLACE FUNCTION validate_auth_pin(p_email TEXT, p_pin TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  user_id UUID,
  message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_pin_record RECORD;
BEGIN
  -- Buscar usuario por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Usuario no encontrado';
    RETURN;
  END IF;
  
  -- Buscar PIN válido
  SELECT * INTO v_pin_record
  FROM auth_pins
  WHERE user_id = v_user_id
    AND pin = p_pin
    AND used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_pin_record IS NULL THEN
    RETURN QUERY SELECT FALSE, v_user_id, 'PIN inválido o expirado';
    RETURN;
  END IF;
  
  -- Marcar PIN como usado
  UPDATE auth_pins
  SET used = TRUE
  WHERE id = v_pin_record.id;
  
  RETURN QUERY SELECT TRUE, v_user_id, 'PIN válido';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ACTUALIZAR ORGANIZATIONS
-- ============================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_plan plan_tier DEFAULT 'DEMO',
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

CREATE INDEX idx_orgs_plan ON organizations(current_plan);
CREATE INDEX idx_orgs_demo ON organizations(is_demo);

-- ============================================
-- 6. ACTUALIZAR USERS
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_platform_owner BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;

CREATE UNIQUE INDEX idx_users_platform_owner 
  ON users(is_platform_owner) 
  WHERE is_platform_owner = TRUE;

-- ============================================
-- 7. RLS POLICIES PARA ADMIN_PLATAFORMA
-- ============================================

-- Henry puede ver TODAS las organizaciones (read-only audit)
CREATE POLICY "Platform admin can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_platform_owner = TRUE
    )
  );

-- Henry puede ver TODOS los usuarios (audit)
CREATE POLICY "Platform admin can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_platform_owner = TRUE
    )
  );

-- ============================================
-- 8. FUNCIÓN HELPER: Obtener rol del usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TABLE (
  role user_role,
  is_platform_owner BOOLEAN,
  organization_id UUID,
  plan plan_tier,
  subscription_status subscription_status,
  is_demo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.role,
    u.is_platform_owner,
    u.organization_id,
    o.current_plan,
    s.status,
    o.is_demo
  FROM users u
  LEFT JOIN organizations o ON o.id = u.organization_id
  LEFT JOIN subscriptions s ON s.organization_id = o.id
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN ACTUALIZACIÓN SCHEMA
-- ============================================
```

---

## ✅ VALIDACIÓN FINAL

### **Test Cases:**

1. ✅ Henry puede login → accede a `/dashboard/platform-admin`
2. ✅ Usuario DEMO puede login → accede a `/dashboard/admin-ph?mode=demo`
3. ✅ Usuario ACTIVO puede login → accede a `/dashboard/admin-ph`
4. ✅ Usuario DEMO NO puede exportar actas certificadas
5. ✅ Usuario DEMO tiene banner "X días restantes"
6. ✅ Usuario ACTIVO puede crear asambleas según créditos
7. ✅ Henry puede ver todas las organizaciones (audit)
8. ✅ Admin PH NO puede ver otras organizaciones

---

## 📞 SOPORTE

**Dudas sobre implementación:**
1. Lee este documento completo
2. Revisa `MARKETING_PRECIOS_COMPLETO.md` para límites por plan
3. Consulta `schema.sql` para estructura completa
4. Pregunta a Henry

**Fecha última actualización:** 29 Enero 2026  
**Versión:** 1.0  
**Status:** 🟢 LISTO PARA IMPLEMENTAR

---

🎯 **SIGUIENTE PASO:** Coder ejecuta SQL de actualización y crea componentes de login.
