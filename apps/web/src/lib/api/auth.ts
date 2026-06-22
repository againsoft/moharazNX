import { apiFetch } from "@/lib/api/client";
import type { AdminUser } from "@/lib/store/admin-auth-store";

export type ApiUser = AdminUser;

export type ApiLoginResponse = {
  token: string;
  expires_at: string;
  user: ApiUser;
};

export type ApiMeResponse = {
  data: ApiUser;
};

export async function loginAdmin(email: string, password: string): Promise<ApiLoginResponse> {
  return apiFetch<ApiLoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchAdminMe(): Promise<ApiUser> {
  const res = await apiFetch<ApiMeResponse>("/api/v1/auth/me");
  return res.data;
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}
