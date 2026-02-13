"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dashboard principal: redirige al dashboard según el rol del usuario.
 * /dashboard → /dashboard/admin-ph o /dashboard/platform-admin
 * Evita 404 cuando el usuario accede a /dashboard o hace clic en "Volver al Dashboard principal".
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = typeof document !== "undefined" ? document.cookie.match(/assembly_role=([^;]+)/)?.[1]?.trim() : "";
    const isPlatformAdmin =
      role === "Admin Plataforma" ||
      (typeof localStorage !== "undefined" && localStorage.getItem("assembly_platform_admin") === "1");
    if (isPlatformAdmin) {
      router.replace("/dashboard/platform-admin");
      return;
    }
    router.replace("/dashboard/admin-ph");
  }, [router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text, #94a3b8)" }}>
      Redirigiendo al dashboard…
    </div>
  );
}
