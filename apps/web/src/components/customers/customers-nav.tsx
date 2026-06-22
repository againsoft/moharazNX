"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_TABS = [
  { label: "Dashboard", href: "/customers" },
  { label: "All Customers", href: "/customers/all" },
  { label: "Customer Groups", href: "/customers/groups" },
  { label: "Segments", href: "/customers/segments" },
  { label: "Loyalty Program", href: "/customers/loyalty" },
  { label: "Rewards", href: "/customers/rewards" },
  { label: "Wallet", href: "/customers/wallet" },
  { label: "Wishlists", href: "/customers/wishlists" },
  { label: "Activities", href: "/customers/activities" },
  { label: "Support", href: "/customers/support" },
  { label: "Marketing", href: "/customers/marketing" },
  { label: "Reports", href: "/customers/reports" },
] as const;

export function CustomersNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/customers") return pathname === "/customers";
    if (href === "/customers/all")
      return pathname === "/customers/all" || pathname.startsWith("/customers/all");
    return pathname === href || pathname.startsWith(href + "/");
  };

  const tabs = compact ? NAV_TABS.slice(0, 2) : NAV_TABS;

  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            isActive(tab.href)
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
