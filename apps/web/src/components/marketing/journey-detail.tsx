"use client";

import Link from "next/link";
import { ArrowLeft, Workflow } from "lucide-react";
import type { MarketingJourney } from "@/lib/mock-data/marketing";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: MarketingJourney["status"][] = ["active", "draft", "paused"];

function statusVariant(status: MarketingJourney["status"]) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "secondary" as const;
}

type Props = {
  journey: MarketingJourney | null;
  loading?: boolean;
  error?: string | null;
  onStatusChange?: (id: string, status: MarketingJourney["status"]) => void;
};

export function JourneyDetail({
  journey,
  loading = false,
  error = null,
  onStatusChange,
}: Props) {
  const canWrite = useAdminCanWrite();

  if (loading) {
    return (
      <div className="rounded-lg border border-input px-4 py-12 text-center text-sm text-muted-foreground">
        Loading journey…
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
        {error ?? "Journey not found"}
      </div>
    );
  }

  const completionPct = journey.enrolled > 0
    ? Math.round((journey.completed / journey.enrolled) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Link
        href="/marketing/journeys"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to journeys
      </Link>

      <div className="rounded-lg border border-input bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Workflow className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{journey.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Trigger: {journey.trigger}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(journey.status)} className="capitalize">
              {journey.status}
            </Badge>
            {canWrite && onStatusChange && (
              <Select
                value={journey.status}
                onChange={(e) => onStatusChange(journey.id, e.target.value as MarketingJourney["status"])}
                className="w-[120px] text-xs capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Steps</dt>
            <dd className="mt-0.5 text-2xl font-semibold">{journey.steps}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Enrolled</dt>
            <dd className="mt-0.5 text-2xl font-semibold">{journey.enrolled.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Completed</dt>
            <dd className="mt-0.5 text-2xl font-semibold">{journey.completed.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Completion rate</dt>
            <dd className="mt-0.5 text-2xl font-semibold">{completionPct}%</dd>
          </div>
        </dl>

        {journey.enrolled > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-indigo-500 transition-all")}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
