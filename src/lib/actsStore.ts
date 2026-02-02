import { findAssembly, getAssemblies, type Assembly } from "./assembliesStore";

type ActRecord = {
  id: string;
  assemblyId: string;
  assemblyTitle: string;
  createdAt: string;
  status: "Final";
  signatureHash?: string;
  votes: {
    si: number;
    no: number;
    abst: number;
  };
  participationPct: number;
  quorumAchieved: boolean;
};

const STORAGE_KEY = "assembly_admin_ph_acts";
const voteKey = (assemblyId: string) => `assembly_votes_${assemblyId}`;

const createId = () => `act_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const loadVotes = (assemblyId: string) => {
  if (typeof window === "undefined") return { si: 0, no: 0, abst: 0 };
  const raw = localStorage.getItem(voteKey(assemblyId));
  if (!raw) return { si: 0, no: 0, abst: 0 };
  try {
    return JSON.parse(raw) as { si: number; no: number; abst: number };
  } catch {
    return { si: 0, no: 0, abst: 0 };
  }
};

export const getActs = (): ActRecord[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ActRecord[];
  } catch {
    return [];
  }
};

const saveActs = (acts: ActRecord[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(acts));
};

export const upsertAct = (act: ActRecord) => {
  const current = getActs();
  const exists = current.some((item) => item.id === act.id);
  const updated = exists ? current.map((item) => (item.id === act.id ? act : item)) : [act, ...current];
  saveActs(updated);
  return updated;
};

export const generateActFromAssembly = (assemblyId: string) => {
  const assembly = findAssembly(assemblyId);
  if (!assembly) return null;
  const votes = loadVotes(assemblyId);
  const totalVotes = votes.si + votes.no + votes.abst;
  const participationPct = assembly.attendeesCount
    ? Math.round((totalVotes / assembly.attendeesCount) * 1000) / 10
    : 0;
  const quorumAchieved = assembly.attendeesCount
    ? Math.round((assembly.attendeesCount * 0.51) <= totalVotes ? 1 : 0) === 1
    : false;

  const act: ActRecord = {
    id: createId(),
    assemblyId,
    assemblyTitle: assembly.title,
    createdAt: new Date().toISOString(),
    status: "Final",
    votes,
    participationPct,
    quorumAchieved,
  };

  const current = getActs();
  const updated = [act, ...current];
  saveActs(updated);
  return act;
};

export const getActById = (actId: string) => getActs().find((act) => act.id === actId) || null;

export const getAssembliesSummary = () =>
  getAssemblies().map((assembly: Assembly) => ({
    id: assembly.id,
    title: assembly.title,
    date: assembly.date,
  }));

export const buildActsCsv = (acts: ActRecord[]) => {
  const header = [
    "Acta ID",
    "Asamblea",
    "Fecha Generacion",
    "SI",
    "NO",
    "ABSTENCION",
    "Participacion %",
    "Quorum",
    "Firma Digital",
  ];
  const rows = acts.map((act) => [
    act.id,
    act.assemblyTitle,
    act.createdAt,
    act.votes.si,
    act.votes.no,
    act.votes.abst,
    act.participationPct,
    act.quorumAchieved ? "ALCANZADO" : "PENDIENTE",
    act.signatureHash || "",
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
};

export type { ActRecord };
