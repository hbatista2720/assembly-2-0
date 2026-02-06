"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_VOTO_TEMA_DIA = "residentes_voto_tema_dia";

type TemaActivo = {
  title: string;
  status: "Abierto" | "Cerrado" | "Próximamente";
};

export default function ResidenteVotacionPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<"si" | "no" | "abst" | null>(null);
  const [tema, setTema] = useState<TemaActivo>({ title: "Aprobación de presupuesto", status: "Abierto" });

  // Validar sesión: si no hay usuario, redirigir a /login
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const email = localStorage.getItem("assembly_email");
    if (!email?.trim()) {
      const redirect = encodeURIComponent("/residentes/votacion");
      router.replace(`/login?redirect=${redirect}`);
      return;
    }
    const saved = localStorage.getItem(STORAGE_VOTO_TEMA_DIA);
    if (saved) {
      try {
        const { vote } = JSON.parse(saved) as { vote: "si" | "no" | "abst" };
        setSelectedVote(vote);
      } catch {
        // ignore
      }
    }
  }, [mounted, router]);

  // Opcional: cargar tema y estado desde API (por ahora fallback hardcoded)
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const loadTema = async () => {
      try {
        const res = await fetch("/api/tema-activo");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.title != null) {
            setTema({ title: data.title, status: data.status || "Abierto" });
          }
        }
      } catch {
        // Mantener valores por defecto
      }
    };
    loadTema();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const handleEmitirVoto = () => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("assembly_email");
    if (!email?.trim()) {
      router.replace("/login?redirect=" + encodeURIComponent("/residentes/votacion"));
      return;
    }
    setModalOpen(true);
  };

  const handleVoteOption = (value: "si" | "no" | "abst") => {
    if (selectedVote) return;
    setSelectedVote(value);
    setModalOpen(false);
    try {
      localStorage.setItem(
        STORAGE_VOTO_TEMA_DIA,
        JSON.stringify({ vote: value, at: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  };

  if (!mounted) {
    return (
      <main className="container">
        <div className="card">Cargando…</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0 }}>Votación activa</h1>
        <p className="muted" style={{ marginTop: "6px" }}>
          Revisa el tema del día y emite tu voto con trazabilidad legal.
        </p>
        <a className="btn btn-ghost" href="/chat">
          Volver al chat
        </a>
        <a className="btn btn-ghost" href="/residentes/asambleas" style={{ marginLeft: "8px" }}>
          Ver asambleas
        </a>
      </div>

      <div className="card">
        <div className="list-item">
          <span>Tema del día</span>
          <strong>{tema.title}</strong>
        </div>
        <div className="list-item">
          <span>Estado</span>
          <strong>{tema.status}</strong>
        </div>
        {tema.status !== "Abierto" ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            La votación no está abierta en este momento.
          </p>
        ) : selectedVote ? (
          <div className="pill" style={{ marginTop: "16px" }}>
            Voto registrado: {selectedVote.toUpperCase()}
          </div>
        ) : (
          <button
            className="btn btn-primary btn-demo"
            style={{ marginTop: "16px" }}
            onClick={handleEmitirVoto}
          >
            Emitir voto
          </button>
        )}
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Elegir opción de voto"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "360px", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Emitir voto</h3>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Tema: {tema.title}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => handleVoteOption("si")}
              >
                ✅ Sí
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleVoteOption("no")}
              >
                ❌ No
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleVoteOption("abst")}
              >
                ⚪ Abstención
              </button>
            </div>
            <button
              className="btn btn-ghost"
              style={{ marginTop: "12px" }}
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
