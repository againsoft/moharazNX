import type {
  Order,
  OrderAiInsights,
  OrderLine,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from "@/lib/mock-data/orders";
import { defaultAiInsights } from "@/lib/mock-data/orders";

export type ApiOrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  sku: string;
  name: string;
  image_url: string | null;
  variant_label: string | null;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
  sort_order: number;
};

export type ApiOrder = {
  id: string;
  company_id: string;
  order_number: string;
  order_date: string;
  status: string;
  payment_status: string;
  shipment_status: string;
  source: string;
  branch: string;
  assigned_staff: string | null;
  priority: string;
  tags: string[];
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_group: string | null;
  customer_lifetime_value: string;
  customer_order_count: number;
  customer_risk_score: number;
  billing_address: string | null;
  billing_city: string | null;
  billing_region: string | null;
  billing_country: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  shipping_country: string | null;
  payment_method: string;
  payment_transaction_id: string | null;
  paid_amount: string;
  due_amount: string;
  refund_amount: string;
  courier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_cost: string;
  shipped_at: string | null;
  delivered_at: string | null;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  grand_total: string;
  notes: string | null;
  ai_risk: string;
  ai_summary: string | null;
  timeline: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  comments: Record<string, unknown>[];
  attachments: Record<string, unknown>[];
  payment_timeline: Record<string, unknown>[];
  ai_insights: Record<string, unknown>;
  followers: string[];
  items: ApiOrderItem[];
  item_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiOrderListResponse = {
  data: ApiOrder[];
  meta: { count: number; total_revenue: string };
};

export type ApiOrderResponse = {
  data: ApiOrder;
};

export type OrderListParams = {
  search?: string;
  status?: string;
  payment_status?: string;
  branch?: string;
};

function apiItemToLine(item: ApiOrderItem): OrderLine {
  return {
    id: item.id,
    productId: item.product_id,
    name: item.name,
    sku: item.sku,
    imageUrl: item.image_url ?? undefined,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    discount: Number(item.discount_amount),
    tax: Number(item.tax_amount),
    lineTotal: Number(item.line_total),
    variant: item.variant_label ?? undefined,
  };
}

function apiAiInsights(row: ApiOrder): OrderAiInsights {
  const raw = row.ai_insights as Partial<OrderAiInsights>;
  const risk = (row.ai_risk as OrderAiInsights["riskLevel"]) || "low";
  const score = row.customer_risk_score;
  const fallback = defaultAiInsights(risk, score);
  return {
    orderSummary: (raw.orderSummary as string) ?? row.ai_summary ?? fallback.orderSummary,
    customerSummary: (raw.customerSummary as string) ?? fallback.customerSummary,
    riskLevel: (raw.riskLevel as OrderAiInsights["riskLevel"]) ?? risk,
    riskScore: (raw.riskScore as number) ?? score,
    riskReasons: (raw.riskReasons as string[]) ?? fallback.riskReasons,
    deliveryPrediction:
      (raw.deliveryPrediction as OrderAiInsights["deliveryPrediction"]) ?? fallback.deliveryPrediction,
    upsellSuggestions:
      (raw.upsellSuggestions as OrderAiInsights["upsellSuggestions"]) ?? fallback.upsellSuggestions,
    retentionProbability: (raw.retentionProbability as number) ?? fallback.retentionProbability,
  };
}

export function apiOrderToOrder(row: ApiOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    orderDate: row.order_date,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    shipmentStatus: row.shipment_status as ShipmentStatus,
    source: row.source,
    branch: row.branch,
    assignedStaff: row.assigned_staff ?? undefined,
    priority: (row.priority as Order["priority"]) ?? "normal",
    tags: row.tags ?? [],
    customer: {
      id: row.customer_id ?? "guest",
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      group: row.customer_group ?? undefined,
      lifetimeValue: Number(row.customer_lifetime_value),
      orderCount: row.customer_order_count,
      riskScore: row.customer_risk_score,
    },
    billing: {
      address: row.billing_address ?? "",
      city: row.billing_city ?? "",
      region: row.billing_region ?? "",
      country: row.billing_country ?? "",
    },
    shipping: {
      address: row.shipping_address ?? "",
      city: row.shipping_city ?? "",
      region: row.shipping_region ?? "",
      country: row.shipping_country ?? "",
    },
    payment: {
      method: row.payment_method,
      transactionId: row.payment_transaction_id ?? undefined,
      paidAmount: Number(row.paid_amount),
      dueAmount: Number(row.due_amount),
      refundAmount: Number(row.refund_amount),
    },
    shipment: {
      courier: row.courier ?? undefined,
      trackingNumber: row.tracking_number ?? undefined,
      trackingUrl: row.tracking_url ?? undefined,
      shippingCost: Number(row.shipping_cost),
      shippedAt: row.shipped_at ?? undefined,
      deliveredAt: row.delivered_at ?? undefined,
    },
    items: row.items.map(apiItemToLine),
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    taxAmount: Number(row.tax_amount),
    shippingAmount: Number(row.shipping_amount),
    grandTotal: Number(row.grand_total),
    notes: row.notes ?? undefined,
    timeline: row.timeline as Order["timeline"],
    activities: row.activities as Order["activities"],
    comments: row.comments as Order["comments"],
    attachments: row.attachments as Order["attachments"],
    paymentTimeline: row.payment_timeline as Order["paymentTimeline"],
    followers: row.followers ?? [],
    aiRisk: (row.ai_risk as Order["aiRisk"]) ?? "low",
    aiSummary: row.ai_summary ?? undefined,
    aiInsights: apiAiInsights(row),
  };
}

export function buildOrderQuery(params?: OrderListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.payment_status) q.set("payment_status", params.payment_status);
  if (params.branch) q.set("branch", params.branch);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateOrderInput = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  assignedStaff?: string;
  priority?: Order["priority"];
  notes?: string;
};

export function orderUpdateToApiPayload(input: UpdateOrderInput) {
  return {
    status: input.status,
    payment_status: input.paymentStatus,
    shipment_status: input.shipmentStatus,
    assigned_staff: input.assignedStaff,
    priority: input.priority,
    notes: input.notes,
  };
}
