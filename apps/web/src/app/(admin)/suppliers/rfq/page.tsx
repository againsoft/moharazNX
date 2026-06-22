"use client";

import { Suspense } from "react";
import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { RfqGrid } from "@/components/purchase/rfq-grid";

export default function RfqPage() {
  return (
    <SupplierPageShell
      title="Request for Quotation"
      subtitle="Send RFQs to vendors, collect quotes, compare prices, and award before creating a PO."
    >
      <Suspense
        fallback={<div className="min-h-0 flex-1 rounded-lg border border-input bg-muted/20" />}
      >
        <RfqGrid className="min-h-0 flex-1" />
      </Suspense>
    </SupplierPageShell>
  );
}
