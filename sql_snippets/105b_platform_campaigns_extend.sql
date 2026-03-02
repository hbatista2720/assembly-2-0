-- Extiende platform_campaigns para editar, personalizar y plantillas de email.
-- Ejecutar después de 105_platform_campaigns.sql

ALTER TABLE platform_campaigns
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS target_stage TEXT,
  ADD COLUMN IF NOT EXISTS frequency TEXT,
  ADD COLUMN IF NOT EXISTS email_subject TEXT,
  ADD COLUMN IF NOT EXISTS email_body TEXT;

-- Actualizar campañas existentes con valores por defecto
UPDATE platform_campaigns SET
  description = 'Envía bienvenida y guía de uso a leads que acaban de activar su demo.',
  target_stage = 'Leads con demo recién activado',
  frequency = 'Al activar demo',
  email_subject = 'Bienvenido a Assembly 2.0 – Guía de tu demo',
  email_body = 'Hola {{name}},\n\nGracias por activar tu demo. Aquí tienes el enlace para comenzar:\n\n{{demo_link}}\n\n¿Necesitas ayuda? Responde este correo.'
WHERE name = 'Onboarding Demo' AND (description IS NULL OR description = '');

UPDATE platform_campaigns SET
  description = 'Recordatorio y oferta de conversión a leads cuyo demo está por expirar o ya expiró.',
  target_stage = 'Demo por expirar o expirado',
  frequency = '5 días después del demo',
  email_subject = 'Tu demo de Assembly 2.0 está por expirar',
  email_body = 'Hola {{name}},\n\nTu período de prueba está por vencer. ¿Quieres convertirte a un plan completo?\n\n{{demo_link}}\n\nSaludos.'
WHERE name = 'Seguimiento Post-Demo' AND (description IS NULL OR description = '');

UPDATE platform_campaigns SET
  description = 'Recontacta leads que llevan 7+ días sin interactuar para recuperar interés.',
  target_stage = 'Leads inactivos 7+ días',
  frequency = 'Semanal',
  email_subject = 'Te extrañamos en Assembly 2.0',
  email_body = 'Hola {{name}},\n\nHace tiempo que no nos visitas. ¿Hay algo en lo que podamos ayudarte?\n\n{{demo_link}}\n\nEquipo Assembly 2.0'
WHERE name = 'Reactivación de Leads' AND (description IS NULL OR description = '');
