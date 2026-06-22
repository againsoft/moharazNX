"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Gift,
  Heart,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Star,
  Wallet,
} from "lucide-react";
import { accountPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

export const ACCOUNT_NAV = [
  { href: accountPaths.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: accountPaths.orders, label: "Orders", icon: Package },
  { href: accountPaths.returns, label: "Returns", icon: RotateCcw },
  { href: accountPaths.wishlist, label: "Wishlist", icon: Heart },
  { href: accountPaths.rewards, label: "Rewards", icon: Gift },
  { href: accountPaths.wallet, label: "Wallet", icon: Wallet },
  { href: accountPaths.addresses, label: "Addresses", icon: MapPin },
  { href: accountPaths.reviews, label: "Reviews", icon: Star },
  { href: accountPaths.notifications, label: "Notifications", icon: Bell },
  { href: accountPaths.support, label: "Support", icon: MessageCircle },
] as const;

function isActive(pathname: string, href: string) {
  if (href === accountPaths.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav({ variant = "sidebar" }: { variant?: "sidebar" | "pills" }) {
  const pathname = usePathname();

  if (variant === "pills") {
    return (
      <nav
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
        aria-label="Account sections"
      >
        {ACCOUNT_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive(pathname, href)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="space-y-0.5" aria-label="Account sections">
      {ACCOUNT_NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(pathname, href)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
