"use client";

import Image from "next/image";
import Link from "next/link";
import { moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

const iconItems = [
  {
    src: "/sidebar-icons/phone-black-icon.svg",
    label: "Call us",
    href: `tel:${moharazStoreConfig.phone}`,
    badge: false,
  },
  {
    src: "/sidebar-icons/message-icon.svg",
    label: "Chat",
    href: storefrontPaths.contact,
    badge: false,
  },
  {
    src: "/sidebar-icons/compare-icon-svg.svg",
    label: "Compare",
    href: storefrontPaths.compare,
    badge: true,
  },
  {
    src: "/sidebar-icons/gift-black-icon.svg",
    label: "Offers",
    href: storefrontPaths.deals,
    badge: false,
  },
  {
    src: "/sidebar-icons/fire-black-icon.svg",
    label: "Hot deals",
    href: storefrontPaths.deals,
    badge: false,
  },
];

export function FloatingSidebar() {
  return (
    <div className="fixed left-3 top-0 z-[200] hidden xl:flex xl:flex-col">
      {/* White pill — flat top, heavily rounded bottom */}
      <div className="flex w-[68px] flex-col items-center overflow-hidden rounded-b-[48px] bg-white shadow-[2px_6px_24px_rgba(0,0,0,0.13)]">

        {/* Crown logo — exact Monarch IT icon */}
        <div className="flex h-[72px] w-full items-center justify-center">
          <Image
            src="/sidebar-icons/monarch-it-icon.png"
            alt="MoharazNX"
            width={44}
            height={36}
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="mx-auto h-px w-10 bg-gray-200" />

        {/* Icon buttons */}
        {iconItems.map(({ src, label, href, badge }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            title={label}
            className="group relative flex h-[64px] w-full items-center justify-center hover:bg-gray-50"
          >
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-red-100">
              <Image
                src={src}
                alt={label}
                width={22}
                height={22}
                className="object-contain opacity-70 transition-opacity group-hover:opacity-100"
                unoptimized
              />
            </div>
            {badge && (
              <span className="absolute right-2.5 top-2.5 h-[9px] w-[9px] rounded-full bg-[#dc2626]" />
            )}
          </Link>
        ))}

        <div className="mx-auto h-px w-10 bg-gray-200" />

        {/* PC Builder — red circle with pc-icon.svg */}
        <div className="flex h-[80px] w-full items-center justify-center">
          <Link
            href={storefrontPaths.builderPc}
            aria-label="PC Builder"
            title="PC Builder"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#dc2626] shadow-md transition-colors hover:bg-[#b91c1c]"
          >
            <Image
              src="/sidebar-icons/pc-icon.svg"
              alt="PC Builder"
              width={24}
              height={24}
              className="object-contain brightness-0 invert"
              unoptimized
            />
          </Link>
        </div>

      </div>
    </div>
  );
}
