import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { BRAND_NAME } from "@/lib/brand";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{BRAND_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin sign in</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
