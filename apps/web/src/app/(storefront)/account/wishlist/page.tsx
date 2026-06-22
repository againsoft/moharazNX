import { WishlistView } from "@/components/storefront/wishlist/wishlist-view";

export const metadata = {
  title: "Wishlist — My account — MoharazNX",
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Synced across devices when you are signed in.
      </p>
      <WishlistView />
    </div>
  );
}
