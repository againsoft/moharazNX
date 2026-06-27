"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  Search,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  flattenWorkspaceNav,
  workspaceDashboardItem,
  workspaceHomeItem,
  workspaceNavGroups,
  type WorkspaceNavItem,
} from "@/lib/workspace/navigation-config";

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function hasActiveChild(item: WorkspaceNavItem, pathname: string): boolean {
  if (item.href && isActive(pathname, item.href)) return true;
  return item.children?.some((c) => hasActiveChild(c, pathname)) ?? false;
}

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
  depth = 0,
  openItems,
  setOpenItems,
}: {
  item: WorkspaceNavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate: (title: string, href: string) => void;
  depth?: number;
  openItems: Record<string, boolean>;
  setOpenItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const favorites = useAppStore((s) => s.favorites);
  const Icon = item.icon;

  // Expandable item with children
  if (item.children?.length) {
    const childActive = hasActiveChild(item, pathname);
    const open = openItems[item.id] ?? childActive;
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenItems((s) => ({ ...s, [item.id]: !open }))}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium hover:bg-accent",
            childActive && "text-foreground",
            !childActive && "text-muted-foreground",
            depth > 0 && "ml-2 w-[calc(100%-0.5rem)]",
          )}
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 truncate">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {!collapsed && <span className="truncate">{item.title}</span>}
          </span>
          {!collapsed && (
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition", open && "rotate-180")} />
          )}
        </button>
        {open && !collapsed && (
          <div className="border-l ml-4 pl-1 mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.id}
                item={child}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
                depth={depth + 1}
                openItems={openItems}
                setOpenItems={setOpenItems}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Leaf item with href
  if (!item.href) return null;
  const active = isActive(pathname, item.href);
  const favorited = favorites.includes(item.href);

  return (
    <div className="group relative">
      <Link
        href={item.href}
        onClick={() => onNavigate(item.title, item.href!)}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-accent",
          active && "border-l-2 border-primary bg-accent pl-[calc(0.5rem-2px)]",
          !active && depth > 0 && "text-muted-foreground hover:text-foreground",
        )}
      >
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
        {!collapsed && <span className="truncate">{item.title}</span>}
        {!collapsed && item.badge ? (
          <span className="ml-auto rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
            {item.badge}
          </span>
        ) : null}
      </Link>
      {!collapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(item.href!);
          }}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-0 hover:bg-muted group-hover:opacity-100",
            favorited && "opacity-100 text-amber-500",
          )}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("h-3 w-3", favorited && "fill-current")} />
        </button>
      )}
    </div>
  );
}

type Props = {
  className?: string;
  onNavigate?: () => void;
};

/** WS-SIDE-* — Zone C left sidebar (240px / 64px collapsed). */
export function WorkspaceSidebar({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const recentPages = useAppStore((s) => s.recentPages);
  const favorites = useAppStore((s) => s.favorites);
  const addRecent = useAppStore((s) => s.addRecent);
  const [filter, setFilter] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(workspaceNavGroups.map((g) => [g.id, true])),
  );
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const navIndex = useMemo(() => flattenWorkspaceNav(), []);
  const favoriteItems = useMemo(
    () =>
      favorites
        .map((href) => navIndex.find((n) => n.href === href))
        .filter(Boolean) as { title: string; href: string }[],
    [favorites, navIndex],
  );

  const handleNavigate = (title: string, href: string) => {
    addRecent(title, href);
    onNavigate?.();
  };

  const filterLower = filter.trim().toLowerCase();

  return (
    <aside
      data-zone="C"
      data-component="WS-SIDE"
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-muted/20 transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
        className,
      )}
      aria-label="Main navigation"
    >
      {!collapsed && (
        <div className="border-b p-2" data-component="WS-SIDE-SEARCH">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter menu…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-8 text-xs"
              aria-label="Filter sidebar navigation"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 text-xs">
        <nav className="space-y-1">
          <NavLink
            item={workspaceDashboardItem}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={handleNavigate}
            openItems={openItems}
            setOpenItems={setOpenItems}
          />
        </nav>

        {!collapsed && favoriteItems.length > 0 && (
          <section className="mt-3" data-component="WS-SIDE-FAV">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Favorites
            </p>
            {favoriteItems.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                onClick={() => handleNavigate(f.title, f.href)}
                className="block truncate rounded-md px-2 py-1 text-xs hover:bg-accent"
              >
                {f.title}
              </Link>
            ))}
          </section>
        )}


        {workspaceNavGroups.map((group) => {
          const itemMatchesFilter = (item: WorkspaceNavItem): boolean => {
            if (item.title.toLowerCase().includes(filterLower)) return true;
            return item.children?.some(itemMatchesFilter) ?? false;
          };
          const visibleItems = group.items.filter(
            (item) =>
              !filterLower ||
              group.title.toLowerCase().includes(filterLower) ||
              itemMatchesFilter(item),
          );
          if (filterLower && visibleItems.length === 0) return null;

          const open = openGroups[group.id] ?? true;
          return (
            <section key={group.id} className="mt-3">
              {!collapsed && (
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground"
                  onClick={() => setOpenGroups((g) => ({ ...g, [group.id]: !open }))}
                  aria-expanded={open}
                >
                  {group.title}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
                </button>
              )}
              {(collapsed || open) && (
                <div className="mt-0.5 space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.id}
                      item={item}
                      pathname={pathname}
                      collapsed={collapsed}
                      onNavigate={handleNavigate}
                      openItems={openItems}
                      setOpenItems={setOpenItems}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="hidden border-t p-2 md:block" data-component="WS-SIDE-COLLAPSE">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 px-2 text-xs"
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
