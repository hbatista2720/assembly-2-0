"use client";

import Link from "next/link";
import useAssemblyCredits from "../hooks/useAssemblyCredits";

export default function AssemblyCreditsDisplay({ organizationId }: { organizationId?: string | null }) {
  const { credits, loading } = useAssemblyCredits(organizationId);

  if (!organizationId) return null;
  if (loading) {
    return (
      <div className="card">
        <p className="muted">Cargando creditos...</p>
      </div>
    );
  }
  if (!credits) return null;

  if (credits.total_available < 1) {
    return (
      <div className="card" style={{ marginTop: "16px", borderLeft: "4px solid rgba(234, 179, 8, 0.8)", background: "rgba(250, 204, 21, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <span style={{ fontSize: "28px" }} aria-hidden>⚠️</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0, color: "#f59e0b" }}>Sin créditos disponibles</h3>
            <p className="muted" style={{ marginTop: "6px", marginBottom: "16px" }}>
              No tiene créditos disponibles para crear asambleas. Debe comprar crédito primero.
            </p>
            <Link href="/dashboard/admin-ph/subscription" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Ir a Comprar Créditos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expiringCount = credits.expiring_soon.reduce((sum, credit) => sum + credit.credits_remaining, 0);

  return (
    <div className="card dashboard-card-credits" style={{ marginTop: "16px", borderLeft: "4px solid rgba(16, 185, 129, 0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Creditos de asambleas</h3>
          <p className="muted" style={{ marginTop: "6px" }}>
            Creditos acumulables con expiracion a 6 meses.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong style={{ fontSize: "28px" }}>{credits.total_available}</strong>
          <p className="muted" style={{ marginTop: "4px" }}>
            disponibles
          </p>
        </div>
      </div>

      {credits.expiring_soon.length > 0 ? (
        <div
          className="card"
          style={{
            marginTop: "12px",
            borderLeft: "4px solid rgba(234,179,8,0.8)",
            background: "rgba(250,204,21,0.1)",
            borderRadius: "12px",
            padding: "14px 16px",
          }}
        >
          <strong>⚠️ Atencion</strong>
          <p className="muted" style={{ marginTop: "6px" }}>
            Tienes {expiringCount} creditos que vencen en los proximos 30 dias.
          </p>
          <div className="card-list" style={{ marginTop: "8px" }}>
            {credits.expiring_soon.map((credit) => (
              <div key={credit.id} className="list-item">
                <span>
                  {credit.credits_remaining} creditos · {new Date(credit.earned_month).toLocaleDateString("es-PA", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · vence en {credit.days_until_expiry} dias
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <details style={{ marginTop: "12px" }}>
        <summary style={{ cursor: "pointer" }}>Ver desglose</summary>
        <div className="card-list" style={{ marginTop: "8px" }}>
          {credits.all_credits.map((credit) => (
            <div key={credit.id} className="list-item">
              <span>
                {new Date(credit.earned_month).toLocaleDateString("es-PA", { month: "short", year: "numeric" })}
              </span>
              <span>{credit.credits_remaining} creditos</span>
              <span className="muted">
                vence {new Date(credit.expires_at).toLocaleDateString("es-PA")}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
