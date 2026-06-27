import type { Metadata } from "next";
import Script from "next/script";
import { CustomerSupportChatWidget } from "@/components/storefront/chat/customer-support-chat-widget";
import { StorefrontLightTheme } from "@/components/storefront/storefront-light-theme";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav";
import { FloatingSidebar } from "@/components/storefront/floating-sidebar";
import { moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moharaznx.com";

export const metadata: Metadata = {
  title: {
    default: `${moharazStoreConfig.name} — Online Tech Shopping in Bangladesh`,
    template: `%s | ${moharazStoreConfig.name}`,
  },
  description: moharazStoreConfig.tagline,
  metadataBase: new URL(BASE_URL),
  keywords: ["laptop", "gaming PC", "smartphone", "PC builder", "Bangladesh tech store", "MoharazNX"],
  openGraph: {
    siteName: moharazStoreConfig.name,
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: moharazStoreConfig.name,
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: moharazStoreConfig.phone,
        contactType: "customer service",
        availableLanguage: ["English", "Bengali"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: moharazStoreConfig.address,
        addressCountry: "BD",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: moharazStoreConfig.name,
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront flex min-h-screen flex-col overflow-x-clip bg-white">
      <StorefrontLightTheme />
      <Script
        id="storefront-force-light"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var r=document.documentElement;r.classList.remove('dark','admin-site');r.classList.add('storefront-site');r.setAttribute('data-theme','light');r.style.colorScheme='light';if(document.body){document.body.classList.add('storefront-site');}})();`,
        }}
      />
      <Script
        id="jsonld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FloatingSidebar />
      <StorefrontHeader />
      <main className="sf-container flex-1 px-3 pb-20 pt-0 sm:px-5 sm:pb-6">
        {children}
      </main>
      <StorefrontFooter />
      <MobileBottomNav />
      <CustomerSupportChatWidget />
    </div>
  );
}
