"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { findAssembly } from "../../../../../../lib/assembliesStore";

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

export default function AssemblyVotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const assemblyId = typeof params?.id === "string" ? params.id : "";
  const topicId = searchParams.get("topic");
  const [votes, setVotes] = useState<VoteCounts>({ si: 0, no: 0, abst: 0 });
  const assembly = useMemo(() => (assemblyId ? findAssembly(assemblyId) : null), [assemblyId]);
  const topic = assembly?.topics.find((item) => item.id === topicId) || assembly?.topics[0];

  useEffect(() => {
    if (!assemblyId) return;
    setVotes(loadVotes(assemblyId));
  }, [assemblyId]);

  const totalVotes = votes.si + votes.no + votes.abst;

  const handleVote = (value: "si" | "no" | "abst") => {
    const updated = { ...votes, [value]: votes[value] + 1 };
    setVotes(updated);
    saveVotes(assemblyId, updated);
  };

  if (!assembly) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Asamblea no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <span className="pill">Votación activa</span>
          <h2 style={{ marginTop: "8px" }}>{topic?.title || "Tema sin definir"}</h2>
          <p className="muted" style={{ marginTop: "6px" }}>
            {assembly.title} · {assembly.date.replace("T", " ")}
          </p>
        </div>
        <a className="btn btn-ghost" href={`/dashboard/admin-ph/monitor/${assembly.id}`}>
          Ver Monitor
        </a>
        <a className="btn btn-primary" href="/presenter/demo-token">
          Vista presentación
        </a>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Emitir votos</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => handleVote("si")}>
            ✅ Sí
          </button>
          <button className="btn btn-ghost" onClick={() => handleVote("no")}>
            ❌ No
          </button>
          <button className="btn btn-ghost" onClick={() => handleVote("abst")}>
            ⚪ Abstención
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Resultados en vivo</h3>
        <div className="card-list">
          <div className="list-item">
            <span>✅ Sí</span>
            <strong>{votes.si}</strong>
          </div>
          <div className="list-item">
            <span>❌ No</span>
            <strong>{votes.no}</strong>
          </div>
          <div className="list-item">
            <span>⚪ Abstención</span>
            <strong>{votes.abst}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "12px" }}>
          Total votos: {totalVotes}
        </p>
      </div>
    </div>
  );
}
