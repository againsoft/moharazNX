import Image from "next/image";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { builderPcPath } from "@/lib/url-slug/storefront-paths";
import { csUnsplash } from "@/lib/mock-data/storefront-computer-store";

export function PromoBanners() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Banner 1 — Flash Sale */}
      <Link
        href="/deals"
        className="group relative overflow-hidden rounded-xl"
        aria-label="Flash sale — up to 30% off laptops"
      >
        <div className="relative h-44 sm:h-52">
          <Image
            src={csUnsplash("laptop", 800, 400)}
            alt=""
            fill
            sizes="(max-width:640px) 100vw, 50vw"
            className="object-cover brightness-50 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-6">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-200">
              <Flame className="h-3.5 w-3.5" /> Hot Deal
            </span>
            <h3 className="mt-1.5 text-xl font-extrabold leading-tight text-white sm:text-2xl">
              Laptop Flash Sale
            </h3>
            <p className="mt-1 text-sm text-white/80">Up to 30% off — limited time</p>
            <span className="mt-4 inline-flex w-fit items-center rounded-md bg-white px-4 py-1.5 text-xs font-bold text-[#dc2626] transition-colors group-hover:bg-orange-50">
              Shop Now →
            </span>
          </div>
        </div>
      </Link>

      {/* Banner 2 — PC Builder */}
      <Link
        href={builderPcPath()}
        className="group relative overflow-hidden rounded-xl"
        aria-label="Build your custom PC"
      >
        <div className="relative h-44 sm:h-52">
          <Image
            src={csUnsplash("gpu", 800, 400)}
            alt=""
            fill
            sizes="(max-width:640px) 100vw, 50vw"
            className="object-cover brightness-40 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/30" />
          <div className="absolute inset-0 flex flex-col justify-center p-6">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-300">
              <Zap className="h-3.5 w-3.5" /> Custom Build
            </span>
            <h3 className="mt-1.5 text-xl font-extrabold leading-tight text-white sm:text-2xl">
              Build Your Dream PC
            </h3>
            <p className="mt-1 text-sm text-white/80">Free assembly · Warranty included</p>
            <span className="mt-4 inline-flex w-fit items-center rounded-md bg-[#dc2626] px-4 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#b91c1c]">
              Start Building →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
