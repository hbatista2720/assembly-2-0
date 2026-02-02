# 🎛️ TAREA 3: DASHBOARD ADMINISTRATIVO INTELIGENTE
## Instrucciones para el Agente Coder

---

## ⚠️ PREREQUISITO CRÍTICO

**ANTES DE EMPEZAR ESTA TAREA:**
- ✅ Debes haber completado **100% de la TAREA 2** (Chatbot con Gemini)
- ✅ El bot de Telegram debe estar funcionando
- ✅ Las tablas `chatbot_conversations`, `chatbot_actions` y `chatbot_metrics` deben existir
- ✅ El bot debe estar guardando conversaciones en Supabase

**Si no has terminado la Tarea 2, DETENTE y complétala primero.**

---

## 🎯 OBJETIVO DE ESTA TAREA

Crear un **Dashboard Administrativo Inteligente** que funcione en **piloto automático**, requiriendo solo 15 minutos/día de atención del dueño de la plataforma.

**El dashboard debe:**
- ✅ Capturar leads automáticamente del chatbot
- ✅ Gestionar funnel completo: Lead → Demo → Cliente
- ✅ Sistema de tickets con escalación inteligente
- ✅ CRM automatizado con campañas
- ✅ Alertas solo cuando algo es crítico
- ✅ Administración de suscripciones
- ✅ Configuración editable del chatbot

**Tiempo estimado:** 1-2 días  
**Costo:** $0 (todo incluido en Supabase)

---

## 📦 PASO 1: CREAR TABLAS EN SUPABASE (30 minutos)

### **1.1 Ejecutar SQL en Supabase**

Ve a tu proyecto en Supabase → **SQL Editor** → **New Query**

Copia y pega este SQL completo:

```sql
-- ============================================
-- TAREA 3: DASHBOARD ADMIN INTELIGENTE
-- 7 Tablas Nuevas + Triggers + Vistas + Funciones
-- ============================================

-- ============================================
-- TABLA 1: platform_leads (Funnel de Leads)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del Lead
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  
  -- Clasificación
  lead_source TEXT NOT NULL DEFAULT 'chatbot', -- 'chatbot', 'landing_form', 'manual', 'referral'
  lead_type TEXT NOT NULL DEFAULT 'otro' CHECK (lead_type IN ('administrador', 'promotora', 'propietario', 'otro')),
  
  -- Calificación (del chatbot)
  lead_score INT DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_qualified BOOLEAN DEFAULT FALSE,
  qualification_data JSONB DEFAULT '{}'::jsonb,
  
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
  chatbot_conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE SET NULL,
  
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
CREATE INDEX idx_leads_chatbot ON platform_leads(chatbot_conversation_id);

-- ============================================
-- TABLA 2: platform_tickets (Sistema de Tickets)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  
  -- Relaciones
  lead_id UUID REFERENCES platform_leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_admin BOOLEAN DEFAULT FALSE,
  
  -- Origen
  source TEXT NOT NULL DEFAULT 'chatbot' CHECK (source IN ('chatbot', 'email', 'phone', 'manual')),
  channel TEXT NOT NULL DEFAULT 'landing' CHECK (channel IN ('landing', 'demo', 'customer_support', 'crm')),
  
  -- Contenido
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general', -- 'technical', 'billing', 'legal', 'sales', 'product_feedback', 'general'
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'escalated')
  ),
  
  -- Automatización
  auto_resolved BOOLEAN DEFAULT FALSE,
  resolution_attempted_by_bot BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT NULL,
  
  -- Resolución
  resolved_by TEXT NULL,
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
CREATE INDEX idx_tickets_lead ON platform_tickets(lead_id);

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
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
BEFORE INSERT ON platform_tickets
FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- ============================================
-- TABLA 3: crm_campaigns (Campañas Automatizadas)
-- ============================================

CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuración
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (
    campaign_type IN ('lead_nurture', 'demo_reminder', 'conversion_push', 'retention', 'winback', 'upsell')
  ),
  
  -- Targeting
  target_funnel_stage TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_lead_score_min INT DEFAULT 0,
  target_lead_score_max INT DEFAULT 100,
  target_days_inactive_min INT NULL,
  
  -- Contenido
  message_template TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'chatbot' CHECK (channel IN ('chatbot', 'email', 'sms', 'in_app')),
  
  -- Automatización
  is_active BOOLEAN DEFAULT TRUE,
  auto_send BOOLEAN DEFAULT TRUE,
  send_frequency TEXT DEFAULT 'once' CHECK (send_frequency IN ('once', 'daily', 'weekly', 'monthly')),
  max_sends_per_lead INT DEFAULT 1,
  
  -- Timing
  trigger_condition TEXT NOT NULL,
  delay_hours INT DEFAULT 0,
  
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
CREATE INDEX idx_campaigns_last_run ON crm_campaigns(last_run_at);

-- ============================================
-- TABLA 4: crm_campaign_logs (Historial de Envíos)
-- ============================================

CREATE TABLE IF NOT EXISTS crm_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID REFERENCES crm_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES platform_leads(id) ON DELETE CASCADE,
  
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
CREATE INDEX idx_campaign_logs_sent ON crm_campaign_logs(sent_at DESC);

-- ============================================
-- TABLA 5: platform_subscriptions (Gestión de Suscripciones)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cliente
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES platform_leads(id) ON DELETE SET NULL,
  
  -- Plan
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  
  -- Pricing
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'pay_per_use')),
  price_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('trial', 'active', 'past_due', 'canceled', 'paused')
  ),
  
  -- Fechas
  trial_start_date TIMESTAMPTZ NULL,
  trial_end_date TIMESTAMPTZ NULL,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  canceled_at TIMESTAMPTZ NULL,
  cancellation_reason TEXT NULL,
  
  -- Límites del Plan
  plan_limits JSONB DEFAULT '{}'::jsonb,
  usage_current_period JSONB DEFAULT '{}'::jsonb,
  
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
CREATE INDEX idx_subscriptions_lead ON platform_subscriptions(lead_id);
CREATE INDEX idx_subscriptions_status ON platform_subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON platform_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_next_payment ON platform_subscriptions(next_payment_at);

-- ============================================
-- TABLA 6: chatbot_config (Configuración del Chatbot)
-- ============================================

CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contexto
  context_name TEXT UNIQUE NOT NULL,
  
  -- Prompts
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NULL,
  fallback_message TEXT NULL,
  
  -- Configuración de IA
  ai_model TEXT DEFAULT 'gemini-1.5-flash',
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INT DEFAULT 500,
  
  -- Comportamiento
  auto_escalate_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  escalation_threshold INT DEFAULT 3,
  
  -- Quick Replies
  quick_replies JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Versión
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuraciones por defecto (sincronizar con TAREA 2)
INSERT INTO chatbot_config (context_name, system_prompt, welcome_message, auto_escalate_keywords) VALUES
('landing', 'Eres Lex, asistente de Assembly 2.0. Tu objetivo es calificar leads y guiarlos al Demo GRATIS.', 
 '¡Hola! 👋 Soy Lex, el asistente inteligente de Assembly 2.0. ¿Eres administrador de PHs o trabajas con una promotora?',
 ARRAY['legal', 'demanda', 'abogado', 'urgente']::TEXT[]),
 
('onboarding', 'Eres el tutor de onboarding. Guía paso a paso para activar el Demo.', 
 '¡Perfecto! Vamos a activar tu Demo GRATIS en 3 pasos simples.',
 ARRAY[]::TEXT[]),
 
('demo', 'Eres el guía del Demo. Muestra el valor en <10 minutos.', 
 '¡Bienvenido a tu primera asamblea virtual! Te voy a guiar en 4 pasos.',
 ARRAY[]::TEXT[]),
 
('conversion', 'Eres el consultor de conversión. Muestra ROI y cierra ventas.', 
 '¡Completaste el Demo! 🎉 Déjame mostrarte algo interesante sobre los planes.',
 ARRAY[]::TEXT[]),
 
('customer', 'Eres el soporte técnico. Resuelve dudas rápidamente.', 
 'Hola, ¿en qué te puedo ayudar hoy?',
 ARRAY['bug', 'error', 'no funciona', 'problema crítico']::TEXT[]),
 
('support', 'Eres el triaje de soporte. Clasifica y escala cuando sea necesario.', 
 'Veo que necesitas ayuda. Cuéntame qué sucede y te ayudaré.',
 ARRAY['legal', 'abogado', 'demanda', 'facturación', 'cobro']::TEXT[])
ON CONFLICT (context_name) DO NOTHING;

CREATE INDEX idx_chatbot_config_context ON chatbot_config(context_name);
CREATE INDEX idx_chatbot_config_active ON chatbot_config(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLA 7: platform_alerts (Alertas Inteligentes)
-- ============================================

CREATE TABLE IF NOT EXISTS platform_alerts (
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
  related_entity_type TEXT NULL,
  related_entity_id UUID NULL,
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMPTZ NULL,
  acknowledged_by TEXT NULL,
  resolved_at TIMESTAMPTZ NULL,
  
  -- Acciones Sugeridas
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON platform_alerts(status) WHERE status = 'active';
CREATE INDEX idx_alerts_severity ON platform_alerts(severity);
CREATE INDEX idx_alerts_type ON platform_alerts(alert_type);
CREATE INDEX idx_alerts_created ON platform_alerts(created_at DESC);

-- ============================================
-- TRIGGERS Y AUTOMATIZACIONES
-- ============================================

-- Trigger: Actualizar updated_at en platform_leads
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_leads_updated_at
BEFORE UPDATE ON platform_leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_tickets_updated_at
BEFORE UPDATE ON platform_tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_campaigns_updated_at
BEFORE UPDATE ON crm_campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_subscriptions_updated_at
BEFORE UPDATE ON platform_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_config_updated_at
BEFORE UPDATE ON chatbot_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger: Mover Lead en el Funnel Automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_lead_funnel_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se activa demo
  IF NEW.demo_activated_at IS NOT NULL AND (OLD.demo_activated_at IS NULL OR OLD.demo_activated_at != NEW.demo_activated_at) THEN
    NEW.funnel_stage := 'demo_activated';
  END IF;
  
  -- Si convierte a pago
  IF NEW.converted_to_paid_at IS NOT NULL AND (OLD.converted_to_paid_at IS NULL OR OLD.converted_to_paid_at != NEW.converted_to_paid_at) THEN
    NEW.funnel_stage := 'converted_paid';
  END IF;
  
  -- Si el demo expiró (14 días sin convertir)
  IF NEW.funnel_stage IN ('demo_activated', 'demo_active') AND 
     NEW.demo_activated_at IS NOT NULL AND
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

-- ============================================
-- Trigger: Crear Alerta para Leads HOT
-- ============================================

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
             COALESCE(NEW.full_name, 'Sin nombre'), NEW.email, NEW.lead_score),
      'warning',
      'lead',
      NEW.id,
      '[{"action": "send_crm_campaign", "label": "Enviar campaña de conversión"}]'::jsonb
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_hot_lead
AFTER UPDATE ON platform_leads
FOR EACH ROW EXECUTE FUNCTION create_alert_for_hot_lead();

-- ============================================
-- Trigger: Escalación Automática de Tickets
-- ============================================

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
      format('%s - %s', NEW.subject, LEFT(NEW.description, 200)),
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

-- ============================================
-- VISTAS
-- ============================================

-- Vista: Estadísticas del Funnel
CREATE OR REPLACE VIEW platform_funnel_stats AS
SELECT
  COUNT(*) FILTER (WHERE funnel_stage = 'new_lead') as new_leads,
  COUNT(*) FILTER (WHERE funnel_stage = 'qualified') as qualified_leads,
  COUNT(*) FILTER (WHERE funnel_stage = 'demo_activated') as demos_activated,
  COUNT(*) FILTER (WHERE funnel_stage = 'demo_active') as demos_active,
  COUNT(*) FILTER (WHERE funnel_stage = 'converted_paid') as paid_customers,
  COUNT(*) FILTER (WHERE funnel_stage = 'lost') as lost_leads,
  
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
  
  ROUND(AVG(EXTRACT(EPOCH FROM (demo_activated_at - created_at)) / 3600) FILTER (WHERE demo_activated_at IS NOT NULL), 1) as avg_hours_to_demo,
  ROUND(AVG(EXTRACT(EPOCH FROM (converted_to_paid_at - demo_activated_at)) / 86400) FILTER (WHERE converted_to_paid_at IS NOT NULL), 1) as avg_days_demo_to_paid
  
FROM platform_leads
WHERE created_at > NOW() - INTERVAL '30 days';

-- Vista: Tickets que Requieren Atención
CREATE OR REPLACE VIEW platform_tickets_needing_attention AS
SELECT
  t.*,
  l.email as lead_email,
  l.full_name as lead_name,
  ROUND(EXTRACT(EPOCH FROM (NOW() - t.created_at)) / 3600, 1) as hours_open,
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

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Calcular Plan Recomendado para un Lead
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
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead no encontrado';
  END IF;
  
  v_num_phs := COALESCE((v_lead.qualification_data->>'numPHs')::INT, 0);
  v_assemblies_year := COALESCE((v_lead.qualification_data->>'assembliesPerYear')::INT, 0);
  
  -- Lógica de recomendación
  IF v_assemblies_year = 0 OR v_lead.funnel_stage IN ('new_lead', 'qualified') THEN
    RETURN QUERY SELECT 
      'demo'::TEXT, 
      'Demo Gratuito'::TEXT, 
      0.00::DECIMAL,
      'Lead nuevo, ofrecer demo para validar interés'::TEXT;
      
  ELSIF v_assemblies_year <= 3 THEN
    RETURN QUERY SELECT 
      'por_asamblea'::TEXT,
      'Por Asamblea'::TEXT,
      (v_assemblies_year * 49)::DECIMAL,
      format('Con %s asambleas/año, más económico pagar por evento', v_assemblies_year)::TEXT;
      
  ELSIF v_assemblies_year <= 12 AND v_num_phs <= 3 THEN
    RETURN QUERY SELECT
      'standard'::TEXT,
      'Standard'::TEXT,
      99.00::DECIMAL,
      format('Óptimo para %s asambleas/año con %s PHs', v_assemblies_year, v_num_phs)::TEXT;
      
  ELSIF v_num_phs > 3 AND v_num_phs <= 10 THEN
    RETURN QUERY SELECT
      'pro'::TEXT,
      'Pro Multi-PH'::TEXT,
      349.00::DECIMAL,
      format('Necesario para gestionar %s PHs', v_num_phs)::TEXT;
      
  ELSE
    RETURN QUERY SELECT
      'enterprise'::TEXT,
      'Enterprise'::TEXT,
      799.00::DECIMAL,
      format('Volumen alto: %s PHs, %s asambleas/año', v_num_phs, v_assemblies_year)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEEDS: Campañas CRM Pre-configuradas
-- ============================================

INSERT INTO crm_campaigns (name, description, campaign_type, target_funnel_stage, target_lead_score_min, message_template, channel, trigger_condition, delay_hours) VALUES
('Demo Push - Lead Calificado', 
 'Enviar link de demo a leads calificados que no han activado', 
 'lead_nurture',
 ARRAY['qualified']::TEXT[],
 60,
 'Hola {{name}}! 👋 Veo que te interesa Assembly 2.0. Tu Demo GRATIS está listo: {{demo_link}} ¿Tienes 10 minutos hoy para probarlo?',
 'chatbot',
 'lead_qualified',
 2),

('Demo Expirado - Reactivación',
 'Ofrecer extensión de demo a quienes no convirtieron',
 'winback',
 ARRAY['demo_expired']::TEXT[],
 'Hola {{name}}. Veo que tu Demo expiró. ¿Necesitas más tiempo para evaluarlo? Te extiendo 7 días más sin costo. Link: {{demo_link}}',
 'chatbot',
 'demo_expired_3_days',
 72),

('Cliente Inactivo - Check-in',
 'Contactar clientes que no han usado la plataforma en 14 días',
 'retention',
 ARRAY['converted_paid']::TEXT[],
 'Hola {{name}}! Hace tiempo que no usas Assembly 2.0. ¿Todo bien? ¿Necesitas ayuda para configurar tu próxima asamblea? Estoy aquí para ayudarte 🙋',
 'chatbot',
 'inactive_14_days',
 0),

('Demo Día 7 - Push Conversión',
 'En mitad del demo, mostrar ROI y ofrecer descuento',
 'conversion_push',
 ARRAY['demo_active']::TEXT[],
 '🎯 {{name}}, llevas 7 días usando Assembly 2.0. ¿Qué te ha parecido? Si activas el plan Standard HOY, te doy 20% OFF el primer mes. Código: DEMO20. ¿Hablamos?',
 'chatbot',
 'demo_active_7_days',
 168)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE platform_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Service role puede hacer todo
CREATE POLICY "Service role full access on leads"
ON platform_leads FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on tickets"
ON platform_tickets FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on campaigns"
ON crm_campaigns FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on campaign_logs"
ON crm_campaign_logs FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on subscriptions"
ON platform_subscriptions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on chatbot_config"
ON chatbot_config FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access on alerts"
ON platform_alerts FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Política: Admins pueden leer todo
CREATE POLICY "Admins can read leads"
ON platform_leads FOR SELECT
USING (auth.jwt()->>'email' = 'henry@assembly20.com'); -- Cambiar por email real del admin

CREATE POLICY "Admins can read tickets"
ON platform_tickets FOR SELECT
USING (auth.jwt()->>'email' = 'henry@assembly20.com');

-- (Replicar para otras tablas según necesidad)

-- ============================================
-- ✅ TABLAS CREADAS EXITOSAMENTE
-- ============================================

SELECT 'Tarea 3: 7 tablas creadas + triggers + vistas + funciones + seeds' AS status;
```

**Ejecutar y Verificar:**
- Haz clic en **"Run"**
- Deberías ver: `Success` con el mensaje de status
- Ve a **Table Editor** y verifica que aparezcan las 7 tablas nuevas

---

## 🔗 PASO 2: INTEGRAR CHATBOT CON PLATFORM_LEADS (20 min)

### **2.1 Modificar el Chatbot para Crear Leads Automáticamente**

Archivo: `src/chatbot/utils/supabase.ts` (ACTUALIZAR EL EXISTENTE)

Agrega esta función al final del archivo:

```typescript
/**
 * Crear o actualizar lead desde conversación del chatbot
 */
export async function upsertLeadFromConversation(
  telegramId: string,
  email?: string
): Promise<string | null> {
  const context = await getUserContext(telegramId);

  // Extraer datos de calificación
  const leadData = context.leadData;
  
  // Calcular score del lead (0-100)
  let score = 0;
  if (leadData.role) score += 20;
  if (leadData.numPHs || leadData.assembliesPerYear) score += 30;
  if (leadData.currentPainPoint) score += 20;
  if (leadData.budget) score += 15;
  if (context.messages.length > 5) score += 15; // Engagement

  const leadPayload = {
    email: email || `telegram_${telegramId}@temp.assembly20.com`,
    lead_source: 'chatbot',
    lead_type: (leadData.role?.toLowerCase() || 'otro') as string,
    lead_score: Math.min(score, 100),
    lead_qualified: score >= 60,
    qualification_data: leadData,
    funnel_stage: context.convertedToDemo ? 'demo_activated' : (score >= 60 ? 'qualified' : 'new_lead'),
    last_interaction_at: new Date().toISOString(),
    total_interactions: context.messages.length,
    chatbot_conversation_id: context.id,
  };

  const { data, error } = await supabase
    .from('platform_leads')
    .upsert(leadPayload, { onConflict: 'email' })
    .select('id')
    .single();

  if (error) {
    console.error('Error upserting lead:', error);
    return null;
  }

  return data.id;
}
```

### **2.2 Actualizar el Bot Principal para Crear Leads**

Archivo: `src/chatbot/index.ts` (ACTUALIZAR)

Encuentra la función `extractLeadData` y agrega al final:

```typescript
async function extractLeadData(
  telegramId: string,
  userMessage: string
): Promise<void> {
  // ... código existente ...

  // ✅ NUEVO: Crear/actualizar lead en platform_leads
  await upsertLeadFromConversation(telegramId);
}
```

También, en el comando `/demo`, después de `markDemoConversion`:

```typescript
bot.onText(/\/demo/, async (msg) => {
  // ... código existente ...

  await markDemoConversion(telegramId, demoAccountId);
  
  // ✅ NUEVO: Actualizar lead con demo activado
  const leadId = await upsertLeadFromConversation(telegramId);
  if (leadId) {
    await supabase
      .from('platform_leads')
      .update({ 
        demo_activated_at: new Date().toISOString(),
        funnel_stage: 'demo_activated'
      })
      .eq('id', leadId);
  }
});
```

---

## 💻 PASO 3: CREAR DASHBOARD REACT (2 horas)

### **3.1 Crear Estructura de Carpetas**

```bash
mkdir -p src/app/platform-admin
mkdir -p src/app/platform-admin/leads
mkdir -p src/app/platform-admin/tickets
mkdir -p src/app/platform-admin/crm
mkdir -p src/app/platform-admin/chatbot-config
mkdir -p src/components/admin
```

### **3.2 Instalar Dependencias Adicionales**

```bash
npm install @heroicons/react recharts date-fns
```

### **3.3 Dashboard Principal**

Archivo: `src/app/platform-admin/page.tsx`

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
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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

  async function acknowledgeAlert(alertId: string) {
    await supabase
      .from('platform_alerts')
      .update({ 
        status: 'acknowledged', 
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'admin' 
      })
      .eq('id', alertId);
    
    loadDashboardData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            🎛️ Assembly 2.0 - Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Panel de Control Inteligente</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertas Críticas */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <AlertsSection alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        )}

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Nuevos Leads"
            value={funnelStats?.new_leads || 0}
            icon={<UsersIcon className="w-8 h-8 text-blue-500" />}
            trend="+12%"
            href="/platform-admin/leads"
          />
          <KPICard
            title="Demos Activos"
            value={funnelStats?.demos_active || 0}
            icon={<FunnelIcon className="w-8 h-8 text-purple-500" />}
            trend="+8%"
            href="/platform-admin/leads?stage=demo_active"
          />
          <KPICard
            title="Clientes Pagos"
            value={funnelStats?.paid_customers || 0}
            icon={<CurrencyDollarIcon className="w-8 h-8 text-green-500" />}
            trend="+15%"
            href="/platform-admin/leads?stage=converted_paid"
          />
          <KPICard
            title="Tickets Urgentes"
            value={tickets.filter(t => t.priority === 'urgent').length}
            icon={<TicketIcon className="w-8 h-8 text-red-500" />}
            alert={tickets.some(t => t.priority === 'urgent')}
            href="/platform-admin/tickets"
          />
        </div>

        {/* Funnel de Conversión */}
        <div className="mb-8">
          <FunnelVisualization stats={funnelStats} />
        </div>

        {/* Tickets que Requieren Atención */}
        {tickets.length > 0 && (
          <div className="mb-8">
            <TicketsSection tickets={tickets} />
          </div>
        )}

        {/* Módulos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModuleCard
            title="Gestión de Leads"
            description="Ver todos los leads y su progreso en el funnel"
            icon={<UsersIcon className="w-12 h-12 text-blue-600" />}
            href="/platform-admin/leads"
          />
          <ModuleCard
            title="CRM & Campañas"
            description="Configurar campañas automatizadas y promociones"
            icon={<ChartBarIcon className="w-12 h-12 text-green-600" />}
            href="/platform-admin/crm"
          />
          <ModuleCard
            title="Configuración Chatbot"
            description="Modificar prompts y comportamiento del bot"
            icon={<CogIcon className="w-12 h-12 text-purple-600" />}
            href="/platform-admin/chatbot-config"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTES
// ============================================

function AlertsSection({ alerts, onAcknowledge }: any) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
      <div className="p-6">
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
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded font-semibold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Reconocer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, alert, href }: any) {
  const card = (
    <div className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${alert ? 'ring-2 ring-red-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 font-medium">
              {trend} vs mes pasado
            </p>
          )}
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function FunnelVisualization({ stats }: any) {
  if (!stats) return null;

  const stages = [
    { name: 'Nuevos Leads', count: stats.new_leads, color: 'bg-blue-500', width: 100 },
    { name: 'Calificados', count: stats.qualified_leads, color: 'bg-indigo-500', rate: stats.lead_to_qualified_rate, width: 80 },
    { name: 'Demos Activados', count: stats.demos_activated, color: 'bg-purple-500', rate: stats.qualified_to_demo_rate, width: 60 },
    { name: 'Demos Activos', count: stats.demos_active, color: 'bg-pink-500', width: 40 },
    { name: 'Clientes Pagos', count: stats.paid_customers, color: 'bg-green-500', rate: stats.demo_to_paid_rate, width: 20 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">📊 Funnel de Conversión (Últimos 30 días)</h2>
      
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const widthPercent = (stage.count / (stages[0].count || 1)) * 100;
          
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{stage.name}</span>
                <div className="flex items-center gap-3">
                  {stage.rate && (
                    <span className="text-sm text-gray-600 font-semibold">
                      {stage.rate}% conv.
                    </span>
                  )}
                  <span className="font-bold text-gray-900">{stage.count}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden">
                <div
                  className={`${stage.color} h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500`}
                  style={{ width: `${Math.max(widthPercent, 5)}%` }}
                >
                  {widthPercent >= 15 && `${Math.round(widthPercent)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          ⏱️ <strong>Tiempo promedio:</strong> {Math.round(stats.avg_hours_to_demo || 0)}h hasta demo • 
          {' '}{Math.round(stats.avg_days_demo_to_paid || 0)} días demo → pago
        </p>
      </div>
    </div>
  );
}

function TicketsSection({ tickets }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">🎫 Tickets que Requieren Atención</h2>

      <div className="space-y-4">
        {tickets.map((ticket: any) => (
          <Link 
            key={ticket.id} 
            href={`/platform-admin/tickets/${ticket.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-sm text-gray-600 font-semibold">{ticket.ticket_number}</span>
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${getSLAColor(ticket.sla_status)}`}>
                    {ticket.sla_status.replace('_', ' ')}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                
                <div className="mt-2 text-xs text-gray-500">
                  {ticket.lead_name && <span>Cliente: {ticket.lead_name} ({ticket.lead_email})</span>}
                  {ticket.lead_name && ' • '}
                  <span>Abierto hace {Math.round(ticket.hours_open)}h</span>
                </div>
              </div>

              <div className="ml-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Ver Detalles →
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ title, description, icon, href }: any) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-lg shadow hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className="flex items-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
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

## 🧪 PASO 4: TESTING (30 minutos)

### **4.1 Test de Integración Chatbot → Leads**

1. Abre Telegram y habla con tu bot
2. Envía: "Soy administrador de 5 PHs"
3. Envía: "Hago 15 asambleas al año"
4. Ve a Supabase → `platform_leads` → Deberías ver un nuevo lead con:
   - `lead_type`: "administrador"
   - `lead_score`: ~65
   - `qualification_data`: {numPHs: 5, assembliesPerYear: 15}

### **4.2 Test del Dashboard**

1. Ejecuta: `npm run dev`
2. Ve a: `http://localhost:3000/platform-admin`
3. Deberías ver:
   - KPIs con números del funnel
   - Visualización del funnel
   - Si hay tickets urgentes, aparecen
   - Si hay alertas, aparecen arriba

### **4.3 Test de Alertas Automáticas**

**Test 1: Lead HOT**
```sql
-- En Supabase SQL Editor
UPDATE platform_leads 
SET lead_score = 85, 
    lead_qualified = TRUE,
    last_interaction_at = NOW() - INTERVAL '25 hours',
    funnel_stage = 'qualified'
WHERE email = 'test@example.com';

-- Deberías ver una alerta en platform_alerts
SELECT * FROM platform_alerts WHERE alert_type = 'lead_hot';
```

**Test 2: Ticket Urgente**
```sql
INSERT INTO platform_tickets (
  ticket_number, subject, description, priority, category, source, channel
) VALUES (
  '', 'Problema URGENTE con pago', 'No puedo pagar mi suscripción', 'urgent', 'billing', 'chatbot', 'customer_support'
);

-- Deberías ver: 
-- 1. El ticket con assigned_to_admin = TRUE
-- 2. Una alerta en platform_alerts
SELECT * FROM platform_tickets WHERE priority = 'urgent';
SELECT * FROM platform_alerts WHERE alert_type = 'ticket_urgent';
```

---

## ✅ CHECKLIST FINAL

### **Base de Datos**
- [ ] 7 tablas nuevas creadas en Supabase
- [ ] Triggers funcionando (auto_escalate_ticket, update_lead_funnel_stage, etc.)
- [ ] Vistas creadas (platform_funnel_stats, platform_tickets_needing_attention)
- [ ] Funciones creadas (calculate_recommended_plan, generate_ticket_number)
- [ ] Seeds de campañas CRM insertados
- [ ] RLS configurado

### **Integración con Chatbot**
- [ ] Función `upsertLeadFromConversation` agregada
- [ ] Bot crea leads automáticamente al conversar
- [ ] Bot actualiza lead al activar demo
- [ ] Conversaciones enlazadas con leads

### **Dashboard**
- [ ] Página principal (`/platform-admin`) funciona
- [ ] KPIs muestran datos correctos
- [ ] Visualización del funnel renderiza
- [ ] Alertas aparecen cuando existen
- [ ] Tickets urgentes se muestran

### **Automatizaciones**
- [ ] Alertas se crean automáticamente (leads HOT, tickets urgentes)
- [ ] Funnel stage se actualiza automáticamente
- [ ] SLAs se calculan automáticamente en tickets
- [ ] Ticket numbers se generan automáticamente

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

### **Tareas Adicionales (si tienes tiempo):**

1. **Página de Leads Completa** (`/platform-admin/leads`)
   - Tabla con todos los leads
   - Filtros por funnel stage
   - Búsqueda por email/nombre
   - Acciones: Ver detalle, Enviar campaña, Marcar como perdido

2. **Página de Tickets** (`/platform-admin/tickets`)
   - Lista completa de tickets
   - Filtros por prioridad, estado
   - Vista de detalle de ticket
   - Resolver ticket con notas

3. **Página de CRM** (`/platform-admin/crm`)
   - Lista de campañas
   - Activar/desactivar campañas
   - Ver estadísticas de cada campaña
   - Crear nueva campaña

4. **Configuración de Chatbot** (`/platform-admin/chatbot-config`)
   - Editar prompts por contexto
   - Modificar quick replies
   - Configurar palabras clave de escalación

5. **Sistema de Notificaciones Email**
   - Integrar con Resend o SendGrid
   - Enviar email diario a las 8am con alertas
   - Email instantáneo para alertas críticas

---

## 🔔 NOTIFICACIONES EMAIL (BONUS)

Si quieres implementar notificaciones por email:

### **Instalar Resend**

```bash
npm install resend
```

### **Crear API Route**

Archivo: `src/app/api/cron/daily-alerts/route.ts`

```typescript
// src/app/api/cron/daily-alerts/route.ts
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  // Verificar cron secret para seguridad
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Obtener alertas activas
    const { data: alerts } = await supabase
      .from('platform_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Obtener estadísticas
    const { data: stats } = await supabase
      .from('platform_funnel_stats')
      .select('*')
      .single();

    // Generar HTML del email
    const html = `
      <h1>Dashboard Diario - Assembly 2.0</h1>
      
      <h2>🚨 ${alerts?.length || 0} Alertas Activas</h2>
      <ul>
        ${alerts?.map(a => `<li><strong>${a.title}</strong>: ${a.description}</li>`).join('') || '<li>Sin alertas</li>'}
      </ul>
      
      <h2>📊 Estadísticas de Ayer</h2>
      <ul>
        <li>Nuevos Leads: ${stats?.new_leads || 0}</li>
        <li>Demos Activados: ${stats?.demos_activated || 0}</li>
        <li>Conversiones: ${stats?.paid_customers || 0}</li>
      </ul>
      
      <p><a href="https://app.assembly20.com/platform-admin">Ver Dashboard Completo →</a></p>
    `;

    // Enviar email
    await resend.emails.send({
      from: 'Assembly 2.0 <alerts@assembly20.com>',
      to: process.env.ADMIN_EMAIL || 'henry@assembly20.com',
      subject: `Dashboard Diario - ${alerts?.length || 0} alertas activas`,
      html,
    });

    return Response.json({ success: true, alertsSent: alerts?.length || 0 });
  } catch (error: any) {
    console.error('Error sending daily alerts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### **Configurar Cron Job en Vercel**

Archivo: `vercel.json` (crear en la raíz)

```json
{
  "crons": [{
    "path": "/api/cron/daily-alerts",
    "schedule": "0 8 * * *"
  }]
}
```

---

## 📝 VARIABLES DE ENTORNO ADICIONALES

Agregar al `.env.local`:

```bash
# Admin Dashboard
ADMIN_EMAIL=henry@assembly20.com
CRON_SECRET=tu-secret-aleatorio-aqui

# Resend (para emails)
RESEND_API_KEY=re_...
```

---

## ✅ TAREA COMPLETADA

Cuando hayas terminado, notifica al Arquitecto con:

- ✅ Capturas de pantalla del dashboard funcionando
- ✅ Screenshot de Supabase con leads creados automáticamente
- ✅ Screenshot de alertas generándose
- ✅ Prueba del funnel con datos reales

**¡Excelente trabajo! El dashboard inteligente está listo y funcionará prácticamente solo 🚀**
