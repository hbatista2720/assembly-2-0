import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const OTP_MAX_VERIFY_PER_HOUR = Number(process.env.OTP_MAX_VERIFY_PER_HOUR || 5);

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    const pin = String(code || "").trim();

    if (!normalized || !pin) {
      return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 });
    }

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM auth_attempts
      WHERE email = ${normalized}
        AND attempt_type = 'otp_verify'
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (count >= OTP_MAX_VERIFY_PER_HOUR) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const [user] = await sql`
      SELECT u.id, u.email, u.role, u.is_platform_owner, u.organization_id, o.is_demo, o.parent_subscription_id
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = ${normalized}
    `;
    if (!user) {
      await sql`
        INSERT INTO auth_attempts (email, attempt_type, success)
        VALUES (${normalized}, 'otp_verify', FALSE)
      `;
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const [pinRecord] = await sql`
      SELECT id
      FROM auth_pins
      WHERE user_id = ${user.id}
        AND pin = ${pin}
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (!pinRecord) {
      await sql`
        INSERT INTO auth_attempts (email, attempt_type, success)
        VALUES (${normalized}, 'otp_verify', FALSE)
      `;
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
    }

    await sql`
      UPDATE auth_pins
      SET used = TRUE
      WHERE id = ${pinRecord.id}
    `;

    await sql`
      INSERT INTO auth_attempts (email, attempt_type, success)
      VALUES (${normalized}, 'otp_verify', TRUE)
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_platform_owner: user.is_platform_owner,
        is_demo: user.is_demo ?? false,
        organization_id: user.organization_id ?? null,
        subscription_id: user.parent_subscription_id ?? null,
      },
    });
  } catch (error) {
    console.error("Error verify OTP:", error);
    return NextResponse.json({ error: "Error al verificar OTP" }, { status: 500 });
  }
}
