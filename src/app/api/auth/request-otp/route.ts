import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_DEBUG = process.env.OTP_DEBUG === "true";
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
    if (count >= OTP_MAX_PER_HOUR) {
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

    console.log(`[OTP] Email=${normalized} OTP=${otp}`);

    return NextResponse.json({
      success: true,
      message: "Código enviado",
      otp: OTP_DEBUG ? otp : undefined,
      expires_in_minutes: OTP_TTL_MINUTES,
    });
  } catch (error) {
    console.error("Error request OTP:", error);
    return NextResponse.json({ error: "Error al generar OTP" }, { status: 500 });
  }
}
