"use client";

import { useMemo, useState } from "react";

const PLAN_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  MULTI_PH_LITE: "Multi-PH Lite",
  MULTI_PH_PRO: "Multi-PH Pro",
  ENTERPRISE: "Enterprise",
};

const LIMITS = {
  STANDARD: { buildings: 1, residents: 250, assemblies: 2 },
  MULTI_PH_LITE: { buildings: 10, residents: 1500, assemblies: 5 },
  MULTI_PH_PRO: { buildings: 30, residents: 5000, assemblies: 15 },
};

export default function ROICalculator() {
  const [buildings, setBuildings] = useState(1);
  const [residents, setResidents] = useState(250);
  const [assemblies, setAssemblies] = useState(2);

  const suggestion = useMemo(() => {
    if (buildings > LIMITS.MULTI_PH_PRO.buildings || residents > LIMITS.MULTI_PH_PRO.residents || assemblies > LIMITS.MULTI_PH_PRO.assemblies) {
      return { plan: "ENTERPRISE", reason: "supera los limites de Multi-PH Pro" };
    }
    if (buildings > LIMITS.MULTI_PH_LITE.buildings || residents > LIMITS.MULTI_PH_LITE.residents || assemblies > LIMITS.MULTI_PH_LITE.assemblies) {
      return { plan: "MULTI_PH_PRO", reason: "supera los limites de Multi-PH Lite" };
    }
    if (buildings > LIMITS.STANDARD.buildings || residents > LIMITS.STANDARD.residents || assemblies > LIMITS.STANDARD.assemblies) {
      return { plan: "MULTI_PH_LITE", reason: "supera los limites de Standard" };
    }
    return { plan: "STANDARD", reason: "se mantiene dentro de Standard" };
  }, [assemblies, buildings, residents]);

  const explanation = useMemo(() => {
    if (suggestion.plan === "ENTERPRISE") {
      return `Recomendamos Enterprise porque ${suggestion.reason}.`;
    }
    if (suggestion.plan === "MULTI_PH_PRO") {
      return `Recomendamos Multi-PH Pro porque ${suggestion.reason}.`;
    }
    if (suggestion.plan === "MULTI_PH_LITE") {
      return `Recomendamos Multi-PH Lite porque ${suggestion.reason}.`;
    }
    return "Recomendamos Standard porque cumples con los limites actuales.";
  }, [suggestion.plan, suggestion.reason]);

  return (
    <section className="section">
      <div className="card" style={{ padding: "20px" }}>
        <h2 style={{ marginTop: 0 }}>Calculadora inteligente</h2>
        <p className="muted" style={{ marginTop: "6px" }}>
          Regla: se aplica el limite de lo que ocurra primero.
        </p>
        <div className="grid grid-3" style={{ marginTop: "16px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            Edificios que administro
            <input
              type="number"
              min={1}
              value={buildings}
              onChange={(event) => setBuildings(Number(event.target.value))}
            />
          </label>
          <label style={{ display: "grid", gap: "8px" }}>
            Residentes totales
            <input
              type="number"
              min={50}
              value={residents}
              onChange={(event) => setResidents(Number(event.target.value))}
            />
          </label>
          <label style={{ display: "grid", gap: "8px" }}>
            Asambleas por mes
            <input
              type="number"
              min={1}
              value={assemblies}
              onChange={(event) => setAssemblies(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="card" style={{ marginTop: "16px", background: "rgba(56,189,248,0.15)" }}>
          <strong>Plan recomendado: {PLAN_LABELS[suggestion.plan]}</strong>
          <p className="muted" style={{ marginTop: "6px" }}>
            {explanation}
          </p>
        </div>
      </div>
    </section>
  );
}
