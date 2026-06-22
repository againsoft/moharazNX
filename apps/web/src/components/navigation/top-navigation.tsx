"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { NotificationCenter } from "@/components/layout/notification-center";
import { ScopeSwitchers } from "@/components/layout/scope-switchers";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { TopBreadcrumb } from "@/components/navigation/top-breadcrumb";
import { TopNavAiAssistant } from "@/components/navigation/top-nav-ai-assistant";
import { TopNavGlobalSearch } from "@/components/navigation/top-nav-global-search";
import { TopNavQuickCreate } from "@/components/navigation/top-nav-quick-create";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  onMobileMenuClick?: () => void;
  showMobileMenuButton?: boolean;
  /** Optional slot before breadcrumb (e.g. module context). */
  leading?: ReactNode;
};

function BreadcrumbFallback() {
  return <div className="h-4 w-32 animate-pulse rounded bg-muted" aria-hidden />;
}

export function TopNavigation({
  className,
  onMobileMenuClick,
  showMobileMenuButton = true,
  leading,
}: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
      role="banner"
    >
      <div className="flex h-14 items-center gap-1.5 px-2 sm:gap-2 lg:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          {showMobileMenuButton && onMobileMenuClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 lg:hidden"
              onClick={onMobileMenuClick}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          ) : null}

          <Link
            href="/dashboard"
            className="hidden shrink-0 text-sm font-semibold tracking-tight text-foreground sm:block"
          >
            MoharazNX
          </Link>

          {leading}

          <Suspense fallback={<BreadcrumbFallback />}>
            <TopBreadcrumb className="hidden min-w-0 flex-1 md:flex" />
          </Suspense>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
          <TopNavGlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <TopNavGlobalSearch compact className="md:hidden" />
          <ScopeSwitchers />
          <TopNavQuickCreate />
          <NotificationCenter />
          <TopNavAiAssistant />
          <ThemeSwitch variant="icon" className="hidden sm:inline-flex" />
          <UserMenu />
        </div>
      </div>

      <Suspense fallback={null}>
        <div className="border-t px-2 py-1.5 md:hidden">
          <TopBreadcrumb compact expandable />
        </div>
      </Suspense>
    </header>
  );
}
