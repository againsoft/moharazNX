"use client";

import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { ReturnGrid } from "@/components/purchase/return-grid";

export default function ReturnsPage() {
  return (
    <SupplierPageShell
      title="Vendor Returns"
      subtitle="RMA and return-to-vendor — ship back, obtain vendor credit (prototype)."
    >
      <ReturnGrid className="min-h-0 flex-1" />
    </SupplierPageShell>
  );
}
