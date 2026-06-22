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

/** Inline script for layout `<head>` — prevents theme flash before hydration. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('againerp-theme');var pref='system';if(p){var s=JSON.parse(p);if(s&&s.state&&s.state.preference)pref=s.state.preference;}else{var l=localStorage.getItem('againerp-prototype');if(l){var a=JSON.parse(l);if(a&&a.state&&a.state.theme)pref=a.state.theme;}}var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var m=pref==='dark'||(pref==='system'&&d)?'dark':'light';var r=document.documentElement;r.classList.toggle('dark',m==='dark');r.setAttribute('data-theme',m);r.style.colorScheme=m;}catch(e){}})();`;
