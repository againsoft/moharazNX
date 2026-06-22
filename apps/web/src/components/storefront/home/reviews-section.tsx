import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StorefrontReview } from "@/lib/mock-data/storefront-home";

type ReviewsSectionProps = {
  reviews: StorefrontReview[];
};

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {reviews.map((review) => (
        <blockquote
          key={review.id}
          className="flex flex-col rounded-xl border border-border/60 bg-card p-5"
        >
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold">{review.title}</p>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{review.body}</p>
          <footer className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <div>
              <cite className="not-italic text-sm font-medium">{review.author}</cite>
              <p className="text-[11px] text-muted-foreground">{review.productName}</p>
            </div>
            {review.verified && (
              <Badge variant="success" className="text-[10px]">
                Verified
              </Badge>
            )}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
