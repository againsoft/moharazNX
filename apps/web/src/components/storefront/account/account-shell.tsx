"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Home, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthView } from "@/components/storefront/auth/auth-view";
import { AccountNav } from "@/components/storefront/account/account-nav";
import { useStorefrontAuth } from "@/lib/store/storefront-auth-store";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

function AccountShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useStorefrontAuth((s) => s.user);
  const logout = useStorefrontAuth((s) => s.logout);
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  if (!user) {
    return <AuthView defaultTab={defaultTab} />;
  }

  const providerLabel =
    user.provider === "google"
      ? "Google"
      : user.provider === "facebook"
        ? "Facebook"
        : user.provider === "whatsapp"
          ? "WhatsApp"
          : "Email";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <nav className="mb-4 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href={storefrontPaths.home} className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">My account</span>
      </nav>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Signed in via {providerLabel}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>

      <div className="mb-4 lg:hidden">
        <AccountNav variant="pills" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-border/60 bg-card p-3">
            <AccountNav />
          </div>
        </aside>
        <div key={pathname}>{children}</div>
      </div>
    </div>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="py-12 text-sm text-muted-foreground">Loading account…</div>}>
      <AccountShellContent>{children}</AccountShellContent>
    </Suspense>
  );
}
