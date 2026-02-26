/** Tipo de aprobación por tema (Ley 284). Mayoría reglamento = según Reglamento de Copropiedad. */
export type TopicApprovalType = "informativo" | "votacion_simple" | "votacion_calificada" | "votacion_reglamento";

type AssemblyTopic = {
  id: string;
  title: string;
  description?: string;
  type: TopicApprovalType;
  /** Si true, la votación de este tema está abierta para que los residentes voten (chatbot/sistema). El admin no vota aquí; activa/desactiva. */
  votingOpen?: boolean;
};

/** Ordinaria/Extraordinaria según Ley 284; Por derecho propio = por los residentes (3-5 días); Especial = tipo escrito manualmente (sin plazo legal). */
export type AssemblyType = "Ordinaria" | "Extraordinaria" | "Por derecho propio" | "Especial";

/** Paso del wizard Proceso de Asamblea (1–5). Persistencia de fase según Marketing. */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  1: "Residentes",
  2: "Crear",
  3: "Agendar",
  4: "Monitor",
  5: "Finalizar",
};

export const getWizardStepLabel = (step: WizardStep): string => WIZARD_STEP_LABELS[step];

type Assembly = {
  id: string;
  title: string;
  type: AssemblyType;
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
  /** Si type es "Especial", tipo de asamblea escrito manualmente (ej. "Por derecho propio", "20% de propietarios al día"). */
  typeCustom?: string;
  /** Fase del wizard Proceso de Asamblea (1–5). Persistencia para retomar donde quedó. */
  wizard_step?: WizardStep;
};

const STORAGE_KEY = "assembly_admin_ph_assemblies";
const STORAGE_KEY_DEMO = "assembly_admin_ph_assemblies_demo";
const DEMO_EMAIL = "demo@assembly2.com";

const isDemoUser = (): boolean => {
  if (typeof window === "undefined") return false;
  return (localStorage.getItem("assembly_email") || "").toLowerCase() === DEMO_EMAIL.toLowerCase();
};

function getCurrentPhId(): string {
  if (typeof window === "undefined") return "urban-tower";
  return sessionStorage.getItem("assembly_admin_selected_ph") || "urban-tower";
}

/** Clave de storage por PH. urban-tower usa la clave legacy; PHs custom tienen la suya. */
function getStorageKey(phId?: string): string {
  const pid = phId ?? getCurrentPhId();
  if (!isDemoUser()) return STORAGE_KEY;
  return pid === "urban-tower" ? STORAGE_KEY_DEMO : `${STORAGE_KEY_DEMO}_${pid}`;
}

/** Clave de archivo temporal (asambleas eliminadas en fase 1, recuperables). */
function getArchiveStorageKey(phId?: string): string {
  const pid = phId ?? getCurrentPhId();
  const base = getStorageKey(pid);
  return `${base}_archive`;
}

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

/** Versión del seed demo: al aumentar, se reemplazan asambleas demo antiguas por las de Urban Tower (orden día, presupuesto, remodelación garita). */
const DEMO_SEED_VERSION = 3;

/** Seed para usuario demo (PH Urban Tower): 1 Ordinaria (orden día + presupuesto 2026) y 1 Extraordinaria (remodelación garita). */
const seedDemoAssemblies = (): Assembly[] => [
  {
    id: createId(),
    title: "Asamblea Ordinaria 2026",
    type: "Ordinaria",
    date: "2026-02-15T18:00",
    location: "Urban Tower · Salón de eventos - Piso 1",
    status: "Programada",
    attendeesCount: 50,
    faceIdCount: 35,
    orderOfDay: "1. Aprobar el orden del día.\n2. Aprobación del presupuesto 2026.\n3. Temas varios.",
    secondCallWarning: true,
    mode: "Presencial",
    topics: [
      { id: createId(), title: "Aprobar el orden del día", description: "Aprobación del orden del día de la asamblea.", type: "informativo" },
      { id: createId(), title: "Aprobación del presupuesto 2026", description: "Votación por mayoría simple.", type: "votacion_simple" },
    ],
  },
  {
    id: createId(),
    title: "Asamblea Extraordinaria - Remodelación garita",
    type: "Extraordinaria",
    date: "2026-02-28T19:00",
    location: "Urban Tower · Sala principal",
    status: "Programada",
    attendeesCount: 50,
    faceIdCount: 35,
    orderOfDay: "1. Convocatoria y verificación de quórum.\n2. Aprobación de remodelación de garita.",
    secondCallWarning: true,
    mode: "Presencial",
    topics: [
      { id: createId(), title: "Aprobación de remodelación de garita", description: "Aprobación de presupuesto para remodelación de garita.", type: "votacion_calificada" },
    ],
  },
];

export const getAssemblies = (phId?: string): Assembly[] => {
  if (typeof window === "undefined") return [];
  const pid = phId ?? getCurrentPhId();
  const key = getStorageKey(pid);
  const versionKey = key + "_v";

  if (isDemoUser()) {
    const storedVersion = parseInt(localStorage.getItem(versionKey) ?? "0", 10);
    if (pid === "urban-tower" && storedVersion < DEMO_SEED_VERSION) {
      const seeded = seedDemoAssemblies();
      localStorage.setItem(key, JSON.stringify(seeded));
      localStorage.setItem(versionKey, String(DEMO_SEED_VERSION));
      return seeded;
    }
    if (pid !== "urban-tower") {
      // PHs custom: sin seed, empiezan vacíos
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      try {
        const list = JSON.parse(raw) as Assembly[];
        return list.map((a) => (a.type === "Manual" ? { ...a, type: "Especial" as const } : a));
      } catch {
        return [];
      }
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
    const list = JSON.parse(raw) as Assembly[];
    return list.map((a) => (a.type === "Manual" ? { ...a, type: "Especial" as const } : a));
  } catch {
    const seeded = isDemoUser() ? seedDemoAssemblies() : seedAssemblies();
    localStorage.setItem(key, JSON.stringify(seeded));
    if (isDemoUser()) localStorage.setItem(versionKey, String(DEMO_SEED_VERSION));
    return seeded;
  }
};

export const saveAssemblies = (assemblies: Assembly[], phId?: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(phId), JSON.stringify(assemblies));
};

export const createAssembly = (assembly: Omit<Assembly, "id" | "status"> & { topics?: AssemblyTopic[] }, phId?: string) => {
  const current = getAssemblies(phId ?? getCurrentPhId());
  const normalizedTopics = (assembly.topics ?? []).map((t) => ({ ...t, id: t.id || createId() }));
  const newAssembly: Assembly = {
    id: createId(),
    status: "Programada",
    secondCallWarning: true,
    mode: "Presencial",
    wizard_step: 1,
    ...assembly,
    topics: normalizedTopics,
    attendeesCount: isDemoUser() ? 50 : (assembly.attendeesCount ?? 200),
    faceIdCount: isDemoUser() ? 35 : (assembly.faceIdCount ?? 130),
  };
  const updated = [newAssembly, ...current];
  saveAssemblies(updated, phId ?? getCurrentPhId());
  return newAssembly;
};

export const updateAssembly = (id: string, updater: (assembly: Assembly) => Assembly, phId?: string) => {
  const pid = phId ?? getCurrentPhId();
  const current = getAssemblies(pid);
  const updated = current.map((assembly) => (assembly.id === id ? updater(assembly) : assembly));
  saveAssemblies(updated, pid);
  return updated.find((assembly) => assembly.id === id) || null;
};

/** Archivo temporal: asambleas eliminadas en fase 1 (recuperables). */
export const getArchivedAssemblies = (phId?: string): Assembly[] => {
  if (typeof window === "undefined") return [];
  const key = getArchiveStorageKey(phId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as Assembly[];
  } catch {
    return [];
  }
};

/** Mueve asamblea al archivo temporal. Solo si wizard_step === 1. */
export const archiveAssembly = (id: string, phId?: string): boolean => {
  const pid = phId ?? getCurrentPhId();
  const current = getAssemblies(pid);
  const assembly = current.find((a) => a.id === id);
  if (!assembly) return false;
  const step = (assembly.wizard_step ?? 1) as WizardStep;
  if (step !== 1) return false;
  if (assembly.status === "Completada") return false;
  const archived = [...getArchivedAssemblies(pid), assembly];
  localStorage.setItem(getArchiveStorageKey(pid), JSON.stringify(archived));
  saveAssemblies(current.filter((a) => a.id !== id), pid);
  return true;
};

/** Restaura asamblea desde archivo temporal a la lista activa. */
export const restoreArchivedAssembly = (id: string, phId?: string): boolean => {
  const pid = phId ?? getCurrentPhId();
  const archived = getArchivedAssemblies(pid);
  const assembly = archived.find((a) => a.id === id);
  if (!assembly) return false;
  const current = getAssemblies(pid);
  saveAssemblies([assembly, ...current], pid);
  localStorage.setItem(getArchiveStorageKey(pid), JSON.stringify(archived.filter((a) => a.id !== id)));
  return true;
};

/** Borra definitivamente una asamblea del archivo temporal. No se puede recuperar. */
export const deleteArchivedAssemblyPermanently = (id: string, phId?: string): boolean => {
  const pid = phId ?? getCurrentPhId();
  const archived = getArchivedAssemblies(pid);
  const updated = archived.filter((a) => a.id !== id);
  if (updated.length === archived.length) return false;
  localStorage.setItem(getArchiveStorageKey(pid), JSON.stringify(updated));
  return true;
};

/** Elimina una asamblea moviéndola al archivo temporal. Solo permite si wizard_step === 1. */
export const deleteAssembly = (id: string, phId?: string): boolean => {
  return archiveAssembly(id, phId);
};

/** Indica si la asamblea ya se celebró y consumió crédito (no se puede editar, eliminar ni reprogramar). */
export const isAssemblyCelebrated = (assembly: Assembly): boolean => assembly.status === "Completada";

export const findAssembly = (id: string, phId?: string) => getAssemblies(phId ?? getCurrentPhId()).find((assembly) => assembly.id === id) || null;

/** Actualiza solo wizard_step de una asamblea (persistencia de fase). */
export const updateAssemblyWizardStep = (id: string, step: WizardStep, phId?: string) => {
  return updateAssembly(id, (a) => ({ ...a, wizard_step: step }), phId);
};

/** Restablece asambleas demo del PH dado. urban-tower: borra y recarga seed. PHs custom: borra todo. */
export const resetDemoAssemblies = (phId?: string): void => {
  if (typeof window === "undefined" || !isDemoUser()) return;
  const pid = phId ?? getCurrentPhId();
  try {
    const key = getStorageKey(pid);
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_v");
  } catch {
    // ignore
  }
};

export const isDemoUserExport = isDemoUser;

export type { Assembly, AssemblyTopic };
