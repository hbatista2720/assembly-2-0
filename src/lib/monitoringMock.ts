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
 * Si forceDemoUnits es true (usuario demo), siempre se usan 50 unidades (Urban Tower PH).
 * Así el Monitor muestra la asamblea asociada con 50 residentes y no 311.
 */
export const generateUnits = (assemblyId: string, forceDemoUnits?: boolean) => {
  const isDemo = forceDemoUnits || !assemblyId || assemblyId === "demo";
  const towers = isDemo ? TOWERS_DEMO : TOWERS_FULL;
  const seed = hashString(assemblyId || "demo");
  const random = mulberry32(seed);
  const units: Unit[] = [];

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

/**
 * Construye el resumen. Si se pasa topicTitle/topicId, el tema mostrado y los
 * resultados porcentuales se derivan de ese tema (reproducibles por tema).
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

  let resultsPct: { si: number; no: number; abst: number };
  if (options?.topicId != null || (options?.topicTitle != null && options.topicTitle !== "")) {
    const seed = hashString((options.topicId ?? "") + (options.topicTitle ?? ""));
    const rnd = mulberry32(seed);
    const si = Math.floor(rnd() * 40) + 45;
    const no = Math.floor(rnd() * 25) + 5;
    const abst = 100 - si - no;
    resultsPct = {
      si: Math.max(0, Math.round(si * 10) / 10),
      no: Math.max(0, Math.round(no * 10) / 10),
      abst: Math.max(0, Math.round(abst * 10) / 10),
    };
  } else {
    resultsPct = {
      si: Math.round((rawResults.si / totalVotes) * 1000) / 10,
      no: Math.round((rawResults.no / totalVotes) * 1000) / 10,
      abst: Math.round((rawResults.abst / totalVotes) * 1000) / 10,
    };
  }

  const topicTitle = options?.topicTitle && options.topicTitle.trim() !== ""
    ? options.topicTitle.trim()
    : "Votación en curso";

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
      "✅ Tema 1: Acta anterior (98% SI)",
      "✅ Tema 2: Informe financiero (85% SI)",
      "⏳ Tema 3: En votación...",
    ],
  };
};

export type { Unit };
