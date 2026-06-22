import type { OrderReturn, ReturnStatus } from "@/lib/mock-data/order-modules";

export type ApiOrderReturn = {
  id: string;
  company_id: string;
  return_number: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  sku: string;
  quantity: number;
  reason: string;
  status: string;
  amount: string;
  assigned_staff: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiOrderReturnListResponse = {
  data: ApiOrderReturn[];
  meta: { count: number; total_amount: string };
};

export type ApiOrderReturnResponse = {
  data: ApiOrderReturn;
};

export type ReturnListParams = {
  search?: string;
  status?: string;
};

export function apiOrderReturnToOrderReturn(row: ApiOrderReturn): OrderReturn {
  return {
    id: row.id,
    returnId: row.return_number,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    productName: row.product_name,
    sku: row.sku,
    quantity: row.quantity,
    reason: row.reason,
    status: row.status as ReturnStatus,
    amount: Number(row.amount),
    assignedStaff: row.assigned_staff ?? undefined,
    createdAt: row.created_at,
  };
}

export function buildReturnQuery(params?: ReturnListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateOrderReturnInput = {
  status?: ReturnStatus;
  assignedStaff?: string;
  notes?: string;
};

export function orderReturnUpdateToApiPayload(input: UpdateOrderReturnInput) {
  return {
    status: input.status,
    assigned_staff: input.assignedStaff,
    notes: input.notes,
  };
}
