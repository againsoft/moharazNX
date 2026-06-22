"use client";

import { use, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CampaignDetail } from "@/components/marketing/campaign-detail";
import {
  updateMarketingCampaignStatus,
  useMarketingCampaign,
} from "@/lib/api/use-marketing-campaigns";
import type { CampaignStatus } from "@/lib/mock-data/marketing";

type Props = { params: Promise<{ id: string }> };

export default function MarketingCampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const { campaign, loading, error, refetch } = useMarketingCampaign(id);

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "marketing-campaign-detail-api" });
  }, [error]);

  const handleStatusChange = useCallback(
    async (campaignId: string, nextStatus: CampaignStatus) => {
      try {
        await updateMarketingCampaignStatus(campaignId, nextStatus);
        await refetch();
        toast.success("Campaign status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [refetch],
  );

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-3 shrink-0">
        <p className="page-subtitle">
          <Link href="/marketing" className="hover:text-foreground">Marketing</Link>
          {" › "}
          <Link href="/marketing/campaigns" className="hover:text-foreground">Campaigns</Link>
        </p>
      </div>
      <CampaignDetail
        campaign={campaign}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
