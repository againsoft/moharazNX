"use client";

import { MapPin, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountAddresses } from "@/lib/mock-data/storefront-account";

export function AccountAddressesView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shipping and billing addresses for faster checkout
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success("Add address form (mock)")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add address
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {accountAddresses.map((addr) => (
          <div
            key={addr.id}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{addr.label}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.success("Edit address (mock)")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-2 text-sm">{addr.name}</p>
            <p className="text-sm text-muted-foreground">{addr.phone}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.district} {addr.postalCode}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {addr.isDefaultShipping && (
                <Badge variant="secondary" className="text-[10px]">
                  <Star className="mr-0.5 h-2.5 w-2.5" />
                  Default shipping
                </Badge>
              )}
              {addr.isDefaultBilling && (
                <Badge variant="outline" className="text-[10px]">
                  Default billing
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
