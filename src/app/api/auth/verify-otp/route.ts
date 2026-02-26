import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const OTP_MAX_VERIFY_PER_HOUR = Number(process.env.OTP_MAX_VERIFY_PER_HOUR || 5);
const OTP_DEBUG = process.env.OTP_DEBUG === "true";
const effectiveMaxVerify = OTP_DEBUG ? Math.max(OTP_MAX_VERIFY_PER_HOUR, 50) : OTP_MAX_VERIFY_PER_HOUR;

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    const pin = String(code || "").trim();

    if (!normalized || !pin) {
      return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 });
    }

    try {
      const [row] = await sql<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM auth_attempts
        WHERE email = ${normalized}
          AND attempt_type = 'otp_verify'
          AND created_at > NOW() - INTERVAL '1 hour'
      `;
      if (row && row.count >= effectiveMaxVerify) {
        return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
      }
    } catch {
      // auth_attempts puede no existir; continuar sin rate limit
    }

    const [userRow] = await sql`
      SELECT u.id, u.email, u.role, u.is_platform_owner, u.organization_id, o.is_demo, o.parent_subscription_id
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = ${normalized}
    `;
    if (!userRow) {
      try {
        await sql`INSERT INTO auth_attempts (email, attempt_type, success) VALUES (${normalized}, 'otp_verify', FALSE)`;
      } catch {
        // auth_attempts puede no existir
      }
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    let demoExpiresAt: string | null = null;
    if (userRow.organization_id) {
      try {
        const [row] = await sql<{ demo_expires_at: string | null }[]>`
          SELECT demo_expires_at FROM organizations WHERE id = ${userRow.organization_id}::uuid LIMIT 1
        `;
        demoExpiresAt = row?.demo_expires_at ?? null;
      } catch {
        // Columna demo_expires_at puede no existir (migración 015)
      }
    }

    const user = {
      ...userRow,
      demo_expires_at: demoExpiresAt,
      is_demo: userRow.is_demo ?? false,
    };

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
      try {
        await sql`INSERT INTO auth_attempts (email, attempt_type, success) VALUES (${normalized}, 'otp_verify', FALSE)`;
      } catch {
        // auth_attempts puede no existir
      }
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
    }

    const isDemoExpired = user.is_demo && user.demo_expires_at && new Date(user.demo_expires_at) < new Date();
    if (isDemoExpired) {
      return NextResponse.json(
        { error: "Tu periodo de demo ha terminado. Contáctanos para activar un plan." },
        { status: 403 }
      );
    }

    await sql`UPDATE auth_pins SET used = TRUE WHERE id = ${pinRecord.id}`;

    try {
      await sql`INSERT INTO auth_attempts (email, attempt_type, success) VALUES (${normalized}, 'otp_verify', TRUE)`;
    } catch {
      // auth_attempts puede no existir; no bloquear login
    }

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
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[verify-otp]", err.message, err.stack);
    return NextResponse.json({ error: "Error al verificar OTP" }, { status: 500 });
  }
}
