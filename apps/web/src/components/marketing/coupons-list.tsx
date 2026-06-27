"use client";

import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import type { CouponStatus, MarketingCoupon } from "@/lib/mock-data/marketing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CouponStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  disabled: "Disabled",
};

function statusVariant(status: CouponStatus) {
  if (status === "active") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "expired") return "muted" as const;
  return "secondary" as const;
}

export function CouponsList({
  coupons,
  loading = false,
}: {
  coupons: MarketingCoupon[];
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return coupons.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (q && !c.code.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [coupons, query, status]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search code or name…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[200px]" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[140px]">
          <option value="all">All status</option>
          {(Object.keys(STATUS_LABELS) as CouponStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-input">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Redemptions</th>
              <th className="px-3 py-2">Valid</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No coupons found</td></tr>
            )}
            {!loading && rows.map((c) => (
              <tr key={c.id} className="border-t border-input/60 hover:bg-muted/20">
                <td className="px-3 py-2.5 font-mono text-xs font-semibold">{c.code}</td>
                <td className="px-3 py-2.5">{c.name}</td>
                <td className="px-3 py-2.5">{c.discount}</td>
                <td className="px-3 py-2.5">
                  <Badge variant={statusVariant(c.status)} className="text-[10px]">{STATUS_LABELS[c.status]}</Badge>
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {c.redemptions.toLocaleString()}
                  {c.limit != null && <span className="text-muted-foreground"> / {c.limit}</span>}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.startsAt} → {c.endsAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={cn("text-xs text-muted-foreground", loading && "opacity-60")}>
        Showing {rows.length} of {coupons.length} coupons
      </p>
    </div>
  );
}
