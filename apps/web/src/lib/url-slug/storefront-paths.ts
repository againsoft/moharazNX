import {
  blogIndexPath,
  blogPostPath,
  brandPath,
  categoryPath,
  cmsPagePath,
  productPath,
} from "./paths";

/** Fixed storefront system routes — direct URLs at site root */
export const storefrontPaths = {
  home: "/",
  cart: "/cart",
  checkout: "/checkout",
  checkoutThankYou: "/checkout/thank-you",
  account: "/account",
  wishlist: "/wishlist",
  compare: "/compare",
  search: "/search",
  deals: "/deals",
  newArrivals: "/new",
  bestsellers: "/bestsellers",
  products: "/products",
  categories: "/categories",
  track: "/track",
  contact: "/contact",
  about: "/about",
  faq: "/faq",
  shipping: "/shipping",
  careers: "/careers",
  recommendations: "/recommendations",
  builder: "/builder",
  builderPc: "/builder/pc-builder",
  blog: blogIndexPath(),
  warranty: cmsPagePath("warranty-policy"),
  privacy: cmsPagePath("privacy-policy"),
  terms: cmsPagePath("terms-and-conditions"),
  returns: cmsPagePath("return-and-refund-policy"),
  dashboard: "/dashboard",
} as const;

/** Customer account portal — ECOMMERCE_STOREFRONT_ARCHITECTURE §9 */
export const accountPaths = {
  dashboard: "/account",
  orders: "/account/orders",
  returns: "/account/returns",
  wishlist: "/account/wishlist",
  rewards: "/account/rewards",
  wallet: "/account/wallet",
  addresses: "/account/addresses",
  reviews: "/account/reviews",
  notifications: "/account/notifications",
  support: "/account/support",
} as const;

export function builderPath() {
  return storefrontPaths.builder;
}

export function builderPcPath() {
  return storefrontPaths.builderPc;
}

export { blogPostPath, brandPath, categoryPath, cmsPagePath, productPath };
