"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const PRIMARY_TABS = [
  { label: "Overview", href: "/orders" },
  { label: "All Orders", href: "/orders/all" },
  { label: "Create", href: "/orders/create" },
] as const;

const MORE_TABS = [
  { label: "Returns", href: "/orders/returns" },
  { label: "Refunds", href: "/orders/refunds" },
  { label: "Payments", href: "/orders/payments" },
  { label: "Shipments", href: "/orders/shipments" },
  { label: "Abandoned Carts", href: "/orders/abandoned-carts" },
  { label: "Activities", href: "/orders/activities" },
  { label: "Reports", href: "/orders/reports" },
] as const;

export function OrdersNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/orders") return pathname === "/orders";
    if (href === "/orders/all") {
      return pathname === "/orders/all" || /^\/orders\/ord_/.test(pathname);
    }
    if (href === "/orders/create") return pathname === "/orders/create" || pathname.endsWith("/edit");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const moreActive = MORE_TABS.some((t) => isActive(t.href));

  if (compact) {
    return (
      <nav className="flex gap-1">
        {PRIMARY_TABS.slice(0, 2).map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium",
              isActive(tab.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-input/70 bg-muted/20 p-1">
      {PRIMARY_TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            isActive(tab.href)
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1 rounded-lg px-3 text-xs font-medium",
              moreActive && "bg-background text-foreground shadow-sm",
            )}
          >
            More <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {MORE_TABS.map((tab) => (
            <DropdownMenuItem key={tab.href} asChild>
              <Link href={tab.href} className={cn(isActive(tab.href) && "font-semibold")}>
                {tab.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

export { statusBadgeVariant } from "@/lib/order-status";
