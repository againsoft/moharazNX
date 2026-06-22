"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/mock-data/storefront-home";

type HeroBannerProps = {
  slides: HeroSlide[];
};

export function HeroBanner({ slides }: HeroBannerProps) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-neutral-950 shadow-xl" aria-label="Featured promotions">
      <div className="relative aspect-[2/1] sm:aspect-[3/1]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 flex items-center p-5 sm:p-10">
          <div className="max-w-lg text-white">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 backdrop-blur-sm sm:text-xs">
              {slide.eyebrow}
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-2 text-xs text-white/75 sm:text-sm">{slide.subtitle}</p>
            <div className="mt-5 flex items-center gap-3">
              <Button
                asChild
                size="sm"
                className="rounded-full bg-[#eb6626] px-5 text-xs font-semibold text-white hover:bg-[#d45518] sm:text-sm"
              >
                <Link href={slide.href}>{slide.cta}</Link>
              </Button>
              <Link
                href="/deals"
                className="text-xs font-medium text-white/70 underline-offset-2 hover:text-white hover:underline sm:text-sm"
              >
                View all deals →
              </Link>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2 sm:right-6">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/15 shadow backdrop-blur-sm hover:bg-white/30"
            onClick={prev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/15 shadow backdrop-blur-sm hover:bg-white/30"
            onClick={next}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === index
                  ? "h-2 w-7 bg-white"
                  : "h-2 w-2 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
