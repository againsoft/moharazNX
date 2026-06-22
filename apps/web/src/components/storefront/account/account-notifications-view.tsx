"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { notificationPrefs } from "@/lib/mock-data/storefront-account";

type PrefKey = keyof typeof notificationPrefs;

const PREF_LABELS: Record<PrefKey, { label: string; hint: string }> = {
  orderUpdates: {
    label: "Order updates",
    hint: "Shipping, delivery, and return status",
  },
  promotions: {
    label: "Promotions & deals",
    hint: "Sales, coupons, and new arrivals",
  },
  priceDrops: {
    label: "Price drop alerts",
    hint: "When wishlist items go on sale",
  },
  sms: {
    label: "SMS notifications",
    hint: "Order and delivery SMS to your phone",
  },
  push: {
    label: "Push notifications",
    hint: "Browser or app push (when enabled)",
  },
};

export function AccountNotificationsView() {
  const [prefs, setPrefs] = useState(notificationPrefs);

  const toggle = (key: PrefKey) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    toast.success("Preference saved (mock)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Email, SMS, and push notification preferences
        </p>
      </div>

      <div className="space-y-2">
        {(Object.keys(PREF_LABELS) as PrefKey[]).map((key) => (
          <Switch
            key={key}
            label={PREF_LABELS[key].label}
            description={PREF_LABELS[key].hint}
            checked={prefs[key]}
            onCheckedChange={() => toggle(key)}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.success("All preferences saved (mock)")}
      >
        Save preferences
      </Button>
    </div>
  );
}
