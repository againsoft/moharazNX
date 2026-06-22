"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useStorefrontWishlist,
  type WishlistProductInput,
} from "@/lib/store/storefront-wishlist-store";

type WishlistButtonProps = {
  product: WishlistProductInput;
  variant?: "icon" | "button";
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
};

export function WishlistButton({
  product,
  variant = "icon",
  className,
  iconClassName,
  showLabel = true,
}: WishlistButtonProps) {
  const isInWishlist = useStorefrontWishlist((s) => s.isInWishlist(product.productId));
  const toggleItem = useStorefrontWishlist((s) => s.toggleItem);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product);
    toast.success(added ? "Added to wishlist" : "Removed from wishlist");
  };

  const saved = isInWishlist;

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn("h-11 text-sm", className)}
        onClick={onClick}
      >
        <Heart
          className={cn(
            "mr-2 h-4 w-4",
            saved && "fill-red-500 text-red-500",
            iconClassName,
          )}
        />
        {showLabel && (saved ? "Saved to wishlist" : "Add to wishlist")}
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
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={onClick}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-red-500 text-red-500" : "text-foreground",
          iconClassName,
        )}
      />
    </Button>
  );
}
