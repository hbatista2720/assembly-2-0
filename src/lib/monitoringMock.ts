type Unit = {
  id: string;
  code: string;
  tower: string;
  owner: string;
  paymentStatus: "AL_DIA" | "MORA";
  isPresent: boolean;
  hasFaceId: boolean;
  voteValue: "SI" | "NO" | "ABSTENCION" | null;
  voteMethod: "FACE_ID" | "MANUAL" | null;
};

const TOWERS_FULL = [
  { id: "A", label: "Torre A", count: 200 },
  { id: "B", label: "Torre B", count: 111 },
];

const TOWERS_DEMO = [{ id: "A", label: "Torre A", count: 50 }];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), 1 | t);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Si forceDemoUnits es true (usuario demo), se generan 50 unidades con código "1".."50"
 * para sincronizar con el listado de residentes (Propietarios). Misma numeración en Monitor y listado.
 */
export const generateUnits = (assemblyId: string, forceDemoUnits?: boolean) => {
  const isDemo = forceDemoUnits || !assemblyId || assemblyId === "demo";
  const seed = hashString(assemblyId || "demo");
  const random = mulberry32(seed);
  const units: Unit[] = [];

  if (isDemo) {
    for (let i = 1; i <= 50; i += 1) {
      const roll = random();
      const paymentStatus = roll > 0.85 ? "MORA" : "AL_DIA";
      const isPresent = roll > 0.2;
      const hasFaceId = random() > 0.25;
      const voteValue = isPresent && paymentStatus !== "MORA" && random() > 0.35
        ? random() > 0.6
          ? "SI"
          : random() > 0.5
            ? "NO"
            : "ABSTENCION"
        : null;
      const voteMethod = isPresent ? (hasFaceId ? "FACE_ID" : "MANUAL") : null;
      const code = String(i);
      units.push({
        id: code,
        code,
        tower: "A",
        owner: `Residente ${i}`,
        paymentStatus,
        isPresent,
        hasFaceId,
        voteValue,
        voteMethod,
      });
    }
    return units;
  }

  const towers = TOWERS_FULL;
  for (const tower of towers) {
    for (let i = 1; i <= tower.count; i += 1) {
      const roll = random();
      const paymentStatus = roll > 0.85 ? "MORA" : "AL_DIA";
      const isPresent = roll > 0.2;
      const hasFaceId = random() > 0.25;
      const voteValue = isPresent && paymentStatus !== "MORA" && random() > 0.35
        ? random() > 0.6
          ? "SI"
          : random() > 0.5
            ? "NO"
            : "ABSTENCION"
        : null;
      const voteMethod = isPresent ? (hasFaceId ? "FACE_ID" : "MANUAL") : null;
      units.push({
        id: `${tower.id}-${i}`,
        code: `${tower.id}${i}`,
        tower: tower.id,
        owner: `Propietario ${tower.id}${i}`,
        paymentStatus,
        isPresent,
        hasFaceId,
        voteValue,
        voteMethod,
      });
    }
  }

  return units;
};

export type BuildSummaryOptions = {
  topicTitle?: string;
  topicId?: string;
};

/** Aplica voteValue por tema (determinístico) para que Vista Tablero filtre correctamente. */
export function applyTopicVotes(
  units: { id: string; voteValue: "SI" | "NO" | "ABSTENCION" | null; paymentStatus: string; isPresent?: boolean; [k: string]: unknown }[],
  topicId: string | null,
  topicTitle: string | null
): typeof units {
  if (!topicId && !topicTitle) return units;
  const seedStr = (topicId ?? "") + "|" + (topicTitle ?? "");
  if (!seedStr.trim() || seedStr === "|") return units;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = ((seed << 5) - seed) + seedStr.charCodeAt(i) | 0;
  seed = Math.abs(seed) || 1;
  const lcg = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  return units.map((u) => {
    const canVote = u.paymentStatus !== "MORA" && u.isPresent !== false;
    const v = lcg();
    const voteValue: "SI" | "NO" | "ABSTENCION" | null = !canVote ? null : v < 0.55 ? "SI" : v < 0.85 ? "NO" : "ABSTENCION";
    return { ...u, voteValue };
  });
}

/**
 * Construye el resumen. Si se pasa topicTitle/topicId, el tema mostrado se usa y
 * los resultados porcentuales se derivan de los voteValue de las unidades (sincronizado con Vista Tablero).
 */
export const buildSummary = (units: Unit[], options?: BuildSummaryOptions) => {
  const total = units.length;
  const present = units.filter((unit) => unit.isPresent).length;
  const voted = units.filter((unit) => unit.voteValue).length;
  const mora = units.filter((unit) => unit.paymentStatus === "MORA").length;
  const faceId = units.filter((unit) => unit.hasFaceId).length;

  const rawResults = units.reduce(
    (acc, unit) => {
      if (unit.voteValue === "SI") acc.si += 1;
      if (unit.voteValue === "NO") acc.no += 1;
      if (unit.voteValue === "ABSTENCION") acc.abst += 1;
      return acc;
    },
    { si: 0, no: 0, abst: 0 },
  );

  const totalVotes = Math.max(rawResults.si + rawResults.no + rawResults.abst, 1);
  const quorumPct = total === 0 ? 0 : Math.round((present / total) * 1000) / 10;

  const resultsPct = {
    si: Math.round((rawResults.si / totalVotes) * 1000) / 10,
    no: Math.round((rawResults.no / totalVotes) * 1000) / 10,
    abst: Math.round((rawResults.abst / totalVotes) * 1000) / 10,
  };

  const topicTitle = options?.topicTitle && options.topicTitle.trim() !== ""
    ? options.topicTitle.trim()
    : "Aprobación del presupuesto 2026";

  return {
    stats: { total, present, voted, mora, faceId },
    quorum: {
      percentage: quorumPct,
      achieved: quorumPct >= 51,
      present,
      total,
    },
    votation: {
      topic: topicTitle,
      votesCount: voted,
      attendeesCount: present,
      results: resultsPct,
    },
    history: [
      "✅ Aprobar el orden del día",
      "⏳ Aprobación del presupuesto 2026 (en votación)",
      "— Aprobación de remodelación de garita (Extraordinaria)",
    ],
  };
};

export type { Unit };
