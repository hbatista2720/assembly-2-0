"use client";

import { useMemo, useState } from "react";

type LimitState = {
  current: number;
  limit: number | null;
  percentage: number;
  exceeded?: boolean;
};

type LimitsPayload = {
  organizations?: LimitState;
  units?: LimitState;
  assemblies?: LimitState;
};

export default function UpgradeBanner({ limits }: { limits: LimitsPayload }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("upgrade_banner_dismissed") === "true";
  });

  const entries = useMemo(() => {
    const rows: Array<{ label: string; value?: LimitState }> = [
      { label: "Edificios", value: limits.organizations },
      { label: "Residentes", value: limits.units },
      { label: "Asambleas", value: limits.assemblies },
    ];
    return rows.filter((row) => row.value && row.value.percentage >= 90);
  }, [limits]);

  if (dismissed || entries.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("upgrade_banner_dismissed", "true");
    }
  };

  return (
    <div
      className="card upgrade-banner"
      style={{
        borderLeft: "4px solid rgba(234,179,8,0.9)",
        background: "rgba(250,204,21,0.12)",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <strong>⚠️ Upgrade sugerido</strong>
          <p className="muted" style={{ marginTop: "6px" }}>
            Estas cerca de alcanzar limites de tu plan.
          </p>
          <div className="card-list" style={{ marginTop: "8px" }}>
            {entries.map((entry) => (
              <div key={entry.label} className="list-item">
                <span>
                  {entry.label}: {entry.value?.current}/{entry.value?.limit} ({entry.value?.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a className="btn btn-primary" href="/pricing">
            Ver planes superiores
          </a>
          <button className="btn btn-ghost" onClick={handleDismiss}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
