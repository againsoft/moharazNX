import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { CenterPlatformLink } from "@/components/center/center-platform-link";
import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{BRAND_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin sign in</p>
        </div>
        <AdminLoginForm />
        <div className="mt-6 space-y-3 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            AgainSoft platform operators
          </p>
          <CenterPlatformLink className="w-full" size="default" />
          <p className="text-center text-[10px] text-muted-foreground">
            Or open directly:{" "}
            <Link href="/center" className="font-medium text-violet-600 hover:underline">
              /center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
