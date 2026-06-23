"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LiveSearch } from "@/components/storefront/search/live-search";
import { StorefrontBuilderNav } from "@/components/storefront/storefront-builder-nav";
import { useStorefrontAuth } from "@/lib/store/storefront-auth-store";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { storeConfig } from "@/lib/mock-data/storefront-home";
import { getMoharazNavLinks } from "@/lib/mock-data/storefront-moharaz";
import { accountPaths, storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

const navLinks = getMoharazNavLinks();

function isNavLinkActive(pathname: string, href: string) {
  if (href === storefrontPaths.home) return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── SHOP Mega Menu ── */
function ShopMegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Group links into columns */
  const cols = [
    {
      title: "Computers",
      links: [
        { href: "/laptops", label: "Laptops" },
        { href: "/gaming-laptop", label: "Gaming Laptops" },
        { href: "/desktop-pcs", label: "Desktop PCs" },
        { href: "/tablets", label: "Tablets" },
      ],
    },
    {
      title: "Mobile & Display",
      links: [
        { href: "/phones", label: "Smartphones" },
        { href: "/monitors", label: "Monitors" },
        { href: "/cameras", label: "Cameras" },
        { href: "/tvs", label: "TVs" },
      ],
    },
    {
      title: "Components",
      links: [
        { href: "/electronics", label: "PC Components" },
        { href: "/networking", label: "Networking" },
        { href: "/accessories", label: "Accessories" },
        { href: "/printers", label: "Printers" },
      ],
    },
    {
      title: "More",
      links: [
        { href: "/deals", label: "Today's Deals 🔥" },
        { href: "/builder/pc-builder", label: "PC Builder" },
        { href: storefrontPaths.categories, label: "All Categories" },
        { href: "/brands", label: "All Brands" },
      ],
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-bold transition-colors",
          open ? "text-[#dc2626]" : "text-gray-700 hover:text-[#dc2626]",
        )}
      >
        SHOP
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-full z-[300] mt-1 w-[680px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
        >
          {/* Arrow tip */}
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-gray-100 bg-white" />

          <div className="grid grid-cols-4 gap-6">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#dc2626]">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block text-sm transition-colors hover:text-[#dc2626]",
                          isNavLinkActive(pathname, link.href)
                            ? "font-semibold text-[#dc2626]"
                            : "text-gray-600",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom promo strip */}
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
            <span className="text-sm font-semibold text-[#dc2626]">🔥 Flash deals every day —</span>
            <Link
              href="/deals"
              onClick={() => setOpen(false)}
              className="text-sm font-bold text-[#dc2626] underline underline-offset-2 hover:text-[#b91c1c]"
            >
              View all deals →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Header ── */
export function StorefrontHeader() {
  const user = useStorefrontAuth((s) => s.user);
  const count = useStorefrontCart((s) => s.count);
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      {/*
        Monarch IT exact layout (at 1440px):
        sidebar(145) | Logo(155) | spacer(flex-1) | Search(520) | SHOP(~50) | ml-auto | PCBuilder(110) | Cart(44) | Account(44) | padding(15)
      */}
      {/* Grid: [Logo | Center(Search+SHOP) | Right icons] */}
      <div className="mx-auto grid h-[72px] max-w-[1600px] grid-cols-[auto_1fr_auto] items-center pl-6 pr-4 xl:pl-[148px] xl:pr-6">

        {/* LEFT — Logo + mobile hamburger */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <h2 className="mb-4 text-base font-semibold">{storeConfig.name}</h2>
              <StorefrontBuilderNav variant="mobile" />
              <nav className="mt-2 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                      isNavLinkActive(pathname, link.href) && "bg-accent text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href={storefrontPaths.home} className="shrink-0" aria-label={storeConfig.name}>
            <Image
              src="/brand/logo.png"
              alt={storeConfig.name}
              width={155}
              height={44}
              className="h-[44px] w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* CENTER — Search + SHOP, perfectly centered */}
        <div className="flex items-center justify-center gap-3">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <div className="hidden w-[420px] shrink-0 lg:block">
            <LiveSearch variant="header" />
          </div>

          <div className="hidden lg:block">
            <ShopMegaMenu />
          </div>
        </div>

        {/* RIGHT — PC Builder | Cart | Account */}
        <div className="flex shrink-0 items-center gap-3">

          {/* PC Builder — rounded pill, red border, hover → red fill white text */}
          <Button
            variant="outline"
            size="lg"
            className="hidden h-[46px] rounded-full border-2 border-[#dc2626] bg-white px-7 text-base font-semibold text-[#dc2626] transition-all hover:bg-[#dc2626] hover:text-white lg:inline-flex"
            asChild
          >
            <Link href={storefrontPaths.builderPc}>PC Builder</Link>
          </Button>

          {/* Cart — gray filled circle, dark icon, red badge */}
          <Link
            href={storefrontPaths.cart}
            aria-label="Cart"
            className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.8} />
            {mounted && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#dc2626] px-1 text-[11px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Account — gray filled circle, dark person icon */}
          <Link
            href={mounted && user ? accountPaths.dashboard : storefrontPaths.account}
            aria-label="Account"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <User className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
          <LiveSearch variant="mobile" autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
