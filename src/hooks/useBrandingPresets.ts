"use client";

import { useState, useEffect, useCallback } from "react";
import { listBrandingPresets, type BrandingPreset } from "@/app/actions/brandingPresets";

export function useBrandingPresets(initialPresets?: BrandingPreset[]) {
  const [presets, setPresets] = useState<BrandingPreset[]>(initialPresets ?? []);
  const [loaded, setLoaded] = useState(initialPresets !== undefined);

  const refresh = useCallback(async () => {
    setPresets(await listBrandingPresets());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (initialPresets !== undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return { presets, loaded, refresh };
}
