"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompatibilityLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/catalog/product-configurator/rules");
  }, [router]);
  return null;
}
