import { getAllFaqItems } from "@/lib/mock-data/storefront-faq";
import { storeContact } from "@/lib/mock-data/storefront-contact";
import { FREE_SHIPPING_THRESHOLD, RETURN_POLICY } from "@/lib/mock-data/storefront-shipping";
import { moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";
import { storefrontPaths, accountPaths } from "@/lib/url-slug/storefront-paths";
import type { QuickPrompt } from "./customer-support-types";

export type KnowledgeEntry = {
  id: string;
  keywords: string[];
  answer: string;
  links?: { label: string; href: string }[];
};

export const QUICK_PROMPTS: QuickPrompt[] = [
  { id: "order", label: "🛒 Laptop stock", message: "laptop stock dekhao order korte chai" },
  { id: "bn_order", label: "🛒 Mouse অর্ডার", message: "mouse order korte chai" },
  { id: "track", label: "Track my order", message: "How do I track my order?" },
  { id: "shipping", label: "Shipping & delivery", message: "What are your shipping options and delivery time?" },
  { id: "return", label: "Return policy", message: "What is your return and refund policy?" },
  { id: "payment", label: "Payment methods", message: "What payment methods do you accept?" },
  { id: "bn_track", label: "অর্ডার কোথায়?", message: "আমার অর্ডার ট্র্যাক করতে কী করতে হবে?" },
];

const GREETING: KnowledgeEntry = {
  id: "greeting",
  keywords: [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good evening",
    "salam",
    "assalam",
    "namaskar",
    "namaste",
    "help",
    "হ্যালো",
    "হাই",
    "সালাম",
    "নমস্কার",
    "সাহায্য",
    "help me",
  ],
  answer: `Hi! I'm ${moharazStoreConfig.name} Support Assistant. I can help with orders, shipping, returns, payments — and I can place orders for you right here in chat. What would you like to buy?`,
};

const THANKS: KnowledgeEntry = {
  id: "thanks",
  keywords: ["thank", "thanks", "thx", "appreciate", "ধন্যবাদ", "শুকরিয়া", "thnx"],
  answer: "You're welcome! If you have any other questions, I'm here to help. Have a great day shopping with us!",
};

const CONTACT: KnowledgeEntry = {
  id: "contact",
  keywords: [
    "contact",
    "phone",
    "call",
    "email",
    "whatsapp",
    "support",
    "human",
    "agent",
    "talk to",
    "reach",
    "যোগাযোগ",
    "ফোন",
    "কল",
    "ইমেইল",
    "হোয়াটসঅ্যাপ",
  ],
  answer: `Here's how to reach us:\n\n• Phone: ${storeContact.phone}\n• Email: ${storeContact.email}\n• WhatsApp: ${storeContact.whatsapp}\n• Address: ${storeContact.address}\n\nHours: ${storeContact.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}`,
  links: [
    { label: "Contact form", href: storefrontPaths.contact },
    { label: "Account support", href: accountPaths.support },
  ],
};

const HOURS: KnowledgeEntry = {
  id: "hours",
  keywords: ["hour", "open", "close", "timing", "when open", "business hour", "সময়", "খোলা", "বন্ধ"],
  answer: `Our support hours:\n${storeContact.hours.map((h) => `• ${h.days}: ${h.time}`).join("\n")}\n\nChat replies are instant 24/7. For urgent issues outside hours, email ${storeContact.email} and we'll respond next business day.`,
};

const ACCOUNT: KnowledgeEntry = {
  id: "account",
  keywords: ["account", "login", "sign in", "register", "password", "profile", "অ্যাকাউন্ট", "লগইন", "রেজিস্টার"],
  answer: "Sign in to view orders, track shipments, manage addresses, and open support tickets. Guest checkout works too — use your order number and email on the Track order page.",
  links: [
    { label: "My account", href: storefrontPaths.account },
    { label: "Track order", href: storefrontPaths.track },
  ],
};

const CART: KnowledgeEntry = {
  id: "cart",
  keywords: ["cart", "checkout", "buy", "purchase", "order now", "কার্ট", "চেকআউট", "কিনতে", "অর্ডার"],
  answer: "Tell me what product you want — I'll search, add to cart, and place the order after you share name, phone, address, and payment method (COD, bKash, or card).",
  links: [
    { label: "View cart", href: storefrontPaths.cart },
    { label: "Browse products", href: storefrontPaths.products },
  ],
};

const WHOLESALE: KnowledgeEntry = {
  id: "wholesale",
  keywords: ["wholesale", "bulk", "b2b", "business", "corporate", "dealer", "পাইকারি", "বাল্ক"],
  answer: "For wholesale and B2B orders, email us with product list and quantities. Our team will share volume pricing and delivery terms within 1–2 business days.",
  links: [{ label: "Contact B2B", href: storefrontPaths.contact }],
};

const WARRANTY: KnowledgeEntry = {
  id: "warranty",
  keywords: ["warranty", "guarantee", "warrantee", "ওয়ারেন্টি", "গ্যারান্টি"],
  answer: "Electronics include official brand warranty where applicable. Warranty terms are listed on each product page. Keep your invoice for claims.",
  links: [{ label: "Warranty policy", href: storefrontPaths.warranty }],
};

const FREE_SHIPPING: KnowledgeEntry = {
  id: "free_shipping",
  keywords: ["free shipping", "free delivery", "shipping cost", "delivery charge", "shipping fee", "ফ্রি ডেলিভারি", "ডেলিভারি চার্জ"],
  answer: `Free standard shipping on orders over ৳${FREE_SHIPPING_THRESHOLD.toLocaleString()} nationwide. Express delivery is available at checkout for an extra fee. Delivery times vary by zone — Dhaka 1–2 days, outside Dhaka 3–5 days.`,
  links: [{ label: "Shipping details", href: storefrontPaths.shipping }],
};

const RETURN_SUMMARY: KnowledgeEntry = {
  id: "return_summary",
  keywords: ["return window", "return policy", "refund time", "return item", "রিটার্ন", "রিফান্ড", "ফেরত"],
  answer: `${RETURN_POLICY.windowDays}-day return window from delivery. Items must be ${RETURN_POLICY.condition.toLowerCase()}. Refunds processed in ${RETURN_POLICY.refundTime} after inspection.`,
  links: [
    { label: "Return policy", href: storefrontPaths.returns },
    { label: "Start return", href: accountPaths.returns },
  ],
};

function faqToKnowledge(): KnowledgeEntry[] {
  return getAllFaqItems().map((item, i) => ({
    id: `faq_${i}`,
    keywords: [
      ...item.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3),
      item.category,
    ],
    answer: item.a,
    links: categoryLinks(item.category),
  }));
}

function categoryLinks(category: string): { label: string; href: string }[] | undefined {
  switch (category) {
    case "orders":
      return [
        { label: "Track order", href: storefrontPaths.track },
        { label: "My orders", href: accountPaths.orders },
      ];
    case "shipping":
      return [{ label: "Shipping & returns", href: storefrontPaths.shipping }];
    case "returns":
      return [{ label: "Return policy", href: storefrontPaths.returns }];
    case "payments":
      return [{ label: "FAQ", href: storefrontPaths.faq }];
    case "products":
      return [{ label: "Browse products", href: storefrontPaths.products }];
    default:
      return undefined;
  }
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  GREETING,
  THANKS,
  CONTACT,
  HOURS,
  ACCOUNT,
  CART,
  WHOLESALE,
  WARRANTY,
  FREE_SHIPPING,
  RETURN_SUMMARY,
  ...faqToKnowledge(),
];

export const WELCOME_MESSAGE = `Welcome to ${moharazStoreConfig.name}! 👋\n\nI'm your AI shopping assistant. Ask me anything — or tell me what you want to buy and I'll place the order for you here in chat.`;

export const FALLBACK_REPLY = `I'm not sure I understood that. Try asking about:\n\n• Order tracking\n• Shipping & delivery\n• Returns & refunds\n• Payment methods (COD, bKash, cards)\n• Product stock & warranty\n\nOr tap a quick question below, or contact us at ${storeContact.phone}.`;
