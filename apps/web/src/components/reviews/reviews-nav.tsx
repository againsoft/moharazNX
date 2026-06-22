"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_TABS = [
  { label: "Dashboard", href: "/catalog/reviews" },
  { label: "All Reviews", href: "/catalog/reviews/all" },
  { label: "Q&A", href: "/catalog/reviews/qa" },
  { label: "AI Analysis", href: "/catalog/reviews/ai-analysis" },
  { label: "Reports", href: "/catalog/reviews/reports" },
  { label: "Settings", href: "/catalog/reviews/settings" },
] as const;

export function ReviewsNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/catalog/reviews") return pathname === "/catalog/reviews";
    if (href === "/catalog/reviews/all") return pathname === "/catalog/reviews/all" || pathname.startsWith("/catalog/reviews/all");
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
