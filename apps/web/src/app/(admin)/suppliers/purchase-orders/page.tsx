"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { PurchaseOrderGrid } from "@/components/purchase/purchase-order-grid";

function PurchaseOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  const create = searchParams.get("create") === "1";
  const partnerId = searchParams.get("partnerId");
  const supplierId = searchParams.get("supplierId");

  useEffect(() => {
    if (!create) return;
    const params = new URLSearchParams();
    if (partnerId) params.set("partnerId", partnerId);
    if (supplierId) params.set("supplierId", supplierId);
    const query = params.toString();
    router.replace(`/suppliers/purchase-orders/create${query ? `?${query}` : ""}`);
  }, [create, partnerId, router, supplierId]);

  if (create) {
    return (
      <p className="flex flex-1 items-center text-sm text-muted-foreground">
        Opening create PO…
      </p>
    );
  }

  return <PurchaseOrderGrid className="min-h-0 flex-1" initialStatus={status} />;
}

export default function PurchaseOrdersPage() {
  return (
    <SupplierPageShell
      title="Purchase Orders"
      subtitle="Create, approve, and track purchase orders — procure-to-pay workflow (prototype)."
    >
      <Suspense
        fallback={<div className="min-h-0 flex-1 rounded-lg border border-input bg-muted/20" />}
      >
        <PurchaseOrdersContent />
      </Suspense>
    </SupplierPageShell>
  );
}
