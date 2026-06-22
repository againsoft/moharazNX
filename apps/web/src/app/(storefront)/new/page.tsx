import { Suspense } from "react";
import { CollectionView } from "@/components/storefront/collections/collection-view";

export const metadata = {
  title: "New Arrivals — MoharazNX",
  description: "Fresh styles and latest tech — just landed.",
};

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={null}>
      <CollectionView type="new" />
    </Suspense>
  );
}
