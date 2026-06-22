"use client";

import { GitCompare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MAX_COMPARE_ITEMS,
  useStorefrontCompare,
  type CompareProductInput,
} from "@/lib/store/storefront-compare-store";

type CompareButtonProps = {
  product: CompareProductInput;
  variant?: "icon" | "button";
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
};

export function CompareButton({
  product,
  variant = "icon",
  className,
  iconClassName,
  showLabel = true,
}: CompareButtonProps) {
  const isInCompare = useStorefrontCompare((s) => s.isInCompare(product.productId));
  const toggleItem = useStorefrontCompare((s) => s.toggleItem);
  const canAdd = useStorefrontCompare((s) => s.canAdd);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare) {
      toggleItem(product);
      toast.success("Removed from compare");
      return;
    }

    if (!canAdd()) {
      toast.error(`Compare up to ${MAX_COMPARE_ITEMS} products at a time`);
      return;
    }

    toggleItem(product);
    toast.success("Added to compare");
  };

  const active = isInCompare;

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn("h-11 text-sm", className)}
        onClick={onClick}
      >
        <GitCompare
          className={cn("mr-2 h-4 w-4", active && "text-primary", iconClassName)}
        />
        {showLabel && (active ? "Added to compare" : "Add to compare")}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background",
        className,
      )}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      aria-pressed={active}
      onClick={onClick}
    >
      <GitCompare
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-primary" : "text-foreground",
          iconClassName,
        )}
      />
    </Button>
  );
}
