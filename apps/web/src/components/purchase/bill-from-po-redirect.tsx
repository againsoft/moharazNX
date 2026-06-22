"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { buildBillFromPurchaseOrder } from "@/lib/mock-data/purchase-bills";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";
import { usePurchaseReceiptStore } from "@/lib/store/purchase-receipt-store";
import { usePurchaseBillStore } from "@/lib/store/purchase-bill-store";
import { Button } from "@/components/ui/button";

export function BillFromPoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("poId");
  const getOrder = usePurchaseOrderStore((s) => s.getById);
  const getReceiptsByPo = usePurchaseReceiptStore((s) => s.getByPurchaseOrder);
  const getBillsByPo = usePurchaseBillStore((s) => s.getByPurchaseOrder);
  const addBill = usePurchaseBillStore((s) => s.addBill);

  useEffect(() => {
    if (!poId) {
      router.replace("/suppliers/bills");
      return;
    }

    const po = getOrder(poId);
    if (!po) {
      toast.error("Purchase order not found");
      router.replace("/suppliers/bills");
      return;
    }

    const draft = getBillsByPo(poId).find((b) => b.status === "draft");
    if (draft) {
      router.replace(`/suppliers/bills/${draft.id}`);
      return;
    }

    const hasReceived = po.lines.some((l) => l.quantityReceived > 0);
    const postedReceipt = getReceiptsByPo(poId).find(
      (r) => r.status === "posted" || r.status === "completed",
    );

    if (!hasReceived && !postedReceipt) {
      toast.error("Post a goods receipt before creating a vendor bill");
      router.replace(`/suppliers/purchase-orders/${poId}`);
      return;
    }

    const bill = buildBillFromPurchaseOrder(
      po,
      postedReceipt?.id,
      postedReceipt?.number,
    );
    addBill(bill);
    toast.success(`Vendor bill ${bill.number} created`);
    router.replace(`/suppliers/bills/${bill.id}`);
  }, [poId, getOrder, getReceiptsByPo, getBillsByPo, addBill, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <p>Creating vendor bill from purchase order…</p>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/suppliers/bills">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
      </Button>
    </div>
  );
}
