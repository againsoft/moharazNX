import { create } from "zustand";
import { toast } from "sonner";
import {
  evaluateBillMatch,
  vendorBillsSeed,
  billTotal,
  type BillStatus,
  type MatchStatus,
  type VendorBill,
  type VendorBillLine,
} from "@/lib/mock-data/purchase-bills";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";

type PurchaseBillStore = {
  bills: VendorBill[];
  getById: (id: string) => VendorBill | undefined;
  getByPurchaseOrder: (poId: string) => VendorBill[];
  updateStatus: (id: string, status: BillStatus) => void;
  updateMatchStatus: (id: string, matchStatus: MatchStatus) => void;
  patchBill: (id: string, patch: Partial<VendorBill>) => void;
  updateLine: (billId: string, lineId: string, patch: Partial<VendorBillLine>) => void;
  addBill: (bill: VendorBill) => void;
  runAutoMatch: (id: string) => void;
  approveBill: (id: string) => void;
  postBill: (id: string) => void;
  markPaid: (id: string) => void;
};

function syncPoBilled(bill: VendorBill) {
  const poStore = usePurchaseOrderStore.getState();
  const po = poStore.getById(bill.purchaseOrderId);
  if (!po) return;

  const lines = po.lines.map((line) => {
    const bl = bill.lines.find((l) => l.poLineId === line.id);
    if (!bl) return line;
    return {
      ...line,
      quantityBilled: Math.min(line.quantityOrdered, line.quantityBilled + bl.quantityBill),
    };
  });

  const billIds = po.billIds.includes(bill.id) ? po.billIds : [...po.billIds, bill.id];
  poStore.patchOrder(po.id, { lines, billIds });
}

export const usePurchaseBillStore = create<PurchaseBillStore>()((set, get) => ({
  bills: vendorBillsSeed.map((b) => ({ ...b, total: billTotal(b) })),
  getById: (id) => get().bills.find((b) => b.id === id),
  getByPurchaseOrder: (poId) => get().bills.filter((b) => b.purchaseOrderId === poId),
  updateStatus: (id, status) =>
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, status } : b)),
    })),
  updateMatchStatus: (id, matchStatus) =>
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, matchStatus } : b)),
    })),
  patchBill: (id, patch) =>
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })),
  updateLine: (billId, lineId, patch) =>
    set((s) => ({
      bills: s.bills.map((b) => {
        if (b.id !== billId) return b;
        const lines = b.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l));
        const updated = { ...b, lines };
        return { ...updated, total: billTotal(updated) };
      }),
    })),
  addBill: (bill) => {
    set((s) => ({ bills: [bill, ...s.bills] }));
    const po = usePurchaseOrderStore.getState().getById(bill.purchaseOrderId);
    if (po && !po.billIds.includes(bill.id)) {
      usePurchaseOrderStore.getState().patchOrder(po.id, {
        billIds: [...po.billIds, bill.id],
      });
    }
  },
  runAutoMatch: (id) => {
    const bill = get().getById(id);
    if (!bill) return;
    const result = evaluateBillMatch(bill);
    set((s) => ({
      bills: s.bills.map((b) =>
        b.id === id
          ? { ...b, matchStatus: result.matchStatus, status: result.status }
          : b,
      ),
    }));
    if (result.matchStatus === "matched") {
      toast.success("Three-way match passed");
    } else if (result.matchStatus === "exception") {
      toast.warning("Match exception — approval required");
    } else {
      toast.info("Partial match — review variances");
    }
  },
  approveBill: (id) => {
    const bill = get().getById(id);
    if (!bill) return;
    if (!["matched", "exception"].includes(bill.status)) {
      toast.error("Run match before approval");
      return;
    }
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, status: "approved" as BillStatus } : b)),
    }));
    toast.success("Bill approved for posting");
  },
  postBill: (id) => {
    const bill = get().getById(id);
    if (!bill) return;
    if (bill.status !== "approved" && bill.status !== "matched") {
      toast.error("Approve bill before posting");
      return;
    }
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, status: "posted" as BillStatus } : b)),
    }));
    syncPoBilled(bill);
    toast.success("Bill posted — accounting.bill.posted (mock AP entry)");
  },
  markPaid: (id) => {
    set((s) => ({
      bills: s.bills.map((b) => (b.id === id ? { ...b, status: "paid" as BillStatus } : b)),
    }));
    toast.success("Payment recorded (mock)");
  },
}));

export function billStatusBadgeVariant(
  status: BillStatus,
): "default" | "secondary" | "success" | "warning" | "muted" | "outline" {
  switch (status) {
    case "draft":
    case "unmatched":
      return "muted";
    case "matched":
      return "secondary";
    case "exception":
      return "warning";
    case "approved":
      return "default";
    case "posted":
      return "success";
    case "paid":
      return "success";
    case "cancelled":
      return "outline";
    default:
      return "muted";
  }
}

export function matchStatusBadgeVariant(
  status: MatchStatus,
): "default" | "secondary" | "success" | "warning" | "muted" | "outline" {
  switch (status) {
    case "unmatched":
      return "muted";
    case "partial_match":
      return "warning";
    case "matched":
      return "success";
    case "exception":
      return "outline";
    default:
      return "muted";
  }
}
