"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FAQ_CATEGORIES,
  FAQ_QUICK_LINKS,
  filterFaq,
  type FaqCategory,
} from "@/lib/mock-data/storefront-faq";
import { cn } from "@/lib/utils";

function FaqAccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {q}
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open && (
        <p className="border-t border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">{a}</p>
      )}
    </div>
  );
}

export function FaqView() {
  const [category, setCategory] = useState<FaqCategory>("all");
  const [query, setQuery] = useState("");

  const sections = useMemo(() => filterFaq(category, query), [category, query]);
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">FAQ</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Frequently asked questions</h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground sm:text-sm">
          Quick answers about orders, shipping, returns, and payments.
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              category === cat.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {totalItems === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 py-10 text-center">
          <p className="text-sm font-medium">No matching questions</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different search or category.</p>
          <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => { setQuery(""); setCategory("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.category}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FaqAccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="rounded-lg border border-border/60 bg-muted/30 p-4 text-center">
        <p className="text-xs font-medium">Still need help?</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Our support team is here for you.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {FAQ_QUICK_LINKS.map((link) => (
            <Button key={link.href} asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
