import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { storeConfig } from "@/lib/mock-data/storefront-home";
import { moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";
import { builderPcPath, builderPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

const shopLinks = [
  { label: "All Products", href: storefrontPaths.products },
  { label: "New Arrivals", href: storefrontPaths.newArrivals },
  { label: "Best Sellers", href: storefrontPaths.bestsellers },
  { label: "Today's Deals", href: storefrontPaths.deals },
  { label: "PC Builder", href: builderPcPath() },
  { label: "All Builders", href: builderPath() },
];

const importantLinks = [
  { label: "About Us", href: storefrontPaths.about },
  { label: "Blog", href: storefrontPaths.blog },
  { label: "Contact Us", href: storefrontPaths.contact },
  { label: "Privacy Policy", href: storefrontPaths.privacy },
  { label: "Terms & Conditions", href: storefrontPaths.terms },
  { label: "Refund & Return", href: storefrontPaths.returns },
];

const helpLinks = [
  { label: "Track Order", href: storefrontPaths.track },
  { label: "Shipping Info", href: storefrontPaths.shipping },
  { label: "FAQ", href: storefrontPaths.faq },
  { label: "Warranty Policy", href: storefrontPaths.warranty },
];

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-white text-foreground">
      <div className="sf-container px-3 py-10 sm:px-5">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Company info */}
          <div>
            <p className="text-lg font-extrabold tracking-tight text-foreground">{storeConfig.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{storeConfig.tagline}</p>

            <div className="mt-5 space-y-2.5 text-xs text-muted-foreground">
              <a
                href={`tel:${moharazStoreConfig.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-[#dc2626]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                {moharazStoreConfig.phone}
              </a>
              <a
                href={`https://wa.me/${moharazStoreConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-[#dc2626]"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                WhatsApp Support
              </a>
              <a
                href={`mailto:${moharazStoreConfig.supportEmail}`}
                className="flex items-center gap-2 transition-colors hover:text-[#dc2626]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                {moharazStoreConfig.supportEmail}
              </a>
              <span className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                <span>
                  {moharazStoreConfig.hours}
                  <br />
                  <span className="text-muted-foreground">{moharazStoreConfig.days}</span>
                </span>
              </span>
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                <span className="leading-relaxed">{moharazStoreConfig.address}</span>
              </span>
            </div>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-[#dc2626]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Important Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">Important Links</p>
            <ul className="mt-4 space-y-2.5">
              {importantLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-[#dc2626]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Customer Help */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">Customer Help</p>
            <ul className="mt-4 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-[#dc2626]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">We Accept</p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "bKash", "Nagad", "COD"].map((m) => (
                  <span
                    key={m}
                    className="rounded border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <p>© 2026 {storeConfig.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href={storefrontPaths.privacy} className="hover:text-foreground">Privacy</Link>
            <Link href={storefrontPaths.terms} className="hover:text-foreground">Terms</Link>
            <Link href={storefrontPaths.returns} className="hover:text-foreground">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
