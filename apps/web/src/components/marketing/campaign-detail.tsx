"use client";

import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  formatBdt,
  type CampaignStatus,
  type MarketingCampaign,
} from "@/lib/mock-data/marketing";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

function campaignStatusVariant(status: CampaignStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

type Props = {
  campaign: MarketingCampaign | null;
  loading?: boolean;
  error?: string | null;
  onStatusChange?: (id: string, status: CampaignStatus) => void;
};

export function CampaignDetail({
  campaign,
  loading = false,
  error = null,
  onStatusChange,
}: Props) {
  const canWrite = useAdminCanWrite();

  if (loading) {
    return (
      <div className="rounded-lg border border-input px-4 py-12 text-center text-sm text-muted-foreground">
        Loading campaign…
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
        {error ?? "Campaign not found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/marketing/campaigns"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to campaigns
      </Link>

      <div className="rounded-lg border border-input bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Megaphone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{campaign.name}</h1>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {campaign.code}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {CAMPAIGN_TYPE_LABELS[campaign.type]} · {campaign.audience}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={campaignStatusVariant(campaign.status)} className="capitalize">
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </Badge>
            {canWrite && onStatusChange && (
              <Select
                value={campaign.status}
                onChange={(e) => onStatusChange(campaign.id, e.target.value as CampaignStatus)}
                className="w-[140px] text-xs"
              >
                {(Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {CAMPAIGN_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {campaign.channels.map((ch) => (
            <Badge key={ch} variant="secondary" className="text-[10px]">
              {ch}
            </Badge>
          ))}
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Schedule</dt>
            <dd className="mt-0.5 text-sm font-medium">
              {campaign.startsAt}
              {campaign.endsAt ? ` → ${campaign.endsAt}` : " (open-ended)"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Goal</dt>
            <dd className="mt-0.5 text-sm font-medium">{campaign.goal}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Revenue</dt>
            <dd className="mt-0.5 text-sm font-medium">{formatBdt(campaign.revenue)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Progress</dt>
            <dd className="mt-0.5 text-sm font-medium">{campaign.progress}%</dd>
          </div>
        </dl>

        {campaign.progress > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Goal progress</span>
              <span>{campaign.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-orange-500 transition-all")}
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Last updated {campaign.updatedAt}
        </p>
      </div>
    </div>
  );
}
