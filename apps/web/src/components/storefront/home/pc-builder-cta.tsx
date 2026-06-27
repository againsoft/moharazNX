import Image from "next/image";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { builderPcPath } from "@/lib/url-slug/storefront-paths";
import { csUnsplash } from "@/lib/mock-data/storefront-computer-store";

export function PcBuilderCta() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white">
      <div className="absolute inset-0 opacity-20">
        <Image
          src={csUnsplash("gpu", 1200, 400)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-orange-50/80 to-transparent" />

      <div className="relative flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-lg">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#dc2626]/20 text-[#dc2626]">
            <Cpu className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Build Your Dream PC
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Choose your components, check compatibility, and get it assembled & tested — free of charge.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            {["Free assembly", "Compatibility check", "Official warranty", "Same-day delivery"].map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Button
          asChild
          size="lg"
          className="shrink-0 bg-[#dc2626] px-8 text-sm font-bold text-white hover:bg-[#b91c1c]"
        >
          <Link href={builderPcPath()}>Start Building →</Link>
        </Button>
      </div>
    </section>
  );
}
