export type PlanTier = "EVENTO_UNICO" | "DUO_PACK" | "STANDARD" | "MULTI_PH" | "ENTERPRISE";

export type BillingCycle = "one-time" | "monthly" | "annual";

export interface PlanLimits {
  assembliesPerMonth: number | "unlimited";
  maxPropertiesPerAssembly: number | "unlimited";
  maxTopicsPerAssembly: number | "unlimited";
  maxBuildings: number | "unlimited";
  historyDays: number | "unlimited";
}

export interface Plan {
  id: PlanTier;
  name: string;
  displayName: string;
  tagline: string;
  price: number;
  priceAnnual?: number;
  billing: BillingCycle;
  limits: PlanLimits;
  features: string[];
  restrictions?: string[];
  cta: string;
  ctaVariant: "primary" | "secondary" | "accent";
  popular?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "EVENTO_UNICO",
    name: "EventoUnico",
    displayName: "Evento Único",
    tagline: "Pago por uso, ideal para 1 asamblea/año",
    price: 225,
    billing: "one-time",
    limits: {
      assembliesPerMonth: 1,
      maxPropertiesPerAssembly: 250,
      maxTopicsPerAssembly: 15,
      maxBuildings: 1,
      historyDays: 30,
    },
    features: [
      "1 crédito de asamblea (12 meses)",
      "Hasta 250 unidades",
      "Quórum automático y voto ponderado",
      "Face ID y voto manual alternativo",
      "Acta digital completa sin marca de agua",
      "Vista de presentación profesional",
      "Soporte durante asamblea (chat)",
    ],
    restrictions: ["Un solo evento", "Histórico 30 días"],
    cta: "Comprar Evento Único",
    ctaVariant: "secondary",
  },
  {
    id: "DUO_PACK",
    name: "DuoPack",
    displayName: "Dúo Pack",
    tagline: "2 asambleas con 15% de ahorro",
    price: 389,
    billing: "one-time",
    limits: {
      assembliesPerMonth: 2,
      maxPropertiesPerAssembly: 250,
      maxTopicsPerAssembly: 15,
      maxBuildings: 1,
      historyDays: 30,
    },
    features: [
      "2 créditos de asamblea (12 meses)",
      "Hasta 250 unidades por asamblea",
      "Todo lo de Evento Único",
      "Ahorro vs 2x Evento Único",
      "Soporte durante asambleas",
    ],
    cta: "Comprar Dúo Pack",
    ctaVariant: "secondary",
  },
  {
    id: "STANDARD",
    name: "Standard",
    displayName: "Standard",
    tagline: "Edificios activos con 2+ asambleas/año",
    price: 189,
    billing: "monthly",
    limits: {
      assembliesPerMonth: 2,
      maxPropertiesPerAssembly: 250,
      maxTopicsPerAssembly: "unlimited",
      maxBuildings: 1,
      historyDays: "unlimited",
    },
    features: [
      "2 asambleas/mes incluidas (acumulables)",
      "3ra asamblea: +$75",
      "Quórum automático y actas legales",
      "Histórico ilimitado",
      "Soporte prioritario",
    ],
    cta: "Empezar Standard",
    ctaVariant: "accent",
    popular: true,
    badge: "MAS POPULAR",
  },
  {
    id: "MULTI_PH",
    name: "MultiPH",
    displayName: "Multi-PH",
    tagline: "Administradoras con múltiples edificios",
    price: 699,
    billing: "monthly",
    limits: {
      assembliesPerMonth: "unlimited",
      maxPropertiesPerAssembly: 5000,
      maxTopicsPerAssembly: "unlimited",
      maxBuildings: 30,
      historyDays: "unlimited",
    },
    features: [
      "Hasta 30 edificios gestionados",
      "Asambleas ilimitadas",
      "Panel multi-tenant",
      "Reportes consolidados",
      "Roles y permisos",
      "White label (tu logo)",
    ],
    cta: "Agendar Demo",
    ctaVariant: "primary",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    displayName: "Enterprise",
    tagline: "Promotoras y operadores grandes",
    price: 2499,
    billing: "monthly",
    limits: {
      assembliesPerMonth: "unlimited",
      maxPropertiesPerAssembly: "unlimited",
      maxTopicsPerAssembly: "unlimited",
      maxBuildings: "unlimited",
      historyDays: "unlimited",
    },
    features: [
      "Unidades ilimitadas",
      "CRM integrado (tickets)",
      "Consultoría legal incluida",
      "Integraciones ERP/CRM",
      "Soporte dedicado y SLA",
      "Desarrollo a medida",
    ],
    cta: "Consultoría Empresarial",
    ctaVariant: "primary",
  },
];
