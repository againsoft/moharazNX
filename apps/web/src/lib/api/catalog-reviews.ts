import type { Review, ReviewStatus, ReviewType, SentimentType } from "@/lib/mock-data/reviews";

export type ApiProductReview = {
  id: string;
  company_id: string;
  review_number: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_brand: string | null;
  product_category: string | null;
  product_image_url: string | null;
  customer_id: string | null;
  customer_name: string;
  review_type: string;
  status: string;
  rating: number;
  title: string;
  body: string;
  sentiment: string;
  is_verified_purchase: boolean;
  helpful_votes: number;
  moderated_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiProductReviewListResponse = {
  data: ApiProductReview[];
  meta: { count: number; pending_count: number };
};

export type ApiProductReviewResponse = {
  data: ApiProductReview;
};

export type ReviewListParams = {
  search?: string;
  status?: string;
};

const EMPTY_AI_ANALYSIS: Review["aiAnalysis"] = {
  sentiment: "neutral",
  sentimentScore: 50,
  summary: "",
  prosSummary: [],
  consSummary: [],
  autoTags: [],
  complaints: [],
  mostLovedFeatures: [],
  trustScore: 0,
  qualityScore: 0,
  isDuplicate: false,
  isSpam: false,
  suggestedAdminReply: "",
  productInsights: [],
};

export function apiProductReviewToReview(row: ApiProductReview): Review {
  return {
    id: row.id,
    reviewId: row.review_number,
    type: row.review_type as ReviewType,
    status: row.status as ReviewStatus,
    rating: row.rating,
    title: row.title,
    body: row.body,
    pros: [],
    cons: [],
    categoryRatings: [],
    product: {
      id: row.product_id,
      name: row.product_name,
      sku: row.product_sku,
      brand: row.product_brand ?? "",
      category: row.product_category ?? "",
      imageUrl: row.product_image_url ?? "https://placehold.co/48x48",
      avgRating: row.rating,
      totalReviews: 0,
    },
    customer: {
      id: row.customer_id ?? "guest",
      name: row.customer_name,
      group: "retail",
      totalOrders: 0,
      ltv: 0,
      trustScore: 0,
      reviewCount: 0,
    },
    isVerifiedPurchase: row.is_verified_purchase,
    helpfulVotes: row.helpful_votes,
    notHelpfulVotes: 0,
    media: [],
    tags: [],
    aiAnalysis: {
      ...EMPTY_AI_ANALYSIS,
      sentiment: row.sentiment as SentimentType,
    },
    timeline: [],
    notes: [],
    moderatedBy: row.moderated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildReviewQuery(params?: ReviewListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateProductReviewInput = {
  status?: ReviewStatus;
  moderatedBy?: string;
  notes?: string;
};

export function productReviewUpdateToApiPayload(input: UpdateProductReviewInput) {
  return {
    status: input.status,
    moderated_by: input.moderatedBy,
    notes: input.notes,
  };
}
