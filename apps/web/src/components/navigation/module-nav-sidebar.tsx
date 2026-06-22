"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  Search,
  Star,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { ModuleNavFlatEntry, ModuleNavItem } from "@/components/navigation/module-nav-types";
import { flattenModuleNav } from "@/components/navigation/module-nav-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

export type ModuleNavSidebarProps = {
  items: ModuleNavItem[];
  moduleTitle: string;
  moduleIcon?: ComponentType<{ className?: string }>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isItemActive: (pathname: string, search: string, item: ModuleNavItem) => boolean;
  matchHref: (pathname: string, search: string, href?: string) => boolean;
  filterRecent?: (href: string) => boolean;
  onNavigate?: (title: string, href: string) => void;
  onAction?: (action: string, item: ModuleNavItem) => void;
  className?: string;
  showCollapseToggle?: boolean;
};

function NavTree({
  items,
  pathname,
  search,
  depth,
  openGroups,
  setOpenGroups,
  collapsed,
  isItemActive,
  matchHref,
  favorites,
  toggleFavorite,
  onNavigate,
  onAction,
  onLeafClick,
}: {
  items: ModuleNavItem[];
  pathname: string;
  search: string;
  depth: number;
  openGroups: Record<string, boolean>;
  setOpenGroups: Dispatch<SetStateAction<Record<string, boolean>>>;
  collapsed: boolean;
  isItemActive: ModuleNavSidebarProps["isItemActive"];
  matchHref: ModuleNavSidebarProps["matchHref"];
  favorites: string[];
  toggleFavorite: (href: string) => void;
  onNavigate?: (title: string, href: string) => void;
  onAction?: (action: string, item: ModuleNavItem) => void;
  onLeafClick?: () => void;
}) {
  return (
    <div className={cn(depth > 0 && !collapsed && "border-l border-border/60 pl-2 ml-2")}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const active = isItemActive(pathname, search, item);
        const open = openGroups[item.id] ?? active;

        if (hasChildren && !collapsed) {
          return (
            <div key={item.id} className="mb-0.5">
              <div className="flex items-center gap-0.5">
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => {
                      onNavigate?.(item.title, item.href!);
                      onLeafClick?.();
                    }}
                    className={cn(
                      "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-accent",
                      active && "border-l-2 border-primary bg-accent/60 pl-[calc(0.5rem-2px)]",
                    )}
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                    <span className="truncate">{item.title}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium",
                      active && "text-foreground",
                      !active && "text-muted-foreground",
                    )}
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                    <span className="truncate">{item.title}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpenGroups((g) => ({ ...g, [item.id]: !open }))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-accent"
                  aria-expanded={open}
                  aria-label={`${open ? "Collapse" : "Expand"} ${item.title}`}
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
                    aria-hidden
                  />
                </button>
              </div>
              {open && (
                <NavTree
                  items={item.children!}
                  pathname={pathname}
                  search={search}
                  depth={depth + 1}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                  collapsed={collapsed}
                  isItemActive={isItemActive}
                  matchHref={matchHref}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onNavigate={onNavigate}
                  onAction={onAction}
                  onLeafClick={onLeafClick}
                />
              )}
            </div>
          );
        }

        if (hasChildren && collapsed) {
          const targetHref = item.href ?? item.children?.find((c) => c.href)?.href;
          if (!targetHref) return null;
          return (
            <Link
              key={item.id}
              href={targetHref}
              title={item.title}
              onClick={() => {
                onNavigate?.(item.title, targetHref);
                onLeafClick?.();
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mb-0.5 flex h-9 w-full items-center justify-center rounded-md hover:bg-accent",
                active && "border-l-2 border-primary bg-accent",
              )}
            >
              {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden />}
            </Link>
          );
        }

        if (item.action) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onAction?.(item.action!, item);
                onLeafClick?.();
              }}
              className={cn(
                "mb-0.5 flex w-full min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent",
                depth > 0 && "text-muted-foreground",
              )}
            >
              <span className="truncate">{item.title}</span>
            </button>
          );
        }

        if (!item.href) return null;

        const leafActive = matchHref(pathname, search, item.href);
        const isFav = favorites.includes(item.href);

        return (
          <div key={item.id} className="group mb-0.5 flex items-center gap-0.5">
            <Link
              href={item.href}
              onClick={() => {
                onNavigate?.(item.title, item.href!);
                onLeafClick?.();
              }}
              aria-current={leafActive ? "page" : undefined}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent",
                leafActive && "border-l-2 border-primary bg-accent font-medium pl-[calc(0.5rem-2px)]",
                depth === 0 && !leafActive && "font-medium",
                depth > 0 && !leafActive && "text-muted-foreground",
              )}
            >
              {depth === 0 && item.icon && (
                <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleFavorite(item.href!)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-0 transition hover:bg-accent group-hover:opacity-100",
                  isFav && "opacity-100",
                )}
                aria-label={isFav ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
              >
                <Star
                  className={cn("h-3.5 w-3.5", isFav && "fill-amber-400 text-amber-500")}
                  aria-hidden
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SearchResults({
  results,
  pathname,
  search,
  matchHref,
  favorites,
  toggleFavorite,
  onNavigate,
  onLeafClick,
}: {
  results: ModuleNavFlatEntry[];
  pathname: string;
  search: string;
  matchHref: ModuleNavSidebarProps["matchHref"];
  favorites: string[];
  toggleFavorite: (href: string) => void;
  onNavigate?: (title: string, href: string) => void;
  onLeafClick?: () => void;
}) {
  if (results.length === 0) {
    return <p className="px-2 py-4 text-xs text-muted-foreground">No matching pages.</p>;
  }
  return (
    <div className="space-y-0.5">
      {results.map((entry) => {
        const active = matchHref(pathname, search, entry.href);
        const isFav = favorites.includes(entry.href);
        return (
          <div key={entry.id} className="group flex items-center gap-0.5">
            <Link
              href={entry.href}
              onClick={() => {
                onNavigate?.(entry.title, entry.href);
                onLeafClick?.();
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-9 min-w-0 flex-1 flex-col justify-center rounded-md px-2 py-1 hover:bg-accent",
                active && "border-l-2 border-primary bg-accent pl-[calc(0.5rem-2px)]",
              )}
            >
              <span className="truncate text-xs font-medium">{entry.title}</span>
              <span className="truncate text-[10px] text-muted-foreground">
                {entry.path.slice(0, -1).join(" › ") || entry.path[0]}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => toggleFavorite(entry.href)}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-0 transition hover:bg-accent group-hover:opacity-100",
                isFav && "opacity-100",
              )}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={cn("h-3.5 w-3.5", isFav && "fill-amber-400 text-amber-500")}
                aria-hidden
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ModuleNavSidebar({
  items,
  moduleTitle,
  moduleIcon: ModuleIcon,
  collapsed,
  onToggleCollapse,
  isItemActive,
  matchHref,
  filterRecent,
  onNavigate,
  onAction,
  className,
  showCollapseToggle = true,
}: ModuleNavSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const favorites = useAppStore((s) => s.favorites);
  const recentPages = useAppStore((s) => s.recentPages);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addRecent = useAppStore((s) => s.addRecent);

  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const flatEntries = useMemo(() => flattenModuleNav(items), [items]);

  const handleNavigate = (title: string, href: string) => {
    addRecent(title, href);
    onNavigate?.(title, href);
  };

  const favoriteEntries = useMemo(
    () => flatEntries.filter((e) => favorites.includes(e.href)),
    [flatEntries, favorites],
  );

  const recentEntries = useMemo(() => {
    const seen = new Set<string>();
    return recentPages
      .filter((p) => !filterRecent || filterRecent(p.href))
      .filter((p) => {
        if (seen.has(p.href)) return false;
        seen.add(p.href);
        return flatEntries.some((e) => e.href === p.href);
      })
      .slice(0, 6);
  }, [recentPages, filterRecent, flatEntries]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flatEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.path.join(" ").toLowerCase().includes(q) ||
        e.href.toLowerCase().includes(q),
    );
  }, [query, flatEntries]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of items) {
      if (item.children?.length && isItemActive(pathname, search, item)) {
        next[item.id] = true;
      }
    }
    if (Object.keys(next).length) {
      setOpenGroups((g) => ({ ...g, ...next }));
    }
  }, [pathname, search, items, isItemActive]);

  const searching = query.trim().length > 0;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-muted/10",
        collapsed ? "w-12" : "w-56 lg:w-60",
        className,
      )}
      aria-label={`${moduleTitle} navigation`}
    >
      <div className="shrink-0 border-b p-2">
        <div className="flex items-center gap-2 px-1 py-1">
          {ModuleIcon && <ModuleIcon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />}
          {!collapsed && (
            <span className="truncate text-xs font-semibold">{moduleTitle}</span>
          )}
        </div>
        {!collapsed && (
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu…"
              className="h-8 pl-8 text-xs"
              aria-label="Search navigation"
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5 text-xs">
        {searching ? (
          <SearchResults
            results={searchResults}
            pathname={pathname}
            search={search}
            matchHref={matchHref}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onNavigate={handleNavigate}
          />
        ) : (
          <>
            {!collapsed && favoriteEntries.length > 0 && (
              <section className="mb-3" aria-label="Favorites">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Favorites
                </p>
                <div className="space-y-0.5">
                  {favoriteEntries.map((entry) => {
                    const active = matchHref(pathname, search, entry.href);
                    return (
                      <Link
                        key={entry.id}
                        href={entry.href}
                        onClick={() => handleNavigate(entry.title, entry.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
                          active && "border-l-2 border-primary bg-accent font-medium pl-[calc(0.5rem-2px)]",
                        )}
                      >
                        <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-500" aria-hidden />
                        <span className="truncate">{entry.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <nav aria-label="Module sections">
              <NavTree
                items={items}
                pathname={pathname}
                search={search}
                depth={0}
                openGroups={openGroups}
                setOpenGroups={setOpenGroups}
                collapsed={collapsed}
                isItemActive={isItemActive}
                matchHref={matchHref}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onNavigate={handleNavigate}
                onAction={onAction}
              />
            </nav>

            {!collapsed && recentEntries.length > 0 && (
              <section className="mt-4 border-t pt-3" aria-label="Recent pages">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent
                </p>
                <div className="space-y-0.5">
                  {recentEntries.map((entry) => {
                    const active = matchHref(pathname, search, entry.href);
                    return (
                      <Link
                        key={entry.href}
                        href={entry.href}
                        onClick={() => handleNavigate(entry.title, entry.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block truncate rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
                          active && "border-l-2 border-primary bg-accent font-medium text-foreground pl-[calc(0.5rem-2px)]",
                        )}
                      >
                        {entry.title}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showCollapseToggle && (
        <div className="hidden shrink-0 border-t p-1.5 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full justify-start gap-1.5 px-2 text-xs"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand module navigation" : "Collapse module navigation"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      )}
    </aside>
  );
}
