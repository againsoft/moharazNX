import Image from "next/image";
import type { HeroSlide } from "@/lib/mock-data/storefront-home";

type HeroBannerProps = {
  slides: HeroSlide[];
};

/* Single white-background banner — Monarch IT style, full viewport width */
export function HeroBanner({ slides: _ }: HeroBannerProps) {
  return (
    <section
      className="relative -mt-[72px] bg-white"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      aria-label="Featured promotions"
    >
      <div className="relative w-full" style={{ aspectRatio: "1880/1060" }}>
        <Image
          src="/hero/slider-1.jpg"
          alt="MoharazNX — Top Tech Store"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
