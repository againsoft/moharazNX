import { Suspense } from "react";
import { CollectionView } from "@/components/storefront/collections/collection-view";

export const metadata = {
  title: "Best Sellers — MoharazNX",
  description: "Top-rated products loved by shoppers.",
};

export default function BestSellersPage() {
  return (
    <Suspense fallback={null}>
      <CollectionView type="bestsellers" />
    </Suspense>
  );
}
