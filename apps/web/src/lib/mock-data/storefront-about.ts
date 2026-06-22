import { storeConfig } from "./storefront-home";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

export const aboutContent = {
  ...storeConfig,
  founded: "2024",
  mission:
    "MoharazNX makes quality products accessible across Bangladesh — with honest pricing, fast delivery, and support you can actually reach.",
  story: [
    "MoharazNX started as the customer-facing storefront for MoharazNX — one platform connecting catalog, inventory, orders, and fulfillment for modern retailers.",
    "We believe shopping should feel simple: clear product information, transparent shipping, and returns without the runaround. Every page you see is powered by the same catalog and order engine our merchants use in the admin.",
    "From Dhaka to Sylhet, we're building a shopping experience that respects your time — mobile-first, locally relevant payments, and AI-assisted recommendations that help you discover what you need faster.",
  ],
  values: [
    { title: "Customer first", body: "Real humans answer support tickets. No chatbot loops." },
    { title: "Fair pricing", body: "No fake discounts. Compare-at prices reflect genuine offers." },
    { title: "Local roots", body: "COD, bKash, Nagad — payments that work in Bangladesh." },
    { title: "Quality assured", body: "Authorized brands, official warranty on electronics." },
  ],
  stats: [
    { label: "Products", value: "10,000+" },
    { label: "Happy customers", value: "50,000+" },
    { label: "Districts served", value: "64" },
    { label: "Avg. rating", value: "4.8★" },
  ],
  teamNote:
    "We're a small, focused team in Dhaka — engineers, merchandisers, and support specialists who use MoharazNX every day to run this store.",
};

export const ABOUT_LINKS = [
  { label: "Shop products", href: storefrontPaths.products },
  { label: "Contact us", href: storefrontPaths.contact },
  { label: "Careers", href: storefrontPaths.careers },
];
