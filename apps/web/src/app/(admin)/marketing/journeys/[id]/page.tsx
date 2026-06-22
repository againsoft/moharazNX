"use client";

import { use, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { JourneyDetail } from "@/components/marketing/journey-detail";
import {
  updateMarketingJourneyStatus,
  useMarketingJourney,
} from "@/lib/api/use-marketing-journeys";
import type { MarketingJourney } from "@/lib/mock-data/marketing";

type Props = { params: Promise<{ id: string }> };

export default function MarketingJourneyDetailPage({ params }: Props) {
  const { id } = use(params);
  const { journey, loading, error, refetch } = useMarketingJourney(id);

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "marketing-journey-detail-api" });
  }, [error]);

  const handleStatusChange = useCallback(
    async (journeyId: string, nextStatus: MarketingJourney["status"]) => {
      try {
        await updateMarketingJourneyStatus(journeyId, nextStatus);
        await refetch();
        toast.success("Journey status updated");
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
          <Link href="/marketing/journeys" className="hover:text-foreground">Journeys</Link>
        </p>
      </div>
      <JourneyDetail
        journey={journey}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
