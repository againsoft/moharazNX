import type { PurchaseOrder } from "./purchase-orders";

const SUPPLIER_NAMES: Record<string, string> = {
  sup_001: "TechPro Distributors Ltd",
  sup_002: "UrbanWear Manufacturing",
  sup_003: "GlowUp Beauty Imports",
  sup_004: "Shenzhen Electronics Co.",
  sup_005: "HomeNest Wholesale",
};

export type ReturnReason =
  | "defective"
  | "wrong_item"
  | "over_shipment"
  | "warranty"
  | "expired";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "shipped"
  | "vendor_received"
  | "credited"
  | "rejected"
  | "cancelled";

export type ReturnLine = {
  id: string;
  poLineId: string;
  sku: string;
  name: string;
  quantityReturn: number;
  unitPrice: number;
  reason: ReturnReason;
  batchLot?: string;
};

export type PurchaseReturn = {
  id: string;
  number: string;
  purchaseOrderId: string;
  poNumber: string;
  receiptId?: string;
  receiptNumber?: string;
  supplierId: string;
  warehouse: string;
  requestDate: string;
  requestedBy: string;
  status: ReturnStatus;
  reason: ReturnReason;
  lines: ReturnLine[];
  creditAmount: number;
  trackingNumber?: string;
  notes?: string;
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  shipped: "Shipped",
  vendor_received: "Vendor received",
  credited: "Credited",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  over_shipment: "Over-shipment",
  warranty: "Warranty",
  expired: "Expired",
};

export function returnSupplierName(supplierId: string) {
  return SUPPLIER_NAMES[supplierId] ?? "Unknown vendor";
}

export function returnLineTotal(line: ReturnLine) {
  return line.quantityReturn * line.unitPrice;
}

export function returnCreditTotal(ret: PurchaseReturn) {
  return ret.lines.reduce((s, l) => s + returnLineTotal(l), 0);
}

export const purchaseReturnsSeed: PurchaseReturn[] = [
  {
    id: "pr_1001",
    number: "PR-2026-0041",
    purchaseOrderId: "po_004",
    poNumber: "PO-2026-0138",
    receiptId: "gr_1002",
    receiptNumber: "GR-2026-0298",
    supplierId: "sup_001",
    warehouse: "WH-DHK",
    requestDate: "2026-06-02",
    requestedBy: "Rahim Uddin",
    status: "credited",
    reason: "defective",
    lines: [
      {
        id: "prl_1001_1",
        poLineId: "pol_004_1",
        sku: "SKU-0006",
        name: "Bluetooth Speaker Mini",
        quantityReturn: 5,
        unitPrice: 7750,
        reason: "defective",
        batchLot: "LOT-2026-0188",
      },
    ],
    creditAmount: 38750,
    notes: "QC failed — distorted audio on 5 units.",
  },
  {
    id: "pr_1002",
    number: "PR-2026-0038",
    purchaseOrderId: "po_005",
    poNumber: "PO-2026-0135",
    receiptId: "gr_1003",
    receiptNumber: "GR-2026-0285",
    supplierId: "sup_002",
    warehouse: "WH-CTG",
    requestDate: "2026-05-20",
    requestedBy: "Sadia Rahman",
    status: "credited",
    reason: "warranty",
    lines: [
      {
        id: "prl_1002_1",
        poLineId: "pol_005_1",
        sku: "SKU-0001",
        name: "Premium Cotton T-Shirt",
        quantityReturn: 12,
        unitPrice: 890,
        reason: "warranty",
      },
    ],
    creditAmount: 10680,
    trackingNumber: "DHL-8829104",
  },
  {
    id: "pr_1003",
    number: "PR-2026-0044",
    purchaseOrderId: "po_002",
    poNumber: "PO-2026-0141",
    receiptId: "gr_1001",
    receiptNumber: "GR-2026-0312",
    supplierId: "sup_004",
    warehouse: "WH-DHK",
    requestDate: "2026-06-16",
    requestedBy: "Warehouse Clerk",
    status: "shipped",
    reason: "wrong_item",
    lines: [
      {
        id: "prl_1003_1",
        poLineId: "pol_002_1",
        sku: "SKU-0005",
        name: "Smart Watch Series 5",
        quantityReturn: 20,
        unitPrice: 2500,
        reason: "wrong_item",
        batchLot: "LOT-2026-0412",
      },
    ],
    creditAmount: 50000,
    trackingNumber: "SF-EXP-22019",
    notes: "Received wrong color variant — return in transit to vendor.",
  },
  {
    id: "pr_1004",
    number: "PR-2026-0045",
    purchaseOrderId: "po_007",
    poNumber: "PO-2026-0144",
    receiptId: "gr_1004",
    receiptNumber: "GR-2026-0315",
    supplierId: "sup_001",
    warehouse: "WH-SYL",
    requestDate: "2026-06-15",
    requestedBy: "QC Inspector",
    status: "requested",
    reason: "defective",
    lines: [
      {
        id: "prl_1004_1",
        poLineId: "pol_007_1",
        sku: "SKU-0002",
        name: "Wireless Earbuds Pro",
        quantityReturn: 15,
        unitPrice: 39,
        reason: "defective",
      },
    ],
    creditAmount: 585,
    notes: "QC fail from GR-2026-0315 — awaiting procurement approval.",
  },
  {
    id: "pr_1005",
    number: "PR-2026-0042",
    purchaseOrderId: "po_004",
    poNumber: "PO-2026-0138",
    supplierId: "sup_001",
    warehouse: "WH-DHK",
    requestDate: "2026-06-10",
    requestedBy: "Manager",
    status: "approved",
    reason: "over_shipment",
    lines: [
      {
        id: "prl_1005_1",
        poLineId: "pol_004_1",
        sku: "SKU-0006",
        name: "Bluetooth Speaker Mini",
        quantityReturn: 10,
        unitPrice: 7750,
        reason: "over_shipment",
      },
    ],
    creditAmount: 77500,
    notes: "Vendor shipped 10 extra units — approved for return.",
  },
  {
    id: "pr_1006",
    number: "PR-2026-0046",
    purchaseOrderId: "po_002",
    poNumber: "PO-2026-0141",
    receiptId: "gr_1001",
    receiptNumber: "GR-2026-0312",
    supplierId: "sup_004",
    warehouse: "WH-DHK",
    requestDate: "2026-06-17",
    requestedBy: "Karim Ahmed",
    status: "requested",
    reason: "expired",
    lines: [
      {
        id: "prl_1006_1",
        poLineId: "pol_002_1",
        sku: "SKU-0005",
        name: "Smart Watch Series 5",
        quantityReturn: 8,
        unitPrice: 2500,
        reason: "expired",
        batchLot: "LOT-2026-0412",
      },
    ],
    creditAmount: 20000,
  },
];

export function getPurchaseReturnById(id: string) {
  return purchaseReturnsSeed.find((r) => r.id === id);
}

export function buildReturnFromPurchaseOrder(
  po: PurchaseOrder,
  receiptId?: string,
  receiptNumber?: string,
): PurchaseReturn {
  const stamp = Date.now();
  const id = `pr_${stamp}`;
  const lines: ReturnLine[] = po.lines
    .filter((l) => l.quantityReceived > 0)
    .map((line, i) => ({
      id: `prl_${stamp}_${i}`,
      poLineId: line.id,
      sku: line.sku,
      name: line.name,
      quantityReturn: 0,
      unitPrice: line.unitPrice,
      reason: "defective" as ReturnReason,
    }));

  const ret: PurchaseReturn = {
    id,
    number: `PR-2026-${String(stamp).slice(-4)}`,
    purchaseOrderId: po.id,
    poNumber: po.number,
    receiptId,
    receiptNumber,
    supplierId: po.supplierId,
    warehouse: po.warehouse,
    requestDate: new Date().toISOString().slice(0, 10),
    requestedBy: po.buyer,
    status: "requested",
    reason: "defective",
    lines: lines.length > 0 ? lines : [],
    creditAmount: 0,
  };
  ret.creditAmount = returnCreditTotal(ret);
  return ret;
}
