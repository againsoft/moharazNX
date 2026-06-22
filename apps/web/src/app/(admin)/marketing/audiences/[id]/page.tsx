"use client";

import { use, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AudienceDetail } from "@/components/marketing/audience-detail";
import {
  updateMarketingAudience,
  useMarketingAudience,
} from "@/lib/api/use-marketing-audiences";

type Props = { params: Promise<{ id: string }> };

export default function MarketingAudienceDetailPage({ params }: Props) {
  const { id } = use(params);
  const { audience, loading, error, refetch } = useMarketingAudience(id);

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "marketing-audience-detail-api" });
  }, [error]);

  const handleUpdate = useCallback(
    async (
      audienceId: string,
      input: { name?: string; source?: string; growth?: string; members?: number },
    ) => {
      try {
        await updateMarketingAudience(audienceId, input);
        await refetch();
        toast.success("Audience updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
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
          <Link href="/marketing/audiences" className="hover:text-foreground">Audiences</Link>
        </p>
      </div>
      <AudienceDetail
        audience={audience}
        loading={loading}
        error={error}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
