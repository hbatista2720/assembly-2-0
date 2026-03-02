/**
 * Configuración de alertas y notificaciones por email para Henry (Admin Plataforma).
 * Múltiples correos, tipos de alerta y campañas.
 */

const STORAGE_KEY = "assembly_platform_admin_alert_config";

export type AlertType =
  | "pending_approvals"
  | "urgent_tickets"
  | "new_leads"
  | "vps_capacity"
  | "demo_expiring"
  | "campaign_summary";

export type AlertConfig = {
  enabled: boolean;
  emails: string[];
  alertTypes: AlertType[];
  campaignDigest: boolean;
  campaignFrequency: "daily" | "weekly" | "off";
};

const DEFAULT_CONFIG: AlertConfig = {
  enabled: true,
  emails: [],
  alertTypes: ["pending_approvals", "urgent_tickets", "new_leads", "vps_capacity"],
  campaignDigest: true,
  campaignFrequency: "daily",
};

const ALERT_LABELS: Record<AlertType, string> = {
  pending_approvals: "Órdenes pendientes de aprobación",
  urgent_tickets: "Tickets urgentes",
  new_leads: "Leads nuevos",
  vps_capacity: "Capacidad VPS alta",
  demo_expiring: "Demos por expirar",
  campaign_summary: "Resumen de campañas",
};

export function getAlertConfig(): AlertConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AlertConfig>;
    return {
      enabled: parsed.enabled !== false,
      emails: Array.isArray(parsed.emails) ? parsed.emails.filter((e) => typeof e === "string" && e.trim()) : DEFAULT_CONFIG.emails,
      alertTypes: Array.isArray(parsed.alertTypes) ? parsed.alertTypes : DEFAULT_CONFIG.alertTypes,
      campaignDigest: parsed.campaignDigest !== false,
      campaignFrequency: parsed.campaignFrequency === "weekly" ? "weekly" : parsed.campaignFrequency === "off" ? "off" : "daily",
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setAlertConfig(config: Partial<AlertConfig>) {
  if (typeof window === "undefined") return;
  const current = getAlertConfig();
  const next = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getAlertLabels(): Record<AlertType, string> {
  return ALERT_LABELS;
}
