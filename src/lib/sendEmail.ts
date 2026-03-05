/**
 * Envío de correo vía SMTP (OTP, notificaciones).
 * Requiere SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS en .env.
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST?.trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.trim();
const SMTP_FROM = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER || "noreply@chatvote.click";

export function isSmtpConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER!, pass: SMTP_PASS! },
  });
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Envía un correo. Devuelve true si se envió correctamente, false si SMTP no está configurado o falla.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const trans = getTransporter();
  if (!trans) {
    console.warn("[sendEmail] SMTP no configurado. Configure SMTP_* en .env.");
    return false;
  }
  try {
    await trans.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>"),
    });
    return true;
  } catch (err) {
    console.error("[sendEmail] Error:", err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Envía el PIN de 6 dígitos al correo del residente (modo producción OTP).
 */
export async function sendOtpEmail(toEmail: string, pin: string, ttlMinutes: number): Promise<boolean> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Chat Vote";
  const subject = `Tu código de acceso - ${appName}`;
  const text = `Tu código de verificación es: ${pin}\n\nVálido por ${ttlMinutes} minutos. No compartas este código con nadie.\n\n— ${appName}`;
  const html = `
    <p>Tu código de verificación es: <strong>${pin}</strong></p>
    <p>Válido por ${ttlMinutes} minutos. No compartas este código con nadie.</p>
    <p>— ${appName}</p>
  `;
  return sendEmail({ to: toEmail, subject, text, html });
}
