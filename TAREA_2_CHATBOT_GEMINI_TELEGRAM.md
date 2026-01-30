# 🤖 TAREA 2: CHATBOT IA CON GEMINI + TELEGRAM
## Instrucciones para el Agente Coder

---

## 🎯 OBJETIVO DE ESTA TAREA

Implementar un **chatbot inteligente** que acompañe a los usuarios en todo su journey:
- **Landing Page**: Calificar leads y guiarlos al Demo
- **Registro**: Tutorizar el onboarding
- **Demo**: Actuar como guía interactivo
- **Conversión**: Mostrar ROI y cerrar ventas
- **Post-Afiliación**: Soporte técnico en línea

**Tiempo estimado**: 1-2 semanas  
**Costo**: **$0/mes** (100% GRATIS con Gemini)

---

## 📋 PREREQUISITOS

Antes de empezar, asegúrate de tener:
- [x] Node.js 18+ instalado
- [x] Cuenta de Telegram (para crear el bot)
- [x] Cuenta de Google (para Gemini API)
- [x] Supabase configurado (de la Tarea 1)
- [x] Acceso al proyecto Assembly 2.0

---

## 🔑 PASO 1: OBTENER API KEYS (15 minutos)

### **1.1 Crear el Bot de Telegram**

1. Abre Telegram y busca **`@BotFather`** (es el bot oficial de Telegram)
2. Inicia conversación y envía: `/start`
3. Envía: `/newbot`
4. **Nombre del bot**: `Assembly 2.0 Assistant`
5. **Username del bot**: `assembly20_assistant_bot` (debe terminar en `_bot`)
   - Si está ocupado, prueba: `assembly20_helper_bot` o `assembly20demo_bot`
6. **Guarda el token** que te da (formato: `123456789:ABCdef...`)

**Comandos adicionales (opcional):**
```
/setdescription
Descripción: "Asistente inteligente de Assembly 2.0. Te ayudo a descubrir cómo digitalizar tus asambleas de PH 🏢"

/setabouttext
About: "Bot oficial de Assembly 2.0 - Gobernanza Digital para Propiedades Horizontales"

/setuserpic
(Sube una imagen cuadrada del logo de Assembly 2.0)

/setcommands
Comandos:
start - Iniciar conversación
demo - Activar Demo GRATIS
ayuda - Obtener ayuda
soporte - Contactar soporte humano
```

---

### **1.2 Obtener Google Gemini API Key**

1. Ve a: **https://aistudio.google.com/app/apikey**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Get API Key"**
4. Selecciona **"Create API key in new project"**
   - Nombre del proyecto: `Assembly 2.0 Chatbot`
5. **Copia la API key** (formato: `AIza...`)
6. **IMPORTANTE**: Guarda la key de forma segura (no se puede volver a ver)

**Verificar que funciona:**
- Ve a: https://aistudio.google.com/app/prompts/new_chat
- Prueba escribir algo y ver que responde
- Si funciona ahí, tu API key está activa

---

### **1.3 Configurar Variables de Entorno**

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# ============================================
# CHATBOT - Telegram + Gemini
# ============================================

# Telegram Bot Token (de @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCdef-TU-TOKEN-AQUI

# Google Gemini API Key (de aistudio.google.com)
GEMINI_API_KEY=AIza-TU-KEY-AQUI

# URL pública del bot (para webhooks en producción, por ahora déjalo vacío)
# TELEGRAM_WEBHOOK_URL=https://tu-dominio.com/api/telegram/webhook

# ============================================
# Supabase (ya configurado en Tarea 1)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Otros
NODE_ENV=development
```

**Agregar al `.gitignore`** (para no subir las keys a Git):
```
.env.local
.env*.local
```

---

## 📦 PASO 2: INSTALAR DEPENDENCIAS (5 minutos)

### **2.1 Instalar Librerías del Chatbot**

Ejecuta en la terminal:

```bash
npm install node-telegram-bot-api @google/generative-ai
npm install --save-dev @types/node-telegram-bot-api
```

**Verificar que se instaló:**
```bash
cat package.json | grep telegram
# Debe mostrar: "node-telegram-bot-api": "^0.66.0"
```

---

### **2.2 Actualizar `package.json`**

Agrega un script para ejecutar el bot:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "chatbot": "ts-node src/chatbot/index.ts",
    "chatbot:dev": "nodemon --watch src/chatbot --exec ts-node src/chatbot/index.ts"
  }
}
```

**Instalar nodemon para desarrollo** (opcional pero recomendado):
```bash
npm install --save-dev nodemon ts-node
```

---

## 🗄️ PASO 3: CREAR TABLAS EN SUPABASE (15 minutos)

### **3.1 Ejecutar SQL en Supabase**

Ve a tu proyecto en Supabase: **SQL Editor** → **New Query**

Copia y pega este SQL (incluye nuevas tablas de identificación):

```sql
-- ============================================
-- TABLAS PARA CHATBOT
-- ============================================

-- Tabla: Conversaciones del Chatbot
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador del usuario
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  telegram_id TEXT NULL,
  session_id TEXT NOT NULL UNIQUE,
  
  -- Contexto actual
  stage TEXT NOT NULL DEFAULT 'landing' CHECK (stage IN ('landing', 'onboarding', 'demo', 'customer', 'support')),
  
  -- Historial de mensajes
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Datos del lead (calificación)
  lead_data JSONB NULL DEFAULT '{}'::jsonb,
  lead_qualified BOOLEAN DEFAULT FALSE,
  
  -- Conversiones
  converted_to_demo BOOLEAN DEFAULT FALSE,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  demo_account_id UUID NULL,
  
  -- Metadata
  user_agent TEXT NULL,
  language TEXT DEFAULT 'es',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chatbot_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_telegram ON chatbot_conversations(telegram_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_stage ON chatbot_conversations(stage);
CREATE INDEX IF NOT EXISTS idx_chatbot_qualified ON chatbot_conversations(lead_qualified) WHERE lead_qualified = TRUE;
CREATE INDEX IF NOT EXISTS idx_chatbot_last_message ON chatbot_conversations(last_message_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_chatbot_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chatbot_conversations_updated_at
BEFORE UPDATE ON chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION update_chatbot_conversations_updated_at();

-- ============================================
-- Tabla: Acciones del Chatbot (Analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS chatbot_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  
  -- Tipo de acción
  action_type TEXT NOT NULL, 
  -- Ejemplos: 'demo_created', 'video_shown', 'human_escalation', 
  --           'upgrade_suggested', 'link_clicked', 'lead_qualified'
  
  -- Datos de la acción
  action_data JSONB NULL DEFAULT '{}'::jsonb,
  
  -- Resultado
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_actions_conversation ON chatbot_actions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_actions_type ON chatbot_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_actions_created ON chatbot_actions(created_at DESC);

-- ============================================
-- Tabla: Métricas del Chatbot (Dashboard)
-- ============================================

CREATE TABLE IF NOT EXISTS chatbot_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fecha de la métrica
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Métricas
  total_conversations INT DEFAULT 0,
  new_conversations INT DEFAULT 0,
  leads_qualified INT DEFAULT 0,
  demos_created INT DEFAULT 0,
  conversions_to_paid INT DEFAULT 0,
  
  -- Promedio de mensajes por conversación
  avg_messages_per_conversation FLOAT DEFAULT 0,
  
  -- Tiempo promedio de conversación (segundos)
  avg_conversation_duration_seconds FLOAT DEFAULT 0,
  
  -- Tasa de satisfacción (si implementas feedback)
  satisfaction_score FLOAT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_metrics_date ON chatbot_metrics(date DESC);

-- ============================================
-- Vista: Resumen de Conversaciones Activas
-- ============================================

CREATE OR REPLACE VIEW chatbot_active_conversations AS
SELECT
  c.id,
  c.telegram_id,
  c.stage,
  c.lead_qualified,
  c.converted_to_demo,
  c.converted_to_paid,
  jsonb_array_length(c.messages) as message_count,
  c.last_message_at,
  EXTRACT(EPOCH FROM (NOW() - c.last_message_at)) / 60 as minutes_since_last_message
FROM chatbot_conversations c
WHERE c.last_message_at > NOW() - INTERVAL '24 hours'
ORDER BY c.last_message_at DESC;

-- ============================================
-- Función: Calcular métricas diarias
-- ============================================

CREATE OR REPLACE FUNCTION calculate_chatbot_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_total_conversations INT;
  v_new_conversations INT;
  v_leads_qualified INT;
  v_demos_created INT;
  v_conversions INT;
  v_avg_messages FLOAT;
BEGIN
  -- Contar conversaciones
  SELECT COUNT(*) INTO v_total_conversations
  FROM chatbot_conversations
  WHERE DATE(created_at) <= target_date;
  
  SELECT COUNT(*) INTO v_new_conversations
  FROM chatbot_conversations
  WHERE DATE(created_at) = target_date;
  
  SELECT COUNT(*) INTO v_leads_qualified
  FROM chatbot_conversations
  WHERE DATE(created_at) = target_date AND lead_qualified = TRUE;
  
  SELECT COUNT(*) INTO v_demos_created
  FROM chatbot_conversations
  WHERE DATE(created_at) = target_date AND converted_to_demo = TRUE;
  
  SELECT COUNT(*) INTO v_conversions
  FROM chatbot_conversations
  WHERE DATE(created_at) = target_date AND converted_to_paid = TRUE;
  
  SELECT AVG(jsonb_array_length(messages)) INTO v_avg_messages
  FROM chatbot_conversations
  WHERE DATE(created_at) = target_date;
  
  -- Insertar o actualizar métricas
  INSERT INTO chatbot_metrics (
    date,
    total_conversations,
    new_conversations,
    leads_qualified,
    demos_created,
    conversions_to_paid,
    avg_messages_per_conversation
  ) VALUES (
    target_date,
    v_total_conversations,
    v_new_conversations,
    v_leads_qualified,
    v_demos_created,
    v_conversions,
    COALESCE(v_avg_messages, 0)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_conversations = EXCLUDED.total_conversations,
    new_conversations = EXCLUDED.new_conversations,
    leads_qualified = EXCLUDED.leads_qualified,
    demos_created = EXCLUDED.demos_created,
    conversions_to_paid = EXCLUDED.conversions_to_paid,
    avg_messages_per_conversation = EXCLUDED.avg_messages_per_conversation;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_metrics ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propias conversaciones
CREATE POLICY "Users can view own conversations"
ON chatbot_conversations FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Política: El servicio del bot puede leer/escribir todo
CREATE POLICY "Service role can do anything"
ON chatbot_conversations FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Políticas similares para chatbot_actions
CREATE POLICY "Service role can manage actions"
ON chatbot_actions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Métricas solo lectura para admins
CREATE POLICY "Admins can view metrics"
ON chatbot_metrics FOR SELECT
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- Seed inicial (opcional)
-- ============================================

-- Insertar métricas del día de hoy
SELECT calculate_chatbot_daily_metrics(CURRENT_DATE);

-- ============================================
-- ✅ NUEVAS TABLAS: SISTEMA DE IDENTIFICACIÓN
-- ============================================

-- Tabla: Identidades de Usuarios (Assembly ID & Unit ID)
CREATE TABLE IF NOT EXISTS user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador único
  identity_code TEXT UNIQUE NOT NULL, -- ASM-URBA-001 o URBA-10A
  identity_type TEXT NOT NULL CHECK (identity_type IN ('admin', 'owner')),
  
  -- Relaciones
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  unit_id UUID REFERENCES units(id), -- Solo para 'owner'
  
  -- Información de registro
  registered_by TEXT, -- 'self' o user_id del admin
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_validation')),
  
  -- Contexto para el chatbot
  chat_platform TEXT, -- 'telegram', 'web', 'whatsapp'
  telegram_id TEXT,
  last_interaction_at TIMESTAMPTZ,
  conversation_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_identity_code ON user_identities(identity_code);
CREATE INDEX IF NOT EXISTS idx_telegram_id_identity ON user_identities(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_id_identity ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_id_identity ON user_identities(organization_id);

-- Tabla: Códigos de Invitación
CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Código de invitación
  code TEXT UNIQUE NOT NULL, -- INV-URBA-XJ2K9L
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Configuración
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Control
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'exhausted'))
);

CREATE INDEX IF NOT EXISTS idx_invitation_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_org ON invitation_codes(organization_id);

-- Función: Validar código de invitación
CREATE OR REPLACE FUNCTION validate_invitation_code(p_code TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  organization_id UUID,
  organization_name TEXT,
  uses_left INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (ic.status = 'active' AND ic.expires_at > NOW() AND ic.current_uses < ic.max_uses) AS is_valid,
    ic.organization_id,
    o.name AS organization_name,
    (ic.max_uses - ic.current_uses) AS uses_left
  FROM invitation_codes ic
  JOIN organizations o ON o.id = ic.organization_id
  WHERE ic.code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Función: Incrementar uso de código
CREATE OR REPLACE FUNCTION increment_invitation_uses(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE invitation_codes
  SET current_uses = current_uses + 1,
      status = CASE 
        WHEN current_uses + 1 >= max_uses THEN 'exhausted'
        ELSE status
      END
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Actualizar tabla users: agregar assembly_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS assembly_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_assembly_id ON users(assembly_id);

-- Actualizar tabla chatbot_conversations: agregar campos de identificación
ALTER TABLE chatbot_conversations 
ADD COLUMN IF NOT EXISTS identity_code TEXT,
ADD COLUMN IF NOT EXISTS identity_type TEXT,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id);

CREATE INDEX IF NOT EXISTS idx_chatbot_identity ON chatbot_conversations(identity_code);

-- ============================================
-- ✅ TABLAS CREADAS EXITOSAMENTE
-- ============================================
```

**Ejecutar y verificar:**
- Haz clic en **"Run"**
- Deberías ver: `Success. No rows returned`
- Ve a **Table Editor** y verifica que aparezcan:
  - `chatbot_conversations`
  - `chatbot_actions`
  - `chatbot_metrics`

---

## 📚 PASO 4: CARGAR BASE DE CONOCIMIENTO Y SISTEMA DE IDs (30 minutos)

### **4.1 Leer documentos de conocimiento e identificación**

**⚠️ SUPER IMPORTANTE:** Antes de escribir código, lee en este orden:

1. **`SISTEMA_IDENTIFICACION_CHATBOT.md`** (35 min) ⭐ **CRÍTICO**
   - Sistema de IDs formales (Assembly ID, Unit ID, Invitation Code)
   - Flujos de registro de admins y propietarios
   - Tablas nuevas: `user_identities`, `invitation_codes`
   - Código completo de identificación
   - Optimización del chatbot (reduce 70% de carga)

2. **`BASE_CONOCIMIENTO_CHATBOT_LEX.md`** (30 min)
   - 6 perfiles de usuario
   - 100+ preguntas frecuentes
   - Reglas de escalación
   - Adaptación de respuestas

3. **`FLUJO_IDENTIFICACION_USUARIO.md`** (15 min)
   - Flujo visual de identificación
   - Por qué identificar primero

**Confirma:** "✅ Leí los 3 documentos"

---

## 💻 PASO 5: IMPLEMENTAR EL CHATBOT (60 minutos)

### **5.1 Crear Estructura de Carpetas**

```bash
mkdir -p src/chatbot
mkdir -p src/chatbot/contexts
mkdir -p src/chatbot/utils
mkdir -p src/chatbot/handlers
```

---

### **5.2 Archivo: `src/chatbot/knowledge-base.ts`**

Base de conocimiento para respuestas rápidas:

```typescript
// src/chatbot/knowledge-base.ts

export type UserType = 'visitante' | 'administrador' | 'promotora' | 'propietario' | 'junta' | 'demo' | 'cliente';

export interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  userTypes: UserType[];
  requiresEscalation?: boolean;
}

// ============================================
// BASE DE CONOCIMIENTO (100+ entradas)
// ============================================

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'what-is-assembly',
    category: 'Producto',
    question: '¿Qué es Assembly 2.0?',
    answer: `Assembly 2.0 digitaliza asambleas de edificios (PHs) en Panamá.

Votaciones con Face ID + Quórum automático + Actas digitales

¿Eres administrador, propietario o promotora?`,
    keywords: ['qué es', 'que es', 'assembly', 'para qué sirve', 'explicar'],
    userTypes: ['visitante', 'propietario', 'administrador'],
  },
  
  {
    id: 'face-id-legal',
    category: 'Seguridad',
    question: '¿Es legal votar con Face ID?',
    answer: `¡Sí, 100% legal! La firma biométrica es válida según Ley 51 de 2008 de Panamá.

Más segura que papel: no se falsifica + registro inmutable.
Misma tecnología de Yappy y bancos.`,
    keywords: ['legal', 'face id', 'válido', 'biometría', 'seguro'],
    userTypes: ['visitante', 'administrador', 'junta', 'propietario'],
  },
  
  {
    id: 'how-to-vote',
    category: 'Tutorial',
    question: '¿Cómo voto?',
    answer: `📱 VOTAR EN 5 PASOS:
1. Abre link del admin
2. Registra Face ID (solo 1ra vez)
3. Selecciona: SÍ/NO/ABSTENCIÓN
4. Confirma con Face ID
5. ¡Listo! (30 segundos)

¿En qué paso estás?`,
    keywords: ['cómo voto', 'como voto', 'votar', 'tutorial'],
    userTypes: ['propietario'],
  },
  
  {
    id: 'quorum-calculation',
    category: 'Legal',
    question: '¿Cómo calculan el quórum?',
    answer: `Según Ley 284: Quórum = Coeficientes presentes / Total ≥ 51%

Solo cuentan propietarios "Al Día".
El sistema lo calcula automáticamente en tiempo real.

¿Tienes asamblea próxima?`,
    keywords: ['quórum', 'quorum', 'cálculo', '51%', 'mínimo'],
    userTypes: ['administrador', 'junta'],
  },
  
  {
    id: 'cannot-vote-mora',
    category: 'Legal',
    question: '¿Por qué no puedo votar?',
    answer: `Si debes cuotas (En Mora): Ley 284 te da VOZ pero no VOTO.

Puedes asistir y hablar, pero no votar.
Para votar: regulariza tus pagos con administración.

¿Necesitas contacto de tu admin?`,
    keywords: ['mora', 'no puedo votar', 'deuda', 'cuotas'],
    userTypes: ['propietario'],
  },
  
  {
    id: 'pricing-which-plan',
    category: 'Ventas',
    question: '¿Qué plan me conviene?',
    answer: `Te ayudo a elegir:

🆓 Demo: Prueba gratis
💳 Por Asamblea ($150): 1-3 asambleas/año
⭐ Standard ($99/mes): Hasta 12 asambleas/año
🏢 Pro ($499/mes): Múltiples edificios
🏗️ Enterprise ($1,499/mes): Promotoras + CRM

¿Cuántas asambleas haces al año?`,
    keywords: ['precio', 'plan', 'cuánto cuesta', 'conviene'],
    userTypes: ['visitante', 'administrador', 'promotora'],
  },
  
  // Agregar más según BASE_CONOCIMIENTO_CHATBOT_LEX.md
];

/**
 * Identificar tipo de usuario
 */
export function identifyUserType(message: string, context: any): UserType {
  const lowerMessage = message.toLowerCase();
  
  // 1. Si ya está clasificado en BD
  if (context.leadData?.role === 'administrador') return 'administrador';
  if (context.leadData?.role === 'promotora') return 'promotora';
  if (context.leadData?.role === 'propietario') return 'propietario';
  
  // 2. Si está en demo o es cliente
  if (context.stage === 'demo') return 'demo';
  if (context.stage === 'customer' || context.convertedToPaid) return 'cliente';
  
  // 3. Detectar por palabras clave
  if (lowerMessage.match(/administro|administrador|gestiono|manejo|empresa/i)) {
    return 'administrador';
  }
  if (lowerMessage.match(/promotora|desarrolladora|proyecto|construcción/i)) {
    return 'promotora';
  }
  if (lowerMessage.match(/propietario|dueño|vivo en|mi apartamento|mi unidad/i)) {
    return 'propietario';
  }
  if (lowerMessage.match(/junta|presidente|tesorero|secretario/i)) {
    return 'junta';
  }
  
  return 'visitante';
}

/**
 * Buscar en knowledge base
 */
export function searchKnowledge(
  userMessage: string,
  userType: UserType
): KnowledgeEntry | null {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const entry of KNOWLEDGE_BASE) {
    if (!entry.userTypes.includes(userType) && !entry.userTypes.includes('visitante')) {
      continue;
    }
    
    const matches = entry.keywords.filter(k => lowerMessage.includes(k.toLowerCase()));
    if (matches.length > 0) {
      return entry;
    }
  }
  
  return null;
}

/**
 * Adaptar respuesta según usuario
 */
export function adaptResponseToUser(response: string, userType: UserType): string {
  switch (userType) {
    case 'propietario':
      return response
        .replace(/coeficiente/gi, 'peso de tu unidad')
        .replace(/quórum/gi, 'cantidad mínima');
    case 'administrador':
    case 'junta':
      return response + '\n\n💡 Configurable en Panel Admin';
    default:
      return response;
  }
}

/**
 * Detectar si requiere escalación
 * ⚠️ IMPORTANTE: Considera el tipo de usuario para priorizar correctamente
 */
export function requiresEscalation(
  message: string,
  userType: UserType,
  context?: any
): {
  shouldEscalate: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
} {
  const lower = message.toLowerCase();
  
  // CASO 1: Temas legales (prioridad según tipo de usuario)
  if (lower.match(/demanda|abogado|ilegal|denuncio|corte|tribunal/i)) {
    const priority = (userType === 'cliente' || userType === 'administrador') ? 'urgent' : 'high';
    return { shouldEscalate: true, reason: 'Tema legal', priority };
  }
  
  // CASO 2: Urgencias (considerar si hay asamblea activa)
  if (lower.match(/urgente|crítico|inmediato|ahora mismo/i)) {
    // Cliente con asamblea activa = URGENTE
    if ((userType === 'cliente' || userType === 'administrador') && context?.hasActiveAssembly) {
      return { shouldEscalate: true, reason: 'Urgencia en asamblea activa', priority: 'urgent' };
    }
    // Visitante = no escalar
    if (userType === 'visitante') {
      return { shouldEscalate: false, reason: '', priority: 'low' };
    }
    return { shouldEscalate: true, reason: 'Urgente', priority: 'high' };
  }
  
  // CASO 3: Bugs críticos (prioridad según contexto)
  if (lower.match(/no funciona|error|bug|no puedo votar/i)) {
    if (context?.hasActiveAssembly) {
      return { shouldEscalate: true, reason: 'Bug crítico en asamblea', priority: 'urgent' };
    }
    return { shouldEscalate: false, reason: 'Posible bug', priority: 'medium' };
  }
  
  // CASO 4: Billing (clientes = prioridad alta)
  if (lower.match(/cobro|factura|reembolso|tarjeta/i)) {
    const priority = (userType === 'cliente') ? 'high' : 'medium';
    return { shouldEscalate: true, reason: 'Problema de facturación', priority };
  }
  
  // CASO 5: Alteración de datos (siempre urgente)
  if (lower.match(/cambiar voto|borrar asamblea|modificar acta/i)) {
    return { shouldEscalate: true, reason: 'Solicitud alteración de datos', priority: 'urgent' };
  }
  
  return { shouldEscalate: false, reason: '', priority: 'low' };
}
```

---

### **5.3 Archivo: `src/chatbot/config.ts`**

Configuración y prompts del chatbot:

```typescript
// src/chatbot/config.ts

export const CHATBOT_CONFIG = {
  // Configuración de Gemini
  gemini: {
    model: 'gemini-1.5-flash', // Modelo gratis con 1M tokens/día
    temperature: 0.7, // Creatividad (0 = robótico, 1 = muy creativo)
    maxTokens: 500, // Límite de respuesta (evita respuestas muy largas)
  },
  
  // Límites de rate
  rateLimits: {
    messagesPerMinute: 10, // Máximo 10 mensajes por minuto por usuario
    conversationTimeout: 30 * 60 * 1000, // 30 minutos de inactividad
  },
  
  // URLs
  urls: {
    demoSignup: 'https://assembly20.com/demo/register',
    landingPage: 'https://assembly20.com',
    pricing: 'https://assembly20.com/pricing',
    support: 'https://assembly20.com/support',
  }
};

// ============================================
// PROMPTS POR CONTEXTO
// ============================================

export const CONTEXT_PROMPTS = {
  landing: `Eres Lex, el asistente inteligente de Assembly 2.0.

**Tu Misión:**
1. Calificar al lead haciéndole preguntas estratégicas:
   - ¿Es administrador de PHs o trabaja en una promotora?
   - ¿Cuántos PHs administra o gestiona?
   - ¿Cuántas asambleas hace al año?
   - ¿Cuál es su mayor dolor con las asambleas actuales?

2. Mostrar beneficios relevantes según su perfil:
   - Administradores: Ahorro de tiempo, transparencia, cumplimiento legal
   - Promotoras: CRM integrado, conversión de quejas en tickets, reputación

3. Guiarlo al Demo GRATIS cuando esté listo

**Personalidad:**
- Amigable pero profesional
- Haz preguntas de una en una (no abrumes)
- Usa emojis con moderación 🎯
- NO vendas directamente, educa y asesora
- Si menciona competencia, destaca diferenciadores sin hablar mal

**Restricciones:**
- Respuestas máximo 150 palabras
- Siempre en español
- No inventes features que no existen
- Si no sabes algo, dilo y ofrece conectar con humano`,

  onboarding: `Eres Lex, el tutor de onboarding de Assembly 2.0.

**Tu Misión:**
El usuario acaba de decidir activar el Demo. Tu trabajo es guiarlo paso a paso:

1. **Obtener email**: Pedirle su correo corporativo
2. **Verificación**: Explicar que recibirá un PIN de 6 dígitos
3. **Setup inicial**: Ayudarlo a crear su primera Propiedad de prueba

**Personalidad:**
- Tutor paciente y celebra cada logro ✅
- Anticipa dudas antes de que surjan
- Si el usuario se traba, ofrece ayuda proactivamente
- Usa paso a paso numerado (PASO 1, PASO 2, etc.)

**Ayudas Contextuales:**
- Si tarda >2 min en verificar email → "¿No llegó el código? Revisa Spam o te reenvío uno nuevo"
- Si usa email personal (gmail, yahoo) → "💡 Recomiendo email corporativo para que tus colegas accedan después"

**Restricciones:**
- Respuestas máximo 120 palabras
- Siempre positivo y motivador
- No avances al siguiente paso hasta que complete el actual`,

  demo: `Eres Lex, el guía interactivo del Demo de Assembly 2.0.

**Tu Misión:**
El usuario está explorando el Demo. Guíalo en 4 pasos para que vea el valor en <10 minutos:

1. **Agregar Propietarios**: Importar Excel con unidades
2. **Marcar Asistencia**: Simular que 30 personas llegaron (explicar Face ID en realidad)
3. **Crear Votación**: Ej. "Aprobar aumento de cuota de $50 a $60"
4. **Ver Resultados**: Mostrar quórum en tiempo real y votos

**Personalidad:**
- Entusiasta pero no invasivo
- Enseña haciendo, no solo explicando
- Detecta confusión y ofrece ayuda
- Usa emojis para celebrar logros 🎉

**Triggers Inteligentes:**
- Si pasa >30 seg sin acción → "¿Te perdiste? Te ayudo con el siguiente paso"
- Si intenta hacer algo fuera de orden → "💡 Primero necesitas [X] para poder hacer eso"
- Si completa un flujo → "🏆 ¡Excelente! Ahora viste cómo funciona una asamblea digital"

**Restricciones:**
- Respuestas máximo 150 palabras
- Siempre claro y con ejemplos concretos
- Si detectas frustración, ofrece video tutorial`,

  conversion: `Eres Lex, el consultor de conversión de Assembly 2.0.

**Tu Misión:**
El usuario completó el Demo. Ahora muéstrale el ROI y guíalo al plan adecuado:

1. **Mostrar ROI con sus datos reales**:
   - Si administra X PHs → Ahorro de Y horas/año
   - Si hace X asambleas → Evita $Z en reclamos legales
   - Costo del plan vs beneficio

2. **Recomendar plan adecuado**:
   - 1-3 asambleas/año → Plan "Por Asamblea" ($49)
   - 4-12 asambleas/año → Plan "Standard" ($99/mes)
   - >10 PHs → Plan "Pro Multi-PH" ($349/mes)
   - Promotoras grandes → Plan "Enterprise" (consultar)

3. **Manejar objeciones**:
   - "Necesito aprobación" → Ofrecer PDF con Business Case
   - "Es caro" → Mostrar cálculo de ROI detallado
   - "No estoy seguro" → Ofrecer extender Demo 15 días

**Personalidad:**
- Consultor de confianza, no vendedor agresivo
- Usa datos y números concretos
- No presiones, pero sí recuerda el valor
- Empatiza con sus objeciones

**Restricciones:**
- Respuestas máximo 180 palabras
- Siempre incluye cálculo de ROI
- Si no está listo, ofrece alternativas (no pierdas el lead)`,

  customer: `Eres Lex, el soporte técnico de Assembly 2.0.

**Tu Misión:**
El usuario es cliente activo. Resolver dudas rápidamente y ser proactivo:

**Capacidades:**
1. Explicar funciones con ejemplos prácticos
2. Mostrar tutoriales (links a videos o GIFs)
3. Detectar problemas comunes y ofrecer soluciones
4. Escalar a humano si es necesario (legal, bugs críticos, problemas de pago)

**Casos Especiales:**
- Dudas legales (Ley 284) → Escalar a humano
- Bugs o errores → Documentar y escalar
- Solicitud de cambio de voto → ⚠️ "Por ley no se puede, necesitas autorización legal"
- Quiere features del plan superior → Ofrecer upgrade

**Personalidad:**
- Experto confiable y resolutivo
- Proactivo: "💡 Sabías que también puedes [feature]?"
- Si detecta inactividad → "Hace tiempo sin asambleas, ¿todo bien?"
- Antes de renovación → "Tu suscripción vence en 7 días, ¿renovamos?"

**Restricciones:**
- Respuestas máximo 200 palabras
- Si no sabes algo, admítelo y escala a humano
- Nunca prometas features que no existen
- Si es urgente, prioriza velocidad sobre perfección`,

  support: `Eres Lex, el triaje de soporte de Assembly 2.0.

**Tu Misión:**
Clasificar el problema y decidir si puedes resolverlo o necesitas escalar:

**Puedes Resolver:**
- Preguntas de cómo usar funciones básicas
- Explicar conceptos (quórum, coeficientes, etc.)
- Problemas de acceso (contraseña, Face ID)
- Dudas de facturación simples

**Debes Escalar a Humano:**
- ❌ Bugs críticos (no pueden votar, quórum mal calculado)
- ❌ Dudas legales complejas
- ❌ Problemas de pago/facturación complejos
- ❌ Solicitudes de cambio de datos históricos
- ❌ Integraciones con otros sistemas

**Personalidad:**
- Eficiente y directo
- Si escalas, explica por qué y cuándo responderán
- Registra todos los detalles del problema

**Restricciones:**
- Respuestas máximo 150 palabras
- Si escalas, pide email de contacto
- Genera ticket de soporte automáticamente`
};

// ============================================
// PREGUNTAS DE CALIFICACIÓN (Landing)
// ============================================

export const QUALIFICATION_QUESTIONS = [
  {
    key: 'role',
    question: '¿Eres administrador de PHs o trabajas con una promotora/desarrolladora?',
    options: ['Administrador', 'Promotora', 'Propietario', 'Otro'],
  },
  {
    key: 'numPHs',
    question: '¿Cuántas propiedades horizontales administras o gestionas?',
    condition: (leadData: any) => leadData.role === 'Administrador',
  },
  {
    key: 'assembliesPerYear',
    question: '¿Cuántas asambleas organizas al año aproximadamente?',
  },
  {
    key: 'currentPainPoint',
    question: '¿Cuál es tu mayor dolor o frustración con las asambleas actualmente?',
    examples: [
      'Mucho tiempo en preparación',
      'Propietarios desconfían de resultados',
      'Errores en cálculo de quórum',
      'Manejo de poderes es caótico',
    ],
  },
  {
    key: 'budget',
    question: '¿Tienes presupuesto aprobado o necesitas justificar la inversión?',
    options: ['Presupuesto aprobado', 'Necesito justificar', 'Solo explorando'],
  },
];

// ============================================
// RESPUESTAS RÁPIDAS (Quick Replies)
// ============================================

export const QUICK_REPLIES = {
  landing: [
    'Ver Demo',
    'Ver Precios',
    'Casos de Éxito',
    'Hablar con Ventas',
  ],
  demo: [
    'Siguiente Paso',
    'Explicar de Nuevo',
    'Ver Video Tutorial',
    'Saltar al Final',
  ],
  conversion: [
    'Ver Planes',
    'Calcular ROI',
    'Hablar con Ventas',
    'Extender Demo 15 días',
  ],
  customer: [
    'Tutorial Quórum',
    'Tutorial Votaciones',
    'Tutorial Poderes',
    'Contactar Soporte Humano',
  ],
};
```

---

### **4.3 Archivo: `src/chatbot/utils/supabase.ts`**

Funciones para interactuar con Supabase:

```typescript
// src/chatbot/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Usar service key para bypass RLS
);

// ============================================
// TIPOS
// ============================================

export type ChatStage = 'landing' | 'onboarding' | 'demo' | 'customer' | 'support';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LeadData {
  role?: string;
  numPHs?: number;
  assembliesPerYear?: number;
  currentPainPoint?: string;
  budget?: string;
}

export interface UserContext {
  id: string;
  telegramId: string;
  stage: ChatStage;
  messages: ChatMessage[];
  leadData: LeadData;
  leadQualified: boolean;
  convertedToDemo: boolean;
  convertedToPaid: boolean;
}

// ============================================
// FUNCIONES
// ============================================

/**
 * Obtener o crear contexto de un usuario de Telegram
 */
export async function getUserContext(telegramId: string): Promise<UserContext> {
  const { data, error } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !data) {
    // Crear nuevo contexto
    const newContext = {
      telegram_id: telegramId,
      session_id: `tg_${telegramId}_${Date.now()}`,
      stage: 'landing' as ChatStage,
      messages: [] as ChatMessage[],
      lead_data: {} as LeadData,
      lead_qualified: false,
      converted_to_demo: false,
      converted_to_paid: false,
    };

    const { data: created, error: createError } = await supabase
      .from('chatbot_conversations')
      .insert(newContext)
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      throw new Error('Failed to create conversation');
    }

    return {
      id: created.id,
      telegramId: created.telegram_id,
      stage: created.stage,
      messages: created.messages || [],
      leadData: created.lead_data || {},
      leadQualified: created.lead_qualified,
      convertedToDemo: created.converted_to_demo,
      convertedToPaid: created.converted_to_paid,
    };
  }

  return {
    id: data.id,
    telegramId: data.telegram_id,
    stage: data.stage,
    messages: data.messages || [],
    leadData: data.lead_data || {},
    leadQualified: data.lead_qualified,
    convertedToDemo: data.converted_to_demo,
    convertedToPaid: data.converted_to_paid,
  };
}

/**
 * Guardar mensaje en la conversación
 */
export async function saveMessage(
  telegramId: string,
  userMessage: string,
  botResponse: string
): Promise<void> {
  const context = await getUserContext(telegramId);

  const updatedMessages: ChatMessage[] = [
    ...context.messages,
    {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString(),
    },
  ];

  const { error } = await supabase
    .from('chatbot_conversations')
    .update({
      messages: updatedMessages,
      last_message_at: new Date().toISOString(),
    })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Error saving message:', error);
  }
}

/**
 * Actualizar stage del usuario
 */
export async function updateStage(
  telegramId: string,
  newStage: ChatStage
): Promise<void> {
  const { error } = await supabase
    .from('chatbot_conversations')
    .update({ stage: newStage })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Error updating stage:', error);
  }
}

/**
 * Actualizar datos del lead
 */
export async function updateLeadData(
  telegramId: string,
  leadData: Partial<LeadData>
): Promise<void> {
  const context = await getUserContext(telegramId);

  const updatedLeadData = {
    ...context.leadData,
    ...leadData,
  };

  // Determinar si el lead está calificado
  const isQualified =
    updatedLeadData.role &&
    (updatedLeadData.numPHs || updatedLeadData.assembliesPerYear) &&
    updatedLeadData.currentPainPoint;

  const { error } = await supabase
    .from('chatbot_conversations')
    .update({
      lead_data: updatedLeadData,
      lead_qualified: !!isQualified,
    })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Error updating lead data:', error);
  }
}

/**
 * Marcar conversión a demo
 */
export async function markDemoConversion(
  telegramId: string,
  demoAccountId?: string
): Promise<void> {
  const { error } = await supabase
    .from('chatbot_conversations')
    .update({
      converted_to_demo: true,
      demo_account_id: demoAccountId || null,
    })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Error marking demo conversion:', error);
  }

  // Registrar acción
  await logAction(telegramId, 'demo_created', { demo_account_id: demoAccountId });
}

/**
 * Registrar acción del chatbot
 */
export async function logAction(
  telegramId: string,
  actionType: string,
  actionData?: any
): Promise<void> {
  const context = await getUserContext(telegramId);

  const { error } = await supabase.from('chatbot_actions').insert({
    conversation_id: context.id,
    action_type: actionType,
    action_data: actionData || {},
    success: true,
  });

  if (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Obtener historial de mensajes formateado para Gemini
 */
export function formatMessagesForGemini(messages: ChatMessage[]): string {
  return messages
    .slice(-10) // Solo últimos 10 mensajes para no saturar el contexto
    .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
    .join('\n');
}

/**
 * Crear ticket y escalar a humano
 */
export async function createTicketAndEscalate(
  telegramId: string,
  userMessage: string,
  reason: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
): Promise<string> {
  const context = await getUserContext(telegramId);
  
  // Crear o actualizar lead
  const { data: lead } = await supabase
    .from('platform_leads')
    .upsert({
      email: `telegram_${telegramId}@temp.assembly20.com`,
      telegram_id: telegramId,
      lead_source: 'chatbot',
      funnel_stage: 'new_lead',
      last_interaction_at: new Date().toISOString(),
      chatbot_conversation_id: context.id,
    }, { onConflict: 'email' })
    .select('id')
    .single();

  const leadId = lead?.id;

  // Detectar categoría
  const lowerMessage = userMessage.toLowerCase();
  let category = 'general';
  if (lowerMessage.match(/legal|ley|abogado/)) category = 'legal';
  else if (lowerMessage.match(/pago|cobro|factura/)) category = 'billing';
  else if (lowerMessage.match(/error|bug|no funciona/)) category = 'technical';
  else if (lowerMessage.match(/precio|plan|costo/)) category = 'sales';

  // Crear ticket
  const { data: ticket, error } = await supabase
    .from('platform_tickets')
    .insert({
      lead_id: leadId,
      source: 'chatbot',
      channel: context.stage,
      subject: `${reason} - Telegram`,
      description: userMessage,
      priority: priority,
      category: category,
      assigned_to_admin: true,
      escalation_reason: reason,
      messages: [{
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      }],
    })
    .select('ticket_number')
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    return 'ERROR';
  }

  return ticket?.ticket_number || 'TKT-UNKNOWN';
}
```

---

### **4.4 Archivo: `src/chatbot/utils/gemini.ts`**

Integración con Google Gemini:

```typescript
// src/chatbot/utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHATBOT_CONFIG, CONTEXT_PROMPTS } from '../config';
import type { ChatStage } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generar respuesta del chatbot usando Gemini
 */
export async function generateResponse(
  stage: ChatStage,
  userMessage: string,
  conversationHistory: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: CHATBOT_CONFIG.gemini.model,
    });

    // Construir prompt completo
    const systemPrompt = CONTEXT_PROMPTS[stage];
    const fullPrompt = `${systemPrompt}

${conversationHistory ? `Historial de conversación:\n${conversationHistory}\n` : ''}
Usuario: ${userMessage}

Asistente:`;

    // Generar contenido
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: CHATBOT_CONFIG.gemini.temperature,
        maxOutputTokens: CHATBOT_CONFIG.gemini.maxTokens,
      },
    });

    const response = result.response;
    const text = response.text();

    return text.trim();
  } catch (error: any) {
    console.error('Error generating response with Gemini:', error);

    // Manejo de errores específicos
    if (error.message?.includes('quota')) {
      return 'Disculpa, estoy experimentando un alto volumen de consultas. ¿Puedes intentar en unos minutos?';
    }

    if (error.message?.includes('safety')) {
      return 'No puedo responder a eso. ¿Tienes otra pregunta sobre Assembly 2.0?';
    }

    return 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu pregunta?';
  }
}

/**
 * Detectar intención del usuario (para acciones especiales)
 */
export function detectIntent(message: string): {
  intent: string;
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();

  // Intenciones detectables
  const intents = [
    {
      name: 'request_demo',
      keywords: ['demo', 'prueba', 'probar', 'activar', 'empezar'],
      threshold: 0.8,
    },
    {
      name: 'ask_pricing',
      keywords: ['precio', 'costo', 'cuanto', 'pagar', 'planes'],
      threshold: 0.8,
    },
    {
      name: 'request_human',
      keywords: ['humano', 'persona', 'ventas', 'hablar', 'llamar'],
      threshold: 0.7,
    },
    {
      name: 'ask_features',
      keywords: ['funciona', 'como', 'que hace', 'característica', 'feature'],
      threshold: 0.6,
    },
  ];

  for (const intent of intents) {
    const matches = intent.keywords.filter((keyword) =>
      lowerMessage.includes(keyword)
    ).length;

    const confidence = matches / intent.keywords.length;

    if (confidence >= intent.threshold) {
      return { intent: intent.name, confidence };
    }
  }

  return { intent: 'unknown', confidence: 0 };
}
```

---

### **4.5 Archivo Principal: `src/chatbot/index.ts`**

El bot principal que integra todo:

```typescript
// src/chatbot/index.ts
import TelegramBot from 'node-telegram-bot-api';
import { generateResponse, detectIntent } from './utils/gemini';
import {
  getUserContext,
  saveMessage,
  updateStage,
  updateLeadData,
  markDemoConversion,
  logAction,
  formatMessagesForGemini,
} from './utils/supabase';
import { CHATBOT_CONFIG, QUICK_REPLIES } from './config';

// Inicializar bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: true,
});

console.log('🤖 Chatbot Assembly 2.0 iniciado con éxito!');

// ============================================
// COMANDO: /start
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id.toString() || '';

  try {
    const context = await getUserContext(telegramId);

    const welcomeMessage = `¡Hola! 👋 Soy Lex, el asistente inteligente de **Assembly 2.0**.

Te ayudo a descubrir cómo digitalizar y legalizar tus asambleas de Propiedades Horizontales.

¿Eres administrador de PHs o trabajas con una promotora?`;

    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['Soy Administrador', 'Trabajo en Promotora'],
          ['Soy Propietario', 'Solo estoy explorando'],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    // Guardar mensaje de bienvenida
    await saveMessage(telegramId, '/start', welcomeMessage);
  } catch (error) {
    console.error('Error en /start:', error);
    await bot.sendMessage(chatId, 'Disculpa, tuve un problema. Intenta de nuevo con /start');
  }
});

// ============================================
// COMANDO: /demo
// ============================================

bot.onText(/\/demo/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id.toString() || '';

  try {
    const demoLink = CHATBOT_CONFIG.urls.demoSignup;

    await bot.sendMessage(
      chatId,
      `🎉 ¡Perfecto! Vamos a activar tu Demo GRATIS.

Entra aquí para registrarte: ${demoLink}

El Demo incluye:
✅ 1 PH con 50 unidades pre-cargadas
✅ Simulación completa de asamblea
✅ Acceso por 14 días
✅ Todas las funcionalidades desbloqueadas

¿Tienes alguna duda antes de empezar?`,
      { parse_mode: 'Markdown' }
    );

    // Cambiar stage a onboarding
    await updateStage(telegramId, 'onboarding');
    await logAction(telegramId, 'demo_requested');
  } catch (error) {
    console.error('Error en /demo:', error);
  }
});

// ============================================
// COMANDO: /ayuda
// ============================================

bot.onText(/\/ayuda/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `🆘 **Comandos disponibles:**

/start - Iniciar conversación
/demo - Activar Demo GRATIS
/ayuda - Ver este mensaje
/soporte - Contactar soporte humano

También puedes preguntarme cualquier cosa sobre Assembly 2.0. ¿En qué te ayudo?`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// COMANDO: /soporte
// ============================================

bot.onText(/\/soporte/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `📞 **Contactar Soporte Humano**

Puedes escribirnos a:
📧 Email: soporte@assembly20.com
📱 WhatsApp: +507 6XXX-XXXX
🌐 Web: ${CHATBOT_CONFIG.urls.support}

Horario: Lunes a Viernes, 8am - 6pm (Panamá)

¿Prefieres que te siga ayudando yo mientras esperas?`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// MANEJO DE MENSAJES
// ============================================

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const telegramId = msg.from?.id.toString() || '';

  // Ignorar comandos (ya se manejan arriba)
  if (!userMessage || userMessage.startsWith('/')) {
    return;
  }

  try {
    // Obtener contexto del usuario
    const context = await getUserContext(telegramId);

    // ✅ PASO 1: Identificar tipo de usuario (PRIMERO, siempre)
    const userType = identifyUserType(userMessage, context);
    
    // ✅ PASO 2: Verificar si requiere escalación (considerando el tipo)
    const { shouldEscalate, reason, priority } = requiresEscalation(
      userMessage,
      userType,
      context
    );
    
    if (shouldEscalate) {
      // Crear ticket y escalar
      const ticketId = await createTicketAndEscalate(telegramId, userMessage, reason, priority);
      
      await bot.sendMessage(chatId, 
        `Entiendo que esto requiere atención especializada.

He creado un ticket ${priority === 'urgent' ? 'URGENTE' : ''} (${ticketId}).
Un asesor te contactará en 1-2 horas.

Mientras tanto, ¿hay algo más en lo que pueda ayudarte?`,
        { parse_mode: 'Markdown' }
      );
      
      await logAction(telegramId, 'escalated_to_human', { reason, priority, ticketId });
      return;
    }
    
    // ✅ NUEVO: Buscar en base de conocimiento primero
    const knowledgeEntry = searchKnowledge(userMessage, userType);
    
    if (knowledgeEntry) {
      // Responder directamente de knowledge base (sin llamar a Gemini = más rápido)
      const adaptedAnswer = adaptResponseToUser(knowledgeEntry.answer, userType);
      
      await bot.sendMessage(chatId, adaptedAnswer, { parse_mode: 'Markdown' });
      await saveMessage(telegramId, userMessage, adaptedAnswer);
      
      // Log de que se resolvió con knowledge base
      await logAction(telegramId, 'answered_from_kb', { entryId: knowledgeEntry.id });
      return;
    }

    // Detectar intención especial
    const { intent } = detectIntent(userMessage);

    // Manejar intenciones especiales
    if (intent === 'request_demo') {
      await bot.sendMessage(
        chatId,
        '¡Genial! Usa el comando /demo para activar tu Demo GRATIS 🎉'
      );
      return;
    }

    if (intent === 'ask_pricing') {
      await bot.sendMessage(
        chatId,
        `💰 **Planes de Assembly 2.0:**

🆓 Demo: GRATIS (14 días)
📋 Por Asamblea: $49 por evento
⭐ Standard: $99/mes (hasta 12 asambleas/año)
🏢 Pro Multi-PH: $349/mes (PHs ilimitados)
🏆 Enterprise: Consultar (promotoras grandes)

Ver más detalles: ${CHATBOT_CONFIG.urls.pricing}

¿Cuántas asambleas haces al año? Te ayudo a elegir el mejor plan.`,
        { parse_mode: 'Markdown' }
      );
      await logAction(telegramId, 'pricing_requested');
      return;
    }

    if (intent === 'request_human') {
      await bot.sendMessage(
        chatId,
        'Perfecto, usa el comando /soporte para contactar con nuestro equipo humano 👥'
      );
      return;
    }

    // Formatear historial
    const conversationHistory = formatMessagesForGemini(context.messages);

    // Generar respuesta con Gemini
    const botResponse = await generateResponse(
      context.stage,
      userMessage,
      conversationHistory
    );

    // Enviar respuesta
    await bot.sendMessage(chatId, botResponse, {
      parse_mode: 'Markdown',
    });

    // Guardar en BD
    await saveMessage(telegramId, userMessage, botResponse);

    // Analizar respuesta del usuario para extraer lead data
    await extractLeadData(telegramId, userMessage);
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    await bot.sendMessage(
      chatId,
      'Disculpa, tuve un problema técnico. ¿Puedes repetir tu mensaje?'
    );
  }
});

// ============================================
// FUNCIÓN AUXILIAR: Extraer datos del lead
// ============================================

async function extractLeadData(
  telegramId: string,
  userMessage: string
): Promise<void> {
  const lowerMessage = userMessage.toLowerCase();

  // Detectar rol
  if (lowerMessage.includes('administrador') || lowerMessage.includes('administro')) {
    await updateLeadData(telegramId, { role: 'Administrador' });
  } else if (lowerMessage.includes('promotora') || lowerMessage.includes('desarrolladora')) {
    await updateLeadData(telegramId, { role: 'Promotora' });
  } else if (lowerMessage.includes('propietario')) {
    await updateLeadData(telegramId, { role: 'Propietario' });
  }

  // Detectar número de PHs (ej: "administro 8 phs")
  const numPHsMatch = userMessage.match(/(\d+)\s*(ph|propiedad|edificio)/i);
  if (numPHsMatch) {
    await updateLeadData(telegramId, { numPHs: parseInt(numPHsMatch[1]) });
  }

  // Detectar asambleas al año (ej: "hago 12 asambleas")
  const assembliesMatch = userMessage.match(/(\d+)\s*(asamblea|reunion)/i);
  if (assembliesMatch) {
    await updateLeadData(telegramId, { assembliesPerYear: parseInt(assembliesMatch[1]) });
  }

  // Detectar pain points comunes
  const painPoints = [
    'tiempo',
    'caos',
    'desconfianza',
    'errores',
    'quorum',
    'poderes',
    'transparencia',
  ];

  for (const pain of painPoints) {
    if (lowerMessage.includes(pain)) {
      await updateLeadData(telegramId, { currentPainPoint: pain });
      break;
    }
  }
}

// ============================================
// MANEJO DE ERRORES
// ============================================

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('Deteniendo bot...');
  bot.stopPolling();
  process.exit(0);
});
```

---

## 🚀 PASO 5: EJECUTAR Y PROBAR EL BOT (30 minutos)

### **5.1 Verificar Variables de Entorno**

```bash
# Verificar que las keys están configuradas
cat .env.local | grep TELEGRAM_BOT_TOKEN
cat .env.local | grep GEMINI_API_KEY
```

Si ves las keys, ¡estás listo!

---

### **5.2 Ejecutar el Bot**

En la terminal:

```bash
npm run chatbot
```

Deberías ver:
```
🤖 Chatbot Assembly 2.0 iniciado con éxito!
```

---

### **5.3 Probar en Telegram**

1. Abre Telegram en tu teléfono/computadora
2. Busca tu bot (el username que creaste, ej: `@assembly20_assistant_bot`)
3. Inicia conversación
4. Envía: `/start`

**Debería responder:**
> ¡Hola! 👋 Soy Lex, el asistente inteligente de **Assembly 2.0**...

---

### **5.4 Escenarios de Prueba**

**Test 1: Calificación de Lead (Landing)**
```
Usuario: /start
Bot: [Mensaje de bienvenida]

Usuario: Soy administrador de 8 propiedades
Bot: [Pregunta sobre asambleas al año]

Usuario: Hago como 20 asambleas al año
Bot: [Muestra beneficios y ofrece demo]

Usuario: ¿Cuánto cuesta?
Bot: [Muestra planes y recomienda Standard]
```

**Test 2: Activar Demo**
```
Usuario: /demo
Bot: [Link al registro + instrucciones]
```

**Test 3: Soporte**
```
Usuario: ¿Cómo funciona el quórum?
Bot: [Explicación técnica]

Usuario: Tengo un problema, necesito hablar con alguien
Bot: [Detecta intención y ofrece /soporte]
```

---

### **5.5 Verificar en Supabase**

Ve a Supabase → Table Editor → `chatbot_conversations`

Deberías ver:
- Tu conversación con `telegram_id`
- Campo `messages` con el historial
- Campo `lead_data` actualizándose según hablas

---

## 📊 PASO 6: DASHBOARD DE ANALYTICS (Opcional - 30 min)

### **6.1 Crear Página de Analytics**

Archivo: `src/app/admin/chatbot/page.tsx`

```typescript
// src/app/admin/chatbot/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatbotAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
    loadConversations();
  }, []);

  async function loadMetrics() {
    const { data } = await supabase
      .from('chatbot_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      setMetrics(data[0]);
    }
  }

  async function loadConversations() {
    const { data } = await supabase
      .from('chatbot_active_conversations')
      .select('*')
      .limit(20);

    setConversations(data || []);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Analytics del Chatbot</h1>

      {/* Métricas Principales */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Conversaciones Hoy"
            value={metrics.new_conversations}
            icon="💬"
          />
          <MetricCard
            title="Leads Calificados"
            value={metrics.leads_qualified}
            icon="✅"
          />
          <MetricCard
            title="Demos Activados"
            value={metrics.demos_created}
            icon="🎯"
          />
          <MetricCard
            title="Conversiones Pagadas"
            value={metrics.conversions_to_paid}
            icon="💰"
          />
        </div>
      )}

      {/* Conversaciones Activas */}
      <h2 className="text-2xl font-bold mb-4">Conversaciones Activas</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Telegram ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mensajes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Calificado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Última Actividad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conversations.map((conv) => (
              <tr key={conv.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {conv.telegram_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(
                      conv.stage
                    )}`}
                  >
                    {conv.stage}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {conv.message_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {conv.lead_qualified ? '✅' : '⏳'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.round(conv.minutes_since_last_message)} min atrás
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function getStageColor(stage: string): string {
  const colors: any = {
    landing: 'bg-blue-100 text-blue-800',
    onboarding: 'bg-yellow-100 text-yellow-800',
    demo: 'bg-purple-100 text-purple-800',
    customer: 'bg-green-100 text-green-800',
    support: 'bg-red-100 text-red-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
}
```

---

## ✅ CHECKLIST FINAL

### **Configuración**
- [ ] Bot creado en Telegram (@BotFather)
- [ ] Gemini API key obtenida (aistudio.google.com)
- [ ] Variables en `.env.local` configuradas
- [ ] Dependencias instaladas (`npm install`)

### **Base de Datos**
- [ ] Tablas creadas en Supabase
- [ ] Verificado que `chatbot_conversations` existe
- [ ] Verificado que `chatbot_actions` existe
- [ ] Verificado que `chatbot_metrics` existe
- [ ] Tabla `platform_leads` creada (para TAREA 3)
- [ ] Tabla `platform_tickets` creada (para escalación)

### **Código**
- [ ] ✅ Archivo `src/chatbot/knowledge-base.ts` creado **(NUEVO)**
- [ ] Archivo `src/chatbot/config.ts` creado
- [ ] Archivo `src/chatbot/utils/supabase.ts` creado
- [ ] Archivo `src/chatbot/utils/gemini.ts` creado
- [ ] Archivo `src/chatbot/index.ts` creado
- [ ] ✅ Función `createTicketAndEscalate` agregada **(NUEVO)**
- [ ] ✅ Función `identifyUserType` implementada **(NUEVO)**
- [ ] ✅ Función `searchKnowledge` implementada **(NUEVO)**

### **Testing**
- [ ] Bot responde a `/start`
- [ ] Bot responde a `/demo`
- [ ] Bot responde a mensajes normales
- [ ] ✅ Bot identifica tipo de usuario correctamente **(NUEVO)**
- [ ] ✅ Bot responde de knowledge base sin llamar a Gemini **(NUEVO)**
- [ ] ✅ Bot escala automáticamente temas legales **(NUEVO)**
- [ ] ✅ Tickets se crean en platform_tickets **(NUEVO)**
- [ ] Conversaciones se guardan en Supabase
- [ ] Lead data se actualiza según las respuestas

### **Validación de Knowledge Base**
- [ ] Test: "¿Qué es Assembly 2.0?" → Respuesta instantánea de KB
- [ ] Test: "¿Cómo voto?" (como propietario) → Respuesta adaptada
- [ ] Test: "Necesito un abogado" → Escala y crea ticket urgente
- [ ] Test: "¿Cuánto cuesta?" → Muestra pricing y pregunta asambleas/año

### **Opcional**
- [ ] Dashboard de analytics creado
- [ ] Comandos personalizados configurados en @BotFather
- [ ] Imagen de perfil del bot subida
- [ ] Sistema de notificaciones email para tickets urgentes

---

## 🚨 TROUBLESHOOTING

### **Problema 1: Bot no responde**

**Síntoma**: Envías mensajes y no pasa nada

**Soluciones**:
```bash
# 1. Verificar que el bot está corriendo
ps aux | grep chatbot

# 2. Ver logs en consola
npm run chatbot

# 3. Verificar token de Telegram
curl https://api.telegram.org/bot<TU-TOKEN>/getMe
# Debería devolver información del bot
```

---

### **Problema 2: Error "GEMINI_API_KEY is not defined"**

**Solución**:
```bash
# 1. Verificar que existe en .env.local
cat .env.local | grep GEMINI

# 2. Si no existe, agregarla:
echo "GEMINI_API_KEY=tu-key-aqui" >> .env.local

# 3. Reiniciar el bot
```

---

### **Problema 3: Gemini responde "quota exceeded"**

**Causa**: Superaste el límite de 15 requests/minuto

**Solución**:
```typescript
// En src/chatbot/utils/gemini.ts, agregar rate limiting:

const lastRequestTime: { [key: string]: number } = {};

export async function generateResponse(...) {
  const telegramId = 'user-id'; // Pasar como parámetro
  const now = Date.now();
  const lastRequest = lastRequestTime[telegramId] || 0;
  
  if (now - lastRequest < 4000) { // 4 segundos entre requests
    return 'Por favor espera un momento antes de enviar otro mensaje 🙏';
  }
  
  lastRequestTime[telegramId] = now;
  
  // ... resto del código
}
```

---

### **Problema 4: No se guardan conversaciones en Supabase**

**Solución**:
```bash
# 1. Verificar conexión a Supabase
curl <SUPABASE_URL>/rest/v1/

# 2. Verificar que SUPABASE_SERVICE_KEY está configurada
# 3. Ver logs de error en consola del bot
```

---

## 🎯 PRÓXIMOS PASOS

Una vez funcione el bot de Telegram:

1. **Ajustar prompts** según las conversaciones reales
2. **Agregar más intenciones** detectables
3. **Implementar Widget Web** (Fase 2)
4. **Agregar RAG con embeddings** (Fase 3)

---

## ✅ TAREA COMPLETADA

Cuando hayas terminado, notifica al Arquitecto con:

- ✅ Capturas de pantalla de conversaciones funcionando
- ✅ Screenshot de Supabase con conversaciones guardadas
- ✅ Métricas del primer día de uso

**¡Excelente trabajo! El chatbot está listo para convertir visitantes en clientes 🚀**
