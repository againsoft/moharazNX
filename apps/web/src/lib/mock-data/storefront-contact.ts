import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

export const storeContact = {
  name: "MoharazNX Support",
  email: "hello@againshop.com",
  phone: "+880 1700-000000",
  whatsapp: "+880 1700-000000",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh",
  hours: [
    { days: "Sat – Thu", time: "10:00 AM – 8:00 PM" },
    { days: "Friday", time: "2:00 PM – 8:00 PM" },
  ],
  social: {
    website: "https://againshop.com",
  },
};

export const CONTACT_SUBJECTS = [
  "General inquiry",
  "Order status",
  "Returns & refunds",
  "Product question",
  "Wholesale / B2B",
  "Technical issue",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_FAQ_LINKS = [
  { label: "Shipping & returns", href: storefrontPaths.shipping },
  { label: "Track your order", href: storefrontPaths.track },
  { label: "FAQ", href: storefrontPaths.faq },
];
