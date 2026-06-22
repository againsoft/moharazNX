"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/lib/store/order-store";

/** Wait for persisted orders to load from localStorage before treating an order as missing. */
export function useOrderStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { persist } = useOrderStore;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    if (!persist.hasHydrated()) {
      void persist.rehydrate();
    }
    return unsub;
  }, []);

  return hydrated;
}
