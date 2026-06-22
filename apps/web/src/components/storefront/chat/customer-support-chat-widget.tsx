"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Loader2, MessageCircle, Minimize2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUICK_PROMPTS } from "@/lib/storefront/ai/customer-support-knowledge";
import { useCustomerChatStore } from "@/lib/store/customer-chat-store";
import type { ChatMessage, ChatProduct } from "@/lib/storefront/ai/customer-support-types";
import { moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";
import { cn, formatCurrency } from "@/lib/utils";

function ChatProductCard({
  product,
  onAdd,
  disabled,
}: {
  product: ChatProduct;
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 p-2.5">
      <p className="text-[11px] font-semibold leading-snug">{product.name}</p>
      {product.brand && (
        <p className="text-[10px] text-muted-foreground">{product.brand}</p>
      )}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-primary">{formatCurrency(product.priceBdt)}</p>
          <p
            className={cn(
              "text-[10px] font-medium",
              product.inStock ? "text-emerald-600" : "text-destructive",
            )}
          >
            {product.inStock ? `✅ Stock: ${product.stock}` : "❌ Out of stock"}
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 shrink-0 px-2.5 text-[10px]"
          disabled={disabled || !product.inStock}
          onClick={onAdd}
        >
          Cart e add
        </Button>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  onAddProduct,
  actionDisabled,
}: {
  message: ChatMessage;
  onAddProduct: (id: string, name: string) => void;
  actionDisabled?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn("max-w-[85%] space-y-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-xs leading-relaxed sm:text-[13px]",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border/60 bg-card text-foreground",
          )}
        >
          {message.content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </div>
        {message.products && message.products.length > 0 && (
          <div className="space-y-2">
            {message.products.map((p) => (
              <ChatProductCard
                key={p.id}
                product={p}
                disabled={actionDisabled}
                onAdd={() => onAddProduct(p.id, p.name)}
              />
            ))}
          </div>
        )}
        {message.links && message.links.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.links.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="outline"
                size="sm"
                className="h-7 rounded-full px-2.5 text-[10px]"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        )}
        {message.orderNumber && (
          <p className="text-[10px] font-semibold text-emerald-600">
            Order confirmed: {message.orderNumber}
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/60 bg-card px-3 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function CustomerSupportChatWidget() {
  const open = useCustomerChatStore((s) => s.open);
  const messages = useCustomerChatStore((s) => s.messages);
  const typing = useCustomerChatStore((s) => s.typing);
  const chatMode = useCustomerChatStore((s) => s.chatMode);
  const provider = useCustomerChatStore((s) => s.provider);
  const setOpen = useCustomerChatStore((s) => s.setOpen);
  const sendMessage = useCustomerChatStore((s) => s.sendMessage);
  const addProductToCart = useCustomerChatStore((s) => s.addProductToCart);
  const reset = useCustomerChatStore((s) => s.reset);

  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
          aria-label="Open support chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
            <span className="sr-only">Online</span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl sm:bottom-6 sm:right-6"
          role="dialog"
          aria-label="Customer support chat"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-primary/10 to-orange-500/5 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                {moharazStoreConfig.name} Support
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h2>
              <p className="text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      chatMode === "live" ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  {chatMode === "live"
                    ? `Live AI${provider ? ` · ${provider}` : ""}`
                    : chatMode === "fallback"
                      ? "Offline · FAQ answers"
                      : "Checking connection…"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={reset}
                aria-label="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex max-h-[min(420px,50vh)] min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
          >
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                actionDisabled={typing}
                onAddProduct={(id, name) => void addProductToCart(id, name)}
              />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {/* Quick prompts */}
          <div className="border-t border-border/40 px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  disabled={typing}
                  onClick={() => void sendMessage(prompt.message)}
                  className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/60 p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or order a product…"
                className="h-9 flex-1 text-xs"
                disabled={typing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button type="submit" size="sm" className="h-9 shrink-0 px-3" disabled={typing || !input.trim()}>
                {typing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
              {chatMode === "live"
                ? `Powered by ${provider ?? "AI"} · can place orders in chat`
                : "Connect OpenAI in Settings → AI to enable live responses"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
