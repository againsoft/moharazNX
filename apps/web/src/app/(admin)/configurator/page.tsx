"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — redirects to Catalog › Product Configurator hub */
export default function ConfiguratorLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/catalog/product-configurator");
  }, [router]);
  return null;
}
