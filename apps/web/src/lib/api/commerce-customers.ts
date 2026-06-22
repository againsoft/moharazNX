import type {
  Customer,
  CustomerAiInsights,
  CustomerGroup,
  CustomerStatus,
  LoyaltyTier,
  RiskLevel,
} from "@/lib/mock-data/customers";

export type ApiCustomer = {
  id: string;
  company_id: string;
  customer_code: string;
  name: string;
  phone: string;
  email: string;
  profile_image: string | null;
  group: string;
  status: string;
  loyalty_tier: string;
  city: string;
  region: string;
  country: string;
  customer_since: string;
  last_order_date: string | null;
  assigned_staff: string | null;
  tags: string[];
  total_orders: number;
  total_spend: string;
  avg_order_value: string;
  return_rate: string;
  reward_points: number;
  wallet_balance: string;
  risk_score: number;
  risk_level: string;
  notes: string | null;
  addresses: Record<string, unknown>[];
  recent_orders: Record<string, unknown>[];
  wallet_transactions: Record<string, unknown>[];
  reward_events: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  comments: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  attachments: Record<string, unknown>[];
  ai_insights: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ApiCustomerListResponse = {
  data: ApiCustomer[];
  meta: { count: number; total_spend: string };
};

export type ApiCustomerResponse = {
  data: ApiCustomer;
};

export type CustomerListParams = {
  search?: string;
  status?: string;
  group?: string;
  city?: string;
};

function defaultAiInsights(risk: RiskLevel, score: number): CustomerAiInsights {
  return {
    summary: "Customer profile loaded from database.",
    purchaseSummary: "",
    churnRisk: risk,
    churnScore: score,
    churnReasons: [],
    retentionProbability: risk === "low" ? 80 : risk === "medium" ? 55 : 30,
    predictedLtv: 0,
    favoriteCategories: [],
    favoriteBrands: [],
    recommendedProducts: [],
    marketingSuggestions: [],
  };
}

export function apiCustomerToCustomer(row: ApiCustomer): Customer {
  const raw = row.ai_insights as Partial<CustomerAiInsights>;
  const risk = (row.risk_level as RiskLevel) || "low";
  const fallback = defaultAiInsights(risk, row.risk_score);

  return {
    id: row.id,
    customerId: row.customer_code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    profileImage: row.profile_image ?? undefined,
    group: row.group as CustomerGroup,
    status: row.status as CustomerStatus,
    loyaltyTier: row.loyalty_tier as LoyaltyTier,
    city: row.city,
    region: row.region,
    country: row.country,
    customerSince: row.customer_since,
    lastOrderDate: row.last_order_date ?? undefined,
    assignedStaff: row.assigned_staff ?? undefined,
    tags: row.tags ?? [],
    totalOrders: row.total_orders,
    totalSpend: Number(row.total_spend),
    avgOrderValue: Number(row.avg_order_value),
    returnRate: Number(row.return_rate),
    rewardPoints: row.reward_points,
    walletBalance: Number(row.wallet_balance),
    riskScore: row.risk_score,
    riskLevel: risk,
    addresses: (row.addresses as Customer["addresses"]) ?? [],
    recentOrders: (row.recent_orders as Customer["recentOrders"]) ?? [],
    walletTransactions: (row.wallet_transactions as Customer["walletTransactions"]) ?? [],
    rewardEvents: (row.reward_events as Customer["rewardEvents"]) ?? [],
    timeline: (row.timeline as Customer["timeline"]) ?? [],
    comments: (row.comments as Customer["comments"]) ?? [],
    activities: (row.activities as Customer["activities"]) ?? [],
    attachments: (row.attachments as Customer["attachments"]) ?? [],
    aiInsights: {
      summary: (raw.summary as string) ?? fallback.summary,
      purchaseSummary: (raw.purchaseSummary as string) ?? fallback.purchaseSummary,
      churnRisk: (raw.churnRisk as RiskLevel) ?? risk,
      churnScore: (raw.churnScore as number) ?? row.risk_score,
      churnReasons: (raw.churnReasons as string[]) ?? fallback.churnReasons,
      retentionProbability: (raw.retentionProbability as number) ?? fallback.retentionProbability,
      predictedLtv: (raw.predictedLtv as number) ?? fallback.predictedLtv,
      favoriteCategories: (raw.favoriteCategories as string[]) ?? fallback.favoriteCategories,
      favoriteBrands: (raw.favoriteBrands as string[]) ?? fallback.favoriteBrands,
      recommendedProducts:
        (raw.recommendedProducts as CustomerAiInsights["recommendedProducts"]) ??
        fallback.recommendedProducts,
      marketingSuggestions: (raw.marketingSuggestions as string[]) ?? fallback.marketingSuggestions,
    },
    notes: row.notes ?? undefined,
  };
}

export function buildCustomerQuery(params?: CustomerListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.group) q.set("group", params.group);
  if (params.city) q.set("city", params.city);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateCustomerInput = {
  status?: CustomerStatus;
  group?: CustomerGroup;
  loyaltyTier?: LoyaltyTier;
  assignedStaff?: string;
  notes?: string;
  tags?: string[];
};

export function customerUpdateToApiPayload(input: UpdateCustomerInput) {
  return {
    status: input.status,
    group: input.group,
    loyalty_tier: input.loyaltyTier,
    assigned_staff: input.assignedStaff,
    notes: input.notes,
    tags: input.tags,
  };
}
