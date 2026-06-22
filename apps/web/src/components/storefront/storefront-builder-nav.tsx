"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  isBuilderNavActive,
  storefrontBuilderNavItems,
} from "@/lib/storefront/builder-nav";
import { cn } from "@/lib/utils";

type Props = {
  variant: "desktop" | "mobile";
};

export function StorefrontBuilderNav({ variant }: Props) {
  const pathname = usePathname();
  const active = isBuilderNavActive(pathname);

  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Builders
        </p>
        {storefrontBuilderNavItems.map((item) => {
          const Icon = item.icon;
          const itemActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;

          if (!item.available || !item.href) {
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/70"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <Badge variant="outline" className="text-[9px]">
                  Soon
                </Badge>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                itemActive && "bg-accent text-primary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
          active
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        )}
      >
        Builders
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Product configurators</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {storefrontBuilderNavItems.map((item) => {
          const Icon = item.icon;
          const itemActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;

          if (!item.available || !item.href) {
            return (
              <DropdownMenuItem key={item.id} disabled className="flex flex-col items-start gap-0.5 py-2">
                <span className="flex w-full items-center gap-2 font-medium">
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <Badge variant="outline" className="ml-auto text-[9px]">
                    Soon
                  </Badge>
                </span>
                <span className="pl-6 text-[10px] text-muted-foreground">{item.description}</span>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem key={item.id} asChild className={cn(itemActive && "bg-accent")}>
              <Link href={item.href} className="flex flex-col items-start gap-0.5 py-2">
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="pl-6 text-[10px] text-muted-foreground">{item.description}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
