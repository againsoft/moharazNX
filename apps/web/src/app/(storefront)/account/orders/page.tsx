"use client";

import { Suspense } from "react";
import { AccountOrdersView } from "@/components/storefront/account/account-orders-view";

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading orders…</div>}>
      <AccountOrdersView />
    </Suspense>
  );
}
