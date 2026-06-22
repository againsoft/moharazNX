import type { OrderRefund, RefundStatus } from "@/lib/mock-data/order-modules";

export type ApiOrderRefund = {
  id: string;
  company_id: string;
  refund_number: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  amount: string;
  method: string;
  reason: string;
  status: string;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiOrderRefundListResponse = {
  data: ApiOrderRefund[];
  meta: { count: number; total_amount: string };
};

export type ApiOrderRefundResponse = {
  data: ApiOrderRefund;
};

export type RefundListParams = {
  search?: string;
  status?: string;
};

export function apiOrderRefundToOrderRefund(row: ApiOrderRefund): OrderRefund {
  return {
    id: row.id,
    refundId: row.refund_number,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    amount: Number(row.amount),
    method: row.method,
    reason: row.reason,
    status: row.status as RefundStatus,
    approvedBy: row.approved_by ?? undefined,
    createdAt: row.created_at,
  };
}

export function buildRefundQuery(params?: RefundListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateOrderRefundInput = {
  status?: RefundStatus;
  approvedBy?: string;
  notes?: string;
};

export function orderRefundUpdateToApiPayload(input: UpdateOrderRefundInput) {
  return {
    status: input.status,
    approved_by: input.approvedBy,
    notes: input.notes,
  };
}
