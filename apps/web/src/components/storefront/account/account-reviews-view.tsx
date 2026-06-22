"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountReviews } from "@/lib/mock-data/storefront-account";
import { productPath } from "@/lib/url-slug/storefront-paths";

export function AccountReviewsView() {
  const pending = accountReviews.filter((r) => r.status === "pending");
  const submitted = accountReviews.filter((r) => r.status === "submitted");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending and submitted product reviews
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Pending reviews</h3>
          <div className="space-y-3">
            {pending.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={review.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={productPath(review.productSlug)}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {review.productName}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Verified purchase · Earn +50 reward points
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={() => toast.success("Review form (mock)")}
                  >
                    Write review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Submitted</h3>
          <div className="space-y-3">
            {submitted.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={review.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{review.productName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: review.rating ?? 0 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      Published
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {review.submittedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
