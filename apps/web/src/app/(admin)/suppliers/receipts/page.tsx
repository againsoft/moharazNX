"use client";

import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { ReceiptGrid } from "@/components/purchase/receipt-grid";

export default function ReceiptsPage() {
  return (
    <SupplierPageShell
      title="Goods Receipts"
      subtitle="Receive purchase orders into warehouse — post to update inventory stock (prototype)."
    >
      <ReceiptGrid className="min-h-0 flex-1" />
    </SupplierPageShell>
  );
}
