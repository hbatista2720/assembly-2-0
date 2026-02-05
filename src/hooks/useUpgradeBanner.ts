"use client";

import { useEffect, useState } from "react";

type LimitState = {
  current: number;
  limit: number | null;
  percentage: number;
  exceeded?: boolean;
};

type LimitsPayload = {
  plan?: string;
  organizations?: LimitState;
  units?: LimitState;
  assemblies?: LimitState;
  needs_upgrade?: boolean;
  show_banner?: boolean;
};

export default function useUpgradeBanner(subscriptionId?: string | null) {
  const [showBanner, setShowBanner] = useState(false);
  const [limits, setLimits] = useState<LimitsPayload>({});

  useEffect(() => {
    if (!subscriptionId) {
      setShowBanner(false);
      return;
    }

    let active = true;

    const checkLimits = async () => {
      try {
        const response = await fetch(`/api/subscription/${subscriptionId}/limits`);
        if (!response.ok) return;
        const data = (await response.json()) as LimitsPayload;
        if (!active) return;
        const show =
          data.show_banner ||
          [data.organizations, data.units, data.assemblies].some((item) => (item?.percentage ?? 0) >= 90);
        setShowBanner(Boolean(show));
        setLimits(data);
      } catch {
        // ignore
      }
    };

    checkLimits();
    const interval = setInterval(checkLimits, 300000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [subscriptionId]);

  return { showBanner, limits };
}
