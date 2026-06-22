"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { buildReturnFromPurchaseOrder } from "@/lib/mock-data/purchase-returns";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";
import { usePurchaseReceiptStore } from "@/lib/store/purchase-receipt-store";
import { usePurchaseReturnStore } from "@/lib/store/purchase-return-store";
import { Button } from "@/components/ui/button";

export function ReturnFromPoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("poId");
  const getOrder = usePurchaseOrderStore((s) => s.getById);
  const getReceiptsByPo = usePurchaseReceiptStore((s) => s.getByPurchaseOrder);
  const getReturnsByPo = usePurchaseReturnStore((s) => s.getByPurchaseOrder);
  const addReturn = usePurchaseReturnStore((s) => s.addReturn);

  useEffect(() => {
    if (!poId) {
      router.replace("/suppliers/returns");
      return;
    }

    const po = getOrder(poId);
    if (!po) {
      toast.error("Purchase order not found");
      router.replace("/suppliers/returns");
      return;
    }

    const draft = getReturnsByPo(poId).find((r) => r.status === "requested");
    if (draft) {
      router.replace(`/suppliers/returns/${draft.id}`);
      return;
    }

    const hasReceived = po.lines.some((l) => l.quantityReceived > 0);
    const postedReceipt = getReceiptsByPo(poId).find(
      (r) => r.status === "posted" || r.status === "completed",
    );

    if (!hasReceived && !postedReceipt) {
      toast.error("Receive goods before creating a return");
      router.replace(`/suppliers/purchase-orders/${poId}`);
      return;
    }

    const ret = buildReturnFromPurchaseOrder(po, postedReceipt?.id, postedReceipt?.number);
    if (ret.lines.length === 0) {
      toast.error("No received lines available for return");
      router.replace(`/suppliers/purchase-orders/${poId}`);
      return;
    }

    addReturn(ret);
    toast.success(`Return ${ret.number} created`);
    router.replace(`/suppliers/returns/${ret.id}`);
  }, [poId, getOrder, getReceiptsByPo, getReturnsByPo, addReturn, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <p>Creating vendor return from purchase order…</p>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/suppliers/returns">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
      </Button>
    </div>
  );
}
