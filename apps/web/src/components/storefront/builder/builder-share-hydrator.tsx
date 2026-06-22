"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";

/** Hydrate build from ?selections= (Wootware-style) or ?b= share token */
export function BuilderShareHydrator() {
  const searchParams = useSearchParams();
  const hydrate = usePcBuilderStore((s) => s.hydrateFromEncoded);
  const loadFromSelectionIds = usePcBuilderStore((s) => s.loadFromSelectionIds);

  useEffect(() => {
    const selectionsParam = searchParams.get("selections");
    if (selectionsParam) {
      const ids = selectionsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const ok = loadFromSelectionIds(ids);
      if (ok) toast.success("Build loaded from share link");
      return;
    }

    const token = searchParams.get("b");
    if (!token) return;
    const ok = hydrate(decodeURIComponent(token));
    if (ok) toast.success("Shared build loaded");
  }, [searchParams, hydrate, loadFromSelectionIds]);

  return null;
}
