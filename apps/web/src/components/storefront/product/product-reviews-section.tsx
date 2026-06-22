"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WriteReviewDialog } from "@/components/storefront/product/write-review-dialog";
import type { ProductReview } from "@/lib/mock-data/storefront-product";

type ProductReviewsSectionProps = {
  productName: string;
  reviews: ProductReview[];
  avgRating: number;
  reviewCount: number;
};

export function ProductReviewsSection({
  productName,
  reviews: initialReviews,
  avgRating: initialAvg,
  reviewCount: initialCount,
}: ProductReviewsSectionProps) {
  const [filter, setFilter] = useState<number | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>([]);

  const reviews = useMemo(() => [...localReviews, ...initialReviews], [localReviews, initialReviews]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return initialAvg;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews, initialAvg]);

  const reviewCount = initialCount + localReviews.length;
  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);

  const onReviewSubmitted = (review: ProductReview) => {
    setLocalReviews((prev) => [review, ...prev]);
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Customer reviews</h2>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} out of 5 · {reviewCount} reviews
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", 5, 4] as const).map((f) => (
            <Button
              key={String(f)}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : `${f} stars`}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((review) => (
          <article key={review.id} className="rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                  />
                ))}
              </div>
              {review.verified ? (
                <Badge variant="success" className="text-[10px]">
                  Verified purchase
                </Badge>
              ) : (
                review.id.startsWith("pr-new-") && (
                  <Badge variant="outline" className="text-[10px]">
                    Pending
                  </Badge>
                )
              )}
            </div>
            <h3 className="mt-2 font-semibold">{review.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
            <footer className="mt-3 text-xs text-muted-foreground">
              {review.author} · {review.date}
            </footer>
          </article>
        ))}
      </div>

      <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
        Write a review
      </Button>

      <WriteReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={productName}
        onSubmitted={onReviewSubmitted}
      />
    </section>
  );
}
