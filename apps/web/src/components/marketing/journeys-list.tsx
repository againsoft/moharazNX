"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Workflow } from "lucide-react";
import type { MarketingJourney } from "@/lib/mock-data/marketing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: MarketingJourney["status"][] = ["active", "draft", "paused"];

function statusVariant(status: MarketingJourney["status"]) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "secondary" as const;
}

export function JourneysList({
  journeys,
  loading = false,
}: {
  journeys: MarketingJourney[];
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return journeys.filter((j) => {
      if (status !== "all" && j.status !== status) return false;
      if (q && !j.name.toLowerCase().includes(q) && !j.trigger.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [journeys, query, status]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search name or trigger…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-[240px]"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[140px]">
          <option value="all">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading && (
          <div className="col-span-full rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="col-span-full rounded-lg border border-input px-4 py-8 text-center text-sm text-muted-foreground">
            No journeys found
          </div>
        )}
        {!loading && rows.map((j) => (
          <Link
            key={j.id}
            href={`/marketing/journeys/${j.id}`}
            className="rounded-lg border border-input bg-card p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold">{j.name}</h3>
              </div>
              <Badge variant={statusVariant(j.status)} className="capitalize">
                {j.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Trigger: {j.trigger}</p>
            <p className="mt-2 text-xs">{j.steps} steps</p>
            {j.enrolled > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Completion</span>
                  <span>{Math.round((j.completed / j.enrolled) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(j.completed / j.enrolled) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {j.completed} / {j.enrolled} enrolled
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>

      <p className={cn("text-xs text-muted-foreground", loading && "opacity-60")}>
        Showing {rows.length} of {journeys.length} journeys
      </p>
    </div>
  );
}
