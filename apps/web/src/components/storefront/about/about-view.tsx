import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Home, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aboutContent, ABOUT_LINKS } from "@/lib/mock-data/storefront-about";

export function AboutView() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">About</span>
      </nav>

      <header className="relative overflow-hidden rounded-xl bg-muted">
        <div className="relative aspect-[2/1] sm:aspect-[3/1]">
          <Image
            src="https://picsum.photos/seed/about-againshop/1200/400"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-4 sm:p-6">
            <div className="max-w-lg text-white">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                Since {aboutContent.founded}
              </p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">About {aboutContent.name}</h1>
              <p className="mt-1.5 text-xs text-white/85 sm:text-sm">{aboutContent.tagline}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-border/60 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Heart className="h-4 w-4 text-primary" />
          Our mission
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{aboutContent.mission}</p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {aboutContent.stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-card p-3 text-center">
            <p className="text-lg font-bold text-primary">{stat.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border/60 bg-card p-4">
        <h2 className="text-sm font-semibold">Our story</h2>
        <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {aboutContent.story.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">What we stand for</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {aboutContent.values.map((v) => (
            <div key={v.title} className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs font-semibold">{v.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <div>
            <h2 className="text-sm font-semibold">Powered by MoharazNX</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              MoharazNX runs on MoharazNX — unified catalog, inventory, orders, and AI. What you browse here is the
              same product data merchants manage in real time. That means accurate stock, faster fulfillment, and
              smarter recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">The team</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{aboutContent.teamNote}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {ABOUT_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href={link.href}>
              {link.label}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
