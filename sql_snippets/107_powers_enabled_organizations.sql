-- Habilitar/deshabilitar botón "Ceder poder" por organización (Admin PH activa desde Propietarios > Poderes de asamblea).
-- Ref: INSTRUCCIONES_LISTADO_RESIDENTES_BD, chatbot §G, tab Poderes de asamblea.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS powers_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN organizations.powers_enabled IS 'Si true, los residentes ven el botón Ceder poder en el chatbot y pueden enviar solicitudes. Admin PH activa/desactiva en Propietarios > Poderes de asamblea.';
