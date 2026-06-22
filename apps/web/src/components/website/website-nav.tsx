"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Dashboard",  href: "/website/dashboard" },
  { label: "Pages",      href: "/website/pages" },
  { label: "Layouts",    href: "/website/layouts" },
  { label: "Blog",       href: "/website/blog/posts" },
  { label: "Portfolio",  href: "/website/portfolio" },
  { label: "Team",       href: "/website/team" },
  { label: "Careers",    href: "/website/careers" },
  { label: "Forms",      href: "/website/forms" },
  { label: "SEO",        href: "/website/seo/meta" },
  { label: "Domain",     href: "/website/domain" },
  { label: "AI Tools",   href: "/website/ai" },
  { label: "Settings",   href: "/website/settings" },
] as const;

export function WebsiteNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const visibleTabs = compact ? TABS.slice(0, 5) : TABS;

  return (
    <nav className="flex flex-wrap gap-1">
      {visibleTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            isActive(tab.href)
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
