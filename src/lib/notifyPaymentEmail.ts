/**
 * Notificación por correo al comprador cuando Henry aprueba/rechaza su orden de pago.
 * Punto de extensión: cuando se integre un proveedor (Resend, SendGrid, etc.),
 * implementar el envío real aquí.
 *
 * - Al aprobar: "Su pago ha sido aprobado. Créditos disponibles para asambleas: [cantidad].
 *   Ya puede crear asambleas desde [link]."
 * - Al rechazar: "Su orden de pago ha sido rechazada. Por favor contacte soporte si tiene dudas."
 */
const CREDITS_BY_PLAN: Record<string, number> = {
  EVENTO_UNICO: 1,
  DUO_PACK: 2,
  STANDARD: 2,
  MULTI_PH_LITE: 5,
  MULTI_PH_PRO: 15,
  ENTERPRISE: 999,
  DEMO: 1,
};

export async function notifyPaymentApproved(
  customerEmail: string,
  planTier: string,
  creditsGranted: number
): Promise<void> {
  if (!customerEmail?.trim()) return;
  const credits = creditsGranted > 0 ? creditsGranted : CREDITS_BY_PLAN[planTier] ?? 1;
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://assembly2.com"}/dashboard/admin-ph/proceso-asamblea`;
  // TODO: integrar proveedor de email (Resend, SendGrid, etc.)
  console.log("[notifyPaymentEmail] Would send approval email to", customerEmail, {
    planTier,
    credits,
    link,
    subject: "Su pago ha sido aprobado - Assembly 2.0",
    body: `Su pago ha sido aprobado.\n\nCréditos disponibles para asambleas: ${credits}.\n\nYa puede crear asambleas desde: ${link}`,
  });
}

export async function notifyPaymentRejected(customerEmail: string): Promise<void> {
  if (!customerEmail?.trim()) return;
  // TODO: integrar proveedor de email
  console.log("[notifyPaymentEmail] Would send rejection email to", customerEmail, {
    subject: "Orden de pago rechazada - Assembly 2.0",
    body: "Su orden de pago ha sido rechazada. Por favor contacte soporte si tiene dudas.",
  });
}
