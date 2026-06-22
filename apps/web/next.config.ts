import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  async redirects() {
    const systemRoutes = [
      "account",
      "cart",
      "checkout",
      "wishlist",
      "compare",
      "search",
      "deals",
      "new",
      "bestsellers",
      "products",
      "categories",
      "track",
      "contact",
      "about",
      "faq",
      "shipping",
      "careers",
      "recommendations",
    ];

    const systemRedirects = systemRoutes.map((route) => ({
      source: `/shop/${route}`,
      destination: `/${route}`,
      permanent: true,
    }));

    return [
      {
        source: "/shop",
        destination: "/",
        permanent: true,
      },
      ...systemRedirects,
      {
        source: "/shop/checkout/thank-you",
        destination: "/checkout/thank-you",
        permanent: true,
      },
      // Legacy product URLs → flat slug
      {
        source: "/shop/p/:slug",
        destination: "/:slug",
        permanent: true,
      },
      // Legacy nested category URLs → flat slug (last segment)
      {
        source: "/shop/c/:slug*",
        destination: "/:slug",
        permanent: true,
      },
      // Legacy brand URLs → flat slug
      {
        source: "/shop/brands/:slug",
        destination: "/:slug",
        permanent: true,
      },
      // Legacy blog → new /blog prefix
      {
        source: "/shop/blog/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      {
        source: "/shop/blog",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
