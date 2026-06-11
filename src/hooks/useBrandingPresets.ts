"use client";

import { useState, useEffect, useCallback } from "react";
import { listBrandingPresets, type BrandingPreset } from "@/app/actions/brandingPresets";

export function useBrandingPresets() {
  const [presets, setPresets] = useState<BrandingPreset[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setPresets(await listBrandingPresets());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { presets, loaded, refresh };
}
