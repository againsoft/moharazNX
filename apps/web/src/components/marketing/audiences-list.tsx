"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import type { AudienceSegment } from "@/lib/mock-data/marketing";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AudiencesList({
  audiences,
  loading = false,
}: {
  audiences: AudienceSegment[];
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return audiences;
    return audiences.filter(
      (a) => a.name.toLowerCase().includes(q) || a.source.toLowerCase().includes(q),
    );
  }, [audiences, query]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Search name or source…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-[240px]"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="col-span-full rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            No audiences found
          </div>
        )}
        {!loading && rows.map((a) => (
          <Link
            key={a.id}
            href={`/marketing/audiences/${a.id}`}
            className="rounded-lg border border-input bg-card p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold">{a.name}</h3>
            </div>
            <p className="mt-2 text-2xl font-semibold">{a.members.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">{a.growth}</p>
            <p className="mt-2 text-xs text-muted-foreground">Source: {a.source}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Updated {a.updatedAt}</p>
          </Link>
        ))}
      </div>

      <p className={cn("text-xs text-muted-foreground", loading && "opacity-60")}>
        Showing {rows.length} of {audiences.length} segments
      </p>
    </div>
  );
}
