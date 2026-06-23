"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Search, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  addRecentSearch,
  buildBrandSearchUrl,
  buildCategoryUrl,
  buildSearchUrl,
  getRecentSearches,
  liveSearch,
  TRENDING_SEARCHES,
} from "@/lib/mock-data/storefront-search";
import { productPath } from "@/lib/url-slug/storefront-paths";
import { cn, formatCurrency } from "@/lib/utils";

type LiveSearchProps = {
  variant?: "header" | "page" | "mobile";
  defaultQuery?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
};

type FlatItem =
  | { type: "product"; href: string; label: string }
  | { type: "category"; href: string; label: string }
  | { type: "brand"; href: string; label: string }
  | { type: "suggestion"; href: string; label: string }
  | { type: "view-all"; href: string; label: string };

export function LiveSearch({
  variant = "header",
  defaultQuery = "",
  autoFocus = false,
  onNavigate,
  className,
}: LiveSearchProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(defaultQuery);
  const [debounced, setDebounced] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(defaultQuery);
    setDebounced(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const results = useMemo(() => liveSearch(debounced), [debounced]);
  const hasQuery = debounced.trim().length > 0;

  const flatItems = useMemo<FlatItem[]>(() => {
    if (!hasQuery) {
      return [
        ...recent.map((term) => ({
          type: "suggestion" as const,
          href: buildSearchUrl(term),
          label: term,
        })),
        ...TRENDING_SEARCHES.filter((t) => !recent.includes(t))
          .slice(0, 5)
          .map((term) => ({
            type: "suggestion" as const,
            href: buildSearchUrl(term),
            label: term,
          })),
      ];
    }

    return [
      ...results.products.map((p) => ({
        type: "product" as const,
        href: productPath(p.slug),
        label: p.name,
      })),
      ...results.categories.map((c) => ({
        type: "category" as const,
        href: buildCategoryUrl(c.slug),
        label: c.name,
      })),
      ...results.brands.map((b) => ({
        type: "brand" as const,
        href: buildBrandSearchUrl(b.name),
        label: b.name,
      })),
      ...(results.total > results.products.length
        ? [
            {
              type: "view-all" as const,
              href: buildSearchUrl(debounced),
              label: `View all ${results.total} results`,
            },
          ]
        : []),
    ];
  }, [debounced, hasQuery, recent, results]);

  const navigate = useCallback(
    (href: string, term?: string) => {
      if (term?.trim()) {
        addRecentSearch(term);
        setRecent(getRecentSearches());
      }
      setOpen(false);
      setActiveIndex(-1);
      onNavigate?.();
      router.push(href);
    },
    [onNavigate, router],
  );

  const submitSearch = useCallback(
    (term = query) => {
      const value = term.trim();
      if (!value) return;
      navigate(buildSearchUrl(value), value);
    },
    [navigate, query],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        navigate(flatItems[activeIndex].href, hasQuery ? query : flatItems[activeIndex].label);
        return;
      }
      submitSearch();
    }
  };

  const inputClassName =
    variant === "page"
      ? "h-11 pl-10 text-sm"
      : variant === "mobile"
        ? "h-10 pl-9"
        : "h-[44px] rounded-full border-0 bg-[#f4f5f7] pl-10 text-sm shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0";

  const showPanel = open && (flatItems.length > 0 || hasQuery);

  let itemIndex = -1;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products, brands, categories…"
          className={cn(inputClassName, query && "pr-9")}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setDebounced("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute z-[60] mt-1 overflow-hidden rounded-xl border border-border/60 bg-background shadow-lg",
            variant === "page" ? "left-0 right-0" : "left-0 right-0 min-w-[320px] sm:min-w-[380px]",
          )}
        >
          {!hasQuery && (
            <div className="border-b border-border/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {recent.length > 0 ? "Recent & trending" : "Trending searches"}
            </div>
          )}

          {hasQuery && results.products.length > 0 && (
            <div className="border-b border-border/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Products
            </div>
          )}

          <div className="max-h-[min(420px,70vh)] overflow-y-auto p-1">
            {!hasQuery &&
              flatItems.map((item) => {
                itemIndex += 1;
                const idx = itemIndex;
                const isRecent = recent.includes(item.label);
                return (
                  <button
                    key={`${item.label}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      activeIndex === idx ? "bg-accent" : "hover:bg-accent/60",
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigate(item.href, item.label)}
                  >
                    {isRecent ? (
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="line-clamp-1">{item.label}</span>
                  </button>
                );
              })}

            {hasQuery &&
              results.products.map((product) => {
                itemIndex += 1;
                const idx = itemIndex;
                return (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                      activeIndex === idx ? "bg-accent" : "hover:bg-accent/60",
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigate(productPath(product.slug), query)}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-medium">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold">{formatCurrency(product.price)}</span>
                  </button>
                );
              })}

            {hasQuery && results.categories.length > 0 && (
              <>
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Categories
                </div>
                {results.categories.map((category) => {
                  itemIndex += 1;
                  const idx = itemIndex;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        activeIndex === idx ? "bg-accent" : "hover:bg-accent/60",
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigate(buildCategoryUrl(category.slug), query)}
                    >
                      <span>{category.name}</span>
                      <span className="text-[11px] text-muted-foreground">{category.productCount} items</span>
                    </button>
                  );
                })}
              </>
            )}

            {hasQuery && results.brands.length > 0 && (
              <>
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Brands
                </div>
                {results.brands.map((brand) => {
                  itemIndex += 1;
                  const idx = itemIndex;
                  return (
                    <button
                      key={brand.name}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={cn(
                        "flex w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        activeIndex === idx ? "bg-accent" : "hover:bg-accent/60",
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigate(buildBrandSearchUrl(brand.name), query)}
                    >
                      {brand.name}
                    </button>
                  );
                })}
              </>
            )}

            {hasQuery && results.total === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{debounced}&rdquo;
              </div>
            )}

            {hasQuery && results.total > results.products.length && (
              <>
                {(() => {
                  itemIndex += 1;
                  const idx = itemIndex;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={cn(
                        "mt-1 flex w-full items-center justify-between rounded-lg border-t border-border/60 px-2.5 py-2.5 text-left text-sm font-medium text-primary transition-colors",
                        activeIndex === idx ? "bg-accent" : "hover:bg-accent/60",
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => submitSearch()}
                    >
                      View all {results.total} results
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  );
                })()}
              </>
            )}
          </div>

          {hasQuery && results.total > 0 && (
            <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
              Press Enter to search · ↑↓ to navigate
            </div>
          )}
        </div>
      )}
    </div>
  );
}
