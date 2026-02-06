"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type VoteCounts = {
  si: number;
  no: number;
  abst: number;
};

const voteKey = (assemblyId: string) => `assembly_votes_${assemblyId}`;

const loadVotes = (assemblyId: string): VoteCounts => {
  if (typeof window === "undefined") return { si: 0, no: 0, abst: 0 };
  const raw = localStorage.getItem(voteKey(assemblyId));
  if (!raw) return { si: 0, no: 0, abst: 0 };
  try {
    return JSON.parse(raw) as VoteCounts;
  } catch {
    return { si: 0, no: 0, abst: 0 };
  }
};

const saveVotes = (assemblyId: string, votes: VoteCounts) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(voteKey(assemblyId), JSON.stringify(votes));
};

export default function ResidentVotePage() {
  const params = useParams();
  const router = useRouter();
  const assemblyId = typeof params?.id === "string" ? params.id : "demo";
  const [votes, setVotes] = useState<VoteCounts>({ si: 0, no: 0, abst: 0 });
  const [selected, setSelected] = useState<"si" | "no" | "abst" | null>(null);
  const [sessionOk, setSessionOk] = useState(false);

  // Validar sesión: si no hay usuario, redirigir a /login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("assembly_email");
    if (!email?.trim()) {
      const redirect = encodeURIComponent(`/assembly/${assemblyId}/vote`);
      router.replace(`/login?redirect=${redirect}`);
      return;
    }
    setSessionOk(true);
  }, [assemblyId, router]);

  useEffect(() => {
    if (!sessionOk) return;
    setVotes(loadVotes(assemblyId));
  }, [sessionOk, assemblyId]);

  if (sessionOk !== true) {
    return (
      <div className="container">
        <div className="card">Cargando…</div>
      </div>
    );
  }

  const handleVote = (value: "si" | "no" | "abst") => {
    if (selected) return;
    const updated = { ...votes, [value]: votes[value] + 1 };
    setVotes(updated);
    saveVotes(assemblyId, updated);
    setSelected(value);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Votación en curso</h1>
        <p className="muted">Selecciona tu opción para registrar el voto.</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <button className="btn btn-primary" onClick={() => handleVote("si")} disabled={!!selected}>
            ✅ Sí
          </button>
          <button className="btn btn-ghost" onClick={() => handleVote("no")} disabled={!!selected}>
            ❌ No
          </button>
          <button className="btn btn-ghost" onClick={() => handleVote("abst")} disabled={!!selected}>
            ⚪ Abstención
          </button>
        </div>
        {selected && (
          <div className="pill" style={{ marginTop: "16px" }}>
            Voto registrado: {selected.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
