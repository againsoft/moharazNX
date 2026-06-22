"use client";

import { MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supportTickets } from "@/lib/mock-data/storefront-account";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  open: "default",
  waiting: "secondary",
  resolved: "outline",
};

export function AccountSupportView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Support</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tickets and chat history with our support team
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success("New ticket form (mock)")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New ticket
        </Button>
      </div>

      <div className="space-y-3">
        {supportTickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            className="w-full rounded-xl border border-border/60 bg-card p-4 text-left transition hover:border-primary/30 hover:bg-accent/30"
            onClick={() => toast.info(`Ticket ${ticket.id} detail (mock)`)}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="font-medium">{ticket.subject}</p>
              </div>
              <Badge variant={statusVariant[ticket.status]} className="text-[10px]">
                {ticket.statusLabel}
              </Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ticket.preview}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">Updated {ticket.updatedAt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
