"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  formatBdt,
  type CampaignStatus,
  type MarketingCampaign,
} from "@/lib/mock-data/marketing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

function campaignStatusVariant(status: CampaignStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

export function CampaignsList({
  campaigns,
  loading = false,
}: {
  campaigns: MarketingCampaign[];
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return campaigns.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (
        q
        && !c.code.toLowerCase().includes(q)
        && !c.name.toLowerCase().includes(q)
        && !c.audience.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [campaigns, query, status]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search code, name, audience…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-[240px]"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[150px]">
          <option value="all">All status</option>
          {(Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]).map((s) => (
            <option key={s} value={s}>
              {CAMPAIGN_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            No campaigns found
          </div>
        )}
        {!loading && rows.map((c) => (
          <Link
            key={c.id}
            href={`/marketing/campaigns/${c.id}`}
            className="block rounded-lg border border-input bg-card p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {c.code}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CAMPAIGN_TYPE_LABELS[c.type]} · {c.audience}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.channels.map((ch) => (
                    <Badge key={ch} variant="secondary" className="text-[10px]">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
              <Badge variant={campaignStatusVariant(c.status)} className="capitalize">
                {CAMPAIGN_STATUS_LABELS[c.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>
                {c.startsAt}
                {c.endsAt ? ` → ${c.endsAt}` : ""}
              </span>
              <span>Goal: {c.goal}</span>
              {c.revenue > 0 && (
                <span className="font-medium text-foreground">{formatBdt(c.revenue)}</span>
              )}
            </div>
            {c.progress > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      <p className={cn("text-xs text-muted-foreground", loading && "opacity-60")}>
        Showing {rows.length} of {campaigns.length} campaigns
      </p>
    </div>
  );
}
