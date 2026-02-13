type AssemblyTopic = {
  id: string;
  title: string;
  description?: string;
  type: "informativo" | "votacion_simple" | "votacion_calificada";
  /** Si true, la votación de este tema está abierta para que los residentes voten (chatbot/sistema). El admin no vota aquí; activa/desactiva. */
  votingOpen?: boolean;
};

type Assembly = {
  id: string;
  title: string;
  type: "Ordinaria" | "Extraordinaria";
  date: string;
  location: string;
  status: "Programada" | "En vivo" | "Completada";
  attendeesCount: number;
  faceIdCount: number;
  topics: AssemblyTopic[];
  /** Orden del día / agenda (Ley 284). Obligatorio para crear. */
  orderOfDay?: string;
  /** Advertencia segundo llamado incluida en convocatoria (Ley 284). */
  secondCallWarning?: boolean;
  /** Modo: Presencial, Virtual, Mixta. */
  mode?: "Presencial" | "Virtual" | "Mixta";
  /** Enlace de reunión si Virtual o Mixta. */
  meetingLink?: string;
};

const STORAGE_KEY = "assembly_admin_ph_assemblies";
const STORAGE_KEY_DEMO = "assembly_admin_ph_assemblies_demo";
const DEMO_EMAIL = "demo@assembly2.com";

const isDemoUser = (): boolean => {
  if (typeof window === "undefined") return false;
  return (localStorage.getItem("assembly_email") || "").toLowerCase() === DEMO_EMAIL.toLowerCase();
};

const getStorageKey = (): string => (isDemoUser() ? STORAGE_KEY_DEMO : STORAGE_KEY);

const createId = () => `asm_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const seedAssemblies = (): Assembly[] => [
  {
    id: createId(),
    title: "Asamblea Ordinaria 2026",
    type: "Ordinaria",
    date: "2026-02-15T18:00",
    location: "Salón de eventos - Piso 1",
    status: "Programada",
    attendeesCount: 170,
    faceIdCount: 130,
    topics: [
      {
        id: createId(),
        title: "Aprobación del acta anterior",
        description: "Revisión y aprobación del acta 2025.",
        type: "informativo",
      },
      {
        id: createId(),
        title: "Aprobación de presupuesto 2026",
        description: "Votación por mayoría simple.",
        type: "votacion_simple",
      },
    ],
  },
  {
    id: createId(),
    title: "Asamblea Extraordinaria - Piscina",
    type: "Extraordinaria",
    date: "2026-02-28T19:00",
    location: "Sala principal",
    status: "Programada",
    attendeesCount: 200,
    faceIdCount: 135,
    topics: [
      {
        id: createId(),
        title: "Mantenimiento de piscina",
        description: "Aprobación de presupuesto extraordinario.",
        type: "votacion_calificada",
      },
    ],
  },
];

/** Versión del seed demo: al aumentar, se reemplazan asambleas demo antiguas por 2 ejemplos con todos los campos Ley 284. */
const DEMO_SEED_VERSION = 2;

/** Seed para usuario demo: 2 asambleas de ejemplo con todos los campos sugeridos por Marketing (Ley 284). */
const seedDemoAssemblies = (): Assembly[] => [
  {
    id: createId(),
    title: "Asamblea Ordinaria 2026",
    type: "Ordinaria",
    date: "2026-02-15T18:00",
    location: "Salón de eventos - Piso 1",
    status: "Programada",
    attendeesCount: 50,
    faceIdCount: 35,
    orderOfDay: "1. Aprobación del acta anterior.\n2. Informe de gestión y estados financieros.\n3. Aprobación de presupuesto 2026.\n4. Temas varios.",
    secondCallWarning: true,
    mode: "Presencial",
    topics: [
      { id: createId(), title: "Aprobación del acta anterior", description: "Revisión y aprobación del acta 2025.", type: "informativo" },
      { id: createId(), title: "Aprobación de presupuesto 2026", description: "Votación por mayoría simple.", type: "votacion_simple" },
    ],
  },
  {
    id: createId(),
    title: "Asamblea Extraordinaria - Piscina",
    type: "Extraordinaria",
    date: "2026-02-28T19:00",
    location: "Sala principal",
    status: "Programada",
    attendeesCount: 50,
    faceIdCount: 35,
    orderOfDay: "1. Convocatoria y verificación de quórum.\n2. Mantenimiento de piscina – aprobación de presupuesto extraordinario.",
    secondCallWarning: true,
    mode: "Mixta",
    meetingLink: "https://meet.example.com/asamblea-piscina",
    topics: [
      { id: createId(), title: "Mantenimiento de piscina", description: "Aprobación de presupuesto extraordinario.", type: "votacion_calificada" },
    ],
  },
];

export const getAssemblies = (): Assembly[] => {
  if (typeof window === "undefined") return [];
  const key = getStorageKey();
  const versionKey = key + "_v";

  if (isDemoUser()) {
    const storedVersion = parseInt(localStorage.getItem(versionKey) ?? "0", 10);
    if (storedVersion < DEMO_SEED_VERSION) {
      const seeded = seedDemoAssemblies();
      localStorage.setItem(key, JSON.stringify(seeded));
      localStorage.setItem(versionKey, String(DEMO_SEED_VERSION));
      return seeded;
    }
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    const seeded = isDemoUser() ? seedDemoAssemblies() : seedAssemblies();
    localStorage.setItem(key, JSON.stringify(seeded));
    if (isDemoUser()) localStorage.setItem(versionKey, String(DEMO_SEED_VERSION));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Assembly[];
  } catch {
    const seeded = isDemoUser() ? seedDemoAssemblies() : seedAssemblies();
    localStorage.setItem(key, JSON.stringify(seeded));
    if (isDemoUser()) localStorage.setItem(versionKey, String(DEMO_SEED_VERSION));
    return seeded;
  }
};

export const saveAssemblies = (assemblies: Assembly[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(), JSON.stringify(assemblies));
};

export const createAssembly = (assembly: Omit<Assembly, "id" | "topics" | "status">) => {
  const current = getAssemblies();
  const newAssembly: Assembly = {
    id: createId(),
    status: "Programada",
    topics: [],
    secondCallWarning: true,
    mode: "Presencial",
    ...assembly,
    attendeesCount: isDemoUser() ? 50 : (assembly.attendeesCount ?? 200),
    faceIdCount: isDemoUser() ? 35 : (assembly.faceIdCount ?? 130),
  };
  const updated = [newAssembly, ...current];
  saveAssemblies(updated);
  return newAssembly;
};

export const updateAssembly = (id: string, updater: (assembly: Assembly) => Assembly) => {
  const current = getAssemblies();
  const updated = current.map((assembly) => (assembly.id === id ? updater(assembly) : assembly));
  saveAssemblies(updated);
  return updated.find((assembly) => assembly.id === id) || null;
};

/** Elimina una asamblea. Solo permite eliminar si no está celebrada (crédito no consumido). */
export const deleteAssembly = (id: string): boolean => {
  const current = getAssemblies();
  const assembly = current.find((a) => a.id === id);
  if (!assembly || assembly.status === "Completada") return false;
  saveAssemblies(current.filter((a) => a.id !== id));
  return true;
};

/** Indica si la asamblea ya se celebró y consumió crédito (no se puede editar, eliminar ni reprogramar). */
export const isAssemblyCelebrated = (assembly: Assembly): boolean => assembly.status === "Completada";

export const findAssembly = (id: string) => getAssemblies().find((assembly) => assembly.id === id) || null;

export type { Assembly, AssemblyTopic };
