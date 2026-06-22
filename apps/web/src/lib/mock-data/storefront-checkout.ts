export type ShippingMethod = {
  id: string;
  label: string;
  eta: string;
  price: number;
};

export type PaymentMethod = {
  id: string;
  label: string;
  description: string;
  icon?: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", label: "Standard delivery", eta: "2–4 business days", price: 80 },
  { id: "express", label: "Express delivery", eta: "Next business day (Dhaka)", price: 150 },
  { id: "free", label: "Free shipping", eta: "3–5 business days", price: 0 },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cod", label: "Cash on delivery", description: "Pay when your order arrives" },
  { id: "bkash", label: "bKash", description: "Mobile wallet — instant confirmation" },
  { id: "sslcommerz", label: "Card / SSLCommerz", description: "Visa, Mastercard, Amex" },
  { id: "nagad", label: "Nagad", description: "Mobile wallet payment" },
];

export const BD_DISTRICTS = [
  "Dhaka",
  "Chittagong",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

export const VALID_COUPONS: Record<string, number> = {
  SAVE10: 0.1,
  WELCOME: 200,
  FLASH20: 0.2,
};

export const FREE_SHIPPING_THRESHOLD = 2000;

export function calcOrderTotals(
  subtotal: number,
  shippingMethod: ShippingMethod,
  couponDiscount: number,
  couponCode: string | null,
) {
  let shipping = shippingMethod.price;
  if (shippingMethod.id === "free") {
    shipping = 0;
  } else if (shippingMethod.id !== "express" && subtotal >= FREE_SHIPPING_THRESHOLD) {
    shipping = 0;
  }
  const discount = couponDiscount;
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, shipping, discount, total, couponCode };
}

export function validateCoupon(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  const value = VALID_COUPONS[normalized];
  if (value == null) return { valid: false as const, discount: 0 };
  const discount = value < 1 ? Math.round(subtotal * value) : value;
  return { valid: true as const, discount, code: normalized };
}

export function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase().slice(-8)}`;
}
