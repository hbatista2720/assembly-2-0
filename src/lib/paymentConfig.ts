/**
 * Configuración de pasarela de pago (Henry Admin).
 * Cada método tiene: acción (manual/automática), activo/inactivo, nivel (orden)
 * y configuración específica de pasarela (cuenta ACH, Yappy, PayPal, etc.).
 */

export type PaymentAction = "MANUAL" | "AUTOMATIC";

export const PAYMENT_METHOD_IDS = [
  "MANUAL_ACH",
  "MANUAL_YAPPY",
  "PAYPAL",
  "TILOPAY",
  "MANUAL_TRANSFER",
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodId, string> = {
  MANUAL_ACH: "ACH",
  MANUAL_YAPPY: "Yappy",
  PAYPAL: "PayPal",
  TILOPAY: "Tilopay",
  MANUAL_TRANSFER: "Transferencia",
};

export interface PaymentMethodConfig {
  action: PaymentAction;
  enabled: boolean;
  level: number;
}

/** Configuración específica por pasarela (editable desde Dashboard Henry) */
export interface GatewayConfig {
  /** ACH / Transferencia: tipo de cuenta, banco, nombre, número */
  ach?: {
    accountType: string;   // Ej. Cuenta Corriente, Cuenta de Ahorros
    bankName: string;
    accountHolder: string; // Nombre de la cuenta (beneficiario)
    accountNumber: string;
  };
  /** Yappy: nombre para buscar en directorio, celular opcional */
  yappy?: {
    accountName: string;
    cellPhone?: string;
  };
  /** PayPal: Client ID (sandbox/live), modo */
  paypal?: {
    clientId: string;
    mode: "sandbox" | "live";
  };
  /** Tilopay: Merchant ID, modo */
  tilopay?: {
    merchantId: string;
    mode: "sandbox" | "live";
  };
}

/** Preset por defecto: ACH y Yappy activos, manual, nivel 1-2 */
const DEFAULT_CONFIG: Record<PaymentMethodId, PaymentMethodConfig> = {
  MANUAL_ACH: { action: "MANUAL", enabled: true, level: 1 },
  MANUAL_YAPPY: { action: "MANUAL", enabled: true, level: 2 },
  PAYPAL: { action: "AUTOMATIC", enabled: false, level: 3 },
  TILOPAY: { action: "AUTOMATIC", enabled: false, level: 4 },
  MANUAL_TRANSFER: { action: "MANUAL", enabled: false, level: 5 },
};

const STORAGE_METHODS = "assembly_payment_methods";
const STORAGE_GATEWAY = "assembly_payment_gateway_config";

/** Valores por defecto de pasarela (coinciden con checkout actual) */
const DEFAULT_GATEWAY: GatewayConfig = {
  ach: { accountType: "Cuenta Corriente", bankName: "Banco General", accountHolder: "Assembly 2.0", accountNumber: "03-01-01-146847-7" },
  yappy: { accountName: "Assembly 2.0", cellPhone: "" },
  paypal: { clientId: "", mode: "sandbox" },
  tilopay: { merchantId: "", mode: "sandbox" },
};

export function getGatewayConfig(): GatewayConfig {
  if (typeof window === "undefined") return { ...DEFAULT_GATEWAY };
  try {
    const raw = localStorage.getItem(STORAGE_GATEWAY);
    if (!raw) return { ...DEFAULT_GATEWAY };
    const parsed = JSON.parse(raw) as Partial<GatewayConfig>;
    return {
      ach: { ...(DEFAULT_GATEWAY.ach ?? {}), ...(parsed.ach ?? {}) },
      yappy: { ...(DEFAULT_GATEWAY.yappy ?? {}), ...(parsed.yappy ?? {}) },
      paypal: { ...(DEFAULT_GATEWAY.paypal ?? {}), ...(parsed.paypal ?? {}) },
      tilopay: { ...(DEFAULT_GATEWAY.tilopay ?? {}), ...(parsed.tilopay ?? {}) },
    };
  } catch {
    return { ...DEFAULT_GATEWAY };
  }
}

export function setGatewayConfig(config: GatewayConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_GATEWAY, JSON.stringify(config));
}

export function getPaymentMethods(): Record<PaymentMethodId, PaymentMethodConfig> {
  if (typeof window === "undefined") return { ...DEFAULT_CONFIG };
  try {
    const raw = localStorage.getItem(STORAGE_METHODS);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Record<string, Partial<PaymentMethodConfig>>;
    const out: Record<PaymentMethodId, PaymentMethodConfig> = { ...DEFAULT_CONFIG };
    for (const id of PAYMENT_METHOD_IDS) {
      const p = parsed[id];
      if (p) {
        out[id] = {
          action: p.action === "AUTOMATIC" ? "AUTOMATIC" : "MANUAL",
          enabled: typeof p.enabled === "boolean" ? p.enabled : DEFAULT_CONFIG[id].enabled,
          level: typeof p.level === "number" ? Math.max(1, p.level) : DEFAULT_CONFIG[id].level,
        };
      }
    }
    return out;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setPaymentMethods(config: Record<PaymentMethodId, PaymentMethodConfig>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_METHODS, JSON.stringify(config));
}

/** Obtiene IDs de métodos activos, ordenados por nivel (para checkout) */
export function getEnabledPaymentMethodIds(): PaymentMethodId[] {
  const config = getPaymentMethods();
  return PAYMENT_METHOD_IDS.filter((id) => config[id].enabled)
    .sort((a, b) => config[a].level - config[b].level);
}

/** Métodos que por naturaleza requieren comprobante (el API siempre lo exige) */
const METHODS_REQUIRING_PROOF = ["MANUAL_ACH", "MANUAL_YAPPY", "MANUAL_TRANSFER"] as const;

/** Indica si un método requiere comprobante: por ID (ACH/Yappy/Transfer) o por acción Manual en config */
export function isManualAction(methodId: PaymentMethodId): boolean {
  if (METHODS_REQUIRING_PROOF.includes(methodId as typeof METHODS_REQUIRING_PROOF[number])) {
    return true; // API siempre exige comprobante para estos
  }
  const config = getPaymentMethods();
  return config[methodId]?.action === "MANUAL";
}

/** Compatibilidad legacy: approval mode global eliminado; se usa acción por método */
export type ApprovalMode = "MANUAL" | "AUTOMATIC";
export function getApprovalMode(): ApprovalMode {
  return "MANUAL";
}
export function setApprovalMode(_mode: ApprovalMode) {
  /* ya no se usa modo global */
}

/** Compatibilidad: PaymentMode eliminado (Fase 1/2 unificados) */
export type PaymentMode = "FASE_1" | "FASE_2";
export function getPaymentMode(): PaymentMode {
  const config = getPaymentMethods();
  const onlyManual = PAYMENT_METHOD_IDS.every(
    (id) => !config[id].enabled || config[id].action === "MANUAL"
  );
  return onlyManual ? "FASE_1" : "FASE_2";
}
export function setPaymentMode(_mode: PaymentMode) {
  /* unificado en config por método */
}

/** Presets Fase 1 (solo ACH+Yappy) y Fase 2 (todos) para el botón Pasarela de pago */
export const PRESET_FASE_1: Record<PaymentMethodId, PaymentMethodConfig> = {
  MANUAL_ACH: { action: "MANUAL", enabled: true, level: 1 },
  MANUAL_YAPPY: { action: "MANUAL", enabled: true, level: 2 },
  PAYPAL: { action: "AUTOMATIC", enabled: false, level: 3 },
  TILOPAY: { action: "AUTOMATIC", enabled: false, level: 4 },
  MANUAL_TRANSFER: { action: "MANUAL", enabled: false, level: 5 },
};

const PRESET_FASE_2: Record<PaymentMethodId, PaymentMethodConfig> = {
  MANUAL_ACH: { action: "MANUAL", enabled: true, level: 1 },
  MANUAL_YAPPY: { action: "MANUAL", enabled: true, level: 2 },
  PAYPAL: { action: "AUTOMATIC", enabled: true, level: 3 },
  TILOPAY: { action: "AUTOMATIC", enabled: true, level: 4 },
  MANUAL_TRANSFER: { action: "MANUAL", enabled: true, level: 5 },
};

export function applyPaymentModePreset(mode: PaymentMode) {
  const preset = mode === "FASE_2" ? { ...PRESET_FASE_2 } : { ...PRESET_FASE_1 };
  setPaymentMethods(preset);
  return preset;
}
