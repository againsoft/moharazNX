"use client";

import { Suspense } from "react";
import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { PurchaseOrderForm } from "@/components/purchase/purchase-order-form";

function CreatePurchaseOrderContent() {
  return <PurchaseOrderForm />;
}

export default function CreatePurchaseOrderPage() {
  return (
    <SupplierPageShell
      title="Create Purchase Order"
      subtitle="Add vendor, warehouse, and line items — save as draft or submit for approval."
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading create PO…</p>
        }
      >
        <CreatePurchaseOrderContent />
      </Suspense>
    </SupplierPageShell>
  );
}
