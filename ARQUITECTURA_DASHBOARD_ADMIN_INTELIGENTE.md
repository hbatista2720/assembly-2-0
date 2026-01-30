# 🎛️ DASHBOARD ADMINISTRATIVO INTELIGENTE - ASSEMBLY 2.0
## Sistema de Gestión con Automatización Total

---

## 🎯 OBJETIVO DEL DASHBOARD

Crear un **centro de comando inteligente** para el dueño de la plataforma que:
- ✅ Funciona en **piloto automático** (90% automatizado)
- ✅ Solo requiere **monitoreo ocasional** (15 min/día)
- ✅ **Escala a humano** solo cuando es crítico
- ✅ Gestiona todo el ciclo: Lead → Demo → Cliente → Soporte
- ✅ **Alertas inteligentes** cuando necesita atención

---

## 📊 ESTRUCTURA DEL DASHBOARD (7 Módulos)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 ASSEMBLY 2.0 - ADMIN DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📈 Funnel    │  │ 🎫 Tickets   │  │ 👥 Clientes  │     │
│  │ Conversión   │  │ (3 Urgentes) │  │ 45 Activos   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  MÓDULOS:                                                   │
│  ├── 1️⃣ Funnel de Leads (Conversión Automática)           │
│  ├── 2️⃣ Sistema de Tickets Inteligente                    │
│  ├── 3️⃣ Gestión de Clientes y Leads                       │
│  ├── 4️⃣ Administración de Precios                         │
│  ├── 5️⃣ CRM y Campañas Automatizadas                      │
│  ├── 6️⃣ Canal de Soporte Multi-Cliente                    │
│  └── 7️⃣ Configuración del Chatbot                         │
│                                                             │
│  🔔 ALERTAS: 2 requieren atención                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ARQUITECTURA DE DATOS (Nuevas Tablas)

### **Tabla 1: `platform_leads` (Funnel de Leads)**

```sql
CREATE TABLE platform_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del Lead
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  
  -- Clasificación
  lead_source TEXT NOT NULL, -- 'chatbot', 'landing_form', 'manual', 'referral'
  lead_type TEXT NOT NULL CHECK (lead_type IN ('administrador', 'promotora', 'propietario', 'otro')),
  
  -- Calificación (del chatbot)
  lead_score INT DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_qualified BOOLEAN DEFAULT FALSE,
  qualification_data JSONB DEFAULT '{}'::jsonb, -- {numPHs, assembliesPerYear, painPoints, budget}
  
  -- Etapa del Funnel
  funnel_stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (
    funnel_stage IN ('new_lead', 'qualified', 'demo_activated', 'demo_active', 'demo_expired', 'converted_paid', 'churned', 'lost')
  ),
  
  -- Conversión
  demo_activated_at TIMESTAMPTZ NULL,
  demo_account_id UUID NULL,
  converted_to_paid_at TIMESTAMPTZ NULL,
  subscription_id UUID NULL,
  
  -- Engagement
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  total_interactions INT DEFAULT 0,
  chatbot_conversation_id UUID REFERENCES chatbot_conversations(id),
  
  -- Metadata
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON platform_leads(email);
CREATE INDEX idx_leads_funnel_stage ON platform_leads(funnel_stage);
CREATE INDEX idx_leads_score ON platform_leads(lead_score DESC);
CREATE INDEX idx_leads_qualified ON platform_leads(lead_qualified) WHERE lead_qualified = TRUE;
CREATE INDEX idx_leads_source ON platform_leads(lead_source);
CREATE INDEX idx_leads_last_interaction ON platform_leads(last_interaction_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_platform_leads_updated_at
BEFORE UPDATE ON platform_leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### **Tabla 2: `platform_tickets` (Sistema de Tickets)**

```sql
CREATE TABLE platform_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL, -- 'TKT-2024-0001'
  
  -- Relaciones
  lead_id UUID REFERENCES platform_leads(id) NULL,
  customer_id UUID REFERENCES auth.users(id) NULL, -- Si es cliente existente
  assigned_to_admin BOOLEAN DEFAULT FALSE,
  
  -- Origen
  source TEXT NOT NULL CHECK (source IN ('chatbot', 'email', 'phone', 'manual')),
  channel TEXT NOT NULL CHECK (channel IN ('landing', 'demo', 'customer_support', 'crm')),
  
  -- Contenido
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL, -- 'technical', 'billing', 'legal', 'sales', 'product_feedback'
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'escalated')
  ),
  
  -- Automatización
  auto_resolved BOOLEAN DEFAULT FALSE,
  resolution_attempted_by_bot BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT NULL,
  
  -- Resolución
  resolved_by TEXT NULL, -- 'bot' o 'admin_name'
  resolution_notes TEXT NULL,
  resolved_at TIMESTAMPTZ NULL,
  
  -- SLA
  response_due_at TIMESTAMPTZ NULL,
  resolution_due_at TIMESTAMPTZ NULL,
  first_response_at TIMESTAMPTZ NULL,
  
  -- Historial de mensajes
  messages JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_number ON platform_tickets(ticket_number);
CREATE INDEX idx_tickets_status ON platform_tickets(status);
CREATE INDEX idx_tickets_priority ON platform_tickets(priority);
CREATE INDEX idx_tickets_assigned ON platform_tickets(assigned_to_admin) WHERE assigned_to_admin = TRUE;
CREATE INDEX idx_tickets_created ON platform_tickets(created_at DESC);
CREATE INDEX idx_tickets_due ON platform_tickets(resolution_due_at) WHERE status IN ('open', 'in_progress');

-- Función para generar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_number INT;
  ticket_num TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM platform_tickets WHERE DATE(created_at) = CURRENT_DATE;
  ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
BEFORE INSERT ON platform_tickets
FOR EACH ROW EXECUTE FUNCTION set_ticket_number();
```

---

### **Tabla 3: `crm_campaigns` (Campañas Automatizadas)**

```sql
CREATE TABLE crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuración
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (
    campaign_type IN ('lead_nurture', 'demo_reminder', 'conversion_push', 'retention', 'winback', 'upsell')
  ),
  
  -- Targeting
  target_funnel_stage TEXT[], -- ['qualified', 'demo_expired']
  target_lead_score_min INT DEFAULT 0,
  target_lead_score_max INT DEFAULT 100,
  target_days_inactive_min INT NULL, -- Ej: leads inactivos por >7 días
  
  -- Contenido
  message_template TEXT NOT NULL, -- Plantilla con variables: {{name}}, {{demo_link}}
  channel TEXT NOT NULL CHECK (channel IN ('chatbot', 'email', 'sms', 'in_app')),
  
  -- Automatización
  is_active BOOLEAN DEFAULT TRUE,
  auto_send BOOLEAN DEFAULT TRUE,
  send_frequency TEXT DEFAULT 'once' CHECK (send_frequency IN ('once', 'daily', 'weekly', 'monthly')),
  max_sends_per_lead INT DEFAULT 1,
  
  -- Timing
  trigger_condition TEXT NOT NULL, -- 'demo_expired_3_days', 'lead_qualified', 'inactive_7_days'
  delay_hours INT DEFAULT 0, -- Retraso después del trigger
  
  -- Performance
  total_sent INT DEFAULT 0,
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_converted INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_campaigns_active ON crm_campaigns(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_campaigns_type ON crm_campaigns(campaign_type);
```

---

### **Tabla 4: `crm_campaign_logs` (Historial de Envíos)**

```sql
CREATE TABLE crm_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID REFERENCES crm_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES platform_leads(id),
  
  -- Envío
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  channel TEXT NOT NULL,
  message_content TEXT NOT NULL,
  
  -- Engagement
  opened_at TIMESTAMPTZ NULL,
  clicked_at TIMESTAMPTZ NULL,
  converted_at TIMESTAMPTZ NULL,
  
  -- Resultado
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'converted', 'failed')),
  error_message TEXT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_logs_campaign ON crm_campaign_logs(campaign_id);
CREATE INDEX idx_campaign_logs_lead ON crm_campaign_logs(lead_id);
CREATE INDEX idx_campaign_logs_status ON crm_campaign_logs(status);
```

---

### **Tabla 5: `platform_subscriptions` (Gestión de Suscripciones)**

```sql
CREATE TABLE platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cliente
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES platform_leads(id) NULL,
  
  -- Plan
  plan_id TEXT NOT NULL, -- 'demo', 'por_asamblea', 'standard', 'pro', 'enterprise'
  plan_name TEXT NOT NULL,
  
  -- Pricing
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual', 'pay_per_use')),
  price_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('trial', 'active', 'past_due', 'canceled', 'paused')
  ),
  
  -- Fechas
  trial_start_date TIMESTAMPTZ NULL,
  trial_end_date TIMESTAMPTZ NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ NULL,
  cancellation_reason TEXT NULL,
  
  -- Límites del Plan
  plan_limits JSONB DEFAULT '{}'::jsonb, -- {max_phs: 1, max_assemblies_per_month: 12, max_users: 5}
  usage_current_period JSONB DEFAULT '{}'::jsonb, -- {assemblies_used: 3, users_created: 2}
  
  -- Pagos
  last_payment_at TIMESTAMPTZ NULL,
  next_payment_at TIMESTAMPTZ NULL,
  payment_method TEXT NULL,
  
  -- Metadata
  stripe_subscription_id TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_customer ON platform_subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON platform_subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON platform_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_next_payment ON platform_subscriptions(next_payment_at);
```

---

### **Tabla 6: `chatbot_config` (Configuración del Chatbot)**

```sql
CREATE TABLE chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contexto
  context_name TEXT UNIQUE NOT NULL, -- 'landing', 'onboarding', 'demo', 'conversion', 'customer', 'support'
  
  -- Prompts
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NULL,
  fallback_message TEXT NULL,
  
  -- Configuración de IA
  ai_model TEXT DEFAULT 'gemini-1.5-flash',
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INT DEFAULT 500,
  
  -- Comportamiento
  auto_escalate_keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['legal', 'demanda', 'abogado']
  escalation_threshold INT DEFAULT 3, -- Intentos antes de escalar
  
  -- Quick Replies
  quick_replies JSONB DEFAULT '[]'::jsonb, -- ["Ver Demo", "Ver Precios"]
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Versión
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO chatbot_config (context_name, system_prompt, welcome_message) VALUES
('landing', 'Eres Lex, asistente de Assembly 2.0. Califica leads y guíalos al Demo.', '¡Hola! 👋 Soy Lex. ¿Eres administrador de PHs o trabajas con una promotora?'),
('onboarding', 'Eres el tutor de onboarding. Guía paso a paso al usuario.', '¡Perfecto! Vamos a activar tu Demo en 3 pasos...'),
('demo', 'Eres el guía del Demo. Muestra el valor en <10 minutos.', '¡Bienvenido a tu primera asamblea virtual!'),
('conversion', 'Eres el consultor de conversión. Muestra ROI y cierra ventas.', '¡Completaste el Demo! 🎉 Déjame mostrarte algo interesante...'),
('customer', 'Eres el soporte técnico. Resuelve dudas rápidamente.', 'Hola, ¿en qué te puedo ayudar hoy?'),
('support', 'Eres el triaje de soporte. Clasifica y escala cuando sea necesario.', 'Veo que necesitas ayuda. Cuéntame qué sucede.');
```

---

### **Tabla 7: `platform_alerts` (Alertas Inteligentes)**

```sql
CREATE TABLE platform_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de Alerta
  alert_type TEXT NOT NULL CHECK (
    alert_type IN ('ticket_urgent', 'lead_hot', 'subscription_expiring', 'payment_failed', 'high_churn_risk', 'system_error')
  ),
  
  -- Contenido
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  -- Contexto
  related_entity_type TEXT NULL, -- 'ticket', 'lead', 'subscription'
  related_entity_id UUID NULL,
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMPTZ NULL,
  acknowledged_by TEXT NULL,
  resolved_at TIMESTAMPTZ NULL,
  
  -- Acciones Sugeridas
  suggested_actions JSONB DEFAULT '[]'::jsonb, -- [{"action": "contact_lead", "label": "Llamar al lead"}]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON platform_alerts(status) WHERE status = 'active';
CREATE INDEX idx_alerts_severity ON platform_alerts(severity);
CREATE INDEX idx_alerts_type ON platform_alerts(alert_type);
```

---

## 🚀 MÓDULO 1: FUNNEL DE CONVERSIÓN AUTOMÁTICO

### **Vista: Dashboard de Funnel**

```sql
CREATE OR REPLACE VIEW platform_funnel_stats AS
SELECT
  -- Contadores por Stage
  COUNT(*) FILTER (WHERE funnel_stage = 'new_lead') as new_leads,
  COUNT(*) FILTER (WHERE funnel_stage = 'qualified') as qualified_leads,
  COUNT(*) FILTER (WHERE funnel_stage = 'demo_activated') as demos_activated,
  COUNT(*) FILTER (WHERE funnel_stage = 'demo_active') as demos_active,
  COUNT(*) FILTER (WHERE funnel_stage = 'converted_paid') as paid_customers,
  COUNT(*) FILTER (WHERE funnel_stage = 'lost') as lost_leads,
  
  -- Tasas de Conversión
  ROUND(
    COUNT(*) FILTER (WHERE funnel_stage = 'qualified')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE funnel_stage IN ('new_lead', 'qualified')), 0) * 100, 
    2
  ) as lead_to_qualified_rate,
  
  ROUND(
    COUNT(*) FILTER (WHERE funnel_stage IN ('demo_activated', 'demo_active'))::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE funnel_stage IN ('qualified', 'demo_activated', 'demo_active')), 0) * 100, 
    2
  ) as qualified_to_demo_rate,
  
  ROUND(
    COUNT(*) FILTER (WHERE funnel_stage = 'converted_paid')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE funnel_stage IN ('demo_activated', 'demo_active', 'converted_paid')), 0) * 100, 
    2
  ) as demo_to_paid_rate,
  
  -- Métricas de Tiempo
  AVG(EXTRACT(EPOCH FROM (demo_activated_at - created_at)) / 3600) FILTER (WHERE demo_activated_at IS NOT NULL) as avg_hours_to_demo,
  AVG(EXTRACT(EPOCH FROM (converted_to_paid_at - demo_activated_at)) / 86400) FILTER (WHERE converted_to_paid_at IS NOT NULL) as avg_days_demo_to_paid
  
FROM platform_leads
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

### **Función: Mover Lead en el Funnel Automáticamente**

```sql
CREATE OR REPLACE FUNCTION update_lead_funnel_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se activa demo
  IF NEW.demo_activated_at IS NOT NULL AND OLD.demo_activated_at IS NULL THEN
    NEW.funnel_stage := 'demo_activated';
  END IF;
  
  -- Si convierte a pago
  IF NEW.converted_to_paid_at IS NOT NULL AND OLD.converted_to_paid_at IS NULL THEN
    NEW.funnel_stage := 'converted_paid';
  END IF;
  
  -- Si el demo expiró (14 días sin convertir)
  IF NEW.funnel_stage IN ('demo_activated', 'demo_active') AND 
     NEW.demo_activated_at < NOW() - INTERVAL '14 days' AND
     NEW.converted_to_paid_at IS NULL THEN
    NEW.funnel_stage := 'demo_expired';
  END IF;
  
  -- Si está inactivo por >30 días sin convertir
  IF NEW.last_interaction_at < NOW() - INTERVAL '30 days' AND
     NEW.funnel_stage NOT IN ('converted_paid', 'lost') THEN
    NEW.funnel_stage := 'lost';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_funnel_stage
BEFORE UPDATE ON platform_leads
FOR EACH ROW EXECUTE FUNCTION update_lead_funnel_stage();
```

---

### **Automatización: Crear Alerta para Leads HOT**

```sql
CREATE OR REPLACE FUNCTION create_alert_for_hot_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Si un lead calificado tiene score >80 y no ha sido contactado en 24h
  IF NEW.lead_qualified = TRUE AND 
     NEW.lead_score >= 80 AND
     NEW.last_interaction_at < NOW() - INTERVAL '24 hours' AND
     NEW.funnel_stage = 'qualified' THEN
    
    INSERT INTO platform_alerts (
      alert_type,
      title,
      description,
      severity,
      related_entity_type,
      related_entity_id,
      suggested_actions
    ) VALUES (
      'lead_hot',
      'Lead HOT sin contacto en 24h',
      format('Lead %s (%s) tiene score %s y está calificado pero no ha sido contactado.', 
             NEW.full_name, NEW.email, NEW.lead_score),
      'warning',
      'lead',
      NEW.id,
      '[{"action": "send_crm_campaign", "label": "Enviar campaña de conversión"}]'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_hot_lead
AFTER UPDATE ON platform_leads
FOR EACH ROW EXECUTE FUNCTION create_alert_for_hot_lead();
```

---

## 🎫 MÓDULO 2: SISTEMA DE TICKETS INTELIGENTE

### **Reglas de Escalación Automática**

```sql
CREATE OR REPLACE FUNCTION auto_escalate_ticket()
RETURNS TRIGGER AS $$
BEGIN
  -- Escalar automáticamente si:
  -- 1. Prioridad es URGENT
  IF NEW.priority = 'urgent' THEN
    NEW.assigned_to_admin := TRUE;
    NEW.status := 'escalated';
    NEW.escalation_reason := 'Prioridad urgente detectada';
    
    -- Crear alerta
    INSERT INTO platform_alerts (alert_type, title, description, severity, related_entity_type, related_entity_id)
    VALUES (
      'ticket_urgent',
      format('Ticket Urgente: %s', NEW.ticket_number),
      format('%s - %s', NEW.subject, NEW.description),
      'critical',
      'ticket',
      NEW.id
    );
  END IF;
  
  -- 2. Categoría es 'legal' o 'billing'
  IF NEW.category IN ('legal', 'billing') THEN
    NEW.assigned_to_admin := TRUE;
    NEW.escalation_reason := format('Categoría crítica: %s', NEW.category);
  END IF;
  
  -- 3. El bot ya intentó resolver 3 veces sin éxito
  IF NEW.resolution_attempted_by_bot = TRUE AND 
     (SELECT COUNT(*) FROM jsonb_array_elements(NEW.messages) WHERE value->>'role' = 'assistant') >= 3 THEN
    NEW.assigned_to_admin := TRUE;
    NEW.escalation_reason := 'Bot no pudo resolver después de 3 intentos';
  END IF;
  
  -- Calcular SLAs
  IF NEW.priority = 'urgent' THEN
    NEW.response_due_at := NEW.created_at + INTERVAL '1 hour';
    NEW.resolution_due_at := NEW.created_at + INTERVAL '4 hours';
  ELSIF NEW.priority = 'high' THEN
    NEW.response_due_at := NEW.created_at + INTERVAL '4 hours';
    NEW.resolution_due_at := NEW.created_at + INTERVAL '24 hours';
  ELSE
    NEW.response_due_at := NEW.created_at + INTERVAL '24 hours';
    NEW.resolution_due_at := NEW.created_at + INTERVAL '72 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_escalate_ticket
BEFORE INSERT ON platform_tickets
FOR EACH ROW EXECUTE FUNCTION auto_escalate_ticket();
```

---

### **Vista: Tickets que Requieren Atención**

```sql
CREATE OR REPLACE VIEW platform_tickets_needing_attention AS
SELECT
  t.*,
  l.email as lead_email,
  l.full_name as lead_name,
  EXTRACT(EPOCH FROM (NOW() - t.created_at)) / 3600 as hours_open,
  CASE
    WHEN t.resolution_due_at < NOW() THEN 'overdue'
    WHEN t.resolution_due_at < NOW() + INTERVAL '2 hours' THEN 'due_soon'
    ELSE 'on_track'
  END as sla_status
FROM platform_tickets t
LEFT JOIN platform_leads l ON t.lead_id = l.id
WHERE t.status IN ('open', 'in_progress', 'escalated')
  AND (
    t.assigned_to_admin = TRUE OR
    t.priority IN ('high', 'urgent') OR
    t.resolution_due_at < NOW() + INTERVAL '4 hours'
  )
ORDER BY
  CASE t.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END,
  t.created_at ASC;
```

---

## 💰 MÓDULO 3: ADMINISTRACIÓN DE PRECIOS DINÁMICA

### **Función: Calcular Precio Recomendado para Lead**

```sql
CREATE OR REPLACE FUNCTION calculate_recommended_plan(lead_uuid UUID)
RETURNS TABLE (
  recommended_plan_id TEXT,
  recommended_plan_name TEXT,
  estimated_monthly_cost DECIMAL,
  reasoning TEXT
) AS $$
DECLARE
  v_lead RECORD;
  v_num_phs INT;
  v_assemblies_year INT;
BEGIN
  SELECT * INTO v_lead FROM platform_leads WHERE id = lead_uuid;
  
  v_num_phs := COALESCE((v_lead.qualification_data->>'numPHs')::INT, 0);
  v_assemblies_year := COALESCE((v_lead.qualification_data->>'assembliesPerYear')::INT, 0);
  
  -- Lógica de recomendación
  IF v_assemblies_year = 0 OR v_lead.funnel_stage IN ('new_lead', 'qualified') THEN
    -- Recomendar Demo
    RETURN QUERY SELECT 
      'demo'::TEXT, 
      'Demo Gratuito'::TEXT, 
      0.00::DECIMAL,
      'Lead nuevo, ofrecer demo para validar interés'::TEXT;
      
  ELSIF v_assemblies_year <= 3 THEN
    -- Plan Por Asamblea
    RETURN QUERY SELECT 
      'por_asamblea'::TEXT,
      'Por Asamblea'::TEXT,
      (v_assemblies_year * 49)::DECIMAL,
      format('Con %s asambleas/año, más económico pagar por evento', v_assemblies_year)::TEXT;
      
  ELSIF v_assemblies_year <= 12 AND v_num_phs <= 3 THEN
    -- Plan Standard
    RETURN QUERY SELECT
      'standard'::TEXT,
      'Standard'::TEXT,
      99.00::DECIMAL,
      format('Óptimo para %s asambleas/año con %s PHs', v_assemblies_year, v_num_phs)::TEXT;
      
  ELSIF v_num_phs > 3 AND v_num_phs <= 10 THEN
    -- Plan Pro Multi-PH
    RETURN QUERY SELECT
      'pro'::TEXT,
      'Pro Multi-PH'::TEXT,
      349.00::DECIMAL,
      format('Necesario para gestionar %s PHs', v_num_phs)::TEXT;
      
  ELSE
    -- Plan Enterprise
    RETURN QUERY SELECT
      'enterprise'::TEXT,
      'Enterprise'::TEXT,
      799.00::DECIMAL,
      format('Volumen alto: %s PHs, %s asambleas/año', v_num_phs, v_assemblies_year)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🤖 MÓDULO 4: CRM AUTOMATIZADO (Campañas Inteligentes)

### **Campañas Pre-configuradas (Seeds)**

```sql
-- CAMPAÑA 1: Lead Calificado → Empujar a Demo
INSERT INTO crm_campaigns (name, description, campaign_type, target_funnel_stage, target_lead_score_min, message_template, channel, trigger_condition, delay_hours) VALUES
('Demo Push - Lead Calificado', 
 'Enviar link de demo a leads calificados que no han activado', 
 'lead_nurture',
 ARRAY['qualified']::TEXT[],
 60,
 'Hola {{name}}! 👋 Veo que te interesa Assembly 2.0. Tu Demo GRATIS está listo: {{demo_link}} ¿Tienes 10 minutos hoy para probarlo?',
 'chatbot',
 'lead_qualified',
 2 -- 2 horas después de calificar
);

-- CAMPAÑA 2: Demo Expirado → Winback
INSERT INTO crm_campaigns (name, description, campaign_type, target_funnel_stage, message_template, channel, trigger_condition, delay_hours) VALUES
('Demo Expirado - Reactivación',
 'Ofrecer extensión de demo a quienes no convirtieron',
 'winback',
 ARRAY['demo_expired']::TEXT[],
 'Hola {{name}}. Veo que tu Demo expiró. ¿Necesitas más tiempo para evaluarlo? Te extiendo 7 días más sin costo. Link: {{demo_link}}',
 'chatbot',
 'demo_expired_3_days',
 72 -- 3 días después de expirar
);

-- CAMPAÑA 3: Cliente Inactivo → Retention
INSERT INTO crm_campaigns (name, description, campaign_type, target_funnel_stage, target_days_inactive_min, message_template, channel, trigger_condition, send_frequency) VALUES
('Cliente Inactivo - Check-in',
 'Contactar clientes que no han usado la plataforma en 14 días',
 'retention',
 ARRAY['converted_paid']::TEXT[],
 14,
 'Hola {{name}}! Hace tiempo que no usas Assembly 2.0. ¿Todo bien? ¿Necesitas ayuda para configurar tu próxima asamblea? Estoy aquí para ayudarte 🙋',
 'chatbot',
 'inactive_14_days',
 'weekly'
);

-- CAMPAÑA 4: Demo Activo → Conversion Push
INSERT INTO crm_campaigns (name, description, campaign_type, target_funnel_stage, message_template, channel, trigger_condition, delay_hours) VALUES
('Demo Día 7 - Push Conversión',
 'En mitad del demo, mostrar ROI y ofrecer descuento',
 'conversion_push',
 ARRAY['demo_active']::TEXT[],
 '🎯 {{name}}, llevas 7 días usando Assembly 2.0. ¿Qué te ha parecido? Si activas el plan Standard HOY, te doy 20% OFF el primer mes. Código: DEMO20. ¿Hablamos?',
 'chatbot',
 'demo_active_7_days',
 168 -- 7 días después de activar demo
);
```

---

### **Función: Ejecutar Campañas Automáticamente (Cron Job)**

```sql
CREATE OR REPLACE FUNCTION execute_crm_campaigns()
RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  leads_sent INT,
  errors INT
) AS $$
DECLARE
  v_campaign RECORD;
  v_lead RECORD;
  v_message TEXT;
  v_sent INT := 0;
  v_errors INT := 0;
BEGIN
  -- Iterar sobre campañas activas
  FOR v_campaign IN 
    SELECT * FROM crm_campaigns 
    WHERE is_active = TRUE 
      AND (last_run_at IS NULL OR last_run_at < NOW() - INTERVAL '1 hour')
  LOOP
    v_sent := 0;
    v_errors := 0;
    
    -- Buscar leads que califican para esta campaña
    FOR v_lead IN
      SELECT l.* 
      FROM platform_leads l
      WHERE l.funnel_stage = ANY(v_campaign.target_funnel_stage)
        AND l.lead_score >= v_campaign.target_lead_score_min
        AND (v_campaign.target_days_inactive_min IS NULL OR 
             l.last_interaction_at < NOW() - (v_campaign.target_days_inactive_min || ' days')::INTERVAL)
        -- No enviar si ya recibió esta campaña
        AND NOT EXISTS (
          SELECT 1 FROM crm_campaign_logs 
          WHERE campaign_id = v_campaign.id 
            AND lead_id = l.id
        )
      LIMIT 50 -- Por seguridad, máximo 50 por ejecución
    LOOP
      BEGIN
        -- Personalizar mensaje
        v_message := v_campaign.message_template;
        v_message := REPLACE(v_message, '{{name}}', COALESCE(v_lead.full_name, 'amigo'));
        v_message := REPLACE(v_message, '{{demo_link}}', 'https://assembly20.com/demo/' || v_lead.id);
        
        -- Registrar envío
        INSERT INTO crm_campaign_logs (campaign_id, lead_id, channel, message_content, status)
        VALUES (v_campaign.id, v_lead.id, v_campaign.channel, v_message, 'sent');
        
        v_sent := v_sent + 1;
        
        -- Actualizar última interacción
        UPDATE platform_leads SET last_interaction_at = NOW() WHERE id = v_lead.id;
        
      EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors + 1;
        
        INSERT INTO crm_campaign_logs (campaign_id, lead_id, channel, message_content, status, error_message)
        VALUES (v_campaign.id, v_lead.id, v_campaign.channel, v_message, 'failed', SQLERRM);
      END;
    END LOOP;
    
    -- Actualizar estadísticas de la campaña
    UPDATE crm_campaigns SET
      total_sent = total_sent + v_sent,
      last_run_at = NOW()
    WHERE id = v_campaign.id;
    
    -- Retornar resultado
    campaign_id := v_campaign.id;
    campaign_name := v_campaign.name;
    leads_sent := v_sent;
    errors := v_errors;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Crear cron job (requiere pg_cron extension)
-- SELECT cron.schedule('execute-crm-campaigns', '0 */6 * * *', 'SELECT execute_crm_campaigns()');
-- (Se ejecuta cada 6 horas)
```

---

## 📊 MÓDULO 5: DASHBOARD REACT (Código Frontend)

### **Archivo: `src/app/platform-admin/page.tsx`**

```typescript
// src/app/platform-admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  FunnelIcon,
  TicketIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BellAlertIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PlatformAdminDashboard() {
  const [funnelStats, setFunnelStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      // 1. Cargar estadísticas del funnel
      const { data: funnel } = await supabase
        .from('platform_funnel_stats')
        .select('*')
        .single();
      setFunnelStats(funnel);

      // 2. Cargar tickets urgentes
      const { data: urgentTickets } = await supabase
        .from('platform_tickets_needing_attention')
        .select('*')
        .limit(10);
      setTickets(urgentTickets || []);

      // 3. Cargar alertas activas
      const { data: activeAlerts } = await supabase
        .from('platform_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);
      setAlerts(activeAlerts || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-2xl">Cargando Dashboard...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">🎛️ Assembly 2.0 - Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Panel de Control Inteligente</p>
      </div>

      {/* Alertas Críticas */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <AlertsSection alerts={alerts} onAcknowledge={loadDashboardData} />
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Nuevos Leads"
          value={funnelStats?.new_leads || 0}
          icon={<UsersIcon className="w-8 h-8 text-blue-500" />}
          trend="+12%"
        />
        <KPICard
          title="Demos Activos"
          value={funnelStats?.demos_active || 0}
          icon={<FunnelIcon className="w-8 h-8 text-purple-500" />}
          trend="+8%"
        />
        <KPICard
          title="Clientes Pagos"
          value={funnelStats?.paid_customers || 0}
          icon={<CurrencyDollarIcon className="w-8 h-8 text-green-500" />}
          trend="+15%"
        />
        <KPICard
          title="Tickets Urgentes"
          value={tickets.filter(t => t.priority === 'urgent').length}
          icon={<TicketIcon className="w-8 h-8 text-red-500" />}
          alert={tickets.some(t => t.priority === 'urgent')}
        />
      </div>

      {/* Funnel de Conversión */}
      <div className="mb-8">
        <FunnelVisualization stats={funnelStats} />
      </div>

      {/* Tickets que Requieren Atención */}
      <div className="mb-8">
        <TicketsSection tickets={tickets} onResolve={loadDashboardData} />
      </div>

      {/* Navegación a Otros Módulos */}
      <div className="grid grid-cols-3 gap-6">
        <ModuleCard
          title="Gestión de Leads"
          description="Ver todos los leads y su progreso en el funnel"
          icon={<UsersIcon className="w-12 h-12" />}
          href="/platform-admin/leads"
        />
        <ModuleCard
          title="CRM & Campañas"
          description="Configurar campañas automatizadas y promociones"
          icon={<CurrencyDollarIcon className="w-12 h-12" />}
          href="/platform-admin/crm"
        />
        <ModuleCard
          title="Configuración Chatbot"
          description="Modificar prompts y comportamiento del bot"
          icon={<CogIcon className="w-12 h-12" />}
          href="/platform-admin/chatbot-config"
        />
      </div>
    </div>
  );
}

// ============================================
// COMPONENTES
// ============================================

function AlertsSection({ alerts, onAcknowledge }: any) {
  async function handleAcknowledge(alertId: string) {
    await supabase
      .from('platform_alerts')
      .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);
    
    onAcknowledge();
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <BellAlertIcon className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-xl font-bold text-red-900">
          🚨 {alerts.length} Alerta{alerts.length > 1 ? 's' : ''} Activa{alerts.length > 1 ? 's' : ''}
        </h2>
      </div>

      <div className="space-y-3">
        {alerts.map((alert: any) => (
          <div key={alert.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reconocer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, alert }: any) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${alert ? 'border-2 border-red-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              {trend} vs mes pasado
            </p>
          )}
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
}

function FunnelVisualization({ stats }: any) {
  if (!stats) return null;

  const stages = [
    { name: 'Nuevos Leads', count: stats.new_leads, color: 'bg-blue-500' },
    { name: 'Calificados', count: stats.qualified_leads, color: 'bg-indigo-500', rate: stats.lead_to_qualified_rate },
    { name: 'Demos Activados', count: stats.demos_activated, color: 'bg-purple-500', rate: stats.qualified_to_demo_rate },
    { name: 'Demos Activos', count: stats.demos_active, color: 'bg-pink-500' },
    { name: 'Clientes Pagos', count: stats.paid_customers, color: 'bg-green-500', rate: stats.demo_to_paid_rate },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">📊 Funnel de Conversión (Últimos 30 días)</h2>
      
      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{stage.name}</span>
              <span className="font-bold">{stage.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className={`${stage.color} h-8 rounded-full flex items-center justify-center text-white font-bold`}
                style={{ width: `${(stage.count / stages[0].count) * 100}%` }}
              >
                {stage.rate && `${stage.rate}% conv.`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-700">
          ⏱️ <strong>Tiempo promedio:</strong> {Math.round(stats.avg_hours_to_demo || 0)}h hasta demo, {Math.round(stats.avg_days_demo_to_paid || 0)} días demo → pago
        </p>
      </div>
    </div>
  );
}

function TicketsSection({ tickets, onResolve }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">🎫 Tickets que Requieren Atención</h2>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ✅ No hay tickets urgentes. ¡Todo bajo control!
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-600">{ticket.ticket_number}</span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getSLAColor(ticket.sla_status)}`}>
                      {ticket.sla_status}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description.substring(0, 150)}...</p>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {ticket.lead_name && <span>Cliente: {ticket.lead_name} ({ticket.lead_email})</span>}
                    {' • '}
                    <span>Abierto hace {Math.round(ticket.hours_open)}h</span>
                  </div>
                </div>

                <div className="ml-4 space-x-2">
                  <button
                    onClick={() => window.location.href = `/platform-admin/tickets/${ticket.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ title, description, icon, href }: any) {
  return (
    <a
      href={href}
      className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center mb-4">
        <div className="text-blue-600">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
}

// ============================================
// HELPERS
// ============================================

function getPriorityColor(priority: string): string {
  const colors: any = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

function getSLAColor(status: string): string {
  const colors: any = {
    on_track: 'bg-green-100 text-green-800',
    due_soon: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getSeverityColor(severity: string): string {
  const colors: any = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}
```

---

## 🔔 MÓDULO 6: ALERTAS INTELIGENTES (Automatización)

### **Job Diario: Detectar Situaciones que Requieren Atención**

```sql
CREATE OR REPLACE FUNCTION generate_daily_alerts()
RETURNS VOID AS $$
BEGIN
  -- ALERTA 1: Leads HOT sin contacto en 24h
  INSERT INTO platform_alerts (alert_type, title, description, severity, related_entity_type, related_entity_id)
  SELECT
    'lead_hot',
    format('Lead HOT: %s', full_name),
    format('%s tiene score %s pero no ha sido contactado en 24h', email, lead_score),
    'warning',
    'lead',
    id
  FROM platform_leads
  WHERE lead_qualified = TRUE
    AND lead_score >= 80
    AND funnel_stage = 'qualified'
    AND last_interaction_at < NOW() - INTERVAL '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM platform_alerts 
      WHERE related_entity_id = platform_leads.id 
        AND alert_type = 'lead_hot'
        AND status = 'active'
    );

  -- ALERTA 2: Demos próximos a expirar (quedan 2 días)
  INSERT INTO platform_alerts (alert_type, title, description, severity, related_entity_type, related_entity_id)
  SELECT
    'subscription_expiring',
    format('Demo expira pronto: %s', full_name),
    format('El demo de %s expira en 2 días. Push de conversión urgente.', email),
    'warning',
    'lead',
    id
  FROM platform_leads
  WHERE funnel_stage = 'demo_active'
    AND demo_activated_at BETWEEN NOW() - INTERVAL '12 days' AND NOW() - INTERVAL '11 days'
    AND converted_to_paid_at IS NULL;

  -- ALERTA 3: Tickets urgentes sin respuesta en 1h
  INSERT INTO platform_alerts (alert_type, title, description, severity, related_entity_type, related_entity_id)
  SELECT
    'ticket_urgent',
    format('Ticket SIN RESPUESTA: %s', ticket_number),
    format('Ticket urgente creado hace %s horas sin primera respuesta', EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600),
    'critical',
    'ticket',
    id
  FROM platform_tickets
  WHERE priority = 'urgent'
    AND status = 'open'
    AND first_response_at IS NULL
    AND created_at < NOW() - INTERVAL '1 hour';

  -- ALERTA 4: Alto riesgo de churn (cliente inactivo >21 días)
  INSERT INTO platform_alerts (alert_type, title, description, severity, related_entity_type, related_entity_id)
  SELECT
    'high_churn_risk',
    format('Riesgo de Churn: %s', l.full_name),
    format('Cliente pagador sin actividad hace %s días', EXTRACT(DAY FROM (NOW() - l.last_interaction_at))),
    'error',
    'lead',
    l.id
  FROM platform_leads l
  INNER JOIN platform_subscriptions s ON l.id = s.lead_id
  WHERE s.status = 'active'
    AND l.last_interaction_at < NOW() - INTERVAL '21 days';
END;
$$ LANGUAGE plpgsql;

-- Programar para que se ejecute diariamente a las 8am
-- SELECT cron.schedule('generate-daily-alerts', '0 8 * * *', 'SELECT generate_daily_alerts()');
```

---

## 📱 MÓDULO 7: NOTIFICACIONES PUSH/EMAIL (Cuando Requiere Intervención)

### **Función: Enviar Notificación al Admin**

```typescript
// src/lib/notifications/admin.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyAdmin(alert: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'henry@assembly20.com';

  let subject = '';
  let html = '';

  switch (alert.alert_type) {
    case 'ticket_urgent':
      subject = `🚨 URGENTE: ${alert.title}`;
      html = `
        <h2>Ticket Urgente Requiere Atención</h2>
        <p>${alert.description}</p>
        <p><a href="https://app.assembly20.com/platform-admin/tickets/${alert.related_entity_id}">Ver Ticket →</a></p>
      `;
      break;

    case 'lead_hot':
      subject = `🔥 Lead HOT: ${alert.title}`;
      html = `
        <h2>Lead Caliente Necesita Contacto</h2>
        <p>${alert.description}</p>
        <p><a href="https://app.assembly20.com/platform-admin/leads/${alert.related_entity_id}">Ver Lead →</a></p>
      `;
      break;

    case 'high_churn_risk':
      subject = `⚠️ Riesgo de Churn: ${alert.title}`;
      html = `
        <h2>Cliente en Riesgo de Cancelar</h2>
        <p>${alert.description}</p>
        <p>Acciones sugeridas: Contactar por teléfono, ofrecer consultoría gratuita.</p>
        <p><a href="https://app.assembly20.com/platform-admin/leads/${alert.related_entity_id}">Ver Cliente →</a></p>
      `;
      break;
  }

  // Enviar email
  await resend.emails.send({
    from: 'Assembly 2.0 Alerts <alerts@assembly20.com>',
    to: adminEmail,
    subject,
    html,
  });

  // También podría enviar SMS vía Twilio si es crítico
  if (alert.severity === 'critical') {
    // await sendSMS(process.env.ADMIN_PHONE, subject);
  }
}
```

---

## ✅ RESUMEN: DASHBOARD EN PILOTO AUTOMÁTICO

### **¿Qué hace SOLO el sistema?**

1. ✅ **Captura leads** del chatbot automáticamente
2. ✅ **Califica leads** por score (0-100)
3. ✅ **Mueve leads** por el funnel automáticamente
4. ✅ **Crea tickets** cuando el bot no puede resolver
5. ✅ **Escala tickets** según prioridad/categoría
6. ✅ **Envía campañas CRM** automáticamente cada 6 horas
7. ✅ **Genera alertas** cuando algo necesita atención
8. ✅ **Calcula SLAs** y marca tickets overdue
9. ✅ **Recomienda planes** según perfil del lead
10. ✅ **Notifica al admin** solo cuando es crítico

### **¿Qué haces TÚ como admin? (15 min/día)**

1. 📧 **Revisar alertas** en el email matutino (5 min)
2. 🎫 **Resolver 2-3 tickets** escalados (5 min cada uno)
3. 📊 **Ver dashboard** para entender tendencias (3 min)
4. 🔧 **Ajustar algo** si ves patrón problemático (2 min)

### **Total:** ~15-20 minutos/día de mantenimiento activo

---

## 🚀 PRÓXIMOS PASOS

¿Quieres que le dé instrucciones al Coder para implementar este dashboard? Le puedo crear una TAREA 3 con:

- ✅ SQL completo (7 tablas nuevas)
- ✅ Código React del dashboard
- ✅ Automatizaciones y triggers
- ✅ Sistema de alertas
- ✅ Integración con el chatbot existente

**¿Procedemos?** 🎯
