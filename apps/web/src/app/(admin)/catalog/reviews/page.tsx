"use client";

import { ReviewsDashboard } from "@/components/reviews/reviews-dashboard";

export default function ReviewsDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1">
        <p className="page-subtitle">MoharazNX › Catalog</p>
        <h1 className="page-title">Reviews</h1>
      </div>
      <ReviewsDashboard />
    </div>
  );
}
