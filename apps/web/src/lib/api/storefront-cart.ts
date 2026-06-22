import { getApiBaseUrl, ApiError } from "@/lib/api/client";

export const STOREFRONT_CART_TOKEN_KEY = "storefront-cart-token";

export type ApiStorefrontCartItem = {
  id: string;
  product_id: string;
  slug: string;
  name: string;
  thumbnail: string | null;
  unit_price: string;
  compare_at_price: string | null;
  quantity: number;
};

export type ApiStorefrontCart = {
  cart_token: string;
  items: ApiStorefrontCartItem[];
  item_count: number;
  subtotal: string;
};

export type ApiStorefrontCartResponse = {
  data: ApiStorefrontCart;
};

export function getStorefrontCartToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STOREFRONT_CART_TOKEN_KEY);
}

export function setStorefrontCartToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STOREFRONT_CART_TOKEN_KEY, token);
}

async function storefrontCartFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStorefrontCartToken();
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Cart-Token": token } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }

  const data = (await res.json()) as T & { data?: { cart_token?: string } };
  const cartToken = (data as ApiStorefrontCartResponse).data?.cart_token;
  if (cartToken) setStorefrontCartToken(cartToken);
  return data;
}

export async function fetchStorefrontCart(): Promise<ApiStorefrontCart> {
  const res = await storefrontCartFetch<ApiStorefrontCartResponse>("/api/v1/storefront/cart");
  return res.data;
}

export async function addStorefrontCartItem(productId: string, quantity = 1): Promise<ApiStorefrontCart> {
  const res = await storefrontCartFetch<ApiStorefrontCartResponse>("/api/v1/storefront/cart/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return res.data;
}

export async function updateStorefrontCartItem(itemId: string, quantity: number): Promise<ApiStorefrontCart> {
  const res = await storefrontCartFetch<ApiStorefrontCartResponse>(
    `/api/v1/storefront/cart/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );
  return res.data;
}

export async function removeStorefrontCartItem(itemId: string): Promise<ApiStorefrontCart> {
  const res = await storefrontCartFetch<ApiStorefrontCartResponse>(
    `/api/v1/storefront/cart/items/${itemId}`,
    { method: "DELETE" },
  );
  return res.data;
}

export function apiCartToLineItems(cart: ApiStorefrontCart) {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    slug: item.slug,
    name: item.name,
    image: item.thumbnail ?? `https://picsum.photos/seed/${item.product_id}/600/600`,
    price: parseFloat(item.unit_price) || 0,
    compareAtPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : undefined,
    qty: item.quantity,
  }));
}
