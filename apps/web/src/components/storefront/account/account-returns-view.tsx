"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountReturns } from "@/lib/mock-data/storefront-account";

export function AccountReturnsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Returns</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            RMA requests and refund status
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => toast.success("Return request form (mock)")}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New return
        </Button>
      </div>

      {accountReturns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
          No return requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {accountReturns.map((rma) => (
            <div
              key={rma.id}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{rma.rmaNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Order {rma.orderNumber} · {rma.requestedAt}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {rma.statusLabel}
                </Badge>
              </div>
              <p className="mt-2 text-sm">{rma.productName}</p>
              <p className="mt-1 text-xs text-muted-foreground">Reason: {rma.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
