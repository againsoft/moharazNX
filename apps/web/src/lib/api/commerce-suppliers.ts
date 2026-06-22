import type {
  Supplier,
  SupplierDetail,
  SupplierStatus,
  VendorPerformance,
} from "@/lib/mock-data/suppliers";

export type ApiSupplier = {
  id: string;
  company_id: string;
  vendor_code: string;
  name: string;
  email: string;
  phone: string;
  payment_terms: string;
  lead_time_days: number;
  rating: string;
  open_pos: number;
  spend_ytd: string;
  status: string;
  country: string;
  tax_id: string | null;
  website: string | null;
  currency: string | null;
  min_order_value: string | null;
  incoterms: string | null;
  buyer_name: string | null;
  contacts: Record<string, unknown>[];
  addresses: Record<string, unknown>[];
  contracts: Record<string, unknown>[];
  bills: Record<string, unknown>[];
  performance: Record<string, unknown>;
  timeline: Record<string, unknown>[];
  rfq_count: number;
  receipt_count: number;
  has_stock_feed: boolean;
  total_pos: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiSupplierListResponse = {
  data: ApiSupplier[];
  meta: { count: number; total_spend_ytd: string };
};

export type ApiSupplierResponse = {
  data: ApiSupplier;
};

export type SupplierListParams = {
  search?: string;
  status?: string;
};

const DEFAULT_PERFORMANCE: VendorPerformance = {
  onTimeDeliveryPct: 0,
  qualityRejectRatePct: 0,
  priceVariancePct: 0,
  avgLeadTimeDays: 0,
};

function formatUpdatedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function apiSupplierToSupplier(row: ApiSupplier): Supplier {
  return {
    id: row.id,
    vendorCode: row.vendor_code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    paymentTerms: row.payment_terms,
    leadTimeDays: row.lead_time_days,
    rating: Number(row.rating),
    openPos: row.open_pos,
    spendYtd: Number(row.spend_ytd),
    status: row.status as SupplierStatus,
    country: row.country,
    updatedAt: formatUpdatedAt(row.updated_at),
    taxId: row.tax_id ?? undefined,
    website: row.website ?? undefined,
    currency: row.currency ?? undefined,
    minOrderValue: row.min_order_value != null ? Number(row.min_order_value) : undefined,
    incoterms: row.incoterms ?? undefined,
    buyerName: row.buyer_name ?? undefined,
  };
}

export function apiSupplierToSupplierDetail(row: ApiSupplier): SupplierDetail {
  const base = apiSupplierToSupplier(row);
  const perf = row.performance as Partial<VendorPerformance>;

  return {
    ...base,
    contacts: (row.contacts as SupplierDetail["contacts"]) ?? [],
    addresses: (row.addresses as SupplierDetail["addresses"]) ?? [],
    contracts: (row.contracts as SupplierDetail["contracts"]) ?? [],
    bills: (row.bills as SupplierDetail["bills"]) ?? [],
    performance: {
      onTimeDeliveryPct: Number(perf.onTimeDeliveryPct ?? DEFAULT_PERFORMANCE.onTimeDeliveryPct),
      qualityRejectRatePct: Number(
        perf.qualityRejectRatePct ?? DEFAULT_PERFORMANCE.qualityRejectRatePct,
      ),
      priceVariancePct: Number(perf.priceVariancePct ?? DEFAULT_PERFORMANCE.priceVariancePct),
      avgLeadTimeDays: Number(perf.avgLeadTimeDays ?? DEFAULT_PERFORMANCE.avgLeadTimeDays),
    },
    timeline: (row.timeline as SupplierDetail["timeline"]) ?? [],
    totalPos: row.total_pos,
    rfqCount: row.rfq_count,
    receiptCount: row.receipt_count,
    hasStockFeed: row.has_stock_feed,
  };
}

export function buildSupplierQuery(params?: SupplierListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateSupplierInput = {
  status?: SupplierStatus;
  paymentTerms?: string;
  leadTimeDays?: number;
  buyerName?: string;
  notes?: string;
};

export function supplierUpdateToApiPayload(input: UpdateSupplierInput) {
  return {
    status: input.status,
    payment_terms: input.paymentTerms,
    lead_time_days: input.leadTimeDays,
    buyer_name: input.buyerName,
    notes: input.notes,
  };
}
