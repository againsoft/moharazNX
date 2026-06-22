import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { BRAND_PAGE_TITLE } from "@/lib/brand";

export const metadata: Metadata = {
  title: BRAND_PAGE_TITLE,
  description: "MoharazNX ecommerce admin · UI prototype · mock data only",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
