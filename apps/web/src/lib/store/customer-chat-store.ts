"use client";

import { create } from "zustand";
import { customerSupportChatService } from "@/lib/storefront/ai/customer-support-chat-service";
import { WELCOME_MESSAGE } from "@/lib/storefront/ai/customer-support-knowledge";
import type { ChatMessage } from "@/lib/storefront/ai/customer-support-types";

type CustomerChatState = {
  open: boolean;
  messages: ChatMessage[];
  typing: boolean;
  chatMode: "live" | "fallback" | "action" | "unknown";
  provider: string | null;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  sendMessage: (text: string) => Promise<void>;
  addProductToCart: (productId: string, productName: string) => Promise<void>;
  reset: () => void;
  refreshStatus: () => Promise<void>;
};

function makeId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function welcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: WELCOME_MESSAGE,
    timestamp: Date.now(),
  };
}

export const useCustomerChatStore = create<CustomerChatState>((set, get) => ({
  open: false,
  messages: [welcomeMessage()],
  typing: false,
  chatMode: "unknown",
  provider: null,

  setOpen: (open) => {
    set({ open });
    if (open && get().chatMode === "unknown") {
      void get().refreshStatus();
    }
  },

  toggle: () => {
    const next = !get().open;
    set({ open: next });
    if (next && get().chatMode === "unknown") {
      void get().refreshStatus();
    }
  },

  refreshStatus: async () => {
    const status = await customerSupportChatService.getStatus();
    set({
      chatMode: status.live ? "live" : "fallback",
      provider: status.provider,
    });
  },

  reset: () => set({ messages: [welcomeMessage()] }),

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().typing) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const history = get()
      .messages.filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    set((s) => ({
      messages: [...s.messages, userMsg],
      typing: true,
    }));

    try {
      const reply = await customerSupportChatService.reply(trimmed, history);
      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: reply.content,
        links: reply.links,
        products: reply.products,
        orderNumber: reply.orderNumber,
        timestamp: Date.now(),
      };
      set((s) => ({
        messages: [...s.messages, assistantMsg],
        typing: false,
        chatMode: reply.mode ?? s.chatMode,
        provider: reply.provider ?? s.provider,
      }));
    } catch {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: makeId(),
            role: "assistant",
            content: "Sorry, something went wrong. Please try again or contact support.",
            timestamp: Date.now(),
          },
        ],
        typing: false,
      }));
    }
  },

  addProductToCart: async (productId, productName) => {
    if (get().typing) return;
    set({ typing: true });
    try {
      const reply = await customerSupportChatService.addProductToCart(productId, productName);
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: makeId(),
            role: "assistant",
            content: reply.content,
            links: reply.links,
            orderNumber: reply.orderNumber,
            timestamp: Date.now(),
          },
        ],
        typing: false,
        chatMode: reply.mode ?? s.chatMode,
      }));
    } catch {
      set({ typing: false });
    }
  },
}));
