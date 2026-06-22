import { create } from "zustand";
import { toast } from "sonner";
import {
  purchaseReturnsSeed,
  returnCreditTotal,
  type PurchaseReturn,
  type ReturnLine,
  type ReturnStatus,
} from "@/lib/mock-data/purchase-returns";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";

type PurchaseReturnStore = {
  returns: PurchaseReturn[];
  getById: (id: string) => PurchaseReturn | undefined;
  getByPurchaseOrder: (poId: string) => PurchaseReturn[];
  updateStatus: (id: string, status: ReturnStatus) => void;
  patchReturn: (id: string, patch: Partial<PurchaseReturn>) => void;
  updateLine: (returnId: string, lineId: string, patch: Partial<ReturnLine>) => void;
  addReturn: (ret: PurchaseReturn) => void;
  approveReturn: (id: string) => void;
  rejectReturn: (id: string) => void;
  shipReturn: (id: string) => void;
  confirmVendorReceived: (id: string) => void;
  creditReturn: (id: string) => void;
};

function syncPoReturned(ret: PurchaseReturn) {
  const poStore = usePurchaseOrderStore.getState();
  const po = poStore.getById(ret.purchaseOrderId);
  if (!po) return;

  const lines = po.lines.map((line) => {
    const rl = ret.lines.find((l) => l.poLineId === line.id);
    if (!rl) return line;
    return {
      ...line,
      quantityReturned: Math.min(
        line.quantityReceived,
        line.quantityReturned + rl.quantityReturn,
      ),
    };
  });

  const returnIds = po.returnIds.includes(ret.id) ? po.returnIds : [...po.returnIds, ret.id];
  poStore.patchOrder(po.id, { lines, returnIds });
}

function recalcCredit(ret: PurchaseReturn): PurchaseReturn {
  return { ...ret, creditAmount: returnCreditTotal(ret) };
}

export const usePurchaseReturnStore = create<PurchaseReturnStore>()((set, get) => ({
  returns: purchaseReturnsSeed.map((r) => ({ ...r, creditAmount: returnCreditTotal(r) })),
  getById: (id) => get().returns.find((r) => r.id === id),
  getByPurchaseOrder: (poId) => get().returns.filter((r) => r.purchaseOrderId === poId),
  updateStatus: (id, status) =>
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, status } : r)),
    })),
  patchReturn: (id, patch) =>
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
  updateLine: (returnId, lineId, patch) =>
    set((s) => ({
      returns: s.returns.map((r) => {
        if (r.id !== returnId) return r;
        const lines = r.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l));
        return recalcCredit({ ...r, lines });
      }),
    })),
  addReturn: (ret) => {
    set((s) => ({ returns: [ret, ...s.returns] }));
    const po = usePurchaseOrderStore.getState().getById(ret.purchaseOrderId);
    if (po && !po.returnIds.includes(ret.id)) {
      usePurchaseOrderStore.getState().patchOrder(po.id, {
        returnIds: [...po.returnIds, ret.id],
      });
    }
  },
  approveReturn: (id) => {
    const ret = get().getById(id);
    if (!ret) return;
    if (ret.status !== "requested") {
      toast.error("Only requested returns can be approved");
      return;
    }
    if (ret.lines.some((l) => l.quantityReturn <= 0)) {
      toast.error("Enter return quantity on all lines");
      return;
    }
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, status: "approved" as ReturnStatus } : r)),
    }));
    toast.success("Return approved");
  },
  rejectReturn: (id) => {
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, status: "rejected" as ReturnStatus } : r)),
    }));
    toast.success("Return rejected");
  },
  shipReturn: (id) => {
    const ret = get().getById(id);
    if (!ret) return;
    if (ret.status !== "approved") {
      toast.error("Approve return before shipping");
      return;
    }
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, status: "shipped" as ReturnStatus } : r)),
    }));
    syncPoReturned(ret);
    toast.success("Return shipped — inventory.stock_out.posted (mock)");
  },
  confirmVendorReceived: (id) => {
    const ret = get().getById(id);
    if (!ret) return;
    if (ret.status !== "shipped") {
      toast.error("Return must be shipped first");
      return;
    }
    set((s) => ({
      returns: s.returns.map((r) =>
        r.id === id ? { ...r, status: "vendor_received" as ReturnStatus } : r,
      ),
    }));
    toast.success("Vendor acknowledged receipt");
  },
  creditReturn: (id) => {
    const ret = get().getById(id);
    if (!ret) return;
    if (ret.status !== "vendor_received") {
      toast.error("Confirm vendor receipt before crediting");
      return;
    }
    set((s) => ({
      returns: s.returns.map((r) => (r.id === id ? { ...r, status: "credited" as ReturnStatus } : r)),
    }));
    toast.success("Credit note posted — purchase.return.credited (mock)");
  },
}));

export function returnStatusBadgeVariant(
  status: ReturnStatus,
): "default" | "secondary" | "success" | "warning" | "muted" | "outline" {
  switch (status) {
    case "requested":
      return "muted";
    case "approved":
      return "secondary";
    case "shipped":
      return "default";
    case "vendor_received":
      return "warning";
    case "credited":
      return "success";
    case "rejected":
    case "cancelled":
      return "outline";
    default:
      return "muted";
  }
}
