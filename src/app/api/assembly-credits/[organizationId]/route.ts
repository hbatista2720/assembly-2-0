import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;

  try {
    const credits = await sql<
      {
        id: string;
        earned_month: string;
        credits_earned: number;
        credits_used: number;
        expires_at: string;
      }[]
    >`
      SELECT id, earned_month, credits_earned, credits_used, expires_at
      FROM assembly_credits
      WHERE organization_id = ${organizationId}
        AND is_expired = FALSE
        AND expires_at > NOW()
      ORDER BY earned_month ASC
    `;

    const total_available = credits.reduce((sum, credit) => sum + (credit.credits_earned - credit.credits_used), 0);

    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const withMeta = credits.map((credit) => ({
      ...credit,
      credits_remaining: credit.credits_earned - credit.credits_used,
      days_until_expiry: Math.ceil(
        (new Date(credit.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    }));

    const expiring_soon = withMeta.filter((credit) => new Date(credit.expires_at) <= thirtyDays);

    return NextResponse.json({
      total_available,
      expiring_soon,
      all_credits: withMeta,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assembly credits." }, { status: 500 });
  }
}
