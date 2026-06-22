"use client";

import { Megaphone } from "lucide-react";
import { MarketingControlCenter } from "@/components/marketing/marketing-control-center";

export default function MarketingPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › Marketing</p>
        <div className="flex flex-wrap items-center gap-2">
          <Megaphone className="h-5 w-5 text-orange-600" />
          <h1 className="page-title">Marketing</h1>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          Campaigns, audiences, automation journeys, and coupons — reach the right person on the
          right channel with measurable attribution.
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <MarketingControlCenter />
      </div>
    </div>
  );
}
