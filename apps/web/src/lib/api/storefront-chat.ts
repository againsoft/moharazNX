import { apiFetch } from "@/lib/api/client";
import {
  getStorefrontCartToken,
  setStorefrontCartToken,
} from "@/lib/api/storefront-cart";
import type { ChatProduct } from "@/lib/storefront/ai/customer-support-types";

export type StorefrontChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type StorefrontChatLink = {
  label: string;
  href: string;
};

export type StorefrontChatReply = {
  content: string;
  mode: "live" | "fallback" | "action";
  provider: string | null;
  cartToken: string | null;
  orderNumber: string | null;
  links: StorefrontChatLink[];
  products: ChatProduct[];
};

export type StorefrontChatStatus = {
  live: boolean;
  provider: string | null;
  model: string | null;
  canOrder: boolean;
};

type ApiChatProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price_bdt: number;
  stock: number;
  in_stock: boolean;
};

type ApiChatData = {
  content: string;
  mode: "live" | "fallback" | "action";
  provider: string | null;
  cart_token: string | null;
  order_number: string | null;
  links?: StorefrontChatLink[];
  products?: ApiChatProduct[];
};

function mapProducts(rows?: ApiChatProduct[]): ChatProduct[] {
  if (!rows?.length) return [];
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    priceBdt: p.price_bdt,
    stock: p.stock,
    inStock: p.in_stock,
  }));
}

function mapReply(data: ApiChatData): StorefrontChatReply {
  if (data.cart_token) setStorefrontCartToken(data.cart_token);
  return {
    content: data.content,
    mode: data.mode,
    provider: data.provider,
    cartToken: data.cart_token,
    orderNumber: data.order_number,
    links: data.links ?? [],
    products: mapProducts(data.products),
  };
}

export async function fetchStorefrontChatStatus(): Promise<StorefrontChatStatus> {
  const res = await apiFetch<{ data: { live: boolean; provider: string | null; model: string | null; can_order: boolean } }>(
    "/api/v1/storefront/chat/status",
  );
  return {
    live: res.data.live,
    provider: res.data.provider,
    model: res.data.model,
    canOrder: res.data.can_order,
  };
}

export async function sendStorefrontChatMessage(
  message: string,
  history: StorefrontChatHistoryItem[],
  cartToken?: string | null,
): Promise<StorefrontChatReply> {
  const res = await apiFetch<{ data: ApiChatData }>("/api/v1/storefront/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      history,
      cart_token: cartToken ?? getStorefrontCartToken(),
    }),
  });
  return mapReply(res.data);
}

export async function sendStorefrontChatAction(input: {
  action: "search" | "add_to_cart" | "view_cart";
  productId?: string;
  query?: string;
  quantity?: number;
  message?: string;
}): Promise<StorefrontChatReply> {
  const res = await apiFetch<{ data: ApiChatData }>("/api/v1/storefront/chat", {
    method: "POST",
    body: JSON.stringify({
      message: input.message ?? "",
      action: input.action,
      product_id: input.productId,
      query: input.query,
      quantity: input.quantity ?? 1,
      cart_token: getStorefrontCartToken(),
    }),
  });
  return mapReply(res.data);
}
