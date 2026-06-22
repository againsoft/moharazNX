import Link from "next/link";
import { Globe, Mail, Share2 } from "lucide-react";
import { storeConfig } from "@/lib/mock-data/storefront-home";
import { builderPcPath, builderPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

const footerLinks = {
  shop: [
    { label: "All products", href: storefrontPaths.products },
    { label: "New arrivals", href: storefrontPaths.newArrivals },
    { label: "Best sellers", href: storefrontPaths.bestsellers },
    { label: "Deals", href: storefrontPaths.deals },
  ],
  builders: [
    { label: "All builders", href: builderPath() },
    { label: "PC Builder", href: builderPcPath() },
    { label: "Laptop Builder", href: builderPath(), soon: true },
    { label: "CCTV Builder", href: builderPath(), soon: true },
  ],
  help: [
    { label: "Contact us", href: storefrontPaths.contact },
    { label: "Shipping & returns", href: storefrontPaths.shipping },
    { label: "FAQ", href: storefrontPaths.faq },
    { label: "Track order", href: storefrontPaths.track },
    { label: "Warranty", href: storefrontPaths.warranty },
  ],
  company: [
    { label: "About", href: storefrontPaths.about },
    { label: "Blog", href: storefrontPaths.blog },
    { label: "Careers", href: storefrontPaths.careers },
    { label: "Admin", href: storefrontPaths.dashboard },
  ],
};

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="sf-container px-3 py-6 sm:px-5">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-semibold tracking-tight">{storeConfig.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{storeConfig.tagline}</p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <Link href="#" aria-label="Website" className="hover:text-foreground">
                <Globe className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Email" className="hover:text-foreground">
                <Mail className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Share" className="hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={`${title}-${link.label}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                      {"soon" in link && link.soon ? (
                        <span className="ml-1 text-[10px] text-muted-foreground/70">(soon)</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 {storeConfig.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href={storefrontPaths.privacy} className="hover:text-foreground">
              Privacy
            </Link>
            <Link href={storefrontPaths.terms} className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
