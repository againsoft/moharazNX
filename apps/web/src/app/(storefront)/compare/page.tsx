import { Suspense } from "react";
import { CompareView } from "@/components/storefront/compare/compare-view";

export const metadata = {
  title: "Compare — MoharazNX",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-12 text-sm text-muted-foreground">Loading compare…</div>}>
      <CompareView />
    </Suspense>
  );
}
