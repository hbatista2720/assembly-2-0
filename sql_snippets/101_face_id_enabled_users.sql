-- Face ID opcional por residente (Arquitecto/FACE_ID_OPCIONAL_ADMIN_RESIDENTE.md)
-- Ejecutar antes de desplegar código que use face_id_enabled (resident-profile, admin-ph/residents).
-- Añade indicador en users para que el Admin PH pueda activar/desactivar Face ID por residente.
-- Valor por defecto TRUE para no romper comportamiento actual cuando se implemente WebAuthn.

ALTER TABLE users ADD COLUMN IF NOT EXISTS face_id_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN users.face_id_enabled IS 'Si TRUE, el residente puede usar Face ID/WebAuthn; si FALSE, solo OTP. Configurable por Admin PH.';
