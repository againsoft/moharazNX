"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { useStorefrontWishlist } from "@/lib/store/storefront-wishlist-store";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

const items = [
  { href: storefrontPaths.home, label: "Home", icon: Home },
  { href: storefrontPaths.categories, label: "Categories", icon: Grid2X2 },
  { href: storefrontPaths.search, label: "Search", icon: Search },
  { href: storefrontPaths.wishlist, label: "Wishlist", icon: Heart },
  { href: storefrontPaths.cart, label: "Cart", icon: ShoppingBag },
  { href: storefrontPaths.account, label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const count = useStorefrontCart((s) => s.count);
  const wishlistCount = useStorefrontWishlist((s) => s.count);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch justify-around px-1 py-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== storefrontPaths.home && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                {label}
                {href === storefrontPaths.cart && count > 0 && (
                  <span className="absolute right-2 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
                {href === storefrontPaths.wishlist && wishlistCount > 0 && (
                  <span className="absolute right-2 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
