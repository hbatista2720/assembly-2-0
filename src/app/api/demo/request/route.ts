/**
 * POST /api/demo/request – Crear o reservar demo por correo del cliente (chatbot).
 * Ref: Arquitecto/LOGICA_DEMO_POR_CORREO_CLIENTE.md, Marketing/MARKETING_PROPUESTA_DEMO_POR_CORREO_CLIENTE.md
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

const DEMO_SUBSCRIPTION_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const DEMO_EXPIRES_DAYS = 15;
const RATE_LIMIT_IP_PER_HOUR = 5;
const RATE_LIMIT_EMAIL_PER_DAY = 3;

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip") ?? null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const ip = getClientIp(req);

    // Rate limit y registro en auth_attempts (requiere migraciones 016-017)
    try {
      if (ip) {
        const [byIp] = await sql`
          SELECT COUNT(*)::int AS count
          FROM auth_attempts
          WHERE attempt_type = 'demo_request'
            AND ip_address = ${ip}::inet
            AND created_at > NOW() - INTERVAL '1 hour'
        `;
        if (byIp && (byIp as { count: number }).count >= RATE_LIMIT_IP_PER_HOUR) {
          return NextResponse.json(
            { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos o escribe a soporte." },
            { status: 429 }
          );
        }
      }

      const [byEmail] = await sql`
        SELECT COUNT(*)::int AS count
        FROM auth_attempts
        WHERE attempt_type = 'demo_request'
          AND email = ${email}
          AND created_at > NOW() - INTERVAL '1 day'
      `;
      if (byEmail && (byEmail as { count: number }).count >= RATE_LIMIT_EMAIL_PER_DAY) {
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos o escribe a soporte." },
          { status: 429 }
        );
      }

      try {
        await sql`
          INSERT INTO auth_attempts (email, attempt_type, success, ip_address)
          VALUES (${email}, 'demo_request', TRUE, ${ip ?? null}::inet)
        `;
      } catch {
        await sql`
          INSERT INTO auth_attempts (email, attempt_type, success)
          VALUES (${email}, 'demo_request', TRUE)
        `;
      }
    } catch {
      // auth_attempts puede no existir; continuar sin rate limit
    }

    // ¿Ya existe usuario con este correo y org demo (vigente o no)?
    const [existingUser] = await sql<{ id: string; organization_id: string }[]>`
      SELECT u.id, u.organization_id
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.email = ${email}
      LIMIT 1
    `;

    if (existingUser?.organization_id) {
      const [org] = await sql<{ is_demo: boolean; demo_expires_at: string | null }[]>`
        SELECT is_demo, demo_expires_at
        FROM organizations
        WHERE id = ${existingUser.organization_id}::uuid
        LIMIT 1
      `;
      if (org?.is_demo) {
        await upsertLead(email, "demo_active");
        return NextResponse.json({
          success: true,
          already_exists: true,
          login_url: "/login",
          message: "Ya tienes un demo activo. Entra aquí.",
        });
      }
    }

    if (existingUser) {
      await upsertLead(email, "demo_active");
      return NextResponse.json({
        success: true,
        already_exists: true,
        login_url: "/login",
        message: "Ya tienes una cuenta demo. Entra en el enlace.",
      });
    }

    // Crear organización demo (demo_expires_at requiere migración 015)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEMO_EXPIRES_DAYS);
    const orgName = `Demo - ${email.split("@")[0] ?? "PH"}`;

    let newOrg: { id: string } | undefined;
    try {
      [newOrg] = await sql<{ id: string }[]>`
        INSERT INTO organizations (name, is_demo, parent_subscription_id, demo_expires_at)
        VALUES (${orgName}, TRUE, ${DEMO_SUBSCRIPTION_ID}::uuid, ${expiresAt.toISOString()})
        RETURNING id
      `;
    } catch {
      [newOrg] = await sql<{ id: string }[]>`
        INSERT INTO organizations (name, is_demo, parent_subscription_id)
        VALUES (${orgName}, TRUE, ${DEMO_SUBSCRIPTION_ID}::uuid)
        RETURNING id
      `;
    }
    if (!newOrg?.id) {
      return NextResponse.json({ error: "No se pudo crear el demo." }, { status: 500 });
    }

    // Crear usuario ADMIN_PH ligado a la org demo
    await sql`
      INSERT INTO users (organization_id, email, role, is_platform_owner)
      VALUES (${newOrg.id}::uuid, ${email}, 'ADMIN_PH', FALSE)
    `;

    await upsertLead(email, "demo_active");

    return NextResponse.json({
      success: true,
      already_exists: false,
      login_url: "/login",
      message: "Tu demo está listo. Entra con este correo en el enlace.",
    });
  } catch (e) {
    console.error("[demo/request]", e);
    return NextResponse.json(
      { error: "No pudimos preparar tu demo ahora. Intenta más tarde o escribe a soporte." },
      { status: 500 }
    );
  }
}

async function upsertLead(email: string, funnelStage: string) {
  try {
    await sql`
      INSERT INTO platform_leads (email, lead_source, funnel_stage, updated_at)
      VALUES (${email}, 'chatbot', ${funnelStage}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        funnel_stage = EXCLUDED.funnel_stage,
        updated_at = NOW()
    `;
  } catch {
    // no bloqueante
  }
}
