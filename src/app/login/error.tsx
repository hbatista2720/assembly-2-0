"use client";

import { useEffect } from "react";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[login error]", error.message, error.digest);
  }, [error]);

  return (
    <main className="container login-ios auth-root" style={{ padding: "2rem", maxWidth: "560px", margin: "0 auto" }}>
      <div className="card glass" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "1.25rem" }}>Algo salió mal</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>
          No se pudo cargar la página de acceso. Intenta de nuevo o vuelve al inicio.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => reset()}
          >
            Reintentar
          </button>
          <a href="/" className="btn btn-ghost">
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
