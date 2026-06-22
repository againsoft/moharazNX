import { getApiBaseUrl, ApiError } from "@/lib/api/client";
import { getStorefrontCartToken } from "@/lib/api/storefront-cart";

export type ApiStorefrontCheckoutPayload = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  district?: string;
  postal_code?: string;
  notes?: string;
  payment_method?: string;
  shipping_method?: string;
};

export type ApiStorefrontCheckoutResult = {
  id: string;
  order_number: string;
  email: string;
  grand_total: string;
  payment_method: string;
};

export type ApiStorefrontCheckoutResponse = {
  data: ApiStorefrontCheckoutResult;
};

export async function submitStorefrontCheckout(
  payload: ApiStorefrontCheckoutPayload,
): Promise<ApiStorefrontCheckoutResult> {
  const token = getStorefrontCartToken();
  const res = await fetch(`${getApiBaseUrl()}/api/v1/storefront/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Cart-Token": token } : {}),
    },
    body: JSON.stringify(payload),
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

  const data = (await res.json()) as ApiStorefrontCheckoutResponse;
  return data.data;
}
