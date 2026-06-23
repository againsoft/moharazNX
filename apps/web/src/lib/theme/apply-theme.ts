import type { ResolvedThemeMode } from "./types";

const THEME_ATTR = "data-theme";

/** Apply resolved mode to `<html>` — class, attribute, color-scheme. */
export function applyThemeToDocument(mode: ResolvedThemeMode, root: HTMLElement = document.documentElement): void {
  const isDark = mode === "dark";
  root.classList.toggle("dark", isDark);
  root.setAttribute(THEME_ATTR, mode);
  root.style.colorScheme = mode;
}

export function readStoredThemePreference(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("againerp-theme");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { preference?: string } };
    return parsed.state?.preference ?? null;
  } catch {
    return null;
  }
}

export function readLegacyAppStorePreference(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("againerp-prototype");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    return parsed.state?.theme ?? null;
  } catch {
    return null;
  }
}

/** Inline script for layout `<head>` — always light mode, dark mode fully disabled. */
export const THEME_INIT_SCRIPT = `(function(){var r=document.documentElement;r.classList.remove('dark');r.setAttribute('data-theme','light');r.style.colorScheme='light';})();`;
