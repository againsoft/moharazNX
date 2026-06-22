import type { Order, OrderLine, OrderStatus } from "@/lib/mock-data/orders";
import { defaultAiInsights } from "@/lib/mock-data/orders";

export type CreateOrderDraft = {
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGroup: string;
  items: OrderLine[];
  shipping: { address: string; city: string; region: string; country: string };
  billing: { address: string; city: string; region: string; country: string };
  sameAsShipping: boolean;
  paymentMethod: string;
  branch: string;
  source: string;
  assignedStaff: string;
  priority: "normal" | "high" | "urgent";
  tags: string;
  notes: string;
  shippingAmount: number;
  discountAmount: number;
  taxRate: number;
};

export const CREATE_ORDER_DEFAULTS: CreateOrderDraft = {
  customerId: null,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerGroup: "retail",
  items: [],
  shipping: { address: "", city: "Dhaka", region: "Dhaka", country: "Bangladesh" },
  billing: { address: "", city: "Dhaka", region: "Dhaka", country: "Bangladesh" },
  sameAsShipping: true,
  paymentMethod: "COD",
  branch: "Dhaka HQ",
  source: "Manual",
  assignedStaff: "Sales Team",
  priority: "normal",
  tags: "",
  notes: "",
  shippingAmount: 120,
  discountAmount: 0,
  taxRate: 5,
};

export const ORDER_BRANCHES = ["Dhaka HQ", "Chittagong", "Sylhet", "Online"];
export const ORDER_SOURCES = ["Manual", "Phone", "Web Store", "POS", "WhatsApp"];
export const PAYMENT_METHODS = ["COD", "bKash", "Nagad", "Card", "Bank Transfer"];
export const ORDER_STAFF = ["Sales Team", "Karim Ahmed", "Sadia Rahman", "Nusrat Jahan", "Call Center"];

export function calcOrderTotals(draft: CreateOrderDraft) {
  const subtotal = draft.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const lineDiscount = draft.items.reduce((s, i) => s + i.discount, 0);
  const discountAmount = draft.discountAmount + lineDiscount;
  const taxable = Math.max(subtotal - discountAmount, 0);
  const taxAmount = Math.round(taxable * (draft.taxRate / 100));
  const grandTotal = taxable + taxAmount + draft.shippingAmount;
  return { subtotal, discountAmount, taxAmount, shippingAmount: draft.shippingAmount, grandTotal };
}

export function buildOrderFromDraft(
  draft: CreateOrderDraft,
  existingOrders: Order[],
  status: OrderStatus = "pending",
): Order {
  const totals = calcOrderTotals(draft);
  const nextNum =
    Math.max(
      0,
      ...existingOrders.map((o) => parseInt(o.orderNumber.replace(/\D/g, ""), 10) || 0),
    ) + 1;
  const orderNumber = `ORD-${nextNum}`;
  const id = `ord_${nextNum}`;
  const now = new Date().toISOString();
  const billing = draft.sameAsShipping ? draft.shipping : draft.billing;
  const paidAmount = draft.paymentMethod === "COD" ? 0 : totals.grandTotal;
  const dueAmount = draft.paymentMethod === "COD" ? totals.grandTotal : 0;

  const items = draft.items.map((item, idx) => ({
    ...item,
    id: item.id || `li_new_${idx}`,
    lineTotal: item.quantity * item.unitPrice - item.discount + item.tax,
  }));

  return {
    id,
    orderNumber,
    orderDate: now,
    status,
    paymentStatus: draft.paymentMethod === "COD" ? "unpaid" : "paid",
    shipmentStatus: "unfulfilled",
    source: draft.source,
    branch: draft.branch,
    assignedStaff: draft.assignedStaff,
    priority: draft.priority,
    tags: draft.tags ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    customer: {
      id: draft.customerId ?? `guest_${Date.now()}`,
      name: draft.customerName,
      phone: draft.customerPhone,
      email: draft.customerEmail,
      group: draft.customerGroup,
      lifetimeValue: 0,
      orderCount: 0,
      riskScore: draft.paymentMethod === "COD" ? 45 : 15,
    },
    billing,
    shipping: draft.shipping,
    payment: {
      method: draft.paymentMethod,
      paidAmount,
      dueAmount,
      refundAmount: 0,
    },
    shipment: { shippingCost: draft.shippingAmount },
    items,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxAmount: totals.taxAmount,
    shippingAmount: totals.shippingAmount,
    grandTotal: totals.grandTotal,
    notes: draft.notes || undefined,
    timeline: [
      {
        id: `t_${Date.now()}`,
        type: "created",
        title: status === "draft" ? "Draft order created" : "Order created manually",
        description: `Source: ${draft.source}`,
        actor: "You",
        actorInitials: "YO",
        at: now,
      },
    ],
    activities: [],
    comments: [],
    attachments: [],
    paymentTimeline:
      draft.paymentMethod !== "COD"
        ? [{ id: `p_${Date.now()}`, label: "Payment recorded", amount: totals.grandTotal, status: "completed" as const, at: now }]
        : [],
    followers: [draft.assignedStaff],
    aiRisk: draft.paymentMethod === "COD" ? "medium" : "low",
    aiSummary: "New manual order — review customer and payment before fulfillment.",
    aiInsights: defaultAiInsights(draft.paymentMethod === "COD" ? "medium" : "low", draft.paymentMethod === "COD" ? 45 : 15),
  };
}

function addressesMatch(
  a: CreateOrderDraft["shipping"],
  b: CreateOrderDraft["billing"],
) {
  return a.address === b.address && a.city === b.city && a.region === b.region && a.country === b.country;
}

/** Convert an existing order into the shared create/edit draft shape. */
export function orderToDraft(order: Order): CreateOrderDraft {
  const lineDiscount = order.items.reduce((s, i) => s + (i.discount ?? 0), 0);
  const orderLevelDiscount = Math.max(0, order.discountAmount - lineDiscount);
  const taxable = Math.max(order.subtotal - order.discountAmount, 0);
  const taxRate = taxable > 0 ? Math.round((order.taxAmount / taxable) * 100) : 5;

  return {
    customerId: order.customer.id,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    customerGroup: order.customer.group ?? "retail",
    items: order.items.map((item) => ({ ...item })),
    shipping: { ...order.shipping },
    billing: { ...order.billing },
    sameAsShipping: addressesMatch(order.shipping, order.billing),
    paymentMethod: order.payment.method,
    branch: order.branch,
    source: order.source,
    assignedStaff: order.assignedStaff ?? "Sales Team",
    priority: order.priority,
    tags: order.tags.join(", "),
    notes: order.notes ?? "",
    shippingAmount: order.shippingAmount,
    discountAmount: orderLevelDiscount,
    taxRate,
  };
}

function paymentStatusFromAmounts(paid: number, grandTotal: number): Order["paymentStatus"] {
  if (paid >= grandTotal && grandTotal > 0) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

/** Apply draft changes onto an existing order (preserves id, history, etc.). */
export function applyDraftToOrder(draft: CreateOrderDraft, existing: Order): Order {
  const totals = calcOrderTotals(draft);
  const now = new Date().toISOString();
  const billing = draft.sameAsShipping ? draft.shipping : draft.billing;
  const paidAmount = existing.payment.paidAmount;
  const dueAmount = Math.max(0, totals.grandTotal - paidAmount);

  const items = draft.items.map((item, idx) => ({
    ...item,
    id: item.id || `li_new_${idx}`,
    lineTotal: item.quantity * item.unitPrice - item.discount + item.tax,
  }));

  const risk = draft.paymentMethod === "COD" ? "medium" : "low";
  const score = draft.paymentMethod === "COD" ? 45 : 15;

  return {
    ...existing,
    source: draft.source,
    branch: draft.branch,
    assignedStaff: draft.assignedStaff,
    priority: draft.priority,
    tags: draft.tags ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    customer: {
      ...existing.customer,
      id: draft.customerId ?? existing.customer.id,
      name: draft.customerName,
      phone: draft.customerPhone,
      email: draft.customerEmail,
      group: draft.customerGroup,
    },
    billing,
    shipping: draft.shipping,
    payment: {
      ...existing.payment,
      method: draft.paymentMethod,
      paidAmount,
      dueAmount,
    },
    paymentStatus: paymentStatusFromAmounts(paidAmount, totals.grandTotal),
    shipment: { ...existing.shipment, shippingCost: draft.shippingAmount },
    items,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxAmount: totals.taxAmount,
    shippingAmount: totals.shippingAmount,
    grandTotal: totals.grandTotal,
    notes: draft.notes || undefined,
    aiRisk: risk,
    aiInsights: defaultAiInsights(risk, score),
    timeline: [
      {
        id: `t_${Date.now()}`,
        type: "update",
        title: "Order updated",
        description: "Customer, items, or shipping details changed",
        actor: "You",
        actorInitials: "YO",
        at: now,
      },
      ...existing.timeline,
    ],
  };
}
