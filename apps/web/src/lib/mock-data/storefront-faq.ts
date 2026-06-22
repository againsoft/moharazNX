import { SHIPPING_FAQ } from "./storefront-shipping";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

export type FaqItem = { q: string; a: string };
export type FaqCategory = "all" | "orders" | "shipping" | "returns" | "payments" | "products";

export const FAQ_CATEGORIES: { value: FaqCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "shipping", label: "Shipping" },
  { value: "returns", label: "Returns" },
  { value: "payments", label: "Payments" },
  { value: "products", label: "Products" },
];

export const FAQ_SECTIONS: { category: Exclude<FaqCategory, "all">; title: string; items: FaqItem[] }[] = [
  {
    category: "orders",
    title: "Orders & tracking",
    items: [
      {
        q: "How do I track my order?",
        a: "Use Track order with your order number and email. You'll also receive SMS and email updates when your package ships.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 2 hours of placement if not yet packed. Contact support or use the link in your confirmation email.",
      },
      {
        q: "Will I receive an order confirmation?",
        a: "Yes — a confirmation email is sent immediately after checkout. Check spam if you don't see it within 5 minutes.",
      },
      {
        q: "Can I modify items in my order?",
        a: "Item changes aren't supported after checkout. Cancel (if eligible) and place a new order, or start a return after delivery.",
      },
    ],
  },
  {
    category: "shipping",
    title: "Shipping & delivery",
    items: SHIPPING_FAQ,
  },
  {
    category: "returns",
    title: "Returns & refunds",
    items: [
      {
        q: "What is your return window?",
        a: "30 days from delivery for most items. Items must be unused with original packaging and tags.",
      },
      {
        q: "How long until I receive my refund?",
        a: "5–7 business days after we receive and inspect your return. Refunds go to the original payment method.",
      },
      {
        q: "Which items cannot be returned?",
        a: "Opened personal care products, digital goods, gift cards, custom orders, and final-sale clearance items.",
      },
      {
        q: "Can I return a sale item?",
        a: "Yes, unless marked 'Final sale' at checkout. Sale items follow the same 30-day return policy.",
      },
    ],
  },
  {
    category: "payments",
    title: "Payments & pricing",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "Cash on delivery (COD), bKash, Nagad, and cards via SSLCommerz (Visa, Mastercard, Amex).",
      },
      {
        q: "Is COD available everywhere?",
        a: "COD is available in most districts. Very remote areas may require prepayment — you'll see options at checkout.",
      },
      {
        q: "Are prices inclusive of VAT?",
        a: "Displayed prices include applicable VAT where required. No hidden fees at checkout except shipping (if applicable).",
      },
      {
        q: "How do coupon codes work?",
        a: "Enter your code in the cart before checkout. One coupon per order unless stated otherwise. Codes cannot be combined.",
      },
    ],
  },
  {
    category: "products",
    title: "Products & stock",
    items: [
      {
        q: "How do I know if an item is in stock?",
        a: "Product pages show real-time stock status. 'Only X left' appears when inventory is low.",
      },
      {
        q: "Do product images match the actual item?",
        a: "We photograph real products. Minor color variation may occur due to screen settings.",
      },
      {
        q: "Can I get notified when an item is back in stock?",
        a: "Click 'Notify me when back in stock' on out-of-stock product pages. We'll email you when it's available.",
      },
      {
        q: "Do you sell authentic / branded products?",
        a: "Yes — all items are sourced from authorized distributors. Electronics include official warranty where applicable.",
      },
    ],
  },
];

export function getAllFaqItems(): (FaqItem & { category: Exclude<FaqCategory, "all"> })[] {
  return FAQ_SECTIONS.flatMap((s) => s.items.map((item) => ({ ...item, category: s.category })));
}

export function filterFaq(category: FaqCategory, query?: string) {
  let sections = FAQ_SECTIONS;
  if (category !== "all") {
    sections = sections.filter((s) => s.category === category);
  }
  if (query?.trim()) {
    const term = query.trim().toLowerCase();
    sections = sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) => i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }
  return sections;
}

export const FAQ_QUICK_LINKS = [
  { label: "Shipping & returns", href: storefrontPaths.shipping },
  { label: "Track order", href: storefrontPaths.track },
  { label: "Contact support", href: storefrontPaths.contact },
];
