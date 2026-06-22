"use client";

import { use } from "react";
import { ReceiptDetail } from "@/components/purchase/receipt-detail";

type Props = { params: Promise<{ id: string }> };

export default function ReceiptDetailPage({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Suppliers › Goods Receipts</p>
      </div>
      <ReceiptDetail receiptId={id} />
    </div>
  );
}
