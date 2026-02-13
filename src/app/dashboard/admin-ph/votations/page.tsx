"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Votaciones unificado con Asambleas: redirige al módulo único de asambleas.
 */
export default function VotationsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/admin-ph/assemblies");
  }, [router]);
  return (
    <div className="card">
      <p className="muted">Redirigiendo al módulo de asambleas…</p>
    </div>
  );
}
