"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { STORE_STATUS_LABELS, storesList, type StoreRecord } from "@/lib/mock-data/stores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function statusVariant(status: StoreRecord["status"]) {
  if (status === "active") return "default" as const;
  if (status === "setup") return "secondary" as const;
  return "outline" as const;
}

export function StoreList() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return storesList;
    return storesList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Manage all stores in your workspace — switch context, open business settings, or add a new store.
        </p>
        <Button size="sm" onClick={() => toast.info("Add store — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add store
        </Button>
      </div>

      <div className="rounded-lg border border-input bg-muted/30 p-3">
        <label htmlFor="store-search" className="text-xs font-medium text-muted-foreground">
          Search stores
        </label>
        <div className="mt-1 flex gap-2">
          <Input
            id="store-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Store name, code, domain…"
            className="max-w-md"
          />
          <Button variant="outline" size="sm" className="shrink-0">
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-input bg-card">
        <div className="h-full overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 border-b border-input bg-muted/40 text-xs">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Store</th>
                <th className="px-4 py-2.5 text-left font-medium">Code</th>
                <th className="px-4 py-2.5 text-left font-medium">Domain</th>
                <th className="px-4 py-2.5 text-right font-medium">Branches</th>
                <th className="px-4 py-2.5 text-right font-medium">Products</th>
                <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((store) => (
                <tr key={store.id} className="border-b border-input/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.owner}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{store.code}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://${store.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {store.domain}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{store.branches}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{store.products}</td>
                  <td className="px-4 py-3 text-xs">{store.plan}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(store.status)}>{STORE_STATUS_LABELS[store.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" className="h-7" asChild>
                      <Link href={`/settings/stores/${store.id}`}>
                        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                        Settings
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-input px-4 py-2 text-xs text-muted-foreground">
          {rows.length} store{rows.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
