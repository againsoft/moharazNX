"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { sidebarNav, type NavItem } from "@/lib/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";

function isNavActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href && isNavActive(pathname, item.href)) return true;
  return item.children?.some((c) => isNavItemActive(pathname, c)) ?? false;
}

function NavChildren({
  items,
  pathname,
  depth,
  groupPrefix,
  openGroups,
  setOpenGroups,
  addRecent,
}: {
  items: NavItem[];
  pathname: string;
  depth: number;
  groupPrefix: string;
  openGroups: Record<string, boolean>;
  setOpenGroups: Dispatch<SetStateAction<Record<string, boolean>>>;
  addRecent: (title: string, href: string) => void;
}) {
  return (
    <div className={cn("border-l pl-2", depth > 0 ? "ml-2" : "ml-3")}>
      {items.map((child) => {
        if (child.children?.length) {
          const key = `${groupPrefix}/${child.title}`;
          const open = openGroups[key] ?? isNavItemActive(pathname, child);
          const active = isNavItemActive(pathname, child);
          return (
            <div key={key} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenGroups((g) => ({ ...g, [key]: !open }))}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-1.5 py-1 text-xs font-medium hover:bg-accent",
                  active && "border-l-2 border-primary bg-accent/50 pl-[calc(0.375rem-2px)]",
                  depth > 0 && !active && "text-muted-foreground",
                )}
              >
                <span className="truncate">{child.title}</span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 shrink-0 transition", open && "rotate-180")}
                  aria-hidden
                />
              </button>
              {open && (
                <NavChildren
                  items={child.children}
                  pathname={pathname}
                  depth={depth + 1}
                  groupPrefix={key}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                  addRecent={addRecent}
                />
              )}
            </div>
          );
        }
        if (!child.href) return null;
        const active = isNavActive(pathname, child.href);
        return (
          <Link
            key={child.href}
            href={child.href}
            onClick={() => addRecent(child.title, child.href!)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-md px-1.5 py-1 text-xs hover:bg-accent",
              active && "border-l-2 border-primary bg-accent font-medium pl-[calc(0.375rem-2px)]",
            )}
          >
            {child.title}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const recentPages = useAppStore((s) => s.recentPages);
  const addRecent = useAppStore((s) => s.addRecent);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Catalog: true,
    Orders: true,
    System: true,
  });

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-muted/20 transition-all",
        collapsed ? "w-12" : "w-52 lg:w-60",
      )}
      aria-label="Main navigation"
    >
      <div className="flex-1 overflow-y-auto p-1.5 text-xs">
        <nav className="space-y-0.5">
          {sidebarNav.map((item) => {
            const sectionLabel = !collapsed && item.section ? (
              <div key={`section-${item.section}`} className="mb-1 mt-3 px-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {item.section}
                </p>
              </div>
            ) : null;

            if (item.children) {
              const open = openGroups[item.title] ?? false;
              const groupActive = isNavItemActive(pathname, item);
              return (
                <div key={item.title}>
                  {sectionLabel}
                  <button
                    type="button"
                    onClick={() =>
                      collapsed
                        ? toggleSidebar()
                        : setOpenGroups((g) => ({ ...g, [item.title]: !open }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-xs font-medium hover:bg-accent",
                      groupActive && "border-l-2 border-primary bg-accent/50 pl-[calc(0.375rem-2px)]",
                    )}
                    aria-expanded={!collapsed && open}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")}
                        aria-hidden
                      />
                    )}
                  </button>
                  {open && !collapsed && (
                    <NavChildren
                      items={item.children}
                      pathname={pathname}
                      depth={0}
                      groupPrefix={item.title}
                      openGroups={openGroups}
                      setOpenGroups={setOpenGroups}
                      addRecent={addRecent}
                    />
                  )}
                </div>
              );
            }
            const active = isNavActive(pathname, item.href);
            return (
              <div key={item.title}>
                {sectionLabel}
                <Link
                  href={item.href!}
                  onClick={() => addRecent(item.title, item.href!)}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs font-medium hover:bg-accent",
                    active && "border-l-2 border-primary bg-accent pl-[calc(0.375rem-2px)]",
                  )}
                >
                  {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                  {!collapsed && item.title}
                </Link>
              </div>
            );
          })}
        </nav>
        {!collapsed && recentPages.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Recent
            </p>
            {recentPages.slice(0, 5).map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="block truncate rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {p.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="hidden border-t p-1.5 lg:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 px-1.5 text-xs"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
