"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { SectionHeader } from "@/components/storefront/home/section-header";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { useStorefrontWishlist } from "@/lib/store/storefront-wishlist-store";
import { featuredProducts } from "@/lib/mock-data/storefront-home";
import { formatCurrency } from "@/lib/utils";
import { productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

export function WishlistView() {
  const { items, removeItem, clearWishlist } = useStorefrontWishlist();
  const addItem = useStorefrontCart((s) => s.addItem);

  const suggestions = featuredProducts.filter(
    (p) => !items.some((i) => i.productId === p.id),
  ).slice(0, 8);

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      qty: 1,
    });
    toast.success("Added to cart");
  };

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Wishlist</h1>
        <div className="py-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save items you love and shop them later.
          </p>
          <Button asChild className="mt-6">
            <Link href={storefrontPaths.products}>Browse products</Link>
          </Button>
        </div>
        {suggestions.length > 0 && (
          <section className="mt-12">
            <SectionHeader title="Popular picks" href={storefrontPaths.products} />
            <ProductRail products={suggestions} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => clearWishlist()}>
          Clear all
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const discount =
            item.compareAtPrice && item.compareAtPrice > item.price
              ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
              : null;

          return (
            <article
              key={item.id}
              className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 sm:gap-4 sm:p-4"
            >
              <Link
                href={productPath(item.slug)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24"
              >
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {item.brand}
                </p>
                <Link
                  href={productPath(item.slug)}
                  className="font-medium hover:text-primary line-clamp-2"
                >
                  {item.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
                  {item.compareAtPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(item.compareAtPrice)}
                    </span>
                  )}
                  {discount && (
                    <span className="text-[10px] font-semibold text-red-500">-{discount}%</span>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <Button size="sm" className="h-8" onClick={() => handleAddToCart(item)}>
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Add to cart
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href={productPath(item.slug)}>View product</Link>
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                aria-label="Remove from wishlist"
                onClick={() => {
                  removeItem(item.productId);
                  toast.success("Removed from wishlist");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </article>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="You might also like" href={storefrontPaths.products} />
          <ProductRail products={suggestions} />
        </section>
      )}
    </div>
  );
}
