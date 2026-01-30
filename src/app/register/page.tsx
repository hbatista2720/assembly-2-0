"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState<"code" | "faceid" | "done">("code");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<"FACE_ID" | "MANUAL" | "">("");
  const [error, setError] = useState("");

  const handleValidateCode = () => {
    setError("");
    if (!code.trim()) {
      setError("Ingresa tu codigo de registro.");
      return;
    }
    setStep("faceid");
  };

  const handleFaceIdResult = (result: "FACE_ID" | "MANUAL") => {
    setMethod(result);
    try {
      localStorage.setItem("voting_method", result);
    } catch {
      // ignore storage issues
    }
    setStep("done");
  };

  return (
    <main className="container">
      <div className="card glass" style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Registro de Residentes</h1>
        <p style={{ color: "#cbd5f5" }}>
          Registra tu acceso en dos pasos: codigo + validacion de voto.
        </p>

        {step === "code" ? (
          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              Codigo de registro
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="COD-123-XYZ"
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#e2e8f0",
                }}
              />
            </label>
            {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}
            <button className="btn btn-primary btn-demo" onClick={handleValidateCode}>
              Validar codigo
            </button>
          </div>
        ) : null}

        {step === "faceid" ? (
          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            <div className="card-list">
              <div className="list-item">
                <span>🔐</span>
                <span>Intentaremos validar tu Face ID para votar.</span>
              </div>
              <div className="list-item">
                <span>📝</span>
                <span>Si falla, habilitamos voto manual (presencial o Zoom).</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-demo" onClick={() => handleFaceIdResult("FACE_ID")}>
                Simular Face ID
              </button>
              <button className="btn btn-ghost" onClick={() => handleFaceIdResult("MANUAL")}>
                No tengo Face ID
              </button>
            </div>
          </div>
        ) : null}

        {step === "done" ? (
          <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
            <h3 style={{ margin: 0 }}>Registro completado</h3>
            <p style={{ color: "#cbd5f5", margin: 0 }}>
              Metodo de votacion asignado: <strong>{method === "FACE_ID" ? "Face ID" : "Manual"}</strong>
            </p>
            <p className="muted" style={{ margin: 0 }}>
              Ya puedes continuar al flujo de asamblea.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
