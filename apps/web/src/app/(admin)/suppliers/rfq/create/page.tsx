"use client";

import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { RfqForm } from "@/components/purchase/rfq-form";

export default function CreateRfqPage() {
  return (
    <SupplierPageShell
      title="New RFQ"
      subtitle="Define items and invite vendors to submit quotations."
    >
      <RfqForm />
    </SupplierPageShell>
  );
}
