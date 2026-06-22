"use client";

import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { QuotationGrid } from "@/components/purchase/quotation-grid";

export default function QuotationsPage() {
  return (
    <SupplierPageShell
      title="Vendor Quotations"
      subtitle="All vendor quotes across RFQs — filter by status, vendor, or parent RFQ."
    >
      <QuotationGrid className="min-h-0 flex-1" />
    </SupplierPageShell>
  );
}
