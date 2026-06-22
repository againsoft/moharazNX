"use client";

import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { BillGrid } from "@/components/purchase/bill-grid";

export default function BillsPage() {
  return (
    <SupplierPageShell
      title="Vendor Bills"
      subtitle="Three-way match PO · receipt · bill — approve and post to accounts payable (prototype)."
    >
      <BillGrid className="min-h-0 flex-1" />
    </SupplierPageShell>
  );
}
