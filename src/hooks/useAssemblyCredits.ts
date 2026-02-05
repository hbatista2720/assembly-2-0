"use client";

import { useEffect, useState } from "react";

export type AssemblyCredit = {
  id: string;
  earned_month: string;
  credits_remaining: number;
  expires_at: string;
  days_until_expiry: number;
};

export type CreditsSummary = {
  total_available: number;
  expiring_soon: AssemblyCredit[];
  all_credits: AssemblyCredit[];
};

export default function useAssemblyCredits(organizationId?: string | null) {
  const [credits, setCredits] = useState<CreditsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    let active = true;

    const fetchCredits = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/assembly-credits/${organizationId}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = (await response.json()) as CreditsSummary;
        if (!active) return;
        setCredits(data);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCredits();
    const interval = setInterval(fetchCredits, 300000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [organizationId]);

  return { credits, loading };
}
