"use client";

/**
 * FASE 10: Banner de modo demo/sandbox con CTA para upgrade.
 */

const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";

export default function DemoBanner() {
  const isDemo =
    typeof window !== "undefined" &&
    (window.location.search.includes("mode=demo") ||
      localStorage.getItem("assembly_organization_id") === DEMO_ORG_ID);

  if (!isDemo) return null;

  return (
    <div
      style={{
        padding: "14px 20px",
        marginBottom: "16px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.2))",
        border: "1px solid rgba(99, 102, 241, 0.5)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div>
        <strong>Modo demo</strong>
        <span className="muted" style={{ marginLeft: "8px" }}>
          Los datos son de ejemplo y se reinician cada 24h.
        </span>
      </div>
      <a href="/dashboard/admin-ph/subscription" className="btn btn-primary" style={{ flexShrink: 0 }}>
        Subir a plan real
      </a>
    </div>
  );
}
