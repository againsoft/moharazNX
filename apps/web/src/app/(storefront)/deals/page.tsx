import { Suspense } from "react";
import { DealsView } from "@/components/storefront/deals/deals-view";

export const metadata = {
  title: "Deals & Discounts — MoharazNX",
  description: "Limited-time flash sales and discounts on top products.",
};

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsSkeleton />}>
      <DealsView />
    </Suspense>
  );
}

function DealsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
