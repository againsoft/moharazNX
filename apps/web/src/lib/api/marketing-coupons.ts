import type { CouponStatus, MarketingCoupon } from "@/lib/mock-data/marketing";

export type ApiCoupon = {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: string;
  discount_label: string;
  status: string;
  redemptions: number;
  redemption_limit: number | null;
  starts_at: string;
  ends_at: string;
  min_order_amount: string | null;
};

export type ApiCouponListResponse = {
  data: ApiCoupon[];
  meta: { count: number; active_count: number };
};

export function apiCouponToMarketingCoupon(row: ApiCoupon): MarketingCoupon {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    discount: row.discount_label,
    status: row.status as CouponStatus,
    redemptions: row.redemptions,
    limit: row.redemption_limit ?? undefined,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  };
}

export function buildCouponQuery(params?: { search?: string; status?: string }): string {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}
