import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { sendOtpEmail, isSmtpConfigured } from "../../../../lib/sendEmail";
import { getOtpMode } from "../../../../lib/secrets";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_DEBUG_ENV = process.env.OTP_DEBUG === "true";
const OTP_MAX_PER_HOUR = Number(process.env.OTP_MAX_PER_HOUR || 5);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValidEmail) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const [user] = await sql`
      SELECT id, email
      FROM users
      WHERE email = ${normalized}
    `;
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM auth_attempts
      WHERE email = ${normalized}
        AND attempt_type = 'otp_request'
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    const otpMode = await getOtpMode();
    const isTestMode = OTP_DEBUG_ENV || otpMode === "test";
    const effectiveMaxPerHour = isTestMode ? Math.max(OTP_MAX_PER_HOUR, 50) : OTP_MAX_PER_HOUR;
    if (count >= effectiveMaxPerHour) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const otp = generateOtp();
    await sql`
      INSERT INTO auth_pins (user_id, pin, expires_at)
      VALUES (${user.id}, ${otp}, NOW() + (${OTP_TTL_MINUTES} || ' minutes')::INTERVAL)
    `;

    await sql`
      INSERT INTO auth_attempts (email, attempt_type, success)
      VALUES (${normalized}, 'otp_request', TRUE)
    `;

    if (isTestMode) {
      console.log(`[OTP] Modo prueba: Email=${normalized} OTP=${otp} (no se envía por correo)`);
      return NextResponse.json({
        success: true,
        message: "Código enviado",
        otp,
        expires_in_minutes: OTP_TTL_MINUTES,
      });
    }

    // Modo producción: enviar PIN por correo
    if (!isSmtpConfigured()) {
      // Sin SMTP configurado: devolver el PIN en la respuesta para que el login no falle
      console.warn("[OTP] SMTP no configurado. Devolviendo PIN en respuesta. Configure SMTP_* o active modo prueba en el panel.");
      return NextResponse.json({
        success: true,
        message: "Código enviado (muéstralo en pantalla; configura SMTP para enviarlo por correo)",
        otp,
        expires_in_minutes: OTP_TTL_MINUTES,
      });
    }
    const sent = await sendOtpEmail(normalized, otp, OTP_TTL_MINUTES);
    if (!sent) {
      return NextResponse.json(
        { error: "No se pudo enviar el correo con el código. Revisa tu bandeja de spam o intenta más tarde." },
        { status: 502 }
      );
    }
    try {
      await sql`
        INSERT INTO email_log (to_email, subject, email_type, body_preview, success)
        VALUES (
          ${normalized},
          'Código de acceso OTP',
          'otp',
          'PIN de 6 dígitos enviado.',
          TRUE
        )
      `;
    } catch {
      // email_log puede no existir aún
    }

    return NextResponse.json({
      success: true,
      message: "Código enviado a tu correo",
      expires_in_minutes: OTP_TTL_MINUTES,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    const message = err.message || String(error);
    console.error("Error request OTP:", message, err.stack);
    // Mensaje amigable para errores de conexión (ej. sin base de datos en local)
    let safeMessage = "Error al generar OTP";
    if (OTP_DEBUG_ENV) {
      safeMessage = message;
    } else if (typeof error === "object" && error !== null && "name" in error && (error as Error).name === "AggregateError") {
      safeMessage = "No se pudo conectar al servicio. Comprueba que la base de datos esté en ejecución (por ejemplo: docker compose up -d assembly-db).";
    } else if (message.includes("ECONNREFUSED") || message.includes("connect")) {
      safeMessage = "No se pudo conectar a la base de datos. ¿Está en ejecución?";
    }
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
