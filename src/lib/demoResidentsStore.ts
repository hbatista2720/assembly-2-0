/**
 * Store de residentes para la versión demo (Urban Tower PH).
 * Parametrizado: 50 espacios para usuario demo. La DB puede habilitar el mismo
 * límite para organizaciones demo (ver documentación / migraciones).
 */

export const DEMO_RESIDENTS_LIMIT = 50;
export const DEMO_PH_NAME = "Urban Tower PH";
const STORAGE_KEY = "assembly_demo_residents";

export type PaymentStatus = "al_dia" | "mora";
export type ChatbotLoginStatus = "never" | "registered" | "logged_in";

export type DemoResident = {
  user_id: string;
  email: string;
  /** Nombre o identificación del residente/propietario. */
  nombre?: string;
  /** Número de finca (folio real) para actas. */
  numero_finca?: string;
  /** ID identidad del titular: cédula, pasaporte u otro (para actas y Junta Directiva). */
  cedula_identidad?: string;
  face_id_enabled: boolean;
  unit?: string;
  cuota_pct?: number;
  /** Estatus de pago: al día o en mora. */
  payment_status?: PaymentStatus;
  /** Si el correo está registrado en el chatbot. */
  chatbot_registered?: boolean;
  /** Estatus de login en chatbot: never, registered, logged_in. */
  chatbot_login_status?: ChatbotLoginStatus;
  /** Si tiene sesión abierta en el chatbot. */
  chatbot_session_active?: boolean;
  /** Última actividad (ISO). Para "conectado" se usa si es reciente. */
  last_activity_at?: string;
  /** Descripción de última actividad en asambleas (ej. "Votó en Asamblea 2026-01"). */
  assembly_activity?: string;
  /** 1 = Titular 1 de la unidad, 2 = Titular 2. */
  titular_orden?: 1 | 2;
  /** Si este titular está habilitado para votar en asamblea. */
  habilitado_para_asamblea?: boolean;
};

const createId = () => `demo_res_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function getStored(): DemoResident[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setStored(list: DemoResident[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Genera los 50 residentes demo por defecto (unidades 101–150, cuota 2 %, estatus variados). Algunas unidades tienen 2 titulares. */
function seedDefaultDemoResidents(): DemoResident[] {
  const list: DemoResident[] = [];
  const cuotaPct = 100 / DEMO_RESIDENTS_LIMIT;
  const now = new Date().toISOString();
  const recent = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  let id = 0;
  // Unidades 101-140: un residente cada una (40). Unidades 141-145: dos residentes cada una (10). Total 50.
  for (let u = 101; u <= 140; u++) {
    id++;
    const unit = String(u);
    const i = id;
    const payment_status: PaymentStatus = i <= 45 ? "al_dia" : "mora";
    const chatbot_registered = i % 5 !== 0;
    const chatbot_login_status: ChatbotLoginStatus = !chatbot_registered ? "never" : i % 4 === 0 ? "logged_in" : "registered";
    const chatbot_session_active = chatbot_login_status === "logged_in" && i % 2 === 0;
    list.push({
      user_id: `demo_res_seed_${id}`,
      email: `residente.Urban${id}@demo.assembly2.com`,
      nombre: `Residente Urban ${id}`,
      numero_finca: String(96000 + id),
      cedula_identidad: String(1000000000 + id).slice(0, 10),
      face_id_enabled: i % 3 !== 0,
      unit,
      cuota_pct: Math.round(cuotaPct * 100) / 100,
      payment_status,
      chatbot_registered,
      chatbot_login_status,
      chatbot_session_active,
      last_activity_at: chatbot_registered ? (i % 3 === 0 ? recent : now) : undefined,
      assembly_activity: i % 2 === 0 ? "Votó en Asamblea 2026-01" : i % 3 === 0 ? "Ingresó a sala en vivo" : undefined,
      titular_orden: 1,
      habilitado_para_asamblea: i % 2 === 1,
    });
  }
  for (let u = 141; u <= 145; u++) {
    const unit = String(u);
    const base = (u - 141) * 2;
    for (let t = 1; t <= 2; t++) {
      id++;
      const i = id;
      const payment_status: PaymentStatus = "al_dia";
      const chatbot_registered = i % 5 !== 0;
      const chatbot_login_status: ChatbotLoginStatus = !chatbot_registered ? "never" : i % 4 === 0 ? "logged_in" : "registered";
      const chatbot_session_active = chatbot_login_status === "logged_in" && t === 1;
      list.push({
        user_id: `demo_res_seed_${id}`,
        email: `residente.Urban${id}@demo.assembly2.com`,
        nombre: `Titular ${t} Unidad ${unit}`,
        numero_finca: String(96000 + id),
        cedula_identidad: String(1000000000 + id).slice(0, 10),
        face_id_enabled: t === 1,
        unit,
        cuota_pct: Math.round(cuotaPct * 100) / 100,
        payment_status,
        chatbot_registered,
        chatbot_login_status,
        chatbot_session_active,
        last_activity_at: chatbot_registered ? (t === 1 ? recent : now) : undefined,
        assembly_activity: t === 1 ? "Votó en Asamblea 2026-01" : undefined,
        titular_orden: t as 1 | 2,
        habilitado_para_asamblea: t === 1,
      });
    }
  }
  setStored(list);
  return list;
}

/** Rellena campos simulados para residentes que no los tienen (datos antiguos). */
function fillSimulatedFields(r: DemoResident, index: number): DemoResident {
  const uid = String(r?.user_id ?? "");
  const em = String(r?.email ?? "");
  const hash = (uid + em).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const i = index + 1;
  const chatbot_registered = r.chatbot_registered ?? (i % 5 !== 0);
  const chatbot_login_status = r.chatbot_login_status ?? (!chatbot_registered ? "never" : (hash % 4 === 0 ? "logged_in" : "registered"));
  return {
    ...r,
    nombre: r.nombre ?? (r.email ? `Residente ${i}` : undefined),
    numero_finca: r.numero_finca ?? (r.unit ? String(96000 + i) : undefined),
    cedula_identidad: r.cedula_identidad ?? (String(1000000000 + i).slice(0, 10)),
    payment_status: r.payment_status ?? (i <= 45 ? "al_dia" : "mora"),
    chatbot_registered,
    chatbot_login_status,
    chatbot_session_active: r.chatbot_session_active ?? (chatbot_login_status === "logged_in" && hash % 2 === 0),
    last_activity_at: r.last_activity_at ?? (chatbot_registered ? new Date(Date.now() - (hash % 3) * 20 * 60 * 1000).toISOString() : undefined),
    assembly_activity: r.assembly_activity ?? (hash % 2 === 0 ? "Votó en Asamblea 2026-01" : hash % 3 === 0 ? "Ingresó a sala en vivo" : undefined),
    titular_orden: r.titular_orden ?? 1,
    // En mora nunca vota; si no está en mora, usar valor guardado o default por hash
    habilitado_para_asamblea: r.payment_status === "mora" ? false : (r.habilitado_para_asamblea ?? (hash % 2 === 1)),
  };
}

/** Lista de residentes demo (máx. 50). Si está vacía, carga los 50 residentes demo por defecto. Rellena campos simulados si faltan. */
export function getDemoResidents(): DemoResident[] {
  try {
    const list = getStored();
    if (!Array.isArray(list) || list.length === 0) return seedDefaultDemoResidents();
    return list
      .filter((r) => r != null && (r.user_id || r.email))
      .map((r, idx) => fillSimulatedFields(r as DemoResident, idx));
  } catch {
    return seedDefaultDemoResidents();
  }
}

/** Restablece el listado demo: borra los datos guardados en localStorage. La próxima lectura (getDemoResidents) cargará los 50 residentes por defecto. Útil para deshacer cambios. */
export function resetDemoResidents(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Obtiene la siguiente unidad disponible (101–150) según la lista actual. */
function nextUnit(list: DemoResident[]): string {
  const used = new Set((list.map((r) => r.unit).filter(Boolean) as string[]).map((u) => parseInt(u, 10)));
  for (let i = 1; i <= DEMO_RESIDENTS_LIMIT; i++) {
    const u = String(100 + i);
    if (!used.has(100 + i)) return u;
  }
  return String(100 + list.length + 1);
}

/** Agregar residente. Devuelve el creado o error si ya existe el correo o se supera el límite. */
export function addDemoResident(email: string): { ok: true; resident: DemoResident } | { ok: false; error: string } {
  const list = getStored();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { ok: false, error: "Correo requerido" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { ok: false, error: "Correo inválido" };
  if (list.some((r) => r.email === normalized)) return { ok: false, error: "Ese correo ya está agregado" };
  if (list.length >= DEMO_RESIDENTS_LIMIT) {
    return { ok: false, error: `Su plan permite hasta ${DEMO_RESIDENTS_LIMIT} residentes. Actualice el plan para agregar más.` };
  }
  const cuotaPct = Math.round((100 / DEMO_RESIDENTS_LIMIT) * 100) / 100;
  const resident: DemoResident = {
    user_id: createId(),
    email: normalized,
    nombre: undefined,
    numero_finca: undefined,
    cedula_identidad: undefined,
    face_id_enabled: true,
    unit: nextUnit(list),
    cuota_pct: cuotaPct,
  };
  setStored([...list, resident]);
  return { ok: true, resident };
}

/** Eliminar residente por user_id. */
export function removeDemoResident(userId: string): boolean {
  const list = getStored().filter((r) => r.user_id !== userId);
  if (list.length === getStored().length) return false;
  setStored(list);
  return true;
}

/** Actualizar Face ID de un residente. */
export function updateDemoResidentFaceId(userId: string, faceIdEnabled: boolean): boolean {
  const list = getStored();
  const idx = list.findIndex((r) => r.user_id === userId);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], face_id_enabled: faceIdEnabled };
  setStored(list);
  return true;
}

/** Actualizar campos de un residente (demo). En mora no puede votar: si payment_status es mora, se fuerza habilitado_para_asamblea a false. */
export function updateDemoResident(
  userId: string,
  partial: Partial<Pick<DemoResident, "email" | "nombre" | "numero_finca" | "cedula_identidad" | "unit" | "cuota_pct" | "face_id_enabled" | "payment_status" | "titular_orden" | "habilitado_para_asamblea">>
): boolean {
  const list = getStored();
  const idx = list.findIndex((r) => r.user_id === userId);
  if (idx === -1) return false;
  const normalized = partial.email?.trim().toLowerCase();
  if (normalized && list.some((r) => r.user_id !== userId && r.email === normalized)) return false;
  const applied = { ...partial, ...(normalized ? { email: normalized } : {}) };
  if (applied.payment_status === "mora") applied.habilitado_para_asamblea = false;
  list[idx] = { ...list[idx], ...applied };
  setStored(list);
  return true;
}

/** Residentes de una unidad (ordenados por titular_orden 1, 2). */
export function getResidentsByUnit(unit: string): DemoResident[] {
  return getStored()
    .filter((r) => (r.unit ?? "").trim() === String(unit).trim())
    .sort((a, b) => (a.titular_orden ?? 1) - (b.titular_orden ?? 1));
}

/** Marca un residente como habilitado para asamblea y desmarca a los demás de la misma unidad (solo uno habilitado por unidad). */
export function setDemoResidentHabilitadoParaAsamblea(userId: string, value: boolean): boolean {
  const list = getStored();
  const idx = list.findIndex((r) => r.user_id === userId);
  if (idx === -1) return false;
  const unit = (list[idx].unit ?? "").trim();
  for (let i = 0; i < list.length; i++) {
    const sameUnit = (list[i].unit ?? "").trim() === unit;
    if (i === idx) {
      list[i] = { ...list[i], habilitado_para_asamblea: value };
    } else if (sameUnit && value) {
      list[i] = { ...list[i], habilitado_para_asamblea: false };
    }
  }
  setStored(list);
  return true;
}

/** Actualizar plantilla de unidad: Titular 1, Titular 2, quién está habilitado para asamblea. */
export function updateUnitTemplate(
  unit: string,
  data: { titular_1_email: string; titular_2_email?: string; habilitado_titular_1: boolean; habilitado_titular_2: boolean }
): { ok: true } | { ok: false; error: string } {
  const list = getStored();
  const unitStr = String(unit).trim();
  const existing = list.filter((r) => (r.unit ?? "").trim() === unitStr);
  const e1 = existing.find((r) => (r.titular_orden ?? 1) === 1);
  const e2 = existing.find((r) => r.titular_orden === 2);
  const email1 = data.titular_1_email.trim().toLowerCase();
  const email2 = data.titular_2_email?.trim().toLowerCase() ?? "";
  if (!email1 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email1)) return { ok: false, error: "Titular 1: correo requerido y válido." };
  if (email2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email2)) return { ok: false, error: "Titular 2: correo inválido." };
  if (email2 && list.some((r) => r.email === email2 && (r.unit ?? "").trim() !== unitStr)) return { ok: false, error: "Ese correo ya está en otra unidad." };

  const cuotaPct = Math.round((100 / DEMO_RESIDENTS_LIMIT) * 100) / 100;
  const newList = list.filter((r) => (r.unit ?? "").trim() !== unitStr);

  if (e1) {
    newList.push({
      ...e1,
      email: email1,
      titular_orden: 1,
      habilitado_para_asamblea: data.habilitado_titular_1,
    });
  } else {
    newList.push({
      user_id: createId(),
      email: email1,
      face_id_enabled: true,
      unit: unitStr,
      cuota_pct: cuotaPct,
      titular_orden: 1,
      habilitado_para_asamblea: data.habilitado_titular_1,
    });
  }
  if (email2) {
    if (e2) {
      newList.push({
        ...e2,
        email: email2,
        titular_orden: 2,
        habilitado_para_asamblea: data.habilitado_titular_2,
      });
    } else {
      if (newList.length >= DEMO_RESIDENTS_LIMIT) return { ok: false, error: "Límite de residentes alcanzado." };
      newList.push({
        user_id: createId(),
        email: email2,
        face_id_enabled: true,
        unit: unitStr,
        cuota_pct: cuotaPct,
        titular_orden: 2,
        habilitado_para_asamblea: data.habilitado_titular_2,
      });
    }
  }
  setStored(newList);
  return { ok: true };
}

const CSV_HEADERS = "email,unidad,nombre,numero_finca,cedula_identidad,estado,face_id_enabled,hab_asamblea";

/** Exportar residentes a CSV (incl. número de finca y cédula). */
export function exportDemoResidentsCsv(): string {
  const list = getStored();
  const rows = [CSV_HEADERS, ...list.map((r) => {
    const email = (r.email || "").replace(/"/g, '""');
    const unit = r.unit ?? "";
    const nombre = (r.nombre ?? "").replace(/"/g, '""');
    const numero_finca = (r.numero_finca ?? "").replace(/"/g, '""');
    const cedula = (r.cedula_identidad ?? "").replace(/"/g, '""');
    const estado = r.payment_status === "mora" ? "Mora" : r.payment_status === "al_dia" ? "Al Día" : "";
    const face = r.face_id_enabled ? "1" : "0";
    const hab = r.habilitado_para_asamblea ? "1" : "0";
    return `"${email}",${unit},"${nombre}","${numero_finca}","${cedula}",${estado},${face},${hab}`;
  })];
  return "\uFEFF" + rows.join("\r\n");
}

/** Plantilla CSV para importar (incl. número de finca y cédula). */
export function getImportTemplateCsv(): string {
  const headers = CSV_HEADERS;
  const example = '"residente.ejemplo@demo.assembly2.com",101,"Residente Ejemplo","96051","1234567890",Al Día,1,1';
  return "\uFEFF" + headers + "\r\n" + example + "\r\n";
}

function parseCsvLine(line: string): string[] {
  const matches = line.match(/("(?:[^"]*)")|([^,]+)/g);
  if (!matches) return [];
  return matches.map((p) => {
    if (p != null && p.startsWith('"')) return p.slice(1, -1).replace(/""/g, '"');
    return (p ?? "").trim();
  });
}

/** Importar residentes desde CSV. Respeta límite 50. Acepta columnas: email, unidad, nombre, estado (Al Día/Mora), face_id_enabled, hab_asamblea (y opcional cuota_pct, payment_status). */
export function importDemoResidentsFromCsv(csv: string): { ok: true; count: number } | { ok: false; error: string } {
  const list = getStored();
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { ok: false, error: "El archivo debe tener encabezados y al menos una fila." };
  const headerParts = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, "").trim());
  const emailIdx = headerParts.findIndex((h) => h === "email");
  if (emailIdx === -1) return { ok: false, error: "Falta la columna 'email' en el CSV." };
  const unitIdx = headerParts.findIndex((h) => h === "unidad");
  const nombreIdx = headerParts.findIndex((h) => h === "nombre");
  const estadoIdx = headerParts.findIndex((h) => h === "estado");
  const cuotaIdx = headerParts.findIndex((h) => h === "cuota_pct");
  const faceIdx = headerParts.findIndex((h) => h === "face_id_enabled");
  const payIdx = headerParts.findIndex((h) => h === "payment_status");
  const habIdx = headerParts.findIndex((h) => h === "hab_asamblea");
  const numeroFincaIdx = headerParts.findIndex((h) => h === "numero_finca");
  const cedulaIdx = Math.max(headerParts.findIndex((h) => h === "cedula_identidad"), headerParts.findIndex((h) => h === "id_identidad"));
  const parsed: { email: string; unit?: string; nombre?: string; numero_finca?: string; cedula_identidad?: string; cuota_pct?: number; face_id_enabled: boolean; payment_status?: PaymentStatus; habilitado_para_asamblea?: boolean }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    const email = (parts[emailIdx] ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    const unit = (unitIdx >= 0 ? parts[unitIdx] : parts[1])?.trim() || undefined;
    const nombre = (nombreIdx >= 0 ? parts[nombreIdx] : undefined)?.trim() || undefined;
    const numero_finca = (numeroFincaIdx >= 0 ? parts[numeroFincaIdx] : undefined)?.trim() || undefined;
    const cedula_identidad = (cedulaIdx >= 0 ? parts[cedulaIdx] : undefined)?.trim() || undefined;
    const cuota = (cuotaIdx >= 0 ? parts[cuotaIdx] : undefined)?.trim();
    const cuota_pct = cuota ? parseFloat(cuota.replace(",", ".")) : undefined;
    const face = (faceIdx >= 0 ? parts[faceIdx] : parts[4])?.trim();
    const face_id_enabled = face === "1" || face === "true" || face === "sí";
    const pay = (estadoIdx >= 0 ? parts[estadoIdx] : payIdx >= 0 ? parts[payIdx] : undefined)?.trim();
    const payment_status: PaymentStatus = (pay?.toLowerCase().includes("mora") || pay === "mora") ? "mora" : "al_dia";
    const hab = (habIdx >= 0 ? parts[habIdx] : undefined)?.trim();
    const habilitado_para_asamblea = hab === "1" || hab === "true" || hab === "sí";
    parsed.push({ email, unit, nombre, numero_finca, cedula_identidad, cuota_pct, face_id_enabled, payment_status, habilitado_para_asamblea: habIdx >= 0 ? habilitado_para_asamblea : undefined });
  }
  let count = 0;
  const newList = [...list];
  const existingEmails = new Set(newList.map((r) => r.email));
  for (const p of parsed) {
    if (newList.length >= DEMO_RESIDENTS_LIMIT) break;
    if (existingEmails.has(p.email)) continue;
    existingEmails.add(p.email);
    const resident: DemoResident = {
      user_id: createId(),
      email: p.email,
      nombre: p.nombre,
      numero_finca: p.numero_finca,
      cedula_identidad: p.cedula_identidad,
      face_id_enabled: p.face_id_enabled,
      unit: p.unit || nextUnit(newList),
      cuota_pct: p.cuota_pct ?? Math.round((100 / DEMO_RESIDENTS_LIMIT) * 100) / 100,
      payment_status: p.payment_status,
      habilitado_para_asamblea: p.habilitado_para_asamblea,
    };
    newList.push(resident);
    count++;
  }
  setStored(newList);
  return { ok: true, count };
}

/** Comprueba si el contexto actual es demo (para usar este store). */
export function isDemoResidentsContext(): boolean {
  if (typeof window === "undefined") return false;
  const email = (localStorage.getItem("assembly_email") || "").toLowerCase();
  const orgId = localStorage.getItem("assembly_organization_id") || "";
  const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
  return email === "demo@assembly2.com" || orgId === "demo-organization" || orgId === DEMO_ORG_ID;
}
