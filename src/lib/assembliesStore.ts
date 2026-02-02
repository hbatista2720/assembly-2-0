type AssemblyTopic = {
  id: string;
  title: string;
  description?: string;
  type: "informativo" | "votacion_simple" | "votacion_calificada";
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
};

const STORAGE_KEY = "assembly_admin_ph_assemblies";

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

export const getAssemblies = (): Assembly[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedAssemblies();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Assembly[];
  } catch {
    const seeded = seedAssemblies();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

export const saveAssemblies = (assemblies: Assembly[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assemblies));
};

export const createAssembly = (assembly: Omit<Assembly, "id" | "topics" | "status">) => {
  const current = getAssemblies();
  const newAssembly: Assembly = {
    id: createId(),
    status: "Programada",
    topics: [],
    ...assembly,
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

export const findAssembly = (id: string) => getAssemblies().find((assembly) => assembly.id === id) || null;

export type { Assembly, AssemblyTopic };
