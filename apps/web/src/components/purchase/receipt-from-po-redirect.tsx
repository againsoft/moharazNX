"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { buildReceiptFromPurchaseOrder } from "@/lib/mock-data/purchase-receipts";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";
import { usePurchaseReceiptStore } from "@/lib/store/purchase-receipt-store";
import { Button } from "@/components/ui/button";

export function ReceiptFromPoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("poId");
  const getOrder = usePurchaseOrderStore((s) => s.getById);
  const getByPo = usePurchaseReceiptStore((s) => s.getByPurchaseOrder);
  const addReceipt = usePurchaseReceiptStore((s) => s.addReceipt);

  useEffect(() => {
    if (!poId) {
      router.replace("/suppliers/receipts");
      return;
    }

    const po = getOrder(poId);
    if (!po) {
      toast.error("Purchase order not found");
      router.replace("/suppliers/receipts");
      return;
    }

    const draft = getByPo(poId).find((r) => r.status === "draft" || r.status === "receiving");
    if (draft) {
      router.replace(`/suppliers/receipts/${draft.id}`);
      return;
    }

    if (!["ordered", "partially_received"].includes(po.status)) {
      toast.error("PO is not open for receiving");
      router.replace(`/suppliers/purchase-orders/${poId}`);
      return;
    }

    const receipt = buildReceiptFromPurchaseOrder(po);
    addReceipt(receipt);
    toast.success(`Goods receipt ${receipt.number} created`);
    router.replace(`/suppliers/receipts/${receipt.id}`);
  }, [poId, getOrder, getByPo, addReceipt, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <p>Creating goods receipt from purchase order…</p>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/suppliers/receipts">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
      </Button>
    </div>
  );
}
