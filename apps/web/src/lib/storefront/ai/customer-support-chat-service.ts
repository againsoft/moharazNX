import {
  FALLBACK_REPLY,
  KNOWLEDGE_BASE,
  type KnowledgeEntry,
} from "./customer-support-knowledge";
import type { ChatReply } from "./customer-support-types";
import {
  fetchStorefrontChatStatus,
  sendStorefrontChatAction,
  sendStorefrontChatMessage,
  type StorefrontChatHistoryItem,
  type StorefrontChatStatus,
} from "@/lib/api/storefront-chat";
import { getStorefrontCartToken } from "@/lib/api/storefront-cart";

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function scoreEntry(message: string, entry: KnowledgeEntry): number {
  const normalized = normalize(message);
  let score = 0;
  for (const keyword of entry.keywords) {
    const kw = keyword.toLowerCase();
    if (kw.length < 3) continue;
    if (normalized.includes(kw)) score += kw.includes(" ") ? 4 : 2;
  }
  return score;
}

function findBestMatch(message: string): KnowledgeEntry | null {
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    const score = scoreEntry(message, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore >= 2 ? best : null;
}

const ORDER_WORDS = ["order", "buy", "purchase", "cart", "stock", "অর্ডার", "কিন", "স্টক", "পণ্য"];

function isOrderIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return ORDER_WORDS.some((w) => lower.includes(w));
}

function extractQuery(message: string): string {
  return message
    .replace(/[^\w\s\u0980-\u09FF-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !ORDER_WORDS.includes(w.toLowerCase()))
    .slice(0, 3)
    .join(" ");
}

async function orderFallback(message: string): Promise<ChatReply> {
  const query = extractQuery(message) || message;
  try {
    const res = await sendStorefrontChatAction({ action: "search", query, message });
    return {
      content: res.content,
      mode: res.mode,
      products: res.products,
      links: res.links,
    };
  } catch {
    return {
      content: "API সংযোগ নেই। API server চালু আছে কিনা দেখুন (port 8000)।",
      mode: "fallback",
    };
  }
}

function localReply(message: string): ChatReply {
  const match = findBestMatch(message);
  if (match) return { content: match.answer, links: match.links, mode: "fallback" };
  return {
    content: FALLBACK_REPLY,
    links: [
      { label: "Full FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
    ],
    mode: "fallback",
  };
}

export class CustomerSupportChatService {
  async getStatus(): Promise<StorefrontChatStatus> {
    try {
      return await fetchStorefrontChatStatus();
    } catch {
      return { live: false, provider: null, model: null, canOrder: true };
    }
  }

  async reply(message: string, history: StorefrontChatHistoryItem[] = []): Promise<ChatReply> {
    const trimmed = message.trim();
    if (!trimmed) return { content: "Please type a question or product name." };

    try {
      const apiReply = await sendStorefrontChatMessage(trimmed, history, getStorefrontCartToken());
      return {
        content: apiReply.content,
        mode: apiReply.mode,
        provider: apiReply.provider ?? undefined,
        links: apiReply.links.length > 0 ? apiReply.links : undefined,
        orderNumber: apiReply.orderNumber ?? undefined,
        products: apiReply.products.length > 0 ? apiReply.products : undefined,
      };
    } catch {
      if (isOrderIntent(trimmed)) return orderFallback(trimmed);
      return localReply(trimmed);
    }
  }

  async addProductToCart(productId: string, productName: string): Promise<ChatReply> {
    try {
      const res = await sendStorefrontChatAction({
        action: "add_to_cart",
        productId,
        message: `Add ${productName} to cart`,
      });
      return {
        content: res.content,
        mode: res.mode,
        links: res.links,
        orderNumber: res.orderNumber ?? undefined,
      };
    } catch {
      return { content: "কার্টে যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।", mode: "fallback" };
    }
  }
}

export const customerSupportChatService = new CustomerSupportChatService();
