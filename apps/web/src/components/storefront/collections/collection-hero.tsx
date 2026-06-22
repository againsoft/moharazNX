import Image from "next/image";
import type { CollectionType } from "@/lib/mock-data/storefront-collections";
import { COLLECTION_CONFIG } from "@/lib/mock-data/storefront-collections";

type CollectionHeroProps = {
  type: CollectionType;
};

export function CollectionHero({ type }: CollectionHeroProps) {
  const config = COLLECTION_CONFIG[type];

  return (
    <section className="relative overflow-hidden rounded-xl bg-muted">
      <div className="relative aspect-[3/1] sm:aspect-[4/1]">
        <Image src={config.heroImage} alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center p-4 sm:p-6">
          <div className="max-w-md text-white">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{config.eyebrow}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">{config.title}</h1>
            <p className="mt-1.5 text-xs text-white/85 sm:text-sm">{config.subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
