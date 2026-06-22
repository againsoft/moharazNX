"use client";

import { Suspense } from "react";
import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { ReceiptFromPoRedirect } from "@/components/purchase/receipt-from-po-redirect";

export default function CreateReceiptPage() {
  return (
    <SupplierPageShell title="Receive goods" subtitle="Creating receipt from purchase order…">
      <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}>
        <ReceiptFromPoRedirect />
      </Suspense>
    </SupplierPageShell>
  );
}
