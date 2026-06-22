export type ChatRole = "user" | "assistant";

export type ChatLink = { label: string; href: string };

export type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  priceBdt: number;
  stock: number;
  inStock: boolean;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  links?: ChatLink[];
  products?: ChatProduct[];
  orderNumber?: string;
  timestamp: number;
};

export type ChatReply = {
  content: string;
  links?: ChatLink[];
  mode?: "live" | "fallback" | "action";
  provider?: string;
  orderNumber?: string;
  products?: ChatProduct[];
};

export type QuickPrompt = {
  id: string;
  label: string;
  message: string;
};
