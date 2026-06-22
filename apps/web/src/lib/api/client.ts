import { getStoredAuthToken, useAdminAuth } from "@/lib/store/admin-auth-store";

const LOCAL_API_URL = "http://127.0.0.1:8000";
const PRODUCTION_API_URL = "https://moharaznx-production.up.railway.app";

function isLocalApiUrl(url: string): boolean {
  return url === LOCAL_API_URL || url === "http://localhost:8000";
}

/** FastAPI base URL — no trailing slash. */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (configured && !isLocalApiUrl(configured)) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".vercel.app")) {
      return PRODUCTION_API_URL;
    }
  }

  if (process.env.VERCEL === "1") {
    return PRODUCTION_API_URL;
  }

  return configured || LOCAL_API_URL;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAuthToken();
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.includes("/auth/login") &&
      !window.location.pathname.startsWith("/login")
    ) {
      useAdminAuth.getState().clearSession();
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/login?next=${next}`);
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
