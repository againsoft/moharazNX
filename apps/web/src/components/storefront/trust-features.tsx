import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { moharazTrustFeatures } from "@/lib/mock-data/storefront-moharaz";

const icons = [Truck, ShieldCheck, CreditCard, Headphones];

export function TrustFeatures() {
  return (
    <section aria-label="Store benefits" className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {moharazTrustFeatures.map((item, i) => {
          const Icon = icons[i] ?? Truck;
          return (
            <div key={item.id} className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eb6626]/10 text-[#eb6626]">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
