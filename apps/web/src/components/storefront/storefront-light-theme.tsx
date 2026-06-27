"use client";

import { useLayoutEffect } from "react";
import { forceStorefrontLightTheme } from "@/lib/theme/apply-theme";

/** Storefront-only — keeps public site on light/white (no admin ThemeProvider). */
export function StorefrontLightTheme() {
  useLayoutEffect(() => {
    forceStorefrontLightTheme();

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark") || root.getAttribute("data-theme") === "dark") {
        forceStorefrontLightTheme();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });

    // Catch late theme writes during hydration (first ~3s)
    const started = performance.now();
    let frame = 0;
    const guard = () => {
      if (root.classList.contains("dark") || root.getAttribute("data-theme") === "dark") {
        forceStorefrontLightTheme();
      }
      if (performance.now() - started < 3000) {
        frame = requestAnimationFrame(guard);
      }
    };
    frame = requestAnimationFrame(guard);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
